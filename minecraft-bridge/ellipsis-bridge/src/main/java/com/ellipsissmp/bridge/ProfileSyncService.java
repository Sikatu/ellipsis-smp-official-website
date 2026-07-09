package com.ellipsissmp.bridge;

import com.google.gson.JsonObject;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
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

    public int syncAllPlayersAsync() {
        if (!plugin.getConfig().getBoolean("profile-sync.enabled", true)) return 0;

        OfflinePlayer[] allPlayers = Bukkit.getOfflinePlayers();
        int batchSize = Math.max(1, plugin.getConfig().getInt("profile-sync.full-sync-batch-size", 15));
        long batchDelayTicks = Math.max(1, plugin.getConfig().getInt("profile-sync.full-sync-batch-delay-ticks", 20));

        for (int index = 0; index < allPlayers.length; index += batchSize) {
            int start = index;
            int end = Math.min(allPlayers.length, index + batchSize);
            long delay = (long) (index / batchSize) * batchDelayTicks;

            Bukkit.getScheduler().runTaskLater(plugin, () -> {
                for (int playerIndex = start; playerIndex < end; playerIndex++) {
                    syncPlayerAsync(allPlayers[playerIndex]);
                }
            }, delay);
        }

        return allPlayers.length;
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


    public List<String> diagnosePlayer(OfflinePlayer player) {
        List<String> lines = new ArrayList<>();

        if (player == null) {
            lines.add("Profile Diagnose: target player not found.");
            return lines;
        }

        String username = player.getName() == null ? player.getUniqueId().toString() : player.getName();
        Player onlinePlayer = player.getPlayer();

        String rankPlaceholder = plugin.getConfig().getString("profile-sync.placeholders.current-rank", "");
        String balancePlaceholder = plugin.getConfig().getString("profile-sync.placeholders.balance", "");
        String votesPlaceholder = plugin.getConfig().getString("profile-sync.placeholders.votes", "");
        String jobsPlaceholder = plugin.getConfig().getString("profile-sync.placeholders.jobs-level", "");
        String auraPlaceholder = plugin.getConfig().getString("profile-sync.placeholders.auraskills-power", "");

        String rankValue = readPlaceholder(player, "profile-sync.placeholders.current-rank");
        String balanceValue = readPlaceholder(player, "profile-sync.placeholders.balance");
        String votesValue = readPlaceholder(player, "profile-sync.placeholders.votes");
        String jobsValue = readPlaceholder(player, "profile-sync.placeholders.jobs-level");
        String auraValue = readPlaceholder(player, "profile-sync.placeholders.auraskills-power");

        JsonObject profile = buildProfile(player);

        lines.add("Profile Diagnose: " + username);
        lines.add("UUID: " + player.getUniqueId());
        lines.add("Online: " + (onlinePlayer != null && onlinePlayer.isOnline()));
        lines.add("Supabase: " + (supabase.isConfigured() ? "configured" : "not configured"));
        lines.add("Rank: " + diagnosePlaceholder(rankPlaceholder, rankValue));
        lines.add("Balance: " + diagnosePlaceholder(balancePlaceholder, balanceValue)
            + " | parsed=" + profile.get("balance").getAsDouble());
        lines.add("Playtime: " + profile.get("total_playtime_minutes").getAsInt()
            + " minutes from Bukkit statistic");
        lines.add("Votes: " + diagnosePlaceholder(votesPlaceholder, votesValue)
            + " | parsed=" + profile.get("votes").getAsInt());
        lines.add("Jobs Level: " + diagnosePlaceholder(jobsPlaceholder, jobsValue));
        lines.add("AuraSkills Power: " + diagnosePlaceholder(auraPlaceholder, auraValue));
        lines.add("Kills/Deaths: " + profile.get("kills").getAsInt()
            + "/" + profile.get("deaths").getAsInt());

        if (onlinePlayer != null) {
            lines.add("World: " + onlinePlayer.getWorld().getName());
            lines.add("Location: " + locationSummary(onlinePlayer.getLocation()));
        }

        lines.add("Profile upload: queued after diagnose.");

        return lines;
    }

    private String diagnosePlaceholder(String placeholder, String value) {
        if (placeholder == null || placeholder.isBlank()) {
            return "not configured";
        }

        if (value == null || value.isBlank()) {
            return placeholder + " => blank";
        }

        if (value.equals(placeholder)) {
            return placeholder + " => unresolved";
        }

        return placeholder + " => " + value;
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
