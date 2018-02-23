<!DOCTYPE html>
<html lang="en">

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

    <div class="container">
    
    <ul class="nav nav-tabs">
        <li><a href="index.php">Upload</a></li>
        <li><a href="list.php">List</a></li>
        <li><a href="archive.php">Archive</a></li>
        <li class="active"><a href="search.php">Search</a></li>
        <li><a href="api/log.php">Update Log</a></li>
    </ul>
    <!-- Page Content -->

        <div class="row">
            <div class="col-lg-12 text-center">
                <h1>Search</h1>
                <p class="lead">Search keywords to fetch related videos!</p>
                <form action="" role="form" class="form-horizontal">
                    <div class="form-group">
                        <label for="user_upload" class="control-label col-sm-2">Search Keyword : </label>
                        <div class="col-sm-8">
                            <input type="text" name="terms" placeholder="keywords or phrase" class="form-control" id="terms" />
                        </div>
                        <div class="col-sm-2">
                        <button type="button" name="submit" class="btn btn-primary" id="search" ><i class="glyphicon glyphicon-search"></i> Search</button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
        <div class="row hide" id="searchContainer">
            <!-- <div class="col-lg-offset-2 col-lg-8">
                <table class="table table-striped table-bordered">
                    <p class="pull-right muted"><span class="text-danger">* All times are in minutes</span></p>
                    <tr>
                        <th></th>
                        <th width="25%" class="text-center">Title</th>
                        <th width="5%" class="text-center">Length</th>
                        <th width="15%" class="text-center">Upload Date</th>
                        <th class="text-center">Result</th>
                    </tr>
                </table>
                
            </div> -->
        </div>
        <!-- /.row -->

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