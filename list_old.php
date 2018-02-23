<!DOCTYPE html>
<html lang="en">
<?php 

require_once('config.php');

    $aMedias = array();
    $count = $mysqli->query('SELECT * FROM media_log');
    $count = $count->num_rows;
    if(isset($_GET['p']) && $_GET['p'] != 0) {
        $hash = $_GET['p'];
        $result = $mysqli->query('SELECT *, l.`mediaId` AS media FROM media_log l left join media m on m.`mediaId` = l.`mediaId` AND m.`status` = 0 LIMIT '. $hash .', 50');
    } else 
        $result = $mysqli->query('SELECT *, l.`mediaId` AS media FROM media_log l left join media m on m.`mediaId` = l.`mediaId` AND m.`status` = 0');

?>
<head>

    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="description" content="">
    <meta name="author" content="">

    <title>Voicebase - Demo</title>

    <!-- Bootstrap Core CSS -->
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

    <!-- Navigation -->
    <!-- <nav class="navbar navbar-inverse navbar-fixed-top" role="navigation">
        <div class="container">
            Brand and toggle get grouped for better mobile display
            <div class="navbar-header">
                <button type="button" class="navbar-toggle" data-toggle="collapse" data-target="#bs-example-navbar-collapse-1">
                    <span class="sr-only">Toggle navigation</span>
                    <span class="icon-bar"></span>
                    <span class="icon-bar"></span>
                    <span class="icon-bar"></span>
                </button>
                <a class="navbar-brand" href="index.php">Home</a>
            </div>
            Collect the nav links, forms, and other content for toggling
            <div class="collapse navbar-collapse" id="bs-example-navbar-collapse-1">
                <ul class="nav navbar-nav">
                    <li>
                        <a href="list.php">List</a>
                    </li>
                    <li>
                        <a href="search.php">Search</a>
                    </li>
                    <li>
                        <a href="archive.php">Archived</a>
                    </li>
                </ul>
            </div>
            /.navbar-collapse
        </div>
        /.container
    </nav> -->
    <div class="container">
    <ul class="nav nav-tabs">
        <li><a href="index.php">Upload</a></li>
        <li class="active"><a href="list.php">List</a></li>
        <li><a href="search.php">Search</a></li>
        <li><a href="archive.php">Archive</a></li>
    </ul>
    <!-- Page Content -->

        <div class="row">
            <div class="col-lg-12">
                <h1>List</h1>
                <p class="lead">List of files uploaded on Voicebase System</p>
                <form action="" role="form" class="form-horizontal">
            <?php if($count > 0) : ?>
                <?php while($aMedia = $result->fetch_assoc()) { ?>
                    <div class="panel panel-default panel-default">
                        <div class="panel-heading">
                            <h3 class="panel-title"><i class="glyphicon glyphicon-film"></i> <span class="title"><?php echo ($aMedia['title'] != '' ? $aMedia['title'] : $aMedia['media']); ?></span>
                            <div class="pull-right">
                                <button class="btn btn-sm btn-success getTranscript" data-id="<?php echo $aMedia['media'];?>"> <?php echo $aMedia['transcript'] == '' ? '<i class="glyphicon glyphicon-comment"></i> ' : '<i class="glyphicon glyphicon-refresh"></i> '; ?> TRANSCRIPT</button>
                            <?php if($aMedia['status'] == 0) : ?>
                                <button class="btn btn-sm btn-primary archiveVideo" data-id="<?php echo $aMedia['media'];?>" data-status="1"><i class="glyphicon glyphicon-folder-open"></i> ARCHIVE </button>
                            <?php endif; ?>
                            </div>
                            </h3>
                            <div class="clearfix"></div>
                        </div>
                        <div class="panel-body">
                            <div class="record-player <?php echo $aMedia['transcript'] == '' ? 'hide' : '' ?>">
                                <div class="transcript" ><?php echo $aMedia['transcript']; ?></div>
                            </div>
                        </div>
                    </div>
                    <?php } ?>
            <?php else: ?>
                <p class="text-center">No Files Found. Please upload some files first</p>
            <?php endif; ?>
                </form>
            </div>
        </div>
         <?php if($count > 0) : ?>
        <ul class="pagination">
        <?php $i = 0; 
        while($i <= $count) { ?>
          <li><a href="list.php?p=<?php echo $i; ?>"><?php echo $i+1 .'-'. $i += 50; ?></a></li>
        <?php } ?>
        </ul>
    <?php endif; ?>

    </div>
    <!-- /.container -->

    <!-- jQuery Version 1.11.1 -->
    <script src="js/jquery.js"></script>

    <!-- Bootstrap Core JavaScript -->
    <script src="js/bootstrap.min.js"></script>
    <script src="js/config.js"></script>
    <script src="js/app.js"></script>

</body>

</html>