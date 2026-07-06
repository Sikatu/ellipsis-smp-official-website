import type { Category, KeyQuantity, MobileCheckoutStep } from "./checkoutTypes";

export const paymentMethods = [
  {
    id: "PayMongo",
    label: "Pay Online",
    qr: "",
    color: "from-emerald-400 to-teal-500",
  },
  {
    id: "GCash",
    label: "GCash",
    qr: "/payment/payment-gcash-qr.jpg",
    color: "from-blue-500 to-cyan-400",
  },
  {
    id: "GoTyme",
    label: "GoTyme",
    qr: "/payment/payment-gotyme-qr.jpg",
    color: "from-green-400 to-emerald-500",
  },
  {
    id: "BPI",
    label: "BPI",
    qr: "/payment/payment-bpi-qr.png",
    color: "from-red-500 to-orange-400",
  },
];

export const categories: Category[] = [
  "Premium Ranks",
  "Premium Crates",
  "Furnitures",
  "Plushies",
];

export const keyQuantities: KeyQuantity[] = ["1 key", "3 keys", "5 keys", "10 keys"];

export const mobileCheckoutSteps: { id: MobileCheckoutStep; label: string }[] = [
  { id: "review", label: "Review" },
  { id: "pay", label: "Pay" },
  { id: "claim", label: "Claim" },
];

export const rankDetails = [
  {
    name: "NEON",
    price: "PHP 99",
    description:
      "Perfect for players who want essential quality-of-life commands and extra convenience.",
    includes: [
      "NEON Rank Kit",
      "/sethome 3",
      "Player warp 1",
      "Auction slots 2",
      "/workbench",
      "Limited chat color",
      "Ores shop access",
    ],
  },
  {
    name: "AETHER",
    price: "PHP 199",
    description:
      "Unlock additional homes, utilities, and shop access for a more flexible survival experience.",
    includes: [
      "AETHER Rank Kit",
      "/sethome 5",
      "Player warp 2",
      "Auction slots 3",
      "/workbench",
      "/smithingtable",
      "Limited chat color",
      "Ores and Potion shop access",
    ],
  },
  {
    name: "TITAN",
    price: "PHP 299",
    description:
      "Designed for dedicated players who want greater convenience, more auction slots, and advanced utility commands.",
    includes: [
      "TITAN Rank Kit",
      "/sethome 7",
      "Player warp 5",
      "Auction slots 4",
      "/workbench",
      "/smithingtable",
      "/anvil",
      "Limited chat color",
      "Ores and Potion shop access",
    ],
  },
  {
    name: "OVERCLOCK",
    price: "PHP 399",
    description:
      "A high-tier package for active players who want expanded commands, more shop access, and stronger daily convenience.",
    includes: [
      "OVERCLOCK Rank Kit",
      "/sethome 9",
      "Player warp 8",
      "Auction slots 5",
      "/workbench",
      "/smithingtable",
      "/anvil",
      "/repair hand",
      "/feed",
      "Limited chat color",
      "Ores, Potion, and Redstone shop access",
    ],
  },
  {
    name: "ASCENDANT",
    price: "PHP 499",
    description:
      "The top premium rank with maximum convenience, complete shop access, advanced utilities, and unlimited fly.",
    includes: [
      "ASCENDANT Rank Kit",
      "/sethome 12",
      "Player warp 10",
      "Auction slots 6",
      "/workbench",
      "/smithingtable",
      "/anvil",
      "/ender",
      "/repair all",
      "/repair hand",
      "/feed",
      "/heal",
      "All chat colors",
      "All shop access",
      "Unlimited fly",
    ],
  },
];
