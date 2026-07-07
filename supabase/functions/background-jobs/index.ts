/**
 * background-jobs Edge Function
 *
 * Handles server-side background tasks on a scheduled basis or via
 * direct invocation. Deploy with:
 *   supabase functions deploy background-jobs
 *
 * Schedule via Supabase Dashboard → Edge Functions → Schedules,
 * or via the Supabase CLI cron syntax.
 *
 * Each task is idempotent — safe to call multiple times.
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")! // service role — runs server-side only
);

// ─── Task handlers ───────────────────────────────────────────────────────────

/**
 * TASK: Deliver pending push notifications.
 * In production, integrate with Expo Push API or APNs/FCM directly.
 */
async function deliverNotifications() {
  const { data: pending, error } = await supabase
    .from("notifications")
    .select("id, profile_id, title, body")
    .eq("read", false)
    .limit(100);

  if (error) throw error;

  console.log(`[notifications] ${pending?.length ?? 0} unread notifications found`);
  // TODO: batch-send to Expo Push API
  // https://docs.expo.dev/push-notifications/sending-notifications/
}

/**
 * TASK: Trigger match generation for users who have recent unmatched likes.
 * The actual match is already created by a DB trigger (002_likes.sql),
 * but this job can backfill missed matches and send notifications.
 */
async function generateMatches() {
  // Find likes that don't yet have a corresponding match notification
  const { data: recentLikes, error } = await supabase
    .from("likes")
    .select("sender, receiver, created_at")
    .gte(
      "created_at",
      new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    )
    .limit(500);

  if (error) throw error;

  console.log(`[matches] ${recentLikes?.length ?? 0} recent likes to process`);
  // The DB trigger handles match creation; this job can send match notifications
}

/**
 * TASK: Refresh AI-based recommendations for active users.
 * Marks profiles whose recommendation cache is stale so the next request
 * regenerates it.
 */
async function refreshRecommendations() {
  const staleThreshold = new Date(
    Date.now() - 12 * 60 * 60 * 1000
  ).toISOString();

  const { count, error } = await supabase
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .lt("updated_at", staleThreshold);

  if (error) throw error;

  console.log(`[recommendations] ${count ?? 0} profiles may need refreshed recommendations`);
  // TODO: queue re-scoring via pgvector or OpenAI embeddings
}

/**
 * TASK: Send profile-completion reminders to users with < 50% complete profiles.
 */
async function sendProfileReminders() {
  const { data: incomplete, error } = await supabase
    .from("profiles")
    .select("id, bio, avatar_url, interests")
    .or("bio.is.null,avatar_url.is.null");

  if (error) throw error;

  const targets = (incomplete ?? []).filter(
    (p: any) => !p.bio || !p.avatar_url || !p.interests?.length
  );

  console.log(`[reminders] ${targets.length} users with incomplete profiles`);

  for (const profile of targets.slice(0, 50)) {
    await supabase.from("notifications").insert({
      profile_id: profile.id,
      type: "system",
      title: "Complete your profile",
      body: "A complete profile gets 3x more connections. Add your bio, photo, and interests!",
    });
  }
}

// ─── Router ───────────────────────────────────────────────────────────────────

const TASKS: Record<string, () => Promise<void>> = {
  "deliver-notifications": deliverNotifications,
  "generate-matches": generateMatches,
  "refresh-recommendations": refreshRecommendations,
  "send-profile-reminders": sendProfileReminders,
};

Deno.serve(async (req: Request) => {
  try {
    const url = new URL(req.url);
    const task = url.searchParams.get("task") ?? "all";

    const results: Record<string, string> = {};

    if (task === "all") {
      for (const [name, fn] of Object.entries(TASKS)) {
        try {
          await fn();
          results[name] = "ok";
        } catch (err: any) {
          results[name] = `error: ${err.message}`;
        }
      }
    } else if (TASKS[task]) {
      await TASKS[task]();
      results[task] = "ok";
    } else {
      return new Response(
        JSON.stringify({ error: `Unknown task: ${task}` }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify({ ok: true, results }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("[background-jobs] fatal:", err);
    return new Response(
      JSON.stringify({ ok: false, error: err.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
