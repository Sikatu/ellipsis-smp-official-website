export type Category =
  | "Premium Ranks"
  | "Premium Crates"
  | "Furnitures"
  | "Plushies";

export type KeyQuantity = "1 key" | "3 keys" | "5 keys" | "10 keys";

export type Status = "idle" | "sending" | "success" | "error";

export type MobileCheckoutStep = "review" | "pay" | "claim";

export type CheckoutSelection = {
  category: Category;
  rank: string;
  crate: string;
  keyQuantity: KeyQuantity;
};
