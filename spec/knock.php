<?php

$USERNAME = 'drcom';
$PASSWORD = '123456';
$FIRST_KNOCK_URL = 'http://la.ptsang.net:7080';
$SECOND_KNOCK_URL = 'http://la.ptsang.net:3080';

switch(@$_GET['cmd']) {
	case 'verify': check_user_exit(@$_GET['user'], @$_GET['pass']);
}

?>
<html><head>
<meta charset="utf-8"><title>敲门</title>
<script src="http://cdnjs.cloudflare.com/ajax/libs/jquery/2.1.1/jquery.min.js"></script>
</head><body>
<script>
$(function(){
	var first_url = '<?php echo $FIRST_KNOCK_URL ?>';
	var second_url = '<?php echo $SECOND_KNOCK_URL ?>';

	knock();

	setTimeout(function(){
		print_line('knock again');
		knock();
	},5000);

	function knock() {
		print_line('Start knocking');
		$.get(first_url).always(function(data){
			$.get(second_url).always(function(data){
				print_line('Finish knocking');
			});
		});
	};

	function print_line(msg){
		$('body').append('<p>'+msg+'</p>');
	};
});
</script>
</body></html>

<?php 

function check_user_exit($user, $pass)
{
	global $USERNAME, $PASSWORD;
	if (($user===$USERNAME) && ($pass===$PASSWORD)) {
		jsonp_echo(['status'=>'ok']);
	} else {
		jsonp_echo(['status'=>'error', 'message'=>'username or password not matched']);
	}
	exit;
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
	$reserved_words = array('break','do','instanceof','typeof','case','else','new','var','catch','finally','return','void','continue',
		'for','switch','while','debugger','function','this','with','default','if','throw','delete','in','try','class','enum',
		'extends','super','const','export','import','implements','let','private','public','yield','interface','package','protected',
		'static','null','true','false');
	if (preg_match($identifier_syntax, $subject)	&& !in_array(mb_strtolower($subject, 'UTF-8'), $reserved_words)) {
		echo "{$subject}($json)";
		return;
	}

	echo 'false';
}

?>
