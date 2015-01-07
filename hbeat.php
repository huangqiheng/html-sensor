<?php
ignore_user_abort();
//error_reporting(0);

/***************** ---------- *****************/
/***************** 主流程和定义 ***************/
/***************** ---------- *****************/

//memcached服务器配置
define('COOKIE_DEVICE_ID', 'device_id'); //cookie名称
define('COOKIE_DEVICE_SAVED', 'device_sav'); //cookie名称
define('COOKIE_DEBUG', 'device_dbg'); //cookie名称
define('COOKIE_NEW', 'device_new'); //cookie名称
define('COOKIE_TIMEOUT', 3600*24*365*100); //cookie超时时间，设一个超大的
define('COOKIE_TIMEOUT_NEW', 3600*24); //cookie超时时间
define('COOKIE_DOMAIN', $_SERVER['HTTP_HOST']); //cookie的域，保证被嵌入网站能访问得到
define('COOKIE_QUEUE', 'device_msg'); //cookie名称
define('SESSION_INTERVAL_TIME', 3600); //统计的session的间隔
define('CLIENT_DEBUG', true); //客户端跟踪标记

define('KWORD_CMPS_COUNT', 100); //关键字组在设备记录文件中的数组的大小

require_once 'funcs.php';

omp_trace('---- initial configs ----');

$SYNJOBS = [];
$CONFIGS = get_confs_cached();
$PARAMS = get_param();
omp_trace('get config comnplete');

$DEVSAV = get_device_saved();
omp_trace('get device saved comnplete');

switch(@$PARAMS['cmd']) {
    case 'hbeat': jsonp_echo(handle_heartbeat_cmd()); break;
    case 'admin': jsonp_echo(handle_admin_cmd()); break;
    case 'kword': jsonp_echo(handle_bind_keyword($PARAMS)); break;
    case 'bind':  jsonp_echo(handle_bind_account($PARAMS)); break;

    case 'debug': jsonp_echo(handle_debug_cmd()); break;
    default: 	  jsonp_echo(['status'=>'error', 'error'=>'unreconized cmd.']);
}

fastcgi_finish_request();
sync_job();
put_device_saved($DEVSAV);
exit;

/***************** ---------- *****************/
/*****************  异步处理  *****************/
/***************** ---------- *****************/

function sync_job($job_type=null, $cmd_arr=null)
{
	global $CONFIGS, $DEVSAV, $PARAMS, $SYNJOBS;

	if ($job_type && $cmd_arr) {
		return  group_list($SYNJOBS, $job_type, $cmd_arr);
	}

	foreach($SYNJOBS as $job_type=>$cmd_datas) {
		foreach($cmd_datas as $cmd_data) {
			switch($job_type) {
			case 'kword_title': 
			case 'kword_interest':
			case 'kword_cart': 
			case 'kword_favorite':
			case 'kword_submit':
			case 'kword_account':
				save_keyword($job_type, $cmd_data[0], $cmd_data[1], $cmd_data[2]);
				break;
			case 'get_confs':
				get_confs_cached($cmd_data[0], $cmd_data[1], true);
				break;
			}
		}
	}
}

/***************** ---------- *****************/
/*****************  处理心跳  *****************/
/***************** ---------- *****************/

function handle_debug_cmd()
{
	global $CONFIGS, $DEVSAV, $PARAMS, $SYNJOBS;
	return [$CONFIGS, $DEVSAV, $PARAMS, $SYNJOBS];
}

function handle_heartbeat_cmd()
{
	global $CONFIGS, $DEVSAV, $PARAMS;
	/******************************************
	  例外处理，一次心跳完成账户绑定，关键字搜集等
	******************************************/
	proxied_cmd($PARAMS);

	/******************************************
	  获取设备信息块
	******************************************/
	omp_trace('---- update device params ----');
	$result = [];
	$DEVSAV = update_device_saved($DEVSAV);
	push_keyword('kword_title');

	if (!is_nomsg()) {
		/******************************************
		  获取计划任务消息 
		******************************************/
		omp_trace('---- start popup messages ----');

		if (@$CONFIGS['system']['is_popup_enabled'] === 'true') {
			if ($items_result = get_popup_messages()) {
				$result['sched_msg'] = $items_result;
			}
		} else {
			omp_trace('popup messages disabled');
		}

		/******************************************
		  获取替换任务消息 
		******************************************/
		omp_trace('---- start replace messages ----');

		if (@$CONFIGS['system']['is_replace_enabled'] === 'true') {
			if ($replace_items = get_replace_messages()) {
				$result['replace_msg'] = $replace_items;
			}
		} else {
			omp_trace('replace messages disabled');
		}

		/*************************************
		  获取异步消息
		*************************************/
		omp_trace('---- start async messages ----');

		if (@$CONFIGS['system']['is_asyncmsg_enabled'] === 'true') {
			if ($cmdbox = shift_async_message($DEVSAV['device'])) {
				$result['async_msg'] = $cmdbox;
			}
		} else {
			omp_trace('async messages disabled');
		}
	}

	/******************************************
	  输出结果：返回该账户绑定情况
	******************************************/
	omp_trace('get account: '.implode(',',$DEVSAV['kword_account']));

	$result['device'] = $DEVSAV['device'];
	$result['binded'] = array_key_exists('kword_account_md5', $DEVSAV)? $DEVSAV['kword_account_md5'] : [];
	$result['events'] = gen_events($DEVSAV);
	$result['trace'] = omp_trace(null);

	return $result;
}

function proxied_cmd($PARAMS)
{
	//支持微信等不支持cookies的客户端，一次请求完成心跳和账户绑定
	if (isset($PARAMS['user']) && isset($PARAMS['nick'])) {
		handle_bind_account($PARAMS);
	}

	//来自通过cookie的异步通道的命令
	$cmd_que = msg_queue();

	if (empty($cmd_que)) {
		return;
	}

	foreach($cmd_que as $cmd_item) {
		if (empty($cmd_item)) {
			continue;
		}

		switch($cmd_item['cmd']) {
		case 'bind':
			handle_bind_account($cmd_item);
			break;
		case 'kword':
			handle_bind_keyword($cmd_item);
			break;
		default:
			omp_trace('error cookie cmd: '.json_encode($cmd_item));
		}
	}
}


function get_replace_messages()
{
	global $CONFIGS, $DEVSAV, $PARAMS;
	$confs = $CONFIGS['replace'];

	/******************************************
	  新设备检查和颁发机会任务消息
	******************************************/

	$runing_items = &$DEVSAV['replace_tasks'];
	$all_tasks = update_running_tasks($DEVSAV, $runing_items, $confs);
	$now = time();
	$session_pv = $DEVSAV['session_pv'];
	$global_pv = $DEVSAV['pageview_count'];


	//如果没有消息，则不必要触发下面的任务检查流程了
	$accept_posi_nums = [];
	foreach ($PARAMS as $name=>$value) {
		if(is_md5_keys($name)) {
			$accept_posi_nums[$name] = $value;
		}
	}

	if (empty($accept_posi_nums)) {
		omp_trace('no posi input');
		return false;
	}

	if (empty($runing_items)) {
		omp_trace('no runing_items exists');
		return false;
	}
	/*************************************
		获取计划任务消息
	*************************************/
	$items_expired = array();
	$items_result = array();
	foreach($runing_items as $task_id => &$task_info) {
		/*************************************
			通用任务匹配模块
		*************************************/
		$task = $all_tasks[$task_id];
		$task_print = $task_info['name'].'('.$task_info['run_times'].'/'.$task['times'].')';
		list($is_matched, $is_expired) = general_match_tasks($DEVSAV, $task_id, $task_info, $task);

		if ($is_expired) {
			$items_expired[] = $task_id;
		}

		if (!$is_matched) {
			omp_trace($task_print.' general match tasks false');
			continue;
		}

		/*************************************
			任务其他内容匹配	
		*************************************/
		$task_messages = $task['messages'];
		$messages = [];
		omp_trace('apply position: '.implode(',', array_keys($accept_posi_nums)));
		foreach($task_messages as $item) {
			$dbg_str = "has msg \"".$item['title']."\"";
			$posi_list = $item['position'];
			foreach($posi_list as $key) {
				if (array_key_exists($key, $accept_posi_nums)) {
					$dbg_str .= ' matched key:'.$key.' num:'.$accept_posi_nums[$key];
					$messages[] = $item;
				}
			}
			omp_trace($dbg_str);
		}

		//提交的未知，没有适合的消息，后面不需处理和统计
		if (empty($messages)) {
			omp_trace($task_print.' no messages retrive');
			continue;
		}

		$max_num = $task['max_perpage'];
		if ($max_num == 0) {
			omp_trace($task_print.' max_perpage === 0');
			continue;
		}

		//哇，有消息，做任务统计了
		$task_info['pageviews'] += 1;

		//在时间区间内，但看看前面一个消息距离是否足够
		$valid_pageview = $task_info['pageviews'] - $task['pv_interval_pre'];
		if ($valid_pageview <= 0) {
			omp_trace($task_print.' pre pageviews not reach ');
			continue;
		}

		//看看间隔是否达到了
		if ($task['pv_interval'] > 0) {
			$step = $valid_pageview % ($task['pv_interval'] + 1);
			if ($step !== 0) {
				omp_trace($task_print.' pageviews internal not reach ');
				continue;
			}
		}

		$task_msg_count = count($task_messages);
		$used_queue = fill_replace_queue($task['msg_sequence'], @$task_info['used_queue'], $task_msg_count);

		omp_trace("fill queue({$task['msg_sequence']}): ".implode(',', $used_queue));

		while (count($used_queue)) {
			//根据pop出的index选取消息
			$msg_index = array_shift($used_queue);
			if ($msg_index === null) {
				$used_queue = fill_replace_queue($task['msg_sequence'], [], $task_msg_count);
				$msg_index = array_shift($used_queue);
				omp_trace('remake used_queue');
			}

			$selected_message = @$task_messages[$msg_index];

			//如果取不到，队列有错了吧
			if (empty($selected_message)) {
				omp_trace('selected_message empty');
				continue;
			}

			//这个消息，不符合客户端提交的位置
			$accept_posis = array_keys($accept_posi_nums);
			$msg_posis = $selected_message['position'];
			$matched_posi = array_intersect($accept_posis, $msg_posis);

			if (empty($matched_posi)) {
				omp_trace('not mine: '.$selected_message['title']);
				continue;
			}

			//随便挑选一个位置
			$picked_succ = false;
			foreach($accept_posi_nums as $posi_key=>&$nums) {
				if (in_array($posi_key, $matched_posi)) {
					$nums -= 1;
					$selected_message['position'] = [$posi_key];
					$picked_succ = true;
					break;
				}
			}


			//这个消息所在的位置，已经用完了
			if ($picked_succ === false) {
				omp_trace('posi done: '.$posi_key.' by '.$selected_message['title']);
				continue;
			}

			//肯定能找到接收的，这个消息将收录为结果
			$items_result[] = $selected_message;

			omp_trace('<--- result msg('.count($items_result).'): '.$selected_message['title']);

			//统计最大的客户端接收 个数
			if ($max_num > 0) {
				$max_num -= 1;
				if ($max_num === 0) {
					omp_trace('break of reaching max allow number');
					break;
				}
			}

			$posi_maxnum = 0;
			foreach ($accept_posi_nums as $key=>$val) {
				$posi_maxnum += $val;
			}

			if ($posi_maxnum === 0) {
				omp_trace('break of reaching max posi number');
				break;
			}
		}

		//保存这次剩下的"随机"列表，供下次使用
		$task_info['used_queue'] = $used_queue;

		omp_trace("after queue({$task['msg_sequence']}): ".implode(',', $used_queue));

		//统计和日志

		//成功取出了消息，设置状态
		$task_info['run_times'] += 1;
		$task_info['last_time'] = $now;
		$DEVSAV['replace_lasttime'] = $now;
		$DEVSAV['replace_times'] += 1;
	}

	//删除被撤销的任务
	if (!empty($items_expired)) {
		omp_trace('expired '.implode(',', $items_expired));
	}

	return (count($items_result))? $items_result : false;
}

function update_running_tasks($browser_save, &$runing_items, $task_items)
{
	//检查是否需要清理任务
	$items_del = array_diff_key($runing_items, $task_items);
	if (!empty($items_del)) {
		$names = [];
		foreach($items_del as $key=>$item) {
			unset($runing_items[$key]);
			$names[] = $item['name'];
		}
		omp_trace(implode(',', $names).' tasks del');
	}

	//如果对比任务列表并没有发生变化，就不用颁发了
	$new_tasks = array_diff_key($task_items, $runing_items);
	if (empty($new_tasks)) {
		omp_trace('no new tasks');
		return $task_items;
	}

	//逐个分析新出现任务，检查UA相关规则，不符合就不用颁发了
	foreach($new_tasks as $key=>$item) {
		//所谓颁发，就是生成一个初始化的任务数组
		$task_info = array();
		$task_info['name'] = $key; 
		$task_info['bypass'] = false; 
		$task_info['run_times'] = 0; 
		$task_info['last_time'] = 0; 
		$task_info['pageviews'] = 0; 

		$conf_targets = $item['targets'];

		if (count($conf_targets)) {
			$is_matched = false;
			foreach($conf_targets as $conf_target) { 
				//检查对这个任务的分析结果
				if (targets_matched($conf_targets, $browser_save)) {
					$is_matched = true;
					break;
				}
			}

			if (!$is_matched) {
				//不符合条件的，设置一个bypass标志
				$task_info['bypass'] = true; 
				omp_trace('pass '.$item['name']);
			}
		}

		$runing_items[$key] = $task_info;
		omp_trace($key.' new task');
	}

	return $task_items;
}

function save_keyword($kword_type, $device, $summary, $detail_item)
{
	global $CONFIGS, $DEVSAV;

	$db_name = 'grep-datas';
	$table_name = null;

	switch($kword_type) {
	case 'kword_title': $table_name='historys'; break;
	case 'kword_interest': $table_name='interests'; break;
	case 'kword_cart': $table_name='carts'; break; 
	case 'kword_favorite': $table_name='favorites'; break;
	case 'kword_submit': $table_name='searchs'; break;
	case 'kword_account': $table_name='accounts'; break;
	default: return false;
	}

	if (!array_key_exists('ID', $DEVSAV)) {
		$ori_data = new_data($db_name, $table_name, $device);
		$DEVSAV['ID'] = $ori_data['general']['ID'];
	} else {
		$ID = $DEVSAV['ID'];
		$ori_data = data_object($db_name, $table_name, $ID.'.json');
		if (empty($ori_data)) {
			$ori_data = new_data($db_name, $table_name, $device, $ID);
		}
		$ori_data['general']['TIME'] = jsondb_date();
	}

	$ori_data['data']['summary'] = $summary;
	$detail_url = $ori_data['data']['details'];
	$detail_file = jsondb_file($db_name, $table_name, basename($detail_url));
	file_put_contents($detail_file, json_encode($detail_item)."\r\n", FILE_APPEND | LOCK_EX);

	jsondb_data($db_name, $table_name, $device, $ori_data);
}

function new_data($db_name, $table_name, $device, $exists_id=null)
{
	if ($exists_id) {
		$ID = $exists_id;
	} else {
		$ID = jsondb_id($db_name, $table_name);
	}

	return [
		'general' => [
			'ID' => $ID,
			'CREATE'=> jsondb_date(),
			'TIME'=> jsondb_date(),
			'device'=> $device
		],
		'data' => [
			'summary'=> [],
			'details'=> jsondb_url($db_name, $table_name, $ID.'.details.json'),
		]
	];
}

function push_keyword($kword_type, $async=true)
{
	global $CONFIGS, $DEVSAV, $PARAMS;

	$is_uni_caption = false;
	$regex_caption = null;
	$summary_str = null;
	$summary_md5 = null;
	$detail_item = null;
	$device = $DEVSAV['device'];

	switch($kword_type) {
	case 'kword_title': 
		$summary_str = $PARAMS['title'];
		$detail_item = [
			'time' => time(),
			'url' => $DEVSAV['Visiting'],
			'title' => $summary_str,
			'region' => $DEVSAV['region'],
		];
		break;
	case 'kword_interest':
	case 'kword_cart': 
	case 'kword_favorite':
	case 'kword_submit':
		$caption     = @$PARAMS['cap'];
		$summary_str = @$PARAMS['kword'];
		$detail_item = [
			'time' => time(),
			'url' => $DEVSAV['Visiting'],
			'caption' => $caption,
			'kword' => $summary_str,
		];
		break;
	case 'kword_account':
		$caption     = @$PARAMS['cap'];
		$username    = check_input(@$PARAMS['user']);
		$nickname    = check_input(@$PARAMS['nick']);

		$is_uni_caption = true;
		$regex_caption = "/@{$caption}$/i";
		$summary_str = make_capview($username, $nickname, $caption);

		$detail_item = [
			'time' => time(),
			'caption' => $caption,
			'username' => $username,
			'nickname' => $nickname,
		];
		break;
	}

	if (empty($summary_str)) {
		omp_trace('summary_str empty');
		return;
	}

	if (empty($summary_md5)) {
		$summary_md5 = md5($summary_str);
	}

	//这是一个队列，旧的就会被推出。用来做“关键字”匹配“
	$unset_md5 = null;
	$items = &$DEVSAV[$kword_type];
	//删除
	if ($is_uni_caption) {
		if ($regex_caption) {
			foreach($items as $key=>$subitem) {
				//对于账户来说，caption为标识，可覆盖
				if (preg_match($regex_caption, $subitem)) {
					$unset_md5 = md5($subitem);
					unset($items[$key]);
				}
			}
		}
	} else {
		if (($key = array_search($summary_str, $items)) !== false) {
			unset($items[$key]);
		}
	}
	//追加
	array_push($items, $summary_str);


	//这是一个集合，在心跳信息中，让客户端判断是否需要提交
	$kword_md5 = $kword_type . '_md5';
	if (!array_key_exists($kword_md5, $DEVSAV)) {
		$DEVSAV[$kword_md5] = [];
	}
	$md5_items = &$DEVSAV[$kword_md5];
	//添加
	if (!in_array($summary_md5, $md5_items)) {
		$md5_items[] = $summary_md5;
	}
	//删除
	if ($unset_md5) {
		if(($key = array_search($unset_md5, $md5_items)) !== false) {
			unset($md5_items[$key]);
		}
	}

	//队列最大值的维护，删除旧的
	$length = count($items);
	if ($length > KWORD_CMPS_COUNT) {
		$items_del = array_slice($items, KWORD_CMPS_COUNT);
		array_splice($items, 0, $length-KWORD_CMPS_COUNT);

		if (!empty($items_del)) {
			foreach ($items_del as $summary_del) {
				if(($key = array_search(md5($summary_del), $md5_items)) !== false) {
					unset($md5_items[$key]);
				}
			}
		}
	}

	//保持到详细列表, 在单独文件中
	$items = array_values($items);
	if ($async) {
		sync_job($kword_type, [$device, $items, $detail_item]);
	} else {
		save_keyword($kword_type, $device, $items, $detail_item);
	}
}

function get_popup_messages()
{
	global $CONFIGS, $DEVSAV;
	$confs = $CONFIGS['popup'];

	/******************************************
	  新设备检查和颁发计划任务消息
	******************************************/
	$runing_items = &$DEVSAV['popup_tasks'];
	$all_tasks = update_running_tasks($DEVSAV, $runing_items, $confs);
	$now = time();
	$session_pv = $DEVSAV['session_pv'];
	$global_pv = $DEVSAV['pageview_count'];

	/*************************************
		获取计划任务消息
	*************************************/
	$items_expired = array();
	$items_result = array();
	foreach($runing_items as $task_id =>&$task_info) {
		/*************************************
			通用任务匹配模块
		*************************************/
		$task = $all_tasks[$task_id];
		$task_print = $task_info['name'].'('.$task_info['run_times'].'/'.$task['times'].')';

		list($is_matched, $is_expired) = general_match_tasks($DEVSAV, $task_id, $task_info, $task);

		if ($is_expired) {
			$items_expired[] = $task_id;
		}

		if (!$is_matched) {
			continue;
		}

		/*************************************
			任务其他内容匹配	
		*************************************/

		//如果前面已经有了返回信息，这时遇到“互斥”只能忽略掉
		if (($task['repel'] === 'true') && (count($items_result)>0)) {
			omp_trace($task_print.' repel');
			continue;
		}

		//在时间区间内，但看看前面一个消息距离是否足够
		if (($now-$task_info['last_time'])<$task['time_interval_pre']) {
			omp_trace($task_print.' pre time not reach ');
			continue;
		}

		//检查发送周期，还没到时间的，则忽略
		if ($task['time_interval_mode']  === 'relative') {
			$time_point = $task_info['last_time'] + $task['time_interval'];
			if ($now < $time_point) {
				omp_trace($task_print.' time relative until '.date(DATE_RFC822,$time_point));
				continue;
			}
		} else {
			$interval = $task['time_interval'];
			$base_time = $task['start_time'];
			$lasttime_pass = $task_info['last_time'] - $base_time;
			$time_point = $base_time + intval($lasttime_pass/$interval+1)*$interval;
			if ($now < $time_point) {
				omp_trace($task_print.' time absolute until '.date(DATE_RFC822,$time_point));
				continue;
			}
		}

		//第一次时重建msg queue
		if ($task_info['pageviews'] === 1) {
			remake_msgque($task_info, $task);
			omp_trace('make queue: '.json_encode($task_info['msg_queue']));
		}

		//处理用户改变消息模式
		$messages = $task['messages'];
		
		if (($task_info['ori_seq'] !== $task['msg_sequence']) ||//如果用户改变了排序模式
		    ($task_info['ori_msglen'] !== count($messages)) || //如果用户改变了消息数量
		    ($task_info['ori_times'] < $task['times'])) { //如果用户增大了发生次数
			remake_msgque($task_info, $task);
			$messages = $task['messages'];
		}

		//ok, 条件吻合了，可以发送信息了
		$msg_queue = $task_info['msg_queue'];
		$try_index = $task_info['run_times'] % count($msg_queue);
		$msg_index = $msg_queue[$try_index];

		$msg_index = fix_index($msg_index, $messages);
		$selected_message = @$messages[$msg_index];

		//居然取不到消息，那也不用发了
		if (empty($selected_message)) {
			omp_trace($task_print.' cant fetch message index('.$msg_index.')');
			continue;
		}

		//保存要显示到客户端的消息
		$items_result[] = $selected_message;

		//统计和日志

		//成功取出了消息，设置状态
		$task_info['run_times'] += 1;
		$task_info['last_time'] = $now;
		$DEVSAV['popup_lasttime'] = $now;
		$DEVSAV['popup_times'] += 1;
		omp_trace($task_print.' succeed '.$selected_message['name']);

		//如果是互斥的信息，后面不用再匹配了
		if ($task['repel'] === 'true') {
			omp_trace($task_print.'break for repel');
			break;
		}
	}

	//删除被撤销的任务
	if (!empty($items_expired)) {
		omp_trace('expired '.implode(',', $items_expired));
	}

	return (count($items_result))? $items_result : false;
}

function fix_index($msg_index, $messages)
{
	if (($msg_index === -1) || ($msg_index >= count($messages))) {
		$msg_index = count($messages) - 1;
	} elseif ($msg_index < 0) {
		$msg_index = 0;
	}
	return $msg_index;
}

function handle_bind_keyword($PARAMS_SPEC=null)
{
	global $PARAMS;

	if ($PARAMS_SPEC) {
		foreach (['ktype','cap','kword'] as $parma) {
			if (isset($PARAMS_SPEC[$parma])) {
				$PARAMS[$parma] = $PARAMS_SPEC[$parma];
			}
		}
	}

	$kword_type = @$PARAMS['ktype'];
	if (empty($kword_type)) {
		return return_bind(['status'=>'error', 'error'=>'parameters error']);
	}


	push_keyword($kword_type);
	return return_bind(['status'=>'ok']);
}

function handle_bind_account($PARAMS_SPEC=null)
{
	global $PARAMS;

	if ($PARAMS_SPEC) {
		foreach (['cap','user','nick'] as $parma) {
			if (isset($PARAMS_SPEC[$parma])) {
				$PARAMS[$parma] = $PARAMS_SPEC[$parma];
			}
		}
	}

	push_keyword('kword_account');

	return return_bind(['status'=>'ok']);
}

function return_bind($result)
{
	if (is_debug_client()) {
		$result['trace'] = omp_trace(null);
	}
	return $result;
}


function handle_admin_cmd()
{
	global $CONFIGS, $DEVSAV, $PARAMS;

	$result = [];

	switch(@$PARAMS['do']) {
	    case 'reset': 
	    	$DEVSAV = reset_device_saved($DEVSAV);
		$result['status'] = 'ok';
		break;
	    case 'debug': 
		if (is_debug_client()) {
			setcookie(COOKIE_DEBUG, '', time()-3600, '/', COOKIE_DOMAIN);
			$result['status'] = 'ok';
			$result['result'] = 'off';
		} else {
			setcookie(COOKIE_DEBUG, 'true', time()+COOKIE_TIMEOUT, '/', COOKIE_DOMAIN);
			$result['status'] = 'ok';
			$result['result'] = 'on';
		}
		break;
	    case 'bind':
		$result['kword_account_md5'] =  @$DEVSAV['kword_account_md5'];
		$result['kword_account'] =  @$DEVSAV['kword_account'];
		break;
	    case 'kword':
		$kwords = [];
		switch(@$PARAMS['type']) {
			case 'title': $kwords[]='kword_title'; break;
			case 'interest': $kwords[]='kword_interest'; break;
			case 'cart': $kwords[]='kword_cart'; break;
			case 'favorite': $kwords[]='kword_favorite'; break;
			case 'submit': $kwords[]='kword_submit'; break;
			default: $kwords = ['kword_title','kword_interest','kword_cart','kword_favorite','kword_submit'];
		}
		foreach($kwords as $kword_type) {
			$result[$kword_type] = @$DEVSAV[$kword_type];
		}
	}

	return return_bind($result);
}

