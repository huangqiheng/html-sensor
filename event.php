<?php
require_once 'funcs.php';

define('RESET_KEY', 'andkey');

function main()
{
	$PARAMS = array_merge($_GET, $_POST); 
	switch(@$PARAMS['cmd']) {
		case 'config':
			update_loader_js();
			break;
		case 'listview':
			jsondb_views($PARAMS['db_name'], $PARAMS['table_name'], true);
			break;
		case 'reset':
			if (RESET_KEY === @$PARAMS['key']) {
				jsondb_reset(@$PARAMS['db_name'], @$PARAMS['table_name']);
			}
			break;
		case 'debug':
			data_idlist('grep-datas', 'historys', 33, false);
			break;
	}
	jsonp_echo(['status'=>'ok']);
	exit;
}

$field_settings = [
	'名称' => 'caption',
	'激活' => 'active',
	'主机名正则' => 'host',
	'URL正则' => 'urls',
	'用户名选择器' => 'username_selector',
	'用户名修正' => 'username_regex',
	'昵称选择器' => 'nickname_selector',
	'昵称修正' => 'nickname_regex',
	'延迟执行' => 'delay',
	'选择器初选' => 'selector',
	'表达式修正' => 'regex',
	'格式化函数' => 'formater',
	'文本框选择器' => 'selector_txt',
	'提交按钮选择器' => 'selector_btn',
	'分类标签' => 'categorys',
	'定位选择器' => 'selectors',
	'插入位置' => 'insert',
	'执行动作' => 'action',
];

$posi_vals = [
	'前面' => 'before',
	'后面' => 'after',
	'里面前' => 'inside-first',
	'里面后' => 'inside-append',
	'不处理' => 'none',
	'隐藏' => 'hide',
	'删除' => 'delete',
];

$ktype_mapper = [
	'accounts'  => 'account',
	'carts'     => 'cart',
	'favorites' => 'favorite',
	'interests' => 'interest',
	'searchs'   => 'search',
];

function update_loader_js()
{
	$settings = get_settings();
	$posi_list = get_positions();
	$accnt_ident_list = $settings['accounts'];
	$kword_ident_list = array_merge($settings['carts'], $settings['favorites'], $settings['interests']);
	$submt_ident_list = $settings['searchs'];

	$conf_arr = [];
	$conf_arr['posi_configs'] = makeconf_posi($posi_list);
	$conf_arr['accnt_ident_configs'] = makeconf_default($accnt_ident_list);
	$conf_arr['kword_ident_configs'] = makeconf_default($kword_ident_list);
	$conf_arr['submt_ident_configs'] = makeconf_default($submt_ident_list);

	$system = get_system_confs();

	append_configs($conf_arr, $system);
}


function append_configs($conf_arr, $system_arr)
{
	//准备配置数据
	$setings_str = '';
	foreach($conf_arr as $key=>$item) {
		$setings_str .= "var $key = ".indent(json_encode($item)).";\n\n";
	}

	$system_str = 'var system = ' . indent(json_encode($system_arr)) . ";\n\n";

	//查找模板
	$append_arr = [];
	foreach (glob(__DIR__.'/modules/*_template.js') as $filename){
		if (!preg_match('~/modules/(\w+)_template\.js$~',$filename, $matches)){continue;}
		$base_name = $matches[1];
		$append_arr[] = [$filename, __DIR__.'/'.$base_name.'.js'];
	}

	//替换模板中的标签
	foreach($append_arr as $item) {
		$src_settings_js = $item[0];
		$settings_js = $item[1];

		$src_settings_content =  file_get_contents($src_settings_js);
		$new_content = preg_replace('/\/\*CONFIGS_POSITION\*\//i', $setings_str, $src_settings_content);
		$new_content = preg_replace('/\/\*SYSTEM_CONFIGS\*\//i', $system_str, $new_content);

		file_put_contents($settings_js, $new_content);
	} 
}


function get_settings()
{
	$result = get_confs('grep-settings', null, '名称');
	$result = $result['grep-settings'];

	global $field_settings;
	$result = replace_keys($result, function($key)use($field_settings){
		$res = @$field_settings[$key];
		return empty($res)? $key : $res;
	});

	global $ktype_mapper;
	foreach(['accounts','carts','favorites','interests','searchs'] as $table_name) {
		if (!array_key_exists($table_name, $result)) {
			$result[$table_name] = [];
		}
		$items = &$result[$table_name];
		foreach($items as $key=>&$item) {
			$item['ktype'] = $ktype_mapper[$table_name];
			$item['active'] = (@$item['active'] === '激活');
			if (array_key_exists('delay', $item)) {
				$item['delay'] = intval($item['delay']);
			}
		}
	}
	return $result;
}

function get_positions()
{
	$posi_list = get_confs('push-settings', 'positions', '名称');
	$posi_list = $posi_list['push-settings']['positions'];

	global $field_settings, $posi_vals;

	$result = replace_keys($posi_list, function($key)use($field_settings){
		$res = @$field_settings[$key];
		return empty($res)? $key : $res;
	});

	foreach($result as $cap=>&$item) {
		foreach($item as $key=>&$value) {
			if (is_string($value)) {
				if (array_key_exists($value, $posi_vals)) {
					$value = $posi_vals[$value];
				}
			}
		}
	}

	return $result;
}

function merge_js_files()
{
	$jquery = file_get_contents(__DIR__.'/js/jquery.min.js');
	$settings = file_get_contents(get_cached_path().'settings.js');
	$append_str = "function load_jquery(){{$jquery}}\n\n{$settings}\n\n";

	$loader = file_get_contents(__DIR__.'/js/loader.js');
	$new_output = preg_replace('/}\)\(\);}/i', '', $loader);
	$new_output .= $append_str.'})();}';

	file_put_contents(get_cached_path().'loader.js', $new_output);
}


function makeconf_posi($posi_list) 
{
	$posi_sav = [];
	foreach($posi_list as $key=>$posi) {
		$new_posi = $posi;
		$new_posi['key'] = md5($posi['caption']);
		$posi_sav[] = $new_posi;
	}
	return $posi_sav;
}


function makeconf_default($accnt_ident_list)
{
	$result_sav = [];
	foreach($accnt_ident_list as $key=>$item) {
		if (!$item['active']) {
			continue;
		}
		unset($item['active']);
		$result_sav[] = $item;
	}
	return $result_sav;
}

main();

