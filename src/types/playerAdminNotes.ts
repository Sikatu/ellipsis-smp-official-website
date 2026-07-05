export type PlayerAdminNote = {
  id: string;
  player_key: string;
  minecraft_username: string;
  discord_username: string | null;
  note: string;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
};
