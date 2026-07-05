create or replace function public.complete_minecraft_profile_claim(
  p_claim_code text,
  p_player_key text,
  p_minecraft_uuid text,
  p_minecraft_username text
)
returns table (
  success boolean,
  message text,
  linked_player_key text,
  linked_minecraft_username text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_claim record;
  v_claim_code text;
  v_player_key text;
  v_minecraft_uuid text;
  v_minecraft_username text;
begin
  v_claim_code := upper(trim(coalesce(p_claim_code, '')));
  v_player_key := lower(trim(coalesce(p_player_key, '')));
  v_minecraft_uuid := trim(coalesce(p_minecraft_uuid, ''));
  v_minecraft_username := trim(coalesce(p_minecraft_username, ''));

  if length(v_claim_code) < 4 or length(v_claim_code) > 16 then
    return query select false, 'Invalid claim code.'::text, null::text, null::text;
    return;
  end if;

  if v_player_key = '' or v_minecraft_uuid = '' or v_minecraft_username = '' then
    return query select false, 'Missing Minecraft player identity.'::text, null::text, null::text;
    return;
  end if;

  if v_minecraft_uuid !~* '^[0-9a-f-]{32,36}$' then
    return query select false, 'Invalid Minecraft UUID.'::text, null::text, null::text;
    return;
  end if;

  update public.minecraft_profile_claims
  set status = 'expired'
  where status = 'pending'
    and expires_at < now();

  select *
  into v_claim
  from public.minecraft_profile_claims
  where claim_code = v_claim_code
    and status = 'pending'
  for update;

  if not found then
    return query select false, 'Claim code not found, expired, or already used.'::text, null::text, null::text;
    return;
  end if;

  if v_claim.expires_at < now() then
    update public.minecraft_profile_claims
    set status = 'expired'
    where id = v_claim.id;

    return query select false, 'Claim code expired. Generate a new code on the website.'::text, null::text, null::text;
    return;
  end if;

  insert into public.minecraft_player_profiles (
    player_key,
    minecraft_username,
    is_online,
    last_seen_at,
    last_synced_at
  )
  values (
    v_player_key,
    v_minecraft_username,
    true,
    now(),
    now()
  )
  on conflict (player_key)
  do update set
    minecraft_username = excluded.minecraft_username,
    is_online = true,
    last_seen_at = now(),
    last_synced_at = now();

  insert into public.minecraft_player_private (
    player_key,
    minecraft_uuid,
    minecraft_username,
    last_seen_at
  )
  values (
    v_player_key,
    v_minecraft_uuid,
    v_minecraft_username,
    now()
  )
  on conflict (player_key)
  do update set
    minecraft_uuid = excluded.minecraft_uuid,
    minecraft_username = excluded.minecraft_username,
    last_seen_at = now();

  update public.minecraft_profile_links
  set
    status = 'unlinked',
    unlinked_at = now()
  where status = 'active'
    and (
      user_id = v_claim.user_id
      or player_key = v_player_key
      or minecraft_uuid = v_minecraft_uuid
    );

  insert into public.minecraft_profile_links (
    user_id,
    player_key,
    minecraft_uuid,
    minecraft_username,
    status,
    linked_at
  )
  values (
    v_claim.user_id,
    v_player_key,
    v_minecraft_uuid,
    v_minecraft_username,
    'active',
    now()
  );

  update public.minecraft_profile_claims
  set
    status = 'linked',
    linked_player_key = v_player_key,
    linked_minecraft_uuid = v_minecraft_uuid,
    linked_minecraft_username = v_minecraft_username
  where id = v_claim.id;

  return query
  select
    true,
    ('Linked website account to ' || v_minecraft_username || '.')::text,
    v_player_key,
    v_minecraft_username;
end;
$$;

revoke all on function public.complete_minecraft_profile_claim(text, text, text, text)
from public, anon, authenticated;

grant execute on function public.complete_minecraft_profile_claim(text, text, text, text)
to service_role;