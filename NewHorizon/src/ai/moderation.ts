export interface ModerationResult {
  allowed: boolean;
  reason?: string;
}

/**
 * Blocked-word list. This is intentionally minimal — the interface is
 * designed so the implementation can be swapped out for an API-backed
 * moderation call (e.g. OpenAI Moderation) without touching call sites.
 */
const blockedWords = ["spam"];

export function moderateMessage(text: string): ModerationResult {
  const normalized = text.toLowerCase();

  for (const word of blockedWords) {
    if (normalized.includes(word)) {
      return {
        allowed: false,
        reason: "Message violates community guidelines.",
      };
    }
  }

  return { allowed: true };
}
