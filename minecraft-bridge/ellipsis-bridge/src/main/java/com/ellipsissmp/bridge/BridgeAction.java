package com.ellipsissmp.bridge;

import com.google.gson.JsonObject;

public record BridgeAction(
    String id,
    String playerKey,
    String minecraftUsername,
    String discordUsername,
    String actionType,
    JsonObject payload,
    String reason,
    boolean automated,
    String sourceOrderReference
) {
    public static BridgeAction fromJson(JsonObject json) {
        return new BridgeAction(
            getString(json, "id"),
            getString(json, "player_key"),
            getString(json, "minecraft_username"),
            getString(json, "discord_username"),
            getString(json, "action_type"),
            json.has("payload") && json.get("payload").isJsonObject()
                ? json.getAsJsonObject("payload")
                : new JsonObject(),
            getString(json, "reason"),
            json.has("automated") && !json.get("automated").isJsonNull() && json.get("automated").getAsBoolean(),
            getString(json, "source_order_reference")
        );
    }

    static String getString(JsonObject json, String key) {
        if (!json.has(key) || json.get(key).isJsonNull()) return "";
        return json.get(key).getAsString();
    }

    public String payloadString(String key) {
        return getString(payload, key);
    }
}
