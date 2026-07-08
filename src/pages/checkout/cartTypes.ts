import type { crates, furniture, plushies } from "../../data/storeItems";
import type { Category, KeyQuantity } from "./checkoutTypes";
import type { rankDetails } from "./checkoutData";

type RankDetail = (typeof rankDetails)[number];
type Crate = (typeof crates)[number];

export type CartLine = {
  id: string;
  pickerCategory: Category;
  name: string;
  badgeLabel: string;
  image: string;
  unitPriceText: string;
  unitPricePhp: number;
  quantity: number;
  productId: string;
  orderProductName: string;
  orderProductCategory: string;
  orderQuantityLabel: string | null;
};

function slugify(...parts: string[]) {
  return parts
    .join("-")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function parsePhp(priceText: string) {
  const match = priceText.match(/[\d,]+(\.\d+)?/);
  if (!match) return 0;
  return Number(match[0].replace(/,/g, "")) || 0;
}

export function formatPhp(amount: number) {
  return `PHP ${amount.toLocaleString()}`;
}

export function buildRankLine(rank: RankDetail, image: string): CartLine {
  return {
    id: `rank:${rank.name}`,
    pickerCategory: "Premium Ranks",
    name: `${rank.name} Rank`,
    badgeLabel: "Premium Rank",
    image,
    unitPriceText: rank.price,
    unitPricePhp: parsePhp(rank.price),
    quantity: 1,
    productId: slugify("premium-rank", rank.name),
    orderProductName: rank.name,
    orderProductCategory: "Premium Rank",
    orderQuantityLabel: null,
  };
}

export function buildCrateLine(
  crate: Crate,
  keyQuantity: KeyQuantity
): CartLine {
  const priceText =
    crate.options.find((option) => option.keys === keyQuantity)?.price ||
    crate.options[0].price;

  return {
    id: `crate:${crate.name}:${keyQuantity}`,
    pickerCategory: "Premium Crates",
    name: `${crate.name}`,
    badgeLabel: `Crate · ${keyQuantity}`,
    image: crate.image,
    unitPriceText: priceText,
    unitPricePhp: parsePhp(priceText),
    quantity: 1,
    productId: slugify("premium-crate", crate.name, keyQuantity),
    orderProductName: `${crate.name} - ${keyQuantity}`,
    orderProductCategory: "Premium Crate",
    orderQuantityLabel: keyQuantity,
  };
}

export function buildFurnitureLine(
  furnitureData: typeof furniture
): CartLine {
  return {
    id: "furniture",
    pickerCategory: "Furnitures",
    name: "Ellipsis Coins",
    badgeLabel: "Furniture",
    image: furnitureData.packs[0]?.image || "",
    unitPriceText: "PHP 50",
    unitPricePhp: 50,
    quantity: 1,
    productId: "furnitures-ellipsis-coins",
    orderProductName: "Ellipsis Coins",
    orderProductCategory: "Furnitures",
    orderQuantityLabel: null,
  };
}

export function buildPlushieLine(plushieData: typeof plushies): CartLine {
  return {
    id: "plushie",
    pickerCategory: "Plushies",
    name: "Plushie Keys",
    badgeLabel: "Plushie",
    image: plushieData.image,
    unitPriceText: "PHP 50",
    unitPricePhp: 50,
    quantity: 1,
    productId: "plushies-plushie-keys",
    orderProductName: "Plushie Keys",
    orderProductCategory: "Plushies",
    orderQuantityLabel: null,
  };
}
