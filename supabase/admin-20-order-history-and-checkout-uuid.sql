-- Adds an optional minecraft_uuid column to orders (populated from a
-- verified minecraft_profile_links row at checkout time, when the buyer is
-- logged in) and a security-definer RPC so logged-in players can see their
-- own order history without exposing the orders table directly.

alter table public.orders
  add column if not exists minecraft_uuid text;

create index if not exists orders_minecraft_uuid_idx
  on public.orders (minecraft_uuid);

create index if not exists orders_minecraft_username_lower_idx
  on public.orders (lower(minecraft_username));

create or replace function public.list_my_orders()
returns table (
  created_at timestamptz,
  product_name text,
  product_category text,
  product_price text,
  quantity text,
  payment_method text,
  payment_reference text,
  status text
)
language sql
stable
security definer
set search_path to 'public'
as $function$
  select
    orders.created_at,
    orders.product_name,
    orders.product_category,
    orders.product_price,
    orders.quantity,
    orders.payment_method,
    orders.payment_reference,
    orders.status
  from public.orders
  join public.minecraft_profile_links link
    on link.user_id = auth.uid()
    and link.status = 'active'
  where
    (orders.minecraft_uuid is not null and orders.minecraft_uuid = link.minecraft_uuid)
    or (orders.minecraft_uuid is null and lower(orders.minecraft_username) = lower(link.minecraft_username))
  order by orders.created_at desc
  limit 50;
$function$;

revoke all on function public.list_my_orders()
from public, anon;

grant execute on function public.list_my_orders()
to authenticated;
