-- Admin Minecraft Action Queue Foundation

create table if not exists public.minecraft_admin_actions (
  id uuid primary key default gen_random_uuid(),
  player_key text not null,
  minecraft_username text not null,
  discord_username text,
  action_type text not null check (
    action_type in (
      'give_rank',
      'give_coins',
      'jail',
      'unjail',
      'temp_ban'
    )
  ),
  payload jsonb not null default '{}'::jsonb,
  reason text not null default '',
  status text not null default 'queued' check (
    status in (
      'queued',
      'processing',
      'completed',
      'failed',
      'cancelled'
    )
  ),
  result_message text,
  created_by uuid default auth.uid(),
  processed_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  processed_at timestamptz
);

create index if not exists minecraft_admin_actions_player_key_idx
on public.minecraft_admin_actions(player_key);

create index if not exists minecraft_admin_actions_status_idx
on public.minecraft_admin_actions(status);

create index if not exists minecraft_admin_actions_created_at_idx
on public.minecraft_admin_actions(created_at desc);

alter table public.minecraft_admin_actions enable row level security;

create or replace function public.set_minecraft_admin_actions_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_minecraft_admin_actions_updated_at on public.minecraft_admin_actions;

create trigger set_minecraft_admin_actions_updated_at
before update on public.minecraft_admin_actions
for each row
execute function public.set_minecraft_admin_actions_updated_at();

drop policy if exists "Approved admins can view minecraft actions" on public.minecraft_admin_actions;
drop policy if exists "Managers can create minecraft actions" on public.minecraft_admin_actions;
drop policy if exists "Managers can update minecraft actions" on public.minecraft_admin_actions;

create policy "Approved admins can view minecraft actions"
on public.minecraft_admin_actions
for select
to authenticated
using (
  exists (
    select 1
    from public.admin_profiles
    where admin_profiles.status = 'approved'
      and (
        admin_profiles.user_id = auth.uid()
        or lower(admin_profiles.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
      )
  )
);

create policy "Managers can create minecraft actions"
on public.minecraft_admin_actions
for insert
to authenticated
with check (
  exists (
    select 1
    from public.admin_profiles
    where admin_profiles.status = 'approved'
      and admin_profiles.role in ('owner', 'manager')
      and (
        admin_profiles.user_id = auth.uid()
        or lower(admin_profiles.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
      )
  )
);

create policy "Managers can update minecraft actions"
on public.minecraft_admin_actions
for update
to authenticated
using (
  exists (
    select 1
    from public.admin_profiles
    where admin_profiles.status = 'approved'
      and admin_profiles.role in ('owner', 'manager')
      and (
        admin_profiles.user_id = auth.uid()
        or lower(admin_profiles.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
      )
  )
)
with check (
  exists (
    select 1
    from public.admin_profiles
    where admin_profiles.status = 'approved'
      and admin_profiles.role in ('owner', 'manager')
      and (
        admin_profiles.user_id = auth.uid()
        or lower(admin_profiles.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
      )
  )
);
