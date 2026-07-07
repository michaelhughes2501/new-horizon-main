-- 008_indexes.sql
-- Performance indexes across all tables

-- profiles
create index if not exists idx_profiles_username    on public.profiles (username);
create index if not exists idx_profiles_city_state  on public.profiles (city, state);

-- likes
create index if not exists idx_likes_sender         on public.likes (sender);
create index if not exists idx_likes_receiver       on public.likes (receiver);

-- matches
create index if not exists idx_matches_user_one     on public.matches (user_one);
create index if not exists idx_matches_user_two     on public.matches (user_two);

-- conversations
create index if not exists idx_conversations_match  on public.conversations (match_id);

-- messages
create index if not exists idx_messages_conversation on public.messages (conversation_id, created_at);
create index if not exists idx_messages_sender       on public.messages (sender);

-- notifications
create index if not exists idx_notifications_profile on public.notifications (profile_id, created_at desc);
create index if not exists idx_notifications_unread  on public.notifications (profile_id) where read = false;

-- blocks
create index if not exists idx_blocks_blocker       on public.blocks (blocker);

-- reports
create index if not exists idx_reports_reporter     on public.reports (reporter);
create index if not exists idx_reports_reported     on public.reports (reported);
