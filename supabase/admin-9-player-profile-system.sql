-- Player Profile System Foundation
-- Run this in Supabase SQL Editor after the existing admin SQL files.
-- The Minecraft bridge should use the Supabase service role key server-side only.

create table if not exists public.minecraft_player_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references auth.users(id) on delete set null,
  player_key text not null unique,
  minecraft_username text not null,
  discord_username text,
  current_rank text not null default 'Member',
  rank_weight integer not null default 0,
  leaderboard_position integer,
  leaderboard_score numeric not null default 0,
  balance numeric not null default 0,
  total_playtime_minutes integer not null default 0,
  votes integer not null default 0,
  kills integer not null default 0,
  deaths integer not null default 0,
  mob_kills integer not null default 0,
  blocks_broken integer not null default 0,
  blocks_placed integer not null default 0,
  is_online boolean not null default false,
  first_joined_at timestamptz,
  last_seen_at timestamptz,
  last_synced_at timestamptz,
  location_summary text,
  active_world text,
  achievements jsonb not null default '{}'::jsonb,
  progression jsonb not null default '{}'::jsonb,
  economy jsonb not null default '{}'::jsonb,
  raw_stats jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.player_profile_claims (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  player_key text not null,
  minecraft_username text not null,
  discord_username text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  proof_note text,
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.minecraft_player_stat_snapshots (
  id uuid primary key default gen_random_uuid(),
  player_key text not null,
  minecraft_username text not null,
  leaderboard_score numeric not null default 0,
  balance numeric not null default 0,
  total_playtime_minutes integer not null default 0,
  votes integer not null default 0,
  kills integer not null default 0,
  deaths integer not null default 0,
  online_players integer,
  raw_stats jsonb not null default '{}'::jsonb,
  captured_at timestamptz not null default now()
);

create index if not exists minecraft_player_profiles_player_key_idx
on public.minecraft_player_profiles(player_key);

create index if not exists minecraft_player_profiles_leaderboard_idx
on public.minecraft_player_profiles(leaderboard_position, leaderboard_score desc);

create index if not exists minecraft_player_profiles_rank_idx
on public.minecraft_player_profiles(current_rank, rank_weight desc);

create index if not exists player_profile_claims_user_idx
on public.player_profile_claims(user_id, created_at desc);

create index if not exists player_profile_claims_status_idx
on public.player_profile_claims(status, created_at desc);

create index if not exists minecraft_player_stat_snapshots_player_idx
on public.minecraft_player_stat_snapshots(player_key, captured_at desc);

create or replace function public.set_player_profile_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_minecraft_player_profiles_updated_at on public.minecraft_player_profiles;
create trigger set_minecraft_player_profiles_updated_at
before update on public.minecraft_player_profiles
for each row
execute function public.set_player_profile_updated_at();

drop trigger if exists set_player_profile_claims_updated_at on public.player_profile_claims;
create trigger set_player_profile_claims_updated_at
before update on public.player_profile_claims
for each row
execute function public.set_player_profile_updated_at();

create or replace function public.approve_player_profile_claim(claim_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  claim_record public.player_profile_claims%rowtype;
begin
  if not public.is_admin_manager() then
    raise exception 'Only managers and owners can approve player profile claims.';
  end if;

  select *
  into claim_record
  from public.player_profile_claims
  where id = claim_id;

  if claim_record.id is null then
    raise exception 'Player profile claim not found.';
  end if;

  update public.minecraft_player_profiles
  set
    user_id = claim_record.user_id,
    minecraft_username = claim_record.minecraft_username,
    discord_username = coalesce(claim_record.discord_username, discord_username)
  where player_key = claim_record.player_key;

  if not found then
    insert into public.minecraft_player_profiles (
      user_id,
      player_key,
      minecraft_username,
      discord_username
    )
    values (
      claim_record.user_id,
      claim_record.player_key,
      claim_record.minecraft_username,
      claim_record.discord_username
    );
  end if;

  update public.player_profile_claims
  set
    status = 'approved',
    reviewed_by = auth.uid(),
    reviewed_at = now()
  where id = claim_id;
end;
$$;

alter table public.minecraft_player_profiles enable row level security;
alter table public.player_profile_claims enable row level security;
alter table public.minecraft_player_stat_snapshots enable row level security;

drop policy if exists "Admins can view all minecraft player profiles" on public.minecraft_player_profiles;
drop policy if exists "Players can view linked minecraft profiles" on public.minecraft_player_profiles;
drop policy if exists "Managers can update minecraft player profiles" on public.minecraft_player_profiles;
drop policy if exists "Admins can view all player profile claims" on public.player_profile_claims;
drop policy if exists "Players can create profile claims" on public.player_profile_claims;
drop policy if exists "Players can view own profile claims" on public.player_profile_claims;
drop policy if exists "Managers can update profile claims" on public.player_profile_claims;
drop policy if exists "Admins can view minecraft stat snapshots" on public.minecraft_player_stat_snapshots;

create policy "Admins can view all minecraft player profiles"
on public.minecraft_player_profiles
for select
to authenticated
using (public.is_admin_approved());

create policy "Players can view linked minecraft profiles"
on public.minecraft_player_profiles
for select
to authenticated
using (user_id = auth.uid());

create policy "Managers can update minecraft player profiles"
on public.minecraft_player_profiles
for update
to authenticated
using (public.is_admin_manager())
with check (public.is_admin_manager());

create policy "Admins can view all player profile claims"
on public.player_profile_claims
for select
to authenticated
using (public.is_admin_approved());

create policy "Players can view own profile claims"
on public.player_profile_claims
for select
to authenticated
using (user_id = auth.uid());

create policy "Players can create profile claims"
on public.player_profile_claims
for insert
to authenticated
with check (user_id = auth.uid());

create policy "Managers can update profile claims"
on public.player_profile_claims
for update
to authenticated
using (public.is_admin_manager())
with check (public.is_admin_manager());

create policy "Admins can view minecraft stat snapshots"
on public.minecraft_player_stat_snapshots
for select
to authenticated
using (public.is_admin_approved());

-- Bridge upsert example for your private Minecraft bridge:
-- Use the service role key from a server-only environment, never in browser code.
-- upsert into public.minecraft_player_profiles on player_key with fresh rank,
-- balance, leaderboard, playtime, online status, and raw plugin stats.
