# EllipsisBridge Ultimate v2 Architecture

## Goal

Build one secure bridge foundation that connects the Ellipsis SMP Minecraft server, Supabase, admin website, and future player profile portal without requiring repeated Minecraft server restarts for every small upgrade.

The bridge must support:

- Owner/admin command center actions
- Player profile sync
- Secure player website account linking
- Server announcements
- Server health monitoring
- Online/offline player status
- Reward delivery
- Punishment actions
- Audit-ready action results
- Safe command execution through approved templates only

## Deployment Strategy

The live server currently has an operational bridge with:

- Heartbeat monitor
- Action queue
- Player profile sync
- Order action automation

Because players are actively online, do not deploy small bridge jars repeatedly.

Build Ultimate v2 locally, test build output, inspect jar contents, then deploy once during a planned restart window.

## Security Principles

1. Never expose the Supabase service role key to frontend code.
2. Service role key lives only inside private server plugin config or secure backend APIs.
3. Website players can only view their own private profile data.
4. Public profile data must be separate from private profile data.
5. UUIDs and internal identifiers are hidden by default.
6. Admin-only data must require approved admin role checks.
7. Bridge actions must use approved command templates only.
8. No arbitrary command execution from website users.
9. Player claim codes must expire.
10. Claim attempts must be rate-limited.
11. All command payloads must be sanitized and length-limited.
12. All bridge action results must be recorded.
13. Failed actions must not silently disappear.
14. All sensitive database tables must use RLS.
15. Website and plugin must use structured Supabase operations, not raw SQL built from user input.

## Player Profile Portal

Players should be able to log into the website and see their own server profile after linking their Minecraft account.

Profile data may include:

- Minecraft username
- UUID, hidden by default
- Current rank
- Balance
- Votes
- Playtime
- Online/offline status
- First joined
- Last seen
- Jobs stats if available
- AuraSkills stats if available
- Battle pass progress if available
- Purchase/order history
- Reward/action history

## Secure Linking Flow

1. Player logs into the website.
2. Website generates a short claim code.
3. Player joins Minecraft.
4. Player runs `/ellipsis link CODE`.
5. Bridge verifies the code against Supabase.
6. Bridge links the Supabase user ID to the real Minecraft UUID.
7. Website allows that user to view private profile data for that UUID only.

This prevents one player from claiming another player's IGN.

## Bridge Commands

Admin/console:

- /ellipsisbridge status
- /ellipsisbridge heartbeat
- /ellipsisbridge poll
- /ellipsisbridge sync
- /ellipsisbridge syncall
- /ellipsisbridge syncplayer <player>
- /ellipsisbridge reload

Player-facing:

- /ellipsis link <code>
- /ellipsis unlink
- /ellipsis profile

## Bridge Action Types

Core delivery:

- give_rank
- give_coins
- give_crate_key
- give_item
- give_kit
- manual_delivery

Announcements:

- server_broadcast
- title_broadcast
- actionbar_broadcast
- sound_broadcast

Moderation:

- jail
- unjail
- temp_ban
- unban
- kick
- mute
- unmute
- warn

Server operations:

- whitelist_add
- whitelist_remove
- maintenance_enable
- maintenance_disable

Safe command template:

- approved_command

The approved_command action must only execute command keys defined in config. It must never execute raw user-submitted commands directly.

Profile sync:

- sync_all_profiles

Unlike the other action types, sync_all_profiles does not dispatch a console command. The bridge intercepts it directly and resyncs every player who has ever joined the server (not just online ones), in throttled batches, so it can be queued safely from the website's admin Command Center or Players tab.

## Database Tables

Planned Supabase tables:

- minecraft_player_profiles
- minecraft_player_private
- minecraft_profile_claims
- minecraft_profile_links
- minecraft_profile_snapshots
- minecraft_admin_actions
- minecraft_bridge_heartbeats
- minecraft_bridge_audit_events

## Frontend Areas

Admin side:

- Command Center
- Bridge Operations Monitor
- Announcement Center
- Player Control Center
- Minecraft Action Queue
- Audit Log

Player side:

- Player login
- Claim Minecraft account
- My Profile
- My Orders
- My Rewards
- My Server Stats

## One-Restart Rule

Do not restart the live Minecraft server for every small bridge feature.

Build and test the Ultimate v2 plugin locally first. Deploy once when:

- Website build passes
- Plugin build passes
- Jar inspection confirms all new commands/actions exist
- SQL migrations are applied
- Server config is prepared
- Restart window is planned
