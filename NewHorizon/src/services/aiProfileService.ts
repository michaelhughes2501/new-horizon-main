import { getCurrentProfile, updateProfile } from "../../lib/api";
import {
  getProfileSuggestions,
  type ProfileSuggestion,
} from "../ai/profileSuggestions";
import { moderateMessage, type ModerationResult } from "../ai/moderation";
import { detectScam, type ScamDetectionResult } from "../ai/scamDetection";
import type { Profile } from "../../lib/types";

/**
 * Returns AI-ranked profile suggestions for the current user by loading
 * their own profile and scoring candidates against it.
 */
export async function getSuggestedProfiles(
  candidates: Profile[]
): Promise<ProfileSuggestion[]> {
  const current = await getCurrentProfile();
  return getProfileSuggestions(current.id, candidates);
}

/**
 * Validates a proposed bio update for policy violations before persisting it.
 * Returns the moderation + scam-detection results so the caller can decide
 * whether to surface a specific error message.
 */
export async function updateProfileWithModeration(
  updates: Partial<Profile>
): Promise<{
  moderation: ModerationResult;
  scam: ScamDetectionResult;
  saved: boolean;
}> {
  const bio = updates.bio ?? "";

  const moderation = moderateMessage(bio);
  const scam = detectScam(bio);

  if (!moderation.allowed || scam.flagged) {
    return { moderation, scam, saved: false };
  }

  await updateProfile(updates);
  return { moderation, scam, saved: true };
}
