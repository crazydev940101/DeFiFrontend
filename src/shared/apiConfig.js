import { globalVariables } from '../variables/variable.js';
const apiConfig = {
  authenticate: { url: globalVariables.BASE_URL + '/api/authenticate', method: 'post' },
  register: { url: globalVariables.BASE_URL +  '/api/register', method: 'post' },
  changePassword: { url: globalVariables.BASE_URL +  '/api/change-password', method: 'post' },
    //manage wallet
  add_wallet: {url: globalVariables.BASE_URL +  '/api/wallet/add', method: 'post' },
  get_wallet: {url: globalVariables.BASE_URL +  '/api/wallet/get', method: 'post' },
  get_privkey: {url: globalVariables.BASE_URL +  '/api/wallet/get_privkey', method: 'post' },
  remove_wallet: {url: globalVariables.BASE_URL +  '/api/wallet/remove', method: 'post' },
  add_trader_wallet: {url: globalVariables.BASE_URL +  '/api/wallet/add_trader', method: 'post' },
  get_trader_wallet: {url: globalVariables.BASE_URL +  '/api/wallet/get_trader', method: 'post' },
  remove_trader_wallet: {url: globalVariables.BASE_URL +  '/api/wallet/remove_trader', method: 'post' },
  update_priority: {url: globalVariables.BASE_URL +  '/api/wallet/update_priority', method: 'post'},
  start_detect: {url: globalVariables.BASE_URL +  '/api/wallet/start_detect', method: 'post'},
  set_mempool: {url: globalVariables.BASE_URL +  '/api/wallet/set_mempool', method: 'post'},
  change_name: {url: globalVariables.BASE_URL +  '/api/wallet/change_name', method: 'post'},
  getETHBalance: { url:globalVariables.BASE_URL +   '/api/wallet/getETHBalance', method: 'post' }, //user_id 
  transfer: { url:globalVariables.BASE_URL +   '/api/wallet/transfer', method: 'post' }, //user_id 
  remove_all_detect_log_by_wallet_id: {url: globalVariables.BASE_URL +  '/api/wallet/remove_all_detect_log_by_wallet_id', method: 'post' }, //user_id
  detect_by_wallet_id: {url: globalVariables.BASE_URL +  '/api/mempool/detect_by_wallet_id', method: 'post' }, //user_id
  remove_current_log: {url: globalVariables.BASE_URL +  '/api/mempool/remove_current_log', method: 'post' },  //user_id
  remove_all_traders: {url: globalVariables.BASE_URL +  '/api/mempool/remove_all', method: 'post' },  //user_id
  //manage log
  get_token_logs: {url: globalVariables.BASE_URL +  '/api/log/get_token_logs', method: 'post'}, // user_id
  start_logs_history: {url: globalVariables.BASE_URL +  '/api/log/start_logs_history', method: 'post'}, // user_id
  get_logs_history: {url: globalVariables.BASE_URL +  '/api/log/get_logs_history', method: 'post'}, // user_id
  remove_log: {url: globalVariables.BASE_URL +  '/api/log/remove_log', method: 'post' },  // user_id
  remove_all_log: {url: globalVariables.BASE_URL +  '/api/log/remove_all_log', method: 'post' },  // user_id
  get_code: { url:globalVariables.BASE_URL +   '/api/log/get_code', method: 'post' }, //user_id 
  //manage follow
  get_registered_wallet_list: {url: globalVariables.BASE_URL +  '/api/follow/get_registered_wallet_list', method: 'post' },
  add_new_follow: {url:globalVariables.BASE_URL +   '/api/follow/add_new_follow', method: 'post' },   // user_id
  get_follows: {url: globalVariables.BASE_URL +  '/api/follow/get_follows', method: 'post' },
  remove_follow: {url: globalVariables.BASE_URL +  '/api/follow/remove_follow', method: 'post' },
  start_follow_detect: {url: globalVariables.BASE_URL +  '/api/follow/start_follow_detect', method: 'post' }, //user_id
  get_token_by_id: {url: globalVariables.BASE_URL +  '/api/token/get_token_by_id', method: 'post' }, //user_id
  remove_token: {url: globalVariables.BASE_URL +  '/api/follow/remove_token', method: 'post' }, //user_id
  start_detect_rug_pool: {url: globalVariables.BASE_URL +  '/api/follow/start_detect_rug_pool', method: 'post' }, //user_id
    change_auto_setting: { url:globalVariables.BASE_URL +   '/api/follow/change_auto_setting', method: 'post' }, //user_id 
  update_follow_item: { url:globalVariables.BASE_URL +   '/api/follow/update_follow_item', method: 'post' }, //user_id 
  get_new_count: { url:globalVariables.BASE_URL +   '/api/follow/get_new_count', method: 'post' }, //user_id 
  
  //manage handcraft
  estimateGas: { url:globalVariables.BASE_URL +   '/api/manual/estimateGas', method: 'post' }, //user_id
  manual_buy: { url:globalVariables.BASE_URL +   '/api/manual/buy', method: 'post' }, //user_id
  token_sell: { url:globalVariables.BASE_URL +   '/api/token/sell', method: 'post' }, //user_id
  get_pending_lists: { url:globalVariables.BASE_URL +   '/api/token/get_pending_lists', method: 'post' }, //user_id
  manual_approve: { url:globalVariables.BASE_URL +   '/api/token/approve', method: 'post' }, //user_id
  change_rug_check_status: { url:globalVariables.BASE_URL +   '/api/token/change_rug_check_status', method: 'post' }, //user_id
  remove_token_pending: { url:globalVariables.BASE_URL +   '/api/token/remove_token_pending', method: 'post' }, //user_id
  estimate_price: { url:globalVariables.BASE_URL +   '/api/token/estimate_price', method: 'post' }, //user_id 
  remove_token_complete: { url:globalVariables.BASE_URL +   '/api/token/remove_token_complete', method: 'post' }, //user_id
  undo_token: { url:globalVariables.BASE_URL +   '/api/token/undo_token', method: 'post' }, //user_id 
  change_autosell_setting: { url:globalVariables.BASE_URL +   '/api/token/change_autosell_setting', method: 'post' }, //user_id 
  //simulation
  change_simulate: { url:globalVariables.BASE_URL +   '/api/change_simulate', method: 'post' }, //user_id
  get_simulate: { url:globalVariables.BASE_URL +   '/api/get_simulate', method: 'post' }, //user_id
  //settings
  get_signature: { url:globalVariables.BASE_URL +   '/api/settings/get_signature', method: 'post' }, //user_id
  add_signature: { url:globalVariables.BASE_URL +   '/api/settings/add_signature', method: 'post' }, //user_id
  get_hex_from_function: { url:globalVariables.BASE_URL +   '/api/settings/get_hex_from_function', method: 'post' }, //user_id
  remove_signature: { url:globalVariables.BASE_URL +   '/api/settings/remove_signature', method: 'post' }, //user_id
  change_signature: { url:globalVariables.BASE_URL +   '/api/settings/change_signature', method: 'post' }, //user_id 
  // manage test
  get_logs: { url:globalVariables.BASE_URL +   '/api/test/get_logs', method: 'post' }, //user_id 
  set_auto: { url:globalVariables.BASE_URL +   '/api/test/set_auto', method: 'post' }, //user_id 
  set_disconnect: { url:globalVariables.BASE_URL +   '/api/test/set_disconnect', method: 'post' }, //user_id 
  remove_tokenlog: { url:globalVariables.BASE_URL +   '/api/test/remove_tokenlog', method: 'post' }, //user_id 
  set_auto_buy: { url:globalVariables.BASE_URL +   '/api/test/set_auto_buy', method: 'post' }, //user_id 
  get_auto_buy: { url:globalVariables.BASE_URL +   '/api/test/get_auto_buy', method: 'post' }, //user_id 
  get_renounce_logs: { url:globalVariables.BASE_URL +   '/api/test/get_renounce_logs', method: 'post' }, //user_id 
  //Sniper
  add_new: { url:globalVariables.BASE_URL +   '/api/sniper/add_new', method: 'post' }, //user_id 
  get_lists: { url:globalVariables.BASE_URL +   '/api/sniper/get_lists', method: 'post' }, //user_id 
  sniper_remove: { url:globalVariables.BASE_URL +   '/api/sniper/remove', method: 'post' }, //user_id 
  sniper_update: { url:globalVariables.BASE_URL +   '/api/sniper/update', method: 'post' }, //user_id 

  close_watcher: { url:globalVariables.BASE_URL +   '/api/token/close_watcher', method: 'post' }, //user_id 
  set_watch_interval: { url:globalVariables.BASE_URL +   '/api/log/set_watch_interval', method: 'post' }, //user_id 
  generate: { url:globalVariables.BASE_URL +   '/api/wallet/generate', method: 'post' }, //user_id 
   
};

export default apiConfig;
