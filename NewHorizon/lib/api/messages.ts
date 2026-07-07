import { supabase } from "../supabase";
import { throwIfError } from "../errors";
import { requireUser } from "../auth/requireUser";
import type { Message } from "../types";

export async function getMessages(conversationId: string): Promise<Message[]> {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at");

  if (error) throwIfError(error);

  return (data ?? []) as Message[];
}

export async function sendMessage(
  conversationId: string,
  body: string
): Promise<void> {
  const user = await requireUser();

  const { error } = await supabase
    .from("messages")
    .insert({
      conversation_id: conversationId,
      sender: user.id,
      body,
    });

  if (error) throwIfError(error);
}
