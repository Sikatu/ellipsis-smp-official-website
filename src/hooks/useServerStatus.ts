import { useEffect, useState } from "react";

const SERVER_IP = "play.ellipsissmp.com";
const SERVER_PORT = "19213";
const REFRESH_INTERVAL = 60000;

type ServerStatus = {
    online: boolean;
    playersOnline: number;
    playersMax: number;
    version: string;
    motd: string;
    loading: boolean;
    error: boolean;
    lastUpdated: Date | null;
};

type McSrvStatResponse = {
    online?: boolean;
    players?: {
        online?: number;
        max?: number;
    };
    version?: string;
    motd?: {
        clean?: string[];
    };
};

export function useServerStatus() {
    const [status, setStatus] = useState<ServerStatus>({
        online: false,
        playersOnline: 0,
        playersMax: 0,
        version: "Checking...",
        motd: "Loading server status...",
        loading: true,
        error: false,
        lastUpdated: null,
    });

    useEffect(() => {
        let isMounted = true;

        async function fetchStatus() {
            try {
                const response = await fetch(
                    `https://api.mcsrvstat.us/3/${SERVER_IP}:${SERVER_PORT}`
                );

                if (!response.ok) {
                    throw new Error("Failed to fetch server status");
                }

                const data: McSrvStatResponse = await response.json();

                if (!isMounted) return;

                setStatus({
                    online: Boolean(data.online),
                    playersOnline: data.players?.online ?? 0,
                    playersMax: data.players?.max ?? 0,
                    version: data.version ?? "1.21.x",
                    motd:
                        data.motd?.clean?.filter(Boolean).join(" ") ||
                        "Crossplay survival, cosmetics, ranks, crates, furniture, plushies, and community events.",
                    loading: false,
                    error: false,
                    lastUpdated: new Date(),
                });
            } catch {
                if (!isMounted) return;

                setStatus({
                    online: false,
                    playersOnline: 0,
                    playersMax: 0,
                    version: "Unavailable",
                    motd: "Server status is temporarily unavailable.",
                    loading: false,
                    error: true,
                    lastUpdated: new Date(),
                });
            }
        }

        fetchStatus();

        const interval = window.setInterval(fetchStatus, REFRESH_INTERVAL);

        return () => {
            isMounted = false;
            window.clearInterval(interval);
        };
    }, []);

    return status;
}