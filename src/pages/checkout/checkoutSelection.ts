import { crates } from "../../data/storeItems";
import { keyQuantities, rankDetails } from "./checkoutData";
import type { CheckoutSelection, KeyQuantity } from "./checkoutTypes";

export const defaultCheckoutSelection: CheckoutSelection = {
  category: "Premium Ranks",
  rank: rankDetails[0].name,
  crate: crates[0]?.name || "",
  keyQuantity: "1 key",
};

function normalizeParam(value: string | null) {
  return (value || "").trim().toLowerCase();
}

function isKeyQuantity(value: string | null | undefined): value is KeyQuantity {
  return keyQuantities.includes(value as KeyQuantity);
}

export function getCheckoutSelectionFromSearch(
  search: string
): CheckoutSelection {
  const params = new URLSearchParams(search);
  const product = normalizeParam(params.get("product"));
  const type = normalizeParam(params.get("type") || params.get("category"));
  const price = normalizeParam(params.get("price"));
  const quantity = params.get("quantity") || params.get("keys");

  const rank = rankDetails.find((item) => {
    const name = item.name.toLowerCase();
    return product === name || product.includes(name);
  });

  if (type.includes("rank") || rank) {
    return {
      ...defaultCheckoutSelection,
      category: "Premium Ranks",
      rank: rank?.name || defaultCheckoutSelection.rank,
    };
  }

  const crate = crates.find((item) => {
    const name = item.name.toLowerCase();
    return product === name || product.includes(name);
  });

  if (type.includes("crate") || crate) {
    const pricedQuantity = crate?.options.find(
      (option) => option.price.toLowerCase() === price
    )?.keys;

    return {
      ...defaultCheckoutSelection,
      category: "Premium Crates",
      crate: crate?.name || defaultCheckoutSelection.crate,
      keyQuantity: isKeyQuantity(quantity)
        ? quantity
        : isKeyQuantity(pricedQuantity)
          ? pricedQuantity
          : "1 key",
    };
  }

  if (
    type.includes("furniture") ||
    product.includes("furniture") ||
    product.includes("ellipsis coins")
  ) {
    return {
      ...defaultCheckoutSelection,
      category: "Furnitures",
    };
  }

  if (type.includes("plush") || product.includes("plush")) {
    return {
      ...defaultCheckoutSelection,
      category: "Plushies",
    };
  }

  return defaultCheckoutSelection;
}
