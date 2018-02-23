<?php 
require_once('../config.php');

$params = array('version' => API_VERSION, 'apikey' => API_KEY, 'password'=> PASSWORD);
$aStatus = array('PROCESSING','MACHINECOMPLETE', 'HUMANCOMPLETE','ERROR');

// SAVE MEDIA
$return = array();

try {
        $started = date('Y-m-d H:i:s');
         // GET MARKERS AND MARKER TEXT
            $results = $mysqli->query("SELECT DISTINCT * FROM keywords limit 20");
            
            $keywordsToSearch = array();
            $allKeywords = array();

            if($results->num_rows > 0) {
                while($row = $results->fetch_array()) {
                    $id = $row['mediaId'];
                    $keywordsToSearch[$id][$row['id']] = $row['keyword'];
                    $allKeywords[] = $row['keyword'];        
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
                    d("\n\n" . __LINE__ ."searchFile Error: " . $res['statusMessage']);
                
                $title = $res['hits']['title'];
                $length = $res['hits']['length'];

                $filename = $mysqli->real_escape_string($title);

                $title = '"'.$mysqli->real_escape_string($title).'"';
                $length = '"'.$mysqli->real_escape_string($length).'"';

                if(!$mysqli->query("UPDATE media SET length = $length WHERE mediaId = $iMedia AND title = $title")) 
                    d("\n\n" . __LINE__ ."Error: " . $mysqli->error . "\n\nSQL: UPDATE media SET length = $length WHERE mediaId = $mediaId");

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
                            d("\n\n" . __LINE__ ."Error: " . $mysqli->error . "\n\nSQL: REPLACE INTO markers(iMedia, keyword, marker, marker_text) VALUES($iMedia, $term, $time, $markerText)");
                        
                    } //$value['hits']
                } // $res['hits']['hits']
            }
                    
        $return['started'] = $started;
        $return['timestamp'] = date('Y-m-d H:i:s');
        $return['media'] = $iMedia;
        $return['status'] = 200;
        $return['message'] = "Successfully Saved";
    } catch(Exception $e) {
        $return['started'] = $started;
        $return['message'] = $e->getMessage();
        $return['status'] = -1;
        $return['timestamp'] = date('Y-m-d H:i:s');
        $return['media'] = $iMedia;
    }

    d($return);

?>