-- Admin Player Notes Foundation

create table if not exists public.player_admin_notes (
  id uuid primary key default gen_random_uuid(),
  player_key text not null unique,
  minecraft_username text not null,
  discord_username text,
  note text not null default '',
  created_by uuid default auth.uid(),
  updated_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists player_admin_notes_player_key_idx
on public.player_admin_notes(player_key);

create index if not exists player_admin_notes_updated_at_idx
on public.player_admin_notes(updated_at desc);

alter table public.player_admin_notes enable row level security;

create or replace function public.set_player_admin_notes_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_player_admin_notes_updated_at on public.player_admin_notes;

create trigger set_player_admin_notes_updated_at
before update on public.player_admin_notes
for each row
execute function public.set_player_admin_notes_updated_at();

drop policy if exists "Approved admins can view player notes" on public.player_admin_notes;
drop policy if exists "Managers can create player notes" on public.player_admin_notes;
drop policy if exists "Managers can update player notes" on public.player_admin_notes;
drop policy if exists "Managers can delete player notes" on public.player_admin_notes;

create policy "Approved admins can view player notes"
on public.player_admin_notes
for select
to authenticated
using (
  exists (
    select 1
    from public.admin_profiles
    where admin_profiles.user_id = auth.uid()
      and admin_profiles.status = 'approved'
  )
);

create policy "Managers can create player notes"
on public.player_admin_notes
for insert
to authenticated
with check (
  exists (
    select 1
    from public.admin_profiles
    where admin_profiles.user_id = auth.uid()
      and admin_profiles.status = 'approved'
      and admin_profiles.role in ('owner', 'manager')
  )
);

create policy "Managers can update player notes"
on public.player_admin_notes
for update
to authenticated
using (
  exists (
    select 1
    from public.admin_profiles
    where admin_profiles.user_id = auth.uid()
      and admin_profiles.status = 'approved'
      and admin_profiles.role in ('owner', 'manager')
  )
)
with check (
  exists (
    select 1
    from public.admin_profiles
    where admin_profiles.user_id = auth.uid()
      and admin_profiles.status = 'approved'
      and admin_profiles.role in ('owner', 'manager')
  )
);

create policy "Managers can delete player notes"
on public.player_admin_notes
for delete
to authenticated
using (
  exists (
    select 1
    from public.admin_profiles
    where admin_profiles.user_id = auth.uid()
      and admin_profiles.status = 'approved'
      and admin_profiles.role in ('owner', 'manager')
  )
);
