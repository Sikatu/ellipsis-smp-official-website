package com.ellipsissmp.bridge;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import org.bukkit.Bukkit;
import org.bukkit.command.ConsoleCommandSender;
import org.bukkit.configuration.ConfigurationSection;

public class ActionProcessor {
    private static final Pattern UNRESOLVED_PLACEHOLDER = Pattern.compile("\\{[A-Za-z0-9_-]+\\}");

    private final EllipsisBridgePlugin plugin;

    public ActionProcessor(EllipsisBridgePlugin plugin) {
        this.plugin = plugin;
    }

    public ActionResult process(BridgeAction action) {
        try {
            CommandBuildResult buildResult = buildCommand(action);

            if (!buildResult.success()) {
                return ActionResult.failed(buildResult.message());
            }

            String command = buildResult.command();

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

    private CommandBuildResult buildCommand(BridgeAction action) {
        String actionType = action.actionType();

        return switch (actionType) {
            case "give_rank" -> commandFromTemplate("commands.give-rank", action, Map.of(
                "rank", safeToken(action.payloadString("rank"))
            ));
            case "give_coins" -> commandFromTemplate("commands.give-coins", action, Map.of(
                "amount", safeAmount(action.payloadString("amount"))
            ));
            case "give_crate_key" -> commandFromTemplate("commands.give-crate-key", action, Map.of(
                "crate", safeToken(action.payloadString("crate")),
                "amount", safeAmount(action.payloadString("amount"))
            ));
            case "give_item" -> commandFromTemplate("commands.give-item", action, Map.of(
                "item", safeToken(action.payloadString("item")),
                "amount", safeAmount(action.payloadString("amount"))
            ));
            case "give_kit" -> commandFromTemplate("commands.give-kit", action, Map.of(
                "kit", safeToken(action.payloadString("kit"))
            ));
            case "jail" -> commandFromTemplate("commands.jail", action, Map.of());
            case "unjail" -> commandFromTemplate("commands.unjail", action, Map.of());
            case "temp_ban" -> commandFromTemplate("commands.temp-ban", action, Map.of(
                "duration", safeToken(action.payloadString("duration")),
                "reason", safeText(action.payloadString("reason").isBlank()
                    ? action.reason()
                    : action.payloadString("reason"))
            ));
            case "unban" -> commandFromTemplate("commands.unban", action, Map.of());
            case "kick" -> commandFromTemplate("commands.kick", action, Map.of(
                "reason", safeText(action.payloadString("reason").isBlank()
                    ? action.reason()
                    : action.payloadString("reason"))
            ));
            case "mute" -> commandFromTemplate("commands.mute", action, Map.of(
                "duration", safeToken(action.payloadString("duration")),
                "reason", safeText(action.payloadString("reason").isBlank()
                    ? action.reason()
                    : action.payloadString("reason"))
            ));
            case "unmute" -> commandFromTemplate("commands.unmute", action, Map.of());
            case "warn" -> commandFromTemplate("commands.warn", action, Map.of(
                "reason", safeText(action.payloadString("reason").isBlank()
                    ? action.reason()
                    : action.payloadString("reason"))
            ));
            case "whitelist_add" -> commandFromTemplate("commands.whitelist-add", action, Map.of());
            case "whitelist_remove" -> commandFromTemplate("commands.whitelist-remove", action, Map.of());
            case "maintenance_enable" -> commandFromTemplate("commands.maintenance-enable", action, Map.of(
                "reason", safeText(action.payloadString("reason").isBlank()
                    ? action.reason()
                    : action.payloadString("reason"))
            ));
            case "maintenance_disable" -> commandFromTemplate("commands.maintenance-disable", action, Map.of());
            case "server_broadcast" -> commandFromTemplate("commands.server-broadcast", action, Map.of(
                "message", safeText(action.payloadString("message"))
            ));
            case "title_broadcast" -> commandFromTemplate("commands.title-broadcast", action, Map.of(
                "title", safeText(action.payloadString("title")),
                "subtitle", safeText(action.payloadString("subtitle"))
            ));
            case "actionbar_broadcast" -> commandFromTemplate("commands.actionbar-broadcast", action, Map.of(
                "message", safeText(action.payloadString("message"))
            ));
            case "sound_broadcast" -> commandFromTemplate("commands.sound-broadcast", action, Map.of(
                "sound", safeToken(action.payloadString("sound")),
                "volume", safeDecimal(action.payloadString("volume"), "1"),
                "pitch", safeDecimal(action.payloadString("pitch"), "1")
            ));
            case "approved_command" -> approvedCommand(action);
            case "manual_delivery" -> manualDeliveryCommand(action);
            default -> CommandBuildResult.failed("No command configured for action type " + actionType + ".");
        };
    }

    private CommandBuildResult approvedCommand(BridgeAction action) {
        String commandKey = firstPresent(
            action.payloadString("commandKey"),
            action.payloadString("key"),
            action.payloadString("command")
        );

        commandKey = safeCommandKey(commandKey);

        if (commandKey.isBlank()) {
            return CommandBuildResult.failed("Missing approved command key.");
        }

        ConfigurationSection section = plugin.getConfig().getConfigurationSection("approved-commands." + commandKey);

        if (section == null) {
            return CommandBuildResult.failed("Approved command key not found: " + commandKey);
        }

        if (!section.getBoolean("enabled", true)) {
            return CommandBuildResult.failed("Approved command is disabled: " + commandKey);
        }

        if (section.getBoolean("requires-player", true) && safePlayer(action.minecraftUsername()).isBlank()) {
            return CommandBuildResult.failed("Approved command requires a Minecraft username.");
        }

        String template = section.getString("command", "");
        if (template.isBlank()) {
            return CommandBuildResult.failed("Approved command has no command template: " + commandKey);
        }

        Map<String, String> values = new HashMap<>();

        ConfigurationSection params = section.getConfigurationSection("params");
        if (params != null) {
            for (String key : params.getKeys(false)) {
                String type = params.getString(key, "token");
                values.put(key, sanitizeByType(action.payloadString(key), type));
            }
        }

        String command = replaceCommon(template, action, values);
        return finalizeCommand(command, "approved command " + commandKey);
    }

    private CommandBuildResult manualDeliveryCommand(BridgeAction action) {
        boolean allowCustom = plugin.getConfig().getBoolean("commands.manual-delivery-allow-custom-command", false);
        String customCommand = action.payloadString("command");

        if (allowCustom && !customCommand.isBlank()) {
            String command = replaceCommon(customCommand, action, Map.of(
                "deliveryType", safeText(action.payloadString("deliveryType")),
                "productName", safeText(action.payloadString("productName"))
            ));

            return finalizeCommand(command, "manual delivery custom command");
        }

        return commandFromTemplate("commands.manual-delivery-command", action, Map.of(
            "deliveryType", safeText(action.payloadString("deliveryType")),
            "productName", safeText(action.payloadString("productName"))
        ));
    }

    private CommandBuildResult commandFromTemplate(String configPath, BridgeAction action, Map<String, String> values) {
        String template = plugin.getConfig().getString(configPath, "");
        String command = replaceCommon(template, action, values);
        return finalizeCommand(command, configPath);
    }

    private CommandBuildResult finalizeCommand(String command, String source) {
        String cleaned = normalizeCommand(command);

        if (cleaned.isBlank()) {
            return CommandBuildResult.failed("Blank command from " + source + ".");
        }

        Matcher matcher = UNRESOLVED_PLACEHOLDER.matcher(cleaned);
        if (matcher.find()) {
            return CommandBuildResult.failed("Unresolved placeholder " + matcher.group() + " in " + source + ".");
        }

        String blockedReason = blockedReason(cleaned);
        if (!blockedReason.isBlank()) {
            return CommandBuildResult.failed(blockedReason);
        }

        return CommandBuildResult.completed(cleaned);
    }

    private String replaceCommon(String command, BridgeAction action, Map<String, String> values) {
        String result = command == null ? "" : command;

        result = result
            .replace("{player}", safePlayer(action.minecraftUsername()))
            .replace("{playerKey}", safeToken(action.playerKey()))
            .replace("{reason}", safeText(action.reason()))
            .replace("{sourceOrderReference}", safeText(action.sourceOrderReference()));

        for (Map.Entry<String, String> entry : values.entrySet()) {
            result = result.replace("{" + entry.getKey() + "}", entry.getValue());
        }

        return result.trim();
    }

    private String sanitizeByType(String value, String type) {
        String normalizedType = type == null ? "token" : type.trim().toLowerCase();

        return switch (normalizedType) {
            case "player" -> safePlayer(value);
            case "amount", "number", "integer" -> safeAmount(value);
            case "decimal" -> safeDecimal(value, "0");
            case "text", "message", "reason" -> safeText(value);
            case "duration", "token", "id", "key", "world", "rank", "crate", "kit", "item", "permission" -> safeToken(value);
            default -> safeToken(value);
        };
    }

    private String normalizeCommand(String value) {
        if (value == null) return "";

        String cleaned = value
            .replace("\r", " ")
            .replace("\n", " ")
            .replace("\t", " ")
            .trim();

        while (cleaned.startsWith("/")) {
            cleaned = cleaned.substring(1).trim();
        }

        return cleaned.replaceAll(" +", " ");
    }

    private String blockedReason(String command) {
        String lower = command.toLowerCase();

        if (lower.contains(";") || lower.contains("&&") || lower.contains("||")) {
            return "Blocked unsafe command chaining.";
        }

        if (lower.equals("stop") || lower.startsWith("stop ")) {
            return "Blocked server stop command.";
        }

        if (lower.equals("restart") || lower.startsWith("restart ")) {
            return "Blocked server restart command.";
        }

        if (lower.equals("reload") || lower.startsWith("reload ") || lower.startsWith("minecraft:reload")) {
            return "Blocked server reload command.";
        }

        if (lower.equals("op") || lower.startsWith("op ") || lower.startsWith("minecraft:op ")) {
            return "Blocked OP command.";
        }

        if (lower.equals("deop") || lower.startsWith("deop ") || lower.startsWith("minecraft:deop ")) {
            return "Blocked DEOP command.";
        }

        if (lower.contains("@a") || lower.contains("@e") || lower.contains("@r")) {
            return "Blocked broad selector command.";
        }

        return "";
    }

    private String safePlayer(String value) {
        if (value == null) return "";
        return value.replaceAll("[^A-Za-z0-9_]", "");
    }

    private String safeCommandKey(String value) {
        if (value == null) return "";
        return value.replaceAll("[^A-Za-z0-9_.-]", "");
    }

    private String safeToken(String value) {
        if (value == null) return "";
        return value.replaceAll("[^A-Za-z0-9_./:-]", "");
    }

    private String safeAmount(String value) {
        if (value == null) return "0";
        String cleaned = value.replaceAll("[^0-9]", "");
        return cleaned.isBlank() ? "0" : cleaned;
    }

    private String safeDecimal(String value, String fallback) {
        if (value == null) return fallback;
        String cleaned = value.replaceAll("[^0-9.]", "");
        return cleaned.isBlank() ? fallback : cleaned;
    }

    private String safeText(String value) {
        if (value == null) return "";
        return value
            .replace("\r", " ")
            .replace("\n", " ")
            .replace("\t", " ")
            .replaceAll("[;|&]", "")
            .trim();
    }

    private String firstPresent(String... values) {
        for (String value : values) {
            if (value != null && !value.isBlank()) return value;
        }

        return "";
    }

    public record ActionResult(boolean success, String message) {
        public static ActionResult completed(String message) {
            return new ActionResult(true, message);
        }

        public static ActionResult failed(String message) {
            return new ActionResult(false, message);
        }
    }

    private record CommandBuildResult(boolean success, String command, String message) {
        static CommandBuildResult completed(String command) {
            return new CommandBuildResult(true, command, "");
        }

        static CommandBuildResult failed(String message) {
            return new CommandBuildResult(false, "", message);
        }
    }
}