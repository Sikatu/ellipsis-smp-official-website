const STATUS_CONFIG = {
  verified: {
    title: "Order Verified",
    color: 3447003,
    emoji: "✅",
  },
  delivered: {
    title: "Order Delivered",
    color: 5763719,
    emoji: "📦",
  },
  rejected: {
    title: "Order Rejected",
    color: 15548997,
    emoji: "❌",
  },
};

function json(res, statusCode, body) {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(body));
}

function safeText(value, fallback = "N/A") {
  if (value === null || value === undefined) return fallback;
  const text = String(value).trim();
  return text || fallback;
}

function getDisplayName(profile) {
  const rawName = profile?.display_name ? String(profile.display_name).trim() : "";

  if (rawName && !rawName.includes("@")) {
    return rawName;
  }

  return String(profile?.email || "Staff").split("@")[0] || "Staff";
}

async function getSupabaseUser({ supabaseUrl, publishableKey, token }) {
  const userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: {
      apikey: publishableKey,
      Authorization: `Bearer ${token}`,
    },
  });

  if (!userResponse.ok) {
    const detail = await userResponse.text();
    return {
      user: null,
      error: `Supabase user verification failed: ${detail.slice(0, 250)}`,
    };
  }

  const user = await userResponse.json();

  if (!user?.id || !user?.email) {
    return {
      user: null,
      error: "Supabase user verification returned no user id or email.",
    };
  }

  return {
    user: {
      id: user.id,
      email: String(user.email).toLowerCase(),
    },
    error: null,
  };
}

async function fetchAdminProfileWithUserToken({ supabaseUrl, publishableKey, token, user }) {
  const params = new URLSearchParams();
  params.set("select", "id,user_id,email,display_name,role,status");
  params.set("user_id", `eq.${user.id}`);
  params.set("limit", "1");

  const byUserIdResponse = await fetch(`${supabaseUrl}/rest/v1/admin_profiles?${params.toString()}`, {
    headers: {
      apikey: publishableKey,
      Authorization: `Bearer ${token}`,
    },
  });

  if (byUserIdResponse.ok) {
    const profiles = await byUserIdResponse.json();
    if (profiles[0]) return { profile: profiles[0], error: null };
  }

  const emailParams = new URLSearchParams();
  emailParams.set("select", "id,user_id,email,display_name,role,status");
  emailParams.set("email", `eq.${user.email}`);
  emailParams.set("limit", "1");

  const byEmailResponse = await fetch(`${supabaseUrl}/rest/v1/admin_profiles?${emailParams.toString()}`, {
    headers: {
      apikey: publishableKey,
      Authorization: `Bearer ${token}`,
    },
  });

  if (!byEmailResponse.ok) {
    const detail = await byEmailResponse.text();
    return {
      profile: null,
      error: `Admin profile lookup failed with user token: ${detail.slice(0, 250)}`,
    };
  }

  const profiles = await byEmailResponse.json();
  return { profile: profiles[0] || null, error: null };
}

async function fetchAdminProfileWithServiceRole({ supabaseUrl, serviceRoleKey, user }) {
  if (!serviceRoleKey) {
    return { profile: null, error: "No service role key configured for fallback lookup." };
  }

  const params = new URLSearchParams();
  params.set("select", "id,user_id,email,display_name,role,status");
  params.set("email", `eq.${user.email}`);
  params.set("limit", "1");

  const response = await fetch(`${supabaseUrl}/rest/v1/admin_profiles?${params.toString()}`, {
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
    },
  });

  if (!response.ok) {
    const detail = await response.text();
    return {
      profile: null,
      error: `Admin profile fallback lookup failed: ${detail.slice(0, 250)}`,
    };
  }

  const profiles = await response.json();
  return { profile: profiles[0] || null, error: null };
}

async function verifyAdmin({ token }) {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const publishableKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !publishableKey) {
    throw new Error("Missing Supabase URL or publishable key.");
  }

  const { user, error: userError } = await getSupabaseUser({
    supabaseUrl,
    publishableKey,
    token,
  });

  if (!user) {
    return { admin: null, error: userError || "Unable to verify Supabase user." };
  }

  const userTokenLookup = await fetchAdminProfileWithUserToken({
    supabaseUrl,
    publishableKey,
    token,
    user,
  });

  let profile = userTokenLookup.profile;
  let lookupError = userTokenLookup.error;

  if (!profile) {
    const fallbackLookup = await fetchAdminProfileWithServiceRole({
      supabaseUrl,
      serviceRoleKey,
      user,
    });

    profile = fallbackLookup.profile;
    lookupError = fallbackLookup.error || lookupError;
  }

  if (!profile) {
    return {
      admin: null,
      error: lookupError || "No admin profile found for this user.",
    };
  }

  if (profile.status !== "approved") {
    return {
      admin: null,
      error: "Admin profile is not approved.",
    };
  }

  if (profile.role !== "owner" && profile.role !== "manager") {
    return {
      admin: null,
      error: "Admin role cannot send order notifications.",
    };
  }

  return {
    admin: {
      id: profile.id,
      email: profile.email,
      displayName: getDisplayName(profile),
      role: profile.role,
    },
    error: null,
  };
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return json(res, 405, { error: "Method not allowed." });
  }

  try {
    const webhookUrl = process.env.DISCORD_ORDER_WEBHOOK_URL;

    if (!webhookUrl) {
      return json(res, 500, { error: "Missing Discord webhook URL." });
    }

    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";

    if (!token) {
      return json(res, 401, { error: "Missing authorization token." });
    }

    const { admin, error: adminError } = await verifyAdmin({ token });

    if (!admin) {
      return json(res, 403, {
        error: adminError || "Unable to verify admin profile.",
      });
    }

    const body = req.body || {};
    const status = safeText(body.status, "").toLowerCase();
    const config = STATUS_CONFIG[status];

    if (!config) {
      return json(res, 400, { error: "Invalid notification status." });
    }

    const orderId = safeText(body.orderId);
    const ign = safeText(body.ign);
    const discord = safeText(body.discord);
    const product = safeText(body.product);
    const price = safeText(body.price);
    const paymentMethod = safeText(body.paymentMethod);
    const previousStatus = safeText(body.previousStatus);
    const nextStatus = safeText(body.status);

    const embed = {
      title: `${config.emoji} ${config.title}`,
      color: config.color,
      timestamp: new Date().toISOString(),
      fields: [
        { name: "Order ID", value: orderId, inline: true },
        { name: "IGN", value: ign, inline: true },
        { name: "Discord", value: discord, inline: true },
        { name: "Product", value: product, inline: true },
        { name: "Price", value: price, inline: true },
        { name: "Payment", value: paymentMethod, inline: true },
        { name: "Status", value: `${previousStatus} → ${nextStatus}`, inline: false },
        { name: "Handled By", value: `${admin.displayName} (${admin.role})`, inline: false },
      ],
      footer: {
        text: "Ellipsis SMP Admin Operations",
      },
    };

    const discordResponse = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: "Ellipsis SMP Orders",
        embeds: [embed],
      }),
    });

    if (!discordResponse.ok) {
      const errorText = await discordResponse.text();
      return json(res, 502, {
        error: "Discord webhook failed.",
        detail: errorText.slice(0, 300),
      });
    }

    return json(res, 200, { ok: true });
  } catch (error) {
    return json(res, 500, {
      error: error instanceof Error ? error.message : "Unknown server error.",
    });
  }
}
