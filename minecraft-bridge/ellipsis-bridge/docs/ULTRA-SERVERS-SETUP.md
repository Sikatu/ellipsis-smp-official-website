# Ultra Servers Setup

## 1. Build The Jar

Recommended Gradle build:

```bash
cd minecraft-bridge/ellipsis-bridge
gradle clean build
```

Use:

```text
build/libs/EllipsisBridge.jar
```

Maven build also works:

```bash
cd minecraft-bridge/ellipsis-bridge
mvn clean package
```

Use:

```text
target/EllipsisBridge.jar
```

## 2. Upload To Ultra Servers

In the Ultra Servers file manager:

1. Open the server files.
2. Open `plugins`.
3. Upload `EllipsisBridge.jar`.
4. Restart the server.

## 3. Configure

After restart, open:

```text
plugins/EllipsisBridge/config.yml
```

Set:

```yaml
bridge:
  enabled: true

supabase:
  service-role-key: "PASTE_PRIVATE_SERVICE_ROLE_KEY"
```

Do not share this key.

## 4. Restart Again

Restart the server after saving the config.

## 5. Test Commands

In console or in-game as OP:

```text
/ellipsisbridge status
/ellipsisbridge sync
/ellipsisbridge poll
```

## 6. Test Website Flow

1. Create a test order on the website.
2. Open `/admin`.
3. Verify the payment.
4. Check Minecraft action queue.
5. The bridge should pick up the queued action and run the configured command.

## Recommended First Test

Create a manual command center action:

```text
Give Coins
Player: your test account
Amount: 1
```

If this succeeds, test a rank.

## If It Fails

Check:

- Is `bridge.enabled` set to `true`?
- Is the service role key correct?
- Did Supabase SQL `admin-9-player-profile-system.sql` run successfully?
- Does the server console show a Supabase HTTP error?
- Does the command work if you run it manually in console?
