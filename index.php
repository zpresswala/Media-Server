<!DOCTYPE html>
<html lang="en">

<head>

    <meta charset="UTF-8">
    <meta http-equiv="Content-type" content="text/html; charset=UTF-8">
    <!-- <meta http-equiv="X-UA-Compatible" content="IE=edge"> -->
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="description" content="">
    <meta name="author" content="">

    <title>Voicebase - Demo</title>

    <!-- Bootstrap Core CSS -->
    <link rel="stylesheet" href="css/jquery.dataTables.min.css">
    <link rel="stylesheet" href="css/bootstrap.min.css">
    <link href="css/styles.css" rel="stylesheet">

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
        <script src="https://oss.maxcdn.com/libs/respond.js/1.4.2/respond.min.js"></script>
    <![endif]-->

</head>

<body>

    <div class="container">
    <ul class="nav nav-tabs">
        <li class="active"><a href="index.php">Upload</a></li>
        <li><a href="list.php">List</a></li>
        <li><a href="archive.php">Archive</a></li>
        <li><a href="search.php">Search</a></li>
        <li><a href="api/log.php">Update Log</a></li>
    </ul>
    <!-- Page Content -->
        
        <div class="row">
            <div class="col-lg-12">
                <h1>Upload</h1>
                <p class="lead">Upload a video of any format to start!</p>
                <form enctype="multipart/form-data" method="post" action="" role="form" class="form-horizontal">
                    <div class="form-group">
                        <label for="user_upload" class="control-label col-sm-2">Select Video : </label>
                        <div class="col-sm-4">
                            <input type="file" name="file" accept="video/*" class="form-control" id="file_upload"/>
                        </div>
                        <div class="col-sm-6">
                            <button type="submit" name="submit" class="btn btn-primary" id="upload" ><i class="glyphicon glyphicon-upload"></i> Upload Video</button>
                            <!-- <form action="api/save.php" method="post" enctype="multipart/form-data">
                              <input type="file" name="video" accept="video/*" capture>
                              <input type="submit" value="Upload">
                            </form> -->
                            <!-- <button id="capture" type="button" class="btn btn-info">Record</button>
                            <button id="stop" type="button" class="btn btn-info">Stop</button> -->
                        <label>
                                <input type="radio" name="transcriptType" id="human" value="human">
                                Human Transcript
                          </label>
                          <label>
                            <input type="radio" name="transcriptType" id="machine" value="machine">
                            Machine Transcript
                          </label>
                        </div>
                    </div>
                </form>
            </div>
        </div>
        <span id="result"></span><br>
        <span id="name"></span>
        <!-- /.row -->

    </div>
    <!-- /.container -->
    <!-- jQuery Version 1.11.1 -->
    <script src="js/jquery.js"></script>
    <script src="js/jquery.dataTables.min.js"></script>

    <!-- Bootstrap Core JavaScript -->
    <script src="js/bootstrap.min.js"></script>
    <script src="js/config.js"></script>
    <script src="js/app.js"></script>

</body>

</html>
