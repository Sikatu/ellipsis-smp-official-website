create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.is_approved_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_profiles profile
    where profile.status = 'approved'
      and (
        profile.user_id = auth.uid()
        or lower(profile.email) = lower(auth.jwt() ->> 'email')
      )
  );
$$;

grant execute on function public.is_approved_admin() to authenticated;

create table if not exists public.minecraft_player_profiles (
  id uuid primary key default gen_random_uuid(),
  player_key text not null unique,
  minecraft_username text not null,
  current_rank text,
  balance_text text,
  votes_total integer not null default 0,
  playtime_text text,
  is_online boolean not null default false,
  first_joined_at timestamptz,
  last_seen_at timestamptz,
  last_synced_at timestamptz,
  public_stats jsonb not null default '{}'::jsonb,
  raw_placeholders jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.minecraft_player_profiles
  add column if not exists current_rank text,
  add column if not exists balance_text text,
  add column if not exists votes_total integer not null default 0,
  add column if not exists playtime_text text,
  add column if not exists is_online boolean not null default false,
  add column if not exists first_joined_at timestamptz,
  add column if not exists last_seen_at timestamptz,
  add column if not exists last_synced_at timestamptz,
  add column if not exists public_stats jsonb not null default '{}'::jsonb,
  add column if not exists raw_placeholders jsonb not null default '{}'::jsonb;

drop trigger if exists minecraft_player_profiles_set_updated_at
on public.minecraft_player_profiles;

create trigger minecraft_player_profiles_set_updated_at
before update on public.minecraft_player_profiles
for each row
execute function public.set_updated_at();

create table if not exists public.minecraft_player_private (
  player_key text primary key,
  minecraft_uuid text not null unique,
  minecraft_username text not null,
  username_history jsonb not null default '[]'::jsonb,
  private_metadata jsonb not null default '{}'::jsonb,
  first_seen_at timestamptz,
  last_seen_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists minecraft_player_private_set_updated_at
on public.minecraft_player_private;

create trigger minecraft_player_private_set_updated_at
before update on public.minecraft_player_private
for each row
execute function public.set_updated_at();

create table if not exists public.minecraft_profile_links (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  player_key text not null,
  minecraft_uuid text not null,
  minecraft_username text not null,
  status text not null default 'active'
    check (status in ('active', 'unlinked')),
  linked_at timestamptz not null default now(),
  unlinked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists minecraft_profile_links_set_updated_at
on public.minecraft_profile_links;

create trigger minecraft_profile_links_set_updated_at
before update on public.minecraft_profile_links
for each row
execute function public.set_updated_at();

create unique index if not exists minecraft_profile_links_one_active_user_idx
on public.minecraft_profile_links (user_id)
where status = 'active';

create unique index if not exists minecraft_profile_links_one_active_player_idx
on public.minecraft_profile_links (player_key)
where status = 'active';

create index if not exists minecraft_profile_links_player_key_idx
on public.minecraft_profile_links (player_key);

create table if not exists public.minecraft_profile_claims (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  claim_code text not null unique,
  requested_minecraft_username text,
  status text not null default 'pending'
    check (status in ('pending', 'linked', 'expired', 'cancelled')),
  linked_player_key text,
  linked_minecraft_uuid text,
  linked_minecraft_username text,
  attempts integer not null default 0,
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists minecraft_profile_claims_set_updated_at
on public.minecraft_profile_claims;

create trigger minecraft_profile_claims_set_updated_at
before update on public.minecraft_profile_claims
for each row
execute function public.set_updated_at();

create index if not exists minecraft_profile_claims_user_status_idx
on public.minecraft_profile_claims (user_id, status, created_at desc);

create index if not exists minecraft_profile_claims_code_status_idx
on public.minecraft_profile_claims (claim_code, status, expires_at);

create table if not exists public.minecraft_profile_snapshots (
  id uuid primary key default gen_random_uuid(),
  player_key text not null,
  snapshot_type text not null default 'profile_sync',
  snapshot jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists minecraft_profile_snapshots_player_created_idx
on public.minecraft_profile_snapshots (player_key, created_at desc);

alter table public.minecraft_player_profiles enable row level security;
alter table public.minecraft_player_private enable row level security;
alter table public.minecraft_profile_links enable row level security;
alter table public.minecraft_profile_claims enable row level security;
alter table public.minecraft_profile_snapshots enable row level security;

drop policy if exists "Approved admins can view Minecraft player profiles"
on public.minecraft_player_profiles;

create policy "Approved admins can view Minecraft player profiles"
on public.minecraft_player_profiles
for select
to authenticated
using (public.is_approved_admin());

drop policy if exists "Linked players can view own Minecraft profile"
on public.minecraft_player_profiles;

create policy "Linked players can view own Minecraft profile"
on public.minecraft_player_profiles
for select
to authenticated
using (
  exists (
    select 1
    from public.minecraft_profile_links link
    where link.user_id = auth.uid()
      and link.status = 'active'
      and link.player_key = minecraft_player_profiles.player_key
  )
);

drop policy if exists "Approved admins can view private Minecraft player data"
on public.minecraft_player_private;

create policy "Approved admins can view private Minecraft player data"
on public.minecraft_player_private
for select
to authenticated
using (public.is_approved_admin());

drop policy if exists "Linked players can view own private Minecraft data"
on public.minecraft_player_private;

create policy "Linked players can view own private Minecraft data"
on public.minecraft_player_private
for select
to authenticated
using (
  exists (
    select 1
    from public.minecraft_profile_links link
    where link.user_id = auth.uid()
      and link.status = 'active'
      and link.player_key = minecraft_player_private.player_key
  )
);

drop policy if exists "Users can view own Minecraft profile links"
on public.minecraft_profile_links;

create policy "Users can view own Minecraft profile links"
on public.minecraft_profile_links
for select
to authenticated
using (
  user_id = auth.uid()
  or public.is_approved_admin()
);

drop policy if exists "Users can view own Minecraft profile claims"
on public.minecraft_profile_claims;

create policy "Users can view own Minecraft profile claims"
on public.minecraft_profile_claims
for select
to authenticated
using (
  user_id = auth.uid()
  or public.is_approved_admin()
);

drop policy if exists "Linked players can view own Minecraft profile snapshots"
on public.minecraft_profile_snapshots;

create policy "Linked players can view own Minecraft profile snapshots"
on public.minecraft_profile_snapshots
for select
to authenticated
using (
  public.is_approved_admin()
  or exists (
    select 1
    from public.minecraft_profile_links link
    where link.user_id = auth.uid()
      and link.status = 'active'
      and link.player_key = minecraft_profile_snapshots.player_key
  )
);

create or replace function public.request_minecraft_profile_claim(
  requested_username text default null
)
returns table (
  claim_id uuid,
  claim_code text,
  expires_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
  v_code text;
  v_claim_id uuid;
  v_expires_at timestamptz;
  v_recent_count integer;
  v_attempt integer := 0;
begin
  v_user_id := auth.uid();

  if v_user_id is null then
    raise exception 'Authentication required.';
  end if;

  update public.minecraft_profile_claims
  set status = 'expired'
  where user_id = v_user_id
    and status = 'pending'
    and expires_at < now();

  select count(*)
  into v_recent_count
  from public.minecraft_profile_claims
  where user_id = v_user_id
    and created_at > now() - interval '1 hour';

  if v_recent_count >= 8 then
    raise exception 'Too many claim requests. Please try again later.';
  end if;

  v_expires_at := now() + interval '15 minutes';

  loop
    v_attempt := v_attempt + 1;
    v_code := upper(substr(encode(gen_random_bytes(5), 'hex'), 1, 8));

    begin
      insert into public.minecraft_profile_claims (
        user_id,
        claim_code,
        requested_minecraft_username,
        status,
        expires_at
      )
      values (
        v_user_id,
        v_code,
        nullif(trim(requested_username), ''),
        'pending',
        v_expires_at
      )
      returning id into v_claim_id;

      exit;
    exception when unique_violation then
      if v_attempt >= 5 then
        raise exception 'Could not generate a unique claim code. Please try again.';
      end if;
    end;
  end loop;

  return query
  select v_claim_id, v_code, v_expires_at;
end;
$$;

grant execute on function public.request_minecraft_profile_claim(text) to authenticated;

create or replace function public.get_my_minecraft_profile()
returns table (
  player_key text,
  minecraft_username text,
  minecraft_uuid text,
  current_rank text,
  balance_text text,
  votes_total integer,
  playtime_text text,
  is_online boolean,
  first_joined_at timestamptz,
  last_seen_at timestamptz,
  last_synced_at timestamptz,
  public_stats jsonb,
  raw_placeholders jsonb,
  linked_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select
    profile.player_key,
    profile.minecraft_username,
    private.minecraft_uuid,
    profile.current_rank,
    profile.balance_text,
    profile.votes_total,
    profile.playtime_text,
    profile.is_online,
    profile.first_joined_at,
    profile.last_seen_at,
    profile.last_synced_at,
    profile.public_stats,
    profile.raw_placeholders,
    link.linked_at
  from public.minecraft_profile_links link
  join public.minecraft_player_profiles profile
    on profile.player_key = link.player_key
  left join public.minecraft_player_private private
    on private.player_key = link.player_key
  where link.user_id = auth.uid()
    and link.status = 'active'
  limit 1;
$$;

grant execute on function public.get_my_minecraft_profile() to authenticated;
