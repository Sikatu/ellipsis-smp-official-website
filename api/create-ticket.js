const VALID_CATEGORIES = ["support", "ban_appeal", "staff_application"];
const GUEST_ALLOWED_CATEGORIES = ["support", "ban_appeal"];

function json(res, statusCode, body) {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(body));
}

function safeText(value, fallback = "") {
  if (value === null || value === undefined) return fallback;
  const text = String(value).trim();
  return text || fallback;
}

async function getSupabaseUser({ supabaseUrl, publishableKey, token }) {
  if (!token) return { user: null, error: null };

  const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: {
      apikey: publishableKey,
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    return { user: null, error: "Invalid or expired session token." };
  }

  const user = await response.json();

  if (!user?.id || !user?.email) {
    return { user: null, error: null };
  }

  return { user: { id: user.id, email: String(user.email).toLowerCase() }, error: null };
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return json(res, 405, { error: "Method not allowed." });
  }

  try {
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const publishableKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !publishableKey || !serviceRoleKey) {
      return json(res, 500, { error: "Missing Supabase server configuration." });
    }

    const body = req.body || {};
    const category = safeText(body.category).toLowerCase();
    const subcategory = safeText(body.subcategory);
    const subject = safeText(body.subject);
    const answers = body.answers && typeof body.answers === "object" ? body.answers : {};
    const minecraftUsername = safeText(body.minecraftUsername) || null;
    const discordUsername = safeText(body.discordUsername) || null;

    if (!VALID_CATEGORIES.includes(category)) {
      return json(res, 400, { error: "Invalid ticket category." });
    }

    if (!subcategory || !subject) {
      return json(res, 400, { error: "Missing ticket subject or subcategory." });
    }

    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";

    const { user, error: userError } = await getSupabaseUser({
      supabaseUrl,
      publishableKey,
      token,
    });

    if (userError) {
      return json(res, 401, { error: userError });
    }

    if (!user && !GUEST_ALLOWED_CATEGORIES.includes(category)) {
      return json(res, 401, { error: "You must be logged in to submit this ticket type." });
    }

    const insertResponse = await fetch(`${supabaseUrl}/rest/v1/tickets`, {
      method: "POST",
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify({
        category,
        subcategory,
        subject,
        answers,
        minecraft_username: minecraftUsername,
        discord_username: discordUsername,
        opened_by_user_id: user?.id || null,
        opened_by_email: user?.email || null,
        status: "open",
      }),
    });

    if (!insertResponse.ok) {
      const detail = await insertResponse.text();
      return json(res, 500, { error: `Failed to create ticket: ${detail.slice(0, 300)}` });
    }

    const rows = await insertResponse.json();
    const ticket = rows[0];

    return json(res, 200, {
      ticketId: ticket.id,
      ticketNumber: ticket.ticket_number,
      guestAccessToken: ticket.guest_access_token,
    });
  } catch (error) {
    return json(res, 500, {
      error: error instanceof Error ? error.message : "Unknown server error.",
    });
  }
}
