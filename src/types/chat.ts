export type ChatRole = 'user' | 'model' | 'system';

export type ChatMessage = {
  role: ChatRole;
  text: string;
};

export type ChatRequestPayload = {
  messages: ChatMessage[];
  userMessage: string;
  blockedDates: string[];
};

export type ChatResponsePayload = {
  reply: string;
};
