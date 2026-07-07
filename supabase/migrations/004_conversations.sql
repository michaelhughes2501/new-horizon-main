-- 004_conversations.sql
-- One conversation per match

create table if not exists public.conversations (
  id         uuid primary key default gen_random_uuid(),
  match_id   bigint not null references public.matches(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (match_id)
);

-- Row-Level Security
alter table public.conversations enable row level security;

create policy "Conversation participants can view conversations"
  on public.conversations for select
  using (
    exists (
      select 1 from public.matches m
      where m.id = match_id
        and (m.user_one = auth.uid() or m.user_two = auth.uid())
    )
  );

-- Auto-create a conversation for every new match
create or replace function public.create_conversation_on_match()
returns trigger language plpgsql security definer as $$
begin
  insert into public.conversations (match_id) values (new.id);
  return new;
end;
$$;

create or replace trigger matches_create_conversation
  after insert on public.matches
  for each row execute procedure public.create_conversation_on_match();
