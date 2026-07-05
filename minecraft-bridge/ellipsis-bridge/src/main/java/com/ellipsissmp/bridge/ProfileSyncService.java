package com.ellipsissmp.bridge;

import com.google.gson.JsonObject;
import java.time.Instant;
import java.util.Locale;
import org.bukkit.Bukkit;
import org.bukkit.configuration.ConfigurationSection;
import org.bukkit.Location;
import org.bukkit.OfflinePlayer;
import org.bukkit.Statistic;
import org.bukkit.entity.Player;

public class ProfileSyncService {
    private final EllipsisBridgePlugin plugin;
    private final SupabaseClient supabase;
    private final PlaceholderReader placeholders = new PlaceholderReader();

    public ProfileSyncService(EllipsisBridgePlugin plugin, SupabaseClient supabase) {
        this.plugin = plugin;
        this.supabase = supabase;
    }

    public void syncOnlinePlayersAsync() {
        if (!plugin.getConfig().getBoolean("profile-sync.enabled", true)) return;

        for (Player player : Bukkit.getOnlinePlayers()) {
            syncPlayerAsync(player);
        }
    }

    public void syncPlayerAsync(OfflinePlayer player) {
        if (!plugin.getConfig().getBoolean("profile-sync.enabled", true)) return;
        Bukkit.getScheduler().runTask(plugin, () -> {
            JsonObject profile = buildProfile(player);
            Bukkit.getScheduler().runTaskAsynchronously(plugin, () -> upsertProfile(player, profile));
        });
    }

    private void upsertProfile(OfflinePlayer player, JsonObject profile) {
        if (!supabase.isConfigured() || player == null || player.getName() == null) return;

        try {
            supabase.upsertPlayerProfile(profile);
        } catch (Exception error) {
            plugin.getLogger().warning("Failed to sync profile for "
                + player.getName() + ": " + error.getMessage());
        }
    }

    private JsonObject buildProfile(OfflinePlayer offlinePlayer) {
        String username = offlinePlayer.getName() == null ? offlinePlayer.getUniqueId().toString() : offlinePlayer.getName();
        Player onlinePlayer = offlinePlayer.getPlayer();

        JsonObject profile = new JsonObject();
        profile.addProperty("player_key", username.toLowerCase(Locale.ROOT));
        profile.addProperty("minecraft_username", username);
        profile.addProperty("current_rank", valueOrDefault(
            readPlaceholder(offlinePlayer, "profile-sync.placeholders.current-rank"),
            "Member"
        ));
        profile.addProperty("leaderboard_position", parseInteger(readPlaceholder(offlinePlayer, "profile-sync.placeholders.leaderboard-position")));
        profile.addProperty("leaderboard_score", parseDouble(readPlaceholder(offlinePlayer, "profile-sync.placeholders.leaderboard-score")));
        profile.addProperty("balance", parseDouble(readPlaceholder(offlinePlayer, "profile-sync.placeholders.balance")));
        profile.addProperty("total_playtime_minutes", getPlaytimeMinutes(offlinePlayer));
        profile.addProperty("votes", parseInteger(readPlaceholder(offlinePlayer, "profile-sync.placeholders.votes")));
        profile.addProperty("kills", getStatistic(offlinePlayer, Statistic.PLAYER_KILLS));
        profile.addProperty("deaths", getStatistic(offlinePlayer, Statistic.DEATHS));
        profile.addProperty("mob_kills", getStatistic(offlinePlayer, Statistic.MOB_KILLS));
        profile.addProperty("blocks_broken", 0);
        profile.addProperty("blocks_placed", 0);
        profile.addProperty("is_online", onlinePlayer != null && onlinePlayer.isOnline());
        profile.addProperty("last_synced_at", Instant.now().toString());

        if (offlinePlayer.getFirstPlayed() > 0) {
            profile.addProperty("first_joined_at", Instant.ofEpochMilli(offlinePlayer.getFirstPlayed()).toString());
        }

        if (offlinePlayer.getLastPlayed() > 0) {
            profile.addProperty("last_seen_at", Instant.ofEpochMilli(offlinePlayer.getLastPlayed()).toString());
        }

        if (onlinePlayer != null) {
            profile.addProperty("active_world", onlinePlayer.getWorld().getName());
            profile.addProperty("location_summary", locationSummary(onlinePlayer.getLocation()));
        }

        JsonObject rawStats = new JsonObject();
        ConfigurationSection rawPlaceholderSection = plugin.getConfig()
            .getConfigurationSection("profile-sync.raw-placeholders");
        if (rawPlaceholderSection != null) {
            for (String key : rawPlaceholderSection.getKeys(false)) {
                String configPath = "profile-sync.raw-placeholders." + key;
                String value = readPlaceholder(offlinePlayer, configPath);
                if (!value.isBlank()) rawStats.addProperty(key, value);
            }
        }

        JsonObject progression = new JsonObject();
        progression.addProperty("jobs_level", readPlaceholder(offlinePlayer, "profile-sync.placeholders.jobs-level"));
        progression.addProperty("auraskills_power", readPlaceholder(offlinePlayer, "profile-sync.placeholders.auraskills-power"));

        profile.add("raw_stats", rawStats);
        profile.add("progression", progression);

        return profile;
    }

    private String readPlaceholder(OfflinePlayer player, String configPath) {
        String placeholder = plugin.getConfig().getString(configPath, "");
        return placeholders.read(player, placeholder);
    }

    private String valueOrDefault(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value;
    }

    private int getPlaytimeMinutes(OfflinePlayer player) {
        int ticks = getStatistic(player, Statistic.PLAY_ONE_MINUTE);
        return Math.max(0, ticks / 20 / 60);
    }

    private int getStatistic(OfflinePlayer player, Statistic statistic) {
        try {
            return player.getStatistic(statistic);
        } catch (Exception ignored) {
            return 0;
        }
    }

    private int parseInteger(String value) {
        try {
            String cleaned = cleanNumber(value);
            if (cleaned.isBlank()) return 0;
            return (int) Math.round(Double.parseDouble(cleaned));
        } catch (Exception ignored) {
            return 0;
        }
    }

    private double parseDouble(String value) {
        try {
            String cleaned = cleanNumber(value);
            if (cleaned.isBlank()) return 0;
            return Double.parseDouble(cleaned);
        } catch (Exception ignored) {
            return 0;
        }
    }

    private String cleanNumber(String value) {
        if (value == null) return "";
        return value.replaceAll("[^0-9.\\-]", "");
    }

    private String locationSummary(Location location) {
        return location.getWorld().getName()
            + " "
            + location.getBlockX()
            + ", "
            + location.getBlockY()
            + ", "
            + location.getBlockZ();
    }
}
