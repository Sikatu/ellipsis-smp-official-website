-- Ellipsis SMP: close a privilege-escalation gap in admin self-registration.
-- Run this in the Supabase SQL editor after admin-3-access.sql.
--
-- The original "Users can request admin access" insert policy (admin-3-access.sql)
-- checked user_id, email, and status = 'pending', but never constrained the
-- `role` column. Any authenticated user could insert their own admin_profiles
-- row directly via the Supabase client with role = 'owner' (still status =
-- 'pending', so it wasn't directly exploitable through the current approval
-- UI, but it's a data-integrity gap that should be closed).
--
-- This migration drops and recreates that policy so self-requested rows are
-- always forced to the lowest-privilege role, regardless of what the client
-- sends.

drop policy if exists "Users can request admin access" on public.admin_profiles;

create policy "Users can request admin access"
on public.admin_profiles
for insert
with check (
  user_id = auth.uid()
  and lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  and status = 'pending'
  and role = 'support'
);
