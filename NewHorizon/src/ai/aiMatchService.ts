import { calculateCompatibility } from "./compatibility";
import type { CompatibilityInput, CompatibilityResult } from "./compatibility";

export interface CandidateProfile extends CompatibilityInput {
  id: string;
  username: string;
}

export interface RankedCandidate {
  profile: CandidateProfile;
  compatibility: CompatibilityResult;
}

/**
 * Ranks a list of candidate profiles against the current user by
 * compatibility score, highest first.
 *
 * This is a pure function — no network calls — so it can be used
 * synchronously in list renders or sort callbacks.
 */
export function rankCandidates(
  current: CandidateProfile,
  candidates: CandidateProfile[]
): RankedCandidate[] {
  return candidates
    .map((candidate) => ({
      profile: candidate,
      compatibility: calculateCompatibility(current, candidate),
    }))
    .sort((a, b) => b.compatibility.score - a.compatibility.score);
}
