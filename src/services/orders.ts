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

export async function createCheckoutOrder(input: CreateOrderInput) {
  const orderReference = `ELS-${Date.now().toString(36).toUpperCase()}`;

  const safeFileName = input.receiptFile.name
    .toLowerCase()
    .replace(/[^a-z0-9.-]/g, "-");

  const receiptPath = `payment-receipts/${orderReference}-${safeFileName}`;

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from("receipts")
    .upload(receiptPath, input.receiptFile, {
      contentType: input.receiptFile.type,
      upsert: false,
    });

  if (uploadError) {
    throw new Error(uploadError.message || "Failed to upload receipt.");
  }

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
    receipt_url: uploadData.path,
    status: "pending",
  });

  if (orderError) {
    throw new Error(orderError.message || "Failed to create order.");
  }

  return orderReference;
}
