(function( $ ){
    var markerColors = ['#78c361', '#9932cc', '#ff69b4', '#6495ed', '#ffd700', '#f6a7a1', '#7fb397', '#009999'];
    var resultsOnPage = 8;
    var pageNum = 1;
    var width = 640;
    
    var parameters = {
        "version": "1.1",
        "apikey": "",
        "password": "",
        "action": "search",
        "ispublic": 1,
        "SearchPhrase": true
    };
    var result_block_id = 'searchresultblock';
    var apiurl = "http://api.voicebase.com/services";
    var exampleTokenUrl = 'http://demo.voicsebasejwplayer.dev4.sibers.com/extoken.php';

    var methods = {
        init : function(options) {
            width = typeof options.width !== 'undefined' ? options.width : width;
            width = width < 300 ? 300 : options.width;
            this.each(function(){
                $(this).html(methods.parseTemplate('mainDiv', {'width': width}));
                methods.initResultBlock(options);
            });

            if(!methods.setConfig(options)){
                methods.errorMessage('config');
            }
            methods.setEventsBefore();

        },
        initResultBlock: function(options){
            if(options.result_block_id && $('#' + options.result_block_id).length > 0){
                // set result block from user
                result_block_id = options.result_block_id;
            }
            else{
                // set default result block
                $(this).find('.vbwidget').append('<div id="' + result_block_id + '"></div>');

            }
        },
        setConfig: function(options){
            function keysToLowerCase (obj) {
                var keys = Object.keys(obj);
                var n = keys.length;
                while (n--) {
                    var key = keys[n]; // "cache" it, for less lookups to the array
                    if (key !== key.toLowerCase()) { // might already be in its lower case version
                        obj[key.toLowerCase()] = obj[key]; // swap the value to a new lower case key
                        delete obj[key]; // delete the old key
                    }
                }
                return (obj);
            }
            var config = keysToLowerCase(options);
            apiurl = typeof config.apiurl != 'undefined' ? config.apiurl : apiurl;

            if(options.token){
                methods.setToken(options.token);
            }
            else if(options.example){
                jQuery.ajax({
                    url: exampleTokenUrl,
                    type: 'POST',
                    data: {},
                    dataType: "json",
                    async: false
                }).done(function( json ) {
                    return methods.setExampleToken(json);
                }).fail(function(jqxhr, textStatus, error) {
                    console.log(jqxhr);
                    return false;
                });
            }
            else{
                if(typeof config.apikey == 'undefined') {
                    return false;
                }
                parameters.apikey = config.apikey;
                if(typeof config.password == 'undefined'){
                    return false;
                }
                parameters.password = config.password;
            }

            return true;
        },
        setExampleToken: function(data) {
            if (data.success == true) {
                return methods.setToken(data.token);
            } else {
                alert(data.message);
                return false;
            }
        },
        setToken: function(token){
            delete parameters.apikey;
            delete parameters.password;
            parameters.token = token;
            return true;
        },
        setEventsBefore: function(){
            $('.voicebase_widget').on('click',function(e) {
                var _this = $(this);
                var vb_words = _this.find('.voicebase_word');
                var searchInput = $('#voice_search_txt');
                var words = [];
                
                if(vb_words.length) {
                    $.each(vb_words, function(key, value) {
                        words.push($(value).find('.search_word').text());
                        $(value).remove();
                    });
                    searchInput.val(words.join(' '));
                }
                $('.voicebase_widget_wrap').addClass('focused');
                searchInput.css("opacity","1");
            });
            
            $('#voice_search_txt').on('blur',function(e) {
                var words = methods.getSearchWordsArray();                
                var $this = $(this);
                if(words.length) {
                    methods.searchWordWidget(words);
                }
                $this.css("opacity","0");
                $('.voicebase_widget_wrap').removeClass('focused');
            });
            
            $('#voice_search_txt').on('change keyup', function(){
                if($(this).val().length > 0){
                    $("#clear_string").addClass('filled');
                }else{
                    $("#clear_string").removeClass('filled');
                }
            });
            
            $('#clear_string').on('click', function(){
                if($(this).hasClass('filled')){
                    $(this).removeClass('filled');
                    $('.search_word_widget').html('');
                    $('.errormessage').remove();
                    $('#voice_search_txt').val('').change();
                }
                return false;
            });
            
            $('#voicebase_search_form').on('submit',function() {
                pageNum = 1;
                $("#voice_search_txt").blur();
                $('.voicebase_markers, .errormessage').html('');
                var words = methods.getSearchWordsArray();
                
                if(words.length > 0) {
                    methods.getSearch(words);
                }
                return false;
            });

            var $resultBlock = $('#' + result_block_id);
            $resultBlock.on({
                mouseover: function(e) {
                    $(this).next().fadeIn(75);
                },
                mouseout: function(e) {
                    $(this).next().fadeOut(100);
                }
            }, 'a.voicebase_marker');

            $resultBlock.on('click','.next',function(){
                pageNum++;
                methods.getSearch(methods.getSearchWordsArray());
                return false;
            });

            $resultBlock.on('click','.prev',function(){
                pageNum--;
                methods.getSearch(methods.getSearchWordsArray());
                return false;
            });
        },
        searchWordWidget: function(words){
            var templateId = 'searchWordTemplate';
            var wrapper = $('.search_word_widget');
            var markers_string = "";
            for(var i in words) {
                var tmpcolor = '';
                if(i > 7){
                    tmpcolor = '#'+ ('000000' + (Math.random()*0xFFFFFF<<0).toString(16)).slice(-6);
                }else{
                    tmpcolor = markerColors[i];
                }
                markers_string += " " + methods.parseTemplate(templateId, {
                    'word': words[i], 
                    'clean_word': words[i].replace(/"/g, ''), 
                    'color': tmpcolor
                });
            }
            wrapper.html(markers_string);
        },
        parseTemplate: function(templateId, vars){
            var templater = methods.vbTemplates(templateId);
            var template = templater;
            for(var i in vars) {
                var rex = new RegExp("{{\\s*" + i + "\\s*}}", "gi");
                template = template.replace(rex, vars[i]);
            }
            return template;
        },
        vbTemplates: function(templateId){
            switch(templateId){
                case("mainDiv"):
                    return '<div class="vbwidget" style="width:{{ width }}px;"><div class="voicebase_record_details">\n\
                        <div class="checker"><div class="voicebase_record_description"></div>\n\
                                <div class="voicebase_record_preview">\n\
                                    <div><div class="voicebase_record_timeline">&nbsp;</div></div>\n\
                                </div>\n\
                                <div class="fixer">&nbsp;</div></div>\n\
                        <div class="search-block voicebase_search_form">\n\
                            <form action="#" id="voicebase_search_form">\n\
                                <div class="voicebase_widget_wrap">\n\
                                    <div class="voicebase_widget">\n\
                                        <input name="get_voice_search" value="" size="20" id="voice_search_txt" class="formfields" type="text" />\n\
                                        <div id="voicebase_search_string">\n\
                                            <div class="marquee">\n\
                                                <div class="search_word_widget"></div>\n\
                                            </div>\n\
                                        </div>\n\
                                        <a href="#" id="clear_string" title="Clear String" class="shift_more"></a>\n\
                                    </div>\n\
                                </div>\n\
                                <div class="voicebase_buttons"><span><input id="search-button" value="Search ►" type="submit"></span></div>\n\
                                <div class="fixer">&nbsp;</div>\n\
                            </form>\n\
                        </div>\n\
                    </div></div>';
                    break;
                case("searchWordTemplate"):
                    return '<span class="voicebase_word"><em><dfn style="border-bottom-color: {{ color }};" class="voicebase_marker"></dfn>{{ clean_word }}<span class="search_word" style="display:none">{{ word }}</span></em></span>';
                    break;
                case("markerTemplate"):
                    return '<a href="{{ href }}" target="_blank" class="voicebase_marker" style="border-bottom-color:{{ stcolor }}; z-index:91; left:{{ position }}px;" stime="{{ time }}"><ins></ins></a>'+
                    '<span ctime="{{ time }}" class="comment">{{ phrase }}</span>';
                    break;
                case("searchresultblock"):
                    return '{{ pager }} {{ searchresults }} {{ pager }}';
                    break;
                case("voicebase_pager"):
                    return '<div class="voicebase_pager">\n\
                        <a href="#" class="prev">Previous Page</a>\n\
                        Showing {{ from }}-{{ to }} of {{ total }} recordings\n\
                        <a href="#" class="next">Next Page</a>\n\
                    </div>';
                    break;
                case("resultsItem"):
                    return '<div class="voicebase_record colored">\n\
                            <div>\n\
                                <div class="voicebase_record_description">\n\
                                    <h2><a href="{{ detailsLink }}" title="{{ title }}">{{ title }}</a></h2>\n\
                                    <p></p>\n\
                                    <div class="voicebase_record_technical_info">\n\
                                        <span>Length: {{ length }}</span>\n\
                                    </div>\n\
                                </div>\n\
                                <div class="voicebase_record_preview">\n\
                                    <div class="count_of_shares"></div>\n\
                                    <div>\n\
                                        <div class="voicebase_record_timeline">&nbsp;</div>\n\
                                    </div>\n\
                                    <div class="voicebase_markers">{{ markers }}</div>\n\
                                </div>\n\
                                <div class="fixer">&nbsp;</div>\n\
                            </div>\n\
                        </div>';
                    break;
                case("errorMessage"):
                    return '<div class="errormessage">{{ message }}</div>';
                    break;
                default:
                    return '';
            }
        },
        getSearchWordsArray: function() {
            var words = $('#voice_search_txt').val().trim().match(/("[^"]+")+|\w+/ig);
            return words ? words : [];
        },
        getSearch: function(terms){
            var terms_string = terms.join(',');
            terms_string = terms_string.toLowerCase();
            parameters.terms = terms_string;
            var prepager = pageNum == 1 ? 1 : 0;
            var from = ((pageNum - 1) * resultsOnPage) + 1;
            var to = from + resultsOnPage + prepager - 1;
            parameters.from = from;
            parameters.to = to;
            
            $.getJSON(
                apiurl,
                parameters,
                function(data) {
                    if(data.requestStatus == "FAILURE" && data.statusMessage == "No files found"){
                        methods.errorMessage('error', "No files found");
                        return false;
                    }else if(data == "FAILURE" || data.requestStatus == "FAILURE"){
                        methods.errorMessage('error', "Server return error");
                        return false;
                    }else if(data.requestStatus == "SUCCESS"){
                        var respitems = "";
                        var tlw = $('.checker .voicebase_record_preview .voicebase_record_timeline').width();
                        for(var i in data.hits){
                            var markers = "";
                            for(var j in data.hits[i]['hits']){
                                for(var t in data.hits[i]['hits'][j]['times']){
                                    var position = (data.hits[i]['hits'][j]['times'][t] * tlw) / data.hits[i]['length'];
                                    var amp = data.hits[i].detailsLink.indexOf('?') ? '&' : '?';
                                    markers += methods.parseTemplate('markerTemplate', {
                                        'position': position, 
                                        'time': data.hits[i]['hits'][j]['times'][t], 
                                        'stcolor': data.hits[i]['hits'][j]['color'].replace("0x",""), 
                                        'phrase': data.hits[i]['hits'][j]['markers'][t],
                                        'href': data.hits[i].detailsLink + amp + 'vbt=' + data.hits[i]['hits'][j]['times'][t]
                                    });
                                }
                            }
                            respitems += methods.parseTemplate('resultsItem', {"markers" : markers, 'title': data.hits[i].title, 'length': methods.parseTime(data.hits[i].length), 'detailsLink': data.hits[i].detailsLink});
                        }
                        var pager = "";
                        if(data.numberOfHits > resultsOnPage){
                            var newto = to - prepager;
                            if(newto > data.numberOfHits){
                                newto = data.numberOfHits;
                            }
                            pager = methods.parseTemplate('voicebase_pager', {'total': data.numberOfHits, 'from':from, 'to': newto});
                        }
                        var searchresults = methods.parseTemplate('searchresultblock', {"searchresults" : respitems, 'pager': pager});

                        var $resultBlock = $('#' + result_block_id);
                        $resultBlock.html(searchresults);
                        if(data.numberOfHits > resultsOnPage){
                            if(pageNum == 1){
                                $resultBlock.find('.prev').hide();
                            }
                            if(newto >= data.numberOfHits){
                                $resultBlock.find('.next').hide();
                            }
                        }
                    }
                }
            )
            
        },
        errorMessage: function(type, message){
            switch(type){
                case("config"):
                    $('.vbwidget').html(methods.parseTemplate('errorMessage', {'message':'Error config, please provide apikey/password'}));
                    break;
                case("error"):
                    $('#' + result_block_id).html(methods.parseTemplate('errorMessage', {'message':message}));
                    break;
                default:
                    break;
            }
        },
        parseTime: function(seconds) {
            var time = "";
            var h = Math.floor(seconds/3600) + "";
            time += h == 0 ? '' : h + "hr ";
            var m = Math.floor(seconds%3600/60) + "";
            time += m == 0 ? '' : m + "min ";
            var s = Math.floor(seconds%3600%60) + "";
            time += s == 0 ? '' : s + "sec";
            return time;
        }
        
    };
    $.fn.vbwidget = function( method ) {
    
        if ( methods[method] ) {
            return methods[method].apply( this, Array.prototype.slice.call( arguments, 1 ));
        } else if ( typeof method === 'object' || ! method ) {
            return methods.init.apply( this, arguments );
        } else {
            $.error( 'Method ' +  method + ' does not exist on jQuery.vbwidget' );
        }
  
    };
})( jQuery );