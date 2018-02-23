/*
* VB.api
* Interaction with the server
* */
voiceBase = (function(VB, $) {
    "use strict";

    VB.api = {
        inited: !1,
        init: function() {
            this.inited = !0;
            this.parameters = jQuery.extend(true, {}, this.default_parameters);
            if (VB.settings.mediaId) {
                this.parameters.mediaid = VB.settings.mediaId;
                delete this.parameters.externalid;
            } else {
                this.parameters.externalid = VB.settings.externalId;
                delete this.parameters.mediaid;
            }
            if (VB.settings.token || VB.settings.example) {
                this.parameters.token = VB.settings.token;
                delete this.parameters.apikey;
                delete this.parameters.password;
            } else {
                delete this.parameters.token;
                this.parameters.apikey = VB.settings.apiKey;
                this.parameters.password = VB.settings.password;
            }

            VB.api.response = {
                metadata: null,
                keywords: null,
                transcript: null,
                comments: null
            };
            VB.api.data = {
                keywords: {},
                comments: {},
                tmp: {}
            };
            VB.api.ready =  {
                metadata: !1,
                keywords: !1,
                transcript: !1,
                comments: !1
            };
            VB.api.errors =  {
                processing: 0,
                failure: 0
            };
            this.showProcessingMsg = false;
            this.endSearch = false;
        },
        default_parameters: {
            'version': VB.default_settings.apiVersion,
            'ModPagespeed': 'off'
        },
        parameters: {},
        getToken: function(timeout) {
            if(VB.helper.isApi2_0()) {
                VB.api2_0.getToken();
            }
            else {
                var _parameters = {};
                jQuery.extend(_parameters, this.parameters);
                _parameters.action = 'getToken';
                _parameters.timeout = timeout;
                delete _parameters.mediaid; // so we can send requests for many mediaIds with one token
                delete _parameters.externalid;

                // add server restrictions to token
                if(VB.settings.restrictions && VB.settings.restrictions.length > 0) {
                    _parameters.privs = VB.settings.restrictions.join(',');
                }
                VB.api.call(_parameters, VB.api.setToken);
            }
        },
        setToken: function(data) {
            if (data.requestStatus == 'SUCCESS') {
                VB.settings.token = data.token;
                VB.api.parameters.token = data.token;
                delete VB.api.parameters.apikey;
                delete VB.api.parameters.password;
                VB.view.initWithToken();
            } else {
                alert(data.statusMessage);
            }
        },
        getExampleToken: function() {
            var _parameters = {};
            VB.api.callCustom(VB.settings.exampleTokenUrl, _parameters, VB.api.setExampleToken);
        },
        setExampleToken: function(data) {
            if (data.success === true) {
                VB.settings.token = data.token;
                VB.api.parameters.token = data.token;
                VB.view.initWithToken();
            } else {
                alert(data.message);
            }
        },
        getMetaData: function() {
            VB.data.metadataWaiter = setInterval(function() {
                if(VB.data.metadataWaiter) {
                    if(VB.PlayerApi.isPlayerReady()) {
                        clearInterval(VB.data.metadataWaiter);
                        VB.data.metadataWaiter = null;
                        if(VB.settings.hasPlaylist && VB.settings.stream) {
                            var playlist = VB.PlayerApi.getPlaylist();
                            if(!VB.data.playlist_meta) {
                                VB.api.getMetaDataForPlaylist(playlist);
                            }
                            else {
                                var item = VB.PlayerApi.getCurrentPlaylistItem();
                                var vbs_id = VB.PlayerApi.getPlaylistItemId(item);
                                VB.api.setMetaData(VB.data.playlist_meta.metadata[vbs_id.id]);
                            }
                        }
                        else if(VB.helper.isApi2_0()) {
                            VB.api2_0.getMetaData();
                        }
                        else {
                            var _parameters = {};
                            jQuery.extend(_parameters, VB.api.parameters);
                            _parameters.action = 'getFileMetaData';
                            _parameters.confidence = '0.0';
                            VB.api.call(_parameters, VB.api.setMetaData);
                        }
                    }
                }
            }, 10);
        },
        setMetaData: function(data) {
            var $media_block = VB.helper.find('.vbs-media-block');
            if(data.requestStatus != 'SUCCESS') {
                data = VB.api.createMetaData();
            }
            if (data.requestStatus == 'SUCCESS' && data.response.fileStatus != 'PROCESSING') {
                if(data.self_made) {
                    $media_block.find('.vbs-download-audio-btn').addClass('vbs-disable-button');
                    $media_block.find('.vbs-del-btn').addClass('vbs-disable-button');
                    $media_block.find('.vbs-star-btn').addClass('vbs-disable-button');
                }

                VB.api.response.metadata = data;
                if(data.response.lengthMs) {
                    VB.data.duration = data.response.lengthMs / 1000;
                    VB.view.renderTimeInMediaTitle();
                }
                else {
                    $('.vbs-time').hide();
                }

                VB.helper.find('.voicebase_record_times').show();
                VB.helper.find('.vplayer').show();
                var $player = $('#' + VB.settings.playerId);
                if (VB.settings.playerType == 'jwplayer') {
                    VB.data.playerDom = (VB.PlayerApi.getRenderingMode() === 'flash') ? $player.parent() : $player;
                    VB.data.playerDom.addClass('vbs-player-wrapper vbs-' + VB.helper.randId());
                }
                else if(VB.settings.playerType == 'kaltura'){
                    VB.data.playerDom = $('#' + VB.settings.playerId);
                    VB.data.playerDom.addClass('vbs-player-wrapper vbs-' + VB.helper.randId());
                }
                else if(VB.settings.playerType == 'sublime'){
                    VB.data.playerDom = $player.parent(); // sbulime player should be in container
                    VB.data.playerDom.addClass('vbs-player-wrapper vbs-' + VB.helper.randId());
                    var $controlsBlock =  $("#" + VB.settings.controlsBlock);
                    $controlsBlock.find('.vbs-record-player').addClass('vbs-1-right-btns').find('.vbs-volume-toolbar').remove();
                }
                else if(VB.settings.playerType == 'jplayer'){
                    var jplayer_interface = VB.instances[VB.current_instance].player.interface;
                    if(jplayer_interface){
                        VB.data.playerDom = jplayer_interface.getGui();
                        VB.data.playerDom.addClass('vbs-player-wrapper vbs-' + VB.helper.randId());
                    }
                }
                else {
                    if($('.vbs-player-wrapper').length === 0){
                        VB.data.playerDom = $('#' + VB.settings.playerId);
                        VB.data.playerDom.before('<div class="vbs-player-wrapper vbs-' + VB.helper.randId() + '"></div>');
                    }
                }
                if (!VB.helper.isMediaTypeEqualVideo()) {
                    VB.PlayerApi.hidePlayer();
                } else {
                    $media_block.addClass('vbs-video');
                    $('.vbs-video .vbs-section-title').attr('data-title', 'Hide Video');
                    VB.helper.find('.vbs-record-player').addClass('vbs-video');
                    var cont = VB.helper.findc('.vbs-player-wrapper');
                    var playerWidth = $('#' + VB.settings.playerId).width();
                    $("#" + VB.settings.mediaBlock).insertBefore(cont).css('width', playerWidth);
                    if (playerWidth < VB.settings.mediumResponsive && playerWidth >= VB.settings.minResponsive) {
                        $media_block.addClass('less-600px');
                    } else if (playerWidth < VB.settings.minResponsive) {
                        $media_block.addClass('less-600px').addClass('less-460px');
                    }
                    if (VB.settings.vbsButtons.fullscreen) {
                        $media_block.find(".vbs-section-btns ul").append('<li><a href="#" class="vbs-expand-btn" data-title="Expand Video"></a></li>');
                    }
                    if(!VB.settings.expandMediaBlock) {
                        VB.helper.find(".vbs-media-block .vbs-section-title").click();
                    }
                }
                VB.helper.adjustMediaTime();

                if (data.response.isFavorite) {
                    VB.helper.find(".vbs-star-btn").addClass('vbs-active').attr('data-title', 'Remove to Favorites');
                } else {
                    VB.helper.find(".vbs-star-btn").attr('data-title', 'Add from Favorites');
                }
                VB.helper.checkAutoStart();
            } else {
                $media_block.append(VB.templates.get('disabler'));
                VB.helper.find('.vbs-record-player').append(VB.templates.get('disabler'));
                VB.api.setErrors(data);
            }
            VB.api.ready.metadata = true;
        },
        getMetaDataForPlaylist: function(playlist) {
            VB.data.playlist_meta = {};
            VB.data.playlist_meta.promises = [];
            VB.data.playlist_meta.metadata = {};

            for (var i = 0; i < playlist.length; i++) {
                var item = playlist[i];
                VB.api.setMetaDataPromise(item);
            }

            $.when.apply(this, VB.data.playlist_meta.promises).then(function(){
                VB.api.resolveMetaDataPromise(playlist);
            });
        },
        setMetaDataPromise: function(item){
            var _parameters = {};
            jQuery.extend(_parameters, this.parameters);
            _parameters.action = 'getFileMetaData';
            _parameters.confidence = '0.0';

            delete _parameters.mediaid;
            delete _parameters.externalid;

            var id;
            if(item.vbs_mediaid) {
                _parameters.mediaid = id = item.vbs_mediaid;
            }
            else if(item.vbs_externalid) {
                _parameters.externalid = id = item.vbs_externalid;
            }

            var _request = $.getJSON(VB.settings.apiUrl, _parameters).done(function(json) {
                VB.data.playlist_meta.metadata[id] = json;
            }).fail(function(jqxhr, textStatus, error) {
                console.log(jqxhr);
            });
            VB.data.playlist_meta.promises.push(_request);
        },
        resolveMetaDataPromise: function(playlist){
            var _list = [];
            for (var i = 0; i < playlist.length; i++) {
                var item = playlist[i];
                var isMediaId = false;
                var vbs_id_data = VB.PlayerApi.getPlaylistItemId(item);
                var vbs_id = vbs_id_data.id;

                if(VB.data.playlist_meta.metadata[vbs_id]) {
                    var meta_response = VB.data.playlist_meta.metadata[vbs_id].response;
                    var streamUrl;
                    if(meta_response) {
                        streamUrl = VB.PlayerApi.getStreamUrl(meta_response);
                    }
                    else {
                        streamUrl = item.file;
                        VB.data.playlist_meta.metadata[vbs_id] = VB.api.createMetaData();
                    }

                    var res = {
                        file: streamUrl,
                        title: item.title
                    };
                    if(vbs_id_data.isMediaid) {
                        res.vbs_mediaid = vbs_id;
                    }
                    else {
                        res.vbs_externalid = vbs_id;
                    }
                    _list.push(res);

                    if(i === 0) {
                        VB.api.setMetaData(VB.data.playlist_meta.metadata[vbs_id]);
                    }
                }
            }
            VB.PlayerApi.loadFile(_list);
        },
        setLocalMetaData: function(){
            VB.data.localData['metadata'] = VB.api.createMetaData();
            VB.api.setMetaData(VB.data.localData['metadata']);
        },
        createMetaData: function(){
            var duration = VB.PlayerApi.getDuration() * 1000;
            var lengthMs = (duration > 0) ? duration : 0;
            return  {
                requestStatus: "SUCCESS",
                self_made: true,
                response: {
                    lengthMs: lengthMs,
                    hasVideo: true,
                    isFavorite: false
                }
            };
        },
        getKeywords: function() {
            var _parameters = {};
            jQuery.extend(_parameters, this.parameters);
            _parameters.action = 'getFileAnalyticsSnippets';
            _parameters.returnCategories = '1';
            _parameters.includeStartTimes = true;
            if (VB.settings.keywordsGroups) {
                _parameters.returnGroups = true;
            }
            VB.api.call(_parameters, VB.api.setKeywords);
        },
        setKeywords: function(data) {
            var $keywords_block = VB.helper.find('.vbs-keywords-block');
            if (data.requestStatus == 'SUCCESS') {
                VB.api.response.keywords = data;

                var keywords = [];
                var catArray = [];
                var speakersArray = [];
                var speakersName = [];
                for (var key in data.categories) {
                    catArray.push(data.categories[key]);
                }
                if (VB.settings.keywordsGroups) {
                    for (key in data.groups) {
                        catArray.push(data.groups[key]);
                    }
                }
                keywords = data.keywords;
                var categories = jQuery.map(catArray, function(item) {
                    var parsedSpeakers = VB.speakers.parseSpeakersInCategory(item, speakersName, speakersArray);
                    speakersName = parsedSpeakers.speakersName;
                    speakersArray = parsedSpeakers.speakersArray;
                    return {
                        "name": item.name,
                        "score": item.score,
                        "subcategories": item.subcategories,
                        "similarCategories": item.similarCategories,
                        "speakers": parsedSpeakers.isps,
                        "type": item.type
                    };
                });
                categories.sort((function(first, second) {
                    return first.score - second.score;
                }));
                categories.reverse();

                var allTopicItem = {
                    'name': 'ALL TOPICS',
                    'keywords': keywords,
                    'subcategories': {},
                    'similarCategories': {},
                    'speakers': speakersArray.join()
                };
                categories.unshift(allTopicItem);

                var ka = [];
                for (var ki in data.keywords) {
                    ka.push(data.keywords[ki].name);
                }

                VB.data.keywords = ka;

                catArray.push(allTopicItem);

                var catUl = '<ul class="vbs-topics-list">';
                var li = "";
                var k = 0;
                for (var i in categories) {
                    if (typeof categories[i] == 'undefined') {
                        continue;
                    }
                    var subCats = '';
                    if (typeof categories[i].subcategories != 'undefined' && categories[i].subcategories.length) {
                        //sort by score
                        for (var n in categories[i].subcategories) {
                            subCats += categories[i].subcategories[n].name + '<br/>';
                        }
                    }
                    var typeClass = categories[i].type == 'group' ? 'group': '';

                    var liClass = categories[i].name == 'ALL TOPICS' ? 'vbs-all-topics' : typeClass;
                    li += " " + VB.templates.parse('categoriesLiTemplate', {
                        'title': categories[i].name,
                        'subcategories': subCats,
                        'speakers': categories[i].speakers,
                        'liclass': liClass
                    });
                    k++;
                }

                catUl += li + "</ul>";
                catArray.sort((function(first, second) {
                    return second.keywords.length - first.keywords.length;
                }));

                /// keywords
                var allSpeakersAr = [];
                var ull = $();
                for (var j in catArray) {
                    var typeGroupClass = catArray[j]['type'] == 'group' ? 'class="group"': '';

                    var fc = catArray[j]['name'] == 'ALL TOPICS' ? 'class=""' : typeGroupClass;
                    var $innerUl = $('<ul tid="' + catArray[j]['name'] + '" ' + fc + '></ul>');
                    var tk = catArray[j]['keywords'];

                    for (key in tk) {
                        var sptimes = "";
                        var spkeys = [];
                        var times = [];
                        var item = tk[key];
                        for (var spt in tk[key].t) {
                            if (tk[key].t !== '' && tk[key].t[spt]) {
                                var timses = tk[key].t[spt];
                                for (var timse in timses) {
                                    times.push(timses[timse]);
                                }
                            }
                            var speaker_name = VB.helper.replaceAndTrim(spt);
                            var speaker_key = VB.speakers.getSpeakerKeyByName(speaker_name);
                            sptimes += 'data-spt-' + speaker_key + '="' + (tk[key].t !== '' && tk[key].t[spt] ? tk[key].t[spt].join() : '') + '" ';
                            spkeys.push(speaker_key);
                            if (allSpeakersAr.indexOf(speaker_name) == '-1') {
                                allSpeakersAr.push(speaker_name);
                            }
                        }

                        var keyclass = tk[key].t ? 'class="key"' : '';
                        var internalName = typeof tk[key].internalName == 'undefined' ? tk[key].name : tk[key].internalName.join();
                        var keycounter = VB.settings.keywordsCounter ? ' <span>(' + times.length + ')</span>' : '';
                        // create string is more faster than VB.templates.parse('keywordsTemplate', {...})
                        var keywordsTemplate = '<li ' + keyclass + '>' +
                            '   <a href="#" t="' + times.join() + '" speakers="' + spkeys + '" ' + sptimes + '>' + tk[key].name + '</a>' + keycounter +
                            '</li>';
                        var $innerLi = $(keywordsTemplate);
                        $innerLi.find('a').data('keywordInternalName', internalName);
                        $innerUl.append($innerLi);
                    }
                    ull = ull.add($innerUl);
                }

                if (VB.settings.keywordsColumns && VB.settings.keywordsColumns != 'auto') {
                    VB.helper.find('.vbs-keywords-list-wrapper').addClass(VB.helper.getColumnClassByNumber(VB.settings.keywordsColumns));
                }

                $keywords_block.find('.vbs-topics').html(catUl);
                $keywords_block.find('.vbs-keywords-list-tab').html(ull);
                if(!VB.settings.showAutoGeneratedKeywords) {
                    VB.helper.hideAutoGeneratedKeywords();
                }
                else {
                    $keywords_block.find('.vbs-topics').find('li').first().click();
                }

                if(!VB.settings.expandKeywordsBlock) {
                    $keywords_block.show();
                    $keywords_block.find(".vbs-section-title").attr('data-title', 'Show Keywords');
                    $keywords_block.find('.vbs-section-body').hide();
                    $keywords_block.find('.vbs-search-form').hide();
                }
                else {
                    $keywords_block.slideDown('fast', function() {
                        if (VB.settings.keywordsColumns && VB.settings.keywordsColumns == 'auto') {
                            VB.helper.keywordsAutoColumns();
                        } else if (VB.settings.keywordsColumns && VB.settings.keywordsColumns == 'topics') {
                            VB.helper.keywordsAutoTopicsColumns();
                        }
                    });
                }
            } else {
                $keywords_block.append(VB.templates.get('disabler'));
                if(!VB.settings.tabView) {
                    $keywords_block.show();
                    $keywords_block.find('.vbs-search-form').hide();
                    $keywords_block.find('.vbs-section-body').hide();
                }

                if(VB.settings.searchBarOuter) {
                    $('#vbs-voice_search_txt').prop('disabled', 'disabled');
                    $('#vbs-searchbar-block').find('.vbs-search-form').addClass('vbs-form-disabled');
                }
                VB.api.setErrors(data);
            }
            VB.api.ready.keywords = true;
        },
        getTranscript: function() {
            var _parameters = {};
            jQuery.extend(_parameters, this.parameters);
            _parameters.action = 'getKeywords';
            _parameters.confidence = '0.0';
            VB.api.call(_parameters, VB.api.setTranscript);
        },
        setTranscript: function(data) {
            VB.api.response.transcript = data;
            var $transcript_block = VB.helper.find('.vbs-transcript-block');
            if (data.requestStatus == 'FAILURE' || (data.fileStatus != "MACHINECOMPLETE" && data.fileStatus != "HUMANCOMPLETE")) {
                VB.api.ready.transcript = true;
                VB.api.setErrors(data);
                if(data.requestStatus === 'FAILURE' && (!data.transcript || (data.transcript && data.transcript.length === 0))){
                    $transcript_block.addClass('vbs-ho').append(VB.templates.get('disabler')).show();
                    return false;
                }
            }
            if (data.transcriptType == 'human') {
                $transcript_block.addClass('vbs-human').find('.vbs-section-title').attr('data-title', 'Hide Transcript');
            } else {
                if (VB.settings.vbsButtons.orderTranscript) {
                    $transcript_block.addClass('vbs-with-order-btn');
                }
            }

            if (VB.settings.humanOnly && data.transcriptType == 'machine') {
                return false;
            }
            var transcript = [],
                transpart = '',
                lt = 0,
                dt = data.transcript,
                last = 0,
                spturn = 0,
                spf = false;
            var dt_length = dt.length;
            for (var i = 0; i < dt_length; i++) {
                var val = dt[i];
                if (i === 0) {
                    transpart += '<span t="' + 0 + '">';
                }
                for (var k = 2; k <= 10; k++) {
                    if (Math.floor(val.s / 1000) >= (last + VB.settings.transcriptHighlight * k)) {
                        last += VB.settings.transcriptHighlight * k;
                        transpart += '<span t="' + last + '"></span>';
                    }
                }
                if (Math.floor(val.s / 1000) >= (last + VB.settings.transcriptHighlight)) {
                    last += VB.settings.transcriptHighlight;
                    transpart += '</span><span t="' + last + '">';
                }
                lt += val.s;

                var isTurn = VB.helper.isTurn(val.m);
                var sptag = VB.speakers.createSpeakerAttr(val);

                spturn = (isTurn) ? spturn + 1 : spturn;
                var br = (isTurn && i > 2) ? '<br/><br/>' : '';
                var br2 = (VB.settings.lineBreak && typeof dt[i - 1] !== "undefined" && dt[i].s - dt[i - 1].e > VB.settings.lineBreak * 1000) ? '<br/><br/>' : '';
                var fw = '';
                if (i === 0 && typeof val.m === "undefined") {
                    fw = 'data-f=true';
                    spf = true;
                }
                var word = VB.helper.replaceN(val.w);
                transpart += val.w.match(/\w+/g) ? br + br2 + '<span class="w vbs-trans-word" t="' + val.s + '" ' + sptag + ' ' + fw + '> ' + word + '</span>' : '<span class="vbs-punc vbs-trans-word" t="' + val.s + '" ' + sptag + '>' + word + '</span>';
            }

            transpart += '</span>';
            $transcript_block.find('.vbs-transcript-wrapper').html(transpart);
            if (spturn && spf) {
                $transcript_block.find('.vbs-transcript-wrapper span[data-f=true]').before('<span class="w" t="0" m=">> "><br><br>&gt;&gt; </span>');
            }
            if ($transcript_block.not('.vbs-human').length && (!VB.settings.expandTranscriptBlock)) {
                $transcript_block.find('.vbs-section-body').hide();
                $transcript_block.find('.vbs-section-title').addClass('vbs-hidden').attr('data-title', 'Show Transcript');
            }
            $transcript_block.find(".vbs-transcript-prewrapper").css('height', VB.settings.transcriptHeight + "px");
            $transcript_block.slideDown('fast');
            var orderTranscriptURL = VB.settings.apiUrl.replace('services', 'orderTranscript');
            var mediaid = VB.settings.mediaId ? VB.settings.mediaId : VB.settings.externalId;
            var order_transcript_url = orderTranscriptURL + '/' + mediaid + '?token=' + VB.settings.token + '&cancel=close';
            VB.helper.find('.vbs-order-human-trans a').attr('href', order_transcript_url);

            $.map(data.transcript, function(val) {
                transcript.push(val.w);
            });
            VB.api.ready.transcript = true;

            if (VB.settings.transcriptResizable && $.isFunction($.fn.resizable)) {
                var $transcriptWrap = $('#' + VB.settings.transcriptBlock);
                var $transcriptBody = $transcriptWrap.find('.vbs-section-body');
                var transMinWidth = $transcriptWrap.width();
                var transcript_offset = $transcriptWrap.offset();
                var transMaxWidth = (transcript_offset && transcript_offset.left) ?  $(document).width() - Math.round(transcript_offset.left) - 10 : $transcriptWrap.width();
                VB.helper.find('.vbs-resizable').resizable({
                    minWidth: transMinWidth,
                    maxWidth: transMaxWidth,
                    resize: function() {
                        var transWidth = ($(this).width());
                        $transcriptBody.width(transWidth);
                        $transcriptBody.siblings('.vbs-section-header').width(transWidth);
                        VB.helper.checkScrollForResize($transcriptBody);
                    }
                });
                VB.helper.checkScrollForResize($transcriptBody);
            }

            if(data.fileStatus == 'REPROCESSING' && !VB.settings.modalSave) {
                VB.helper.setIsSaving(true);
                VB.api.triggerTranscriptStatus();
            }
        },
        searchInfo: function () {
            var me = this;
            me.showProcessingMsg = false;
            me.endSearch = false;
            setTimeout(function() {
                me.showProcessingMsg = true;
                if(!me.endSearch) {
                    VB.helper.showMessage('Processing your search...', 'info');
                }
            }, 500);

            setTimeout(function() {
                if(!me.endSearch && me.showProcessingMsg) {
                    VB.helper.clearMessage();
                    var endMessage = VB.templates.get('endSearchMessage');
                    VB.helper.appendMessage(endMessage);
                }
            }, 2000);
        },
        getSearch: function(terms, start) {
            var me = this;
            var isValid = VB.api.validateSearch(terms);
            if(!isValid) {
                VB.helper.showMessage('Search phrase is invalid. Its length can be up to 254 characters.', 'error');
                VB.helper.hideLoader();
                return false;
            }
            VB.data.clicker = true;
            if(!VB.data.keywordClickEvent) {
                VB.helper.collapseNewsBlock();
            }
            start = !(typeof start !== 'undefined' && start === false);
//            VB.api.getNews();
            if(VB.settings.localSearch){
                VB.api.getLocalSearch(terms, start);
            }
            else {
                var terms_string = terms.join(' ').toLowerCase();
                var _parameters = {};
                jQuery.extend(_parameters, this.parameters);
                _parameters.action = 'searchFile';
                _parameters.terms = terms_string;

                VB.api.searchInfo();
                VB.api.call(_parameters, function (json, args) {
                    me.endSearch = true;
                    if(json.numberOfHits > 1000) {
                        VB.helper.showMessage('Displaying your search results...', 'info');
                    }

                    VB.api.setSearch(json, args);
                }, {start: start, terms: terms});
            }
        },
        validateSearch: function (terms) {
            var termsString = terms.join(' ');
            return (termsString.length < 255);
        },
        getLocalSearch: function(terms, start) {
            var me = this;
            var results;
            if (!!window.Worker && typeof localSearchHelper !== 'undefined') {
                VB.api.searchInfo();
                VB.data.searchWorker = new Worker(VB.settings.localSearchHelperUrl + 'localSearchWorker.js');

                VB.data.searchWorker.onerror = function(e){
                    VB.helper.showMessage('Search error!', 'error');
                    console.log(['ERROR: Line ', e.lineno, ' in ', e.filename, ': ', e.message].join(''));
                };

                VB.data.searchWorker.onmessage = function(e) {
                    clearInterval(VB.events.time);
                    VB.events.time = null;
                    me.endSearch = true;
                    results = e.data.results;
                    var resultsLength = 0;
                    results.hits.hits.forEach(function(hits) {
                        resultsLength += hits.hits.length;
                    });
                    if(resultsLength > 1000) {
                        VB.helper.showMessage('Displaying your search results...', 'info');
                    }

                    var renderTimer = setInterval(function() {
                        if(renderTimer) {
                            if($('.vbs-markers').find('.vbs-marker').length === resultsLength) {
                                clearInterval(renderTimer);
                                renderTimer = null;
                                VB.helper.clearMessage();
                                VB.helper.setOnTimeInterval();
                            }
                        }
                    }, 100);

                    setTimeout(function() {
                        VB.api.setSearch(results, {start: start, terms: terms});
                    }, 10);
                };

                VB.data.searchWorker.postMessage({
                    transcript: VB.api.response.transcript.transcript,
                    terms: terms
                });
            }
            else {
                results = localSearchHelper.localTranscriptSearch(VB.api.response.transcript.transcript, terms);
                VB.api.setSearch(results, {start: start, terms: terms});
            }
        },
        setSearch: function(data, args) {
            console.time('setSearch');
            var start = args.start;
            var terms = args.terms;
            VB.data.clicker = false;
            var wrapper = VB.helper.find('.vbs-record-timeline-wrap');

            VB.data.markersStyles = {
                markersWrapper: wrapper,
                markersContainer: wrapper.find('.vbs-markers'),
                markersWrapperWidth: wrapper.width()
            };

            var colors = {};
            VB.helper.find('.vbs-widget .vbs-word').each(function(key, marker) {
                var $marker = $(marker);
                var word = $marker.find('.vbs-search_word').text().replace(/"/g, '').trim().toLowerCase();
                colors[word] = $marker.find('.vbs-marker').css('border-bottom-color');
            });
            if (data.requestStatus == "SUCCESS") {
                var allTimes = [];
                if (data.hits.length) {
                    var cit = 0;
                    var markers_string = '';
                    data.hits.hits.map(function(item, i) {

                        var times = [];
                        var phrases = [];
                        item.hits.map(function(hit) {
                            if (VB.speakers.filterResultForSpeaker(hit.time)) {
                                times = times.concat(hit.time);
                                var phrase = (hit.phrase) ? hit.phrase : VB.helper.getPhraseByTime(hit.time, hit.end, item.term);
                                phrases = phrases.concat(phrase);
                            }
                        });
                        markers_string += VB.view.markerWidget(times, phrases, colors[item.term]);
                        allTimes = allTimes.concat(times);
                        cit++;
                    });
                    setTimeout(function() {
                        if (markers_string.length) {
                            VB.helper.find(".vbs-next-action-btn").removeClass('vbs-next-notactive');
                        }
                        VB.data.markersStyles.markersContainer.append(markers_string);
                    }, 0);
                    if (VB.settings.editKeywords && data.hits.hits.length > 0) {
                        VB.data.searcht = allTimes;
                        VB.data.searchHits = data.hits.hits;
                        VB.helper.checkKeyword(terms, allTimes, data.hits.hits);
                    } else {
                        VB.data.searcht = null;
                        VB.data.searchHits = null;
                    }
                }
                allTimes.sort(function(a, b) {
                    return a - b;
                });
                if (start) {
                    VB.PlayerApi.seek(allTimes[0]);
                }
                //VB.helper.startScroll();
            } else if (data.requestStatus == "FAILURE") {
                VB.helper.hideLoader();
            }
            VB.helper.clearMessage();
            console.timeEnd('setSearch');
        },
        downloadAudio: function() {
            var _parameters = {};
            jQuery.extend(_parameters, this.parameters);
            _parameters.action = 'getFileMetadata';
            VB.api.call(_parameters, VB.api.setDownloadAudio);
        },
        setDownloadAudio: function(data) {
            if (data.requestStatus == 'SUCCESS') {
                window.location = data.response.downloadMediaUrl;
            } else {
                VB.helper.showMessage(data.statusMessage, 'error');
            }
        },
        favorite: function(param) {
            var _parameters = {};
            jQuery.extend(_parameters, this.parameters);
            param = typeof param !== "undefined" ? param : true;
            _parameters.action = 'updateMediaFile';
            _parameters.favorite = param ? 'add' : 'remove';
            VB.view.favorite(param);
            VB.api.call(_parameters, VB.api.sendFavorite);
        },
        sendFavorite: function(data) {
            if (data.requestStatus != 'SUCCESS') {
                VB.view.favoriteToggle();
                VB.helper.showMessage(data.statusMessage, 'error');
            }
        },
        getAutoNotesHtmlURL: function() {
            var _parameters = {};
            jQuery.extend(_parameters, this.parameters);
            _parameters.action = 'getAutoNotesHtml';
            _parameters.content = true;
            return VB.settings.apiUrl + '?' + VB.common.getStringFromObject(_parameters);
        },
        editKeyword: function(mode, keyword_name, category_name, elem) {
            var _parameters = {};
            jQuery.extend(_parameters, this.parameters);
            _parameters.keywordname = keyword_name;
            _parameters.action = "moveKeyword";
            if (category_name != 'ALL TOPICS') {
                _parameters.categoryname = category_name;
            } else {
                _parameters.categoryname = '';
            }
            _parameters.mode = mode;
            var li = $(elem).parent();

            VB.api.call(_parameters, VB.api.responseEditKeywords, {mode: mode, li: li});
        },
        responseEditKeywords: function(data, args) {
            if (data.requestStatus == 'SUCCESS') {
                if (args.mode == 'up') {
                    args.li.insertBefore(args.li.prev());
                } else if (args.mode == 'down') {
                    args.li.insertAfter(args.li.next());
                } else if (args.mode == 'first') {
                    args.li.insertBefore(args.li.siblings(':eq(0)'));
                }
                if (args.mode == 'delete') {
                    args.li.remove();
                }
            } else {
                VB.helper.showMessage(data.statusMessage, 'error');
            }
        },
        removeKeyword: function(keyword_name, category_name, elem) {
            if(keyword_name) {
                var _parameters = {};
                jQuery.extend(_parameters, this.parameters);
                _parameters.action = "deleteKeyword";
                _parameters.keywordname = keyword_name;
                if (category_name != 'ALL TOPICS') {
                    _parameters.categoryname = category_name;
                } else {
                    _parameters.categoryname = '';
                }
                var li = $(elem).parent();
                VB.api.call(_parameters, VB.api.responseRemoveKeyword, {category_name: category_name, keyword_name: keyword_name, li: li});
            }
        },
        responseRemoveKeyword: function(data, args) {
            if (data.requestStatus == 'SUCCESS') {
                if (args.category_name == 'ALL TOPICS') {
                    VB.data.keywords.splice(VB.data.keywords.indexOf(args.keyword_name));
                }
                args.li.remove();
            } else {
                VB.helper.showMessage(data.statusMessage, 'error');
            }
        },
        removeTopic: function(cat) {
            var _parameters = {};
            jQuery.extend(_parameters, this.parameters);
            _parameters.categoryname = cat;
            _parameters.action = "deleteKeywordCategory";
            VB.api.call(_parameters, VB.api.responseRemoveTopic);
        },
        responseRemoveTopic: function(data) {
            if (data.requestStatus == 'SUCCESS') {
                var $topics_list = VB.helper.find(".vbs-topics-list");
                $topics_list.find("li.vbs-active").remove();
                var li = $topics_list.find('li.vbs-all-topics');
                li.parent().find('.vbs-active').removeClass('vbs-active');
                li.addClass('vbs-active');
                var catName = li.find('a').text().trim();
                var $keywords_list_tab = VB.helper.find(".vbs-keywords-list-tab");
                $keywords_list_tab.find("ul").removeClass('vbs-active');
                $keywords_list_tab.find('ul[tid="' + catName + '"]').addClass('vbs-active');
                $('.vbs-topic-delete-popup').remove();
                if (VB.settings.keywordsColumns == 'topics') {
                    VB.helper.keywordsAutoTopicsColumns();
                }
            } else {
                VB.helper.showMessage(data.statusMessage, 'error');
            }
        },
        addKeywords: function(keywords, times) {
            var _parameters = {};
            jQuery.extend(_parameters, this.parameters);
            _parameters.keyword = keywords;
            _parameters.action = "addKeyword";
            VB.api.call(_parameters, VB.api.responseAddKeywords, {keywords:keywords, times:times});
        },
        responseAddKeywords: function(data, args) {
            if (data.requestStatus == 'SUCCESS') {
                var li = VB.helper.find('.vbs-topics-list li.vbs-all-topics');

                li.parent().find('.vbs-active').removeClass('vbs-active');
                li.addClass('vbs-active');
                var catName = li.find('a').text().trim();

                var $keywords_list_tab = VB.helper.find(".vbs-keywords-list-tab");
                $keywords_list_tab.find("ul").removeClass('vbs-active');
                $keywords_list_tab.find('ul[tid="' + catName + '"]').addClass('vbs-active');
                var kwarr = args.keywords.replace(/"/g, '');
                VB.data.keywords.push(kwarr);
                var keycounter = VB.settings.keywordsCounter ? ' <span>(' + args.times.split(",").length + ')</span>' : '';
                var link = $('<li class="key"><a href="#" t="' + args.times + '" speakers="">' + kwarr + '</a>' + keycounter + '</li>'); // in="' + kwarr + '"
                link.find('a').data('keywordInternalName', kwarr);
                $keywords_list_tab.find('ul.vbs-active').prepend(link);
                VB.helper.find('.vbs-add-search-word').each(function() {
                    if($(this).data('data-kwa').replace(/"/g, '') === kwarr) {
                        $(this).remove();
                    }
                });
                if(VB.settings.keywordsColumns == 'topics'){
                    VB.helper.keywordsAutoTopicsColumns();
                }
            } else {
                VB.helper.showMessage(data.statusMessage, 'error');
            }
        },
        saveTrancript: function(content) {
            var _parameters = {};
            jQuery.extend(_parameters, this.parameters);
            _parameters.content = content;
            _parameters.action = "updateTranscript";
            VB.helper.setIsSaving(true);
            VB.api.callPost(_parameters, VB.api.responseSaveTrancript, content);
        },
        responseSaveTrancript: function(data, args) {
            if (data.requestStatus == 'SUCCESS') {
                setTimeout(function() {
                    VB.api.triggerTranscriptStatus();
                }, VB.settings.transcriptCheckTimer * 1000);
            } else {
                VB.helper.saveTranscriptError(data.statusMessage);
            }
        },
        triggerTranscriptStatus: function() {
            var _parameters = {};
            jQuery.extend(_parameters, this.parameters);
            _parameters.action = "getFileStatus";
            VB.api.call(_parameters, VB.api.responseTriggerTranscriptStatus);
        },
        responseTriggerTranscriptStatus: function(data) {
            if (data.requestStatus == 'SUCCESS' && (data.fileStatus == 'PROCESSING' || data.fileStatus == 'REPROCESSING')) {
                setTimeout(function() {
                    VB.api.triggerTranscriptStatus();
                }, VB.settings.transcriptCheckTimer * 1000);
            }
            else if (data.requestStatus == 'SUCCESS' && data.fileStatus == 'ERROR') {
                VB.helper.saveTranscriptError(data.response);
            }
            else if (data.requestStatus == 'SUCCESS') {
                VB.helper.saveTranscriptComplete();
            }
            else if(data.requestStatus == 'FAILURE'){
                VB.helper.saveTranscriptError(data.statusMessage);
            }
            else {
                VB.helper.showMessage(data.statusMessage, 'error');
            }
        },
        getNews: function(){
            var terms = VB.helper.getSearchWordsArray();
            if(terms.length === 0){
                VB.api.addEmptyMessageForNews('empty');
                return false;
            }
            if($("#" + VB.settings.newsBlock).find('.vbs-section-title').hasClass('vbs-hidden')) { // block is collapse
                return false;
            }
            if(VB.settings.showNewsBlock){
                var $newsBlock = VB.helper.find('.vbs-news-block');
                var words = terms;
                if($.isArray(words)){
                    words = words.join(' ');
                }
                if(VB.data.prevNewsRequest === words){
                    return false;
                }
                VB.data.prevNewsRequest = words;

                $newsBlock.find('.vbs-news-wrapper').html('<div class="vbs-loader"></div>');
                var bing_url = encodeURI(VB.settings.newsUrl + words);
                $.ajax({
                    type: 'GET',
                    url: bing_url,
                    success: function(data){
                        data = JSON.parse(data);
                        VB.api.setNews(data, terms);
                    },
                    error: function(jqXHR, textStatus, errorThrown){
                        console.log(errorThrown + ': Error ' + jqXHR.status);
                    }
                });
                return true;
            }
        },
        setNews: function(data, terms){
            var all_news = (data && data.d) ? data.d.results : [];
            if(all_news.length > 0){
                if($.isArray(terms)){
                    terms = terms.join(', ');
                }
                var $newsBlock = VB.helper.find('.vbs-news-block');
                $newsBlock.find('.vbs-news-words').html(terms);
                var sem = '';
                for (var i = 0; i < all_news.length; i++) {
                    var news = all_news[i];
                    var title = news.Title || '';
                    var source = news.Source || '';
                    var time = news['Date'];
                    var news_url = news.Url;

                    sem += VB.templates.parse('vbs-news-elem', {
                        title: title,
                        source: source,
                        time: time,
                        url: news_url
                    });
                }
                $newsBlock.find('.vbs-news-wrapper').html(sem);
                $newsBlock.find('.vbs-news-elem:odd').addClass('vbs-news-elem-odd').after('<div class="clear-block"></div>');
                if(!VB.settings.hasNewsBlockHeader) {
                    $newsBlock.addClass('vbs-no-header');
                }
            }
            else {
                VB.api.addEmptyMessageForNews('not_found');
            }
            console.log('news:\n', data);
        },
        addEmptyMessageForNews: function(mode){
            var message = '';
            if(mode === 'not_found') {
                message = 'News are not founded';
            }
            else if(mode === 'empty') {
                message = 'Please select a keyword';
            }
            var empty_message = VB.templates.parse('vbs-empty-news', {
                message: message
            });
            VB.helper.find('.vbs-news-block').find('.vbs-news-wrapper').html(empty_message);
        },
        call: function(parameters, callback, args) {
            args = typeof args != 'undefined' ? args : false;
            if (!this.inited)
                this.init();

            var ie9 = (VB.helper.isIe() === 9);

            jQuery.ajax({
                url: VB.settings.apiUrl,
                type: 'GET',
                data: parameters,
                dataType: (ie9) ? "jsonp" : "json"
            }).done(function( json ) {
                callback(json, args);
            }).fail(function(jqxhr, textStatus, error) {
                console.log(jqxhr);
            });

        },
        callPost: function(parameters, callback, args) {
            args = typeof args != 'undefined' ? args : false;

            var ie9 = (VB.helper.isIe() === 9);

            jQuery.ajax({
                url: VB.settings.apiUrl,
                type: 'POST',
                data: parameters,
                dataType: (ie9) ? "jsonp" : "json"
            }).done(function( json ) {
                callback(json, args);
            }).fail(function(jqxhr, textStatus, error) {
                console.log(jqxhr);
            });
        },
        callCustom: function(url, parameters, callback, args) {
            args = typeof args != 'undefined' ? args : false;

            var ie9 = (VB.helper.isIe() === 9);

            jQuery.ajax({
                url: url,
                type: 'POST',
                data: parameters,
                dataType: (ie9) ? "jsonp" : "json"
            }).done(function( json ) {
                callback(json, args);
            }).fail(function(jqxhr, textStatus, error) {
                console.log(jqxhr);
            });
        },
        setErrors: function(data){
            if(data.requestStatus == 'FAILURE'){
                VB.api.errors.failure++;
            }
            else if(data.response && data.response.fileStatus == 'PROCESSING'){
                VB.api.errors.processing++;
            }
            else if(data.fileStatus == 'PROCESSING'){
                VB.api.errors.processing++;
            }
        }
    };

    return VB;
})(voiceBase, jQuery);