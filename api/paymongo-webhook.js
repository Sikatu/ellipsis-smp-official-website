import crypto from "node:crypto";

export const config = {
  api: {
    bodyParser: false,
  },
};

const rankNames = ["NEON", "AETHER", "TITAN", "OVERCLOCK", "ASCENDANT"];

function json(res, statusCode, body) {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(body));
}

async function readRawBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString("utf8");
}

// Verifies the `Paymongo-Signature` header per PayMongo's own signing scheme:
// header format "t=<timestamp>,te=<test_sig>,li=<live_sig>", HMAC-SHA256 of
// "<timestamp>.<raw_body>" using the webhook secret, hex digest.
function verifyPaymongoSignature({ rawBody, signatureHeader, webhookSecret }) {
  if (!signatureHeader) return false;

  const parts = Object.fromEntries(
    signatureHeader.split(",").map((entry) => {
      const [key, value] = entry.split("=");
      return [key, value];
    })
  );

  const timestamp = parts.t;
  const comparisonSignature = parts.li || parts.te;

  if (!timestamp || !comparisonSignature) return false;

  const expected = crypto
    .createHmac("sha256", webhookSecret)
    .update(`${timestamp}.${rawBody}`)
    .digest("hex");

  const expectedBuf = Buffer.from(expected, "utf8");
  const actualBuf = Buffer.from(comparisonSignature, "utf8");

  if (expectedBuf.length !== actualBuf.length) return false;

  return crypto.timingSafeEqual(expectedBuf, actualBuf);
}

function clean(value, fallback = "N/A") {
  const text = value == null ? "" : String(value).trim();
  return text || fallback;
}

function getSearchText(order) {
  return [order.product_name, order.product_category, order.product_price, order.quantity]
    .filter(Boolean)
    .join(" ")
    .toUpperCase();
}

function getQuantity(order) {
  const value = Number(String(order.quantity || "1").replace(/[^0-9.]/g, ""));
  return Number.isFinite(value) && value > 0 ? value : 1;
}

function getCoinAmount(order) {
  const combined = [order.product_name, order.product_category, order.quantity]
    .filter(Boolean)
    .join(" ");

  const explicitCoinMatch = combined.match(/(\d+)\s*(?:ellipsis\s*)?coins?/i);
  if (explicitCoinMatch?.[1]) return Number(explicitCoinMatch[1]);

  if (combined.toLowerCase().includes("coin")) return getQuantity(order);

  return 0;
}

// Mirrors src/lib/orderMinecraftAutomation.ts (kept standalone here since this
// is a plain Vercel function, same pattern as the other api/*.js files).
function getAutomatedMinecraftActionForOrder(order) {
  const searchText = getSearchText(order);
  const sourceOrderReference = order.payment_reference || order.id;

  const basePayload = {
    orderId: order.id,
    orderReference: sourceOrderReference,
    productName: order.product_name,
    category: order.product_category,
    price: order.product_price,
    quantity: clean(order.quantity, "1"),
    paymentMethod: order.payment_method,
  };

  const matchedRank = rankNames.find((rank) => searchText.includes(rank));

  if (matchedRank) {
    return {
      actionType: "give_rank",
      payload: { ...basePayload, rank: matchedRank },
      reason: `Automated from verified order ${sourceOrderReference}: give ${matchedRank} rank to ${clean(order.minecraft_username)}.`,
      sourceOrderReference,
    };
  }

  if (searchText.includes("COIN")) {
    return {
      actionType: "give_coins",
      payload: { ...basePayload, amount: getCoinAmount(order) },
      reason: `Automated from verified order ${sourceOrderReference}: give Ellipsis Coins to ${clean(order.minecraft_username)}.`,
      sourceOrderReference,
    };
  }

  return {
    actionType: "manual_delivery",
    payload: {
      ...basePayload,
      deliveryType: searchText.includes("CRATE")
        ? "crate_or_key"
        : searchText.includes("FURNITURE")
          ? "furniture"
          : searchText.includes("PLUSH")
            ? "plushie"
            : "manual_review",
    },
    reason: `Automated from verified order ${sourceOrderReference}: manual delivery needed for ${clean(order.product_name)}.`,
    sourceOrderReference,
  };
}

async function supabaseRequest({ supabaseUrl, serviceRoleKey, path, method = "GET", body }) {
  const response = await fetch(`${supabaseUrl}/rest/v1/${path}`, {
    method,
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Supabase request failed (${path}): ${detail.slice(0, 300)}`);
  }

  return response.json();
}

function extractPaidResource(event) {
  const eventType = event?.data?.attributes?.type || "";
  const resource = event?.data?.attributes?.data;

  if (!resource) return null;

  const orderReference = resource.attributes?.metadata?.order_reference;
  if (!orderReference) return null;

  const paymentIntentStatus = resource.attributes?.payment_intent?.attributes?.status;
  const sessionStatus = resource.attributes?.status;
  const isPaid =
    eventType.includes("payment.paid") ||
    paymentIntentStatus === "paid" ||
    sessionStatus === "paid";

  if (!isPaid) return null;

  const paymentMethodUsed =
    resource.attributes?.payments?.[0]?.attributes?.source?.type ||
    resource.attributes?.payment_intent?.attributes?.payments?.[0]?.attributes?.source?.type ||
    null;

  return { orderReference, paymentMethodUsed };
}

async function notifyDiscord({ webhookUrl, order, automation }) {
  if (!webhookUrl) return;

  const embed = {
    title: "✅ Order Verified (PayMongo)",
    color: 3447003,
    timestamp: new Date().toISOString(),
    fields: [
      { name: "Order Reference", value: order.payment_reference || order.id, inline: true },
      { name: "IGN", value: order.minecraft_username || "N/A", inline: true },
      { name: "Discord", value: order.discord_username || "N/A", inline: true },
      { name: "Product", value: order.product_name || "N/A", inline: true },
      { name: "Price", value: order.product_price || "N/A", inline: true },
      { name: "Automated Action", value: automation.reason, inline: false },
    ],
    footer: { text: "Ellipsis SMP - PayMongo Webhook" },
  };

  await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: "Ellipsis SMP Orders", embeds: [embed] }),
  }).catch(() => undefined);
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return json(res, 405, { error: "Method not allowed." });
  }

  try {
    const webhookSecret = process.env.PAYMONGO_WEBHOOK_SECRET;
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!webhookSecret || !supabaseUrl || !serviceRoleKey) {
      return json(res, 500, { error: "Missing server configuration." });
    }

    const rawBody = await readRawBody(req);
    const signatureHeader = req.headers["paymongo-signature"];

    const validSignature = verifyPaymongoSignature({
      rawBody,
      signatureHeader,
      webhookSecret,
    });

    if (!validSignature) {
      return json(res, 401, { error: "Invalid webhook signature." });
    }

    const event = JSON.parse(rawBody);
    const paid = extractPaidResource(event);

    if (!paid) {
      // Not a paid-confirmation event we care about (e.g. checkout_session.payment.failed) -- ack and ignore.
      return json(res, 200, { ok: true, ignored: true });
    }

    const orders = await supabaseRequest({
      supabaseUrl,
      serviceRoleKey,
      path: `orders?payment_reference=eq.${encodeURIComponent(paid.orderReference)}&limit=1`,
    });

    const order = orders[0];

    if (!order) {
      return json(res, 404, { error: "No matching order for this payment reference." });
    }

    // Idempotency: if already verified/delivered, don't reprocess.
    if (order.status === "verified" || order.status === "delivered") {
      return json(res, 200, { ok: true, alreadyProcessed: true });
    }

    const paymentMethodLabel = paid.paymentMethodUsed
      ? `PayMongo (${paid.paymentMethodUsed})`
      : order.payment_method;

    await supabaseRequest({
      supabaseUrl,
      serviceRoleKey,
      path: `orders?id=eq.${order.id}`,
      method: "PATCH",
      body: { status: "verified", payment_method: paymentMethodLabel },
    });

    await supabaseRequest({
      supabaseUrl,
      serviceRoleKey,
      path: "order_audit_logs",
      method: "POST",
      body: {
        order_id: order.id,
        admin_user_id: null,
        admin_email: "paymongo-webhook@system",
        action: "status_update",
        previous_status: order.status,
        next_status: "verified",
        metadata: { source: "paymongo_webhook", admin_display_name: "PayMongo (Automated)" },
      },
    }).catch(() => undefined);

    const orderForAutomation = { ...order, payment_method: paymentMethodLabel };
    const automation = getAutomatedMinecraftActionForOrder(orderForAutomation);

    const existingActions = await supabaseRequest({
      supabaseUrl,
      serviceRoleKey,
      path: `minecraft_admin_actions?source_order_id=eq.${order.id}&automated=eq.true&limit=1`,
    });

    if (!existingActions[0]) {
      await supabaseRequest({
        supabaseUrl,
        serviceRoleKey,
        path: "minecraft_admin_actions",
        method: "POST",
        body: {
          player_key: order.minecraft_username.trim().toLowerCase(),
          minecraft_username: order.minecraft_username,
          discord_username: order.discord_username,
          action_type: automation.actionType,
          payload: automation.payload,
          reason: automation.reason,
          status: "queued",
          source_order_id: order.id,
          source_order_reference: automation.sourceOrderReference,
          automated: true,
        },
      });
    }

    await notifyDiscord({
      webhookUrl: process.env.DISCORD_ORDER_WEBHOOK_URL,
      order: orderForAutomation,
      automation,
    });

    return json(res, 200, { ok: true });
  } catch (error) {
    return json(res, 500, {
      error: error instanceof Error ? error.message : "Unknown server error.",
    });
  }
}
