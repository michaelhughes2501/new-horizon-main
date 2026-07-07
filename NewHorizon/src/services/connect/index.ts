import { supabase } from "../../../lib/supabase";
import { calculateCompatibility } from "../../ai/compatibility";
import { getConversationStarter } from "../../ai/conversationStarter";
import type { CompatibilityInput, CompatibilityResult } from "../../ai/compatibility";
import type { Match } from "../../../lib/types";
import type { Profile } from "../../../lib/types";

export type { Match };

export interface ProfileWithCompatibility extends Profile {
  compatibility?: CompatibilityResult;
}

export async function getMatches(userId: string): Promise<Match[]> {
  const { data, error } = await supabase
    .from("matches")
    .select("*")
    .or(`user_one.eq.${userId},user_two.eq.${userId}`)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as Match[];
}

export async function likeUser(
  senderId: string,
  receiverId: string
): Promise<void> {
  const { error } = await supabase
    .from("likes")
    .insert({ sender: senderId, receiver: receiverId });
  if (error) throw new Error(error.message);
}

export async function unlikeUser(
  senderId: string,
  receiverId: string
): Promise<void> {
  const { error } = await supabase
    .from("likes")
    .delete()
    .eq("sender", senderId)
    .eq("receiver", receiverId);
  if (error) throw new Error(error.message);
}

export async function getDiscoverProfiles(
  userId: string
): Promise<Profile[]> {
  // Exclude already-liked or already-matched users
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .neq("id", userId)
    .limit(20);
  if (error) throw new Error(error.message);
  return (data ?? []) as Profile[];
}

export function rankByCompatibility(
  currentInput: CompatibilityInput,
  candidates: Profile[]
): ProfileWithCompatibility[] {
  return candidates
    .map((p) => ({
      ...p,
      compatibility: calculateCompatibility(currentInput, {
        interests: p.interests,
        relationshipGoal: p.relationship_goal,
        city: p.city,
      }),
    }))
    .sort((a, b) => (b.compatibility?.score ?? 0) - (a.compatibility?.score ?? 0));
}

export { getConversationStarter };
