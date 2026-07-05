package com.ellipsissmp.bridge;

import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import java.io.IOException;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.logging.Logger;

public class SupabaseClient {
    private final Gson gson = new Gson();
    private final Logger logger;
    private final String baseUrl;
    private final String serviceRoleKey;
    private final boolean logHttpErrors;
    private final HttpClient httpClient;

    public SupabaseClient(
        Logger logger,
        String baseUrl,
        String serviceRoleKey,
        int timeoutSeconds,
        boolean logHttpErrors
    ) {
        this.logger = logger;
        this.baseUrl = trimTrailingSlash(baseUrl);
        this.serviceRoleKey = serviceRoleKey == null ? "" : serviceRoleKey.trim();
        this.logHttpErrors = logHttpErrors;
        this.httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(Math.max(5, timeoutSeconds)))
            .build();
    }

    public boolean isConfigured() {
        return !baseUrl.isBlank()
            && !serviceRoleKey.isBlank()
            && !serviceRoleKey.equalsIgnoreCase("PASTE_SUPABASE_SERVICE_ROLE_KEY_HERE");
    }

    public List<BridgeAction> fetchQueuedActions(int limit) throws IOException, InterruptedException {
        String path = "/rest/v1/minecraft_admin_actions"
            + "?select=*"
            + "&status=eq.queued"
            + "&order=created_at.asc"
            + "&limit=" + Math.max(1, limit);

        HttpResponse<String> response = send("GET", path, null, "return=representation");
        if (!isOk(response.statusCode())) {
            logError("fetch queued actions", response);
            return List.of();
        }

        JsonArray array = gson.fromJson(response.body(), JsonArray.class);
        List<BridgeAction> actions = new ArrayList<>();
        if (array == null) return actions;

        array.forEach(item -> {
            if (item.isJsonObject()) actions.add(BridgeAction.fromJson(item.getAsJsonObject()));
        });

        return actions;
    }

    public void markActionProcessing(String actionId) throws IOException, InterruptedException {
        JsonObject updates = new JsonObject();
        updates.addProperty("status", "processing");
        updates.addProperty("result_message", "Bridge picked up action.");
        patchAction(actionId, updates);
    }

    public void markActionCompleted(String actionId, String message) throws IOException, InterruptedException {
        JsonObject updates = new JsonObject();
        updates.addProperty("status", "completed");
        updates.addProperty("result_message", message);
        updates.addProperty("processed_at", Instant.now().toString());
        patchAction(actionId, updates);
    }

    public void markActionFailed(String actionId, String message) throws IOException, InterruptedException {
        JsonObject updates = new JsonObject();
        updates.addProperty("status", "failed");
        updates.addProperty("result_message", message);
        updates.addProperty("processed_at", Instant.now().toString());
        patchAction(actionId, updates);
    }

    public void upsertPlayerProfile(JsonObject profile) throws IOException, InterruptedException {
        HttpResponse<String> response = send(
            "POST",
            "/rest/v1/minecraft_player_profiles?on_conflict=player_key",
            gson.toJson(profile),
            "resolution=merge-duplicates,return=minimal"
        );

        if (!isOk(response.statusCode())) {
            logError("upsert player profile", response);
        }
    }

    public void upsertBridgeHeartbeat(JsonObject heartbeat) throws IOException, InterruptedException {
        HttpResponse<String> response = send(
            "POST",
            "/rest/v1/minecraft_bridge_heartbeats?on_conflict=server_key",
            gson.toJson(heartbeat),
            "resolution=merge-duplicates,return=minimal"
        );

        if (!isOk(response.statusCode())) {
            logError("upsert bridge heartbeat", response);
        }
    }


    public ClaimLinkResult completeMinecraftProfileClaim(
        String claimCode,
        String playerKey,
        String minecraftUuid,
        String minecraftUsername
    ) throws IOException, InterruptedException {
        JsonObject payload = new JsonObject();
        payload.addProperty("p_claim_code", claimCode);
        payload.addProperty("p_player_key", playerKey);
        payload.addProperty("p_minecraft_uuid", minecraftUuid);
        payload.addProperty("p_minecraft_username", minecraftUsername);

        HttpResponse<String> response = send(
            "POST",
            "/rest/v1/rpc/complete_minecraft_profile_claim",
            gson.toJson(payload),
            "return=representation"
        );

        if (!isOk(response.statusCode())) {
            logError("complete profile claim", response);
            return new ClaimLinkResult(false, "Website link failed: HTTP " + response.statusCode(), "", "");
        }

        JsonArray array = gson.fromJson(response.body(), JsonArray.class);
        if (array == null || array.size() == 0 || !array.get(0).isJsonObject()) {
            return new ClaimLinkResult(false, "Website link failed: no result returned.", "", "");
        }

        JsonObject result = array.get(0).getAsJsonObject();

        return new ClaimLinkResult(
            jsonBoolean(result, "success"),
            jsonString(result, "message", "Website link completed."),
            jsonString(result, "linked_player_key", playerKey),
            jsonString(result, "linked_minecraft_username", minecraftUsername)
        );
    }

    private static String jsonString(JsonObject object, String key, String fallback) {
        if (object == null || !object.has(key) || object.get(key).isJsonNull()) return fallback;
        return object.get(key).getAsString();
    }

    private static boolean jsonBoolean(JsonObject object, String key) {
        return object != null && object.has(key) && !object.get(key).isJsonNull() && object.get(key).getAsBoolean();
    }

    public record ClaimLinkResult(
        boolean success,
        String message,
        String playerKey,
        String minecraftUsername
    ) {
    }
    private void patchAction(String actionId, JsonObject updates) throws IOException, InterruptedException {
        String encodedId = URLEncoder.encode(actionId, StandardCharsets.UTF_8);
        HttpResponse<String> response = send(
            "PATCH",
            "/rest/v1/minecraft_admin_actions?id=eq." + encodedId,
            gson.toJson(updates),
            "return=minimal"
        );

        if (!isOk(response.statusCode())) {
            logError("patch action " + actionId, response);
        }
    }

    private HttpResponse<String> send(
        String method,
        String path,
        String body,
        String prefer
    ) throws IOException, InterruptedException {
        HttpRequest.Builder builder = HttpRequest.newBuilder()
            .uri(URI.create(baseUrl + path))
            .timeout(Duration.ofSeconds(20))
            .header("apikey", serviceRoleKey)
            .header("Authorization", "Bearer " + serviceRoleKey)
            .header("Accept", "application/json")
            .header("Prefer", prefer);

        if (body == null) {
            builder.method(method, HttpRequest.BodyPublishers.noBody());
        } else {
            builder.header("Content-Type", "application/json")
                .method(method, HttpRequest.BodyPublishers.ofString(body));
        }

        return httpClient.send(builder.build(), HttpResponse.BodyHandlers.ofString());
    }

    private boolean isOk(int statusCode) {
        return statusCode >= 200 && statusCode < 300;
    }

    private void logError(String operation, HttpResponse<String> response) {
        if (!logHttpErrors) return;
        logger.warning("Supabase " + operation + " failed: HTTP "
            + response.statusCode() + " " + response.body());
    }

    private static String trimTrailingSlash(String value) {
        if (value == null) return "";
        return value.endsWith("/") ? value.substring(0, value.length() - 1) : value;
    }
}
