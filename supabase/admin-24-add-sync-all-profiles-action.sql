alter table public.minecraft_admin_actions
drop constraint if exists minecraft_admin_actions_action_type_check;

alter table public.minecraft_admin_actions
add constraint minecraft_admin_actions_action_type_check
check (
  action_type in (
    'give_rank',
    'give_coins',
    'give_crate_key',
    'give_item',
    'give_kit',
    'jail',
    'unjail',
    'temp_ban',
    'unban',
    'kick',
    'mute',
    'unmute',
    'warn',
    'whitelist_add',
    'whitelist_remove',
    'maintenance_enable',
    'maintenance_disable',
    'manual_delivery',
    'server_broadcast',
    'title_broadcast',
    'actionbar_broadcast',
    'sound_broadcast',
    'approved_command',
    'sync_all_profiles'
  )
);
