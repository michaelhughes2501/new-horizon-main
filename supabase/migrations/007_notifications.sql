-- 007_notifications.sql
-- In-app notifications for a user

create type public.notification_type as enum (
  'like', 'match', 'message', 'system'
);

create table if not exists public.notifications (
  id          uuid primary key default gen_random_uuid(),
  profile_id  uuid not null references public.profiles(id) on delete cascade,
  type        public.notification_type not null,
  title       text not null,
  body        text,
  read        boolean not null default false,
  data        jsonb,
  created_at  timestamptz not null default now()
);

-- Row-Level Security
alter table public.notifications enable row level security;

create policy "Users can view their own notifications"
  on public.notifications for select
  using (auth.uid() = profile_id);

create policy "Users can mark their notifications as read"
  on public.notifications for update
  using (auth.uid() = profile_id);
