drop function if exists public.request_minecraft_profile_claim(text);

create function public.request_minecraft_profile_claim(
  requested_username text default null
)
returns table (
  claim_code text,
  expires_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
  v_requested_minecraft_username text;
  v_claim_code text;
  v_expires_at timestamptz;
  v_recent_count integer;
begin
  v_user_id := auth.uid();

  if v_user_id is null then
    raise exception 'Authentication required.';
  end if;

  v_requested_minecraft_username := nullif(trim(coalesce(requested_username, '')), '');

  update public.minecraft_profile_claims as mpc
  set status = 'expired'
  where mpc.status = 'pending'
    and mpc.expires_at < now();

  select count(*)
  into v_recent_count
  from public.minecraft_profile_claims as mpc
  where mpc.user_id = v_user_id
    and mpc.created_at >= now() - interval '1 hour';

  if v_recent_count >= 8 then
    raise exception 'Too many claim code requests. Please wait before generating another code.';
  end if;

  update public.minecraft_profile_claims as mpc
  set status = 'expired'
  where mpc.user_id = v_user_id
    and mpc.status = 'pending';

  loop
    v_claim_code := upper(substr(md5(random()::text || clock_timestamp()::text || v_user_id::text), 1, 8));

    exit when not exists (
      select 1
      from public.minecraft_profile_claims as mpc
      where mpc.claim_code = v_claim_code
        and mpc.status = 'pending'
    );
  end loop;

  v_expires_at := now() + interval '15 minutes';

  insert into public.minecraft_profile_claims (
    user_id,
    claim_code,
    requested_minecraft_username,
    status,
    expires_at
  )
  values (
    v_user_id,
    v_claim_code,
    v_requested_minecraft_username,
    'pending',
    v_expires_at
  );

  return query
  select
    v_claim_code,
    v_expires_at;
end;
$$;

revoke all on function public.request_minecraft_profile_claim(text)
from public, anon;

grant execute on function public.request_minecraft_profile_claim(text)
to authenticated;