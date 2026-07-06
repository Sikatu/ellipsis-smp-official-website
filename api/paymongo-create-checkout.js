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
          payment_method_types: ["gcash", "card", "paymaya"],
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

    const amount = parseAmountToCentavos(productPrice);

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
        discord_username: discordUsername,
        product_id: productId || null,
        product_name: productName,
        product_category: productCategory || null,
        product_price: productPrice,
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
      successUrl: `${siteUrl}/track?ref=${encodeURIComponent(orderReference)}`,
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
