import { supabase } from "../supabase";
import { throwIfError } from "../errors";
import { requireUser } from "../auth/requireUser";
import type { Profile } from "../types";

export async function getCurrentProfile(): Promise<Profile> {
  const user = await requireUser();

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error) throwIfError(error);

  return data as Profile;
}

export async function updateProfile(profile: Partial<Profile>): Promise<void> {
  const user = await requireUser();

  const { error } = await supabase
    .from("profiles")
    .update(profile)
    .eq("id", user.id);

  if (error) throwIfError(error);
}
