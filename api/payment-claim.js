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

  const hasReceipt = Boolean(receiptBase64 && receiptFileName && receiptMimeType);

  const fields = [
    { name: "🛒 Product", value: product || "Unknown", inline: true },
    { name: "💸 Amount", value: price || "Unknown", inline: true },
    { name: "🏦 Method", value: method || "Unknown", inline: true },
    { name: "🎮 Minecraft IGN", value: minecraftIgn || "Missing", inline: true },
    { name: "👤 Discord", value: discordUsername || "Missing", inline: true },
    {
      name: hasReceipt ? "📎 Verification" : "🔢 Reference Number",
      value: hasReceipt ? "Receipt image attached below." : referenceNumber || "Missing",
      inline: false,
    },
  ];

  const embed = {
    title: "💎 Ellipsis SMP Marketplace Payment",
    description: "A new manual payment claim has been submitted for staff verification.",
    color: 0x8b5cf6,
    fields,
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

  return res.status(200).json({ success: true });
}