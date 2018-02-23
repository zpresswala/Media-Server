<?php
date_default_timezone_set('Asia/Karachi');
set_time_limit(0);

require_once('constants.php');

// $mysqli = new mysqli("localhost", "vd786tpc_yaAli", "yaAllah_786!!", "vd786tpc_videos786");
$mysqli = new mysqli("localhost", "root", "root", "voicebase");

if ($mysqli->connect_error) {
    die('Error : ('. $mysqli->connect_errno .') '. $mysqli->connect_error);
}

function d($mParam, $bExit = 0, $bVarDump = 0, $echoInFile = 1, $htmlencode = 0) {
    ob_start();

    if (!$bVarDump) {
        print_r($mParam);
    } else {
        var_dump($mParam);
    }
    if($htmlencode)
        $sStr = htmlspecialchars(ob_get_contents());
    else
        $sStr = ob_get_contents();
    ob_clean();
    if ($echoInFile) {
        file_put_contents(__DIR__ . '\log\\'.date('Y-m-d Hi').'.log', $sStr, FILE_APPEND);
    } else {
        echo '<hr><pre>' . $sStr . '</pre><hr>';
    }
    if ($bExit)
        exit;
}
?>