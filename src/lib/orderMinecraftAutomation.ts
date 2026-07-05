import type { Order } from "../types/admin";
import type { MinecraftActionType } from "../types/minecraftActions";

const rankNames = ["NEON", "AETHER", "TITAN", "OVERCLOCK", "ASCENDANT"];

export type AutomatedMinecraftAction = {
  actionType: MinecraftActionType;
  payload: Record<string, unknown>;
  reason: string;
  sourceOrderReference: string;
};

function clean(value: string | null | undefined, fallback = "N/A") {
  const text = value?.trim();
  return text || fallback;
}

function getOrderReference(order: Order) {
  return order.payment_reference || order.id;
}

function getQuantity(order: Order) {
  const value = Number(String(order.quantity || "1").replace(/[^0-9.]/g, ""));
  return Number.isFinite(value) && value > 0 ? value : 1;
}

function getSearchText(order: Order) {
  return [
    order.product_name,
    order.product_category,
    order.product_price,
    order.quantity,
  ]
    .filter(Boolean)
    .join(" ")
    .toUpperCase();
}

function getCoinAmount(order: Order) {
  const combined = [order.product_name, order.product_category, order.quantity]
    .filter(Boolean)
    .join(" ");

  const explicitCoinMatch = combined.match(/(\d+)\s*(?:ellipsis\s*)?coins?/i);

  if (explicitCoinMatch?.[1]) {
    return Number(explicitCoinMatch[1]);
  }

  const quantity = getQuantity(order);

  if (combined.toLowerCase().includes("coin")) {
    return quantity;
  }

  return 0;
}

function basePayload(order: Order) {
  return {
    orderId: order.id,
    orderReference: getOrderReference(order),
    productName: order.product_name,
    category: order.product_category,
    price: order.product_price,
    quantity: clean(order.quantity, "1"),
    paymentMethod: order.payment_method,
  };
}

export function getAutomatedMinecraftActionForOrder(order: Order): AutomatedMinecraftAction {
  const searchText = getSearchText(order);
  const sourceOrderReference = getOrderReference(order);

  const matchedRank = rankNames.find((rank) => searchText.includes(rank));

  if (matchedRank) {
    return {
      actionType: "give_rank",
      payload: {
        ...basePayload(order),
        rank: matchedRank,
      },
      reason: `Automated from verified order ${sourceOrderReference}: give ${matchedRank} rank to ${clean(order.minecraft_username)}.`,
      sourceOrderReference,
    };
  }

  if (searchText.includes("COIN")) {
    return {
      actionType: "give_coins",
      payload: {
        ...basePayload(order),
        amount: getCoinAmount(order),
      },
      reason: `Automated from verified order ${sourceOrderReference}: give Ellipsis Coins to ${clean(order.minecraft_username)}.`,
      sourceOrderReference,
    };
  }

  return {
    actionType: "manual_delivery",
    payload: {
      ...basePayload(order),
      deliveryType: searchText.includes("CRATE")
        ? "crate_or_key"
        : searchText.includes("FURNITURE")
          ? "furniture"
          : searchText.includes("PLUSH")
            ? "plushie"
            : "manual_review",
    },
    reason: `Automated from verified order ${sourceOrderReference}: manual delivery needed for ${clean(order.product_name)}.`,
    sourceOrderReference,
  };
}
