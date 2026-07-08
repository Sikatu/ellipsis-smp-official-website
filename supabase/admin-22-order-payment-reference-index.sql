-- Multi-item checkout (unified cart) creates one order row per cart line,
-- all sharing a single payment_reference. Index it so grouping/lookup by
-- reference (admin order list, /track, the PayMongo webhook) stays fast as
-- order volume grows.

create index if not exists orders_payment_reference_idx
  on public.orders (payment_reference);
