# Ellipsis SMP Minecraft Bridge Guide

This guide explains how to connect the website command center to the Minecraft server.

## What The Bridge Does

The website should not directly run Minecraft commands. Instead, run a private bridge beside the Minecraft server.

The bridge has two jobs:

1. Sync player stats from Minecraft into Supabase.
2. Read queued admin actions from Supabase, run the matching Minecraft command, then mark the action completed or failed.

## Recommended Setup

Use this flow:

Website/Admin -> Supabase -> Private Minecraft Bridge -> Minecraft Server

Never put the Supabase service role key in the website. The bridge runs privately on the server machine, VPS, or a trusted backend.

## Tables Used

`minecraft_player_profiles`

Stores synced player profile data:

- Minecraft username
- current rank
- balance
- leaderboard position and score
- total playtime
- votes
- kills/deaths
- blocks broken/placed
- online status
- raw plugin stats

`player_profile_claims`

Stores player requests to link their website account to a Minecraft IGN.

`minecraft_admin_actions`

Stores command-center actions:

- give rank
- give coins
- jail
- unjail
- temp ban
- automated purchase fulfillment

## Payment To Rank Flow

1. Player buys a rank on the website.
2. Order appears in `/admin`.
3. Staff verifies payment.
4. Website queues a `minecraft_admin_actions` row automatically.
5. Minecraft bridge sees the queued action.
6. Bridge runs the correct server command.
7. Bridge updates the action to `completed` or `failed`.
8. Command center shows the result.

## Example Commands

For LuckPerms ranks:

```text
lp user <minecraft_username> parent add <rank>
```

For Vault economy coins:

```text
eco give <minecraft_username> <amount>
```

For jail/ban style actions, use the command from your moderation plugin.

## Bridge Worker Logic

Every few seconds, the bridge should:

1. Fetch queued actions:

```sql
select *
from minecraft_admin_actions
where status = 'queued'
order by created_at asc
limit 10;
```

2. Mark one action as `processing`.
3. Run the matching command in Minecraft.
4. Mark it:

```sql
update minecraft_admin_actions
set
  status = 'completed',
  result_message = 'Rank applied successfully.',
  processed_at = now()
where id = '<action_id>';
```

If the command fails, mark it as `failed` and save the error message.

## Player Profile Sync Logic

Every 30-60 seconds, or when a player joins/quits, the bridge should upsert:

```sql
insert into minecraft_player_profiles (
  player_key,
  minecraft_username,
  current_rank,
  balance,
  leaderboard_position,
  leaderboard_score,
  total_playtime_minutes,
  votes,
  kills,
  deaths,
  mob_kills,
  blocks_broken,
  blocks_placed,
  is_online,
  first_joined_at,
  last_seen_at,
  last_synced_at,
  raw_stats
)
values (...)
on conflict (player_key)
do update set
  minecraft_username = excluded.minecraft_username,
  current_rank = excluded.current_rank,
  balance = excluded.balance,
  leaderboard_position = excluded.leaderboard_position,
  leaderboard_score = excluded.leaderboard_score,
  total_playtime_minutes = excluded.total_playtime_minutes,
  votes = excluded.votes,
  kills = excluded.kills,
  deaths = excluded.deaths,
  mob_kills = excluded.mob_kills,
  blocks_broken = excluded.blocks_broken,
  blocks_placed = excluded.blocks_placed,
  is_online = excluded.is_online,
  first_joined_at = excluded.first_joined_at,
  last_seen_at = excluded.last_seen_at,
  last_synced_at = now(),
  raw_stats = excluded.raw_stats;
```

`player_key` should be the lowercase Minecraft username.

## Best Bridge Options

Option A: Paper/Spigot Plugin

- Best for direct access to server APIs.
- Can read LuckPerms, Vault, PlaceholderAPI, and player events.
- Best long-term option.

Option B: Node.js Worker + RCON

- Faster to build.
- Polls Supabase and sends commands through RCON.
- Good first bridge if your host allows RCON.

Option C: Scheduled Exporter

- Useful if your host blocks custom plugins.
- Exports stats from plugin files/database into Supabase every few minutes.

## Information Needed Before Building The Actual Bridge

Gather these:

- Server software: Paper, Spigot, Purpur, or other
- Hosting provider/panel
- Whether custom plugins are allowed
- Whether RCON is enabled
- Rank plugin, usually LuckPerms
- Economy plugin, usually Vault plus EssentialsX or similar
- Stats source, such as Plan, Minecraft statistics, or a database plugin
- Leaderboard plugin/source

## Safety Rules

- Do not expose RCON publicly.
- Do not put Supabase service role key in frontend code.
- Give the bridge only the commands it needs.
- Log every command result back into `minecraft_admin_actions`.
- Keep command-center manual actions manager/owner only.
