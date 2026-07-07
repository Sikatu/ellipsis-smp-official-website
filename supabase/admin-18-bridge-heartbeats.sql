-- Bridge heartbeat telemetry table
-- Written by the EllipsisBridge plugin (service role, bypasses RLS) via
-- upsert on_conflict=server_key. Read by the Operator Console for live
-- bridge status.

create table if not exists public.minecraft_bridge_heartbeats (
  server_key text primary key,
  server_name text,
  plugin_version text,
  online_players integer,
  max_players integer,
  bridge_enabled boolean,
  supabase_configured boolean,
  action_task_running boolean,
  profile_task_running boolean,
  status_message text,
  last_heartbeat_at timestamptz,
  last_action_poll_at timestamptz,
  last_profile_sync_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create index if not exists minecraft_bridge_heartbeats_updated_at_idx
on public.minecraft_bridge_heartbeats(updated_at desc);

alter table public.minecraft_bridge_heartbeats enable row level security;

drop policy if exists "Approved admins can view bridge heartbeats" on public.minecraft_bridge_heartbeats;

create policy "Approved admins can view bridge heartbeats"
on public.minecraft_bridge_heartbeats
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

-- Realtime is only needed for minecraft_admin_actions (the Operator Console's
-- live telemetry stream subscribes to postgres_changes on it). Guarded since
-- ALTER PUBLICATION ... ADD TABLE has no IF NOT EXISTS and errors if it's
-- already a member (e.g. added by hand in the dashboard).
do $$
begin
  alter publication supabase_realtime add table public.minecraft_admin_actions;
exception
  when duplicate_object then
    null;
end;
$$;
