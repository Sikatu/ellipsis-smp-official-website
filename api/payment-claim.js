function createOrderId() {
  return `ESMP-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
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

  const webhookUrl = process.env.DISCORD_PAYMENT_WEBHOOK_URL;

  if (!webhookUrl) {
    return res.status(500).json({ error: "Missing Discord webhook URL" });
  }

  const {
    product,
    price,
    method,
    minecraftIgn,
    discordUsername,
    referenceNumber,
    receiptBase64,
    receiptFileName,
    receiptMimeType,
  } = req.body;

  const orderId = createOrderId();
  const hasReceipt = Boolean(receiptBase64 && receiptFileName && receiptMimeType);
  const logoUrl = "https://www.ellipsissmp.com/ellipsis-logo-384.webp";

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
          `**Product:** ${product || "Unknown"}\n` +
          `**Amount:** ${price || "Unknown"}\n` +
          `**Payment Method:** ${method || "Unknown"}`,
        inline: false,
      },
      {
        name: "👤 Customer Details",
        value:
          `**Minecraft IGN:** ${minecraftIgn || "Missing"}\n` +
          `**Discord:** ${discordUsername || "Missing"}`,
        inline: false,
      },
      {
        name: "📎 Verification",
        value: hasReceipt
          ? "Receipt image attached below.\nManual verification required."
          : `**Reference Number:** ${referenceNumber || "Missing"}\nManual verification required.`,
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

  let firstResponse;

  if (hasReceipt) {
    const buffer = Buffer.from(receiptBase64, "base64");
    const formData = new FormData();

    formData.append("payload_json", JSON.stringify({ embeds: [embed] }));
    formData.append(
      "files[0]",
      new Blob([buffer], { type: receiptMimeType }),
      receiptFileName
    );

    firstResponse = await fetch(webhookUrl, {
      method: "POST",
      body: formData,
    });
  } else {
    firstResponse = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ embeds: [embed] }),
    });
  }

  if (!firstResponse.ok) {
    return res.status(500).json({ error: "Failed to send Discord payment embed" });
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
    return res.status(500).json({ error: "Payment embed sent, but staff ping failed" });
  }

  return res.status(200).json({ success: true, orderId });
}