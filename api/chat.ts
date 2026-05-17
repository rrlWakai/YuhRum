import { villas } from '../src/data/villas';
import type { ChatRequestPayload } from '../src/types/chat';

declare const process: {
  env: {
    GEMINI_API_KEY?: string;
    [key: string]: string | undefined;
  };
};

type LimiterEntry = {
  count: number;
  resetAt: number;
};

const limiter = new Map<string, LimiterEntry>();
const WINDOW_MS = 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 20;
const REQUEST_TIMEOUT_MS = 15000;

type ApiRequest = {
  method?: string;
  headers: Record<string, string | string[] | undefined>;
  socket: { remoteAddress?: string };
  body: unknown;
};

type ApiResponse = {
  status: (code: number) => ApiResponse;
  json: (body: unknown) => void;
};

function getClientIp(req: ApiRequest): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.length > 0) {
    return forwarded.split(',')[0].trim();
  }
  return req.socket.remoteAddress ?? 'unknown';
}

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const existing = limiter.get(ip);
  if (!existing || now > existing.resetAt) {
    limiter.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }
  existing.count += 1;
  limiter.set(ip, existing);
  return existing.count <= MAX_REQUESTS_PER_WINDOW;
}

function validatePayload(payload: unknown): payload is ChatRequestPayload {
  if (!payload || typeof payload !== 'object') return false;
  const val = payload as ChatRequestPayload;
  if (!Array.isArray(val.messages) || typeof val.userMessage !== 'string' || !Array.isArray(val.blockedDates)) {
    return false;
  }
  if (val.userMessage.trim().length === 0 || val.userMessage.length > 1000) return false;
  if (val.messages.length > 20) return false;
  return true;
}

function sanitizeError(status = 500, message = 'Unable to process request') {
  return { status, body: { error: message } };
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const ip = getClientIp(req);
  if (!checkRateLimit(ip)) {
    res.status(429).json({ error: 'Too many requests' });
    return;
  }

  if (!validatePayload(req.body)) {
    const failure = sanitizeError(400, 'Invalid request payload');
    res.status(failure.status).json(failure.body);
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    const failure = sanitizeError(500, 'Service misconfigured');
    res.status(failure.status).json(failure.body);
    return;
  }

  const villaContext = villas.map(v => `
Name: ${v.name}
Location: ${v.location}
Capacity: ${v.capacity.min}-${v.capacity.max} pax
Day Stay (Weekday: ${v.rates.dayStay.weekday}, Weekend: ${v.rates.dayStay.weekend})
Night Stay (Weekday: ${v.rates.nightStay.weekday}, Weekend: ${v.rates.nightStay.weekend})
Overnight (Weekday: ${v.rates.overnight.weekday}, Weekend: ${v.rates.overnight.weekend})
Amenities: ${v.amenities.outdoor.join(', ')}
`).join('\n\n');

  const booked = req.body.blockedDates.join(', ');
  const systemInstruction = `You are the exclusive concierge and virtual assistant for Yuhrum Villas.
Adopt a sophisticated, polite, and premium tone. Use clean text formatting only.
Here is the villa information:\n${villaContext}

CRITICAL AVAILABILITY INFO:
Today's date is ${new Date().toISOString().split('T')[0]}.
Booked/unavailable dates (YYYY-MM-DD): ${booked || 'None'}.
Any date not listed is available.`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const contents = [
      ...req.body.messages.filter((m) => m.role !== 'system').map((m) => ({
        role: m.role === 'model' ? 'model' : 'user',
        parts: [{ text: m.text }],
      })),
      { role: 'user', parts: [{ text: req.body.userMessage }] },
    ];

    const geminiRes = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',
      {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify({
          contents,
          systemInstruction: {
            parts: [{ text: systemInstruction }],
          },
          generationConfig: { temperature: 0.7, maxOutputTokens: 512 },
        }),
      },
    );

    if (!geminiRes.ok) {
      const failure = sanitizeError(502, 'Upstream chat provider error');
      res.status(failure.status).json(failure.body);
      return;
    }

    const data = await geminiRes.json() as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };
    const reply = data.candidates?.[0]?.content?.parts?.map((p) => p.text).join('').trim();

    if (!reply) {
      const failure = sanitizeError(502, 'Empty chat response');
      res.status(failure.status).json(failure.body);
      return;
    }

    res.status(200).json({ reply });
  } catch {
    const failure = sanitizeError(500, 'Chat request failed');
    res.status(failure.status).json(failure.body);
  } finally {
    clearTimeout(timeout);
  }
}
