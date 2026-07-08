import { supabase } from "../lib/supabase";

export type CreateOrderInput = {
  customerName: string;
  minecraftUsername: string;
  minecraftUuid?: string | null;
  discordUsername?: string;
  email?: string;
  productId: string;
  productName: string;
  productCategory: string;
  productPrice: string;
  quantity?: string | null;
  paymentMethod: string;
  receiptFile: File;
};

export type CartOrderLine = {
  productId: string;
  productName: string;
  productCategory: string;
  productPrice: string;
  quantity?: string | null;
  /** How many identical order rows this line expands into (cart quantity). */
  unitCount: number;
};

export type CreateCartOrderInput = {
  customerName: string;
  minecraftUsername: string;
  minecraftUuid?: string | null;
  discordUsername?: string;
  email?: string;
  paymentMethod: string;
  receiptFile: File;
  lines: CartOrderLine[];
};

async function uploadReceipt(orderReference: string, receiptFile: File) {
  const safeFileName = receiptFile.name
    .toLowerCase()
    .replace(/[^a-z0-9.-]/g, "-");

  const receiptPath = `payment-receipts/${orderReference}-${safeFileName}`;

  const { data, error } = await supabase.storage
    .from("receipts")
    .upload(receiptPath, receiptFile, {
      contentType: receiptFile.type,
      upsert: false,
    });

  if (error) {
    throw new Error(error.message || "Failed to upload receipt.");
  }

  return data.path;
}

export async function createCheckoutOrder(input: CreateOrderInput) {
  const orderReference = `ELS-${Date.now().toString(36).toUpperCase()}`;
  const receiptUrl = await uploadReceipt(orderReference, input.receiptFile);

  const { error: orderError } = await supabase.from("orders").insert({
    customer_name: input.customerName,
    minecraft_username: input.minecraftUsername,
    minecraft_uuid: input.minecraftUuid || null,
    discord_username: input.discordUsername || null,
    email: input.email || null,
    product_id: input.productId,
    product_name: input.productName,
    product_category: input.productCategory,
    product_price: input.productPrice,
    quantity: input.quantity || null,
    payment_method: input.paymentMethod,
    payment_reference: orderReference,
    receipt_url: receiptUrl,
    status: "pending",
  });

  if (orderError) {
    throw new Error(orderError.message || "Failed to create order.");
  }

  return orderReference;
}

/**
 * Creates one order row per unit across every cart line, all sharing a
 * single payment_reference so the admin UI and Minecraft delivery
 * automation -- both of which key off one product per order row -- keep
 * working unchanged for multi-item carts.
 */
export async function createCheckoutOrders(input: CreateCartOrderInput) {
  if (input.lines.length === 0) {
    throw new Error("Cart is empty.");
  }

  const orderReference = `ELS-${Date.now().toString(36).toUpperCase()}`;
  const receiptUrl = await uploadReceipt(orderReference, input.receiptFile);

  const rows = input.lines.flatMap((line) =>
    Array.from({ length: Math.max(1, line.unitCount) }, () => ({
      customer_name: input.customerName,
      minecraft_username: input.minecraftUsername,
      minecraft_uuid: input.minecraftUuid || null,
      discord_username: input.discordUsername || null,
      email: input.email || null,
      product_id: line.productId,
      product_name: line.productName,
      product_category: line.productCategory,
      product_price: line.productPrice,
      quantity: line.quantity || null,
      payment_method: input.paymentMethod,
      payment_reference: orderReference,
      receipt_url: receiptUrl,
      status: "pending",
    }))
  );

  const { error: orderError } = await supabase.from("orders").insert(rows);

  if (orderError) {
    throw new Error(orderError.message || "Failed to create order.");
  }

  return orderReference;
}
