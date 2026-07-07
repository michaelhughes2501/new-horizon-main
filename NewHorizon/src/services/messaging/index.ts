import { supabase } from "../../../lib/supabase";
import { validateOutgoingMessage } from "../../ai/messageModeration";
import type { Message } from "../../../lib/types";

export type { Message };

export interface Conversation {
  id: string;
  match_id: string;
  created_at: string;
  /** Other participant's profile, resolved client-side from the match */
  otherUserId?: string;
}

export async function getConversations(
  userId: string
): Promise<Conversation[]> {
  const { data, error } = await supabase
    .from("conversations")
    .select(
      "id, match_id, created_at, matches!inner(user_one, user_two)"
    )
    .or(
      `matches.user_one.eq.${userId},matches.user_two.eq.${userId}`,
      { referencedTable: "matches" }
    )
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  return (data ?? []).map((row: any) => ({
    id: row.id,
    match_id: row.match_id,
    created_at: row.created_at,
    otherUserId:
      row.matches?.user_one === userId
        ? row.matches?.user_two
        : row.matches?.user_one,
  }));
}

export async function getMessages(conversationId: string): Promise<Message[]> {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at");
  if (error) throw new Error(error.message);
  return (data ?? []) as Message[];
}

export async function sendMessage(
  conversationId: string,
  senderId: string,
  body: string
): Promise<void> {
  validateOutgoingMessage(body); // throws on policy violation
  const { error } = await supabase
    .from("messages")
    .insert({ conversation_id: conversationId, sender: senderId, body });
  if (error) throw new Error(error.message);
}

/** Subscribe to new messages in a conversation. Returns unsubscribe fn. */
export function subscribeToMessages(
  conversationId: string,
  onMessage: (msg: Message) => void
): () => void {
  const channel = supabase
    .channel(`messages:${conversationId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `conversation_id=eq.${conversationId}`,
      },
      (payload) => onMessage(payload.new as Message)
    )
    .subscribe();

  return () => { supabase.removeChannel(channel); };
}
