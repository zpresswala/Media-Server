<!DOCTYPE html>
<html lang="en">
<?php 

require_once('config.php');

    $aMedias = array();
    $count = $mysqli->query('SELECT * FROM media_log');
    $count = $count->num_rows;
    if(isset($_GET['p']) && $_GET['p'] != 0) {
        $hash = $_GET['p'];
        $result = $mysqli->query('SELECT 
                                *,
                                l.`mediaId` AS media,
                                mr.`marker`,
                                COUNT(DISTINCT k.`keyword`) AS keywords,
                                COUNT(DISTINCT mr.keyword) AS markers 
                                FROM
                                media_log l 
                                LEFT JOIN media m 
                                    ON m.`mediaId` = l.`mediaId` 
                                    AND m.`status` = 0 
                                LEFT JOIN keywords k 
                                    ON k.`mediaId` = l.`mediaId` 
                                LEFT JOIN markers AS mr 
                                    ON k.mediaId = mr.mediaId 
                                    AND (k.keyword = mr.keyword) 
                                GROUP BY l.`mediaId` 
                                ORDER BY media LIMIT '. $hash .', 50');
    } else 
        $result = $mysqli->query('SELECT 
                                *,
                                l.`mediaId` AS media,
                                mr.`marker`,
                                COUNT(DISTINCT k.`keyword`) AS keywords,
                                COUNT(DISTINCT mr.keyword) AS markers 
                                FROM
                                media_log l 
                                LEFT JOIN media m 
                                    ON m.`mediaId` = l.`mediaId` 
                                    AND m.`status` = 0 
                                LEFT JOIN keywords k 
                                    ON k.`mediaId` = l.`mediaId` 
                                LEFT JOIN markers AS mr 
                                    ON k.mediaId = mr.mediaId 
                                    AND (k.keyword = mr.keyword) 
                                GROUP BY l.`mediaId` 
                                ORDER BY media');

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
        <li class="active"><a href="list.php">List</a></li>
        <li><a href="archive.php">Archive</a></li>
        <li><a href="search.php">Search</a></li>
        <li><a href="api/log.php">Update Log</a></li>
    </ul>
    <!-- Page Content -->

        <div class="row">
            <div class="col-lg-12">
                <h1>List</h1>
                <p class="lead">List of files uploaded on Voicebase System</p>
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
                            <td><i class="glyphicon glyphicon-film"></i> <span class="title"><?php echo ($aMedia['title'] != '' ? $aMedia['title'] : $aMedia['media']); ?></span>
                            <span class="read pull-right">
                            <?php if($aMedia['transcript'] != '') : ?>
                                <button data-transcript="<?php echo $aMedia['transcript']; ?>" type="button" class="pull-right btn btn-xs btn-info showTranscript"><i class="glyphicon glyphicon-eye-open"></i> Read</button>
                            <?php endif; ?>
                            </span>
                            </td>
                            <td class="type"><i class="<?php echo $aMedia['type']; ?>"><?php echo $aMedia['type']; ?></i></td>
                            <td class="text-center"><?php echo $aMedia['markers'] .' out of '. $aMedia['keywords']; ?></td>
                            <td class="text-left">
                            <button data-toggle="tooltip" title="Transcript" class="btn btn-xs btn-success getTranscript"  data-id="<?php echo $aMedia['media'];?>"> <?php echo $aMedia['transcript'] == '' ? '<i class="glyphicon glyphicon-comment"></i> ' : '<i class="glyphicon glyphicon-refresh"></i> '; ?> Transcript</button>
                            <?php if($aMedia['status'] == 0 && $aMedia['keywords'] > 0) : ?>
                                <button data-toggle="tooltip" title="Archive" class="btn btn-xs btn-primary archiveVideo" data-id="<?php echo $aMedia['media'];?>" data-status="1"><i class="glyphicon glyphicon-folder-open"></i> Archive</button>
                            <?php endif; ?>
                            </td>
                        </tr>
                    <?php } ?>
            <?php endif; ?>
                    </tbody>
                </table>
            </div>
        </div>
    
    <div class="modal fade" id="transcript-modal" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <button type="button" class="close" data-dismiss="modal"><span aria-hidden="true">&times;</span><span class="sr-only">Close</span></button>
                <h4 class="modal-title" id="myModalLabel"></h4>
            </div>
            <div class="modal-body">
            </div>
        </div>
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