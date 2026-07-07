import { supabase } from "../lib/supabase";

export type PlayerPortalProfile = {
  player_key: string;
  minecraft_username: string;
  minecraft_uuid: string | null;
  current_rank: string | null;
  balance_text: string | null;
  votes_total: number;
  playtime_text: string | null;
  is_online: boolean;
  first_joined_at: string | null;
  last_seen_at: string | null;
  last_synced_at: string | null;
  public_stats: Record<string, unknown>;
  raw_placeholders: Record<string, unknown>;
  linked_at: string | null;
};

export type MinecraftProfileClaim = {
  claim_id: string;
  claim_code: string;
  expires_at: string;
};

export type PlayerOrder = {
  created_at: string;
  product_name: string;
  product_category: string | null;
  product_price: string;
  quantity: string | null;
  payment_method: string;
  payment_reference: string;
  status: "pending" | "verified" | "delivered" | "rejected";
};

export async function getCurrentPortalUser() {
  const { data, error } = await supabase.auth.getUser();

  return {
    user: data.user,
    error: error ? new Error(error.message) : null,
  };
}

export async function signInPlayerAccount({
  email,
  password,
}: {
  email: string;
  password: string;
}) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  });

  return {
    session: data.session,
    user: data.user,
    error: error ? new Error(error.message) : null,
  };
}

export async function signUpPlayerAccount({
  email,
  password,
}: {
  email: string;
  password: string;
}) {
  const { data, error } = await supabase.auth.signUp({
    email: email.trim(),
    password,
  });

  return {
    session: data.session,
    user: data.user,
    error: error ? new Error(error.message) : null,
  };
}

export async function signOutPlayerAccount() {
  const { error } = await supabase.auth.signOut();

  return {
    error: error ? new Error(error.message) : null,
  };
}

export async function requestMinecraftProfileClaim(requestedUsername: string): Promise<{
  data: MinecraftProfileClaim | null;
  error: Error | null;
}> {
  const { data, error } = await supabase.rpc("request_minecraft_profile_claim", {
    requested_username: requestedUsername.trim() || null,
  });

  if (error) {
    return {
      data: null,
      error: new Error(error.message),
    };
  }

  const claim = Array.isArray(data) ? data[0] : data;

  return {
    data: claim ? (claim as MinecraftProfileClaim) : null,
    error: null,
  };
}

export async function fetchMyMinecraftProfile(): Promise<{
  data: PlayerPortalProfile | null;
  error: Error | null;
}> {
  const { data, error } = await supabase.rpc("get_my_minecraft_profile");

  if (error) {
    return {
      data: null,
      error: new Error(error.message),
    };
  }

  const profile = Array.isArray(data) ? data[0] : data;

  return {
    data: profile ? (profile as PlayerPortalProfile) : null,
    error: null,
  };
}

export async function fetchMyOrders(): Promise<{
  data: PlayerOrder[];
  error: Error | null;
}> {
  const { data, error } = await supabase.rpc("list_my_orders");

  if (error) {
    return {
      data: [],
      error: new Error(error.message),
    };
  }

  return {
    data: Array.isArray(data) ? (data as PlayerOrder[]) : [],
    error: null,
  };
}