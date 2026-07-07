-- Ticket System Foundation (Phase 1: website-only, no Discord/AI yet)
--
-- Categories/questions are defined in src/lib/ticketCategories.ts, not here --
-- answers are stored as flexible jsonb keyed by question `key` so the
-- definition source can move to a table later without touching this schema.

create table if not exists public.tickets (
  id uuid primary key default gen_random_uuid(),
  ticket_number bigint generated always as identity,
  category text not null check (category in ('support', 'ban_appeal', 'staff_application')),
  subcategory text,
  subject text not null default '',
  answers jsonb not null default '{}'::jsonb,
  status text not null default 'open' check (status in ('open', 'claimed', 'resolved', 'closed')),
  opened_by_user_id uuid references auth.users(id) on delete set null,
  opened_by_email text,
  minecraft_username text,
  discord_username text,
  discord_user_id text,
  claimed_by_admin_user_id uuid references auth.users(id) on delete set null,
  guest_access_token uuid not null default gen_random_uuid(),
  discord_guild_id text,
  discord_channel_id text,
  discord_thread_id text,
  resolution_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  resolved_at timestamptz,
  closed_at timestamptz
);

create table if not exists public.ticket_messages (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references public.tickets(id) on delete cascade,
  author_type text not null check (author_type in ('player', 'staff', 'system', 'ai')),
  author_user_id uuid references auth.users(id) on delete set null,
  author_display_name text not null default '',
  author_discord_id text,
  source text not null default 'website' check (source in ('website', 'discord')),
  discord_message_id text,
  body text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.ticket_audit_logs (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid references public.tickets(id) on delete set null,
  admin_user_id uuid,
  admin_email text,
  action text not null,
  previous_status text,
  next_status text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists tickets_status_idx on public.tickets(status);
create index if not exists tickets_category_idx on public.tickets(category);
create index if not exists tickets_created_at_idx on public.tickets(created_at desc);
create index if not exists tickets_opened_by_user_id_idx on public.tickets(opened_by_user_id);
create index if not exists tickets_minecraft_username_lower_idx on public.tickets(lower(minecraft_username));
create index if not exists tickets_guest_access_token_idx on public.tickets(guest_access_token);

create index if not exists ticket_messages_ticket_id_idx on public.ticket_messages(ticket_id);
create index if not exists ticket_messages_created_at_idx on public.ticket_messages(created_at);

create index if not exists ticket_audit_logs_ticket_id_idx on public.ticket_audit_logs(ticket_id);
create index if not exists ticket_audit_logs_created_at_idx on public.ticket_audit_logs(created_at desc);

alter table public.tickets enable row level security;
alter table public.ticket_messages enable row level security;
alter table public.ticket_audit_logs enable row level security;

drop trigger if exists set_tickets_updated_at on public.tickets;

create trigger set_tickets_updated_at
before update on public.tickets
for each row
execute function public.set_updated_at();

-- tickets policies

drop policy if exists "Approved admins or owner can view tickets" on public.tickets;
drop policy if exists "Managers can insert tickets" on public.tickets;
drop policy if exists "Managers can update tickets" on public.tickets;

create policy "Approved admins or owner can view tickets"
on public.tickets
for select
to authenticated
using (
  public.is_approved_admin()
  or opened_by_user_id = auth.uid()
);

create policy "Managers can update tickets"
on public.tickets
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

-- Note: there is no client-side insert policy on tickets -- creation always
-- goes through api/create-ticket.js using the service role key (same
-- guest-write pattern as api/paymongo-create-checkout.js), so both guest and
-- logged-in ticket creation share one server-mediated choke point.

-- ticket_messages policies

drop policy if exists "Ticket participants can view messages" on public.ticket_messages;
drop policy if exists "Ticket participants can post messages" on public.ticket_messages;

create policy "Ticket participants can view messages"
on public.ticket_messages
for select
to authenticated
using (
  public.is_approved_admin()
  or exists (
    select 1 from public.tickets
    where tickets.id = ticket_messages.ticket_id
      and tickets.opened_by_user_id = auth.uid()
  )
);

create policy "Ticket participants can post messages"
on public.ticket_messages
for insert
to authenticated
with check (
  public.is_approved_admin()
  or exists (
    select 1 from public.tickets
    where tickets.id = ticket_messages.ticket_id
      and tickets.opened_by_user_id = auth.uid()
  )
);

-- ticket_audit_logs policies (read-only from the client, mirrors order_audit_logs)

drop policy if exists "Approved admins can view ticket audit logs" on public.ticket_audit_logs;

create policy "Approved admins can view ticket audit logs"
on public.ticket_audit_logs
for select
to authenticated
using (public.is_approved_admin());

-- Guest access: scoped to a single ticket by an unguessable token, never a
-- general anon select. Mirrors the risk shape of the existing receipt
-- signed-URL pattern.

create or replace function public.get_ticket_by_guest_token(token uuid)
returns table (
  id uuid,
  ticket_number bigint,
  category text,
  subcategory text,
  subject text,
  status text,
  created_at timestamptz,
  resolved_at timestamptz,
  resolution_note text
)
language sql
stable
security definer
set search_path to 'public'
as $function$
  select
    tickets.id,
    tickets.ticket_number,
    tickets.category,
    tickets.subcategory,
    tickets.subject,
    tickets.status,
    tickets.created_at,
    tickets.resolved_at,
    tickets.resolution_note
  from public.tickets
  where tickets.guest_access_token = token
  limit 1;
$function$;

revoke all on function public.get_ticket_by_guest_token(uuid)
from public, anon;

grant execute on function public.get_ticket_by_guest_token(uuid)
to authenticated, anon;

create or replace function public.get_ticket_messages_by_guest_token(token uuid)
returns table (
  id uuid,
  author_type text,
  author_display_name text,
  body text,
  created_at timestamptz
)
language sql
stable
security definer
set search_path to 'public'
as $function$
  select
    ticket_messages.id,
    ticket_messages.author_type,
    ticket_messages.author_display_name,
    ticket_messages.body,
    ticket_messages.created_at
  from public.ticket_messages
  join public.tickets on tickets.id = ticket_messages.ticket_id
  where tickets.guest_access_token = token
  order by ticket_messages.created_at asc;
$function$;

revoke all on function public.get_ticket_messages_by_guest_token(uuid)
from public, anon;

grant execute on function public.get_ticket_messages_by_guest_token(uuid)
to authenticated, anon;
