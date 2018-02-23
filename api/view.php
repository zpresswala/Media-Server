<?php 
    $mediaId = $_GET['media']; 
?>
<!DOCTYPE html>
<html>
<head>
    <title>Voicebase - Demo</title>
    <head>
    <meta charset="UTF-8">
    <meta http-equiv="Content-type" content="text/html; charset=UTF-8">
    <link href="../css/bootstrap.min.css" rel="stylesheet">
    <script type="text/javascript" src="http://content.jwplatform.com/libraries/clOoEdU6.js
                "></script>
    <style type="text/css">
         #myElement {
            width: 840px;
            margin: 80px auto;
        }

    </style>
</head>
<body>
    <!-- Navigation -->
    <nav class="navbar navbar-inverse navbar-fixed-top" role="navigation">
        <div class="container">
            <!-- Brand and toggle get grouped for better mobile display -->
            <div class="navbar-header">
                <button type="button" class="navbar-toggle" data-toggle="collapse" data-target="#bs-example-navbar-collapse-1">
                    <span class="sr-only">Toggle navigation</span>
                    <span class="icon-bar"></span>
                    <span class="icon-bar"></span>
                    <span class="icon-bar"></span>
                </button>
                <a class="navbar-brand" href="#">Home</a>
            </div>
            <!-- Collect the nav links, forms, and other content for toggling -->
            <a class="pull-right btn btn-sm btn-danger" onclick="window.history.back()">Back</a>
            <div class="collapse navbar-collapse" id="bs-example-navbar-collapse-1">
                <ul class="nav navbar-nav">
                    <li>
                        <a href="search.php">Search</a>
                    </li>
                    <li>
                        <a href="save.php">Save</a>
                    </li>
                </ul>
            </div>
            <!-- /.navbar-collapse -->
        </div>
        <!-- /.container -->
    </nav>
<div class="container">
<div id="myElement">Loading the player...</div>
</div>
<script type="text/javascript">
        var file = JSON.parse(sessionStorage.getItem('data'));
        file = file['<?php echo $mediaId?>'];
        console.log(file);
        var playerInstance = jwplayer("myElement");
        playerInstance.setup({
          file: '../files/' + file['title'] + '.mp4',
          image: file['image_url'],
          description: file['description'],
          title: file['title'],
          tracks: [{
            file: 'keywords/' + file['mediaId'] + '.vtt',
            kind:'chapters'
          }],
        });
        playerInstance.on('play', function() { 
            if(window.location.hash) {
              var offset = window.location.hash.substr(3);
              playerInstance.seek(offset);
            }
        });

</script>

<div class="container">
    <div id="transcript"></div>
</div>

    <script type="text/javascript" src="../service/js/lib/jquery-1.9.1.min.js"></script>

    <!-- Bootstrap Core JavaScript -->
    <script src="../js/bootstrap.min.js"></script>
    <script src="../js/app.js"></script>
    <script type="text/javascript">
        $(document).ready(function() {
            $('#transcript').html('<p>' + file['transcript'] + '</p>');
            
        });
    /*var bool = <?php //echo isset($_GET['media'])?'true':'false'; ?>;
        if(bool) {
            
            var action = 'getTranscript';
            var mediaId = '<?php //echo $mediaId; ?>';
            var formData = {'version': version, 'apikey': apikey, 'password': password, 'action': action, 'mediaId': mediaId, 'format': 'txt'};
            var video = document.getElementsByTagName("video")[0];
            video.currentTime = '<?php //echo $marker; ?>';

            $.ajax({
                url: 'api/media',
                type: 'GET',
                data: {'transcript' : mediaId}
                dataType: 'json',
                beforeSend: function() {
                    $('.content').addClass('hide');
                },
                success: function(res) {
                    $('.content').removeClass('hide');
                    if(typeof res.transcript != 'undefined') {
                        $('#transcript').html(res.transcript);
                        video.play();
                    }
                    else
                        alert(res.error);
                }

            });
        } */
    </script>
</body>
</html>


