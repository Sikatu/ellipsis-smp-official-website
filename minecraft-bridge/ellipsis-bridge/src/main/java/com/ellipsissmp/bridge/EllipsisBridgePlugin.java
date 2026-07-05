package com.ellipsissmp.bridge;

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

    @Override
    public void onEnable() {
        saveDefaultConfig();
        setupBridge();
        Bukkit.getPluginManager().registerEvents(this, this);
        getLogger().info("EllipsisBridge enabled.");
    }

    @Override
    public void onDisable() {
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
            return;
        }

        if (!supabase.isConfigured()) {
            getLogger().warning("Supabase service role key is missing. Bridge tasks were not started.");
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
                () -> profileSyncService.syncOnlinePlayersAsync(),
                100L,
                syncTicks
            );
        }

        getLogger().info("Bridge tasks started. Polling every "
            + getConfig().getInt("bridge.poll-actions-seconds", 5)
            + " seconds.");
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
    }

    private void pollActions() {
        if (supabase == null || actionProcessor == null || !supabase.isConfigured()) return;
        if (!polling.compareAndSet(false, true)) return;

        try {
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
                // Nothing else to do; the next poll will reveal the action state.
            }
        }
    }

    private void syncActionPlayer(BridgeAction action) {
        if (!getConfig().getBoolean("profile-sync.sync-offline-players-from-actions", true)) return;
        if (action.minecraftUsername().isBlank()) return;

        OfflinePlayer player = Bukkit.getOfflinePlayer(action.minecraftUsername());
        profileSyncService.syncPlayerAsync(player);
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
            profileSyncService.syncOnlinePlayersAsync();
            sender.sendMessage("Online player sync started.");
            return true;
        }

        sender.sendMessage("Usage: /ellipsisbridge <status|reload|poll|sync>");
        return true;
    }

    private String statusMessage() {
        boolean enabled = getConfig().getBoolean("bridge.enabled", false);
        boolean configured = supabase != null && supabase.isConfigured();
        return "EllipsisBridge status: enabled=" + enabled
            + ", configured=" + configured
            + ", actionTask=" + (actionPollTask != null)
            + ", profileTask=" + (profileSyncTask != null);
    }
}
