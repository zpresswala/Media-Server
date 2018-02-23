<!DOCTYPE html>
<html lang="en">
<?php 

require_once('config.php');

    $aMedias = array();
    $count = $mysqli->query('SELECT * FROM media_log');
    $count = $count->num_rows;
    if(isset($_GET['p']) && $_GET['p'] != 0) {
        $hash = $_GET['p'];
        $result = $mysqli->query('SELECT *, l.`mediaId` AS media, COUNT(k.id) AS keywords FROM media_log l JOIN media m ON m.`mediaId` = l.`mediaId` AND m.`status` = 1 LEFT JOIN keywords k ON k.`mediaId` = l.`mediaId` GROUP BY l.`mediaId` ORDER BY media LIMIT '. $hash .', 50');
    } else 
        $result = $mysqli->query('SELECT *, l.`mediaId` AS media, COUNT(k.id) AS keywords FROM media_log l JOIN media m ON m.`mediaId` = l.`mediaId` AND m.`status` = 1 LEFT JOIN keywords k ON k.`mediaId` = l.`mediaId` GROUP BY l.`mediaId` ORDER BY media');

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
    <link rel="stylesheet" href="css/jquery.dataTables.min.css">
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
        <li><a href="index.php">Upload</a></li>
        <li><a href="list.php">List</a></li>
        <li class="active"><a href="archive.php">Archive</a></li>
        <li><a href="search.php">Search</a></li>
        <li><a href="api/log.php">Update Log</a></li>
    </ul>
    <!-- Page Content -->

        <div class="row">
            <div class="col-lg-12">
                <h1>Archives</h1>
                <p class="lead">List of files archived on System</p>
                <table class="table table-bordered datatable">
                    <thead>
                    <tr>
                        <th width="5%">#</th>
                        <th>Filename</th>
                        <th width="25%">Transcript Type</th>
                        <th width="10%">No. of Keywords</th>
                        <th width="18%">Action</th>
                    </tr>
                    </thead>
                    <tbody>
            <?php if($count > 0) : $i = 1;?>
                <?php while($aMedia = $result->fetch_assoc()) { ?>
                        <tr>
                            <td><?php echo $i++; ?></td>
                            <td><i class="glyphicon glyphicon-film"></i> <span data-toggle="tooltip" title="<?php echo $aMedia['transcript']; ?>" data-placement="bottom" class="title"><?php echo ($aMedia['title'] != '' ? $aMedia['title'] : $aMedia['media']); ?></span></td>
                            <td><i class="<?php echo $aMedia['type']; ?>"><?php echo $aMedia['type']; ?></i></td>
                            <td class="text-center"><?php echo number_format($aMedia['keywords']); ?></td>
                            <td class="text-left">
                            <?php if($aMedia['status'] != 2) : ?>
                                <button data-toggle="tooltip" title="Unarchive" class="btn btn-xs btn-primary archiveVideo" data-id="<?php echo $aMedia['mediaId'];?>" data-status="0"><i class="glyphicon glyphicon-folder-open"></i> </button>
                                <button data-toggle="tooltip" title="Delete" class="btn btn-xs btn-danger deleteVideo" data-id="<?php echo $aMedia['mediaId'];?>"><i class="glyphicon glyphicon-trash"></i> </button>
                            <?php else: ?>
                                <i class="btn-xs btn-danger"> DELETED </i>
                            <?php endif; ?>
                            </td>
                        </tr>
                    <?php } ?>
            <?php endif; ?>
                    </tbody>
                </table>
            </div>
        </div>

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