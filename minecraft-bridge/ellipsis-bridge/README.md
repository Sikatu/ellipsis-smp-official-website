# EllipsisBridge

Private Paper plugin bridge for Ellipsis SMP.

This plugin connects:

`Website Admin Command Center -> Supabase -> Minecraft Server`

It reads queued `minecraft_admin_actions`, runs the matching in-game command, marks the action completed/failed, and syncs Minecraft player profile stats back into Supabase.

## Server Fit

Designed for:

- Paper 1.21.x
- Geyser/Floodgate crossplay
- LuckPerms ranks
- CMI + Vault economy
- PlaceholderAPI
- VotingPlugin, Jobs, AuraSkills, ajLeaderboards support through configurable placeholders

## Safety

Do not put the Supabase service role key in the website.

Only paste it into:

`plugins/EllipsisBridge/config.yml`

on the private Minecraft server.

## Build With Gradle

Install Gradle, then run:

```bash
gradle clean build
```

The jar will be:

```text
build/libs/EllipsisBridge.jar
```

## Build With Maven

Install Maven, then run:

```bash
mvn clean package
```

The jar will be:

```text
target/EllipsisBridge.jar
```

Upload that jar to:

```text
plugins/EllipsisBridge.jar
```

Restart the server once so it creates:

```text
plugins/EllipsisBridge/config.yml
```

## Configure

Open `plugins/EllipsisBridge/config.yml`.

Set:

```yaml
bridge:
  enabled: true

supabase:
  url: "https://jcesknevzbhgrnbuuzre.supabase.co"
  service-role-key: "YOUR_PRIVATE_SERVICE_ROLE_KEY"
```

Keep the service role key private.

## Test

Run:

```text
/ellipsisbridge status
/ellipsisbridge sync
/ellipsisbridge poll
```

Then verify the command center shows completed or failed Minecraft actions.

## Rank Fulfillment

The default rank command is:

```text
lp user {player} parent add {rank}
```

The website payload must include:

```json
{ "rank": "ascendant" }
```

## Money Fulfillment

The default money command is:

```text
cmi money give {player} {amount}
```

The website payload must include:

```json
{ "amount": 500 }
```

## Player Profile Sync

The bridge syncs:

- username
- rank
- balance
- playtime
- votes
- kills
- deaths
- mob kills
- online/offline
- first joined
- last seen
- current world/location summary
- configured PlaceholderAPI values

If a stat is missing, configure its PlaceholderAPI value in `config.yml`.
