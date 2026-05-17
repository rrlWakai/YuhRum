const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

const endpoint =
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

export async function sendChatMessage(message: string) {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [{ text: message }],
        },
      ],
    }),
  });

  const data = await response.json();

  return data?.candidates?.[0]?.content?.parts?.[0]?.text;
}