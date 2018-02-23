<!DOCTYPE html>
<html lang="en">
<?php 

require_once('../config.php');

$params = array('version' => API_VERSION, 'apikey' => API_KEY, 'password'=> PASSWORD);
$aStatus = array('PROCESSING','MACHINECOMPLETE', 'HUMANCOMPLETE','ERROR');

// SAVE MEDIA
$return = array();
$iCount = $iOldCount = "";
try {

    $oOldCount = $mysqli->query("SELECT * FROM media_log");
    $iOldCount = $oOldCount->num_rows;
    $oOldCount = $mysqli->query("SELECT * FROM media_log WHERE type = '$aStatus[3]'");
    $iOldError = $oOldCount->num_rows;
    $oOldCount = $mysqli->query("SELECT * FROM media_log WHERE type = '$aStatus[2]'");
    $iOldHuman = $oOldCount->num_rows;
    $oOldCount = $mysqli->query("SELECT * FROM media_log WHERE type = '$aStatus[1]'");
    $iOldMachine = $oOldCount->num_rows;

    foreach ($aStatus as $key => $status) {

        $ch = curl_init();
        $encoded = '';
        $params['action'] = 'list';
        $params['status'] = $status;

        foreach($params as $name => $value) {
          $encoded .= urlencode($name).'='.urlencode($value).'&';
        }

        $encoded = substr($encoded, 0, strlen($encoded)-1);

        curl_setopt($ch, CURLOPT_URL, API_URL .'?'.$encoded);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        $response = curl_exec($ch);
        $info = curl_getinfo($ch);
        curl_close($ch);

        $res = json_decode($response, true);
        if(isset($res['mediaIds'])) {
        
            $fileStatus = '"'.$mysqli->real_escape_string($res['fileStatus']).'"';
        
            foreach ($res['mediaIds'] as $iMedia) {
                
                $iMedia = '"'.$mysqli->real_escape_string($iMedia).'"';
                if(!$mysqli->query("INSERT IGNORE INTO media_log(mediaId, type) VALUES($iMedia, $fileStatus)")) 
                    d("\n\nError: " . $mysqli->error);
            }
        }
    }
    $oCount = $mysqli->query("SELECT * FROM media_log");
    $checked = date('d-M-Y H:i:s');
    $iCount = $oCount->num_rows;

    $oCount = $mysqli->query("SELECT * FROM media_log WHERE type = '$aStatus[3]'");
    $iError = $oCount->num_rows;
    $oCount = $mysqli->query("SELECT * FROM media_log WHERE type = '$aStatus[2]'");
    $iHuman = $oCount->num_rows;
    $oCount = $mysqli->query("SELECT * FROM media_log WHERE type = '$aStatus[1]'");
    $iMachine = $oCount->num_rows;
} catch(Exception $e) {
    
}

?>
<head>

    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="description" content="">
    <meta name="author" content="">

    <title>Voicebase - Demo</title>

    <!-- Bootstrap Core CSS -->
    <link rel="stylesheet" href="../css/bootstrap.min.css">
    <link rel="stylesheet" href="../css/jquery.dataTables.min.css">
    <link href="../css/styles.css" rel="stylesheet">

    <!-- Custom CSS -->
    <style>
    body {
        padding-top: 70px;
        /* Required padding for .navbar-fixed-top. Remove if using .navbar-static-top. Change if height of navigation changes. */
    }
    </style>

    <!-- HTML5 Shim and Respond.js IE8 support of HTML5 elements and media queries -->
    <!-- WARNING: Respond.js doesn't work if you view the page via file:// -->
    <!--[if lt IE 9]>
        <script src="https://oss.maxcdn.com/libs/html5shiv/3.7.0/html5shiv.js"></script>
        <script src="https://oss.maxcdn.com/libs/respond.../js/1.4.2/respond.min.js"></script>
    <![endif]-->

</head>

<body>

    <div class="container">
    <ul class="nav nav-tabs">
        <li><a href="../index.php">Upload</a></li>
        <li><a href="../list.php">List</a></li>
        <li><a href="../archive.php">Archive</a></li>
        <li><a href="../search.php">Search</a></li>
        <li class="active"><a href="log.php">Update Log (Last checked on: <?php echo $checked;?>)</a></li>
    </ul>
    <!-- Page Content -->
        <br/><br/>
        <table class="table table-bordered">
            <tr>
                <th colspan="2">Previous</th>
                <th colspan="2">Current</th>
            </tr>
            <tr>
                <td>HUMAN</td>
                <td><?php echo $iOldHuman; ?></td>
                <td>HUMAN</td>
                <td><?php echo $iHuman; ?></td>
            </tr>
            <tr>
                <td>MACHINE</td>
                <td><?php echo $iOldMachine; ?></td>
                <td>MACHINE</td>
                <td><?php echo $iMachine; ?></td>
            </tr>
            <tr>
                <td>ERROR</td>
                <td><?php echo $iOldError; ?></td>
                <td>ERROR</td>
                <td><?php echo $iError; ?></td>
            </tr>
            <tr>
                <th>Total no. of files on Voicebase</th>
                <th><span class="text-danger"><?php echo $iOldCount; ?></span></th>
                <th>Total no. of files on Voicebase</th>
                <th><span class="text-success"><?php echo $iCount; ?></span></th>
            </tr>
        </table>

    </div>
    <!-- /.container -->

    <!-- jQuery Version 1.11.1 -->
    <script src="../js/jquery.js"></script>
    <script src="../js/jquery.dataTables.min.js"></script>

    <!-- Bootstrap Core JavaScript -->
    <script src="../js/bootstrap.min.js"></script>
    <script src="../js/config.js"></script>
    <script src="../js/app.js"></script>

</body>

</html>