import { getMatches } from "../../lib/api";
import {
  calculateCompatibility,
  type CompatibilityResult,
} from "../ai/compatibility";
import { getConversationStarter } from "../ai/conversationStarter";
import { moderateMessage, type ModerationResult } from "../ai/moderation";
import { detectScam, type ScamDetectionResult } from "../ai/scamDetection";
import type { Match } from "../../lib/types";
import type { CompatibilityInput } from "../ai/compatibility";

export interface MatchWithCompatibility extends Match {
  compatibility: CompatibilityResult;
}

/**
 * Fetches the current user's matches and attaches a compatibility score to
 * each one, sorted highest-score first.
 */
export async function getMatchesWithCompatibility(
  currentProfile: CompatibilityInput,
  profileMap: Record<string, CompatibilityInput>
): Promise<MatchWithCompatibility[]> {
  const matches = (await getMatches()) ?? [];

  return matches
    .map((match) => {
      const otherId =
        match.user_one === currentProfile.city ? match.user_two : match.user_one;
      const otherProfile = profileMap[otherId] ?? {
        interests: [],
      };
      return {
        ...match,
        compatibility: calculateCompatibility(currentProfile, otherProfile),
      };
    })
    .sort((a, b) => b.compatibility.score - a.compatibility.score);
}

/**
 * Returns a conversation starter prompt for a given match.
 * In a future phase this can be personalised using the shared-interests
 * data from calculateCompatibility.
 */
export function getMatchConversationStarter(): string {
  return getConversationStarter();
}

/**
 * Validates an outgoing message against moderation and scam-detection rules
 * before it is sent. Call this in the UI layer before invoking sendMessage().
 */
export function validateOutgoingMessage(body: string): {
  moderation: ModerationResult;
  scam: ScamDetectionResult;
  allowed: boolean;
} {
  const moderation = moderateMessage(body);
  const scam = detectScam(body);
  return {
    moderation,
    scam,
    allowed: moderation.allowed && !scam.flagged,
  };
}
