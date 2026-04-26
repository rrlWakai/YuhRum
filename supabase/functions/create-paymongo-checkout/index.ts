// @ts-ignore - Deno imports are not recognized by standard TypeScript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

// @ts-ignore - Deno is a global in the Edge Function environment
declare const Deno: any;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req: Request) => {
  // Handle preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = await req.json();

    const {
      amount,
      description,
      name,
      email,
      phone,
      referenceNumber,
    } = body;

    // ✅ Input validation
    if (!amount || amount <= 0) {
      throw new Error('Invalid amount');
    }

    if (!name || !email) {
      throw new Error('Missing customer information');
    }

    if (!referenceNumber) {
      throw new Error('Missing reference number');
    }

    const PAYMONGO_SECRET_KEY = Deno.env.get('PAYMONGO_SECRET_KEY');

    if (!PAYMONGO_SECRET_KEY) {
      throw new Error('PAYMONGO_SECRET_KEY is not set');
    }

    // ✅ Safe origin fallback
    const origin =
      req.headers.get('origin') ||
      'https://yuh-rum.vercel.app/'; // replace with your actual domain

    console.log('Creating checkout session:', {
      amount,
      email,
      referenceNumber,
    });

    const payload = {
      data: {
        attributes: {
          line_items: [
            {
              amount: Math.round(amount * 100), // centavos
              currency: 'PHP',
              name: description || 'Booking Payment',
              quantity: 1,
            },
          ],
          payment_method_types: ['gcash', 'paymaya', 'card'],
          reference_number: referenceNumber,
          success_url: `${origin}/?payment=success&ref=${referenceNumber}`,
          cancel_url: `${origin}/?payment=cancelled`,
          billing: {
            name,
            email,
            phone,
          },
        },
      },
    };

    // ✅ Encode secret key
    const encodedKey = btoa(`${PAYMONGO_SECRET_KEY}:`);

    const response = await fetch(
      'https://api.paymongo.com/v1/checkout_sessions',
      {
        method: 'POST',
        headers: {
          accept: 'application/json',
          'content-type': 'application/json',
          authorization: `Basic ${encodedKey}`,
        },
        body: JSON.stringify(payload),
      }
    );

    const data = await response.json();

    // ✅ Better error handling
    if (!response.ok) {
      console.error('PayMongo error:', data);
      throw new Error(
        data?.errors?.[0]?.detail || 'Failed to create checkout session'
      );
    }

    return new Response(
      JSON.stringify({
        checkoutUrl: data.data.attributes.checkout_url,
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error('Function error:', error);

    return new Response(
      JSON.stringify({
        error: error.message || 'Something went wrong',
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 400,
      }
    );
  }
});