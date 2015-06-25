if(self==top){(function(){

if (window.omp_shr_objs === undefined) {
	window.omp_shr_objs = {};
} else {
	return;
}

var system = {
  "load_main_library":[
    [
      0,
      ".html$",
      "http:\/\/ompx.hqh.me\/spec\/main.js?target=html"
    ],
    [
      2,
      ".php$",
      "http:\/\/ompx.hqh.me\/spec\/main.js?target=php"
    ],
    [
      999,
      null,
      "http:\/\/ompx.hqh.me\/spec\/main.js"
    ]
  ],
  "bypass_url_regex":[
    "-homemini$"
  ],
  "push_server":"dynamic.appgame.com",
  "push_modes":"(data.msie)? 'stream' : 'websocket|eventsource|longpolling|stream'",
  "push_loglevel":"debug",
  "root_prefix":"http:\/\/ompx.hqh.me\/",
  "is_login_enabled":"false",
  "is_push_enabled":"false",
  "is_hbeat_enabled":"true",
  "is_ident_enabled":"true",
  "is_popup_enabled":"true",
  "is_replace_enabled":"true",
  "is_asyncmsg_enabled":"false",
  "type_desc":{
    "load_main_library":"json",
    "bypass_url_regex":"string",
    "push_server":"string",
    "push_modes":"code",
    "push_loglevel":"string",
    "root_prefix":"string",
    "is_login_enabled":"string",
    "is_push_enabled":"string",
    "is_hbeat_enabled":"string",
    "is_ident_enabled":"string",
    "is_popup_enabled":"string",
    "is_replace_enabled":"string",
    "is_asyncmsg_enabled":"string"
  }
};



if (url_matched(sys_conf('bypass_url_regex',[]))) {
	console.log('pass');
	return;
}

var data = window.omp_shr_objs;

initialzation();

function initialzation()
{
	init_compatible();
	init_functions();
	init_css();
	exec_mainjs();
}


function init_functions()
{
	data.ajax = load_ajax();
	data.select = load_selector();
	data.LazyLoad = load_LazyLoad();
	data.system = system;
	data.url_matched = url_matched;
	data.ua_matched = ua_matched;
	data.host_matched = host_matched;
	data.self_url = script_url();
	data.self_host = script_url('hostname');
	data.root_prefix = sys_conf('root_prefix', script_url('prefix'));

	data.log = log;

	data.init_containers = init_containers;
	data.exec_containers = exec_containers;
	data.show_containers = show_containers;
	data.ident_account = ident_account;
	data.ident_keyword = ident_keyword;
	data.ident_submits = ident_submits;

	data.base64_encode = base64_encode;
	data.base64_decode = base64_decode;
	data.parse_url = parse_url;
	data.rawurldecode = rawurldecode;
	data.rawurlencode = rawurlencode;
	data.crc32 = crc32;
	data.utf8_encode = utf8_encode;
	data.utf8_decode = utf8_decode;
	data.md5 = load_md5();
	data.json_decode = json_decode;
	data.json_encode = json_encode;
	data.json_last_error = json_last_error;
	data.set_cookie = set_cookie;
	data.get_cookie = get_cookie;
	data.que_cookie = que_cookie;
	data.msie = /msie/.test(navigator.userAgent.toLowerCase());
	data.is_mobile = is_mobile;
	data.local_time = local_time;
	data.is_email = is_email;
	data.here_doc = here_doc;
	data.conf = sys_conf;
}

// ********************************** //
// ***********  配置数据 ************ //
// ********************************** //
var posi_configs = [
  {
    "caption":"\u6240\u6709\u9875\u9762body",
    "categorys":[
      "body"
    ],
    "selectors":[
      "body"
    ],
    "insert":"inside-first",
    "action":"none",
    "urls":[
      
    ],
    "key":"96588af69842b3c1b21994c8f73e4dc6"
  }
];

var accnt_ident_configs = [
  {
    "caption":"\u817e\u8bafQQ",
    "host":"qq.com",
    "username_selector":[
      
    ],
    "username_regex":[
      "ptui_loginuin=(\\d+);"
    ],
    "nickname_selector":[
      
    ],
    "nickname_regex":[
      
    ],
    "urls":[
      
    ],
    "ktype":"account"
  },
  {
    "caption":"\u6dd8\u5b9d\u7f51\u8d26\u6237",
    "host":"taobao.com",
    "username_selector":[
      ".login-info .menu-hd a"
    ],
    "username_regex":[
      
    ],
    "nickname_selector":[
      
    ],
    "nickname_regex":[
      
    ],
    "urls":[
      
    ],
    "ktype":"account"
  },
  {
    "caption":"\u767e\u5ea6\u8d26\u6237",
    "host":"tieba.baidu.com",
    "username_selector":[
      "span.u_username_title",
      "#user_info .user_name a"
    ],
    "username_regex":[
      
    ],
    "nickname_selector":[
      
    ],
    "nickname_regex":[
      
    ],
    "urls":[
      
    ],
    "ktype":"account"
  },
  {
    "caption":"\u4efb\u73a9\u5802\u7ba1\u7406\u5458",
    "host":"appgame.com",
    "username_regex":[
      "wordpress_logged_in_\\w+=(\\w+)%7C"
    ],
    "urls":[
      
    ],
    "username_selector":[
      
    ],
    "nickname_selector":[
      
    ],
    "nickname_regex":[
      
    ],
    "ktype":"account"
  }
];

var kword_ident_configs = [
  {
    "caption":"\u6dd8\u5b9d\u8d2d\u7269\u8f66",
    "delay":0,
    "host":"cart.taobao.com",
    "urls":[
      ".html$"
    ],
    "selector":"",
    "regex":"",
    "formater":"",
    "ktype":"cart"
  },
  {
    "caption":"\u4efb\u73a9\u5546\u57ce\u6536\u85cf\u5939",
    "delay":0,
    "host":"shop.appgame.com",
    "urls":"",
    "selector":"",
    "regex":"",
    "formater":"",
    "ktype":"favorite"
  },
  {
    "caption":"\u5173\u6ce8\u7684\u6e38\u620f",
    "delay":20,
    "host":"www.appgame.com",
    "urls":[
      ".html$"
    ],
    "selector":"title",
    "regex":"",
    "formater":"",
    "ktype":"interest"
  }
];

var submt_ident_configs = [
  {
    "caption":"\u6dd8\u5b9d\u641c\u7d22\u8bcd",
    "host":"taobao.com",
    "urls":"",
    "selector_txt":"",
    "selector_btn":"",
    "ktype":"search"
  }
];



// ********************************** //
// ***********  函数库  ************* //
// ********************************** //

function regex_matched (src, reg_arr) {
	if (src) {
		for (var index in reg_arr) {
			var patt_str = reg_arr[index];
			var patt = new RegExp(patt_str, 'i');
			if (patt.test(src)) {
				return parseInt(index,10)+1;
			}
		}
	}
	return 0;
}

function url_matched(reg_arr) {
	return regex_matched(window.location.href, reg_arr);
}

function ua_matched(reg_arr) {
	return regex_matched(navigator.userAgent, reg_arr);
}

function host_matched(reg_arr) {
	return regex_matched(window.location.hostname, reg_arr);
}

function script_url(part) {   
	var scripts = document.getElementsByTagName("script");
	self_url = scripts[scripts.length-1].src;  

	if (part === undefined) {
		return self_url;
	}

	var parser = document.createElement('a');
	parser.href = self_url;

	switch(part) {
	case 'prefix': return parser.protocol+'//'+parser.hostname+'/';
	case 'hostname': return parser.hostname;
	default: return self_url;
	}
}

function log(msg)
{
	if (data.hasOwnProperty('push_loglevel')) {
		if (data.push_loglevel === 'debug') {
			window.console && console.log(msg);
		}
		return;
	}

	window.console && console.log(msg);
}

function get_posi(key)
{
	for(var i=0; i<posi_configs.length; i++) {
		var config = posi_configs[i]; 

		if (typeof config === 'string') {
			if (config.key === key) {
				return config;
			}
		} else {
			for(var j=0; j<key.length; j++) {
				if (config.key === key[j]) {
					return config;
				}
			}
		}
	}

	return null;
}

function exec_containers(cmdbox)
{
	var posi = get_posi(cmdbox.position);
	var source_insert = ['before','after','inside-first','inside-append'];
	var source_action = ['none','hide','delete'];
	var selectors = [];

	if (posi) {
		selectors = posi.selectors; 
		var index_insert = source_insert.indexOf(posi.insert);
		var index_action = source_action.indexOf(posi.action);
	} else {
		selectors.push(cmdbox.position);
		var index_insert = 1;
		var index_action = 0;
	}

	for (var i=0; i<selectors.length; i++) {
		var replaced = data.select(selectors[i]);
		if (replaced.length == 0) {
			continue;
		}
		var new_item = data.select('<div class="replace_div_container">'+cmdbox.text+'</div>');

		switch(index_insert) {
			case 0: replaced.before(new_item);break;
			case 1: replaced.after(new_item);break;
			case 2: replaced.prepend(new_item);break;
			case 3: replaced.append(new_item);break;
			default: continue;
		}

		switch(index_action) {
			case 0: break;
			case 1: 
				replaced.addClass('omp_replaced_hide_cmd');
				break;
			case 2: replaced.remove();break;
			default: continue;
		}

		if (cmdbox.sticky == 'false') {
			if (cmdbox.time > 0) {
				//var begin = time();
				setTimeout(function() {
					if (replaced.hasClass('omp_replaced_hide_cmd')) {
						replaced.removeClass('omp_replaced_hide_cmd');
					}
					new_item.remove();
				}, cmdbox.time);
			}
		}
	}
}

function match_host_url(obj)
{
	if (obj.hasOwnProperty('host')) {
		if (data.host_matched([obj.host]) === 0) {
			return false; 
		}
	}

	if (obj.hasOwnProperty('url')) {
		if (data.url_matched([obj.url]) === 0) {
			return false; 
		}
	}

	return true; 
}

function is_conf_valid(conf)
{
	if (typeof conf === 'undefined') {
		return false;
	}

	if (conf.length === 0) {
		return false;
	}

	if(!conf[0].hasOwnProperty('ktype')) {
		return false;
	}

	return true;
}

function kword_formater(kword)
{
	var kword_arr = kword.split(',');
	var title = document.title;
	var result = [];
	for(var i=0; i<kword_arr.length; i++) {
		var word = kword_arr[i].trim();
		if (title.indexOf(word) !== -1) {
			result.push(word);
		}
	}
	return result;
}

function ident_keyword(binder)
{
	data.kword_binder = binder;
	if (!is_conf_valid(kword_ident_configs)) {
		return false;
	}

	var report_keyword = function(conf) {
		var kword = grep_matched_value(conf.selector, conf.regex);
		if (kword === '') {
			return false;
		}

		if (conf.formater !== '') {
			var conf_formater = eval('('+conf.formater+')');
			kword = conf_formater(kword);
		} else {
			kword = kword_formater(kword);
		}

		var key_obj = {};
		key_obj['ktype'] = conf.ktype;
		key_obj['caption'] = conf.caption;
		key_obj['keyword'] = kword;
		data.kword_binder(key_obj);
		return true;
	};

	var has_result = false;

	for(var i=0; i<kword_ident_configs.length; i++) {
		var config = kword_ident_configs[i]; 

		if (!match_host_url(config)) {
			continue
		}

		var delay = parseInt(config.delay);

		if (delay > 0 ) {
			var delay_obj = deepCopy(config);
			setTimeout(function(){
				report_keyword(delay_obj);
			}, delay * 1000);
		} else {
			if (report_keyword(config)) {
				has_result = true;
			}
		}
	}

	return has_result;
}

function ident_submits(binder)
{
	data.submt_binder = binder;

	if (!is_conf_valid(submt_ident_configs)) {
		return false;
	}

	var report_input_text = function(conf) {
		var input_txt = data.select(conf.selector_txt).val();
		if (input_txt.length === 0) {return;}
		var submt_obj = {};
		submt_obj['caption'] = conf.caption;
		submt_obj['ktype'] = 'submit';
		submt_obj['keyword'] = input_txt;
		data.submt_binder(submt_obj);
	};

	for(var i=0; i<submt_ident_configs.length; i++) {
		var config = submt_ident_configs[i]; 

		if (!match_host_url(config)) {
			continue
		}

		var data_obj = deepcopy(config);

		data.select(this.selector_txt).keydown(data_obj, function(e) {
			if (e.which == 13) {
				report_input_text(e.data);
			}
		});

		data.select(this.selector_btn).mouseup(data_obj, function(e) {
			report_input_text(e.data);
		});
	}

	return true;
}

function ident_account(binder)
{
	if (!is_conf_valid(accnt_ident_configs)) {
		return false;
	}

	var has_result = false;

	for(var i=0; i<accnt_ident_configs.length; i++) {
		var config = accnt_ident_configs[i]; 
		if (!match_host_url(config)) {
			continue
		}

		var username = grep_matched_value(config.username_selector, config.username_regex);
		var nickname = grep_matched_value(config.nickname_selector, config.nickname_regex);
		var capview = make_capview(username, nickname, config.caption);

		if (capview === false) {
			return true; //continue
		}

		var id_obj = {};
		id_obj['caption'] = config.caption;
		id_obj['username'] = username;
		id_obj['nickname'] = nickname;
		id_obj['capview'] = capview;
		binder(id_obj);
		has_result = true;
	}

	return has_result;
}

function make_capview(username, nickname, caption)
{
	if ((username === '') && (nickname === '')){
		return false;
	}

	if (username !== '') {
		return username + '@' + caption;
	}

	if (nickname !== '') {
		return nickname + '@' + caption;
	}

	return nickname + '(' + username + ')@' + caption; 
}

function grep_matched_value(selectors, regex_patt) 
{
	var res_val = get_matched_value(selectors, regex_patt);
	return res_val.replace(/<(?:.|\n)*?>/, '').substring(0,256);
}

function get_selectors_text(selectors)
{
	if (selectors.length > 0) {
		for(var i=0; i<selectors.length; i++) {
			var selector = selectors[i]; 
			var target_text = data.select(selector).text();
			if (target_text.length > 0) {
				return target_text.trim();
			}
		}
	}
	return null;
}

function get_regex_patts_text(target_text, regex_patts)
{
	if (target_text.length === 0) {
		return null;
	}

	for(var i=0; i<regex_patts.length; i++) {
		var regex_patt = regex_patts[i]; 
		var patt = new RegExp(regex_patt, 'ig');
		var result = patt.exec(target_text);
		if (result) {
			return result[1].trim();
		}
	}

	return null;
}

function get_matched_value(selectors, regex_patts) 
{
	var target_text = null;
	var result_text = null;

	if (target_text = get_selectors_text(selectors)) {
		if (result_text = get_regex_patts_text(target_text, regex_patts)) {
			return result_text;
		}
	} else {
		target_text = document.cookie;
		if (result_text = get_regex_patts_text(target_text, regex_patts)) {
			return result_text;
		}

		target_text = data.select('html:first').html();
		if (result_text = get_regex_patts_text(target_text, regex_patts)) {
			return result_text;
		}
	}

	return '';
}

function init_css()
{
	var css_str = [
	"<style type='text/css'>",
		'.omp_replaced_hide_cmd,',
		'.omp_replaced_hide {',
			'display: none;',
		'}',
	'</style>'
	].join("\n");
	data.select(css_str).appendTo('head');
}

function show_containers()
{
	var hiden_items = data.select('.omp_replaced_hide');
	if (hiden_items.length >0) {
		data.log(hiden_items);
		hiden_items.removeClass('omp_replaced_hide');
	}
}

function init_containers()
{
	var result_obj = {};

	for(var i=0; i<posi_configs.length; i++) {
		var config = posi_configs[i];
		var url_matched = false;

		if (config.urls.length === 0) {
			url_matched = true;
		} else {
			for(var j=0; j<config.urls.length; j++) {
				var url_exp = config.urls[j];
				if (url_exp === '') {
					url_matched = true;
					break;
				}

				var patt = new RegExp(url_exp, 'i');
				if (patt.test(window.location.href)) {
					url_matched = true;
					return false;
				}
			}

		}

		if (!url_matched) {
			continue;
		}

		var number = 0;
		for(var j=0; j<config.selectors.length; j++) {
			var selector = config.selectors[j];

			var container = data.select(selector.toString());
			if (container.length == 0) {
				continue;
			}
			number += container.length;

			if (config.action !== 'none') {
				container.addClass('omp_replaced_hide');
			}
		}

		if (number) {
			result_obj[config.key] = number;
		}
	}

	return result_obj;
}

function set_cookie(cname,cvalue,seconds)
{
	var d = new Date();
	d.setTime(d.getTime()+(seconds*1000));
	var expires = "expires="+d.toGMTString();
	document.cookie = cname + "=" + cvalue + "; " + expires + ';path=/';
}

function get_cookie(cname)
{
	var name = cname + "=";
	var ca = document.cookie.split(';');
	for(var i=0; i<ca.length; i++) {
		var c = ca[i].trim();
		if (c.indexOf(name)==0) return c.substring(name.length,c.length);
	}
	return "";
}

function que_cookie(obj, ttl)
{
	ttl = ttl || 300;
	var coded = json_encode(obj);
	var msg_block = rawurlencode(coded);
	var cookie_name = 'device_msg';
	var cookval = get_cookie(cookie_name);
	if (cookval === '') {
		cookval = msg_block;
	} else {
		cookval = cookval + ','+ msg_block;
	}
	set_cookie(cookie_name, cookval, ttl);
}

function json_last_error () {
	/*
	   JSON_ERROR_NONE = 0
	   JSON_ERROR_DEPTH = 1 // max depth limit to be removed per PHP comments in json.c (not possible in JS?)
	   JSON_ERROR_STATE_MISMATCH = 2 // internal use? also not documented
	   JSON_ERROR_CTRL_CHAR = 3 // [\u0000-\u0008\u000B-\u000C\u000E-\u001F] if used directly within json_decode(),
	   JSON_ERROR_SYNTAX = 4
	 */
	return this.php_js && this.php_js.last_error_json ? this.php_js.last_error_json : 0;
}

function json_encode (mixed_val) 
{
	// *        example 1: json_encode(['e', {pluribus: 'unum'}]);
	// *        returns 1: '[\n    "e",\n    {\n    "pluribus": "unum"\n}\n]'
	var retVal, json = this.window.JSON;
	try {
		if (typeof json === 'object' && typeof json.stringify === 'function') {
			retVal = json.stringify(mixed_val); // Errors will not be caught here if our own equivalent to resource
			//  (an instance of PHPJS_Resource) is used
			if (retVal === undefined) {
				throw new SyntaxError('json_encode');
			}
			return retVal;
		}

		var value = mixed_val;
		var quote = function (string) {
			var escapable = /[\\\"\u0000-\u001f\u007f-\u009f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
			var meta = { // table of character substitutions
				'\b': '\\b',
				'\t': '\\t',
				'\n': '\\n',
				'\f': '\\f',
				'\r': '\\r',
				'"': '\\"',
				'\\': '\\\\'
			};

			escapable.lastIndex = 0;
			return escapable.test(string) ? '"' + string.replace(escapable, function (a) {
					var c = meta[a];
					return typeof c === 'string' ? c : '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
			}) + '"' : '"' + string + '"';
		};

		var str = function (key, holder) {
			var gap = '';
			var indent = '    ';
			var i = 0; // The loop counter.
			var k = ''; // The member key.
			var v = ''; // The member value.
			var length = 0;
			var mind = gap;
			var partial = [];
			var value = holder[key];

			// If the value has a toJSON method, call it to obtain a replacement value.
			if (value && typeof value === 'object' && typeof value.toJSON === 'function') {
				value = value.toJSON(key);
			}

			// What happens next depends on the value's type.
			switch (typeof value) {
				case 'string':
					return quote(value);

				case 'number':
					return isFinite(value) ? String(value) : 'null';

				case 'boolean':
				case 'null':
					return String(value);

				case 'object':
					if (!value) {
						return 'null';
					}
					if ((this.PHPJS_Resource && value instanceof this.PHPJS_Resource) || (window.PHPJS_Resource && value instanceof window.PHPJS_Resource)) {
						throw new SyntaxError('json_encode');
					}
					gap += indent;
					partial = [];
					if (Object.prototype.toString.apply(value) === '[object Array]') {
						length = value.length;
						for (i = 0; i < length; i += 1) {
							partial[i] = str(i, value) || 'null';
						}
						v = partial.length === 0 ? '[]' : gap ? '[\n' + gap + partial.join(',\n'+gap)+'\n'+mind+']' : '['+partial.join(',')+']';
						gap = mind;
						return v;
					}

					for (k in value) {
						if (Object.hasOwnProperty.call(value, k)) {
							v = str(k, value);
							if (v) {
								partial.push(quote(k) + (gap ? ': ' : ':') + v);
							}
						}
					}
					v = partial.length === 0 ? '{}' : gap ? '{\n' + gap + partial.join(',\n' + gap) + '\n' + mind + '}' : '{' + partial.join(',') + '}';
					gap = mind;
					return v;
				case 'undefined': // Fall-through
				case 'function': // Fall-through
				default: throw new SyntaxError('json_encode');
			}
		};
		return str('', {'': value});

	} catch (err) { // Todo: ensure error handling above throws a SyntaxError in all cases where it could
		if (!(err instanceof SyntaxError)) {
			throw new Error('Unexpected error type in json_encode()');
		}
		this.php_js = this.php_js || {};
		this.php_js.last_error_json = 4; // usable by json_last_error()
		return null;
	}
}

function json_decode (str_json) 
{
	// *        example 1: json_decode('[\n    "e",\n    {\n    "pluribus": "unum"\n}\n]');
	// *        returns 1: ['e', {pluribus: 'unum'}]
	var json = this.window.JSON;
	if (typeof json === 'object' && typeof json.parse === 'function') {
		try {
			return json.parse(str_json);
		} catch (err) {
			if (!(err instanceof SyntaxError)) {
				throw new Error('Unexpected error type in json_decode()');
			}
			this.php_js = this.php_js || {};
			this.php_js.last_error_json = 4; // usable by json_last_error()
			return null;
		}
	}

	var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
	var j;
	var text = str_json;

	cx.lastIndex = 0;
	if (cx.test(text)) {
		text = text.replace(cx, function (a) {
				return '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
				});
	}

	if ((/^[\],:{}\s]*$/).
			test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@').
			replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').
			replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {
		j = eval('(' + text + ')');
		return j;
	}

	this.php_js = this.php_js || {};
	this.php_js.last_error_json = 4; // usable by json_last_error()
	return null;
}

function base64_decode (data) 
{
	var b64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
	var o1, o2, o3, h1, h2, h3, h4, bits, i = 0,
	    ac = 0,
	    dec = "",
	    tmp_arr = [];

	if (!data) {
		return data;
	}

	data += '';
	do { // unpack four hexets into three octets using index points in b64
		h1 = b64.indexOf(data.charAt(i++));
		h2 = b64.indexOf(data.charAt(i++));
		h3 = b64.indexOf(data.charAt(i++));
		h4 = b64.indexOf(data.charAt(i++));

		bits = h1 << 18 | h2 << 12 | h3 << 6 | h4;

		o1 = bits >> 16 & 0xff;
		o2 = bits >> 8 & 0xff;
		o3 = bits & 0xff;

		if (h3 == 64) {
			tmp_arr[ac++] = String.fromCharCode(o1);
		} else if (h4 == 64) {
			tmp_arr[ac++] = String.fromCharCode(o1, o2);
		} else {
			tmp_arr[ac++] = String.fromCharCode(o1, o2, o3);
		}
	} while (i < data.length);
	dec = tmp_arr.join('');
	return dec;
}

function base64_encode (data) 
{
	var b64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
	var o1, o2, o3, h1, h2, h3, h4, bits, i = 0,
	    ac = 0,
	    enc = "",
	    tmp_arr = [];

	if (!data) {
		return data;
	}

	do { // pack three octets into four hexets
		o1 = data.charCodeAt(i++);
		o2 = data.charCodeAt(i++);
		o3 = data.charCodeAt(i++);

		bits = o1 << 16 | o2 << 8 | o3;

		h1 = bits >> 18 & 0x3f;
		h2 = bits >> 12 & 0x3f;
		h3 = bits >> 6 & 0x3f;
		h4 = bits & 0x3f;

		// use hexets to index into b64, and append result to encoded string
		tmp_arr[ac++] = b64.charAt(h1) + b64.charAt(h2) + b64.charAt(h3) + b64.charAt(h4);
	} while (i < data.length);

	enc = tmp_arr.join('');
	var r = data.length % 3;
	return (r ? enc.slice(0, r - 3) : enc) + '==='.slice(r || 3);
}


function crc32 (str) 
{
	// *     example 1: crc32('Kevin van Zonneveld');
	// *     returns 1: 1249991249
	str = utf8_encode(str);
	var table = "00000000 77073096 EE0E612C 990951BA 076DC419 706AF48F E963A535 9E6495A3 0EDB8832 79DCB8A4 E0D5E91E 97D2D988 09B64C2B 7EB17CBD E7B82D07 90BF1D91 1DB71064 6AB020F2 F3B97148 84BE41DE 1ADAD47D 6DDDE4EB F4D4B551 83D385C7 136C9856 646BA8C0 FD62F97A 8A65C9EC 14015C4F 63066CD9 FA0F3D63 8D080DF5 3B6E20C8 4C69105E D56041E4 A2677172 3C03E4D1 4B04D447 D20D85FD A50AB56B 35B5A8FA 42B2986C DBBBC9D6 ACBCF940 32D86CE3 45DF5C75 DCD60DCF ABD13D59 26D930AC 51DE003A C8D75180 BFD06116 21B4F4B5 56B3C423 CFBA9599 B8BDA50F 2802B89E 5F058808 C60CD9B2 B10BE924 2F6F7C87 58684C11 C1611DAB B6662D3D 76DC4190 01DB7106 98D220BC EFD5102A 71B18589 06B6B51F 9FBFE4A5 E8B8D433 7807C9A2 0F00F934 9609A88E E10E9818 7F6A0DBB 086D3D2D 91646C97 E6635C01 6B6B51F4 1C6C6162 856530D8 F262004E 6C0695ED 1B01A57B 8208F4C1 F50FC457 65B0D9C6 12B7E950 8BBEB8EA FCB9887C 62DD1DDF 15DA2D49 8CD37CF3 FBD44C65 4DB26158 3AB551CE A3BC0074 D4BB30E2 4ADFA541 3DD895D7 A4D1C46D D3D6F4FB 4369E96A 346ED9FC AD678846 DA60B8D0 44042D73 33031DE5 AA0A4C5F DD0D7CC9 5005713C 270241AA BE0B1010 C90C2086 5768B525 206F85B3 B966D409 CE61E49F 5EDEF90E 29D9C998 B0D09822 C7D7A8B4 59B33D17 2EB40D81 B7BD5C3B C0BA6CAD EDB88320 9ABFB3B6 03B6E20C 74B1D29A EAD54739 9DD277AF 04DB2615 73DC1683 E3630B12 94643B84 0D6D6A3E 7A6A5AA8 E40ECF0B 9309FF9D 0A00AE27 7D079EB1 F00F9344 8708A3D2 1E01F268 6906C2FE F762575D 806567CB 196C3671 6E6B06E7 FED41B76 89D32BE0 10DA7A5A 67DD4ACC F9B9DF6F 8EBEEFF9 17B7BE43 60B08ED5 D6D6A3E8 A1D1937E 38D8C2C4 4FDFF252 D1BB67F1 A6BC5767 3FB506DD 48B2364B D80D2BDA AF0A1B4C 36034AF6 41047A60 DF60EFC3 A867DF55 316E8EEF 4669BE79 CB61B38C BC66831A 256FD2A0 5268E236 CC0C7795 BB0B4703 220216B9 5505262F C5BA3BBE B2BD0B28 2BB45A92 5CB36A04 C2D7FFA7 B5D0CF31 2CD99E8B 5BDEAE1D 9B64C2B0 EC63F226 756AA39C 026D930A 9C0906A9 EB0E363F 72076785 05005713 95BF4A82 E2B87A14 7BB12BAE 0CB61B38 92D28E9B E5D5BE0D 7CDCEFB7 0BDBDF21 86D3D2D4 F1D4E242 68DDB3F8 1FDA836E 81BE16CD F6B9265B 6FB077E1 18B74777 88085AE6 FF0F6A70 66063BCA 11010B5C 8F659EFF F862AE69 616BFFD3 166CCF45 A00AE278 D70DD2EE 4E048354 3903B3C2 A7672661 D06016F7 4969474D 3E6E77DB AED16A4A D9D65ADC 40DF0B66 37D83BF0 A9BCAE53 DEBB9EC5 47B2CF7F 30B5FFE9 BDBDF21C CABAC28A 53B39330 24B4A3A6 BAD03605 CDD70693 54DE5729 23D967BF B3667A2E C4614AB8 5D681B02 2A6F2B94 B40BBE37 C30C8EA1 5A05DF1B 2D02EF8D";

	var crc = 0;
	var x = 0;
	var y = 0;
	crc = crc ^ (-1);
	for (var i = 0, iTop = str.length; i < iTop; i++) {
		y = (crc ^ str.charCodeAt(i)) & 0xFF;
		x = "0x" + table.substr(y * 9, 8);
		crc = (crc >>> 8) ^ x;
	}
	return crc ^ (-1);
}

function utf8_decode (str_data) {
	// *     example 1: utf8_decode('Kevin van Zonneveld');
	// *     returns 1: 'Kevin van Zonneveld'
	var tmp_arr = [],
	    i = 0,
	    ac = 0,
	    c1 = 0,
	    c2 = 0,
	    c3 = 0,
	    c4 = 0;

	str_data += '';

	while (i < str_data.length) {
		c1 = str_data.charCodeAt(i);
		if (c1 <= 191) {
			tmp_arr[ac++] = String.fromCharCode(c1);
			i++;
		} else if (c1 <= 223) {
			c2 = str_data.charCodeAt(i + 1);
			tmp_arr[ac++] = String.fromCharCode(((c1 & 31) << 6) | (c2 & 63));
			i += 2;
		} else if (c1 <= 239) {
			// http://en.wikipedia.org/wiki/UTF-8#Codepage_layout
			c2 = str_data.charCodeAt(i + 1);
			c3 = str_data.charCodeAt(i + 2);
			tmp_arr[ac++] = String.fromCharCode(((c1 & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
			i += 3;
		} else {
			c2 = str_data.charCodeAt(i + 1);
			c3 = str_data.charCodeAt(i + 2);
			c4 = str_data.charCodeAt(i + 3);
			c1 = ((c1 & 7) << 18) | ((c2 & 63) << 12) | ((c3 & 63) << 6) | (c4 & 63);
			c1 -= 0x10000;
			tmp_arr[ac++] = String.fromCharCode(0xD800 | ((c1>>10) & 0x3FF));
			tmp_arr[ac++] = String.fromCharCode(0xDC00 | (c1 & 0x3FF));
			i += 4;
		}
	}

	return tmp_arr.join('');
}

function utf8_encode (argString) 
{
	// *     example 1: utf8_encode('Kevin van Zonneveld');
	// *     returns 1: 'Kevin van Zonneveld'
	if (argString === null || typeof argString === "undefined") {
		return "";
	}

	var string = (argString + ''); // .replace(/\r\n/g, "\n").replace(/\r/g, "\n");
	var utftext = '',
	    start, end, stringl = 0;

	start = end = 0;
	stringl = string.length;
	for (var n = 0; n < stringl; n++) {
		var c1 = string.charCodeAt(n);
		var enc = null;

		if (c1 < 128) {
			end++;
		} else if (c1 > 127 && c1 < 2048) {
			enc = String.fromCharCode(
					(c1 >> 6)        | 192,
					( c1        & 63) | 128
					);
		} else if (c1 & 0xF800 != 0xD800) {
			enc = String.fromCharCode(
					(c1 >> 12)       | 224,
					((c1 >> 6)  & 63) | 128,
					( c1        & 63) | 128
					);
		} else { // surrogate pairs
			if (c1 & 0xFC00 != 0xD800) { throw new RangeError("Unmatched trail surrogate at " + n); }
			var c2 = string.charCodeAt(++n);
			if (c2 & 0xFC00 != 0xDC00) { throw new RangeError("Unmatched lead surrogate at " + (n-1)); }
			c1 = ((c1 & 0x3FF) << 10) + (c2 & 0x3FF) + 0x10000;
			enc = String.fromCharCode(
					(c1 >> 18)       | 240,
					((c1 >> 12) & 63) | 128,
					((c1 >> 6)  & 63) | 128,
					( c1        & 63) | 128
					);
		}
		if (enc !== null) {
			if (end > start) {
				utftext += string.slice(start, end);
			}
			utftext += enc;
			start = end = n + 1;
		}
	}

	if (end > start) {
		utftext += string.slice(start, stringl);
	}

	return utftext;
}

function parse_url (str, component) 
{
	var query, key = ['source', 'scheme', 'authority', 'userInfo', 'user', 'pass', 'host', 'port',
	    'relative', 'path', 'directory', 'file', 'query', 'fragment'],
	    ini = (this.php_js && this.php_js.ini) || {},
	    mode = (ini['phpjs.parse_url.mode'] && ini['phpjs.parse_url.mode'].local_value) || 'php',
	    parser = {
php: /^(?:([^:\/?#]+):)?(?:\/\/()(?:(?:()(?:([^:@]*):?([^:@]*))?@)?([^:\/?#]*)(?::(\d*))?))?()(?:(()(?:(?:[^?#\/]*\/)*)()(?:[^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
      strict: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*):?([^:@]*))?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
      loose: /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/\/?)?((?:(([^:@]*):?([^:@]*))?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/ // Added one optional slash to post-scheme to catch file:/// (should restrict this)
	    };

	var m = parser[mode].exec(str),
	    uri = {},
	    i = 14;
	while (i--) {
		if (m[i]) {
			uri[key[i]] = m[i];
		}
	}

	if (component) {
		return uri[component.replace('PHP_URL_', '').toLowerCase()];
	}
	if (mode !== 'php') {
		var name = (ini['phpjs.parse_url.queryKey'] &&
				ini['phpjs.parse_url.queryKey'].local_value) || 'queryKey';
		parser = /(?:^|&)([^&=]*)=?([^&]*)/g;
		uri[name] = {};
		query = uri[key[12]] || '';
		query.replace(parser, function ($0, $1, $2) {
				if ($1) {uri[name][$1] = $2;}
				});
	}
	delete uri.source;
	return uri;
}

function rawurlencode(str) 
{
	str = (str + '').toString();
	return encodeURIComponent(str)
		.replace(/!/g, '%21').replace(/'/g, '%27')
		.replace(/\(/g, '%28').replace(/\)/g, '%29')
		.replace(/\*/g, '%2A');
}

function rawurldecode(str) 
{
	return decodeURIComponent((str + '')
		.replace(/%(?![\da-f]{2})/gi, 
		function() {return '%25';}));
}

function local_time(time)
{
	var d = new Date();
	var gmtHours = d.getTimezoneOffset()/60;
	var time =  new Date(time);
	return time+gmtHours;
}


function deepCopy(src, /* INTERNAL */ _visited) 
{
	//If Object.create isn't already defined, we just do the simple shim, without the second argument,
	//since that's all we need here
	var object_create = Object.create;
	if (typeof object_create !== 'function') {
		object_create = function(o) {
			function F() {}
			F.prototype = o;
			return new F();
		};
	}

	if(src == null || typeof(src) !== 'object'){
		return src;
	}

	// Initialize the visited objects array if needed
	// This is used to detect cyclic references
	if (_visited == undefined){
		_visited = [];
	}
	// Otherwise, ensure src has not already been visited
	else {
		var i, len = _visited.length;
		for (i = 0; i < len; i++) {
			// If src was already visited, don't try to copy it, just return the reference
			if (src === _visited[i]) {
				return src;
			}
		}
	}

	// Add this object to the visited array
	_visited.push(src);

	//Honor native/custom clone methods
	if(typeof src.clone == 'function'){
		return src.clone(true);
	}

	//Special cases:
	//Array
	if (Object.prototype.toString.call(src) == '[object Array]') {
		//[].slice(0) would soft clone
		ret = src.slice();
		var i = ret.length;
		while (i--){
			ret[i] = deepCopy(ret[i], _visited);
		}
		return ret;
	}
	//Date
	if (src instanceof Date){
		return new Date(src.getTime());
	}
	//RegExp
	if(src instanceof RegExp){
		return new RegExp(src);
	}
	//DOM Elements
	if(src.nodeType && typeof src.cloneNode == 'function'){
		return src.cloneNode(true);
	}

	//If we've reached here, we have a regular object, array, or function

	//make sure the returned object has the same prototype as the original
	var proto = (Object.getPrototypeOf ? Object.getPrototypeOf(src): src.__proto__);
	if (!proto) {
		proto = src.constructor.prototype; //this line would probably only be reached by very old browsers 
	}
	var ret = object_create(proto);

	for(var key in src){
		//Note: this does NOT preserve ES5 property attributes like 'writable', 'enumerable', etc.
		//For an example of how this could be modified to do so, see the singleMixin() function
		ret[key] = deepCopy(src[key], _visited);
	}
	return ret;
}




function is_email(text) { 
	return /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(text);
}

function is_mobile()
{
	var a = navigator.userAgent||navigator.vendor||window.opera;
	return /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4));
}

function here_doc (f) {
	return f.toString().replace(/^[^\/]+\/\*!?/, '').replace(/\*\/[^\/]+$/, '');
}

function sys_conf(key, def_val)
{
	if (system === undefined) {
		return def_val;
	}

	if (!system.hasOwnProperty(key)) {
		return def_val;
	}

	var type_desc = system['type_desc'];
	var type = type_desc[key];
	var value = system[key];

	switch(type) {
	case 'integer':
		value = parseInt(value);
		break;
	case 'code':
		value = eval(value);
		break;
	}

	return value;
}

function load_mainjs(cb_done)
{
	var loadjs = sys_conf('load_main_library', null);
	if (loadjs !== null) {
		loadjs.sort(function(a,b){
			return a[0] - b[0];
		});

		for(var i=0; i<loadjs.length; i++) {
			var item = loadjs[i];
			var regex = item[1];
			var jsurl = item[2];

			if ((regex===null) || url_matched([regex]) || ua_matched([regex])) {
				data.LazyLoad.js(jsurl, cb_done);
				return;
			}
		}
	}
}

function exec_mainjs()
{
	load_mainjs(function(){
		if (typeof omp_main === 'function') {
			omp_main(data);
		}
	});
}

function load_LazyLoad() 
{
return (function(j){var g,h,b={},e=0,f={css:[],js:[]},m=j.styleSheets;function l(q,p){var r=j.createElement(q),o;for(o in p){if(p.hasOwnProperty(o)){r.setAttribute(o,p[o])}}return r}function i(o){var r=b[o],s,q;if(r){s=r.callback;q=r.urls;q.shift();e=0;if(!q.length){s&&s.call(r.context,r.obj);b[o]=null;f[o].length&&k(o)}}}function c(){var o=navigator.userAgent;g={async:j.createElement("script").async===true};(g.webkit=/AppleWebKit\//.test(o))||(g.ie=/MSIE/.test(o))||(g.opera=/Opera/.test(o))||(g.gecko=/Gecko\//.test(o))||(g.unknown=true)}var n={Version:function(){var o=999;if(navigator.appVersion.indexOf("MSIE")!=-1){o=parseFloat(navigator.appVersion.split("MSIE")[1])}return o}};function k(A,z,B,w,s){var u=function(){i(A)},C=A==="css",q=[],v,x,t,r,y,o;g||c();if(z){z=typeof z==="string"?[z]:z.concat();if(C||g.async||g.gecko||g.opera){f[A].push({urls:z,callback:B,obj:w,context:s})}else{for(v=0,x=z.length;v<x;++v){f[A].push({urls:[z[v]],callback:v===x-1?B:null,obj:w,context:s})}}}if(b[A]||!(r=b[A]=f[A].shift())){return}h||(h=j.head||j.getElementsByTagName("head")[0]);y=r.urls;for(v=0,x=y.length;v<x;++v){o=y[v];if(C){t=g.gecko?l("style"):l("link",{href:o,rel:"stylesheet"})}else{t=l("script",{src:o});t.async=false}t.className="lazyload";t.setAttribute("charset","utf-8");if(g.ie&&!C&&n.Version()<10){t.onreadystatechange=function(){if(/loaded|complete/.test(t.readyState)){t.onreadystatechange=null;u()}}}else{if(C&&(g.gecko||g.webkit)){if(g.webkit){r.urls[v]=t.href;d()}else{t.innerHTML='@import "'+o+'";';a(t)}}else{t.onload=t.onerror=u}}q.push(t)}for(v=0,x=q.length;v<x;++v){h.appendChild(q[v])}}function a(q){var p;try{p=!!q.sheet.cssRules}catch(o){e+=1;if(e<200){setTimeout(function(){a(q)},50)}else{p&&i("css")}return}i("css")}function d(){var p=b.css,o;if(p){o=m.length;while(--o>=0){if(m[o].href===p.urls[0]){i("css");break}}e+=1;if(p){if(e<200){setTimeout(d,50)}else{i("css")}}}}return{css:function(q,r,p,o){k("css",q,r,p,o)},js:function(q,r,p,o){k("js",q,r,p,o)}}})(this.document);
}

function load_md5() 
{
!function(a){"use strict";function b(a,b){var c=(65535&a)+(65535&b),d=(a>>16)+(b>>16)+(c>>16);return d<<16|65535&c}function c(a,b){return a<<b|a>>>32-b}function d(a,d,e,f,g,h){return b(c(b(b(d,a),b(f,h)),g),e)}function e(a,b,c,e,f,g,h){return d(b&c|~b&e,a,b,f,g,h)}function f(a,b,c,e,f,g,h){return d(b&e|c&~e,a,b,f,g,h)}function g(a,b,c,e,f,g,h){return d(b^c^e,a,b,f,g,h)}function h(a,b,c,e,f,g,h){return d(c^(b|~e),a,b,f,g,h)}function i(a,c){a[c>>5]|=128<<c%32,a[(c+64>>>9<<4)+14]=c;var d,i,j,k,l,m=1732584193,n=-271733879,o=-1732584194,p=271733878;for(d=0;d<a.length;d+=16)i=m,j=n,k=o,l=p,m=e(m,n,o,p,a[d],7,-680876936),p=e(p,m,n,o,a[d+1],12,-389564586),o=e(o,p,m,n,a[d+2],17,606105819),n=e(n,o,p,m,a[d+3],22,-1044525330),m=e(m,n,o,p,a[d+4],7,-176418897),p=e(p,m,n,o,a[d+5],12,1200080426),o=e(o,p,m,n,a[d+6],17,-1473231341),n=e(n,o,p,m,a[d+7],22,-45705983),m=e(m,n,o,p,a[d+8],7,1770035416),p=e(p,m,n,o,a[d+9],12,-1958414417),o=e(o,p,m,n,a[d+10],17,-42063),n=e(n,o,p,m,a[d+11],22,-1990404162),m=e(m,n,o,p,a[d+12],7,1804603682),p=e(p,m,n,o,a[d+13],12,-40341101),o=e(o,p,m,n,a[d+14],17,-1502002290),n=e(n,o,p,m,a[d+15],22,1236535329),m=f(m,n,o,p,a[d+1],5,-165796510),p=f(p,m,n,o,a[d+6],9,-1069501632),o=f(o,p,m,n,a[d+11],14,643717713),n=f(n,o,p,m,a[d],20,-373897302),m=f(m,n,o,p,a[d+5],5,-701558691),p=f(p,m,n,o,a[d+10],9,38016083),o=f(o,p,m,n,a[d+15],14,-660478335),n=f(n,o,p,m,a[d+4],20,-405537848),m=f(m,n,o,p,a[d+9],5,568446438),p=f(p,m,n,o,a[d+14],9,-1019803690),o=f(o,p,m,n,a[d+3],14,-187363961),n=f(n,o,p,m,a[d+8],20,1163531501),m=f(m,n,o,p,a[d+13],5,-1444681467),p=f(p,m,n,o,a[d+2],9,-51403784),o=f(o,p,m,n,a[d+7],14,1735328473),n=f(n,o,p,m,a[d+12],20,-1926607734),m=g(m,n,o,p,a[d+5],4,-378558),p=g(p,m,n,o,a[d+8],11,-2022574463),o=g(o,p,m,n,a[d+11],16,1839030562),n=g(n,o,p,m,a[d+14],23,-35309556),m=g(m,n,o,p,a[d+1],4,-1530992060),p=g(p,m,n,o,a[d+4],11,1272893353),o=g(o,p,m,n,a[d+7],16,-155497632),n=g(n,o,p,m,a[d+10],23,-1094730640),m=g(m,n,o,p,a[d+13],4,681279174),p=g(p,m,n,o,a[d],11,-358537222),o=g(o,p,m,n,a[d+3],16,-722521979),n=g(n,o,p,m,a[d+6],23,76029189),m=g(m,n,o,p,a[d+9],4,-640364487),p=g(p,m,n,o,a[d+12],11,-421815835),o=g(o,p,m,n,a[d+15],16,530742520),n=g(n,o,p,m,a[d+2],23,-995338651),m=h(m,n,o,p,a[d],6,-198630844),p=h(p,m,n,o,a[d+7],10,1126891415),o=h(o,p,m,n,a[d+14],15,-1416354905),n=h(n,o,p,m,a[d+5],21,-57434055),m=h(m,n,o,p,a[d+12],6,1700485571),p=h(p,m,n,o,a[d+3],10,-1894986606),o=h(o,p,m,n,a[d+10],15,-1051523),n=h(n,o,p,m,a[d+1],21,-2054922799),m=h(m,n,o,p,a[d+8],6,1873313359),p=h(p,m,n,o,a[d+15],10,-30611744),o=h(o,p,m,n,a[d+6],15,-1560198380),n=h(n,o,p,m,a[d+13],21,1309151649),m=h(m,n,o,p,a[d+4],6,-145523070),p=h(p,m,n,o,a[d+11],10,-1120210379),o=h(o,p,m,n,a[d+2],15,718787259),n=h(n,o,p,m,a[d+9],21,-343485551),m=b(m,i),n=b(n,j),o=b(o,k),p=b(p,l);return[m,n,o,p]}function j(a){var b,c="";for(b=0;b<32*a.length;b+=8)c+=String.fromCharCode(a[b>>5]>>>b%32&255);return c}function k(a){var b,c=[];for(c[(a.length>>2)-1]=void 0,b=0;b<c.length;b+=1)c[b]=0;for(b=0;b<8*a.length;b+=8)c[b>>5]|=(255&a.charCodeAt(b/8))<<b%32;return c}function l(a){return j(i(k(a),8*a.length))}function m(a,b){var c,d,e=k(a),f=[],g=[];for(f[15]=g[15]=void 0,e.length>16&&(e=i(e,8*a.length)),c=0;16>c;c+=1)f[c]=909522486^e[c],g[c]=1549556828^e[c];return d=i(f.concat(k(b)),512+8*b.length),j(i(g.concat(d),640))}function n(a){var b,c,d="0123456789abcdef",e="";for(c=0;c<a.length;c+=1)b=a.charCodeAt(c),e+=d.charAt(b>>>4&15)+d.charAt(15&b);return e}function o(a){return unescape(encodeURIComponent(a))}function p(a){return l(o(a))}function q(a){return n(p(a))}function r(a,b){return m(o(a),o(b))}function s(a,b){return n(r(a,b))}function t(a,b,c){return b?c?r(b,a):s(b,a):c?p(a):q(a)}"function"==typeof define&&define.amd?define(function(){return t}):a.md5=t}(this);
return md5;
}

//jx V3.01.A - http://www.openjs.com/scripts/jx/
function load_ajax()
{
jx={getHTTPObject:function(){var A=false;if(typeof ActiveXObject!="undefined"){try{A=new ActiveXObject("Msxml2.XMLHTTP")}catch(C){try{A=new ActiveXObject("Microsoft.XMLHTTP")}catch(B){A=false}}}else{if(window.XMLHttpRequest){try{A=new XMLHttpRequest()}catch(C){A=false}}}return A},load:function(url,callback,format,method,opt){var http=this.init();if(!http||!url){return }if(http.overrideMimeType){http.overrideMimeType("text/xml")}if(!method){method="GET"}if(!format){format="text"}if(!opt){opt={}}format=format.toLowerCase();method=method.toUpperCase();var now="uid="+new Date().getTime();url+=(url.indexOf("?")+1)?"&":"?";url+=now;var parameters=null;if(method=="POST"){var parts=url.split("?");url=parts[0];parameters=parts[1]}http.open(method,url,true);if(method=="POST"){http.setRequestHeader("Content-type","application/x-www-form-urlencoded");http.setRequestHeader("Content-length",parameters.length);http.setRequestHeader("Connection","close")}var ths=this;if(opt.handler){http.onreadystatechange=function(){opt.handler(http)}}else{http.onreadystatechange=function(){if(http.readyState==4){if(http.status==200){var result="";if(http.responseText){result=http.responseText}if(format.charAt(0)=="j"){result=result.replace(/[\n\r]/g,"");result=eval("("+result+")")}else{if(format.charAt(0)=="x"){result=http.responseXML}}if(callback){callback(result)}}else{if(opt.loadingIndicator){document.getElementsByTagName("body")[0].removeChild(opt.loadingIndicator)}if(opt.loading){document.getElementById(opt.loading).style.display="none"}if(error){error(http.status)}}}}}http.send(parameters)},bind:function(A){var C={"url":"","onSuccess":false,"onError":false,"format":"text","method":"GET","update":"","loading":"","loadingIndicator":""};for(var B in C){if(A[B]){C[B]=A[B]}}if(!C.url){return }var D=false;if(C.loadingIndicator){D=document.createElement("div");D.setAttribute("style","position:absolute;top:0px;left:0px;");D.setAttribute("class","loading-indicator");D.innerHTML=C.loadingIndicator;document.getElementsByTagName("body")[0].appendChild(D);this.opt.loadingIndicator=D}if(C.loading){document.getElementById(C.loading).style.display="block"}this.load(C.url,function(E){if(C.onSuccess){C.onSuccess(E)}if(C.update){document.getElementById(C.update).innerHTML=E}if(D){document.getElementsByTagName("body")[0].removeChild(D)}if(C.loading){document.getElementById(C.loading).style.display="none"}},C.format,C.method,C)},init:function(){return this.getHTTPObject()}};
return jx;
}

//Sizzle v2.2.0-pre
function load_selector()
{
!function(a){var b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u="sizzle"+1*new Date,v=a.document,w=0,x=0,y=gb(),z=gb(),A=gb(),B=function(a,b){return a===b&&(l=!0),0},C=1<<31,D={}.hasOwnProperty,E=[],F=E.pop,G=E.push,H=E.push,I=E.slice,J=function(a,b){for(var c=0,d=a.length;d>c;c++)if(a[c]===b)return c;return-1},K="checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped",L="[\\x20\\t\\r\\n\\f]",M="(?:\\\\.|[\\w-]|[^\\x00-\\xa0])+",N="\\["+L+"*("+M+")(?:"+L+"*([*^$|!~]?=)"+L+"*(?:'((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\"|("+M+"))|)"+L+"*\\]",O=":("+M+")(?:\\((('((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\")|((?:\\\\.|[^\\\\()[\\]]|"+N+")*)|.*)\\)|)",P=new RegExp(L+"+","g"),Q=new RegExp("^"+L+"+|((?:^|[^\\\\])(?:\\\\.)*)"+L+"+$","g"),R=new RegExp("^"+L+"*,"+L+"*"),S=new RegExp("^"+L+"*([>+~]|"+L+")"+L+"*"),T=new RegExp("="+L+"*([^\\]'\"]*?)"+L+"*\\]","g"),U=new RegExp(O),V=new RegExp("^"+M+"$"),W={ID:new RegExp("^#("+M+")"),CLASS:new RegExp("^\\.("+M+")"),TAG:new RegExp("^("+M+"|[*])"),ATTR:new RegExp("^"+N),PSEUDO:new RegExp("^"+O),CHILD:new RegExp("^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\("+L+"*(even|odd|(([+-]|)(\\d*)n|)"+L+"*(?:([+-]|)"+L+"*(\\d+)|))"+L+"*\\)|)","i"),bool:new RegExp("^(?:"+K+")$","i"),needsContext:new RegExp("^"+L+"*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\("+L+"*((?:-\\d)?\\d*)"+L+"*\\)|)(?=[^-]|$)","i")},X=/^(?:input|select|textarea|button)$/i,Y=/^h\d$/i,Z=/^[^{]+\{\s*\[native \w/,$=/^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/,_=/[+~]/,ab=/'|\\/g,bb=new RegExp("\\\\([\\da-f]{1,6}"+L+"?|("+L+")|.)","ig"),cb=function(a,b,c){var d="0x"+b-65536;return d!==d||c?b:0>d?String.fromCharCode(d+65536):String.fromCharCode(d>>10|55296,1023&d|56320)},db=function(){m()};try{H.apply(E=I.call(v.childNodes),v.childNodes),E[v.childNodes.length].nodeType}catch(eb){H={apply:E.length?function(a,b){G.apply(a,I.call(b))}:function(a,b){var c=a.length,d=0;while(a[c++]=b[d++]);a.length=c-1}}}function fb(a,b,d,e){var f,h,j,k,l,o,r,s,w,x;if((b?b.ownerDocument||b:v)!==n&&m(b),b=b||n,d=d||[],k=b.nodeType,"string"!=typeof a||!a||1!==k&&9!==k&&11!==k)return d;if(!e&&p){if(11!==k&&(f=$.exec(a)))if(j=f[1]){if(9===k){if(h=b.getElementById(j),!h||!h.parentNode)return d;if(h.id===j)return d.push(h),d}else if(b.ownerDocument&&(h=b.ownerDocument.getElementById(j))&&t(b,h)&&h.id===j)return d.push(h),d}else{if(f[2])return H.apply(d,b.getElementsByTagName(a)),d;if((j=f[3])&&c.getElementsByClassName)return H.apply(d,b.getElementsByClassName(j)),d}if(c.qsa&&(!q||!q.test(a))){if(s=r=u,w=b,x=1!==k&&a,1===k&&"object"!==b.nodeName.toLowerCase()){o=g(a),(r=b.getAttribute("id"))?s=r.replace(ab,"\\$&"):b.setAttribute("id",s),s="[id='"+s+"'] ",l=o.length;while(l--)o[l]=s+qb(o[l]);w=_.test(a)&&ob(b.parentNode)||b,x=o.join(",")}if(x)try{return H.apply(d,w.querySelectorAll(x)),d}catch(y){}finally{r||b.removeAttribute("id")}}}return i(a.replace(Q,"$1"),b,d,e)}function gb(){var a=[];function b(c,e){return a.push(c+" ")>d.cacheLength&&delete b[a.shift()],b[c+" "]=e}return b}function hb(a){return a[u]=!0,a}function ib(a){var b=n.createElement("div");try{return!!a(b)}catch(c){return!1}finally{b.parentNode&&b.parentNode.removeChild(b),b=null}}function jb(a,b){var c=a.split("|"),e=a.length;while(e--)d.attrHandle[c[e]]=b}function kb(a,b){var c=b&&a,d=c&&1===a.nodeType&&1===b.nodeType&&(~b.sourceIndex||C)-(~a.sourceIndex||C);if(d)return d;if(c)while(c=c.nextSibling)if(c===b)return-1;return a?1:-1}function lb(a){return function(b){var c=b.nodeName.toLowerCase();return"input"===c&&b.type===a}}function mb(a){return function(b){var c=b.nodeName.toLowerCase();return("input"===c||"button"===c)&&b.type===a}}function nb(a){return hb(function(b){return b=+b,hb(function(c,d){var e,f=a([],c.length,b),g=f.length;while(g--)c[e=f[g]]&&(c[e]=!(d[e]=c[e]))})})}function ob(a){return a&&"undefined"!=typeof a.getElementsByTagName&&a}c=fb.support={},f=fb.isXML=function(a){var b=a&&(a.ownerDocument||a).documentElement;return b?"HTML"!==b.nodeName:!1},m=fb.setDocument=function(a){var b,e,g=a?a.ownerDocument||a:v;return g!==n&&9===g.nodeType&&g.documentElement?(n=g,o=g.documentElement,e=g.defaultView,e&&e!==e.top&&(e.addEventListener?e.addEventListener("unload",db,!1):e.attachEvent&&e.attachEvent("onunload",db)),p=!f(g),c.attributes=ib(function(a){return a.className="i",!a.getAttribute("className")}),c.getElementsByTagName=ib(function(a){return a.appendChild(g.createComment("")),!a.getElementsByTagName("*").length}),c.getElementsByClassName=Z.test(g.getElementsByClassName),c.getById=ib(function(a){return o.appendChild(a).id=u,!g.getElementsByName||!g.getElementsByName(u).length}),c.getById?(d.find.ID=function(a,b){if("undefined"!=typeof b.getElementById&&p){var c=b.getElementById(a);return c&&c.parentNode?[c]:[]}},d.filter.ID=function(a){var b=a.replace(bb,cb);return function(a){return a.getAttribute("id")===b}}):(delete d.find.ID,d.filter.ID=function(a){var b=a.replace(bb,cb);return function(a){var c="undefined"!=typeof a.getAttributeNode&&a.getAttributeNode("id");return c&&c.value===b}}),d.find.TAG=c.getElementsByTagName?function(a,b){return"undefined"!=typeof b.getElementsByTagName?b.getElementsByTagName(a):c.qsa?b.querySelectorAll(a):void 0}:function(a,b){var c,d=[],e=0,f=b.getElementsByTagName(a);if("*"===a){while(c=f[e++])1===c.nodeType&&d.push(c);return d}return f},d.find.CLASS=c.getElementsByClassName&&function(a,b){return p?b.getElementsByClassName(a):void 0},r=[],q=[],(c.qsa=Z.test(g.querySelectorAll))&&(ib(function(a){o.appendChild(a).innerHTML="<a id='"+u+"'></a><select id='"+u+"-\r\\' msallowcapture=''><option selected=''></option></select>",a.querySelectorAll("[msallowcapture^='']").length&&q.push("[*^$]="+L+"*(?:''|\"\")"),a.querySelectorAll("[selected]").length||q.push("\\["+L+"*(?:value|"+K+")"),a.querySelectorAll("[id~="+u+"-]").length||q.push("~="),a.querySelectorAll(":checked").length||q.push(":checked"),a.querySelectorAll("a#"+u+"+*").length||q.push(".#.+[+~]")}),ib(function(a){var b=g.createElement("input");b.setAttribute("type","hidden"),a.appendChild(b).setAttribute("name","D"),a.querySelectorAll("[name=d]").length&&q.push("name"+L+"*[*^$|!~]?="),a.querySelectorAll(":enabled").length||q.push(":enabled",":disabled"),a.querySelectorAll("*,:x"),q.push(",.*:")})),(c.matchesSelector=Z.test(s=o.matches||o.webkitMatchesSelector||o.mozMatchesSelector||o.oMatchesSelector||o.msMatchesSelector))&&ib(function(a){c.disconnectedMatch=s.call(a,"div"),s.call(a,"[s!='']:x"),r.push("!=",O)}),q=q.length&&new RegExp(q.join("|")),r=r.length&&new RegExp(r.join("|")),b=Z.test(o.compareDocumentPosition),t=b||Z.test(o.contains)?function(a,b){var c=9===a.nodeType?a.documentElement:a,d=b&&b.parentNode;return a===d||!(!d||1!==d.nodeType||!(c.contains?c.contains(d):a.compareDocumentPosition&&16&a.compareDocumentPosition(d)))}:function(a,b){if(b)while(b=b.parentNode)if(b===a)return!0;return!1},B=b?function(a,b){if(a===b)return l=!0,0;var d=!a.compareDocumentPosition-!b.compareDocumentPosition;return d?d:(d=(a.ownerDocument||a)===(b.ownerDocument||b)?a.compareDocumentPosition(b):1,1&d||!c.sortDetached&&b.compareDocumentPosition(a)===d?a===g||a.ownerDocument===v&&t(v,a)?-1:b===g||b.ownerDocument===v&&t(v,b)?1:k?J(k,a)-J(k,b):0:4&d?-1:1)}:function(a,b){if(a===b)return l=!0,0;var c,d=0,e=a.parentNode,f=b.parentNode,h=[a],i=[b];if(!e||!f)return a===g?-1:b===g?1:e?-1:f?1:k?J(k,a)-J(k,b):0;if(e===f)return kb(a,b);c=a;while(c=c.parentNode)h.unshift(c);c=b;while(c=c.parentNode)i.unshift(c);while(h[d]===i[d])d++;return d?kb(h[d],i[d]):h[d]===v?-1:i[d]===v?1:0},g):n},fb.matches=function(a,b){return fb(a,null,null,b)},fb.matchesSelector=function(a,b){if((a.ownerDocument||a)!==n&&m(a),b=b.replace(T,"='$1']"),!(!c.matchesSelector||!p||r&&r.test(b)||q&&q.test(b)))try{var d=s.call(a,b);if(d||c.disconnectedMatch||a.document&&11!==a.document.nodeType)return d}catch(e){}return fb(b,n,null,[a]).length>0},fb.contains=function(a,b){return(a.ownerDocument||a)!==n&&m(a),t(a,b)},fb.attr=function(a,b){(a.ownerDocument||a)!==n&&m(a);var e=d.attrHandle[b.toLowerCase()],f=e&&D.call(d.attrHandle,b.toLowerCase())?e(a,b,!p):void 0;return void 0!==f?f:c.attributes||!p?a.getAttribute(b):(f=a.getAttributeNode(b))&&f.specified?f.value:null},fb.error=function(a){throw new Error("Syntax error, unrecognized expression: "+a)},fb.uniqueSort=function(a){var b,d=[],e=0,f=0;if(l=!c.detectDuplicates,k=!c.sortStable&&a.slice(0),a.sort(B),l){while(b=a[f++])b===a[f]&&(e=d.push(f));while(e--)a.splice(d[e],1)}return k=null,a},e=fb.getText=function(a){var b,c="",d=0,f=a.nodeType;if(f){if(1===f||9===f||11===f){if("string"==typeof a.textContent)return a.textContent;for(a=a.firstChild;a;a=a.nextSibling)c+=e(a)}else if(3===f||4===f)return a.nodeValue}else while(b=a[d++])c+=e(b);return c},d=fb.selectors={cacheLength:50,createPseudo:hb,match:W,attrHandle:{},find:{},relative:{">":{dir:"parentNode",first:!0}," ":{dir:"parentNode"},"+":{dir:"previousSibling",first:!0},"~":{dir:"previousSibling"}},preFilter:{ATTR:function(a){return a[1]=a[1].replace(bb,cb),a[3]=(a[3]||a[4]||a[5]||"").replace(bb,cb),"~="===a[2]&&(a[3]=" "+a[3]+" "),a.slice(0,4)},CHILD:function(a){return a[1]=a[1].toLowerCase(),"nth"===a[1].slice(0,3)?(a[3]||fb.error(a[0]),a[4]=+(a[4]?a[5]+(a[6]||1):2*("even"===a[3]||"odd"===a[3])),a[5]=+(a[7]+a[8]||"odd"===a[3])):a[3]&&fb.error(a[0]),a},PSEUDO:function(a){var b,c=!a[6]&&a[2];return W.CHILD.test(a[0])?null:(a[3]?a[2]=a[4]||a[5]||"":c&&U.test(c)&&(b=g(c,!0))&&(b=c.indexOf(")",c.length-b)-c.length)&&(a[0]=a[0].slice(0,b),a[2]=c.slice(0,b)),a.slice(0,3))}},filter:{TAG:function(a){var b=a.replace(bb,cb).toLowerCase();return"*"===a?function(){return!0}:function(a){return a.nodeName&&a.nodeName.toLowerCase()===b}},CLASS:function(a){var b=y[a+" "];return b||(b=new RegExp("(^|"+L+")"+a+"("+L+"|$)"))&&y(a,function(a){return b.test("string"==typeof a.className&&a.className||"undefined"!=typeof a.getAttribute&&a.getAttribute("class")||"")})},ATTR:function(a,b,c){return function(d){var e=fb.attr(d,a);return null==e?"!="===b:b?(e+="","="===b?e===c:"!="===b?e!==c:"^="===b?c&&0===e.indexOf(c):"*="===b?c&&e.indexOf(c)>-1:"$="===b?c&&e.slice(-c.length)===c:"~="===b?(" "+e.replace(P," ")+" ").indexOf(c)>-1:"|="===b?e===c||e.slice(0,c.length+1)===c+"-":!1):!0}},CHILD:function(a,b,c,d,e){var f="nth"!==a.slice(0,3),g="last"!==a.slice(-4),h="of-type"===b;return 1===d&&0===e?function(a){return!!a.parentNode}:function(b,c,i){var j,k,l,m,n,o,p=f!==g?"nextSibling":"previousSibling",q=b.parentNode,r=h&&b.nodeName.toLowerCase(),s=!i&&!h;if(q){if(f){while(p){l=b;while(l=l[p])if(h?l.nodeName.toLowerCase()===r:1===l.nodeType)return!1;o=p="only"===a&&!o&&"nextSibling"}return!0}if(o=[g?q.firstChild:q.lastChild],g&&s){k=q[u]||(q[u]={}),j=k[a]||[],n=j[0]===w&&j[1],m=j[0]===w&&j[2],l=n&&q.childNodes[n];while(l=++n&&l&&l[p]||(m=n=0)||o.pop())if(1===l.nodeType&&++m&&l===b){k[a]=[w,n,m];break}}else if(s&&(j=(b[u]||(b[u]={}))[a])&&j[0]===w)m=j[1];else while(l=++n&&l&&l[p]||(m=n=0)||o.pop())if((h?l.nodeName.toLowerCase()===r:1===l.nodeType)&&++m&&(s&&((l[u]||(l[u]={}))[a]=[w,m]),l===b))break;return m-=e,m===d||m%d===0&&m/d>=0}}},PSEUDO:function(a,b){var c,e=d.pseudos[a]||d.setFilters[a.toLowerCase()]||fb.error("unsupported pseudo: "+a);return e[u]?e(b):e.length>1?(c=[a,a,"",b],d.setFilters.hasOwnProperty(a.toLowerCase())?hb(function(a,c){var d,f=e(a,b),g=f.length;while(g--)d=J(a,f[g]),a[d]=!(c[d]=f[g])}):function(a){return e(a,0,c)}):e}},pseudos:{not:hb(function(a){var b=[],c=[],d=h(a.replace(Q,"$1"));return d[u]?hb(function(a,b,c,e){var f,g=d(a,null,e,[]),h=a.length;while(h--)(f=g[h])&&(a[h]=!(b[h]=f))}):function(a,e,f){return b[0]=a,d(b,null,f,c),b[0]=null,!c.pop()}}),has:hb(function(a){return function(b){return fb(a,b).length>0}}),contains:hb(function(a){return a=a.replace(bb,cb),function(b){return(b.textContent||b.innerText||e(b)).indexOf(a)>-1}}),lang:hb(function(a){return V.test(a||"")||fb.error("unsupported lang: "+a),a=a.replace(bb,cb).toLowerCase(),function(b){var c;do if(c=p?b.lang:b.getAttribute("xml:lang")||b.getAttribute("lang"))return c=c.toLowerCase(),c===a||0===c.indexOf(a+"-");while((b=b.parentNode)&&1===b.nodeType);return!1}}),target:function(b){var c=a.location&&a.location.hash;return c&&c.slice(1)===b.id},root:function(a){return a===o},focus:function(a){return a===n.activeElement&&(!n.hasFocus||n.hasFocus())&&!!(a.type||a.href||~a.tabIndex)},enabled:function(a){return a.disabled===!1},disabled:function(a){return a.disabled===!0},checked:function(a){var b=a.nodeName.toLowerCase();return"input"===b&&!!a.checked||"option"===b&&!!a.selected},selected:function(a){return a.parentNode&&a.parentNode.selectedIndex,a.selected===!0},empty:function(a){for(a=a.firstChild;a;a=a.nextSibling)if(a.nodeType<6)return!1;return!0},parent:function(a){return!d.pseudos.empty(a)},header:function(a){return Y.test(a.nodeName)},input:function(a){return X.test(a.nodeName)},button:function(a){var b=a.nodeName.toLowerCase();return"input"===b&&"button"===a.type||"button"===b},text:function(a){var b;return"input"===a.nodeName.toLowerCase()&&"text"===a.type&&(null==(b=a.getAttribute("type"))||"text"===b.toLowerCase())},first:nb(function(){return[0]}),last:nb(function(a,b){return[b-1]}),eq:nb(function(a,b,c){return[0>c?c+b:c]}),even:nb(function(a,b){for(var c=0;b>c;c+=2)a.push(c);return a}),odd:nb(function(a,b){for(var c=1;b>c;c+=2)a.push(c);return a}),lt:nb(function(a,b,c){for(var d=0>c?c+b:c;--d>=0;)a.push(d);return a}),gt:nb(function(a,b,c){for(var d=0>c?c+b:c;++d<b;)a.push(d);return a})}},d.pseudos.nth=d.pseudos.eq;for(b in{radio:!0,checkbox:!0,file:!0,password:!0,image:!0})d.pseudos[b]=lb(b);for(b in{submit:!0,reset:!0})d.pseudos[b]=mb(b);function pb(){}pb.prototype=d.filters=d.pseudos,d.setFilters=new pb,g=fb.tokenize=function(a,b){var c,e,f,g,h,i,j,k=z[a+" "];if(k)return b?0:k.slice(0);h=a,i=[],j=d.preFilter;while(h){(!c||(e=R.exec(h)))&&(e&&(h=h.slice(e[0].length)||h),i.push(f=[])),c=!1,(e=S.exec(h))&&(c=e.shift(),f.push({value:c,type:e[0].replace(Q," ")}),h=h.slice(c.length));for(g in d.filter)!(e=W[g].exec(h))||j[g]&&!(e=j[g](e))||(c=e.shift(),f.push({value:c,type:g,matches:e}),h=h.slice(c.length));if(!c)break}return b?h.length:h?fb.error(a):z(a,i).slice(0)};function qb(a){for(var b=0,c=a.length,d="";c>b;b++)d+=a[b].value;return d}function rb(a,b,c){var d=b.dir,e=c&&"parentNode"===d,f=x++;return b.first?function(b,c,f){while(b=b[d])if(1===b.nodeType||e)return a(b,c,f)}:function(b,c,g){var h,i,j=[w,f];if(g){while(b=b[d])if((1===b.nodeType||e)&&a(b,c,g))return!0}else while(b=b[d])if(1===b.nodeType||e){if(i=b[u]||(b[u]={}),(h=i[d])&&h[0]===w&&h[1]===f)return j[2]=h[2];if(i[d]=j,j[2]=a(b,c,g))return!0}}}function sb(a){return a.length>1?function(b,c,d){var e=a.length;while(e--)if(!a[e](b,c,d))return!1;return!0}:a[0]}function tb(a,b,c){for(var d=0,e=b.length;e>d;d++)fb(a,b[d],c);return c}function ub(a,b,c,d,e){for(var f,g=[],h=0,i=a.length,j=null!=b;i>h;h++)(f=a[h])&&(!c||c(f,d,e))&&(g.push(f),j&&b.push(h));return g}function vb(a,b,c,d,e,f){return d&&!d[u]&&(d=vb(d)),e&&!e[u]&&(e=vb(e,f)),hb(function(f,g,h,i){var j,k,l,m=[],n=[],o=g.length,p=f||tb(b||"*",h.nodeType?[h]:h,[]),q=!a||!f&&b?p:ub(p,m,a,h,i),r=c?e||(f?a:o||d)?[]:g:q;if(c&&c(q,r,h,i),d){j=ub(r,n),d(j,[],h,i),k=j.length;while(k--)(l=j[k])&&(r[n[k]]=!(q[n[k]]=l))}if(f){if(e||a){if(e){j=[],k=r.length;while(k--)(l=r[k])&&j.push(q[k]=l);e(null,r=[],j,i)}k=r.length;while(k--)(l=r[k])&&(j=e?J(f,l):m[k])>-1&&(f[j]=!(g[j]=l))}}else r=ub(r===g?r.splice(o,r.length):r),e?e(null,g,r,i):H.apply(g,r)})}function wb(a){for(var b,c,e,f=a.length,g=d.relative[a[0].type],h=g||d.relative[" "],i=g?1:0,k=rb(function(a){return a===b},h,!0),l=rb(function(a){return J(b,a)>-1},h,!0),m=[function(a,c,d){var e=!g&&(d||c!==j)||((b=c).nodeType?k(a,c,d):l(a,c,d));return b=null,e}];f>i;i++)if(c=d.relative[a[i].type])m=[rb(sb(m),c)];else{if(c=d.filter[a[i].type].apply(null,a[i].matches),c[u]){for(e=++i;f>e;e++)if(d.relative[a[e].type])break;return vb(i>1&&sb(m),i>1&&qb(a.slice(0,i-1).concat({value:" "===a[i-2].type?"*":""})).replace(Q,"$1"),c,e>i&&wb(a.slice(i,e)),f>e&&wb(a=a.slice(e)),f>e&&qb(a))}m.push(c)}return sb(m)}function xb(a,b){var c=b.length>0,e=a.length>0,f=function(f,g,h,i,k){var l,m,o,p=0,q="0",r=f&&[],s=[],t=j,u=f||e&&d.find.TAG("*",k),v=w+=null==t?1:Math.random()||.1,x=u.length;for(k&&(j=g!==n&&g);q!==x&&null!=(l=u[q]);q++){if(e&&l){m=0;while(o=a[m++])if(o(l,g,h)){i.push(l);break}k&&(w=v)}c&&((l=!o&&l)&&p--,f&&r.push(l))}if(p+=q,c&&q!==p){m=0;while(o=b[m++])o(r,s,g,h);if(f){if(p>0)while(q--)r[q]||s[q]||(s[q]=F.call(i));s=ub(s)}H.apply(i,s),k&&!f&&s.length>0&&p+b.length>1&&fb.uniqueSort(i)}return k&&(w=v,j=t),r};return c?hb(f):f}h=fb.compile=function(a,b){var c,d=[],e=[],f=A[a+" "];if(!f){b||(b=g(a)),c=b.length;while(c--)f=wb(b[c]),f[u]?d.push(f):e.push(f);f=A(a,xb(e,d)),f.selector=a}return f},i=fb.select=function(a,b,e,f){var i,j,k,l,m,n="function"==typeof a&&a,o=!f&&g(a=n.selector||a);if(e=e||[],1===o.length){if(j=o[0]=o[0].slice(0),j.length>2&&"ID"===(k=j[0]).type&&c.getById&&9===b.nodeType&&p&&d.relative[j[1].type]){if(b=(d.find.ID(k.matches[0].replace(bb,cb),b)||[])[0],!b)return e;n&&(b=b.parentNode),a=a.slice(j.shift().value.length)}i=W.needsContext.test(a)?0:j.length;while(i--){if(k=j[i],d.relative[l=k.type])break;if((m=d.find[l])&&(f=m(k.matches[0].replace(bb,cb),_.test(j[0].type)&&ob(b.parentNode)||b))){if(j.splice(i,1),a=f.length&&qb(j),!a)return H.apply(e,f),e;break}}}return(n||h(a,o))(f,b,!p,e,_.test(a)&&ob(b.parentNode)||b),e},c.sortStable=u.split("").sort(B).join("")===u,c.detectDuplicates=!!l,m(),c.sortDetached=ib(function(a){return 1&a.compareDocumentPosition(n.createElement("div"))}),ib(function(a){return a.innerHTML="<a href='#'></a>","#"===a.firstChild.getAttribute("href")})||jb("type|href|height|width",function(a,b,c){return c?void 0:a.getAttribute(b,"type"===b.toLowerCase()?1:2)}),c.attributes&&ib(function(a){return a.innerHTML="<input/>",a.firstChild.setAttribute("value",""),""===a.firstChild.getAttribute("value")})||jb("value",function(a,b,c){return c||"input"!==a.nodeName.toLowerCase()?void 0:a.defaultValue}),ib(function(a){return null==a.getAttribute("disabled")})||jb(K,function(a,b,c){var d;return c?void 0:a[b]===!0?b.toLowerCase():(d=a.getAttributeNode(b))&&d.specified?d.value:null}),"function"==typeof define&&define.amd?define(function(){return fb}):"undefined"!=typeof module&&module.exports?module.exports=fb:a.Sizzle=fb}(window);
return Sizzle;
}

function init_compatible()
{
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
}

})();}
