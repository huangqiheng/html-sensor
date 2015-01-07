function omp_main(data) { (function(){ 
data.msg_hookers = [];
var $ = data.jquery;

function main() 
{
	//打开登录窗口
	login_confirm();

	//执行心跳和消息
	heartbeat_request();

}

function exec_ident()
{
	//执行识别流程
	if (data.conf('is_ident_enabled', 'false') !== 'true') {
		data.log('identify service disabled');
		return;
	}
	data.ident_account(bind_device_user);
	data.ident_keyword(bind_device_keyword);
	data.ident_submits(bind_device_submits);
}

function heartbeat_request() 
{
	if (data.conf('is_hbeat_enabled', 'true') !== 'true') {
		data.log('heartbeat service disabled');
		return;
	}

	var query_obj = data.init_containers();
	query_obj.cmd = 'hbeat';
	query_obj.title = $('title:first').text().substring(0,256);

	data.log(query_obj);

	$.ajax({
		type : "GET",
		dataType : "jsonp",
		data: query_obj,
		url : data.root_prefix+'hbeat.php', 
	}).done(function (hbeat_obj) {
		if (!hbeat_obj.hasOwnProperty('device')) {return;}
		//保存全局对象
		var device = hbeat_obj.device;
		data.device = device;
		data.hbeat_obj = hbeat_obj;
		if (device.length != 32) {return;}

		data.log(hbeat_obj);

		//处理事件，可以过滤hbeat_obj
		if (hbeat_obj.hasOwnProperty('events')) {
			handle_omp_events();
		}

		//呈现消息
		if (hbeat_obj.hasOwnProperty('async_msg')) {
			present_message(hbeat_obj.async_msg);
		}

		if (hbeat_obj.hasOwnProperty('sched_msg')) {
			$.each(hbeat_obj.sched_msg, function() {
				present_message(this);
			});
		}

		if (hbeat_obj.hasOwnProperty('replace_msg')) {
			$.each(hbeat_obj.replace_msg, function() {
				present_message(this);
			});
		}

		//输出来自服务器的调试信息
		print_trace(hbeat_obj);
	}).always(function () {
		//恢复替换容器
		data.show_containers();

		//执行识别流程
		exec_ident();

		//打开实时通道
		push_routine(); 
	});
}

function handle_omp_events()
{
	var events = data.hbeat_obj.events;
}

function bind_device_submits(que_obj)
{
	data.que_cookie({
		cmd:'kword',
		device: data.device,
		ktype: que_obj.ktype,
		cap: que_obj.caption,
		kword: que_obj.keyword
	});
}

function bind_device_keyword(kword_obj)
{
	$.ajax({
		type : "GET",
		url : data.root_prefix+'hbeat.php', 
		dataType : "jsonp",
		data: {
			cmd:'kword',
			device: data.device,
			ktype: kword_obj.ktype,
			cap: kword_obj.caption,
			kword: kword_obj.keyword
		}
	}).success(function(res_obj){
		print_trace(res_obj);
		data.log('sent keyword,  type:' + kword_obj.ktype+ " kword: " + kword_obj.keyword);
	});
}

function print_trace(res_obj)
{
	if (res_obj.hasOwnProperty('trace')) {
		if (res_obj.trace) {
			if (res_obj.trace.length) {
				for(var index in res_obj.trace) {
					data.log(res_obj.trace[index]);
				} 
			}
		}
	}
}

function bind_device_user(id_obj)
{
	var device_id = data.device;
	var hbeat_obj = data.hbeat_obj;

	if (hbeat_obj.hasOwnProperty('binded')) {
		var cap_md5 = data.md5(id_obj.capview);
		if (hbeat_obj.binded.indexOf(cap_md5) >= 0) {
			data.log('had been reported: '+id_obj.capview);
			return;
		} else {
			data.log('new bind: '+id_obj.capview + ' md5:' + cap_md5);
		}
	}

	$.get(data.root_prefix+'hbeat.php?callback=?', {
		cmd:'bind',
		device: device_id,
		cap: id_obj.caption,
		user: id_obj.username,
		nick: id_obj.nickname
	},
	function (res_obj) {
		print_trace(res_obj);
		data.log('bind ok: -- dev_id:' + device_id + ' username:' + id_obj.username + " nickname: " + id_obj.nickname);
	}, 'json');
}

function present_message(eventMessage) 
{
	//入口检查和格式化
	var cmdbox = eventMessage;
	if (typeof eventMessage === 'string') {
		if (eventMessage == '') {
			return;
		}
		cmdbox = $.parseJSON(eventMessage);
	}

	//调用过滤钩子
	for (var index in data.msg_hookers) {
		var hooker = data.msg_hookers[index];
		cmdbox = hooker(cmdbox);

		//如果被拦截则直接退出
		if (cmdbox === null) {
			return;
		}
	}

	//如果是替换消息
	if (cmdbox.hasOwnProperty('msgform')) {
		if (cmdbox.msgform === 'replace') {
			data.exec_containers(cmdbox);
			return;
		}
	}

	//默认就当成是弹出消息
	execute_popup_message(cmdbox);
}


function execute_popup_message(cmdbox)
{
	$.extend($.gritter.options, { 
		position: cmdbox.position
	});

	$.gritter.add({
		title: cmdbox.title,
		text: cmdbox.text,
		time: cmdbox.time,
		sticky: cmdbox.sticky==='true',
		before_open: function(){
			do {
				if (!(cmdbox.before_open==true)) break;
				if (!document.hasFocus()) break;
				alert('有新消息到来');
			} while (false);
		}
	});
}

function push_routine() 
{
	device_id = data.device;

	if (data.conf('is_push_enabled', 'false') !== 'true') {
		data.log('push service disabled');
		return;
	}


	var push_server = data.conf('push_server', data.self_host);
	var push_modes = data.conf('push_modes', 'websocket|eventsource|longpolling|stream'); 
	var push_loglevel = data.conf('push_loglevel', 'error');

	PushStream.LOG_LEVEL = push_loglevel;

	var pushstream = new PushStream({
		host: push_server,
		port: window.location.port,
		modes: push_modes
		});

   	pushstream.onmessage = present_message;

    	pushstream.onstatuschange = function (state) {
		data.log((state == PushStream.OPEN)? 'omp online now' : 'omp offline now');
	};

	//后面代码，ie在bbs有兼容问题，发帖后显示内部错误
	//暂时先忽略ie
	if (/msie/.test(navigator.userAgent.toLowerCase())) {
		return;
	}

	(function (channel) {
		pushstream.removeAllChannels();
		try {
		    pushstream.addChannel(channel);
		    pushstream.connect();
		} catch(e) {data.log(e)};
	})(device_id);
}

//---------------------------------------//
//------------  登陆窗口函数 ------------//
//---------------------------------------//

function login_confirm() 
{
	if (data.conf('is_login_enabled', 'false') == 'false') {
		data.log('login service disabled');
		return;
	}

	if (data.get_cookie('is_logined') == 'true') {
		return;
	}

	 window.on_omp_login_submit = function () {
		var inputs = $('input.mod-input');
		var user = inputs[0].value;
		var pass = inputs[1].value;
		if ((user === 'drcom') && (pass === '123')) {
			close_modalPopLite('force_login_win');
			data.set_cookie('is_logined', 'true', 300);
		} else {
			inputs[0].value = '';
			inputs[1].value = '';
		}
	};

	 window.on_omp_login_cancel = function () {
	 	$('body').html(['<div style="margin-top:200px; margin-left:200px; font-size:27px; color:red; line-height:34px;">',
			'对不起，您没有访问权限。请向管理员申请账户密码。',
			'</div>'].join(''));
	 };

	var html_block = data.here_doc(function(){ /*!
	<div id="msg-body">
	    <div class="bodyHead"><div id="login-logo"></div></div>
	    <div class="loginContent genenalContent genenalInput">
		<table>
			<tr><td><input class="mod-input" type="text" value="邮箱 / 城市热点帐号" name="email" id="email" onfocus="if(this.value==defaultValue) {this.value='';}" onblur="if(!value) {value=defaultValue;}"></td></tr>
			<tr><td><input class="mod-input" type="text" id="password" name="password" value="请输入密码" onfocus="if(this.value==defaultValue) {this.value='';this.type='password';}" onblur="if(!value) {value=defaultValue; this.type='text';}"></td></tr>
			<tr><td><a href="javascript:void(0);" class="a-link point-link" onclick="on_omp_login_submit(this);">登录</a><b></b>
				<a href="javascript:void(0);" class="a-link point-link" onclick="on_omp_login_cancel(this);">取消</a>
				</td></tr>
			<tr><td>测试账户：drcom 密码：123<br>登录有效期：300秒</td></tr>
			<tr><td style="color:red;">这是个强制附加的统一登录界面，<br>OMP可以限定用户的访问权限。</td></tr>
		</table>
	    </div>
	</div>
	*/});

	var css_block = data.here_doc(function(){ /*!
	<style type="text/css">
	#msg-body {
		padding:10px; 
		padding-left:30px; 
		padding-right:30px; 
		height:100%; 
		background:white;
	}
	input.mod-input[type="text"], input.mod-input[type="password"] {
		background:#fff; 
		border:1px #ddd solid; 
		font-family: 'Microsoft YaHei'; 
		border-radius:5px; 
		color:#aaaaaa; 
		outline:none; 
		float:left; 
		-webkit-box-shadow:none; 
		box-shadow:none; 
		-webkit-appearance: none;
	}
	input.mod-input[type="text"]:focus,input.mod-input[type="password"]:focus {
		outline:none; 
		border:1px #bbb solid;
	}
	input.mod-input[type="text"].error,input.mod-input[type="password"].error {
		border:1px #ff0000 solid; 
		color:#ff0000;
	}
	#login-logo {
		width:140px; 
		height:97px; 
		background-image: url(data:image/jpeg;base64,/9j/4AAQSkZJRgABAgAAZABkAAD/7AARRHVja3kAAQAEAAAAUAAA/+4ADkFkb2JlAGTAAAAAAf/bAIQAAgICAgICAgICAgMCAgIDBAMCAgMEBQQEBAQEBQYFBQUFBQUGBgcHCAcHBgkJCgoJCQwMDAwMDAwMDAwMDAwMDAEDAwMFBAUJBgYJDQsJCw0PDg4ODg8PDAwMDAwPDwwMDAwMDA8MDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwM/8AAEQgAYQCMAwERAAIRAQMRAf/EALYAAQACAgIDAQAAAAAAAAAAAAAICQIDBgcBBQoEAQEAAgMBAQEAAAAAAAAAAAAABQYDBAcBAggQAAEDBAECAwMHBgsJAAAAAAECAwQAEQUGByESMRMIQVEUYXGBkSIVCbHRMkJTJKFScpIjY7OEdSY2gtIzQ3NUNTcYEQACAQMBAwkFBgQHAQAAAAAAAQIRAwQhMRIFQVFhcYGRobEGwdEichPwMkIzFBXh8VI0YoKSorI1B2P/2gAMAwEAAhEDEQA/AL5KAUAoBQCgFAKAUAoBQCgFAKAUAoBQCgFAKAUAoBQCgFAKAUAoBQCgFAKAUAoBQCgFAKAUAoBQCgFAKAUAoBQCgFAKAUAoBQCgFAa1OtJNlOJSfcSAaUB4DzJIAdQSegAULmvaCpsuLXuLeN68Br89j9sj+cK9oKm2vAKAUBipSUC61BI95NqAxDzJIAdQSfABQr2gNleAwU62g2W4lJ9xIFKAJcbXfsWldvHtINAeFOtINlOJSfcSAaUBklaFi6FBY94N6AxU60g2U4lJ9xIBpQGSVoWLoUFj3g3oD1TOwYGRlJGDYzcB/NRE98vDtyWlSmk9PtLZCitI6jqRX27clHeadOfkPlTi3Sup7evg+j58/XTmcxE9UHIseJlpsZhDWFKGGpDiEJviIZNkhQAuevSul+nrcXgwbS5f+TKZxeclkyo3yeSOA4uDy1o2lyN7w6M0qbJZW3L2lD61Iw0Z1IStCSVkofdQ4LqtdCFC3VXTG8jGyshW5NKKekafffPs+6uTnZ9/SvWLTmk957X/AErm63y8yOwPT16leS8NC2bi/J5yRntR2PXM4zGbnOrckY977vkOJdivlXekdw6pJt7RY15xjhlisb8VSSlHZsdZJao94fm3PitN1Ti+zRkbS5mcU22/s2y5WC46gOMYVmQ6Zi0KF0qX3K7WQQehV19yTUk7iutqzBOm2TXw9n9XZp0mnuuCrck10Lb/AA+2hIbL+uv1AS8VCwWB2FjVcXj4zcZlUOO29MWltPaFuypCXFFR9pSEj5K0bHpvEhrNOT6dncjZu8Yvy0i91dHvLBvQBypyJyRru6HftlnbO/ByQVCmZBXe4hC2m7oQbCyQQSAPaTVV9R49qxkRjaikt3k56snOD3rl203NtuvL1IsDycswMbkJyUBxUKM6+GybBRbQVWv8tqgYqrSJWToqnzy8xc3796itg+8Ie0z8cuIVDF8aB/yWWTYBfwLjQbTJUbf8wB0+Ce6uk4eHa4dGkoJp7Z7f9S/D2adRTsjInmOsZa/0+7n8zo3PQ+UtHdxkjYF7Brj8zuexT0h99layyU3U2e+90kj5qkMe/i5Sf092VNuhqXrd+xTfqq7NSxDgz1ict5nivdtenZbHT98w6IcHj7Zcs2VKlS5fmBEaSQQhTqg0QytfRSykOXv1q3E+D49nJg0nuNNyS5FGmq6NdejYTeHxC9csyVVvKiTfK3Xx00K95Gf5Y5I2yeuRmM9sm3ZJ1xya0X3fPUtBsoeWFJCe3w7QAB4AVaZ/pcS0m1GMOTQhI/XyJtKrkfu1TlLlnh3b15DC7JlcHsOIfVGyWOkurcbWW1WWxJYcJSsXFiCOnssa8u4eNm2lWKcWqprzQhkXsa5o2mtpJ/1K745zPqWqcsY0yde3bC4XGI37Ewn3UxnoeQU6IstlPdcBt9C2lX6/bR1NQfBraxrsrEtYuUlFta1jtXatexknxGbvQjdWkklXqls8Tlf4d3KeUx/J2Y0nLZiRJx+0wviIrMl5bgEmLcXT3k2JQs3+asXqvEX04XYqlHR9v8jJwK+9+UG9qr3EUOeuUsxvnMfIm0Qc3NRjJ+akt4hDUl1LYhxleRHKUhQABbbB6e+p/huHGzjQg0qpa6cr1ZE5mRK5elJPSpZX+G7ls1ldD3yFJy0h7y8ipURx9ani044y2O4d5PhYG1Uz1RFRy1Rabq82WPgjbsPXlfkj0uC4v5dxm84SM7CykaXh8jAdMpbnfEjuxTA+Lmx3vNV5pyIYlhZCAs/EEvdSq3xfzbMrcqNap9brvUT003Kx5afD8J9Wsa4pLbpTqVKVf+akun4tS0u0r7vtf99+Htf+t7P96q6S5Q/6uIMWR6veTcnkWg/i9bx+Ky09hXQOiPhoXlMk/wBY6UI+mr/w2clw23bi6Sm3FdFZOr7I1KrmRX6ycpbIpPuSou+hzbinJzMz6LPUXPyLpkynnVvuOq/aOyoylke69/qrUyLcbfF7UIqiSSXczPZm54E5Pa2/NEUuBoLcXaEbA/LXCls47NK11SQDeTExrzxcUFAgpQe1IFuqlD2A1Mcaub8VaWzei5dTkkl1vyXSR/DYbr33tpKnYtX2HTsdiVm5U7I5CYsoQTJy2UfJcWStXiSTda1qNgL9T8lzUtcuKylGK1eiX22JcpoQg7jcm9OV/blZa7w/6DcFn9YxOwZfPvNIykZD7Zh9qV2WAerpSV36/q9tUHL9Q3pTaSWj5dnds76lqscJtxim6/bpJ28H8C4Tg+LmIWEy03JsZh4Pu/GuqeWhYSlP2VrJNrJHSoXLy55MlKdKpU0SXkSNjHjZVI17XU7k2DsGBzZcBU38BJ70pNiR5Sr2JBsforBb+8usyz+6z5Y81io8KUxlcNKdmYSZJUIcp0BD7LqFAqYfSk2DiQQbjoofaHtA67avOScJKkkuxrnXR5FBnb3WpRdU/tRlyPL/AKYs96keO+Gsxi9kZxWQ1vDONSW5DHmfEfFhlXeVhaSCnyvcb3rnvC+Mft7mtze3nz02V6C2Z3Dv1ai96lFzEQOXfS5tfp24a2bM5fPxsknN5zCsxVRUqaW04wZCwoHuPvqd4fxX9xzI1hTdjLlrWtOjoIvLwP0mPKkq1kujZUx9OLac3z/xZvzTSf8AOEKV9/BKQE/e8LtZmKt4Xe7m3j8rhrDxh/Tw52H+Cap8rq492zsMnD1v5Ebq/FF1+Zbff2kbvUgAOfuZQkAAbjmLAdAP3tyrLwr+0tfKvIhs78+fzM57rryZO0aDqchQ+A37jpGvyUqP2Q7JMoxXCPe3IQ2ofKKh7i3bNy6ttu85dlUn4NkjB1uQg9kraXhp4nQ+n7XmuPNoY2DFFUbLYsSWEgkpKVOtLYV4e1Pdf5xU9lY0Mq3uS2Np9zqRVi9KxPeW3Vew4iTc3PUnxraMJcn+GT/pLe/8ST/Zornfqv8Au18q82W3gX5D+Z+wtI7U93d2juHgq3X66rJNGVAURetAFnmb1FS0Gy3lafAV/wBNeMivn6y0KvvBNYYy5lcfjT2lW4lpK8+mC8K+w9xwqR/8Q+oYXFyBYf3iLWHM/wC5t9nkzJj/APXT7fYRk0S7G16jDR0aRqGUfsPArkwpji1fT0H0VI5etmcuV3Y+EopGnj6XIr/5vxTZ1JPHw2v4RhHRM9b8yQR+spKvKRf+SAfrqXtfFenJ8lEvM0LmluK56v2H0b8b7KxpnpxxO3SozkyPrGpryr8Rn/iOpiRi8UJ+VXbauPZ15WVcuNV3avuOn8D4bLiWXYxItRd2cIJvYt9qNX1VKpsh6+PUFK2JzMQ8tjMbivPK2NXRAZcipavcNqdWkvq6dCrzAfb0rmcvVWa7m8mkuamnv8T9sWf/AAT0zDF+jOFyVymtzfalXnUV8C6t19pbBxVyyzzPwwvdRA+65kvGS28njwSpLchttaF9ij1KSRdPyV0XheX+qtW7tKb1NO0/HPrH0++AcUyMBz3/AKUqKXOmlJV5nRqq5z5zsGsvo2TGLN2Ho5mIB8EvxHUrSsfKUFaP9quzZPwuEuWtOyS99H2HILOqlHor3P8AmWzcx808i8VYH094jSNg+6IezaxmW8qyGGHu59mK2mK+C62sgsrV3ADof1gRVE4XhWr9u7K5GrjKNNuxvVdqLPm5Fy3OEYuiafloQi2Xn7lTl3hPfcVyNsy9mZxmbwMnGOOx4zCmFK+LQsD4dpq4VcX7r+HSrPbwLGJm21ajSsZV28lOchZ5Vy/jT+o60lH2nZvoZaE/Z8MHlf8AhM5Idi9x/REqEC4B85jpNRnqfRunLFeEn7zc4Lql0N+K/gRk9SH/AL/5m9v+ccx1/vblWThX9pa+VeRD5358/mZ+96UuDuvBEtv9OPicAtP0Tnaj1Hexcpf4rnkbbdL9h9EDiXKGuOYjYMrlUD9wy+ezrEY+wLgz3G1I+hKkH6a3+HZP1IbnLGMf90U/eauXZ3Jb3I3LwZw7J4V/GY3AT3wUjOxnZTAP7NDy2QfpKDWxZyFcnOK/C6eCftMNy1uRi3+JV8aFvH4ZP+kt7/xJP9miqJ6r/u18q82WjgX5D+Z+wtKqsk0KApk9VnFfIe0c1c7fdOn5Ofj9lxmv5DWpzLXczKfxcSE08hCr+ISXRY+1NXHhefYs2sfemk4uaa5lKrXku8r2bi3bk7tIuj3WutU/iQXRw/zQyw7Eb0fYmozvR+Mlh0Nr/lJHQ+Htqx/vGC3X6kakR+35VKbjJj8P+lXkPP641vuRx7+Iyms63lsdE151v+nmLVHlCPYkixUHgjt9/tqtZvGbTuO1DWDuRk5c2qr4raTGNw6agpy0kotU76eZFxHBvLeR197Hr4+zTWU1t9x5plUYgvRnylLqEH2qbWAq3tSVH2VO/vGJC9VXFSS16GveiM/b78rdNx1XimfQFwzilo4g1DD5iEUlWHajZCBIR4hTfattaT7xcEGubXqSlLlTbLnZlK3uyi2mqUfKmiK+w/h58XZLYnMtiMpPw2LfeLrmBQvvYQCblDZI7wn3Du6VWpel8J3N+j6q6e/xOx2f/dvU9vF/T/Ug3Sn1HBO5313W+lwb5yY2ncca7o+nJ0rAsGLixGXHUU2CiHEFBV89jVhtRVpJRVEti6jkeXk3cu7O7ek5Tm25Sbq23tbfOUkcxejTk/iR/OPa5j5G84LNOfC4vJwEXfYjFYdX8S0PBR7QgFNwevh4V0DE9QWMlx+q1Dd1ddjexU8X3FOv8KuWVLc+KunUtup1JqfDnMsqXNkSdLz8iRAx0hnEtSELsl6Wn4dKgXDZKUBZWo/JWxl8Ww2oxjONHJN05o/F4tJGGxgZCbbi60aXW9PAmJxn6Ctyy3FW24/YM23gc1swhy8YwUd7bb0IuKbQ6DZRSvzCCR1HiB06wmR6lUsqN2MPhimulp0q+jZoSVrgzViUJS+J0fQqEbdq9O3OPH2mt4A6fk3p7uxPypk3FXcbDUdhLDCkuNkEh3zFkC3s62qWs8YxL2Q7spJR3ElXnq2+7Q0bnD79uyoRVXvN6dVEdba36d+Y9v2CLilaflIb2Qd/psjPaWlAuftKUpXUmtzI4/h2bbcZKT5EjWtcKyLkqSVOlkiOQPTXyLqfLPE2Ha12fmMJhcdhWH88y13MFcd9x51JUnwKb2qFscWtSwr29JKc3J0+YkrmBNZNvdTcYqOvUe6zPp75K5A4RzDsfT5kfdMDvc/KIw8oJafVBySnC929yrGyvLVYH2Ux+LWMbMb3qwcIqq54r+Yu4F29jpbvxbzdOhnDPUJ6e+RcRD4khYPS8lkouP1BmNkJMVkrSmZ8TIW4hVuoVZQJ+es/BOLWIxuSuzUXKbevM6GLiWBdbgoRbSikTS/Dr1HZ9S1rdYuzYKZg5EielxhqY0W1LT5aBcA+y4qD9R5NrIyVK3JSW6tnWyT4RZnasuM1R19xZPUASooDWpppSu5TaVKtbuIBP10Bh8LF/wC2a/mJ/NQG1KEIT2oQlCf4oAA+qgNfw0cEkMN3Pie0fmoDalKUgJSAlI8AOgoDzQCgMVoQ4O1aErT7lAEfw0BrEaOn9FhsfMkfmoDcAALAWA8BQGC2m3OjjaXAPYoA/loDBMeOghSGG0qHgoJAP5KAyU00shS20rUnwKgCRQHlLbab9qEp7uqrAC/z0B4W005bzGkOW8O5INvroAhppu/ltpbv49oA/JQGygFAKAUAoBQCgFAKAUAoBQCgFAKAUAoBQCgFAKAUAoBQCgFAKAUAoBQCgFAKAUAoBQCgFAKAUAoBQCgFAKAUAoBQCgFAKAUAoBQCgFAKAUAoBQCgFAKAUAoBQCgFAKAUAoBQCgFAf//Z);
	}
	</style>
	 */});

	init_modalPopLite('force_login_win', html_block + css_block, -1, true);
	open_modalPopLite('force_login_win');
	window.close_modalPopLite = close_modalPopLite;

	$("input.mod-input").keyup(function(event){
		if(event.keyCode == 13){
			on_omp_login_submit();
		}
	});

}

//---------------------------------------//
//------------  模式窗口函数 ------------//
//---------------------------------------//

function open_modalPopLite(win_id)
{
	var open_id = win_id+'_open'; 
	var win_obj = $('#'+open_id);
	win_obj.trigger('click');

	var win = win_obj.closest('.win_modalPopList_class')[0];
	if (typeof win === 'undefined') {
		data.log('open_modalPopLite error');
	}

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
	z-index: 921479000 !important;
	background-color:#000;
	display:none;
	top:0px;
	left:0px;
	width:100%;
}
.modalPopLite-wrapper
{
	position:fixed;
	z-index: 921479999 !important;
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
	z-index: 921479999 !important;
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
	z-index: 921471000 !important;
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
	z-index: 921479999 !important;
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

function load_library() {
//jquery.gritter.min.js
(function(b){b.gritter={};b.gritter.options={position:"",class_name:"",fade_in_speed:"medium",fade_out_speed:1000,time:6000};b.gritter.add=function(f){try{return a.add(f||{})}catch(d){var c="Gritter Error: "+d;(typeof(console)!="undefined"&&console.error)?console.error(c,f):alert(c)}};b.gritter.remove=function(d,c){a.removeSpecific(d,c||{})};b.gritter.removeAll=function(c){a.stop(c||{})};var a={position:"",fade_in_speed:"",fade_out_speed:"",time:"",_custom_timer:0,_item_count:0,_is_setup:0,_tpl_close:'<div class="gritter-close"></div>',_tpl_title:'<span class="gritter-title">[[title]]</span>',_tpl_item:'<div id="gritter-item-[[number]]" class="gritter-item-wrapper [[item_class]]" style="display:none"><div class="gritter-top"></div><div class="gritter-item">[[close]][[image]]<div class="[[class_name]]">[[title]]<p>[[text]]</p></div><div style="clear:both"></div></div><div class="gritter-bottom"></div></div>',_tpl_wrap:'<div id="gritter-notice-wrapper"></div>',add:function(g){if(typeof(g)=="string"){g={text:g}}if(g.text===null){throw'You must supply "text" parameter.'}if(!this._is_setup){this._runSetup()}var k=g.title,n=g.text,e=g.image||"",l=g.sticky||false,m=g.class_name||b.gritter.options.class_name,j=b.gritter.options.position,d=g.time||"";this._verifyWrapper();this._item_count++;var f=this._item_count,i=this._tpl_item;b(["before_open","after_open","before_close","after_close"]).each(function(p,q){a["_"+q+"_"+f]=(b.isFunction(g[q]))?g[q]:function(){}});this._custom_timer=0;if(d){this._custom_timer=d}var c=(e!="")?'<img src="'+e+'" class="gritter-image" />':"",h=(e!="")?"gritter-with-image":"gritter-without-image";if(k){k=this._str_replace("[[title]]",k,this._tpl_title)}else{k=""}i=this._str_replace(["[[title]]","[[text]]","[[close]]","[[image]]","[[number]]","[[class_name]]","[[item_class]]"],[k,n,this._tpl_close,c,this._item_count,h,m],i);if(this["_before_open_"+f]()===false){return false}b("#gritter-notice-wrapper").addClass(j).append(i);var o=b("#gritter-item-"+this._item_count);o.fadeIn(this.fade_in_speed,function(){a["_after_open_"+f](b(this))});if(!l){this._setFadeTimer(o,f)}b(o).bind("mouseenter mouseleave",function(p){if(p.type=="mouseenter"){if(!l){a._restoreItemIfFading(b(this),f)}}else{if(!l){a._setFadeTimer(b(this),f)}}a._hoverState(b(this),p.type)});b(o).find(".gritter-close").click(function(){a.removeSpecific(f,{},null,true)});return f},_countRemoveWrapper:function(c,d,f){d.remove();this["_after_close_"+c](d,f);if(b(".gritter-item-wrapper").length==0){b("#gritter-notice-wrapper").remove()}},_fade:function(g,d,j,f){var j=j||{},i=(typeof(j.fade)!="undefined")?j.fade:true,c=j.speed||this.fade_out_speed,h=f;this["_before_close_"+d](g,h);if(f){g.unbind("mouseenter mouseleave")}if(i){g.animate({opacity:0},c,function(){g.animate({height:0},300,function(){a._countRemoveWrapper(d,g,h)})})}else{this._countRemoveWrapper(d,g)}},_hoverState:function(d,c){if(c=="mouseenter"){d.addClass("hover");d.find(".gritter-close").show()}else{d.removeClass("hover");d.find(".gritter-close").hide()}},removeSpecific:function(c,g,f,d){if(!f){var f=b("#gritter-item-"+c)}this._fade(f,c,g||{},d)},_restoreItemIfFading:function(d,c){clearTimeout(this["_int_id_"+c]);d.stop().css({opacity:"",height:""})},_runSetup:function(){for(opt in b.gritter.options){this[opt]=b.gritter.options[opt]}this._is_setup=1},_setFadeTimer:function(f,d){var c=(this._custom_timer)?this._custom_timer:this.time;this["_int_id_"+d]=setTimeout(function(){a._fade(f,d)},c)},stop:function(e){var c=(b.isFunction(e.before_close))?e.before_close:function(){};var f=(b.isFunction(e.after_close))?e.after_close:function(){};var d=b("#gritter-notice-wrapper");c(d);d.fadeOut(function(){b(this).remove();f()})},_str_replace:function(v,e,o,n){var k=0,h=0,t="",m="",g=0,q=0,l=[].concat(v),c=[].concat(e),u=o,d=c instanceof Array,p=u instanceof Array;u=[].concat(u);if(n){this.window[n]=0}for(k=0,g=u.length;k<g;k++){if(u[k]===""){continue}for(h=0,q=l.length;h<q;h++){t=u[k]+"";m=d?(c[h]!==undefined?c[h]:""):c[0];u[k]=(t).split(l[h]).join(m);if(n&&u[k]!==t){this.window[n]+=(t.length-u[k].length)/l[h].length}}}return p?u:u[0]},_verifyWrapper:function(){if(b("#gritter-notice-wrapper").length==0){b("body").append(this._tpl_wrap)}}}})($);

data.LazyLoad.css( data.root_prefix+'css/jquery.gritter.css');

//pushstream.js
(function (window, document, undefined) {
  "use strict";

  /* prevent duplicate declaration */
  if (window.PushStream) { return; }

  var days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  var valueToTwoDigits = function (value) {
    return ((value < 10) ? '0' : '') + value;
  };

  var dateToUTCString = function (date) {
    var time = valueToTwoDigits(date.getUTCHours()) + ':' + valueToTwoDigits(date.getUTCMinutes()) + ':' + valueToTwoDigits(date.getUTCSeconds());
    return days[date.getUTCDay()] + ', ' + valueToTwoDigits(date.getUTCDate()) + ' ' + months[date.getUTCMonth()] + ' ' + date.getUTCFullYear() + ' ' + time + ' GMT';
  };

  var extend = function () {
    var object = arguments[0] || {};
    for (var i = 0; i < arguments.length; i++) {
      var settings = arguments[i];
      for (var attr in settings) {
        if (!settings.hasOwnProperty || settings.hasOwnProperty(attr)) {
          object[attr] = settings[attr];
        }
      }
    }
    return object;
  };

  var validChars  = /^[\],:{}\s]*$/,
      validEscape = /\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,
      validTokens = /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,
      validBraces = /(?:^|:|,)(?:\s*\[)+/g;

  var trim = function(value) {
    return value.replace(/^\s*/, "").replace(/\s*$/, "");
  };

  var parseJSON = function(data) {
    if (!data || !isString(data)) {
      return null;
    }

    // Make sure leading/trailing whitespace is removed (IE can't handle it)
    data = trim(data);

    // Attempt to parse using the native JSON parser first
    if (window.JSON && window.JSON.parse) {
      try {
        return window.JSON.parse( data );
      } catch(e) {
        throw "Invalid JSON: " + data;
      }
    }

    // Make sure the incoming data is actual JSON
    // Logic borrowed from http://json.org/json2.js
    if (validChars.test(data.replace(validEscape, "@").replace( validTokens, "]").replace( validBraces, "")) ) {
      return (new Function("return " + data))();
    }

    throw "Invalid JSON: " + data;
  };

  var currentTimestampParam = function() {
    return { "_" : (new Date()).getTime() };
  };

  var objectToUrlParams = function(settings) {
    var params = settings;
    if (typeof(settings) === 'object') {
      params = '';
      for (var attr in settings) {
        if (!settings.hasOwnProperty || settings.hasOwnProperty(attr)) {
          params += '&' + attr + '=' + window.escape(settings[attr]);
        }
      }
      params = params.substring(1);
    }

    return params || '';
  };

  var addParamsToUrl = function(url, params) {
    return url + ((url.indexOf('?') < 0) ? '?' : '&') + objectToUrlParams(params);
  };

  var isArray = Array.isArray || function(obj) {
    return Object.prototype.toString.call(obj) === '[object Array]';
  };

  var isString = function(obj) {
    return Object.prototype.toString.call(obj) === '[object String]';
  };

  var Log4js = {
    logger: null,
    debug : function() { if  (PushStream.LOG_LEVEL === 'debug')                                         { Log4js._log.apply(Log4js._log, arguments); }},
    info  : function() { if ((PushStream.LOG_LEVEL === 'info')  || (PushStream.LOG_LEVEL === 'debug'))  { Log4js._log.apply(Log4js._log, arguments); }},
    error : function() {                                                                                  Log4js._log.apply(Log4js._log, arguments); },
    _log  : function() {
      if (!Log4js.logger) {
        var console = window.console;
        if (console && console.log) {
          if (console.log.apply) {
            Log4js.logger = console.log;
          } else if ((typeof console.log === "object") && Function.prototype.bind) {
            Log4js.logger = Function.prototype.bind.call(console.log, console);
          } else if ((typeof console.log === "object") && Function.prototype.call) {
            Log4js.logger = function() {
              Function.prototype.call.call(console.log, console, Array.prototype.slice.call(arguments));
            };
          }
        }
      }

      if (Log4js.logger) {
        Log4js.logger.apply(window.console, arguments);
      }

      var logElement = document.getElementById(PushStream.LOG_OUTPUT_ELEMENT_ID);
      if (logElement) {
        var str = '';
        for (var i = 0; i < arguments.length; i++) {
          str += arguments[i] + " ";
        }
        logElement.innerHTML += str + '\n';

        var lines = logElement.innerHTML.split('\n');
        if (lines.length > 100) {
          logElement.innerHTML = lines.slice(-100).join('\n');
        }
      }
    }
  };

  var Ajax = {
    _getXHRObject : function() {
      var xhr = false;
      try { xhr = new window.XMLHttpRequest(); }
      catch (e1) {
        try { xhr = new window.XDomainRequest(); }
        catch (e2) {
          try { xhr = new window.ActiveXObject("Msxml2.XMLHTTP"); }
          catch (e3) {
            try { xhr = new window.ActiveXObject("Microsoft.XMLHTTP"); }
            catch (e4) {
              xhr = false;
            }
          }
        }
      }
      return xhr;
    },

    _send : function(settings, post) {
      settings = settings || {};
      settings.timeout = settings.timeout || 30000;
      var xhr = Ajax._getXHRObject();
      if (!xhr||!settings.url) { return; }

      Ajax.clear(settings);

      xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
          Ajax.clear(settings);
          if (settings.afterReceive) { settings.afterReceive(xhr); }
          if(xhr.status === 200) {
            if (settings.success) { settings.success(xhr.responseText); }
          } else {
            if (settings.error) { settings.error(xhr.status); }
          }
        }
      };

      if (settings.beforeOpen) { settings.beforeOpen(xhr); }

      var params = {};
      var body = null;
      var method = "GET";
      if (post) {
        body = objectToUrlParams(settings.data);
        method = "POST";
      } else {
        params = settings.data || {};
      }

      xhr.open(method, addParamsToUrl(settings.url, extend({}, params, currentTimestampParam())), true);

      if (settings.beforeSend) { settings.beforeSend(xhr); }

      var onerror = function() {
        try { xhr.abort(); } catch (e) { /* ignore error on closing */ }
        Ajax.clear(settings);
        settings.error(304);
      };

      if (post) {
        xhr.setRequestHeader("Accept", "application/json");
        xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
      } else {
        settings.timeoutId = window.setTimeout(onerror, settings.timeout + 2000);
      }

      xhr.send(body);
      return xhr;
    },

    _clear_script : function(script) {
      // Handling memory leak in IE, removing and dereference the script
      if (script) {
        script.onerror = script.onload = script.onreadystatechange = null;
        if (script.parentNode) { script.parentNode.removeChild(script); }
      }
    },

    _clear_timeout : function(settings) {
      if (settings.timeoutId) {
        settings.timeoutId = window.clearTimeout(settings.timeoutId);
      }
    },

    clear : function(settings) {
      Ajax._clear_timeout(settings);
      Ajax._clear_script(document.getElementById(settings.scriptId));
    },

    jsonp : function(settings) {
      settings.timeout = settings.timeout || 30000;
      Ajax.clear(settings);

      var head = document.head || document.getElementsByTagName("head")[0];
      var script = document.createElement("script");
      var startTime = new Date().getTime();

      var onerror = function() {
        Ajax.clear(settings);
        var endTime = new Date().getTime();
        settings.error(((endTime - startTime) > settings.timeout/2) ? 304 : 0);
      };

      var onload = function() {
        Ajax.clear(settings);
        settings.load();
      };

      script.onerror = onerror;
      script.onload = script.onreadystatechange = function(eventLoad) {
        if (!script.readyState || /loaded|complete/.test(script.readyState)) {
          onload();
        }
      };

      if (settings.beforeOpen) { settings.beforeOpen({}); }
      if (settings.beforeSend) { settings.beforeSend({}); }

      settings.timeoutId = window.setTimeout(onerror, settings.timeout + 2000);
      settings.scriptId = settings.scriptId || new Date().getTime();

      script.setAttribute("src", addParamsToUrl(settings.url, extend({}, settings.data, currentTimestampParam())));
      script.setAttribute("async", "async");
      script.setAttribute("id", settings.scriptId);

      // Use insertBefore instead of appendChild to circumvent an IE6 bug.
      head.insertBefore(script, head.firstChild);
    },

    load : function(settings) {
      return Ajax._send(settings, false);
    },

    post : function(settings) {
      return Ajax._send(settings, true);
    }
  };

  var escapeText = function(text) {
    return (text) ? window.escape(text) : '';
  };

  var unescapeText = function(text) {
    return (text) ? window.unescape(text) : '';
  };

  var parseMessage = function(messageText, keys) {
    var msg = messageText;
    if (isString(messageText)) {
      msg = parseJSON(messageText);
    }

    var message = {
        id     : msg[keys.jsonIdKey],
        channel: msg[keys.jsonChannelKey],
        data   : isString(msg[keys.jsonDataKey]) ? unescapeText(msg[keys.jsonDataKey]) : msg[keys.jsonDataKey],
        tag    : msg[keys.jsonTagKey],
        time   : msg[keys.jsonTimeKey],
        eventid: msg[keys.jsonEventIdKey] || ""
    };

    return message;
  };

  var getBacktrack = function(options) {
    return (options.backtrack) ? ".b" + Number(options.backtrack) : "";
  };

  var getChannelsPath = function(channels) {
    var path = '';
    for (var channelName in channels) {
      if (!channels.hasOwnProperty || channels.hasOwnProperty(channelName)) {
        path += "/" + channelName + getBacktrack(channels[channelName]);
      }
    }
    return path;
  };

  var getSubscriberUrl = function(pushstream, prefix, extraParams) {
    var websocket = pushstream.wrapper.type === WebSocketWrapper.TYPE;
    var useSSL = pushstream.useSSL;
    var url = (websocket) ? ((useSSL) ? "wss://" : "ws://") : ((useSSL) ? "https://" : "http://");
    url += pushstream.host;
    url += ((!useSSL && pushstream.port === 80) || (useSSL && pushstream.port === 443)) ? "" : (":" + pushstream.port);
    url += prefix;

    var channels = getChannelsPath(pushstream.channels);
    if (pushstream.channelsByArgument) {
      var channelParam = {};
      channelParam[pushstream.channelsArgument] = channels.substring(1);
      extraParams = extend({}, extraParams, channelParam);
    } else {
      url += channels;
    }
    return addParamsToUrl(url, extraParams);
  };

  var getPublisherUrl = function(pushstream) {
    var channel = "";
    var url = (pushstream.useSSL) ? "https://" : "http://";
    url += pushstream.host;
    url += ((pushstream.port !== 80) && (pushstream.port !== 443)) ? (":" + pushstream.port) : "";
    url += pushstream.urlPrefixPublisher;
    for (var channelName in pushstream.channels) {
      if (!pushstream.channels.hasOwnProperty || pushstream.channels.hasOwnProperty(channelName)) {
        channel = channelName;
        break;
      }
    }
    url += "?id=" + channel;
    return url;
  };

  var extract_xss_domain = function(domain) {
    // if domain is an ip address return it, else return ate least the last two parts of it
    if (domain.match(/^(\d{1,3}\.){3}\d{1,3}$/)) {
      return domain;
    }

    var domainParts = domain.split('.');
    // if the domain ends with 3 chars or 2 chars preceded by more than 4 chars,
    // we can keep only 2 parts, else we have to keep at least 3 (or all domain name)
    var keepNumber = Math.max(domainParts.length - 1, (domain.match(/(\w{4,}\.\w{2}|\.\w{3,})$/) ? 2 : 3));

    return domainParts.slice(-1 * keepNumber).join('.');
  };

  var linker = function(method, instance) {
    return function() {
      return method.apply(instance, arguments);
    };
  };

  var clearTimer = function(timer) {
    if (timer) {
      clearTimeout(timer);
    }
    return null;
  };

  /* common callbacks */
  var onmessageCallback = function(event) {
    Log4js.info("[" + this.type + "] message received", arguments);
    var message = parseMessage(event.data, this.pushstream);
    this.pushstream._onmessage(message.data, message.id, message.channel, message.eventid, true);
  };

  var onopenCallback = function() {
    this.pushstream._onopen();
    Log4js.info("[" + this.type + "] connection opened");
  };

  var onerrorCallback = function(event) {
    Log4js.info("[" + this.type + "] error (disconnected by server):", event);
    if ((this.pushstream.readyState === PushStream.OPEN) &&
        (this.type === EventSourceWrapper.TYPE) &&
        (event.type === 'error') &&
        (this.connection.readyState === EventSource.CONNECTING)) {
      // EventSource already has a reconection function using the last-event-id header
      return;
    }
    this._closeCurrentConnection();
    this.pushstream._onerror({type: ((event && (event.type === "load")) || (this.pushstream.readyState === PushStream.CONNECTING)) ? "load" : "timeout"});
  };

  /* wrappers */

  var WebSocketWrapper = function(pushstream) {
    if (!window.WebSocket && !window.MozWebSocket) { throw "WebSocket not supported"; }
    this.type = WebSocketWrapper.TYPE;
    this.pushstream = pushstream;
    this.connection = null;
  };

  WebSocketWrapper.TYPE = "WebSocket";

  WebSocketWrapper.prototype = {
    connect: function() {
      this._closeCurrentConnection();
      var params = extend({}, this.pushstream.extraParams(), currentTimestampParam());
      var url = getSubscriberUrl(this.pushstream, this.pushstream.urlPrefixWebsocket, params);
      this.connection = (window.WebSocket) ? new window.WebSocket(url) : new window.MozWebSocket(url);
      this.connection.onerror   = linker(onerrorCallback, this);
      this.connection.onclose   = linker(onerrorCallback, this);
      this.connection.onopen    = linker(onopenCallback, this);
      this.connection.onmessage = linker(onmessageCallback, this);
      Log4js.info("[WebSocket] connecting to:", url);
    },

    disconnect: function() {
      if (this.connection) {
        Log4js.debug("[WebSocket] closing connection to:", this.connection.URL);
        this.connection.onclose = null;
        this._closeCurrentConnection();
        this.pushstream._onclose();
      }
    },

    _closeCurrentConnection: function() {
      if (this.connection) {
        try { this.connection.close(); } catch (e) { /* ignore error on closing */ }
        this.connection = null;
      }
    },

    sendMessage: function(message) {
      if (this.connection) { this.connection.send(message); }
    }
  };

  var EventSourceWrapper = function(pushstream) {
    if (!window.EventSource) { throw "EventSource not supported"; }
    this.type = EventSourceWrapper.TYPE;
    this.pushstream = pushstream;
    this.connection = null;
  };

  EventSourceWrapper.TYPE = "EventSource";

  EventSourceWrapper.prototype = {
    connect: function() {
      this._closeCurrentConnection();
      var params = extend({}, this.pushstream.extraParams(), currentTimestampParam());
      var url = getSubscriberUrl(this.pushstream, this.pushstream.urlPrefixEventsource, params);
      this.connection = new window.EventSource(url);
      this.connection.onerror   = linker(onerrorCallback, this);
      this.connection.onopen    = linker(onopenCallback, this);
      this.connection.onmessage = linker(onmessageCallback, this);
      Log4js.info("[EventSource] connecting to:", url);
    },

    disconnect: function() {
      if (this.connection) {
        Log4js.debug("[EventSource] closing connection to:", this.connection.URL);
        this._closeCurrentConnection();
        this.pushstream._onclose();
      }
    },

    _closeCurrentConnection: function() {
      if (this.connection) {
        try { this.connection.close(); } catch (e) { /* ignore error on closing */ }
        this.connection = null;
      }
    }
  };

  var StreamWrapper = function(pushstream) {
    this.type = StreamWrapper.TYPE;
    this.pushstream = pushstream;
    this.connection = null;
    this.url = null;
    this.frameloadtimer = null;
    this.pingtimer = null;
    this.iframeId = "PushStreamManager_" + pushstream.id;
  };

  StreamWrapper.TYPE = "Stream";

  StreamWrapper.prototype = {
    connect: function() {
      this._closeCurrentConnection();
      var domain = extract_xss_domain(this.pushstream.host);
      try {
        document.domain = domain;
      } catch(e) {
        Log4js.error("[Stream] (warning) problem setting document.domain = " + domain + " (OBS: IE8 does not support set IP numbers as domain)");
      }
      var params = extend({}, this.pushstream.extraParams(), currentTimestampParam(), {"streamid": this.pushstream.id});
      this.url = getSubscriberUrl(this.pushstream, this.pushstream.urlPrefixStream, params);
      Log4js.debug("[Stream] connecting to:", this.url);
      this.loadFrame(this.url);
    },

    disconnect: function() {
      if (this.connection) {
        Log4js.debug("[Stream] closing connection to:", this.url);
        this._closeCurrentConnection();
        this.pushstream._onclose();
      }
    },

    _clear_iframe: function() {
      var oldIframe = document.getElementById(this.iframeId);
      if (oldIframe) {
        oldIframe.onload = null;
        if (oldIframe.parentNode) { oldIframe.parentNode.removeChild(oldIframe); }
      }
    },

    _closeCurrentConnection: function() {
      this._clear_iframe();
      if (this.connection) {
        this.pingtimer = clearTimer(this.pingtimer);
        this.frameloadtimer = clearTimer(this.frameloadtimer);
        this.connection = null;
        this.transferDoc = null;
        if (typeof window.CollectGarbage === 'function') { window.CollectGarbage(); }
      }
    },

    loadFrame: function(url) {
      this._clear_iframe();
      try {
        var transferDoc = new window.ActiveXObject("htmlfile");
        transferDoc.open();
        transferDoc.write("<html><script>document.domain=\""+(document.domain)+"\";</script></html>");
        transferDoc.parentWindow.PushStream = PushStream;
        transferDoc.close();
        var ifrDiv = transferDoc.createElement("div");
        transferDoc.appendChild(ifrDiv);
        ifrDiv.innerHTML = "<iframe src=\""+url+"\"></iframe>";
        this.connection = ifrDiv.getElementsByTagName("IFRAME")[0];
        this.connection.onload = linker(onerrorCallback, this);
        this.transferDoc = transferDoc;
      } catch (e) {
        var ifr = document.createElement("IFRAME");
        ifr.style.width = "1px";
        ifr.style.height = "1px";
        ifr.style.border = "none";
        ifr.style.position = "absolute";
        ifr.style.top = "-10px";
        ifr.style.marginTop = "-10px";
        ifr.style.zIndex = "-20";
        ifr.PushStream = PushStream;
        document.body.appendChild(ifr);
        ifr.setAttribute("src", url);
        ifr.onload = linker(onerrorCallback, this);
        this.connection = ifr;
      }
      this.connection.setAttribute("id", this.iframeId);
      this.frameloadtimer = window.setTimeout(linker(onerrorCallback, this), this.pushstream.timeout);
    },

    register: function(iframeWindow) {
      this.frameloadtimer = clearTimer(this.frameloadtimer);
      iframeWindow.p = linker(this.process, this);
      this.connection.onload = linker(this._onframeloaded, this);
      this.pushstream._onopen();
      this.setPingTimer();
      Log4js.info("[Stream] frame registered");
    },

    process: function(id, channel, data, eventid) {
      this.pingtimer = clearTimer(this.pingtimer);
      Log4js.info("[Stream] message received", arguments);
      this.pushstream._onmessage(unescapeText(data), id, channel, eventid, true);
      this.setPingTimer();
    },

    _onframeloaded: function() {
      Log4js.info("[Stream] frame loaded (disconnected by server)");
      this.connection.onload = null;
      this.disconnect();
    },

    setPingTimer: function() {
      if (this.pingtimer) { clearTimer(this.pingtimer); }
      this.pingtimer = window.setTimeout(linker(onerrorCallback, this), this.pushstream.pingtimeout);
    }
  };

  var LongPollingWrapper = function(pushstream) {
    this.type = LongPollingWrapper.TYPE;
    this.pushstream = pushstream;
    this.connection = null;
    this.lastModified = null;
    this.etag = 0;
    this.connectionEnabled = false;
    this.opentimer = null;
    this.messagesQueue = [];
    this._linkedInternalListen = linker(this._internalListen, this);
    this.xhrSettings = {
        timeout: this.pushstream.longPollingTimeout,
        data: {},
        url: null,
        success: linker(this.onmessage, this),
        error: linker(this.onerror, this),
        load: linker(this.onload, this),
        beforeOpen: linker(this.beforeOpen, this),
        beforeSend: linker(this.beforeSend, this),
        afterReceive: linker(this.afterReceive, this)
    };
  };

  LongPollingWrapper.TYPE = "LongPolling";

  LongPollingWrapper.prototype = {
    connect: function() {
      this.messagesQueue = [];
      this._closeCurrentConnection();
      this.connectionEnabled = true;
      this.xhrSettings.url = getSubscriberUrl(this.pushstream, this.pushstream.urlPrefixLongpolling);
      var domain = extract_xss_domain(this.pushstream.host);
      var currentDomain = extract_xss_domain(window.location.hostname);
      var port = this.pushstream.port;
      var currentPort = window.location.port || (this.pushstream.useSSL ? 443 : 80);
      this.useJSONP = (domain !== currentDomain) || (port !== currentPort) || this.pushstream.longPollingUseJSONP;
      this.xhrSettings.scriptId = "PushStreamManager_" + this.pushstream.id;
      if (this.useJSONP) {
        this.pushstream.longPollingByHeaders = false;
        this.xhrSettings.data.callback = "PushStreamManager[" + this.pushstream.id + "].wrapper.onmessage";
      }
      this._internalListen();
      this.opentimer = window.setTimeout(linker(onopenCallback, this), 5000);
      Log4js.info("[LongPolling] connecting to:", this.xhrSettings.url);
    },

    _listen: function() {
      if (this._internalListenTimeout) { clearTimer(this._internalListenTimeout); }
      this._internalListenTimeout = window.setTimeout(this._linkedInternalListen, this.pushstream.longPollingInterval);
    },

    _internalListen: function() {
      if (this.connectionEnabled) {
        this.xhrSettings.data = extend({}, this.pushstream.extraParams(), this.xhrSettings.data);
        if (this.useJSONP) {
          Ajax.jsonp(this.xhrSettings);
        } else if (!this.connection) {
          this.connection = Ajax.load(this.xhrSettings);
        }
      }
    },

    disconnect: function() {
      this.connectionEnabled = false;
      if (this.connection) {
        Log4js.debug("[LongPolling] closing connection to:", this.xhrSettings.url);
        this._closeCurrentConnection();
        this.pushstream._onclose();
      }
    },

    _closeCurrentConnection: function() {
      this.opentimer = clearTimer(this.opentimer);
      if (this.connection) {
        try { this.connection.abort(); } catch (e) { /* ignore error on closing */ }
        this.connection = null;
        this.lastModified = null;
        this.xhrSettings.url = null;
      }
    },

    beforeOpen: function(xhr) {
      if (this.lastModified === null) {
        var date = new Date();
        if (this.pushstream.secondsAgo) { date.setTime(date.getTime() - (this.pushstream.secondsAgo * 1000)); }
        this.lastModified = dateToUTCString(date);
      }

      if (!this.pushstream.longPollingByHeaders) {
        this.xhrSettings.data[this.pushstream.longPollingTagArgument] = this.etag;
        this.xhrSettings.data[this.pushstream.longPollingTimeArgument] = this.lastModified;
      }
    },

    beforeSend: function(xhr) {
      if (this.pushstream.longPollingByHeaders) {
        xhr.setRequestHeader("If-None-Match", this.etag);
        xhr.setRequestHeader("If-Modified-Since", this.lastModified);
      }
    },

    afterReceive: function(xhr) {
      if (this.pushstream.longPollingByHeaders) {
        this.etag = xhr.getResponseHeader('Etag');
        this.lastModified = xhr.getResponseHeader('Last-Modified');
      }
      this.connection = null;
    },

    onerror: function(status) {
      if (this.connectionEnabled) { /* abort(), called by disconnect(), call this callback, but should be ignored */
        if (status === 304) {
          this._listen();
        } else {
          Log4js.info("[LongPolling] error (disconnected by server):", status);
          this._closeCurrentConnection();
          this.pushstream._onerror({type: (status === 403) ? "load" : "timeout"});
        }
      }
    },

    onload: function() {
      this._listen();
    },

    onmessage: function(responseText) {
      Log4js.info("[LongPolling] message received", responseText);
      var lastMessage = null;
      var messages = isArray(responseText) ? responseText : responseText.split("\r\n");
      for (var i = 0; i < messages.length; i++) {
        if (messages[i]) {
          lastMessage = parseMessage(messages[i], this.pushstream);
          this.messagesQueue.push(lastMessage);
          if (!this.pushstream.longPollingByHeaders && lastMessage.time) {
            this.etag = lastMessage.tag;
            this.lastModified = lastMessage.time;
          }
        }
      }

      this._listen();

      while (this.messagesQueue.length > 0) {
        var message = this.messagesQueue.shift();
        this.pushstream._onmessage(message.data, message.id, message.channel, message.eventid, (this.messagesQueue.length === 0));
      }
    }
  };

  /* mains class */

  var PushStreamManager = [];

  var PushStream = function(settings) {
    settings = settings || {};

    this.id = PushStreamManager.push(this) - 1;

    this.useSSL = settings.useSSL || false;
    this.host = settings.host || window.location.hostname;
    this.port = settings.port || (this.useSSL ? 443 : 80);

    this.timeout = settings.timeout || 15000;
    this.pingtimeout = settings.pingtimeout || 30000;
    this.reconnecttimeout = settings.reconnecttimeout || 3000;
    this.checkChannelAvailabilityInterval = settings.checkChannelAvailabilityInterval || 60000;

    this.secondsAgo = Number(settings.secondsAgo);
    this.longPollingByHeaders     = (settings.longPollingByHeaders === undefined) ? true : settings.longPollingByHeaders;
    this.longPollingTagArgument   = settings.longPollingTagArgument  || 'tag';
    this.longPollingTimeArgument  = settings.longPollingTimeArgument || 'time';
    this.longPollingUseJSONP      = settings.longPollingUseJSONP     || false;
    this.longPollingTimeout       = settings.longPollingTimeout      || 30000;
    this.longPollingInterval      = settings.longPollingInterval     || 100;

    this.reconnecttimer = null;

    this.urlPrefixPublisher   = settings.urlPrefixPublisher   || '/pub';
    this.urlPrefixStream      = settings.urlPrefixStream      || '/sub';
    this.urlPrefixEventsource = settings.urlPrefixEventsource || '/ev';
    this.urlPrefixLongpolling = settings.urlPrefixLongpolling || '/lp';
    this.urlPrefixWebsocket   = settings.urlPrefixWebsocket   || '/ws';

    this.jsonIdKey      = settings.jsonIdKey      || 'id';
    this.jsonChannelKey = settings.jsonChannelKey || 'channel';
    this.jsonDataKey    = settings.jsonDataKey    || 'text';
    this.jsonTagKey     = settings.jsonTagKey     || 'tag';
    this.jsonTimeKey    = settings.jsonTimeKey    || 'time';
    this.jsonEventIdKey = settings.jsonEventIdKey || 'eventid';

    this.modes = (settings.modes || 'eventsource|websocket|stream|longpolling').split('|');
    this.wrappers = [];
    this.wrapper = null;

    this.onopen = null;
    this.onmessage = null;
    this.onerror = null;
    this.onstatuschange = null;

    this.channels = {};
    this.channelsCount = 0;
    this.channelsByArgument   = settings.channelsByArgument   || false;
    this.channelsArgument     = settings.channelsArgument     || 'channels';

    this.extraParams          = settings.extraParams          || this.extraParams;

    for (var i = 0; i < this.modes.length; i++) {
      try {
        var wrapper = null;
        switch (this.modes[i]) {
        case "websocket"  : wrapper = new WebSocketWrapper(this);   break;
        case "eventsource": wrapper = new EventSourceWrapper(this); break;
        case "longpolling": wrapper = new LongPollingWrapper(this); break;
        case "stream"     : wrapper = new StreamWrapper(this);      break;
        }
        this.wrappers[this.wrappers.length] = wrapper;
      } catch(e) { Log4js.info(e); }
    }

    this._setState(0);
  };

  /* constants */
  PushStream.LOG_LEVEL = 'error'; /* debug, info, error */
  PushStream.LOG_OUTPUT_ELEMENT_ID = 'Log4jsLogOutput';

  /* status codes */
  PushStream.CLOSED        = 0;
  PushStream.CONNECTING    = 1;
  PushStream.OPEN          = 2;

  /* main code */
  PushStream.prototype = {
    extraParams: function() {
      return {};
    },

    addChannel: function(channel, options) {
      if (escapeText(channel) !== channel) {
        throw "Invalid channel name! Channel has to be a set of [a-zA-Z0-9]";
      }
      Log4js.debug("entering addChannel");
      if (typeof(this.channels[channel]) !== "undefined") { throw "Cannot add channel " + channel + ": already subscribed"; }
      options = options || {};
      Log4js.info("adding channel", channel, options);
      this.channels[channel] = options;
      this.channelsCount++;
      if (this.readyState !== PushStream.CLOSED) { this.connect(); }
      Log4js.debug("leaving addChannel");
    },

    removeChannel: function(channel) {
      if (this.channels[channel]) {
        Log4js.info("removing channel", channel);
        delete this.channels[channel];
        this.channelsCount--;
      }
    },

    removeAllChannels: function() {
      Log4js.info("removing all channels");
      this.channels = {};
      this.channelsCount = 0;
    },

    _setState: function(state) {
      if (this.readyState !== state) {
        Log4js.info("status changed", state);
        this.readyState = state;
        if (this.onstatuschange) {
          this.onstatuschange(this.readyState);
        }
      }
    },

    connect: function() {
      Log4js.debug("entering connect");
      if (!this.host)                 { throw "PushStream host not specified"; }
      if (isNaN(this.port))           { throw "PushStream port not specified"; }
      if (!this.channelsCount)        { throw "No channels specified"; }
      if (this.wrappers.length === 0) { throw "No available support for this browser"; }

      this._keepConnected = true;
      this._lastUsedMode = 0;
      this._connect();

      Log4js.debug("leaving connect");
    },

    disconnect: function() {
      Log4js.debug("entering disconnect");
      this._keepConnected = false;
      this._disconnect();
      this._setState(PushStream.CLOSED);
      Log4js.info("disconnected");
      Log4js.debug("leaving disconnect");
    },

    _connect: function() {
      this._disconnect();
      this._setState(PushStream.CONNECTING);
      this.wrapper = this.wrappers[this._lastUsedMode++ % this.wrappers.length];

      try {
        this.wrapper.connect();
      } catch (e) {
        //each wrapper has a cleanup routine at disconnect method
        if (this.wrapper) {
          this.wrapper.disconnect();
        }
      }
    },

    _disconnect: function() {
      this.reconnecttimer = clearTimer(this.reconnecttimer);
      if (this.wrapper) {
        this.wrapper.disconnect();
      }
    },

    _onopen: function() {
      this.reconnecttimer = clearTimer(this.reconnecttimer);
      this._setState(PushStream.OPEN);
      if (this._lastUsedMode > 0) {
        this._lastUsedMode--; //use same mode on next connection
      }
    },

    _onclose: function() {
      this.reconnecttimer = clearTimer(this.reconnecttimer);
      this._setState(PushStream.CLOSED);
      this._reconnect(this.reconnecttimeout);
    },

    _onmessage: function(data, id, channel, eventid, isLastMessageFromBatch) {
      Log4js.debug("message", data, id, channel, eventid, isLastMessageFromBatch);
      if (id === -2) {
        if (this.onchanneldeleted) { this.onchanneldeleted(channel); }
      } else if ((id > 0) && (typeof(this.channels[channel]) !== "undefined")) {
        if (this.onmessage) { this.onmessage(data, id, channel, eventid, isLastMessageFromBatch); }
      }
    },

    _onerror: function(error) {
      this._setState(PushStream.CLOSED);
      this._reconnect((error.type === "timeout") ? this.reconnecttimeout : this.checkChannelAvailabilityInterval);
      if (this.onerror) { this.onerror(error); }
    },

    _reconnect: function(timeout) {
      if (this._keepConnected && !this.reconnecttimer && (this.readyState !== PushStream.CONNECTING)) {
        Log4js.info("trying to reconnect in", timeout);
        this.reconnecttimer = window.setTimeout(linker(this._connect, this), timeout);
      }
    },

    sendMessage: function(message, successCallback, errorCallback) {
      message = escapeText(message);
      if (this.wrapper.type === WebSocketWrapper.TYPE) {
        this.wrapper.sendMessage(message);
        if (successCallback) { successCallback(); }
      } else {
        Ajax.post({url: getPublisherUrl(this), data: message, success: successCallback, error: errorCallback});
      }
    }
  };

  PushStream.sendMessage = function(url, message, successCallback, errorCallback) {
    Ajax.post({url: url, data: escapeText(message), success: successCallback, error: errorCallback});
  };

  // to make server header template more clear, it calls register and
  // by a url parameter we find the stream wrapper instance
  PushStream.register = function(iframe) {
    var matcher = iframe.window.location.href.match(/streamid=([0-9]*)&?/);
    if (matcher[1] && PushStreamManager[matcher[1]]) {
      PushStreamManager[matcher[1]].wrapper.register(iframe);
    }
  };

  PushStream.unload = function() {
    for (var i = 0; i < PushStreamManager.length; i++) {
      try { PushStreamManager[i].disconnect(); } catch(e){}
    }
  };

  /* make class public */
  window.PushStream = PushStream;
  window.PushStreamManager = PushStreamManager;

  if (window.attachEvent) { window.attachEvent("onunload", PushStream.unload); }
  if (window.addEventListener) { window.addEventListener.call(window, "unload", PushStream.unload, false); }

})(window, document);

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

compatible_functions();
load_library();
load_modalPopLite();

main();})();}
