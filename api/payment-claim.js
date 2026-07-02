function createOrderId() {
  return `ESMP-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

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

  const embed = {
    title: "💎 Ellipsis SMP Marketplace",
    description: `**New payment claim received**\n\nOrder ID: \`${orderId}\`\nStatus: 🟡 **Pending Staff Verification**`,
    color: 0xfacc15,
    thumbnail: {
      url: "https://www.ellipsissmp.com/ellipsis-logo-384.webp",
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
          ? "Receipt image attached below.\nStaff must manually verify the transaction."
          : `**Reference Number:** ${referenceNumber || "Missing"}\nStaff must manually verify the transaction.`,
        inline: false,
      },
      {
        name: "✅ Staff Checklist",
        value:
          "1. Verify payment amount\n" +
          "2. Match IGN and Discord user\n" +
          "3. Deliver purchased item in-game\n" +
          "4. Mark order as completed",
        inline: false,
      },
    ],
    footer: {
      text: "Ellipsis SMP Secure Checkout • Manual Verification Required",
    },
    timestamp: new Date().toISOString(),
  };

  let response;

  if (hasReceipt) {
    const buffer = Buffer.from(receiptBase64, "base64");
    const formData = new FormData();

    formData.append("payload_json", JSON.stringify({ embeds: [embed] }));

    formData.append(
      "files[0]",
      new Blob([buffer], { type: receiptMimeType }),
      receiptFileName
    );

    response = await fetch(webhookUrl, {
      method: "POST",
      body: formData,
    });
  } else {
    response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ embeds: [embed] }),
    });
  }

  if (!response.ok) {
    return res.status(500).json({ error: "Failed to send Discord notification" });
  }

  return res.status(200).json({ success: true, orderId });
}