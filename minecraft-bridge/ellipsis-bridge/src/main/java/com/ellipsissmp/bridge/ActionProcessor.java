package com.ellipsissmp.bridge;

import java.util.HashMap;
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
        return switch (action.actionType()) {
            case "give_rank" -> template("commands.give-rank", action, values(action));
            case "give_coins" -> template("commands.give-coins", action, values(action));
            case "give_crate_key" -> template("commands.give-crate-key", action, values(action));
            case "give_item" -> template("commands.give-item", action, values(action));
            case "give_kit" -> template("commands.give-kit", action, values(action));

            case "jail" -> template("commands.jail", action, values(action));
            case "unjail" -> template("commands.unjail", action, values(action));
            case "temp_ban" -> template("commands.temp-ban", action, values(action));
            case "unban" -> template("commands.unban", action, values(action));
            case "kick" -> template("commands.kick", action, values(action));
            case "mute" -> template("commands.mute", action, values(action));
            case "unmute" -> template("commands.unmute", action, values(action));
            case "warn" -> template("commands.warn", action, values(action));

            case "whitelist_add" -> template("commands.whitelist-add", action, values(action));
            case "whitelist_remove" -> template("commands.whitelist-remove", action, values(action));
            case "maintenance_enable" -> template("commands.maintenance-enable", action, values(action));
            case "maintenance_disable" -> template("commands.maintenance-disable", action, values(action));

            case "server_broadcast" -> template("commands.server-broadcast", action, values(action));
            case "title_broadcast" -> template("commands.title-broadcast", action, values(action));
            case "actionbar_broadcast" -> template("commands.actionbar-broadcast", action, values(action));
            case "sound_broadcast" -> template("commands.sound-broadcast", action, values(action));

            case "manual_delivery" -> manualDeliveryCommand(action);
            case "approved_command" -> approvedCommand(action);

            default -> "";
        };
    }

    private String approvedCommand(BridgeAction action) {
        String commandKey = safeToken(action.payloadString("commandKey"));
        if (commandKey.isBlank()) {
            return "";
        }

        String configPath = "approved-commands." + commandKey;
        String command = plugin.getConfig().getString(configPath, "");

        if (command.isBlank()) {
            return "";
        }

        return replaceCommon(command, action, values(action));
    }

    private String manualDeliveryCommand(BridgeAction action) {
        boolean allowCustom = plugin.getConfig().getBoolean("commands.manual-delivery-allow-custom-command", false);
        String customCommand = action.payloadString("command");

        if (allowCustom && !customCommand.isBlank()) {
            return replaceCommon(customCommand, action, values(action));
        }

        return template("commands.manual-delivery-command", action, values(action));
    }

    private String template(String configPath, BridgeAction action, Map<String, String> values) {
        String command = plugin.getConfig().getString(configPath, "");
        return replaceCommon(command, action, values);
    }

    private Map<String, String> values(BridgeAction action) {
        Map<String, String> values = new HashMap<>();

        values.put("rank", safeToken(action.payloadString("rank")));
        values.put("amount", safeAmount(action.payloadString("amount")));
        values.put("crate", safeToken(action.payloadString("crate")));
        values.put("item", safeToken(action.payloadString("item")));
        values.put("kit", safeToken(action.payloadString("kit")));

        values.put("duration", safeToken(action.payloadString("duration")));
        values.put("reason", safeReason(action.payloadString("reason").isBlank()
            ? action.reason()
            : action.payloadString("reason")));

        values.put("title", safeReason(action.payloadString("title")));
        values.put("message", safeReason(action.payloadString("message")));
        values.put("style", safeToken(action.payloadString("style")));
        values.put("audience", safeToken(action.payloadString("audience")));
        values.put("sound", safeToken(action.payloadString("sound")));
        values.put("volume", safeAmount(action.payloadString("volume").isBlank() ? "1" : action.payloadString("volume")));
        values.put("pitch", safeAmount(action.payloadString("pitch").isBlank() ? "1" : action.payloadString("pitch")));

        values.put("deliveryType", safeReason(action.payloadString("deliveryType")));
        values.put("productName", safeReason(action.payloadString("productName")));
        values.put("commandKey", safeToken(action.payloadString("commandKey")));

        return values;
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