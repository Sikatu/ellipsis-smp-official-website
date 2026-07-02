export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const webhookUrl = process.env.DISCORD_PAYMENT_WEBHOOK_URL;

  if (!webhookUrl) {
    return res.status(500).json({ error: "Missing Discord webhook URL" });
  }

  const { product, price, method, minecraftIgn, discordUsername, referenceNumber, proofLink } =
    req.body;

  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      embeds: [
        {
          title: "💰 New Payment Claim",
          color: 0x8b5cf6,
          fields: [
            { name: "Product", value: product || "Unknown", inline: true },
            { name: "Price", value: price || "Unknown", inline: true },
            { name: "Payment Method", value: method || "Unknown", inline: true },
            { name: "Minecraft IGN", value: minecraftIgn || "Missing", inline: true },
            { name: "Discord", value: discordUsername || "Missing", inline: true },
            { name: "Reference Number", value: referenceNumber || "Missing", inline: false },
            { name: "Proof Link", value: proofLink || "Not provided", inline: false },
          ],
          timestamp: new Date().toISOString(),
        },
      ],
    }),
  });

  if (!response.ok) {
    return res.status(500).json({ error: "Failed to send Discord notification" });
  }

  return res.status(200).json({ success: true });
}