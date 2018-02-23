<?php 
require_once('../config.php');

$params = array('version' => API_VERSION, 'apikey' => API_KEY, 'password'=> PASSWORD);
$aStatus = array('PROCESSING','MACHINECOMPLETE', 'HUMANCOMPLETE','ERROR');

// SAVE MEDIA
$return = array();

try {
    $started = date('Y-m-d H:i:s');
        
    $aMedias = $mysqli->query("SELECT * FROM media_log WHERE checked_on IS NULL LIMIT 10");
    if($aMedias->num_rows > 0) {
        while($aMedia = $aMedias->fetch_array()) {
            
            $markersCount = $keyWordsCount = 0;
            $iMedia = $aMedia['mediaId'];
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
                d("\n\n" . __LINE__ ."getTranscript Error: " . $res['statusMessage']);

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
                d("\n\n" . __LINE__ ."getFileMetaData Error: " . $res['statusMessage']);
                
            $aResponse = $res['response'];
            $image = '"'.$mysqli->real_escape_string($aResponse['image_url']).'"';
            $description = '"'.$mysqli->real_escape_string($aResponse['description']).'"';
            $recordedDate = '"'.$mysqli->real_escape_string($aResponse['recordedDate']).'"';
            $title = '"'.$mysqli->real_escape_string($aResponse['title']).'"';

            if(!$mysqli->query("REPLACE INTO media(title, image_url, description, recordedDate, transcript, mediaId) VALUES ($title, $image, $description, $recordedDate, $sTranscript, $iMedia)")) 
                d("\n\n" . __LINE__ ."Error: " . $mysqli->error . "\n\nSQL: REPLACE INTO media(title, image_url, description, recordedDate, transcript, mediaId) VALUES ($title, $image, $description, $recordedDate, $sTranscript, $iMedia)");

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
                d("\n\n" . __LINE__ ."getFileAnalytics Error: " . $res['statusMessage']);
            
                $aKeywords = $res['keywords'];
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
                            d("\n\nError: " . $mysqli->error. '-key-' . $aKey);
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
                } //ifkeywords
                
                if(!$mysqli->query("UPDATE media_log SET checked_on = '$started' WHERE mediaId = $iMedia")) 
                    d("\n\n" . __LINE__ ."Error: " . $mysqli->error . "\n\nSQL: UPDATE media_log SET checked_on = '$started' WHERE mediaId = $iMedia");
            }
                
            $return['started'] = $started;
            $return['timestamp'] = date('Y-m-d H:i:s');
            $return['media'] = $iMedia;
            $return['status'] = 200;
            $return['message'] = "Successfully Saved";
            $return['keywords'] = $keyWordsCount;
            $return['markers'] = $markerCount;
        }
    } catch(Exception $e) {
        $return['started'] = $started;
        $return['message'] = $e->getMessage();
        $return['status'] = -1;
        $return['timestamp'] = date('Y-m-d H:i:s');
        $return['media'] = $iMedia;
    }

    d($return);

?>