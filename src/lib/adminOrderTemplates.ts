import type { Order } from "../types/admin";

export function getAdminOrderId(order: Order) {
  return order.payment_reference || order.id;
}

function safeValue(value: string | null | undefined, fallback = "N/A") {
  const cleaned = value?.trim();
  return cleaned || fallback;
}

export function getOrderSummaryTemplate(order: Order) {
  return [
    "📦 Ellipsis SMP Order Summary",
    "",
    `Order ID: ${getAdminOrderId(order)}`,
    `IGN: ${safeValue(order.minecraft_username)}`,
    `Discord: ${safeValue(order.discord_username)}`,
    `Customer: ${safeValue(order.customer_name)}`,
    `Product: ${safeValue(order.product_name)}`,
    `Category: ${safeValue(order.product_category)}`,
    `Price: ${safeValue(order.product_price)}`,
    `Quantity: ${safeValue(order.quantity)}`,
    `Payment: ${safeValue(order.payment_method)}`,
    `Status: ${order.status.toUpperCase()}`,
  ].join("\n");
}

export function getDeliveryMessageTemplate(order: Order) {
  return [
    "✅ Order Ready for Delivery",
    "",
    `Order ID: ${getAdminOrderId(order)}`,
    `IGN: ${safeValue(order.minecraft_username)}`,
    `Discord: ${safeValue(order.discord_username)}`,
    `Product: ${safeValue(order.product_name)}`,
    `Price: ${safeValue(order.product_price)}`,
    `Payment: ${safeValue(order.payment_method)}`,
    "",
    "Please deliver the purchased item in-game and mark this order as Delivered once complete.",
  ].join("\n");
}

export function getPlayerReplyTemplate(order: Order) {
  return [
    `Hi ${safeValue(order.minecraft_username, "there")}!`,
    "",
    `Your ${safeValue(order.product_name)} order has been verified and is now ready for delivery.`,
    "Please stay online or coordinate with staff so we can process it in-game.",
    "",
    `Order ID: ${getAdminOrderId(order)}`,
    "- Ellipsis SMP Staff",
  ].join("\n");
}

export function isReadyToDeliver(order: Order) {
  return order.status === "verified";
}
