function createOrderId() {
  return `ESMP-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

const submissionMemory = new Map();

function isRateLimited(ip) {
  const now = Date.now();
  const lastSubmit = submissionMemory.get(ip) || 0;
  const cooldownMs = 30 * 1000;

  if (now - lastSubmit < cooldownMs) return true;

  submissionMemory.set(ip, now);
  return false;
}

const STAFF_USER_IDS = [
  "1360249226549788912",
  "608917266268028939",
  "1508140997987668009",
  "796030446018101258",
];

const STAFF_PINGS = STAFF_USER_IDS.map((id) => `<@${id}>`).join(" ");

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const ip =
    req.headers["x-forwarded-for"]?.split(",")[0] ||
    req.socket?.remoteAddress ||
    "unknown";

  if (isRateLimited(ip)) {
    return res.status(429).json({ error: "Please wait before submitting again." });
  }

  const webhookUrl = process.env.DISCORD_PAYMENT_WEBHOOK_URL;

  if (!webhookUrl) {
    return res.status(500).json({ error: "Missing Discord webhook URL" });
  }

  const {
    product,
    productType,
    productDescription,
    price,
    method,
    minecraftIgn,
    discordUsername,
    receiptBase64,
    receiptFileName,
    receiptMimeType,
  } = req.body;

  if (!product || !price || !method || !minecraftIgn || !discordUsername) {
    return res.status(400).json({ error: "Missing required payment claim details." });
  }

  if (!receiptBase64 || !receiptFileName || !receiptMimeType) {
    return res.status(400).json({ error: "Receipt image is required." });
  }

  const allowedTypes = ["image/png", "image/jpeg", "image/webp"];

  if (!allowedTypes.includes(receiptMimeType)) {
    return res.status(400).json({ error: "Receipt must be PNG, JPG, JPEG, or WEBP." });
  }

  const buffer = Buffer.from(receiptBase64, "base64");
  const maxBytes = 4 * 1024 * 1024;

  if (buffer.length > maxBytes) {
    return res.status(400).json({ error: "Receipt image must be under 4MB." });
  }

  const orderId = createOrderId();
  const logoUrl = "https://www.ellipsissmp.com/ellipsis-logo-discord.png";

  const embed = {
    author: {
      name: "Ellipsis SMP Secure Checkout",
      icon_url: logoUrl,
    },
    title: "💎 Marketplace Payment Claim",
    description:
      `**Order ID:** \`${orderId}\`\n` +
      `**Status:** 🟡 Pending Staff Verification\n\n` +
      "A new marketplace payment claim is ready for review.",
    color: 0x8b5cf6,
    thumbnail: {
      url: logoUrl,
    },
    fields: [
      {
        name: "🧾 Order Summary",
        value:
          `**Product:** ${product}\n` +
          `**Type:** ${productType || "Marketplace Item"}\n` +
          `**Amount:** ${price}\n` +
          `**Payment Method:** ${method}\n` +
          `**Description:** ${productDescription || "No description provided."}`,
        inline: false,
      },
      {
        name: "👤 Customer Details",
        value:
          `**Minecraft IGN:** ${minecraftIgn}\n` +
          `**Discord:** ${discordUsername}`,
        inline: false,
      },
      {
        name: "📎 Verification",
        value: "Receipt image attached below.\nManual verification required.",
        inline: false,
      },
      {
        name: "✅ Staff Checklist",
        value:
          "1. Verify payment amount\n" +
          "2. Match customer details\n" +
          "3. Deliver purchased item in-game\n" +
          "4. Mark order as completed",
        inline: false,
      },
    ],
    footer: {
      text: "Ellipsis SMP Marketplace • Secure Checkout",
      icon_url: logoUrl,
    },
    timestamp: new Date().toISOString(),
  };

  const formData = new FormData();

  formData.append("payload_json", JSON.stringify({ embeds: [embed] }));
  formData.append(
    "files[0]",
    new Blob([buffer], { type: receiptMimeType }),
    receiptFileName
  );

  const embedResponse = await fetch(webhookUrl, {
    method: "POST",
    body: formData,
  });

  if (!embedResponse.ok) {
    return res.status(500).json({ error: "Failed to send Discord payment embed." });
  }

  const pingResponse = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      content: `🔔 **Staff notification:** ${STAFF_PINGS}`,
      allowed_mentions: {
        users: STAFF_USER_IDS,
      },
    }),
  });

  if (!pingResponse.ok) {
    return res.status(500).json({ error: "Payment embed sent, but staff ping failed." });
  }

  return res.status(200).json({ success: true, orderId });
}