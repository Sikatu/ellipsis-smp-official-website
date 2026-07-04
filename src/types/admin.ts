export type OrderStatus = "pending" | "verified" | "rejected" | "delivered";
export type StatusFilter = "all" | OrderStatus | "needs_attention";
export type AdminRole = "owner" | "manager" | "support";
export type AdminStatus = "pending" | "approved" | "rejected";
export type AccessState = "checking" | "signed-out" | "approved" | "pending" | "rejected" | "setup";
export type AuthMode = "login" | "register";

export type Order = {
  id: string;
  created_at: string;
  customer_name: string;
  minecraft_username: string;
  discord_username: string | null;
  product_name: string;
  product_category: string;
  product_price: string;
  quantity: string | null;
  payment_method: string;
  payment_reference: string | null;
  receipt_url: string | null;
  status: OrderStatus;
  staff_notes: string | null;
};

export type AdminProfile = {
  id: string;
  user_id: string | null;
  email: string;
  display_name: string | null;
  role: AdminRole;
  status: AdminStatus;
};

export type OrderAuditLog = {
  id: string;
  order_id: string | null;
  admin_user_id: string | null;
  admin_email: string | null;
  action: string;
  previous_status: OrderStatus | null;
  next_status: OrderStatus | null;
  metadata: Record<string, any>;
  created_at: string;
};
