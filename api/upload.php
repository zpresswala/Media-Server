<?php

require_once('../config.php');

foreach(array('video', 'audio') as $type) {
    if (isset($_FILES["${type}-blob"])) {

        $fileName = $_POST["${type}-filename"];
        $uploadDirectory = __DIR__.'/files/'.$fileName;
        d($uploadDirectory);
        if (!move_uploaded_file($_FILES["${type}-blob"]["tmp_name"], $uploadDirectory)) {
            echo(" problem moving uploaded file");
        }

        echo($uploadDirectory);
    }
}
?>