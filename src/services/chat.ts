import type { ChatRequestPayload, ChatResponsePayload } from '@/types/chat';

export async function sendChatMessage(payload: ChatRequestPayload): Promise<ChatResponsePayload> {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error('Chat service unavailable');
  }

  return response.json() as Promise<ChatResponsePayload>;
}
