-- Admin 3.0 access setup for Ellipsis SMP
-- Run this in the Supabase SQL editor before relying on staff self-registration.

create table if not exists public.admin_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references auth.users(id) on delete cascade,
  email text unique not null,
  display_name text,
  role text not null default 'support'
    check (role in ('owner', 'manager', 'support')),
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.order_audit_logs (
  id uuid primary key default gen_random_uuid(),
  order_id uuid,
  admin_user_id uuid,
  admin_email text,
  action text not null,
  next_status text,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin_approved()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_profiles
    where user_id = auth.uid()
      and status = 'approved'
  );
$$;

create or replace function public.is_admin_manager()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_profiles
    where user_id = auth.uid()
      and status = 'approved'
      and role in ('owner', 'manager')
  );
$$;

create or replace function public.is_admin_owner()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_profiles
    where user_id = auth.uid()
      and status = 'approved'
      and role = 'owner'
  );
$$;

alter table public.admin_profiles enable row level security;
alter table public.order_audit_logs enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'admin_profiles'
      and policyname = 'Admins can view own profile'
  ) then
    create policy "Admins can view own profile"
    on public.admin_profiles
    for select
    using (
      user_id = auth.uid()
      or lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
      or public.is_admin_owner()
    );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'admin_profiles'
      and policyname = 'Users can request admin access'
  ) then
    create policy "Users can request admin access"
    on public.admin_profiles
    for insert
    with check (
      user_id = auth.uid()
      and lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
      and status = 'pending'
    );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'admin_profiles'
      and policyname = 'Owners can manage admin profiles'
  ) then
    create policy "Owners can manage admin profiles"
    on public.admin_profiles
    for all
    using (public.is_admin_owner())
    with check (public.is_admin_owner());
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'order_audit_logs'
      and policyname = 'Approved admins can read audit logs'
  ) then
    create policy "Approved admins can read audit logs"
    on public.order_audit_logs
    for select
    using (public.is_admin_approved());
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'order_audit_logs'
      and policyname = 'Approved managers can write audit logs'
  ) then
    create policy "Approved managers can write audit logs"
    on public.order_audit_logs
    for insert
    with check (public.is_admin_manager());
  end if;
end $$;

-- Optional but recommended if your orders table has RLS enabled:
-- Approved admins can read orders.
do $$
begin
  if exists (
    select 1 from information_schema.tables
    where table_schema = 'public'
      and table_name = 'orders'
  ) then
    alter table public.orders enable row level security;

    if not exists (
      select 1 from pg_policies
      where schemaname = 'public'
        and tablename = 'orders'
        and policyname = 'Approved admins can read orders'
    ) then
      create policy "Approved admins can read orders"
      on public.orders
      for select
      using (public.is_admin_approved());
    end if;

    if not exists (
      select 1 from pg_policies
      where schemaname = 'public'
        and tablename = 'orders'
        and policyname = 'Managers can update orders'
    ) then
      create policy "Managers can update orders"
      on public.orders
      for update
      using (public.is_admin_manager())
      with check (public.is_admin_manager());
    end if;
  end if;
end $$;

-- After running this file, create your owner profile by replacing the email:
-- insert into public.admin_profiles (email, role, status)
-- values ('YOUR_OWNER_EMAIL_HERE', 'owner', 'approved')
-- on conflict (email) do update set role = 'owner', status = 'approved';
