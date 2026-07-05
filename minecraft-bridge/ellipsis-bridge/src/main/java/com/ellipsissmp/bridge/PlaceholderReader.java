package com.ellipsissmp.bridge;

import java.lang.reflect.Method;
import org.bukkit.Bukkit;
import org.bukkit.OfflinePlayer;

public class PlaceholderReader {
    private Method setPlaceholdersMethod;
    private boolean initialized;

    public String read(OfflinePlayer player, String placeholder) {
        if (placeholder == null || placeholder.isBlank()) return "";
        if (!Bukkit.getPluginManager().isPluginEnabled("PlaceholderAPI")) return "";

        try {
            Method method = method();
            if (method == null) return "";
            Object value = method.invoke(null, player, placeholder);
            return value == null ? "" : String.valueOf(value);
        } catch (Exception ignored) {
            return "";
        }
    }

    private Method method() {
        if (initialized) return setPlaceholdersMethod;
        initialized = true;

        try {
            Class<?> placeholderApi = Class.forName("me.clip.placeholderapi.PlaceholderAPI");
            setPlaceholdersMethod = placeholderApi.getMethod(
                "setPlaceholders",
                OfflinePlayer.class,
                String.class
            );
        } catch (Exception ignored) {
            setPlaceholdersMethod = null;
        }

        return setPlaceholdersMethod;
    }
}
