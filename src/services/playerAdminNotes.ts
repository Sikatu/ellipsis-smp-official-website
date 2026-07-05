import { supabase } from "../lib/supabase";
import type { PlayerAdminNote } from "../types/playerAdminNotes";

function getPlayerKey(minecraftUsername: string) {
  return minecraftUsername.trim().toLowerCase();
}

export async function fetchPlayerAdminNote(minecraftUsername: string): Promise<{
  data: PlayerAdminNote | null;
  error: Error | null;
}> {
  const playerKey = getPlayerKey(minecraftUsername);

  if (!playerKey) {
    return {
      data: null,
      error: new Error("Missing Minecraft username."),
    };
  }

  const { data, error } = await supabase
    .from("player_admin_notes")
    .select("*")
    .eq("player_key", playerKey)
    .maybeSingle();

  return {
    data: data as PlayerAdminNote | null,
    error: error ? new Error(error.message) : null,
  };
}

export async function savePlayerAdminNote({
  minecraftUsername,
  discordUsername,
  note,
}: {
  minecraftUsername: string;
  discordUsername: string | null;
  note: string;
}): Promise<{
  data: PlayerAdminNote | null;
  error: Error | null;
}> {
  const playerKey = getPlayerKey(minecraftUsername);

  if (!playerKey) {
    return {
      data: null,
      error: new Error("Missing Minecraft username."),
    };
  }

  const { data: userData } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("player_admin_notes")
    .upsert(
      {
        player_key: playerKey,
        minecraft_username: minecraftUsername,
        discord_username: discordUsername,
        note,
        updated_by: userData.user?.id || null,
      },
      {
        onConflict: "player_key",
      },
    )
    .select("*")
    .single();

  return {
    data: data as PlayerAdminNote | null,
    error: error ? new Error(error.message) : null,
  };
}
