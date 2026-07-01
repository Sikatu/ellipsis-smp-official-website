import { useEffect, useState } from "react";

const DISCORD_GUILD_ID = "983801579880718387";
const REFRESH_INTERVAL = 60000;

type DiscordWidgetStatus = {
    loading: boolean;
    error: boolean;
    serverName: string;
    onlineMembers: number;
    inviteUrl: string;
    lastUpdated: Date | null;
};

type DiscordWidgetResponse = {
    name?: string;
    instant_invite?: string;
    presence_count?: number;
};

export function useDiscordWidget() {
    const [status, setStatus] = useState<DiscordWidgetStatus>({
        loading: true,
        error: false,
        serverName: "Ellipsis SMP",
        onlineMembers: 0,
        inviteUrl: "",
        lastUpdated: null,
    });

    useEffect(() => {
        let isMounted = true;

        async function fetchWidget() {
            try {
                const response = await fetch(
                    `https://discord.com/api/guilds/${DISCORD_GUILD_ID}/widget.json`
                );

                if (!response.ok) {
                    throw new Error("Failed to fetch Discord widget");
                }

                const data: DiscordWidgetResponse = await response.json();

                if (!isMounted) return;

                setStatus({
                    loading: false,
                    error: false,
                    serverName: data.name ?? "Ellipsis SMP",
                    onlineMembers: data.presence_count ?? 0,
                    inviteUrl: data.instant_invite ?? "",
                    lastUpdated: new Date(),
                });
            } catch {
                if (!isMounted) return;

                setStatus({
                    loading: false,
                    error: true,
                    serverName: "Ellipsis SMP",
                    onlineMembers: 0,
                    inviteUrl: "",
                    lastUpdated: new Date(),
                });
            }
        }

        fetchWidget();

        const interval = window.setInterval(fetchWidget, REFRESH_INTERVAL);

        return () => {
            isMounted = false;
            window.clearInterval(interval);
        };
    }, []);

    return status;
}