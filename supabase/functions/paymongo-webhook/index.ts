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

serve(async (req: { method: string; text: () => any; }) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // PayMongo webhook signature validation should be implemented here in production
    // using Deno.env.get('PAYMONGO_WEBHOOK_SECRET')
    
    const rawBody = await req.text();
    const event = JSON.parse(rawBody);

    // Listen for successful payment on a checkout session
    if (event.data.attributes.type === 'checkout_session.payment.paid') {
      const checkoutSession = event.data.attributes.data.attributes;
      const bookingId = checkoutSession.reference_number;

      if (!bookingId) {
        throw new Error('No reference number found in webhook payload');
      }

      // Initialize Supabase admin client to bypass RLS
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      // Update the booking status to 'confirmed'
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'confirmed' })
        .eq('id', bookingId);

      if (error) throw error;

      console.log(`Successfully confirmed booking: ${bookingId}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error: any) {
    console.error('Webhook Error:', error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
