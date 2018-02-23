<?php
/* Include VoiceBase Class library */
include_once 'vbClass.php';

/* Init new vbClass with params: Apikey, password, mediaID, externalID, apiURL */
$vb = new vbClass("E67E495BDAe82309CC8956e25B7-0884ad36185986c4DBFFAC796DF62DA9dDA5418f0Df1bDa-Fd9b0F88e0", "bdhuz786", "56405f9f460d0", "", "https://api.voicebase.com/services");
?>

<html>
<head>
    <meta http-equiv="content-type" content="text/html; charset=UTF-8">
    <link rel="stylesheet" href="../css/jquery-ui-1.10.4.custom.min.css"/>
    <link rel="stylesheet" href="../css/jwplayer.vb-sdk-plugin.css"/>
    <script type="text/javascript" src="../js/lib/jquery-1.9.1.min.js"></script>
    <script type="text/javascript" src="http://jwpsrv.com/library/qhNfTJFiEeK7LSIACpYGxA.js"></script>
    <script type="text/javascript" src="../js/jquery.voicebase.js"></script>

    <script type="text/javascript" src="../js/lib/jquery.zclip.js"></script>
    <script type="text/javascript" src="../js/lib/jquery-ui-1.10.4.custom.min.js"></script>

    <style type="text/css">
        .content {
            width: 840px;
            margin: 0 auto;
        }
    </style>
</head>
<body>
<div class="content">
    <div id='jwplayer'></div>
    <!-- Print Keywords -->
    <?php echo $vb->getKeywords(); ?>
    <!-- Print Transcript -->
    <?php echo $vb->getTranscript(); ?>
    <div id="comments-block"></div>

    <script type='text/javascript'>
        jwplayer('jwplayer').setup({
            file: 'file',
            primary: "flash", // rtmp streaming is working only in flash
            width: '792',
            height: '480'
        });

        jQuery(document).ready(function(){
            jQuery('#jwplayer').voicebase({
                playerId: 'jwplayer',
                playerType: 'jwplayer',
                mediaID: 'mediaID',
                apikey: 'apikey',
                password: 'password',
                lineBreak: '1.0',
                keywordsGroups: true,
                editKeywords: true,
                trackEvents: true,
                keywordsColumns: "topics",
                stream: 'rtmp',
                actionFlag: {
                    edit: true
                },

                keywordsBlock: 'keyword-block',
                transcriptBlock: 'transcript-block',
                commentsBlock: 'comments-block',

                serverMode: true,
                turnTimes: true

            });
        });
    </script>
</div>
</body>
</html>

