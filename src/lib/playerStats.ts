export function getRelativeTime(value: string | null) {
  if (!value) return null;

  const minutes = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 60000));
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function getKillDeathRatio(kills: number | null, deaths: number | null) {
  const safeKills = kills ?? 0;
  const safeDeaths = deaths ?? 0;
  if (!safeDeaths) return safeKills;
  return Number((safeKills / safeDeaths).toFixed(2));
}

// Highest prestige first. Keep in sync with the rank images map in
// PlayerAccountPage and the rankOptions list in AdminMinecraftActionModal.
const rankHierarchy = [
  "STREAMER",
  "CREATOR",
  "ASCENDANT",
  "OVERCLOCK",
  "TITAN",
  "AETHER",
  "NEON",
  "MEMBER",
];

export function getRankWeight(rankName: string | null | undefined) {
  if (!rankName) return -1;
  const index = rankHierarchy.indexOf(rankName.trim().toUpperCase());
  return index === -1 ? -1 : rankHierarchy.length - index;
}
