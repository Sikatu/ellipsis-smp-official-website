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

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return json(res, 405, { error: "Method not allowed." });
  }

  try {
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return json(res, 500, { error: "Missing Supabase server configuration." });
    }

    const body = req.body || {};
    const guestAccessToken = safeText(body.guestAccessToken);
    const messageBody = safeText(body.body);
    const displayName = safeText(body.displayName, "Guest");

    if (!UUID_PATTERN.test(guestAccessToken)) {
      return json(res, 400, { error: "Invalid ticket token." });
    }

    if (!messageBody) {
      return json(res, 400, { error: "Reply cannot be empty." });
    }

    const ticketLookup = await fetch(
      `${supabaseUrl}/rest/v1/tickets?guest_access_token=eq.${guestAccessToken}&select=id`,
      {
        headers: {
          apikey: serviceRoleKey,
          Authorization: `Bearer ${serviceRoleKey}`,
        },
      }
    );

    if (!ticketLookup.ok) {
      const detail = await ticketLookup.text();
      return json(res, 500, { error: `Failed to look up ticket: ${detail.slice(0, 300)}` });
    }

    const tickets = await ticketLookup.json();
    const ticket = tickets[0];

    if (!ticket) {
      return json(res, 404, { error: "Ticket not found." });
    }

    const insertResponse = await fetch(`${supabaseUrl}/rest/v1/ticket_messages`, {
      method: "POST",
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify({
        ticket_id: ticket.id,
        author_type: "player",
        author_display_name: displayName,
        source: "website",
        body: messageBody,
      }),
    });

    if (!insertResponse.ok) {
      const detail = await insertResponse.text();
      return json(res, 500, { error: `Failed to send reply: ${detail.slice(0, 300)}` });
    }

    return json(res, 200, { ok: true });
  } catch (error) {
    return json(res, 500, {
      error: error instanceof Error ? error.message : "Unknown server error.",
    });
  }
}
