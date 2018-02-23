<?php

/**
 * VoiceBase PHP Plugin v.1.0.9
 */
class vbClass{
    public $apiURL = '';
    public $version = '1.1';
    public $ModPagespeed = 'off';
    public $params = array();
    
    public function __construct($apikey, $password, $mediaID, $externalID, $apiURL = 'http://www.voicebase.com/services') {
        if (!function_exists('curl_init')) {
            throw new Exception('Script requires the PHP CURL extension.');
            exit(0);
        }
        if (!function_exists('json_decode')) {
            throw new Exception('Script requires the PHP JSON extension.');
            exit(0);
        }
        
        $this->params = array(
            "apikey"        => $apikey,
            "password"      => $password,
            "version"       => $this->version,
            "ModPagespeed"  => $this->ModPagespeed
        );
        if($mediaID){
            $this->params['mediaid'] = $mediaID;
        }else{
            $this->params['externalid'] = $externalID;
        }

        $this->apiURL = $apiURL;
    }
    
    public function getTranscript($highlight = 5, $lineBreak = false){
        if((int)$highlight != 0 && (int)$highlight < 5){
            $highlight = 5;
        }
        if($lineBreak && $lineBreak < 1){
            $lineBreak = 1;
        }
        $params = array("action" => "getKeywords", "confidence" => "0.0");
        $data = $this->curl_get_json($params);
        if($data->requestStatus == 'FAILURE'){
//            echo $data->statusMessage;
            return false;
        }

        $height = 0;
        $tbheight = !empty($height) ? "height: " . ($height) . "px;" : '';
        
        $string = '<div id="transcript-block" data-hlinterval=' . $highlight . '><div class="vbs-transcript-prewrapper vbs-resizable" style="' . $tbheight . '"><div class="vbs-transcript-wrapper">';
        
        $i = 0;
        $last = 0;
        $latest = 0;
        $curtime = 0;
        foreach ($data->transcript as $word) {
            $curtime = floor($word->s / 1000);
            if($i == 0){
                $string .= '<span t="' . 0 . '">';
            }
            for($k = 2; $k <= 10; $k++){
                if($curtime >= ($last + $highlight*$k)){
                    $last += $highlight*$k;
                    $string .= '<span t="' + $last + '"></span>';
                }
            }
            if($curtime < ($last + $highlight)){
            }else{
                $last += $highlight;
                $string .= '</span><span t="' . $last . '">';
            }
            $sptag = isset($word->m) && $word->m == "turn" ? 'm="' . str_replace(array('<br />', '<br/>', ':'), '', $word->w) . '"' : '';
            $br = isset($word->m) && $word->m == "turn" && $i > 2 ? '<br/><br/>' : '';
            $br2 = ($lineBreak && $latest != 0 && $curtime > $lineBreak + $latest) ? '<br/><br/>':'';
            $string .= preg_match("/\w+/i",$word->w) ? $br . $br2 . '<span class="w" t="' . $word->s . '" ' . $sptag . '> ' . str_replace(array('<br />', '<br/>'), '', $word->w) . '</span>' : '<span class="w" t="' . $word->s . '" ' . $sptag . '>' . str_replace(array('<br />', '<br/>'), '', $word->w) . '</span>';
            $latest = $curtime;
            $i++;
        }
        
        $string .= '</div></div></div>';

        return $string;
    }
    
    public function getKeywords(){
        $params = array("action" => "getFileAnalytics", "returnCategories" => 1, "includeStartTimes" => true);
        $data = $this->curl_get_json($params);
        if($data->requestStatus == 'FAILURE'){
//            echo $data->statusMessage;
            return false;
        }
        function cmp($a, $b) {
            return count($b->keywords) - count($a->keywords);
        }

        $height = 'height: 170px';

        $allSpeakersArray = array();
        $stringCats = '';
        $stringKeywords = '';
        $stringAllKeywords = '<ul tid="ALL TOPICS" class="vbs-active">';

        $na = (array) $data->categories;
        uasort($na, 'cmp');

        foreach ($data->categories as $category){
            $stringKeywords .= '<ul tid="' . $category->name . '">';
            $catSpeakers = array();
            foreach ($category->keywords as $kw) {
                $kwts = array();
                $spnames = array();
                $sptimes = array();
                $sptimes_str = '';
                if($kw->t) :
                    foreach ($kw->t as $key => $kwt){
                        $speaker_name = strtolower(str_replace('<br />','', str_replace('<br/>','', $key)));
                        if(count($kwt)){$kwts[] = join(',', $kwt); $sptimes[$speaker_name][] = join(',', $kwt);}
                        $spnames[] = $speaker_name;
                        if (!in_array($speaker_name, $allSpeakersArray)){
                            $allSpeakersArray[] = $speaker_name;
                        }
                        if (!in_array($speaker_name, $catSpeakers)){
                            $catSpeakers[] = $speaker_name;
                        }
                    }
                endif;
                $times = join(',', $kwts);
                foreach ($sptimes as $key=>$etimes){
                    $sptimes_str .= 'data-spt-' . $key . '="' . join(',',$etimes) . '" ';
                }
                $keyclass = count($kwts) ? 'class="key"' : '';
                $internals = join(",", $kw->internalName);
                $stringKeywords .= '<li ' . $keyclass . '><a href="#" t="' . $times . '" speakers="' . join(',',$spnames) . '" ' . $sptimes_str . ' in="' . $internals . '">' . $kw->name . '</a></li>';
            }
            $stringCats .= '<li><a href="#" speakers="' . join(',', $catSpeakers) . '">' . $category->name . '<span class="remove_cat"></span></a></li>';
            $stringKeywords .= '</ul>';
        }
        $AllKeywordsArray = $data->keywords ? $data->keywords : array();
        foreach ($AllKeywordsArray as $kw) {
            $kwts = array();
            $spnames = array();
            $sptimes = array();
            $sptimes_str = '';
            if($kw->t):
            foreach ($kw->t as $key => $kwt){
                $speaker_name = strtolower(str_replace('<br />','', str_replace('<br/>','', $key)));
                if(count($kwt)){$kwts[] = join(',', $kwt); $sptimes[$speaker_name][] = join(',', $kwt);}
                $spnames[] = $speaker_name;
                if (!in_array($speaker_name, $allSpeakersArray)){
                    $allSpeakersArray[] = $speaker_name;
                }
            }
            endif;
            $times = join(',', $kwts);
            foreach ($sptimes as $key=>$etimes){
                $sptimes_str .= 'data-spt-' . $key . '="' . join(',',$etimes) . '" ';
            }
            $keyclass = count($kwts) ? 'class="key"' : '';
            $internals = join(",", $kw->internalName);
            $stringAllKeywords .= '<li ' . $keyclass . '><a href="#" t="' . $times . '" speakers="' . join(',',$spnames) . '" ' . $sptimes_str . ' in="' . $internals . '">' . $kw->name . '</a></li>';
        }
        $stringAllKeywords .= '</ul>';

        $stringCatsPrint = '<ul class="vbs-topics-list">';
        $stringCatsPrint .= '<li class="vbs-all-topics vbs-active"><a href="#" speakers="' . join(',', $allSpeakersArray) . '">ALL TOPICS</a></li>';
        $stringCatsPrint .= $stringCats;
        $stringCatsPrint .= '</ul>';

        $string  = '<div id="keyword-block" >';
        $string .= '<div class="vbs-keywords-wrapper vbs-scroll" style="margin-bottom: 15px; ' .$height. '">';
        $string .= '<div class="vbs-topics">' . $stringCatsPrint . '</div>';
        $string .= '<div class="vbs-keywords-list-wrapper vbs-three-col"><div class="vbs-keywords-list-tab">' . $stringAllKeywords . $stringKeywords . '</div></div>';
        $string .= '<div class="clearblock"></div></div></div>';

        return $string;
    }
    
    public function getToken($timeout = 10, $ownerId = 0){
        $params = array("action" => "getToken", "timeout" => $timeout, "ownerId" => $ownerId);
        $data = $this->curl_get_json($params);
        if($data->requestStatus == "SUCCESS" && $data->statusMessage == "The request was processed successfully"){
            $this->params['token'] = $data->token;
            unset($this->params['apikey']);
            unset($this->params['password']);
            return $data->token;
        }
        return 'error';
    }

    private function curl_get_json($params) {
        $params = array_merge($this->params, $params);
        $url = $this->apiURL;
        $url .= '?' . http_build_query($params);
        $ch = curl_init($url);
        
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HEADER, false);

        $data = curl_exec($ch);
        $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        if($status == 200){
            return json_decode($data);
        }
        return false;
    }
    
}
