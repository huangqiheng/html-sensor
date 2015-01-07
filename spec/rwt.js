$(function(){init_library(main);
/*
<script src="jquery-1.9.1.min.js"></script>
<script src="jquery.xdomainrequest.min.js"></script>
<script src="rwt.js"></script>
<script type="text/javascript">
	var win_color = '#590001';
	var win_notify_ttl = 5000;
	var win_modal = true;
</script>
 
------------ 赞元素定义-----------
（1）到后台设置生成赞页面
（2）配置点击按钮：

------------ 抽奖元素定义 -----------
（1）到后台设置抽奖参数
（2）配置点击按钮：
	<a href="#" target="_blank" 
	  lotto_pc="http://forms.appgame.com/lottery/spring/pc/wjmt"  or "disable"
	  lotto_mb="http://forms.appgame.com/lottery/spring/mobile/wjmt" 
	  lotto_disable=""
	  class="lotto_click"
	  onclick="return event_lotto_click(this);">
	</a>

---------- 采集信息元素定义 ----------
（1）先到jsondb生成schema:
	{genaral:{"ID","TIME","device"},data:{param1,param2...}}
（2）配置点击按钮：
	<a href="#" class="jsondb_click" db="campaigns" table="lushi" fields="lushi-inputs" closes="jsondb_qmyx_close" onclick="return event_jsondb_click(this);"></a>
（3）如果需要，配置完成后的触发点击：
	<div>全民英雄<a class="jsondb_qmyx_close" href="javascript:void(0)"></a></div>
（4）配置参数输入框：
	<input class="lushi-inputs" jsondb_field="param1" jsondb_verify="email" type="text" value="填写邮箱地址">
	<input class="lushi-inputs" jsondb_field="param2" jsondb_verify="phone" type="text" value="填写手机地址">
（5）添加配置apikeys
	<script type="text/javascript">
		var apikeys={'campaigns':{'disney':'c61f2658a9314c96b11389691beccb90'}};
	</script>
*/

//---------------------------//
//           begin           //
//---------------------------//


var class_mapper = {

};

function main(device)
{
	window.rwt_device_id = device;
	var attr_lotto_pc = 'lotto_pc';
	var attr_lotto_mobile = 'lotto_mb';
	var attr_lotto_disable = 'lotto_disable';
	var class_lotto_click = 'lotto_click';

	var attr_db_name = 'db';
	var attr_table_name = 'table';
	var attr_fields_name = 'fields';
	var attr_trigger_onclose = 'closes';
	var attr_field_name = 'jsondb_field';
	var attr_field_verify = 'jsondb_verify';
	var class_jsondb_click = 'jsondb_click';

	var mobile = is_mobile();
	var debug = is_debug();

	var get_pop_html=function(content, title){
		title || (title = '任玩堂提示');
		var pop_width = mobile? 300 : 320;
		var pop_height = mobile? 180 : 200;
		return ['<div style="width:'+pop_width+'px;height:'+pop_height+'px;line-height:180%;font-size:16px;background-color: '+win_color+'">',
				'<br><table width="100%" ><tr><td style="text-align:center; height:40px; color:white;">',
					title,
				'</td></tr><tr><td style="text-align:center; color:yellow;">',
					content,
				'</td></tr></table>',
				'<div class="win_notify_block" style="display:none;">',
					'<div style="padding:30px 0 10px 0; text-align:center; color:white; font-size:12px;">',
					'<span class="notify_text">5秒后自动消失，或 </span>',
					'<input type="button" onClick="return close_modalPopList_windows(this);" value="关闭">',
					'</div>',
				'</div>',
			'</div>'].join('');
	};

	window.close_modalPopList_windows = function(e){
		var win_obj = $(e).closest('.win_modalPopList_class');
		var win_id = win_obj[0].id;
		win_id = win_id.replace(/_body$/, '');
		close_modalPopLite(win_id);
	};

	init_modalPopLite('rwt_empty_value', get_pop_html('请不要留空白栏，谢谢！'), win_notify_ttl);
	init_modalPopLite('rwt_invalid_email', get_pop_html('请正确输入邮箱地址，谢谢！'), win_notify_ttl);
	init_modalPopLite('rwt_invalid_phone', get_pop_html('请正确输入您的手机号码，谢谢！'), win_notify_ttl);
	init_modalPopLite('rwt_jsondb_success', get_pop_html('提交成功，谢谢参与！'));
	init_modalPopLite('rwt_jsondb_failure', get_pop_html('提交失败了，请稍后再试！'), win_notify_ttl);
	init_modalPopLite('rwt_jsondb_error', get_pop_html('提交出错了，抱歉！'), win_notify_ttl);
	init_modalPopLite('rwt_jsondb_exception', get_pop_html('网络异常，请稍后再试！'));

/*
	$('.'+class_jsondb_click).click(function(e){
		return window.event_jsondb_click(e.target);
	});
*/

	window.event_jsondb_closed=function(e){
		init_modalPopLite('rwt_finish', get_pop_html('活动已经结束，请前往查看抽奖结果：<br><a href="http://hd.appgame.com/2014/04/08/339.html">任玩堂活动站</a>'));
		open_modalPopLite('rwt_finish');
	};

	window.event_jsondb_click=function(e){
		var db_name = e.getAttribute(attr_db_name);
		var table_name = e.getAttribute(attr_table_name);
		var fields = e.getAttribute(attr_fields_name);
		var closes = e.getAttribute(attr_trigger_onclose);

		if (db_name === null) {
			return false;
		}

		if (apikeys === undefined) {
			alert('please complete the configuration');
		}

		var group_data = {};
		var fields_elmts = $('.'+fields);
		for(var i=0; i<fields_elmts.length; i++){
			var input_elmt = fields_elmts[i];
			var field_name = input_elmt.getAttribute(attr_field_name);
			var vertify_type = input_elmt.getAttribute(attr_field_verify);
			var value = input_elmt.value;
			var attr_value = input_elmt.getAttribute('value');

			if (value === '') {
				open_modalPopLite('rwt_empty_value');
				return false;
			}

			switch(vertify_type){
				case 'email':
					if (!is_email(value)) {
						open_modalPopLite('rwt_invalid_email');
						return false;
					}
					break;
				case 'phone':
					if (!is_cell(value)) {
						open_modalPopLite('rwt_invalid_phone');
						return false;
					}
					break;
				case 'isset':
					if (attr_value === value) {
						open_modalPopLite('rwt_empty_value');
						return false;
					}
					break;
			}

			group_data[field_name] = value;
		}

		if (closes) {
			$('.'+closes).trigger('click');
		}

		var group_general = {};
		group_general['ID'] = '';
		group_general['TIME'] = new Date().toUTCString();
		group_general['device'] = device;

		var data = {};
		data['general'] = group_general;
		data['data'] = group_data;

		var req_data = {};
		req_data['mapper'] = device;
		req_data['data'] = data;
		req_data['db_name'] = db_name;
		req_data['table_name'] = table_name;
		req_data['apikey'] = apikeys[db_name][table_name];

		jsondb_post(req_data, function(d){
			if (d.hasOwnProperty('status')) {
				if (d.status === 'ok') {
					open_modalPopLite('rwt_jsondb_success');
					return;
				} else {
					open_modalPopLite('rwt_jsondb_failure');
					return;
				}
			}
			open_modalPopLite('rwt_jsondb_error');
		},function(){
			open_modalPopLite('rwt_jsondb_exception');
		});

		return false;
	};


	//抽奖按钮事件
	window.event_lotto_click=function(e){
		if (mobile) {
			var lotto_url = e.getAttribute(attr_lotto_mobile);
		} else {
			var lotto_url = e.getAttribute(attr_lotto_pc);
		}

		if (lotto_url === null) { 
			return true;
		}

		if (lotto_url === 'disable') { 
			return false; 
		} 

		if (window.event_lotto_start !== undefined) {
			window.event_lotto_start();
		}

		lotto_checkout(lotto_url, device, function(d){
			if (d.status === 'ok') {
				var normal_show = function(){
					var html = d.items[0].html;
					init_modalPopLite(d.lottery_id, html, -1, win_modal);
					open_modalPopLite(d.lottery_id);
				};

				if (window.event_lotto_ok !== undefined) {
					window.event_lotto_ok(d, function(been_show){
						if (!been_show) {
							normal_show();
						}
					});
				} else {
					normal_show();
				}
			} else {
				var show_normal_error = function () {
					var content = lotto_error_msg(d);
					init_modalPopLite('rwt_lotto_failure', get_pop_html(content, '抱歉，您没有中奖！'));
					open_modalPopLite('rwt_lotto_failure');
				}

				if (window.event_lotto_error !== undefined) {
					window.event_lotto_error(d, function(been_show){
						if (!been_show) {
							show_normal_error();
						}
					});
				} else {
					show_normal_error();
				}
			}
		}, function(e){
			if (window.event_lotto_except !== undefined) {
				if (window.event_lotto_except(d)) {
					return;
				}
			}
			open_modalPopLite('rwt_jsondb_exception');
		});

		return false;
	};

	var lotto_objs = $('.'+class_lotto_click);

/*
	lotto_objs.click(function(e){
		return window.event_lotto_click(e.target);
	});
*/

	for(var i=0; i<lotto_objs.length; i++) {
		var lotto_obj = lotto_objs[i];
		if (mobile) {
			var lotto_url = lotto_obj.getAttribute(attr_lotto_mobile);
		} else {
			var lotto_url = lotto_obj.getAttribute(attr_lotto_pc);
		}

		if (lotto_url === 'disable') { 
			var disable_selector = lotto_obj.getAttribute(attr_lotto_disable);
			if (disable_selector) {
				$('.'+disable_selector).css("display", "none");
			}
		}
	}
}

//---------------------------//
//            end            //
//---------------------------//
function init_library(cb_main)
{
	compatible_functions();
	load_modalPopLite();
	get_device_id(cb_main);
}

function is_mobile()
{
	var a = navigator.userAgent||navigator.vendor||window.opera;
	return /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4));
}

Date.prototype.format = function(format) //author: meizz
{
	var o = {
		"M+" : this.getMonth()+1, //month
		"d+" : this.getDate(),    //day
		"h+" : this.getHours(),   //hour
		"m+" : this.getMinutes(), //minute
		"s+" : this.getSeconds(), //second
		"q+" : Math.floor((this.getMonth()+3)/3),  //quarter
		"S" : this.getMilliseconds() //millisecond
	}

	if(/(y+)/.test(format)) format=format.replace(RegExp.$1,
			(this.getFullYear()+"").substr(4 - RegExp.$1.length));
	for(var k in o)if(new RegExp("("+ k +")").test(format))
		format = format.replace(RegExp.$1,
				RegExp.$1.length==1 ? o[k] :
				("00"+ o[k]).substr((""+ o[k]).length));
	return format;
}

function local_time(time)
{
	var d = new Date();
	var gmtHours = d.getTimezoneOffset()/60;
	var time =  new Date(time);
	return time+gmtHours;
}

function lotto_error_msg(d) {
	var errno = d.errno, remain= d.time_remain;
	var err_num = parseInt(errno);
	var start_time = new Date(d.start).format('yyyy-MM-dd hh:mm:ss');
	var next_time = new Date(d.next_time).format('yyyy-MM-dd hh:mm:ss');

	//console.log(new Date(d.next_time).toLocaleString());

	var err_msg = '';
	switch(err_num) {
		case 1000: err_msg = '您领取了的奖品数量已经超过规定了(1)。'; break;
		case 1001: err_msg = '您领取了的奖品数量已经超过规定了(2)。'; break;
		case 1002: err_msg = '您还没到下一次抽奖时间（'+remain+'）'; break;
		case 1100: err_msg = '抽奖太频繁，请稍后再来（'+remain+'）'; break;
		case 1101: err_msg = '中奖太频繁，请稍后再来（'+remain+'）'; break;
		case 1200: err_msg = '本期奖品已经领光，请下一轮抽奖时间早点来哦（'+remain+'）'; break;
		case 1201: err_msg = '奖品已经发完了，十分抱歉。请关注一下次抽奖周期（'+remain+'）'; break;
		case 1202: err_msg = '奖品已经全部被领光了，十分抱歉。'; break;

		case 4001: err_msg = 'API调用错误'; break;

		case 2001: err_msg = '只能用手机来点击抽奖，十分抱歉。'; break;
		case 2003: err_msg = '这次您未能抽到奖品，十分抱歉。请下次再来（'+remain+'）'; break;
		case 2005: err_msg = '完全没有奖品了，谢谢您的参与！'; break;
		case 2006: err_msg = '您领取的实物奖品已经超出限制，请下次再来（'+remain+'）'; break;
		case 2007: err_msg = '您领取的兑换码奖品已经超出限制，请下次再来（'+remain+'）'; break;
		case 2008: err_msg = '您领取的实物奖品数量超出IP限制了，请下次再来（'+remain+'）'; break;
		case 2009: err_msg = '您领取的兑换码奖品数量超出IP限制了，请下次再来（'+remain+'）'; break;
		case 2010: err_msg = '您领取的奖品奖项超出限制，请下次再来（'+remain+'）'; break;
		case 2011: err_msg = '您未能成功领取奖品，请下次再来（'+remain+'）'; break;

		case 5000: err_msg = '需要补充联系方式，谢谢！'; break;
		case 5001: err_msg = '还没到开奖时间呢。请到时再来<br>（'+start_time+'）'; break;
		case 5002: err_msg = '已经过了抽奖时间。敬请关注下次新一轮的抽奖，谢谢！'; break;
		case 5003: err_msg = '抽奖已经关闭，谢谢！'; break;

		case 911: err_msg = '抱歉，系统遇到问题，抽奖暂停。我们尽快处理和恢复！'; break;
		default:   err_msg = '发生了未知错误'; break;
	}
	return err_msg;
}

function lotto_checkout(lotto_url, device, cb_done, cb_fail)
{
	var req_data = {
		cmd: 'checkout',
		device: device
	};

	if (is_debug()) {
		req_data.debug = true;
	}

	$.ajax({
		type : 'GET',
		dataType : "json",
		data: req_data,
		url : lotto_url
	}).success(cb_done).error(cb_fail);
}

function jsondb_post(data, cb_done, cb_fail)
{
	$.ajax({
		type : 'POST',
		dataType : "json",
		data: data,
		url : 'http://db.appgame.com/service/binder/data.php'
	}).success(cb_done).error(cb_fail);
}

function jsondb_get(param, cb_done, cb_fail)
{
	$.ajax({
		type : 'GET',
		dataType : "json",
		data: param,
		url : 'http://db.appgame.com/service/mapper/index.php'
	}).success(cb_done).error(cb_fail);
}

function is_debug()
{
	var debug = get_cookie('device_dbg');
	if (!debug) {
		return false;
	}
	return (debug === 'true');
}

function get_device_id(cb_done)
{
	var id_in_cookie = get_cookie('device_id');
	if (id_in_cookie !== '') {
		cb_done(id_in_cookie);
		return;
	}

	var query_obj = {};
	query_obj.cmd = 'hbeat';
	query_obj.nomsg = 'true';
	query_obj.title = $('title:first').text().substring(0,256);

	$.ajax({
		type : "GET",
		dataType : "jsonp",
		data: query_obj,
		url : 'http://dynamic.appgame.com/omp.php'
	}).done(function(d){
		cb_done(d.device);
	});
}

function get_cookie(cname)
{
	var name = cname + "=";
	var ca = document.cookie.split(';');
	for(var i=0; i<ca.length; i++)
	{
		var c = ca[i].trim();
		if (c.indexOf(name)==0) return c.substring(name.length,c.length);
	}
	return "";
}

function compatible_functions()
{
	$.support.cors = true;	

	if(typeof String.prototype.trim !== 'function') {
		String.prototype.trim = function() {
			return this.replace(/^\s+|\s+$/g, ''); 
		}
	}

	if (!Array.prototype.indexOf)
	{
		Array.prototype.indexOf = function(elt /*, from*/)
		{
			var len = this.length >>> 0;
			var from = Number(arguments[1]) || 0;
			from = (from < 0)
				? Math.ceil(from)
				: Math.floor(from);
			if (from < 0)
				from += len;

			for (; from < len; from++)
			{
				if (from in this &&
						this[from] === elt)
					return from;
			}
			return -1;
		};
	}
}

function open_modalPopLite(win_id)
{
	var open_id = win_id+'_open'; 
	var win_obj = $('#'+open_id);
	win_obj.trigger('click');

	var win = win_obj.closest('.win_modalPopList_class')[0];
	var ttl = win.getAttribute('ttl');

	if (ttl) {
		var ttl  = parseInt(ttl);

		var body_id = win_id+'_body'; 
		var notify_obj = $('#'+body_id+' .win_notify_block:hidden');
		notify_obj.css('display', 'block');
		var notify_text = $('#'+body_id+' .notify_text');

		if (ttl === -1) {
			notify_text.text('');
		} else {
			notify_text.text(ttl+'秒后自动消失，或 ');
			setTimeout(function(){
				close_modalPopLite(win_id);
			}, ttl);
		}
	}
}

function close_modalPopLite(win_id)
{
	var close_id = win_id+'_close';
	$('#'+close_id).trigger('click');
}

function delete_modalPopLite(win_id)
{
	var win_body_id = win_id+'_body';
	$('#'+win_body_id).remove();
}

function init_modalPopLite(win_id, content_html, ttl, is_modal)
{
	var win_body_id = win_id+'_body';
	var open_id = win_id+'_open'; 
	var close_id = win_id+'_close';

	if ($('#'+win_body_id).length !== 0) {
		delete_modalPopLite(win_id);
	}

	ttl || (ttl=-1);
	is_modal || (is_modal = false);

	$('body').append([
		'<div id="'+win_body_id+'" class="win_modalPopList_class" ttl="'+ttl+'">',
			'<div id="'+open_id+'"></div>',
			'<div id="'+close_id+'"></div>',
			'<div id="'+win_id+'">'+content_html+'</div>',
		'</div>'
	].join(''));

	$('#'+win_id).modalPopLite({
		openButton: '#'+open_id,
		closeButton: '#'+close_id, 
		isModal: is_modal
	});
}

function load_modalPopLite()
{
	if (window.modalPopLite_loaded !== undefined) {return;}
	window.modalPopLite_loaded = true;

	(function (a) { var b = 0; a.fn.modalPopLite = function (c) { var c = a.extend({}, { openButton: "modalPopLite-open-btn", closeButton: "modalPopLite-close-btn", isModal: false }, c); return this.each(function () { b++; var d = b; var e = false; obj = a(this); triggerObj = c.openButton; closeObj = c.closeButton; isReallyModel = c.isModal; obj.before('<div id="modalPopLite-mask' + d + '" style="width:100%" class="modalPopLite-mask" />'); obj.wrap('<div id="modalPopLite-wrapper' + d + '" style="left: -10000px;" class="modalPopLite-wrapper" />'); obj.addClass("modalPopLite-child-" + d); a(triggerObj).click(function (b) { b.preventDefault(); var c = a(window).width(); var f = a(window).height(); var g = a(".modalPopLite-child-" + d).outerWidth(); var h = a(".modalPopLite-child-" + d).outerHeight(); var i = c / 2 - g / 2; var j = f / 2 - h / 2; a("#modalPopLite-mask" + d).css("height", f + "px"); a("#modalPopLite-mask" + d).fadeTo("slow", .6); a("#modalPopLite-wrapper" + d).css({ left: i + "px", top: j }); a("#modalPopLite-wrapper" + d).fadeIn("slow"); e = true }); a(closeObj).click(function (b) { b.preventDefault(); a("#modalPopLite-mask" + d).hide(); a("#modalPopLite-wrapper" + d).css("left", "-10000px"); e = false }); if (!isReallyModel) { a("#modalPopLite-mask" + d).click(function (b) { b.preventDefault(); a(this).hide(); a("#modalPopLite-wrapper" + d).css("left", "-10000px"); e = false }) } a(window).resize(function () { if (e) { var b = a(window).width(); var c = a(window).height(); var f = a(".modalPopLite-child-" + d).outerWidth(); var g = a(".modalPopLite-child-" + d).outerHeight(); var h = b / 2 - f / 2; var i = c / 2 - g / 2; a("#modalPopLite-wrapper" + d).css({ left: h + "px", top: i }) } }) }) }; a.fn.modalPopLite.Close = function (b) { a("#modalPopLite-mask" + b).hide(); a("#modalPopLite-wrapper" + thisPopID).css("left", "-10000px") }; a.fn.modalPopLite.ShowProgress = function () { a('<div class="popBox-ajax-progress"></div>').appendTo("body") }; a.fn.modalPopLite.HideProgress = function () { a(".popBox-ajax-progress").remove() } })($);

	var hereDoc = function (f) {
		return f.toString().replace(/^[^\/]+\/\*!?/, '').replace(/\*\/[^\/]+$/, '');
	};

	var dialog_css = hereDoc(function() {/*!
<style type="text/css">
.modalPopLite-mask
{
	position:fixed;
	z-index:9000;
	background-color:#000;
	display:none;
	top:0px;
	left:0px;
	width:100%;
}
.modalPopLite-wrapper
{
	position:fixed;
	z-index:9999;
	-webkit-border-radius: .5em; 
	-moz-border-radius: .5em;
	border-radius: .5em;
	-webkit-box-shadow: 0 0px 25px rgba(0,0,0,.9);
	-moz-box-shadow: 0 0px 25px rgba(0,0,0,.9);
	box-shadow: 5px 5px 10px rgba(0, 0, 0, 0.4);    
	border: 5px solid rgb(000, 0, 0);
	border: 5px solid rgba(000, 0, 0, .5);
}
.popBox-holder 
{
	display:none;
	position: absolute;
	left: 0px;
	top: 0px;
	width:100%;
	height:100%;
	text-align:center;
	z-index: 999;
	background-color:#000;
	filter:alpha(opacity=40);
	opacity:0.5;
}
.popBox-container 
{
	display:none;
	background-color: #fff;
	border:4px solid #000;
	padding:10px;
	text-align:center;
	z-index: 1000;
	-webkit-border-radius: .5em; 
	-moz-border-radius: .5em;
	border-radius: .5em;
	-webkit-box-shadow: 0 1px 2px rgba(0,0,0,.2);
	-moz-box-shadow: 0 1px 2px rgba(0,0,0,.2);
	box-shadow: 0 1px 2px rgba(0,0,0,.2);
}
.popBox-container .done-button
{
	margin-top:10px;
}
.popBox-container .button 
{
	display: inline-block;
	zoom: 1; 
	*display: inline;
	vertical-align: baseline;
	margin: 0 2px;
	outline: none;
	cursor: pointer;
	text-align: center;
	text-decoration: none;
	font: 14px/100% Arial, Helvetica, sans-serif;
	padding: .5em 2em .55em;
	text-shadow: 0 1px 1px rgba(0,0,0,.3);
	-webkit-border-radius: .5em; 
	-moz-border-radius: .5em;
	border-radius: .5em;
	-webkit-box-shadow: 0 1px 2px rgba(0,0,0,.2);
	-moz-box-shadow: 0 1px 2px rgba(0,0,0,.2);
	box-shadow: 0 1px 2px rgba(0,0,0,.2);
}
.popBox-container .button:hover 
{
	text-decoration: none;
}
.popBox-container .button:active 
{
	position: relative;
	top: 1px;
}

.popBox-container .small 
{
	font-size: 11px;
	padding: .2em 1em .275em;
}
.popBox-container .blue 
{
	color: #d9eef7;
	border: solid 1px #0076a3;
	background: #0095cd;
	background: -webkit-gradient(linear, left top, left bottom, from(#00adee), to(#0078a5));
	background: -moz-linear-gradient(top,  #00adee,  #0078a5);
	filter:  progid:DXImageTransform.Microsoft.gradient(startColorstr='#00adee', endColorstr='#0078a5');
}
.popBox-container .blue:hover 
{
	background: #007ead;
	background: -webkit-gradient(linear, left top, left bottom, from(#0095cc), to(#00678e));
	background: -moz-linear-gradient(top,  #0095cc,  #00678e);
	filter:  progid:DXImageTransform.Microsoft.gradient(startColorstr='#0095cc', endColorstr='#00678e');
}
.popBox-container .blue:active 
{
	color: #80bed6;
	background: -webkit-gradient(linear, left top, left bottom, from(#0078a5), to(#00adee));
	background: -moz-linear-gradient(top,  #0078a5,  #00adee);
	filter:  progid:DXImageTransform.Microsoft.gradient(startColorstr='#0078a5', endColorstr='#00adee');
}
.popBox-ajax-progress
{
	position: fixed;
	left: 0px;
	top: 0px;
	width:100%;
	height:100%;
	text-align:center;
	z-index: 99999;
	background-color:#000;
	filter:alpha(opacity=40);
	opacity:0.5;
	background-image: url('ajax-loader.gif');
	background-repeat:no-repeat;
	background-position:center center;
}
</style>
	 */});
	$('head').append(dialog_css);

	//$('#'+win_id).modalPopLite({ openButton: '#'+open_id, closeButton: '#'+close_id });
}

function is_cell(text)
{ 
	var pattern=/(^0{0,1}1[3-8]{1}[0-9]{9}$)/; 
	if(pattern.test(text)) { 
		return true; 
	} else { 
		return false; 
	} 
} 

function is_phone(text)
{ 
	var pattern=/(^[0-9]{3,4}\-[0-9]{3,8}$)|(^[0-9]{3,8}$)|(^\([0-9]{3,4}\)[0-9]{3,8}$)|(^0{0,1}1[3-8]{1}[0-9]{9}$)/; 
	if(pattern.test(text)) { 
		return true; 
	} else { 
		return false; 
	} 
} 

function is_email(text) { 
	return /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(text);
}

});
