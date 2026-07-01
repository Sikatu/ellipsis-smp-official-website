import { Copy, Globe2, RefreshCw, Server, Signal, Users } from "lucide-react";
import { useState } from "react";
import { useServerStatus } from "../../hooks/useServerStatus";

const serverAddress = "ellipsismc.com:19213";

function LiveServerPanel() {
    const status = useServerStatus();
    const [copied, setCopied] = useState(false);

    function copyIp() {
        navigator.clipboard.writeText(serverAddress);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    }

    return (
        <div className="relative overflow-hidden rounded-[2rem] border border-purple-400/25 bg-white/10 p-6 shadow-[0_0_70px_rgba(168,85,247,0.28)] backdrop-blur-xl">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-purple-500 via-blue-500 to-yellow-400" />

            <div className="mb-6 flex items-center justify-between gap-4">
                <div>
                    <p className="text-sm font-bold uppercase tracking-[0.25em] text-purple-300">
                        Live Server
                    </p>
                    <h3 className="mt-2 text-3xl font-black">Ellipsis SMP</h3>
                </div>

                <div
                    className={`rounded-full px-4 py-2 text-sm font-black ${status.loading
                            ? "bg-yellow-400/10 text-yellow-300"
                            : status.online
                                ? "bg-green-400/10 text-green-300"
                                : "bg-red-500/10 text-red-300"
                        }`}
                >
                    {status.loading ? "Checking" : status.online ? "Online" : "Offline"}
                </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-blue-400/20 bg-black/30 p-4">
                    <Users className="mb-2 h-6 w-6 text-blue-300" />
                    <p className="text-2xl font-black">
                        {status.loading
                            ? "..."
                            : `${status.playersOnline} / ${status.playersMax}`}
                    </p>
                    <p className="text-xs text-gray-400">Players Online</p>
                </div>

                <div className="rounded-2xl border border-green-400/20 bg-black/30 p-4">
                    <Globe2 className="mb-2 h-6 w-6 text-green-300" />
                    <p className="text-2xl font-black">Crossplay</p>
                    <p className="text-xs text-gray-400">Java + Bedrock</p>
                </div>

                <div className="rounded-2xl border border-yellow-400/20 bg-black/30 p-4">
                    <Server className="mb-2 h-6 w-6 text-yellow-300" />
                    <p className="text-2xl font-black">{status.version}</p>
                    <p className="text-xs text-gray-400">Supported Version</p>
                </div>

                <div className="rounded-2xl border border-purple-400/20 bg-black/30 p-4">
                    <Signal className="mb-2 h-6 w-6 text-purple-300" />
                    <p className="text-2xl font-black">
                        {status.loading ? "Pinging" : status.online ? "Live" : "No Ping"}
                    </p>
                    <p className="text-xs text-gray-400">Server Connection</p>
                </div>
            </div>

            <div className="mt-4 rounded-2xl border border-purple-400/20 bg-black/30 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-purple-300">
                    Server MOTD
                </p>
                <p className="mt-2 text-sm text-gray-300">{status.motd}</p>
            </div>

            <button
                type="button"
                onClick={copyIp}
                className="mt-4 flex w-full items-center justify-between gap-3 rounded-2xl border border-purple-400/20 bg-black/30 p-4 text-left transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-purple-400/60"
            >
                <div>
                    <p className="text-xs text-gray-400">Server Address</p>
                    <p className="break-all font-black text-purple-200">
                        {copied ? "Copied!" : serverAddress}
                    </p>
                </div>
                <Copy className="h-5 w-5 text-purple-300" />
            </button>

            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-500">
                <RefreshCw className="h-3.5 w-3.5" />
                {status.lastUpdated
                    ? `Updated ${status.lastUpdated.toLocaleTimeString()}`
                    : "Auto-refreshes every 60 seconds"}
            </div>
        </div>
    );
}

export default LiveServerPanel;