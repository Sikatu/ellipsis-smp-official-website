// Canonical catalog, mirrored from src/pages/checkout/checkoutData.ts and
// src/data/storeItems.ts. The client sends productName/productCategory/
// productPrice for display, but the actual charge amount is always derived
// from this list -- a client-supplied price is never trusted.
const RANK_PRICES = {
  NEON: "PHP 99",
  AETHER: "PHP 199",
  TITAN: "PHP 299",
  OVERCLOCK: "PHP 399",
  ASCENDANT: "PHP 499",
};

const CRATE_CATALOG = [
  {
    name: "MonsterHunter Pineapple KPOP Crate",
    options: [
      { keys: "1 key", price: "PHP 59" },
      { keys: "3 keys", price: "PHP 149" },
      { keys: "5 keys", price: "PHP 249" },
      { keys: "10 keys", price: "PHP 499" },
    ],
  },
  {
    name: "Stellar Vanguard Crate",
    options: [
      { keys: "1 key", price: "PHP 69" },
      { keys: "3 keys", price: "PHP 179" },
      { keys: "5 keys", price: "PHP 299" },
      { keys: "10 keys", price: "PHP 579" },
    ],
  },
  {
    name: "Phoenix Mecha Sovereign Crate",
    options: [
      { keys: "1 key", price: "PHP 79" },
      { keys: "3 keys", price: "PHP 219" },
      { keys: "5 keys", price: "PHP 349" },
      { keys: "10 keys", price: "PHP 679" },
    ],
  },
  {
    name: "Mariposa Requiem Crate",
    options: [
      { keys: "1 key", price: "PHP 79" },
      { keys: "3 keys", price: "PHP 219" },
      { keys: "5 keys", price: "PHP 349" },
      { keys: "10 keys", price: "PHP 679" },
    ],
  },
];

const FIXED_CATEGORY_PRICES = {
  Furnitures: "PHP 50",
  Plushies: "PHP 50",
};

// Resolves the true price for a requested product from the canonical
// catalog above. Returns null if the product/category/quantity combination
// doesn't match anything real, which the caller treats as a rejected request.
function resolveCanonicalPrice({ productCategory, productName, quantity }) {
  const name = String(productName || "").trim();

  if (productCategory === "Premium Rank") {
    return RANK_PRICES[name] || null;
  }

  if (productCategory === "Premium Crate") {
    const crate = CRATE_CATALOG.find((entry) => name.startsWith(entry.name));
    if (!crate) return null;

    const option = crate.options.find((entry) => entry.keys === quantity);
    return option?.price || null;
  }

  if (productCategory === "Furnitures" || productCategory === "Plushies") {
    return FIXED_CATEGORY_PRICES[productCategory];
  }

  return null;
}

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

function parseAmountToCentavos(priceText) {
  const match = String(priceText || "").match(/[\d,]+(\.\d+)?/);
  if (!match) return null;

  const value = Number(match[0].replace(/,/g, ""));
  if (!Number.isFinite(value) || value <= 0) return null;

  return Math.round(value * 100);
}

function generateOrderReference() {
  return `ELS-${Date.now().toString(36).toUpperCase()}`;
}

async function insertPendingOrder({ supabaseUrl, serviceRoleKey, order }) {
  const response = await fetch(`${supabaseUrl}/rest/v1/orders`, {
    method: "POST",
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify(order),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Failed to create order: ${detail.slice(0, 300)}`);
  }

  const rows = await response.json();
  return rows[0];
}

async function createPaymongoCheckoutSession({ secretKey, lineItemName, amount, orderReference, successUrl, cancelUrl }) {
  const response = await fetch("https://api.paymongo.com/v1/checkout_sessions", {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${secretKey}:`).toString("base64")}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      data: {
        attributes: {
          send_email_receipt: false,
          show_description: true,
          show_line_items: true,
          line_items: [
            {
              currency: "PHP",
              amount,
              name: lineItemName,
              quantity: 1,
            },
          ],
          payment_method_types: ["qrph"],
          success_url: successUrl,
          cancel_url: cancelUrl,
          metadata: {
            order_reference: orderReference,
          },
        },
      },
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`PayMongo checkout session failed: ${detail.slice(0, 300)}`);
  }

  const body = await response.json();
  return body.data.attributes.checkout_url;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return json(res, 405, { error: "Method not allowed." });
  }

  try {
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const paymongoSecretKey = process.env.PAYMONGO_SECRET_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return json(res, 500, { error: "Missing Supabase server configuration." });
    }

    if (!paymongoSecretKey) {
      return json(res, 500, { error: "Missing PayMongo configuration." });
    }

    const body = req.body || {};
    const minecraftUsername = safeText(body.minecraftUsername);
    const minecraftUuid = safeText(body.minecraftUuid) || null;
    const discordUsername = safeText(body.discordUsername);
    const productId = safeText(body.productId);
    const productName = safeText(body.productName);
    const productCategory = safeText(body.productCategory);
    const productPrice = safeText(body.productPrice);
    const quantity = safeText(body.quantity) || null;
    const siteUrl = safeText(body.siteUrl).replace(/\/$/, "");

    if (!minecraftUsername || !discordUsername) {
      return json(res, 400, { error: "Minecraft username and Discord username are required." });
    }

    if (!productName || !productPrice) {
      return json(res, 400, { error: "Missing product details." });
    }

    if (!siteUrl) {
      return json(res, 400, { error: "Missing site URL for payment redirect." });
    }

    const canonicalPrice = resolveCanonicalPrice({ productCategory, productName, quantity });

    if (!canonicalPrice) {
      return json(res, 400, { error: "Could not validate this product. Please refresh and try again." });
    }

    const amount = parseAmountToCentavos(canonicalPrice);

    if (!amount) {
      return json(res, 400, { error: "Could not parse a valid amount from the product price." });
    }

    const orderReference = generateOrderReference();

    const order = await insertPendingOrder({
      supabaseUrl,
      serviceRoleKey,
      order: {
        customer_name: minecraftUsername,
        minecraft_username: minecraftUsername,
        minecraft_uuid: minecraftUuid,
        discord_username: discordUsername,
        product_id: productId || null,
        product_name: productName,
        product_category: productCategory || null,
        product_price: canonicalPrice,
        quantity,
        payment_method: "PayMongo (Online)",
        payment_reference: orderReference,
        receipt_url: null,
        status: "pending",
      },
    });

    const checkoutUrl = await createPaymongoCheckoutSession({
      secretKey: paymongoSecretKey,
      lineItemName: productName,
      amount,
      orderReference,
      successUrl: `${siteUrl}/track?order=${encodeURIComponent(orderReference)}`,
      cancelUrl: `${siteUrl}/checkout`,
    });

    return json(res, 200, {
      checkoutUrl,
      orderReference,
      orderId: order.id,
    });
  } catch (error) {
    return json(res, 500, {
      error: error instanceof Error ? error.message : "Unknown server error.",
    });
  }
}
