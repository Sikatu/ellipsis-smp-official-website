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

async function verifySupabaseUser(token) {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const publishableKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !publishableKey || !serviceRoleKey) {
    throw new Error("Missing Supabase server environment variables.");
  }

  const userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: {
      apikey: publishableKey,
      Authorization: `Bearer ${token}`,
    },
  });

  if (!userResponse.ok) {
    return null;
  }

  const user = await userResponse.json();
  const email = user.email ? String(user.email).toLowerCase() : "";

  if (!user.id || !email) {
    return null;
  }

  const profileUrl =
    `${supabaseUrl}/rest/v1/admin_profiles` +
    `?select=id,user_id,email,display_name,role,status` +
    `&or=(user_id.eq.${encodeURIComponent(user.id)},email.eq.${encodeURIComponent(email)})` +
    `&limit=1`;

  const profileResponse = await fetch(profileUrl, {
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
    },
  });

  if (!profileResponse.ok) {
    throw new Error("Unable to verify admin profile.");
  }

  const profiles = await profileResponse.json();
  const profile = profiles[0];

  if (!profile || profile.status !== "approved") {
    return null;
  }

  if (profile.role !== "owner" && profile.role !== "manager") {
    return null;
  }

  return {
    id: profile.id,
    email: profile.email,
    displayName:
      profile.display_name && !String(profile.display_name).includes("@")
        ? profile.display_name
        : String(profile.email || "Staff").split("@")[0],
    role: profile.role,
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

    const admin = await verifySupabaseUser(token);

    if (!admin) {
      return json(res, 403, { error: "Not authorized to send admin notifications." });
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
