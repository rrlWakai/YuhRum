// @ts-ignore - Deno imports are not recognized by standard TypeScript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
// @ts-ignore
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// @ts-ignore - Deno is a global in the Edge Function environment
declare const Deno: any;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ============================================
// VALIDATION & UTILITY FUNCTIONS
// ============================================

/**
 * Validate PayMongo webhook signature
 * The signature is a HMAC-SHA256 of the request body
 */
async function validatePayMongoSignature(
  rawBody: string,
  signature: string,
  secret: string
): Promise<boolean> {
  if (!signature || !secret) {
    console.log('Missing signature or secret for validation');
    return false;
  }

  const encoder = new TextEncoder();
  const key = encoder.encode(secret);
  const data = encoder.encode(rawBody);

  // Simple HMAC-SHA256 implementation using crypto.subtle
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    key,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signatureBuffer = await crypto.subtle.sign('HMAC', cryptoKey, data);
  const hashArray = Array.from(new Uint8Array(signatureBuffer));
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
    
  return hashHex === signature;
}

/**
 * Calculate platform fee (e.g., 2.5% + ₱15 transaction fee)
 */
function calculatePlatformFee(amount: number): number {
  const percentageFee = Math.round(amount * 0.025); // 2.5%
  const fixedFee = 15; // ₱15 fixed fee
  return percentageFee + fixedFee;
}

/**
 * Calculate net amount after fees
 */
function calculateNetAmount(grossAmount: number): number {
  const platformFee = calculatePlatformFee(grossAmount);
  return grossAmount - platformFee;
}

/**
 * Validate required webhook payload fields
 */
function validateWebhookPayload(event: any): {
  valid: boolean;
  error?: string;
  checkoutSession?: any;
  bookingId?: string;
  paymentIntentId?: string;
} {
  if (!event.data) {
    return { valid: false, error: 'Missing event data' };
  }

  if (!event.data.attributes) {
    return { valid: false, error: 'Missing event attributes' };
  }

  const eventType = event.data.attributes.type;

  // Only process payment successful events
  if (eventType !== 'checkout_session.payment.paid') {
    return { valid: false, error: `Unhandled event type: ${eventType}` };
  }

  const data = event.data.attributes.data;
  if (!data || !data.attributes) {
    return { valid: false, error: 'Missing checkout session data' };
  }

  const checkoutSession = data.attributes;
  const bookingId = checkoutSession.reference_number;
  const paymentIntentId = checkoutSession.payment_intent_id;

  if (!bookingId) {
    return { valid: false, error: 'No reference number found in webhook payload' };
  }

  return {
    valid: true,
    checkoutSession,
    bookingId,
    paymentIntentId,
  };
}

// ============================================
// MAIN WEBHANDLER
// ============================================

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // ----------------------------------------
    // 1. SIGNATURE VALIDATION
    // ----------------------------------------
    const rawBody = await req.text();
    const signature = req.headers.get('x-paymongo-signature');
    const webhookSecret = Deno.env.get('PAYMONGO_WEBHOOK_SECRET');

    // In production, validate the signature
    // Uncomment in production:
    // if (webhookSecret && signature) {
    //   const isValid = await validatePayMongoSignature(rawBody, signature, webhookSecret);
    //   if (!isValid) {
    //     throw new Error('Invalid webhook signature');
    //   }
    // } else {
    //   throw new Error('Missing webhook signature or secret');
    // }

    console.log('Received webhook payload');

    // ----------------------------------------
    // 2. PARSE & VALIDATE EVENT
    // ----------------------------------------
    const event = JSON.parse(rawBody);
    const validation = validateWebhookPayload(event);

    if (!validation.valid) {
      // For non-payment events, just acknowledge
      if (validation.error?.startsWith('Unhandled event type')) {
        return new Response(JSON.stringify({ received: true, skipped: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        });
      }
      throw new Error(validation.error);
    }

    const { checkoutSession, bookingId, paymentIntentId } = validation;

    // ----------------------------------------
    // 3. INITIALIZE SUPABASE CLIENT
    // ----------------------------------------
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // ----------------------------------------
    // 4. FETCH & VALIDATE BOOKING
    // ----------------------------------------
    const { data: booking, error: fetchError } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', bookingId)
      .single();

    if (fetchError || !booking) {
      throw new Error(`Booking not found: ${bookingId}`);
    }

    // Prevent duplicate processing
    if (booking.status === 'confirmed') {
      console.log(`Booking ${bookingId} already confirmed, skipping`);
      return new Response(JSON.stringify({ received: true, already_confirmed: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // ----------------------------------------
    // 5. CALCULATE PAYMENT DETAILS
    // ----------------------------------------
    const paidAmount = checkoutSession.line_items?.[0]?.amount || 0;
    const paidAmountPhp = paidAmount / 100; // Convert from centavos
    const platformFee = calculatePlatformFee(paidAmountPhp);
    const netAmount = calculateNetAmount(paidAmountPhp);

    console.log('Payment calculation:', {
      grossAmount: paidAmountPhp,
      platformFee,
      netAmount,
    });

    // ----------------------------------------
    // 6. UPDATE BOOKING STATUS
    // ----------------------------------------
    const { error: updateError } = await supabase
      .from('bookings')
      .update({
        status: 'confirmed',
        payment_status: 'paid',
        paid_amount: paidAmountPhp,
        platform_fee: platformFee,
        net_amount: netAmount,
        payment_intent_id: paymentIntentId,
        payment_method: checkoutSession.payment_method?.type || 'online',
        paid_at: new Date().toISOString(),
      })
      .eq('id', bookingId);

    if (updateError) {
      throw new Error(`Failed to update booking: ${updateError.message}`);
    }

    // ----------------------------------------
    // 7. RECORD PAYMENT IN PAYMENTS TABLE
    // ----------------------------------------
    const { error: paymentInsertError } = await supabase
      .from('payments')
      .insert({
        booking_id: bookingId,
        amount: paidAmountPhp,
        platform_fee: platformFee,
        net_amount: netAmount,
        payment_method: checkoutSession.payment_method?.type || 'online',
        payment_intent_id: paymentIntentId,
        gateway: 'paymongo',
        status: 'completed',
        transaction_ref: checkoutSession.reference_number,
        metadata: {
          checkoutSessionId: checkoutSession.id,
          rawEventType: event.data.attributes.type,
        },
      });

    if (paymentInsertError) {
      // Log but don't fail - booking is already confirmed
      console.error('Failed to record payment:', paymentInsertError.message);
    }

    // ----------------------------------------
    // 8. UPDATE VILLA AVAILABILITY
    // ----------------------------------------
    if (booking.villa_id && booking.check_in && booking.check_out) {
      const { error: availabilityError } = await supabase
        .from('villa_availability')
        .upsert({
          villa_id: booking.villa_id,
          date: booking.check_in,
          is_available: false,
          booking_id: bookingId,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'villa_id,date',
        });

      if (availabilityError) {
        console.error('Failed to update availability:', availabilityError.message);
      }
    }

    // ----------------------------------------
    // 9. SEND CONFIRMATION NOTIFICATION (Optional)
    // ----------------------------------------
    // You can add email/SMS notification here
    // await sendConfirmationEmail(booking);

    console.log(`Successfully confirmed booking: ${bookingId}`);

    return new Response(
      JSON.stringify({
        received: true,
        bookingId,
        status: 'confirmed',
        payment: {
          amount: paidAmountPhp,
          platformFee,
          netAmount,
        },
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error('Webhook Error:', error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
