import { supabase } from "../supabase";
import { throwIfError } from "../errors";
import { requireUser } from "../auth/requireUser";
import type { Match } from "../types";

export async function getMatches(): Promise<Match[]> {
  const user = await requireUser();

  const { data, error } = await supabase
    .from("matches")
    .select("*")
    .or(`user_one.eq.${user.id},user_two.eq.${user.id}`);

  if (error) throwIfError(error);

  return (data ?? []) as Match[];
}
