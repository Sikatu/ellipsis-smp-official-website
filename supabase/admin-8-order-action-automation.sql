-- Admin Order to Minecraft Action Automation

alter table public.minecraft_admin_actions
add column if not exists source_order_id text;

alter table public.minecraft_admin_actions
add column if not exists source_order_reference text;

alter table public.minecraft_admin_actions
add column if not exists automated boolean not null default false;

alter table public.minecraft_admin_actions
drop constraint if exists minecraft_admin_actions_action_type_check;

alter table public.minecraft_admin_actions
add constraint minecraft_admin_actions_action_type_check
check (
  action_type in (
    'give_rank',
    'give_coins',
    'jail',
    'unjail',
    'temp_ban',
    'manual_delivery'
  )
);

create unique index if not exists minecraft_admin_actions_auto_order_unique_idx
on public.minecraft_admin_actions(source_order_id)
where automated = true and source_order_id is not null;

create index if not exists minecraft_admin_actions_source_order_id_idx
on public.minecraft_admin_actions(source_order_id);

create index if not exists minecraft_admin_actions_automated_idx
on public.minecraft_admin_actions(automated);
