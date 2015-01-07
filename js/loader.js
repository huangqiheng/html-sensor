if(self==top){(function(){
	var LazyLoad=(function(j){var g,h,b={},e=0,f={css:[],js:[]},m=j.styleSheets;function l(q,p){var r=j.createElement(q),o;for(o in p){if(p.hasOwnProperty(o)){r.setAttribute(o,p[o])}}return r}function i(o){var r=b[o],s,q;if(r){s=r.callback;q=r.urls;q.shift();e=0;if(!q.length){s&&s.call(r.context,r.obj);b[o]=null;f[o].length&&k(o)}}}function c(){var o=navigator.userAgent;g={async:j.createElement("script").async===true};(g.webkit=/AppleWebKit\//.test(o))||(g.ie=/MSIE/.test(o))||(g.opera=/Opera/.test(o))||(g.gecko=/Gecko\//.test(o))||(g.unknown=true)}var n={Version:function(){var o=999;if(navigator.appVersion.indexOf("MSIE")!=-1){o=parseFloat(navigator.appVersion.split("MSIE")[1])}return o}};function k(A,z,B,w,s){var u=function(){i(A)},C=A==="css",q=[],v,x,t,r,y,o;g||c();if(z){z=typeof z==="string"?[z]:z.concat();if(C||g.async||g.gecko||g.opera){f[A].push({urls:z,callback:B,obj:w,context:s})}else{for(v=0,x=z.length;v<x;++v){f[A].push({urls:[z[v]],callback:v===x-1?B:null,obj:w,context:s})}}}if(b[A]||!(r=b[A]=f[A].shift())){return}h||(h=j.head||j.getElementsByTagName("head")[0]);y=r.urls;for(v=0,x=y.length;v<x;++v){o=y[v];if(C){t=g.gecko?l("style"):l("link",{href:o,rel:"stylesheet"})}else{t=l("script",{src:o});t.async=false}t.className="lazyload";t.setAttribute("charset","utf-8");if(g.ie&&!C&&n.Version()<10){t.onreadystatechange=function(){if(/loaded|complete/.test(t.readyState)){t.onreadystatechange=null;u()}}}else{if(C&&(g.gecko||g.webkit)){if(g.webkit){r.urls[v]=t.href;d()}else{t.innerHTML='@import "'+o+'";';a(t)}}else{t.onload=t.onerror=u}}q.push(t)}for(v=0,x=q.length;v<x;++v){h.appendChild(q[v])}}function a(q){var p;try{p=!!q.sheet.cssRules}catch(o){e+=1;if(e<200){setTimeout(function(){a(q)},50)}else{p&&i("css")}return}i("css")}function d(){var p=b.css,o;if(p){o=m.length;while(--o>=0){if(m[o].href===p.urls[0]){i("css");break}}e+=1;if(p){if(e<200){setTimeout(d,50)}else{i("css")}}}}return{css:function(q,r,p,o){k("css",q,r,p,o)},js:function(q,r,p,o){k("js",q,r,p,o)}}})(this.document);

	var regex_matched = function(src, reg_arr) {
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
	};

	var url_matched = function(reg_arr) {
		return regex_matched(window.location.href, reg_arr);
	};

	var ua_matched = function(reg_arr) {
		return regex_matched(navigator.userAgent, reg_arr);
	};

	var host_matched = function(reg_arr) {
		return regex_matched(window.location.hostname, reg_arr);
	};

	var script_url= function (part) {   
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
		default return self_url;
		}
	}

	if (window.omp_global_data === undefined) {
		window.omp_global_data = {};
	} else {
		return;
	}

	if (url_matched(['-homemini$'])) {
		return;
	}

	var data = window.omp_global_data;
	data.LazyLoad = LazyLoad;
	data.url_matched = url_matched;
	data.ua_matched = ua_matched;
	data.host_matched = host_matched;
	data.self_url = script_url();
	data.self_host = script_url('hostname');
	data.root_prefix = script_url('prefix');

	//加载jquery和setting
	if (typeof load_jquery === 'function') {
		load_jquery();
		done_load_jquery();
	} else {
		LazyLoad.js( data.root_prefix+'js/jquery.min.js', done_load_jquery);
	}

	function done_load_jquery() {
		window.jQomp = jQuery.noConflict(true);

		if (typeof identify_init === 'function') {
			done_load_settings();
		} else {
			LazyLoad.js(data.root_prefix+'cache/settings.js', done_load_settings);
		}
	}

	function done_load_settings() {
		identify_init();
		call_main_entry();
	}

	//加载主函数和必要的库
	function call_main_entry() {
		if (host_matched(['appgame\.com'])) {
			LazyLoad.js( data.root_prefix+'js/rwt_main.js', function(){ jQomp(omp_main()); });
			return;
		}

		var index = 0;
		if (index = ua_matched(['MicroMessenger', 'Mobile\/.+QQ\/'])) {
			LazyLoad.js( data.root_prefix+'js/wx_main.js', function(){ jQomp(omp_main(index)); });
		} else {
			LazyLoad.js( data.root_prefix+'js/main.js', function(){ jQomp(omp_main(index)); });
		}
	}

})();}
