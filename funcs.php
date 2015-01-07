<?php
require_once 'modules/memcached_namespace.php';
require_once 'modules/geoipcity.php';
require_once 'modules/device_name.php';
require_once 'dbase.php';

//缓存目录路径
define('DEVICE_SAVED_PATH', dirname(__FILE__).'/cache/device');
define('ASYNC_MSG_PATH', dirname(__FILE__).'/cache/asyncmsg');
define('BROWSER_CACHE_PATH', dirname(__FILE__).'/cache/browser');
define('LOCALE_CACHE_PATH', dirname(__FILE__).'/cache/locale');
define('TITLE_CACHE_PATH', dirname(__FILE__).'/cache/title');
define('LOCAL_LOG_FILE', dirname(__FILE__).'/cache/log/debug.log');

//memcached需要用到的
define('MEMC_HOST', '127.0.0.1');
define('MEMC_PORT', 11211);
define('API_MEMC_POOL', 'api_memcached_pool');//没必要改
define('GET_BROWSER', 'GET_BROWSER');//没必要改
define('GET_BROWSER_EXPIRE', 3600*8); 
define('GET_DEVICE', 'GET_DEVICE');//没必要改
define('GET_DEVICE_EXPIRE', 3600*8);
define('GET_LOCALE', 'GET_LOCALE');//没必要改
define('GET_LOCALE_EXPIRE', 3600*8);
define('GET_CONF_EXPIRE', 5);
define('FORCE_CONF_UPDATE', false);


//jsondb界面字段映射
$field_mapper_data =  [
	'名称' => 'name',
	'分类标签' => 'categorys',
	//弹窗任务
	'目标人群' => 'targets',
	'消息集合' => 'messages',
	'消息样式' => 'style', //苹果风格？
	'运行状态' => 'status',
	'开始时间' => 'start_time',
	'结束时间' => 'finish_time',
	'执行次数' => 'times',
	'每次间隔' => 'time_interval',
	'前距时间' => 'time_interval_pre',
	'间隔模式' => 'time_interval_mode',
	'消息顺序' => 'msg_sequence',
	'任务互斥' => 'repel',

	//替换任务
	'单页个数' => 'max_perpage',
	'间隔PV' => 'pv_interval',
	'前距PV' => 'pv_interval_pre',

	//目标用户
	'便携设备' => 'ismobiledevice',
	'浏览器' => 'browser',
	'操作系统' => 'platform',
	'设备名' => 'device_name',
	'地区' => 'region',
	'语言' => 'language',
	'浏览器特征(正则)' => 'UserAgent',
	'首访用户' => 'is_first_session',
	'首日用户' => 'is_first_day',
	'首访第一页' => 'is_first_pageview',
	'已注册' => 'is_registed',
	'访问网址(正则)' => 'Visiting',
	'来访停留秒数区间' => 'staytime',
	'来访次数区间' => 'session_count',
	'页面浏览数区间' => 'session_pv',
	'总页面浏览数区间' => 'pageview_count',
	'账户名' => 'kword_account',
	'网页标题关键字' => 'kword_title',
	'提交框关键字' => 'kword_submit',
	'购物车关键字' => 'kword_cart', 
	'收藏夹关键字' => 'kword_favorite',
	'包含关键字' => 'include_kword',
	'不包含关键字' => 'exclude_kword',

	//消息的翻译
	'消息标题' => 'title',
	'消息内容' => 'text',
	'消息类型' => 'msgmod', //异步还是实时
	'消息形式' => 'msgform', //弹出还是替换
	'显示位置' => 'position', 
	'固定显示' => 'sticky',
	'显示时长' => 'time',
	'弹窗警示' => 'before_open',

];

function get_confs_cached($db_name=null, $table_name=null, $force_update=false)
{
	FORCE_CONF_UPDATE && ($force_update = true);

	$key = $db_name.'|config|'.$table_name;
	$key_valid = $db_name.'|config.valid|'.$table_name;

	$mem = api_open_mmc();

	if ($force_update === false) {
		//如果还有效，直接获取返回
		if ($is_valid = $mem->get($key_valid)) {
			if ($result = $mem->get($key)) {
				return $result;
			}
		//如果已经失效
		} else {
			//看看旧的在否？有则先设置标记，让其他人先获取
			if ($result = $mem->get($key)) {
				$mem->set($key_valid, 'true', GET_CONF_EXPIRE);
				sync_job('get_confs', [$db_name, $table_name]);
				return $result;
			}
		}
	}

	$result = get_confs($db_name, $table_name, '名称');

	$config = $result['push-settings'];
	$popup_confs = make_popup_list($config);
	$replace_confs = make_replace_list($config);

	$confs = ['popup' => $popup_confs, 'replace' => $replace_confs];

	$confs = fields_mapper($confs);
	$confs['system'] = get_system_confs();

	$mem->set($key, $confs);
	$mem->set($key_valid, 'true', GET_CONF_EXPIRE);

	return $confs;
}

function get_system_confs()
{
	$result =  [];

	$configs = get_confs('push-settings', 'system');
	$configs = @$configs['push-settings']['system'];

	if (empty($configs)) {
		return [];
	}

	$type_descs = [];
	foreach($configs as $conf) {
		$key = $conf['key'];

		$value = $conf['value'];
		if ($conf['type'] === 'integer') {
			$value = intval($value);
		} 
		elseif($conf['type'] === 'date') {
			$value = format_time($value);
		}
		elseif($conf['type'] === 'json') {
			$value = json_decode($value);
		}

		if ($conf['array'] === 'yes') {
			if (!array_key_exists($key, $result)) {
				$result[$key] = [];
			}
			$items = &$result[$key];
			if (!in_array($value, $items)) {
				$items[] = $value;
			}
		} else {
			$result[$key] = $value;
		}
		$type_descs[$key] = $conf['type'];
	}

	$result['type_desc'] = $type_descs;

	return $result;
}

function fields_mapper($confs)
{
	global $field_mapper_data;
	$confs = replace_keys($confs, function($key)use($field_mapper_data){
		$res = @$field_mapper_data[$key];
		return empty($res)? $key : $res;
	});

	return $confs;
}

function replace_keys(array $input, $replace_func) 
{
	$return = array();
	foreach ($input as $key => $value) {
		$key = call_user_func($replace_func, $key);

		if (is_array($value)) {
			$value = replace_keys($value, $replace_func); 
		}

		$return[$key] = $value;
	}
	return $return;
}

function make_replace_list($result)
{
	$conf_replace_task = $result['replace-task']; 
	$conf_users = $result['users']; 
	$conf_messages = $result['messages'];
	$conf_keywords = $result['keywords'];
	$conf_positions = $result['positions'];

	$result = array();
	foreach ($conf_replace_task as $name=>$task) {
		$target_users = @$task['目标人群'];
		$target_messages = @$task['消息集合'];

		if (empty($target_messages)) {continue;}

		$new_target = get_user_selected($conf_users, $target_users);
		$pick_message = get_user_selected($conf_messages, $target_messages);

		foreach ($pick_message as $name=>$msg) {
			if ($msg['消息形式'] === '替换显示') {
				continue;
			}
			unset($pick_message[$name]);
		}

		$task['目标人群'] = format_targets($new_target, $conf_keywords);
		$task['消息集合'] = format_message($pick_message, $conf_positions);
		$task['运行状态'] = task_status($task['运行状态']);
		$task['开始时间'] = trans_time($task['开始时间']);
		$task['结束时间'] = trans_time($task['结束时间']);
		$task['消息顺序'] = pop_sequence($task['消息顺序']);
		$task['执行次数'] = intval($task['执行次数']);
		$task['单页个数'] = intval($task['单页个数']);
		$task['间隔PV'] = intval($task['间隔PV']);
		$task['前距PV'] = intval($task['前距PV']);
		$result[$name] = $task;
	}

	return $result;
}

function make_popup_list($result)
{
	$conf_popup_task = $result['popup-task'];
	$conf_users = $result['users']; 
	$conf_messages = $result['messages'];
	$conf_keywords = $result['keywords'];
	$conf_positions = $result['positions'];

	$result = array();
	foreach ($conf_popup_task as $name=>$task) {
		$target_users = @$task['目标人群'];
		$target_messages = @$task['消息集合'];

		if (empty($target_messages)) {continue;}

		$new_target = get_user_selected($conf_users, $target_users);
		$pick_message = get_user_selected($conf_messages, $target_messages);

		foreach ($pick_message as $name=>$msg) {
			if ($msg['消息形式'] === '弹出显示') {
				continue;
			}
			unset($pick_message[$name]);
		}

		$task['目标人群'] = format_targets($new_target, $conf_keywords);
		$task['消息集合'] = format_message($pick_message, $conf_positions);
		$task['运行状态'] = task_status($task['运行状态']);
		$task['消息样式'] = pop_style($task['消息样式']);
		$task['开始时间'] = trans_time($task['开始时间']);
		$task['结束时间'] = trans_time($task['结束时间']);
		$task['执行次数'] = intval($task['执行次数']);
		$task['间隔模式'] = internal_mode($task['间隔模式']);
		$task['每次间隔'] = intval($task['每次间隔']);
		$task['前距时间'] = intval($task['前距时间']);
		$task['消息顺序'] = pop_sequence($task['消息顺序']);
		$task['任务互斥'] = pop_repel($task['任务互斥']);

		$result[$name] = $task;
	}

	return $result;
}

function pop_style($style) 
{
	switch ($style)  {
		case '苹果风格' : return 'mac';
	}
	return 'normal';
}

function task_status($status)
{
	if ($status === '活动') {
		return 'active';
	}
	return 'inactive';
}

function pop_repel($repel)
{
	if ($repel === '单独显示') {
		return true;
	}
	return false;
}

function pop_sequence($sequence)
{
	switch ($sequence)  {
		case '顺序消息' : return 'sequence';
		case '随机消息' : return 'random';
		case '乱序消息' : return 'confusion';
	}
	return 'sequence';
}

function internal_mode($mode)
{
	if ($mode === '绝对间隔') {
		return 'absolute';
	}
	return 'relative';
}

function check_input($input, $max_length = 32)
{
	$input = trim(strip_tags($input));
	return substr($input, 0, $max_length);
}


function check_sticky($sticky)
{
	if ($sticky === '固定显示') {
		return true;
	}
	return false;
}


function check_msgmod($msgmod)
{
	switch ($msgmod)  {
		case '实时消息' : return 'realtime';
		case '异步消息' : return 'heartbeat';
	}
	return 'heartbeat';
}

function check_msgform($msgform)
{
	switch ($msgform)  {
		case '弹出显示' : return 'popup';
		case '替换显示' : return 'replace';
	}
	return 'popup';
}

function check_before_open($bo)
{
	switch ($bo)  {
		case '没有警示' : return false;
		case '强制警示' : return true;
	}
	return false;
}

function check_position($position, $conf_positions)
{
	switch ($position)  {
		case '页面左上方' : return 'top-left';
		case '页面左下方' : return 'bottom-left';
		case '页面右上方' : return 'top-right';
		case '页面右下方' : return 'bottom-right';
	}

	//对于替换来说，这里得到的是“标签”的名字，所以实际上，可能包含多个位置
	$posi_list = [];
	foreach($conf_positions as $posi_item) {
		$cats = $posi_item['分类标签'];
		if (in_array($position, $cats)) {
			$posi_list[] = md5($posi_item['名称']);
		}
	}
	return $posi_list;
}


function format_message($messages, $conf_positions)
{
	$new_message = [];
	foreach ($messages as &$item) {
		$item['消息形式'] = check_msgform($item['消息形式']);
		$item['显示时长'] = intval($item['显示时长']);
		$item['固定显示'] = check_sticky($item['固定显示']);
		$item['消息类型'] = check_msgmod($item['消息类型']);
		$item['弹窗警示'] = check_before_open($item['弹窗警示']);
		$item['显示位置'] = check_position($item['显示位置'], $conf_positions);
		$new_message[] = $item;
	}

	return $new_message;
}

function format_targets($targets, $conf_keywords)
{
	if (empty($targets)) {
		return [];
	}

	foreach ($targets as &$item) {
		$item['账户名'] = get_user_selected($conf_keywords, $item['账户名']);
		$item['网页标题关键字'] = get_user_selected($conf_keywords, $item['网页标题关键字']);
		$item['提交框关键字'] = get_user_selected($conf_keywords, $item['提交框关键字']);
		$item['购物车关键字'] = get_user_selected($conf_keywords, $item['购物车关键字']);
		$item['收藏夹关键字'] = get_user_selected($conf_keywords, $item['收藏夹关键字']);

		$item['来访停留秒数区间'] = get_ranges($item['来访停留秒数区间']);
		$item['来访次数区间'] = get_ranges($item['来访次数区间']);
		$item['总页面浏览数区间'] = get_ranges($item['总页面浏览数区间']);
		$item['页面浏览数区间'] = get_ranges($item['页面浏览数区间']);

		$item['便携设备'] = get_bool(@$item['便携设备'], '移动设备');
		$item['首访用户'] = get_bool(@$item['首访用户'], '首次访问');
		$item['首日用户'] = get_bool(@$item['首日用户'], '首日来访');
		$item['首访第一页'] = get_bool(@$item['首访第一页'], '第一页');
		$item['已注册'] = get_bool(@$item['已注册'], '已注册');
	}
	return $targets;
}


function get_bool($item_str, $true_val)
{
	if (empty($item_str)) {
		return null;
	}

	return ($item_str === $true_val);
}

function get_ranges($range_arr)
{
	$result = [];
	if (is_array($range_arr)) {
		foreach($range_arr as $range_str) {
			$result[] = get_range($range_str);
		}
	} else {

	}
	return $result;
}

function get_range($range_str)
{
	$res = explode('-', $range_str);
	if (empty($res)) {
		return [];
	}
	return [intval($res[0]), intval($res[1])];
}

function trans_time($time_str)
{
	return strtotime(preg_replace('/\(.+\)/', '',  $time_str));
}

function make_capview($username, $nickname, $caption)
{
	empty($nickname) && (!empty($username)) && ($cap_view=$username.'@'.$caption);
	empty($username) && (!empty($nickname)) && ($cap_view=$nickname.'@'.$caption);
	empty($cap_view) && ($cap_view=$nickname.'('.$username.')@'.$caption);
	return $cap_view;
}

function is_nomsg()
{
	return (isset($PARAMS['nomsg']))? ($PARAMS['nomsg'] === 'true') : false;
}


function is_md5_keys($key)
{
	return (strlen($key) === 32);
}

function gen_events($browser_save)
{
	$events = array();
	$events['debug'] = is_debug_client();
	$events['im'] = intval($browser_save['ismobiledevice']);
	$events['ii'] = intval($browser_save['ip_changed']);
	$events['ir'] = intval($browser_save['region_changed']);
	$events['pf'] = $browser_save['first_pageview'];
	$events['pv'] = $browser_save['pageview_count'];
	$events['se'] = $browser_save['session_count'];
	$events['ss'] = $browser_save['start_session'];
	$events['sp'] = $browser_save['session_pv'];
	$events['tp'] = $browser_save['popup_times'];
	$events['tr'] = $browser_save['replace_times'];
	$events['cb'] = $browser_save['browser'];
	$events['cp'] = $browser_save['platform'];
	$events['cd'] = $browser_save['device_name'];
	$events['cr'] = $browser_save['region'];
	return $events;
}


function get_user_selected($configs, $user_selected, $tag_field ='分类标签')
{
	if (empty($user_selected)) {
		return []; 
	}

	$result = array();
	foreach($configs as $name=>$values) {
		$matchs = array_intersect($values[$tag_field], $user_selected);
		if (empty($matchs)) {continue; }
		$result[$name] = $values;
	}
	return $result;
}

function general_match_tasks($browser_save, $task_id, &$task_info, $task)
{
	$result = array(false, false);
	$task_info['pageviews'] += 1;
	$task_print = $task_info['name'].'('.$task_info['run_times'].'/'.$task['times'].')';

	//忽略不是自己的任务
	if ($task_info['bypass'] === true) {
		omp_trace($task_print.' not mine');
		return $result;
	}

	//判读是否过期
	$now = time();
	$run_status = ($now<$task['start_time'])? 'waiting' : (($now>$task['finish_time'])? 'timeout' : 'running');
	$result[1] = ($run_status === 'timeout');

	//任务是否被用户停止
	$status = $task['status'];
	if ($status === 'inactive') {
		omp_trace($task_print.' inactive');
		return $result;
	}

	//记录超时
	if ($run_status === 'timeout') {
		$task['status'] = 'inactive';
		omp_trace($task_print.' expired');
		return $result;
	}

	//检查是否在时间区间内，否则忽略
	if ($run_status !== 'running') {
		omp_trace($task_print.' not time rigion ');
		return $result;
	}

	//检查执行次数是否已经达到
	if ($task['times'] !== -1) {
		if ($task_info['run_times'] >= $task['times']) {
			omp_trace($task_print.' times exceed ('.$task['times'].')');
			return $result;
		} 
	}

	//详细再查条件
	$matched_target = targets_matched($task['targets'], $browser_save, true);
	if (!$matched_target) {
		omp_trace($task_print.' target not match');
		return $result;
	}

	$result[0] = true;
	return $result;
}


function targets_matched($targets, $browser_save, $is_detail=false)
{
	$matched = false;

	if (empty($targets)) {
		omp_trace('targets empty.');
		return true;
	}

	foreach($targets as $target) {
		do {
			$key_names = ['ismobiledevice', 'browser', 'platform', 'device_name', 'region', 'language'];
			if (!match_normal($target, $browser_save, $key_names)) {
				omp_trace('browser matched failure');
				break;
			}

			//正则表达式匹配UA，如果不匹配则这条任务略过
			$UA = $browser_save['UserAgent'].@$browser_save['XRequestWith'];
			if (!match_regex($UA, $target['UserAgent'])) {
				omp_trace('UserAgent substr: '.$UA.'!='.$target['UserAgent']);
				break;
			}

			//如果是详细匹配，要包括实时的Visiting和Account
			if ($is_detail) {
				$key_names = ['is_first_day', 'is_first_session','is_first_pageview','is_registed'];
				if (!match_normal($target, $browser_save, $key_names)) {
					omp_trace('user matched failure');
					break;
				}

				//正访问网址的正则匹配
				if (!match_regex($browser_save['Visiting'],$target['Visiting'])){
					omp_trace('target : '.$browser_save['Visiting'].'!='.$target['Visiting']);
					break;
				}
				
				//检查关键字匹配
				$key_names = ['kword_account', 'kword_title','kword_submit','kword_cart', 'kword_favorite'];
				if (!match_keyword($target, $browser_save, $key_names)) {
					//todo
				}

				//访问停留时间, 访问页面次数, 总访问页面次数, 来访次数
				$key_names = ['staytime','session_pv','pageview_count', 'session_count'];
				if (!match_range($browser_save, $target, $key_names)) {
					omp_trace('match range: failure');
					break;
				}
			}

			//过关斩将，最后匹配成功了
			$matched = $target;
			omp_trace('match: '.$target['name']);
			break 2;
		} while(false);
	}
	return $matched;
}

function match_normal($target, $browser_save, $keys)
{
	foreach ($keys as $key_name) {
		$from_device = @$browser_save[$key_name];
		$from_config = @$target[$key_name];

		if (empty($from_config)) {
			continue;
		}

		//执行bool类型的命令匹配
		if (is_bool($from_device)) {
			if (!match_bool($from_device, $from_config)) {
				omp_trace("$key_name not match: ".$from_device.'!='. $from_config);
				return false;
			} else {

			}
			//执行子字符串的命令匹配
		} elseif (is_string($from_device)) {
			if (is_string($from_config)) {
				if (!match_substr($from_device, $from_config)) {
					omp_trace("$key_name not substr: ".$from_device.'!='. $from_config);
					return false;
				} else {

				}
			//如果配置是数据，则逐个匹配
			} elseif (is_array($from_config)) {
				$found = false;
				foreach($from_config as $conf) {
					if (match_substr($from_device, $conf)) {
						$found = true;
						break;
					}
				}
				if (!$found) {
					omp_trace("$key_name not substr: ".$from_device.'!='. implode(',', $from_config));
					return false;
				}
			} else {

			}
		} elseif (is_null($from_device)) {
			if ($from_config !== '--') {
				return false;
			}
		} else {

		}
	}
	return true;
}


function match_keyword($from_device, $from_config)
{

}

function match_regex($from_device, $from_config)
{
	if ($from_config === '--') {
		return true;
	}
	
	if (empty($from_config)) {
		return true;
	}

	if (preg_match($from_config, $from_device)) {
		return true;
	}
	return false;
}

function match_substr($from_device, $from_config)
{
	if ($from_config === '--') {
		return true;
	}

	if (empty($from_device)) {
		return false;
	}

	$from_device = strtolower($from_device);
	$from_config = strtolower($from_config);

	$sub_found = false;
	$subitems = explode(' ', $from_config);
	foreach($subitems as $subitem) {
		if (false !== strpos($from_device, $subitem)) {
			$sub_found = true;
			break;
		}
	}
	return $sub_found;
}

function match_bool($from_device, $from_config)
{
	if (empty($from_config)) {return true;}
	if ($from_config === '--') {return true;}
	if (($from_config === 'true') xor $from_device) {return false;}
	return true;
}

function match_range($target, $browser_save, $keys)
{
	foreach ($keys as $key_name) {
		$from_device = @$browser_save[$key_name];
		$from_config = @$target[$key_name];

		if (empty($from_config)) {
			continue;
		}

		if (!match_range_val($from_device, $from_config)) {
			omp_trace('match range: '.$from_device.'!='.implode(',', $from_config));
			return false;
		}
	}
	return true;
}

function match_range_val($current_val, $range_input)
{
	$current_val = intval($current_val);
	
	if (is_string($range_input)) {
		if ($range_input === '--') {
			return true;
		}

		$ranges = explode(',', $range_input);
		foreach($ranges as $range_item) {
			$range_pair = explode('-', $range_item);
			if (count($range_pair)!==2) {
				continue;
			}
			if (($current_val>=$range_pair[0]) && ($current_val<=$range_pair[1])) {
				return true;
			}
		}
	} elseif (is_array($range_input)) {
		if (($current_val>=$range_input[0]) && ($current_val<=$range_input[1])) {
			return true;
		}
	}
	return false;
}

///////////////////////////////////////////////////
///////////////////////////////////////////////////

function remake_msgque(&$task_info, &$task)
{
	$make_step = count($task['messages']); 
	$make_count = $task['times'];
	$make_mode = $task['msg_sequence'];

	$task_info['msg_queue'] = make_msgque($make_step, $make_count, $make_mode);
	$task_info['ori_seq']   = $make_mode;
	$task_info['ori_times'] = $make_count;
	$task_info['ori_msglen']   = $make_step;
}

function make_simple_queue($msg_count, $mode)
{
	if ($msg_count === 0) {return [];}
	if ($msg_count === 1) {return [0];}

	$template = range(0, $msg_count-1);
	switch($mode) {
		case 'confusion': ;
			shuffle($template); 
			$result = [];
			$count = count($template);
			while($msg_count) {
				$result[] = $template[rand(0, $count-1)];
				$msg_count -= 1;
			}
			return $result;
		case 'random': shuffle($template); 
		case 'sequence':return $template;   
		default: return $template;
	}
}

function fill_replace_queue($seq_mode, $used_queue, $task_msg_count)
{
	$sample_queue =[];
	$iter_queue = $used_queue;
	do {
		if (!empty($iter_queue)) {
			foreach ($iter_queue as $index) {
				if (!in_array($index, $sample_queue)) {
					$sample_queue[] = $index;
				}
			}
		}

		if (count($sample_queue) >= $task_msg_count) {
			break;
		}

		$iter_queue = make_simple_queue($task_msg_count, $seq_mode);

		foreach ($iter_queue as $index) {
			$used_queue[] = $index;
		}
	} while (true);

	return $used_queue;
}


function make_msgque($step, $count, $mode)
{
	$source_sequence = ['sequence', 'random', 'confusion'];
	if (!in_array($mode, $source_sequence)) {
		$mode= 'sequence';
	}

	$template  = range(0, $count-1);
	$result = [];
	foreach ($template as  $num) {
		$result[] = $num % $step;
	}

	if ($mode === 'sequence') {
		return $result;
	}  
	elseif ($mode === 'random') {
		$output = [];
		do {
			$sample = range(0, $step-1);
			shuffle($sample);
			$output = array_merge($output, $sample);
		}while(count($output)<$count);
		$output = array_slice($output, 0, $count);
		return $output;
	}  
	elseif ($mode === 'confusion') {
		shuffle($result);
		return $result;
	}
}

///////////////////////////////////////////////////
///////////////////////////////////////////////////

function api_open_mmc()
{
	$mem = new NSMemcached(API_MEMC_POOL);
	$ss = $mem->getServerList();
	if (empty($ss)) {
		$mem->addServer(MEMC_HOST, MEMC_PORT);
	}
	return $mem;
}

function get_browser_cached($useragent)
{
	$digest = md5($useragent);
	$browser_file= browser_file($digest);

	if (file_exists($browser_file)) {
		$saved = unserialize(file_get_contents($browser_file));
	} else {
		$browser_o = get_browser($useragent);
		$device_name  = get_device_name($useragent);
		$saved = [
			'get_browser' => $browser_o,
			'get_device_name' => $device_name,
		];
		file_put_contents($browser_file, serialize($saved));
	}

	return [$saved['get_browser'], $saved['get_device_name']];
}

function get_locale_mem($ip)
{
	$mem = api_open_mmc();
	if ($city_name = $mem->ns_get(GET_DEVICE, $ip)) {
		return $city_name;
	}

	$city_name = get_city_name($ip);
	if (empty($city_name)) {
		$city_name = $ip;
	}

	$mem->ns_set(GET_LOCALE, $ip, $city_name, GET_LOCALE_EXPIRE);
	return $city_name;
}

function get_accept_language()
{
	$ori = @$_SERVER['HTTP_ACCEPT_LANGUAGE'];
	if (empty($ori)) {
		return '';
	}

	$arr = explode(',', $ori);
	if (count($arr)>0) {
		return $arr[0];
	}

	return '';
}


function gen_uuid() {
    return sprintf( '%04x%04x%04x%04x%04x%04x%04x%04x',
        mt_rand( 0, 0xffff ), mt_rand( 0, 0xffff ),
        mt_rand( 0, 0xffff ),
        mt_rand( 0, 0x0fff ) | 0x4000,
        mt_rand( 0, 0x3fff ) | 0x8000,
        mt_rand( 0, 0xffff ), mt_rand( 0, 0xffff ), mt_rand( 0, 0xffff )
    );
}

function get_device()
{
	$device = isset($_COOKIE[COOKIE_DEVICE_ID]) ? $_COOKIE[COOKIE_DEVICE_ID] : null;
	$device_get = isset($_GET['device']) ? $_GET['device'] : null;
	return ($device_get)? $device_get : $device ;
}

function browser_file($digest)
{
	return BROWSER_CACHE_PATH.'/'.$digest.'.browser';
}

function device_file($device)
{
	return DEVICE_SAVED_PATH.'/'.$device.'.device';
}

function asyncmsg_file($device)
{
	return ASYNC_MSG_PATH.'/'.$device.'.msgs';
}

function title_file($md5)
{
	return TITLE_CACHE_PATH.'/'.$md5.'.title';
}

function get_ua_infos()
{
	$useragent = @$_SERVER['HTTP_USER_AGENT'];
	list($browser_o, $device_name) = get_browser_cached($useragent);

	$is_mobile  = (empty($browser_o->ismobiledevice))? false : true;
	if (!$is_mobile) {
		$is_mobile = is_mobile($useragent);
	}

	return  [
		'UserAgent' => $useragent,
		'ismobiledevice' => $is_mobile,
		'browser' => $browser_o->browser,
		'platform' => $browser_o->platform,
		'device_name' => $device_name,
	];
}

function get_device_saved($create=false)
{
	if ($create) {
		$device = null;
	} else {
		$device = get_device();
	}

	if (empty($device)) {
		$device = gen_uuid();
		setcookie(COOKIE_DEVICE_ID, $device, time()+COOKIE_TIMEOUT, '/', COOKIE_DOMAIN);
		$_COOKIE[COOKIE_DEVICE_ID] = $device;

		$UA_infos = get_ua_infos();

		$device_saved = [
			'device' => $device,
			'need_save' => true,

			//全局统计
			'first_pageview' => time(), //第一次浏览的时间
			'last_pageview' => time(), //最后一次浏览的时间
			'pageview_count' => 0, //该设备的浏览量
			'is_first_pageview' => true, //是否第一页的浏览？

			//单次访问总的统计
			'first_session' => time(), //第一次访问的时间
			'start_session' => time(), //本次访问的初始时间
			'session_pv' => 0, //单次访问的浏览数
			'session_count' => 0, //访问次数
			'is_first_session' => true, //是否第一次访问
			'is_first_day' => true, //是否第一天访问
			'is_first_session_pv' => true, //是否单次访问的第一个浏览
			'staytime' => 0, //访问停留时间

			//弹窗信息统计
			'popup_private' => [], //单次访问的统计数据
			'popup_tasks' => [], //领取的任务列表
			'popup_times' => 0, //成功执行popup的次数
			'popup_lasttime' => 0, //最后一次弹出的时间

			//替换信息统计
			'replace_private' => [],
			'replace_tasks' => [],
			'replace_times' => 0,
			'replace_lasttime' => 0, //最后一次替换的时间

			'UserAgent' => $UA_infos['UserAgent'],
			'ismobiledevice' => $UA_infos['ismobiledevice'],
			'browser' => $UA_infos['browser'],
			'platform' => $UA_infos['platform'],
			'device_name' => $UA_infos['device_name'],
			'is_registed' => false,
			'kword_title' => [],
			'kword_account' => [],
			'kword_interest' => [],
			'kword_submit' => [],
			'kword_cart' => [],
			'kword_favorite' => [],
		];
		put_device_saved($device_saved);
		return $device_saved;
	} else {
		$device_file = device_file($device);
		if (!file_exists($device_file)) {
			return get_device_saved(true);
		}
		$device_saved = unserialize(file_get_contents($device_file));

		$device_saved['need_save'] = true;
		return $device_saved;
	}
}

function reset_device_saved($device_saved)
{
	$UA_infos = get_ua_infos();

	$device_rests = [
		'need_save' => true,

		//全局统计
		'first_pageview' => time(), //第一次浏览的时间
		'last_pageview' => time(), //最后一次浏览的时间
		'pageview_count' => 0, //该设备的浏览量
		'is_first_pageview' => true, //是否第一页的浏览？

		//单次访问总的统计
		'first_session' => time(), //第一次访问的时间
		'start_session' => time(), //本次访问的初始时间
		'session_pv' => 0, //单次访问的浏览数
		'session_count' => 0, //访问次数
		'is_first_session' => true, //是否第一次访问
		'is_first_day' => true, //是否第一次访问
		'is_first_session_pv' => true, //是否单次访问的第一个浏览
		'staytime' => 0, //访问停留时间

		//弹窗信息统计
		'popup_private' => [], //单次访问的统计数据
		'popup_tasks' => [], //领取的任务列表
		'popup_times' => 0, //成功执行popup的次数
		'popup_lasttime' => 0, //最后一次弹出的时间

		//替换信息统计
		'replace_private' => [],
		'replace_tasks' => [],
		'replace_times' => 0,
		'replace_lasttime' => 0, //最后一次替换的时间

		'UserAgent' => $UA_infos['UserAgent'],
		'ismobiledevice' => $UA_infos['ismobiledevice'],
		'browser' => $UA_infos['browser'],
		'platform' => $UA_infos['platform'],
		'device_name' => $UA_infos['device_name'],

		'is_registed' => false,
		'kword_title' => [],
		'kword_account' => [],
		'kword_interest' => [],
		'kword_submit' => [],
		'kword_cart' => [],
		'kword_favorite' => [],
	];

	return array_replace($device_saved, $device_rests);
}

function update_device_saved($device_saved)
{
	//更新统计信息
	if ((time() - $device_saved['last_pageview']) > SESSION_INTERVAL_TIME) {
		$device_saved['start_session'] = time();
		$device_saved['session_count'] += 1;
		$device_saved['session_pv'] = 0;
	}

	$device_saved['pageview_count'] += 1;
	$device_saved['session_pv'] += 1;

	$device_saved['is_first_pageview'] = ($device_saved['pageview_count'] < 2);
	$device_saved['is_first_session'] = ($device_saved['session_count'] < 2);
	$device_saved['is_first_day'] = ((time() - $device_saved['first_pageview']) < COOKIE_TIMEOUT_NEW);
	$device_saved['is_first_session_pv'] = ($device_saved['session_pv'] < 2);
	$device_saved['staytime']  = time()-$device_saved['start_session'];
	$device_saved['is_registed'] = !empty($device_saved['kword_account_md5']);

	//获取需要附加的信息
	//这些都是会动态改变的字段
	$ip_addr = @$_SERVER['REMOTE_ADDR'];
	$region = get_locale_mem($ip_addr);
	$lang = get_accept_language();

	$ip_changed = isset($device_saved['ip_addr'])? ($device_saved['ip_addr'] != $ip_addr) : false;
	$region_changed = isset($device_saved['region'])? ($device_saved['region'] != $region) : false;
	$lang_changed = isset($device_saved['language'])? ($device_saved['language'] != $lang) : false;

	$device_saved['ip_addr'] = $ip_addr;
	$device_saved['region'] = $region;
	$device_saved['language'] = $lang;
	$device_saved['Visiting'] = @$_SERVER['HTTP_REFERER'];
	$device_saved['XRequestWith'] = @$_SERVER['HTTP_X_REQUESTED_WITH'];

	$device_saved['ip_changed'] = $ip_changed;
	$device_saved['region_changed'] = $region_changed;
	$device_saved['lang_changed'] = $lang_changed;

	return $device_saved;
}

function put_device_saved($device_saved)
{
	if ($device_saved['need_save'] !== true) {
		return;
	}
	unset($device_saved['need_save']);

	$device = $device_saved['device'];
	$device_saved['last_pageview'] = time();
	return file_put_contents(device_file($device), serialize($device_saved));
}

function push_async_message($device_list, $cmdbox)
{
	foreach($device_list as $device) {
		$msg_file = asyncmsg_file($device);
		if (file_exists($msg_file)) {
			$cmdbox_list = unserialize(file_get_contents($msg_file));
		} else {
			$cmdbox_list = [];
		}
		array_push($cmdbox_list, $cmdbox);
		file_put_contents($msg_file, serialize($cmdbox_list));
	}
}

function shift_async_message($device)
{
	$msg_file = asyncmsg_file($device);

	if (!file_exists($msg_file)) {
		return null;
	}

	$cmdbox_list = unserialize(file_get_contents($msg_file));
	$cmdbox = array_shift($cmdbox_list);

	if (empty($cmdbox_list)) {
		unlink($msg_file);
	} else {
		file_put_contents($msg_file, serialize($cmdbox_list));
	}

	return $cmdbox;
}

function is_debug_client()
{
	if (isset($_COOKIE[COOKIE_DEBUG])) {
		if ($_COOKIE[COOKIE_DEBUG] === 'true') {
			return true;
		}
	}

	if (isset($_GET['debug'])) {
		if ($_GET['debug'] === 'true') {
			return true;
		}
	}

	return false;
}


function omp_trace($descript=null)
{
	if (!CLIENT_DEBUG) {return;}
	if (!is_debug_client()) {return;}
	if (is_array($descript)) {
		$descript = (json_encode($descript));
	}
	return time_print($descript);
}

$time_record = Array();
$last_time = microtime(true);
$first_time = $last_time;

function time_print($descript=null)
{
	global $time_record;
	global $last_time, $first_time;
	$now_time = microtime(true);

	if ($descript) {
		array_push($time_record, $descript.' '.intval(($now_time-$last_time)*1000).'ms');
		$last_time = $now_time;
	} else {
		array_push($time_record, '(total:'.intval(($now_time-$first_time)*1000).'ms)');
		return $time_record;
	}
}

function msg_queue()
{
	$result = [];
	$msg_list = @$_COOKIE[COOKIE_QUEUE];
	$msg_arr = explode(',', $msg_list);
	foreach($msg_arr as $coded_str) {
		$item_str = rawurldecode($coded_str);
		$item = json_decode($item_str, true);
		$result[] = $item;
	}

	unset($_COOKIE[COOKIE_QUEUE]);
	setcookie(COOKIE_QUEUE, '', time()-3600);
	return $result;
}



function get_param($key = null)
{
    $union = array_merge($_GET, $_POST); 
    if ($key) {
        return @$union[$key];
    } else {
        return $union;
    }
}

function jsonp_echo($data)
{
	header("Cache-Control: no-cache, must-revalidate"); //HTTP 1.1
	header("Pragma: no-cache"); //HTTP 1.0
	header("Expires: Sat, 26 Jul 1997 05:00:00 GMT"); // Date in the past

	header('Access-Control-Allow-Origin: *');  
	header('Content-Type: application/json; charset=utf-8');
	$json = json_encode($data);

	if(!isset($_GET['callback'])) {
		echo $json;
		return;
	}

	$subject = $_GET['callback'];
	$identifier_syntax = '/^[$_\p{L}][$_\p{L}\p{Mn}\p{Mc}\p{Nd}\p{Pc}\x{200C}\x{200D}]*+$/u';
	$reserved_words = array('break', 'do', 'instanceof', 'typeof', 'case',
			'else', 'new', 'var', 'catch', 'finally', 'return', 'void', 'continue', 
			'for', 'switch', 'while', 'debugger', 'function', 'this', 'with', 
			'default', 'if', 'throw', 'delete', 'in', 'try', 'class', 'enum', 
			'extends', 'super', 'const', 'export', 'import', 'implements', 'let', 
			'private', 'public', 'yield', 'interface', 'package', 'protected', 
			'static', 'null', 'true', 'false');
	if (preg_match($identifier_syntax, $subject)	&& !in_array(mb_strtolower($subject, 'UTF-8'), $reserved_words)) {
		echo "{$subject}($json)";
		return;
	}

	echo 'false';
}


function group_list(&$list, $group, $item)
{
	if (!array_key_exists($group, $list)) {
		$list[$group] = [];
	}
	$item_list = &$list[$group];
	return array_push($item_list, $item);
}

function get_title_cached($url)
{
	$cache_file = title_file(md5($url));
	if (file_exists($cache_file)) {
		return file_get_contents($cache_file);
	}

	$content = get_title($url);
	if (!empty($content)) {
		file_put_contents($cache_file, $content);
		return $content;
	}
	return false;
}

function get_title($url){
    $str = curl_get_content($url);
    if(strlen($str)>0){
        if (preg_match("/\<title\>(.*)\<\/title\>/",$str,$title)) {
		return $title[1];
	}
    }
    return false;
}

function curl_get_content($url, $user_agent=null, $conn_timeout=7, $timeout=5)
{
	$headers = array(
		"Accept: application/json",
		"Accept-Encoding: deflate,sdch",
		"Accept-Charset: utf-8;q=1"
		);

	if ($user_agent === null) {
		$user_agent = 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/31.0.1650.57 Safari/537.36';
	}
	$headers[] = $user_agent;

	$ch = curl_init();
	curl_setopt($ch, CURLOPT_URL, $url);
	curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
	curl_setopt($ch, CURLOPT_HEADER, 0);
	curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, $conn_timeout);
	curl_setopt($ch, CURLOPT_FOLLOWLOCATION, TRUE);
	curl_setopt($ch, CURLOPT_TIMEOUT, $timeout);

	$res = curl_exec($ch);
	$httpcode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
	$err = curl_errno($ch);
	curl_close($ch);

	if (($err) || ($httpcode !== 200)) {
		return null;
	}

	return $res;
}

function indent($json) {

	$result      = '';
	$pos         = 0;
	$strLen      = strlen($json);
	$indentStr   = '  ';
	$newLine     = "\n";
	$prevChar    = '';
	$outOfQuotes = true;

	for ($i=0; $i<=$strLen; $i++) {

		// Grab the next character in the string.
		$char = substr($json, $i, 1);

		// Are we inside a quoted string?
		if ($char == '"' && $prevChar != '\\') {
			$outOfQuotes = !$outOfQuotes;

			// If this character is the end of an element,
			// output a new line and indent the next line.
		} else if(($char == '}' || $char == ']') && $outOfQuotes) {
			$result .= $newLine;
			$pos --;
			for ($j=0; $j<$pos; $j++) {
				$result .= $indentStr;
			}
		}

		// Add the character to the result string.
		$result .= $char;

		// If the last character was the beginning of an element,
		// output a new line and indent the next line.
		if (($char == ',' || $char == '{' || $char == '[') && $outOfQuotes) {
			$result .= $newLine;
			if ($char == '{' || $char == '[') {
				$pos ++;
			}

			for ($j = 0; $j < $pos; $j++) {
				$result .= $indentStr;
			}
		}

		$prevChar = $char;
	}

	return $result;
}

function gm_date($time)
{
	return gmdate('D, d M Y H:i:s \G\M\T', $time);
}

function __strtotime($time_str)
{
	$time_str = preg_replace('/中国标准时间/', 'CST', $time_str);
	return strtotime($time_str);
}

function short_date($time_str)
{
	$fixed_date = preg_replace('/\(.+\)$/', '', $time_str);
	$date = new DateTime($fixed_date);
	return $date->format('Y-m-d');
}

function format_time($time_str)
{
	return gm_date(__strtotime($time_str));
}

function __log__($object)
{
	file_put_contents(LOCAL_LOG_FILE, print_r($object,true)."\n", FILE_APPEND);
}

