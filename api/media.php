<?php
require_once('../config.php');

$params = array('version' => API_VERSION, 'apikey' => API_KEY, 'password'=> PASSWORD);
$aStatus = array('PROCESSING','MACHINECOMPLETE', 'HUMANCOMPLETE','ERROR');

if(isset($_POST['upload'])) {
    $iMedia = $_POST['upload'];
    $title = $_POST['filename'];

    $iMedia = '"'.$mysqli->real_escape_string($iMedia).'"';
    $title = '"'.$mysqli->real_escape_string($title).'"';
    if(!$mysqli->query("REPLACE INTO media(title, mediaId) VALUES ($title, $iMedia)")) 
        d("\n\nError: " . $mysqli->error. '-upload-' . $title);

    echo json_encode(array("status" => 200, "message" => "Uploaded and Saved in Database"));
}

if(isset($_POST['media'])) {
    $return = array();
    $transcript = $filename = "";
    $markerCount = 0;
    try {
            $iMedia = $_POST['media'];
            // GET MEDIA AND TRANSCRIPT
            
            $ch = curl_init();
            $encoded = '';
            $params['mediaId'] = $iMedia;
            $params['action'] = 'getTranscript';
            $params['format'] = 'txt';

            foreach($params as $name => $value) {
              $encoded .= urlencode($name).'='.urlencode($value).'&';
            }

            unset($params['format']);

            $encoded = substr($encoded, 0, strlen($encoded)-1);

            curl_setopt($ch, CURLOPT_URL, API_URL .'?'.$encoded);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
            $response = curl_exec($ch);
            $info = curl_getinfo($ch);
            curl_close($ch);
            

            $res = json_decode($response, true);
            if(!isset($res['requestStatus']) || $res['requestStatus'] != "SUCCESS")
                throw new Exception("Error Processing Request: " . $res['statusMessage'], 1);
                
                

            $transcript = trim(str_replace('\n', '', $res['transcript']));
            $transcript = trim(str_replace('>>', '', $transcript));
            $sTranscript = '"'.$mysqli->real_escape_string($transcript).'"';
            $iMedia = '"'.$mysqli->real_escape_string($iMedia).'"';

            // GET MEDIA DETAILS
            
            $ch = curl_init();
            $encoded = '';
            $params['action'] = 'getFileMetaData';

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
        if(!isset($res['requestStatus']) || $res['requestStatus'] != "SUCCESS")
            throw new Exception("Error Processing Transcript Request: " . $res['statusMessage'], 1);
            
        $aResponse = $res['response'];
        $image = '"'.$mysqli->real_escape_string($aResponse['image_url']).'"';
        $description = '"'.$mysqli->real_escape_string($aResponse['description']).'"';
        $recordedDate = '"'.$mysqli->real_escape_string($aResponse['recordedDate']).'"';
        $title = '"'.$mysqli->real_escape_string($aResponse['title']).'"';

        if(!$mysqli->query("REPLACE INTO media(title, image_url, description, recordedDate, transcript, mediaId) VALUES ($title, $image, $description, $recordedDate, $sTranscript, $iMedia)")) 
            throw new Exception("\n\n" . __LINE__ ."Error: " . $mysqli->error . "\n\nSQL: REPLACE INTO media(title, image_url, description, recordedDate, transcript, mediaId) VALUES ($title, $image, $description, $recordedDate, $sTranscript, $iMedia)");

        // GET KEYWORDS
        
        $ch = curl_init();
        $encoded = '';
        $params['action'] = 'getFileAnalytics';

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
        if(!isset($res['requestStatus']) || $res['requestStatus'] != "SUCCESS")
            throw new Exception("Error Processing Analytics Request: " . $res['statusMessage'], 1);
            
        $aKeywords = $res['keywords'];
        $keywordsToSearch = array();
        $allKeywords = array();
        
        if(!empty($aKeywords)) {
            foreach ($aKeywords as $aKey) {
                $aMarkers = $aKey['t'];
                $aKeyword = $aKey['name'];
                $aKey = '"'.$mysqli->real_escape_string($aKeyword).'"';
                if($mysqli->query("INSERT INTO keywords(mediaId, keyword) VALUES($iMedia, $aKey) ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id)")) {
                    $iKey = $mysqli->insert_id;
                    $allKeywords[$iKey] = $aKeyword;                        
                } else { 
                    throw new Exception("\n\nError: " . $mysqli->error. '-key-' . $aKey);
                }
            }
            $keyWordsCount = count($allKeywords);
            foreach ($allKeywords as $iKey => $term) {
                $ch = curl_init();
                $encoded = '';
                $params['action'] = 'searchFile';
                $params['terms'] = $term;

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
                d(json_encode($info));

                $res = json_decode($response, true);
                if(!isset($res['requestStatus']) || $res['requestStatus'] != "SUCCESS")
                    throw new Exception("Error Processing Markers Request: " . $res['statusMessage'], 1);
                
                $title = $res['hits']['title'];
                $length = $res['hits']['length'];

                $filename = $mysqli->real_escape_string($title);

                $title = '"'.$mysqli->real_escape_string($title).'"';
                $length = '"'.$mysqli->real_escape_string($length).'"';

                if(!$mysqli->query("UPDATE media SET length = $length WHERE mediaId = $iMedia")) 
                    throw new Exception("\n\n" . __LINE__ ."Error: " . $mysqli->error . "\n\nSQL: UPDATE media SET length = $length WHERE mediaId = $mediaId");

                $markerCount = count($res['hits']['hits']);
                foreach ($res['hits']['hits'] as $key => $value) {
                    $term = $value['term'];
                    $term = '"'.$mysqli->real_escape_string($term).'"';
                    foreach ($value['hits'] as $k => $hit) {
                        $time = $hit['time'];
                        $end = $hit['end'];
                        $markerText = $hit['phrase'];
                        $markerText = '"'.$mysqli->real_escape_string($markerText).'"';
                        $time = '"'.$mysqli->real_escape_string($time).'"';
                        $end = '"'.$mysqli->real_escape_string($end).'"';

                        if(!$mysqli->query("INSERT INTO markers(mediaId, keyword, keyword_id, marker, marker_end, marker_text) VALUES($iMedia, $term, $iKey, $time, $end, $markerText) ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id)")) 
                            throw new Exception("\n\n" . __LINE__ ."Error: " . $mysqli->error . "\n\nSQL: REPLACE INTO markers(iMedia, keyword, marker, marker_text) VALUES($iMedia, $term, $time, $markerText)");
                        
                    } //$value['hits']
                } // $res['hits']['hits']
            }
        } //ifkeywords
        $result = $mysqli->query("SELECT 
                                *,
                                l.`mediaId` AS media,
                                mr.`marker`,
                                COUNT(DISTINCT k.`keyword`) AS keywords,
                                COUNT(DISTINCT mr.keyword) AS markers 
                                FROM
                                media_log l 
                                JOIN media m 
                                    ON m.`mediaId` = l.`mediaId` 
                                    AND m.`status` = 0 
                                LEFT JOIN keywords k 
                                    ON k.`mediaId` = l.`mediaId` 
                                LEFT JOIN markers AS mr 
                                    ON k.mediaId = mr.mediaId 
                                    AND (k.keyword = mr.keyword)
                                WHERE l.`mediaId` = $iMedia GROUP BY l.`mediaId`");


        $return['data'] = $result->fetch_assoc();
        $return['status'] = 200;
        $return['message'] = "Successfully Saved";

    } catch(Exception $e) {
        $return['iMedia'] = $iMedia;
        $return['message'] = $e->getMessage();
        $return['status'] = -1;
    }
        d($return);

    echo json_encode($return);
}
// SEARCH
if(isset($_GET['terms'])) {
    $res = array();
    $aTerms = str_replace(' ', '|', trim($_GET['terms']));
    /*$aParams = explode(' ', $_GET['terms']);
    foreach ($aParams as $key => &$value) {
        $aTerms[] = &$value;
    }*/

    $rawQuery = "SELECT 
                  t.`mediaId`,
                  m.`title`,
                  m.`length`,
                  m.`image_url`,
                  m.`description`,
                  m.`transcript`,
                  m.`recordedDate`,
                  t.`keyword`,
                  t.`marker`,
                  t.`marker_text`,
                  k.`id`
                FROM
                  media m 
                  JOIN keywords k 
                    ON k.`mediaId` = m.`mediaId` 
                  JOIN markers t 
                    ON t.`mediaId` = m.`mediaId` 
                    AND t.`keyword` = k.`keyword` 
                WHERE t.`keyword` REGEXP ? ";
    // $rawQuery .= implode('|',array_fill(0,count($aTerms),'?'));
    $rawQuery .= " ORDER BY t.`keyword`, t.`marker`";

    $stmt = $mysqli->prepare($rawQuery);
    $stmt->bind_param('s', $aTerms);
    /*call_user_func_array(
        array($stmt, 'bind_param'), 
        array_merge(
            array(str_repeat('s', count($aTerms))),
            $aTerms
        )
    );*/
    // print_r($rawQuery);
    $stmt->execute();
    // print_r($stmt->error);
    $stmt->store_result();
    $stmt->bind_result($mediaId, $title, $length, $image_url, $description, $transcript, $recordedDate, $term, $marker, $marker_text, $id);

    //fetch records
    $html = "";
    $aResult = array();
    
    while($stmt->fetch()) {

        $aResult[$mediaId]['mediaId'] = $mediaId;
        $aResult[$mediaId]['title'] = $title;
        $aResult[$mediaId]['length'] = $length;
        $aResult[$mediaId]['recordedDate'] = $recordedDate;
        $aResult[$mediaId]['description'] = $description;
        $aResult[$mediaId]['transcript'] = $transcript;
        $aResult[$mediaId]['image_url'] = $image_url;
        $aResult[$mediaId]['terms'][$term]['name'] = $term;
        $aResult[$mediaId]['terms'][$term]['marker'][] = $marker;
        $aResult[$mediaId]['terms'][$term]['marker_text'][] = $marker_text;
    }

    foreach ($aResult as $mediaId => $aDetail) {
        // CREATE MARKER FILE
        $file = 'keywords/'.$mediaId . '.vtt';
        $markerFile = "WEBVTT";
        $markerFile .= "\n\n";
        $html .= '<div class="panel panel-default panel-default">
            <div class="panel-heading">
                <h3 class="panel-title"><i class="glyphicon glyphicon-film"></i> ' . $aDetail['title'] .'
                    <button class="btn btn-sm btn-success pull-right" class="getTranscript" data-id="'.$mediaId.'"><i class="glyphicon glyphicon-refresh"></i> REFRESH TRANSCRIPT</button>
                </h3>
                <div class="clearfix"></div>
                Length: <span> ('.secondToString($aDetail['length']).') </span>
            </div>

            <div class="panel-body" data-file="'.$file.'">
                <div class="record-player">
                    <div class="record-timeline"></div>';
                    
            $keywords = '';

        foreach ($aDetail['terms'] as $key => $aTerm) {
            $keywords .= ' <b>' . $aTerm['name'] . ' </b>';
            foreach ($aTerm['marker'] as $k => $iMarker) {
                $ratio = ($iMarker / $aDetail['length']) * 100;
                $html .= '<div data-term="' . $aTerm['name'] . '" data-marker="' . $iMarker . '" data-media="' . $mediaId . '" data-placement="top" data-toggle="tooltip" title="'. $aTerm['marker_text'][$k].'" class="glyphicon glyphicon-chevron-up getVideo" style="left: '. $ratio. '%; position:absolute; top:8px;"><br/><small>'. secondToString($iMarker).'</small></div>';
            }
        }

        $html .= '<div class="clearfix">' . $keywords . '</div>';
        $html .= '<div class="clearfix"></div>';
        $html .= '<div id="transcript" >'. $aDetail['transcript'] != "" ? $aDetail['transcript'] : "Please Refresh Transcript" . '</div>';
        $html .= '</div>
            </div>
        </div>';
    }

    $res['html'] = $html;
    $res['result'] = $aResult;
    echo json_encode($res);
}

if(isset($_POST['delete'])) {

    try {
        $iMedia = $_POST['delete'];

        // GET MEDIA AND TRANSCRIPT
        
        $ch = curl_init();
        $encoded = '';
        $params['mediaId'] = $iMedia;
        $params['action'] = 'deleteFile';

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
        if(!isset($res['requestStatus']) || $res['requestStatus'] != "SUCCESS")
            throw new Exception("Error Processing Request");
        
        $iMedia = $mysqli->real_escape_string($iMedia);

        if(!$mysqli->query("UPDATE media SET status = 2 WHERE mediaId = '$iMedia'")) 
            d("\n\nError: " . $mysqli->error . '-status-' . $iMedia);

        $return['status'] = 200;
        $return['message'] = "Successfully Deleted";
    } catch(Exception $e) {
        $return['message'] = $e->getMessage();
        $return['status'] = -1;
    }

    echo json_encode($return);

}

if(isset($_POST['archive'])) {
    $iMedia = $_POST['archive'];
    $status = (int) $_POST['status'];

    $iMedia = $mysqli->real_escape_string($iMedia);
    if(!$mysqli->query("UPDATE media SET status = '$status' WHERE mediaId = '$iMedia'")) 
        d("\n\nError: " . $mysqli->error . '-status-' . $iMedia);

    $return['status'] = 200;
    $return['message'] = "Successful";
    echo json_encode($return);
}

function secondToString($time) {
    $ret = "";
    $mins = floor($time / 60);
    $secs = $time % 60;

    $ret .= $mins . ":" . ($secs < 10 ? "0" : "");
    $ret .= $secs;

    return $ret;
}

function secondsToTime($seconds)
{   
    $mill = explode(".", $seconds);
    if(!isset($mill[1]))
        $mill[1] = '00';

    $ms = $mill[1];
    // extract hours
    $hours = floor($seconds / (60 * 60));
 
    // extract minutes
    $divisor_for_minutes = $seconds % (60 * 60);
    $minutes = floor($divisor_for_minutes / 60);
 
    // extract the remaining seconds
    $divisor_for_seconds = $divisor_for_minutes % 60;
    $seconds = floor($divisor_for_seconds);
    
    // return the final array
    $obj = array(
        "h" => (int) $hours,
        "m" => (int) $minutes,
        "s" => (int) $seconds
    );
    return ($obj['h'] < 10 ? "0" : "") . $obj['h'] . ":" . ($obj['m'] < 10 ? "0" : "") . $obj['m'] . ":" . ($obj['s'] < 10 ? "0" : "") . $obj['s'] . "." . $mill[1] . "0";
    // return $obj;
}
?>