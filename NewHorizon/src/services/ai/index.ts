/**
 * Unified AI assistant service.
 * All screens route through this single entry point so model, prompts,
 * and logging can be changed in one place.
 */
import { generateChatResponse } from "../../ai/openai";

export type AssistantTopic =
  | "jobs"
  | "housing"
  | "legal"
  | "community"
  | "connect"
  | "messages"
  | "general";

export interface AssistantMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

const SYSTEM_PROMPT = `You are a compassionate, knowledgeable AI assistant for New Horizon — a reentry support platform.
You help people who are transitioning out of incarceration find jobs, housing, legal aid, community connections, and emotional support.
Always be encouraging, non-judgmental, and practical. Keep answers concise and actionable.
When you don't know something specific to the user's location or situation, say so and suggest how they can find out.`;

const TOPIC_CONTEXT: Record<AssistantTopic, string> = {
  jobs: "The user is asking about employment, job search, fair-chance employers, or workforce development.",
  housing:
    "The user is asking about housing, transitional living, landlord discrimination, or housing assistance programs.",
  legal:
    "The user is asking about legal rights, expungement, record sealing, rights restoration, or finding legal aid.",
  community:
    "The user is asking about community support, peer connections, mentorship, or shared experiences.",
  connect:
    "The user is asking about meeting people, making connections, or the Connect matchmaking feature.",
  messages:
    "The user is asking about their conversations or messages on the platform.",
  general: "",
};

/**
 * Send a one-off question to the assistant.
 */
export async function askAssistant(
  question: string,
  topic: AssistantTopic = "general"
): Promise<string> {
  const topicContext = TOPIC_CONTEXT[topic];
  const systemPrompt = topicContext
    ? `${SYSTEM_PROMPT}\n\nContext: ${topicContext}`
    : SYSTEM_PROMPT;

  return generateChatResponse(question, systemPrompt);
}

/**
 * Continue a multi-turn conversation. Pass the full history so the model
 * has context. Appends the new assistant reply and returns the updated history.
 *
 * NOTE: This sends all messages to OpenAI on every call. Add server-side
 * truncation or a sliding window before shipping to production.
 */
export async function continueConversation(
  history: AssistantMessage[],
  userMessage: string,
  topic: AssistantTopic = "general"
): Promise<AssistantMessage[]> {
  const topicContext = TOPIC_CONTEXT[topic];
  const systemPrompt = topicContext
    ? `${SYSTEM_PROMPT}\n\nContext: ${topicContext}`
    : SYSTEM_PROMPT;

  // Build plain prompt from history + new message
  const historyText = history
    .map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`)
    .join("\n");
  const fullPrompt = historyText
    ? `${historyText}\nUser: ${userMessage}`
    : userMessage;

  const reply = await generateChatResponse(fullPrompt, systemPrompt);

  const now = new Date().toISOString();
  return [
    ...history,
    { role: "user", content: userMessage, timestamp: now },
    { role: "assistant", content: reply, timestamp: now },
  ];
}

/**
 * Quick topic detection — maps a free-text query to a topic so screens
 * don't have to hardcode topic selection.
 */
export function detectTopic(query: string): AssistantTopic {
  const q = query.toLowerCase();
  if (/job|work|employ|hire|career|resume/.test(q)) return "jobs";
  if (/hous|rent|landlord|shelter|apartment/.test(q)) return "housing";
  if (/legal|lawyer|expunge|record|rights|court/.test(q)) return "legal";
  if (/connect|match|meet|date/.test(q)) return "connect";
  if (/message|chat|conversation/.test(q)) return "messages";
  if (/communit|peer|support|friend/.test(q)) return "community";
  return "general";
}
