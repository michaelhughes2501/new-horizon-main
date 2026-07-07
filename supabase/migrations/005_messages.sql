-- 005_messages.sql
-- Messages within a conversation

create table if not exists public.messages (
  id              uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender          uuid not null references public.profiles(id) on delete cascade,
  body            text not null,
  read            boolean not null default false,
  created_at      timestamptz not null default now()
);

-- Row-Level Security
alter table public.messages enable row level security;

create policy "Conversation participants can view messages"
  on public.messages for select
  using (
    exists (
      select 1 from public.conversations c
      join  public.matches m on m.id = c.match_id
      where c.id = conversation_id
        and (m.user_one = auth.uid() or m.user_two = auth.uid())
    )
  );

create policy "Participants can send messages"
  on public.messages for insert
  with check (
    auth.uid() = sender
    and exists (
      select 1 from public.conversations c
      join  public.matches m on m.id = c.match_id
      where c.id = conversation_id
        and (m.user_one = auth.uid() or m.user_two = auth.uid())
    )
  );
