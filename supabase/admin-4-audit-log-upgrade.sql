-- Admin 4.0 audit log upgrade
-- This migration adds previous_status, metadata, and performance indexes to order_audit_logs.

alter table public.order_audit_logs
add column if not exists previous_status text;

alter table public.order_audit_logs
add column if not exists metadata jsonb not null default '{}'::jsonb;

create index if not exists order_audit_logs_order_id_idx
on public.order_audit_logs(order_id);

create index if not exists order_audit_logs_created_at_idx
on public.order_audit_logs(created_at desc);

create index if not exists order_audit_logs_admin_user_id_idx
on public.order_audit_logs(admin_user_id);
