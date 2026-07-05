package com.ellipsissmp.bridge;

import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;
import org.bukkit.Bukkit;
import org.bukkit.command.ConsoleCommandSender;

public class ActionProcessor {
    private final EllipsisBridgePlugin plugin;

    public ActionProcessor(EllipsisBridgePlugin plugin) {
        this.plugin = plugin;
    }

    public ActionResult process(BridgeAction action) {
        try {
            String command = buildCommand(action);
            if (command.isBlank()) {
                return ActionResult.failed("No command configured for action type " + action.actionType() + ".");
            }

            CompletableFuture<Boolean> future = new CompletableFuture<>();
            Bukkit.getScheduler().runTask(plugin, () -> {
                ConsoleCommandSender console = Bukkit.getConsoleSender();
                boolean accepted = Bukkit.dispatchCommand(console, command);
                future.complete(accepted);
            });

            boolean accepted = future.get(15, TimeUnit.SECONDS);
            if (!accepted) {
                return ActionResult.failed("Minecraft rejected command: " + command);
            }

            return ActionResult.completed("Executed: " + command);
        } catch (Exception error) {
            return ActionResult.failed(error.getMessage() == null ? "Unknown bridge error." : error.getMessage());
        }
    }

    private String buildCommand(BridgeAction action) {
        String actionType = action.actionType();

        return switch (actionType) {
            case "give_rank" -> template("commands.give-rank", action, Map.of(
                "rank", safeToken(action.payloadString("rank"))
            ));
            case "give_coins" -> template("commands.give-coins", action, Map.of(
                "amount", safeAmount(action.payloadString("amount"))
            ));
            case "jail" -> template("commands.jail", action, Map.of());
            case "unjail" -> template("commands.unjail", action, Map.of());
            case "temp_ban" -> template("commands.temp-ban", action, Map.of(
                "duration", safeToken(action.payloadString("duration")),
                "reason", safeReason(action.payloadString("reason").isBlank()
                    ? action.reason()
                    : action.payloadString("reason"))
            ));
            case "manual_delivery" -> manualDeliveryCommand(action);
            case "server_broadcast" -> serverBroadcastCommand(action);
            default -> "";
        };
    }

    private String serverBroadcastCommand(BridgeAction action) {
        return template("commands.server-broadcast", action, Map.of(
            "title", safeReason(action.payloadString("title")),
            "message", safeReason(action.payloadString("message")),
            "style", safeToken(action.payloadString("style")),
            "audience", safeToken(action.payloadString("audience"))
        ));
    }

    private String manualDeliveryCommand(BridgeAction action) {
        boolean allowCustom = plugin.getConfig().getBoolean("commands.manual-delivery-allow-custom-command", false);
        String customCommand = action.payloadString("command");

        if (allowCustom && !customCommand.isBlank()) {
            return replaceCommon(customCommand, action, Map.of(
                "deliveryType", safeReason(action.payloadString("deliveryType")),
                "productName", safeReason(action.payloadString("productName"))
            ));
        }

        return template("commands.manual-delivery-command", action, Map.of(
            "deliveryType", safeReason(action.payloadString("deliveryType")),
            "productName", safeReason(action.payloadString("productName"))
        ));
    }

    private String template(String configPath, BridgeAction action, Map<String, String> values) {
        String command = plugin.getConfig().getString(configPath, "");
        return replaceCommon(command, action, values);
    }

    private String replaceCommon(String command, BridgeAction action, Map<String, String> values) {
        String result = command
            .replace("{player}", safePlayer(action.minecraftUsername()))
            .replace("{playerKey}", safeToken(action.playerKey()))
            .replace("{reason}", safeReason(action.reason()))
            .replace("{sourceOrderReference}", safeReason(action.sourceOrderReference()));

        for (Map.Entry<String, String> entry : values.entrySet()) {
            result = result.replace("{" + entry.getKey() + "}", entry.getValue());
        }

        return result.trim();
    }

    private String safePlayer(String value) {
        return value == null ? "" : value.replaceAll("[\\r\\n\\t ]", "");
    }

    private String safeToken(String value) {
        if (value == null) return "";
        return value.replaceAll("[^A-Za-z0-9_./:-]", "");
    }

    private String safeAmount(String value) {
        if (value == null) return "0";
        String cleaned = value.replaceAll("[^0-9.]", "");
        return cleaned.isBlank() ? "0" : cleaned;
    }

    private String safeReason(String value) {
        if (value == null) return "";
        return value.replaceAll("[\\r\\n\\t]", " ").trim();
    }

    public record ActionResult(boolean success, String message) {
        public static ActionResult completed(String message) {
            return new ActionResult(true, message);
        }

        public static ActionResult failed(String message) {
            return new ActionResult(false, message);
        }
    }
}

