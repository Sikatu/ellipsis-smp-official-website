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
    proofLink,
    receiptBase64,
    receiptFileName,
    receiptMimeType,
  } = req.body;

  const embed = {
    title: "💰 New Payment Claim",
    color: 0x8b5cf6,
    fields: [
      { name: "Product", value: product || "Unknown", inline: true },
      { name: "Price", value: price || "Unknown", inline: true },
      { name: "Payment Method", value: method || "Unknown", inline: true },
      { name: "Minecraft IGN", value: minecraftIgn || "Missing", inline: true },
      { name: "Discord", value: discordUsername || "Missing", inline: true },
      { name: "Reference Number", value: referenceNumber || "Not provided", inline: false },
      { name: "Proof Link", value: proofLink || "Not provided", inline: false },
    ],
    timestamp: new Date().toISOString(),
  };

  let response;

  if (receiptBase64 && receiptFileName && receiptMimeType) {
    const buffer = Buffer.from(receiptBase64, "base64");
    const formData = new FormData();

    formData.append(
      "payload_json",
      JSON.stringify({
        embeds: [embed],
      })
    );

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