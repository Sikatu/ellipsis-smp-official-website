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
set search_path to 'public'
as $function$
  select
    profile.player_key,
    profile.minecraft_username,
    private.minecraft_uuid,
    profile.current_rank,

    case
      when profile.balance is not null then trim(to_char(profile.balance, 'FM999,999,999,999,990.##'))
      when profile.balance_text is not null and profile.balance_text <> '' then profile.balance_text
      else null
    end as balance_text,

    coalesce(profile.votes, profile.votes_total, 0) as votes_total,

    case
      when profile.total_playtime_minutes is not null then
        case
          when profile.total_playtime_minutes >= 1440 then
            concat(
              floor(profile.total_playtime_minutes / 1440),
              'd ',
              floor((profile.total_playtime_minutes % 1440) / 60),
              'h'
            )
          when profile.total_playtime_minutes >= 60 then
            concat(
              floor(profile.total_playtime_minutes / 60),
              'h ',
              profile.total_playtime_minutes % 60,
              'm'
            )
          else
            concat(profile.total_playtime_minutes, 'm')
        end
      when profile.playtime_text is not null and profile.playtime_text <> '' then profile.playtime_text
      else null
    end as playtime_text,

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
$function$;

revoke all on function public.get_my_minecraft_profile()
from public, anon;

grant execute on function public.get_my_minecraft_profile()
to authenticated;