import { supabase } from "../supabase";
import { throwIfError } from "../errors";
import { requireUser } from "../auth/requireUser";

export async function getNotifications() {
  const user = await requireUser();

  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("profile_id", user.id)
    .order("created_at", { ascending: false });

  if (error) throwIfError(error);

  return data ?? [];
}
