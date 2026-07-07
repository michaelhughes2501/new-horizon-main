import { supabase } from "../supabase";
import { throwIfError } from "../errors";
import { requireUser } from "../auth/requireUser";

export async function likeUser(receiver: string): Promise<void> {
  const user = await requireUser();

  const { error } = await supabase
    .from("likes")
    .insert({
      sender: user.id,
      receiver,
    });

  if (error) throwIfError(error);
}

export async function unlikeUser(receiver: string): Promise<void> {
  const user = await requireUser();

  const { error } = await supabase
    .from("likes")
    .delete()
    .eq("sender", user.id)
    .eq("receiver", receiver);

  if (error) throwIfError(error);
}
