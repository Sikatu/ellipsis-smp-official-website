package com.ellipsissmp.bridge;

import com.google.gson.JsonObject;
import java.time.Instant;
import java.util.List;
import java.util.concurrent.atomic.AtomicBoolean;
import org.bukkit.Bukkit;
import org.bukkit.OfflinePlayer;
import org.bukkit.command.Command;
import org.bukkit.command.CommandSender;
import org.bukkit.entity.Player;
import org.bukkit.event.EventHandler;
import org.bukkit.event.Listener;
import org.bukkit.event.player.PlayerJoinEvent;
import org.bukkit.event.player.PlayerQuitEvent;
import org.bukkit.plugin.java.JavaPlugin;
import org.bukkit.scheduler.BukkitTask;

public class EllipsisBridgePlugin extends JavaPlugin implements Listener {
    private final AtomicBoolean polling = new AtomicBoolean(false);
    private SupabaseClient supabase;
    private ActionProcessor actionProcessor;
    private ProfileSyncService profileSyncService;
    private BukkitTask actionPollTask;
    private BukkitTask profileSyncTask;
    private BukkitTask heartbeatTask;
    private Instant lastActionPollAt;
    private Instant lastProfileSyncAt;

    @Override
    public void onEnable() {
        saveDefaultConfig();
        setupBridge();
        Bukkit.getPluginManager().registerEvents(this, this);
        getLogger().info("EllipsisBridge enabled.");
    }

    @Override
    public void onDisable() {
        sendHeartbeat("Plugin disabled.");
        stopTasks();
        getLogger().info("EllipsisBridge disabled.");
    }

    private void setupBridge() {
        stopTasks();
        reloadConfig();

        supabase = new SupabaseClient(
            getLogger(),
            getConfig().getString("supabase.url", ""),
            getConfig().getString("supabase.service-role-key", ""),
            getConfig().getInt("supabase.request-timeout-seconds", 15),
            getConfig().getBoolean("bridge.log-http-errors", true)
        );
        actionProcessor = new ActionProcessor(this);
        profileSyncService = new ProfileSyncService(this, supabase);

        if (!getConfig().getBoolean("bridge.enabled", false)) {
            getLogger().warning("Bridge is disabled. Set bridge.enabled: true after adding the service role key.");
            startHeartbeatTask("Bridge disabled in config.");
            return;
        }

        if (!supabase.isConfigured()) {
            getLogger().warning("Supabase service role key is missing. Bridge tasks were not started.");
            startHeartbeatTask("Supabase is not configured.");
            return;
        }

        long pollTicks = Math.max(2, getConfig().getInt("bridge.poll-actions-seconds", 5)) * 20L;
        long syncTicks = Math.max(15, getConfig().getInt("bridge.sync-online-players-seconds", 60)) * 20L;

        actionPollTask = Bukkit.getScheduler().runTaskTimerAsynchronously(
            this,
            this::pollActions,
            20L,
            pollTicks
        );

        if (getConfig().getBoolean("profile-sync.sync-online-players", true)) {
            profileSyncTask = Bukkit.getScheduler().runTaskTimer(
                this,
                () -> {
                    lastProfileSyncAt = Instant.now();
                    profileSyncService.syncOnlinePlayersAsync();
                },
                100L,
                syncTicks
            );
        }

        startHeartbeatTask("Bridge tasks running.");

        getLogger().info("Bridge tasks started. Polling every "
            + getConfig().getInt("bridge.poll-actions-seconds", 5)
            + " seconds.");
    }

    private void startHeartbeatTask(String statusMessage) {
        if (!getConfig().getBoolean("bridge.heartbeat-enabled", true)) return;

        long heartbeatTicks = Math.max(15, getConfig().getInt("bridge.heartbeat-seconds", 30)) * 20L;

        heartbeatTask = Bukkit.getScheduler().runTaskTimer(
            this,
            () -> sendHeartbeat(statusMessage),
            40L,
            heartbeatTicks
        );
    }

    private void stopTasks() {
        if (actionPollTask != null) {
            actionPollTask.cancel();
            actionPollTask = null;
        }
        if (profileSyncTask != null) {
            profileSyncTask.cancel();
            profileSyncTask = null;
        }
        if (heartbeatTask != null) {
            heartbeatTask.cancel();
            heartbeatTask = null;
        }
    }

    private void pollActions() {
        if (supabase == null || actionProcessor == null || !supabase.isConfigured()) return;
        if (!polling.compareAndSet(false, true)) return;

        try {
            lastActionPollAt = Instant.now();
            int batchSize = getConfig().getInt("bridge.action-batch-size", 5);
            List<BridgeAction> actions = supabase.fetchQueuedActions(batchSize);

            for (BridgeAction action : actions) {
                processAction(action);
            }
        } catch (Exception error) {
            getLogger().warning("Failed to poll Supabase actions: " + error.getMessage());
        } finally {
            polling.set(false);
        }
    }

    private void processAction(BridgeAction action) {
        try {
            if (getConfig().getBoolean("bridge.mark-processing-before-execute", true)) {
                supabase.markActionProcessing(action.id());
            }

            ActionProcessor.ActionResult result = actionProcessor.process(action);
            if (result.success()) {
                supabase.markActionCompleted(action.id(), result.message());
                syncActionPlayer(action);
            } else {
                supabase.markActionFailed(action.id(), result.message());
            }
        } catch (Exception error) {
            getLogger().warning("Failed to process action " + action.id() + ": " + error.getMessage());
            try {
                supabase.markActionFailed(action.id(), error.getMessage());
            } catch (Exception ignored) {
            }
        }
    }

    private void syncActionPlayer(BridgeAction action) {
        if (!getConfig().getBoolean("profile-sync.sync-offline-players-from-actions", true)) return;
        if (action.minecraftUsername().isBlank()) return;

        OfflinePlayer player = Bukkit.getOfflinePlayer(action.minecraftUsername());
        profileSyncService.syncPlayerAsync(player);
    }

    private void sendHeartbeat(String statusMessage) {
        if (supabase == null || !supabase.isConfigured()) return;

        JsonObject heartbeat = new JsonObject();
        String now = Instant.now().toString();

        heartbeat.addProperty("server_key", getConfig().getString("bridge.server-key", "ellipsis-main"));
        heartbeat.addProperty("server_name", getConfig().getString("bridge.server-name", "Ellipsis SMP"));
        heartbeat.addProperty("plugin_version", getDescription().getVersion());
        heartbeat.addProperty("online_players", Bukkit.getOnlinePlayers().size());
        heartbeat.addProperty("max_players", Bukkit.getMaxPlayers());
        heartbeat.addProperty("bridge_enabled", getConfig().getBoolean("bridge.enabled", false));
        heartbeat.addProperty("supabase_configured", supabase.isConfigured());
        heartbeat.addProperty("action_task_running", actionPollTask != null && !actionPollTask.isCancelled());
        heartbeat.addProperty("profile_task_running", profileSyncTask != null && !profileSyncTask.isCancelled());
        heartbeat.addProperty("last_heartbeat_at", now);
        heartbeat.addProperty("updated_at", now);
        heartbeat.addProperty("status_message", statusMessage);

        if (lastActionPollAt != null) {
            heartbeat.addProperty("last_action_poll_at", lastActionPollAt.toString());
        }

        if (lastProfileSyncAt != null) {
            heartbeat.addProperty("last_profile_sync_at", lastProfileSyncAt.toString());
        }

        JsonObject metadata = new JsonObject();
        metadata.addProperty("bukkit_version", Bukkit.getBukkitVersion());
        metadata.addProperty("minecraft_version", Bukkit.getMinecraftVersion());
        metadata.addProperty("server_version", Bukkit.getVersion());
        heartbeat.add("metadata", metadata);

        Bukkit.getScheduler().runTaskAsynchronously(this, () -> {
            try {
                supabase.upsertBridgeHeartbeat(heartbeat);
            } catch (Exception error) {
                getLogger().warning("Failed to send bridge heartbeat: " + error.getMessage());
            }
        });
    }

    @EventHandler
    public void onPlayerJoin(PlayerJoinEvent event) {
        if (!getConfig().getBoolean("profile-sync.sync-on-join", true)) return;
        profileSyncService.syncPlayerAsync(event.getPlayer());
    }

    @EventHandler
    public void onPlayerQuit(PlayerQuitEvent event) {
        if (!getConfig().getBoolean("profile-sync.sync-on-quit", true)) return;
        Player player = event.getPlayer();
        Bukkit.getScheduler().runTaskLater(this, () -> profileSyncService.syncPlayerAsync(player), 20L);
    }

    @Override
    public boolean onCommand(CommandSender sender, Command command, String label, String[] args) {
        if (!command.getName().equalsIgnoreCase("ellipsisbridge")) return false;

        if (args.length == 0 || args[0].equalsIgnoreCase("status")) {
            sender.sendMessage(statusMessage());
            return true;
        }

        if (args[0].equalsIgnoreCase("reload")) {
            setupBridge();
            sender.sendMessage("EllipsisBridge reloaded.");
            return true;
        }

        if (args[0].equalsIgnoreCase("poll")) {
            Bukkit.getScheduler().runTaskAsynchronously(this, this::pollActions);
            sender.sendMessage("Queued action poll started.");
            return true;
        }

        if (args[0].equalsIgnoreCase("sync")) {
            lastProfileSyncAt = Instant.now();
            profileSyncService.syncOnlinePlayersAsync();
            sender.sendMessage("Online player sync started.");
            return true;
        }

        if (args[0].equalsIgnoreCase("heartbeat")) {
            sendHeartbeat("Manual heartbeat requested.");
            sender.sendMessage("Bridge heartbeat sent.");
            return true;
        }

        sender.sendMessage("Usage: /ellipsisbridge <status|reload|poll|sync|heartbeat>");
        return true;
    }

    private String statusMessage() {
        boolean enabled = getConfig().getBoolean("bridge.enabled", false);
        boolean configured = supabase != null && supabase.isConfigured();
        return "EllipsisBridge status: enabled=" + enabled
            + ", configured=" + configured
            + ", actionTask=" + (actionPollTask != null)
            + ", profileTask=" + (profileSyncTask != null)
            + ", heartbeatTask=" + (heartbeatTask != null);
    }
}
