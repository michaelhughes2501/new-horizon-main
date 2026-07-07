import { generateChatResponse } from "./openai";
import type { Profile } from "../../lib/types";

// ── Legacy type kept for backward-compat with aiProfileService ──────────────
export interface ProfileSuggestion {
  profileId: string;
  reason: string;
}

/**
 * Returns a ranked list of profile suggestions for the given user.
 * Stub — replace with pgvector / embedding-based ranking.
 */
export async function getProfileSuggestions(
  _currentUserId: string,
  _candidates: Profile[]
): Promise<ProfileSuggestion[]> {
  return [];
}

// ── AI-powered profile improvement suggestions ───────────────────────────────

export interface ProfileImprovementInput {
  bio?: string;
  interests?: string[];
  relationship_goal?: string;
}

/**
 * Sends the user's profile to the AI and returns plain-text coaching advice.
 * In production this should be proxied through a Supabase Edge Function so
 * the OpenAI key is never exposed in the mobile bundle.
 */
export async function suggestProfileImprovements(
  profile: ProfileImprovementInput
): Promise<string> {
  const prompt = `
Review this profile and provide concise suggestions to improve it.

Bio:
${profile.bio ?? "(none)"}

Interests:
${profile.interests?.join(", ") ?? "(none)"}

Relationship Goal:
${profile.relationship_goal ?? "(none)"}

Respond with:
- Strengths
- Missing Information
- Suggested Improvements
`.trim();

  return generateChatResponse(prompt);
}
