// deno-lint-ignore-file no-explicit-any
// @ts-ignore - Deno URL imports are resolved by the Supabase Edge runtime
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
// @ts-ignore - Deno global exists in Supabase Edge runtime
declare const Deno: { env: { get: (key: string) => string | undefined } };

type CheckoutRequest = {
  amount: number;
  description: string;
  name: string;
  email: string;
  phone?: string;
  referenceNumber: string;
};

type ErrorBody = {
  error: {
    code: string;
    message: string;
  };
};

const DEFAULT_ALLOWED_ORIGINS = [
  "http://localhost:5173",
  "http://localhost:4173",
];

function jsonResponse(body: unknown, status = 200, extraHeaders: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...extraHeaders,
    },
  });
}

function errorResponse(code: string, message: string, status = 400, extraHeaders: Record<string, string> = {}) {
  const body: ErrorBody = {
    error: { code, message },
  };
  return jsonResponse(body, status, extraHeaders);
}

function getAllowedOrigins(): string[] {
  const configured = Deno.env.get("ALLOWED_ORIGINS");
  if (!configured) return DEFAULT_ALLOWED_ORIGINS;
  return configured
    .split(",")
    .map((v: string) => v.trim())
    .filter(Boolean);
}

function getCorsHeaders(origin: string | null): Record<string, string> {
  const allowedOrigins = getAllowedOrigins();
  const allowOrigin = origin && allowedOrigins.includes(origin) ? origin : allowedOrigins[0];

  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
  };
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isCheckoutRequest(input: unknown): input is CheckoutRequest {
  if (!input || typeof input !== "object") return false;
  const v = input as Record<string, unknown>;
  return (
    typeof v.amount === "number" &&
    typeof v.description === "string" &&
    typeof v.name === "string" &&
    typeof v.email === "string" &&
    typeof v.referenceNumber === "string" &&
    (typeof v.phone === "string" || typeof v.phone === "undefined")
  );
}

function validatePayload(payload: CheckoutRequest): string | null {
  if (!Number.isFinite(payload.amount) || payload.amount <= 0) return "Invalid amount.";
  if (payload.amount > 500000) return "Amount exceeds maximum allowed limit.";
  if (!payload.name.trim()) return "Customer name is required.";
  if (!isValidEmail(payload.email)) return "Valid email is required.";
  if (!payload.referenceNumber.trim()) return "Reference number is required.";
  if (!payload.description.trim()) return "Description is required.";
  return null;
}

serve(async (req: Request) => {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return errorResponse("METHOD_NOT_ALLOWED", "Only POST is allowed.", 405, corsHeaders);
  }

  const paymongoSecret = Deno.env.get("PAYMONGO_SECRET_KEY");
  const siteUrl = Deno.env.get("SITE_URL");
  if (!paymongoSecret) {
    return errorResponse("SERVER_CONFIG_ERROR", "Payment service is unavailable.", 500, corsHeaders);
  }
  if (!siteUrl) {
    return errorResponse("SERVER_CONFIG_ERROR", "Missing SITE_URL configuration.", 500, corsHeaders);
  }

  let parsed: unknown;
  try {
    parsed = await req.json();
  } catch {
    return errorResponse("INVALID_JSON", "Malformed JSON payload.", 400, corsHeaders);
  }

  if (!isCheckoutRequest(parsed)) {
    return errorResponse("INVALID_PAYLOAD", "Request payload is invalid.", 400, corsHeaders);
  }

  const validationError = validatePayload(parsed);
  if (validationError) {
    return errorResponse("VALIDATION_ERROR", validationError, 400, corsHeaders);
  }

  const amountInCentavos = Math.round(parsed.amount * 100);
  const encodedKey = btoa(`${paymongoSecret}:`);
  const requestPayload = {
    data: {
      attributes: {
        line_items: [
          {
            amount: amountInCentavos,
            currency: "PHP",
            name: parsed.description,
            quantity: 1,
          },
        ],
        payment_method_types: ["gcash", "paymaya", "card"],
        reference_number: parsed.referenceNumber,
        success_url: `${siteUrl}/?payment=success&ref=${encodeURIComponent(parsed.referenceNumber)}`,
        cancel_url: `${siteUrl}/?payment=cancelled`,
        billing: {
          name: parsed.name,
          email: parsed.email,
          phone: parsed.phone ?? "",
        },
      },
    },
  };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);

  try {
    const paymongoResponse = await fetch("https://api.paymongo.com/v1/checkout_sessions", {
      method: "POST",
      signal: controller.signal,
      headers: {
        "accept": "application/json",
        "content-type": "application/json",
        "authorization": `Basic ${encodedKey}`,
      },
      body: JSON.stringify(requestPayload),
    });

    const responseText = await paymongoResponse.text();
    let responseData: any = null;
    try {
      responseData = responseText ? JSON.parse(responseText) : null;
    } catch {
      responseData = null;
    }

    if (!paymongoResponse.ok) {
      console.error("PayMongo checkout session error", {
        status: paymongoResponse.status,
        details: responseData?.errors?.[0]?.detail ?? "No detail returned",
        code: responseData?.errors?.[0]?.code ?? "UNKNOWN",
      });
      return errorResponse(
        "PAYMENT_PROVIDER_ERROR",
        "Unable to create payment session. Please verify payment details and try again.",
        502,
        corsHeaders,
      );
    }

    const checkoutUrl = responseData?.data?.attributes?.checkout_url;
    if (!checkoutUrl || typeof checkoutUrl !== "string") {
      console.error("PayMongo returned success without checkout URL");
      return errorResponse("INVALID_PROVIDER_RESPONSE", "Payment session was incomplete.", 502, corsHeaders);
    }

    return jsonResponse({ checkoutUrl }, 200, corsHeaders);
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      return errorResponse("PAYMENT_TIMEOUT", "Payment service timed out. Please try again.", 504, corsHeaders);
    }
    console.error("Unexpected checkout error", { message: error instanceof Error ? error.message : String(error) });
    return errorResponse("PAYMENT_REQUEST_FAILED", "Unable to process payment request.", 500, corsHeaders);
  } finally {
    clearTimeout(timeout);
  }
});
