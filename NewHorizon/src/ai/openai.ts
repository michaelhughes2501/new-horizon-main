/**
 * Centralised OpenAI client.
 *
 * SECURITY NOTE — do NOT call this module from the mobile bundle in
 * production. The EXPO_PUBLIC_ prefix makes the value visible to anyone
 * who inspects the JS bundle.  Move `generateChatResponse` (and any
 * future model calls) into a Supabase Edge Function or a Next.js API
 * route so the key stays on the server.  The mobile app should call that
 * endpoint, not OpenAI directly.
 */
import OpenAI from "openai";

let client: OpenAI | null = null;

function getClient(): OpenAI {
  if (client) return client;

  const apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error(
      "Missing EXPO_PUBLIC_OPENAI_API_KEY environment variable."
    );
  }

  client = new OpenAI({
    apiKey,
    // Required when the SDK is imported in a browser / React-Native JS
    // environment.  Remove this flag once calls are proxied through a
    // server-side Edge Function.
    dangerouslyAllowBrowser: true,
  });

  return client;
}

export async function generateChatResponse(
  prompt: string,
  systemPrompt = "You are a supportive AI assistant for a reentry and community platform."
): Promise<string> {
  const openai = getClient();

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: prompt },
    ],
  });

  return response.choices[0]?.message?.content ?? "";
}
