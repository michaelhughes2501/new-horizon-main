import { supabase } from "../../../lib/supabase";

export interface AppNotification {
  id: string;
  profile_id: string;
  type: "like" | "match" | "message" | "system";
  title: string;
  body?: string;
  read: boolean;
  data?: Record<string, unknown>;
  created_at: string;
}

export async function getNotifications(
  userId: string
): Promise<AppNotification[]> {
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("profile_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as AppNotification[];
}

export async function markRead(notificationId: string): Promise<void> {
  const { error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("id", notificationId);
  if (error) throw new Error(error.message);
}

export async function markAllRead(userId: string): Promise<void> {
  const { error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("profile_id", userId)
    .eq("read", false);
  if (error) throw new Error(error.message);
}

export function unreadCount(notifications: AppNotification[]): number {
  return notifications.filter((n) => !n.read).length;
}

/** Real-time subscription for new notifications. Returns unsubscribe fn. */
export function subscribeToNotifications(
  userId: string,
  onNotification: (n: AppNotification) => void
): () => void {
  const channel = supabase
    .channel(`notifications:${userId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "notifications",
        filter: `profile_id=eq.${userId}`,
      },
      (payload) => onNotification(payload.new as AppNotification)
    )
    .subscribe();

  return () => { supabase.removeChannel(channel); };
}
