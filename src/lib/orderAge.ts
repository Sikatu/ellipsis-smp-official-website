import type { Order } from "../types/admin";

export function getOrderAgeMinutes(order: Order) {
  return Math.max(
    0,
    Math.floor((Date.now() - new Date(order.created_at).getTime()) / 60000)
  );
}

export function formatOrderAge(minutes: number) {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return remainder > 0 ? `${hours}h ${remainder}m` : `${hours}h`;
}
