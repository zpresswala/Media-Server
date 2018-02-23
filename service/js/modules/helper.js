/*
* VB.helper
* */
voiceBase = (function(VB, $) {
    "use strict";

    VB.helper = {
        isRand: !1,
        randConstant: null,
        css: '',
        randId: function() {
            if (!this.isRand && !this.randConstant) {
                this.isRand = !0;
                this.randConstant = this.rand();
            }
            return this.randConstant;
        },
        rand: function() {
            return Math.ceil(Math.random() * 1e9);
        },
        loadCss: function(filename) {
            if (this.css.indexOf("[" + filename + "]") == -1) {
                this.css += "[" + filename + "]";
                var fileref = document.createElement("link");
                fileref.setAttribute("rel", "stylesheet");
                fileref.setAttribute("type", "text/css");
                fileref.setAttribute("href", filename);
                if (typeof fileref != "undefined") {
                    document.getElementsByTagName("head")[0].appendChild(fileref);
                }
            }
        },
        find: function(param) {
            return $('.' + VB.data.vclass + ' ' + param);
        },
        findc: function(param) {
            return $('.' + VB.data.vclass + '' + param);
        },
        showLoader: function() {
            var $timeline_wrap = VB.helper.find('.vbs-record-timeline-wrap');
            if (VB.settings.animation && $timeline_wrap.has('.vbs-loader')) {
                $timeline_wrap.prepend('<div class="vbs-loader"></div>');
            }
        },
        hideLoader: function() {
            VB.helper.find('.vbs-record-timeline-wrap .vbs-loader').fadeOut('fast', function() {
                $(this).remove();
            });
        },
        removeBold: function() {
            VB.helper.find('.vbs-keywords-list-wrapper .vbs-keywords-list-tab li a.bold').removeClass('bold');
        },
        termFor: function(string, type) {
            var ar = string.split(',');
            var nar = [];
            for (var i in ar) {
                if (ar[i].match(/\s+/g)) {
                    nar.push('"' + ar[i] + '"');
                } else {
                    nar.push(ar[i]);
                }
            }
            if (typeof type !== 'undefined' && type == 'url') {
                return nar.join(' ');
            }
            return nar;
        },
        parseTime: function(seconds) {
            var hours = Math.floor(seconds / 3600) + "";
            var minutes = Math.floor(seconds % 3600 / 60) + "";
            var _seconds = Math.floor(seconds % 3600 % 60) + "";
            return (hours.padLeft(2) + ":" + minutes.padLeft(2) + ":" + _seconds.padLeft(2));
        },
        getSearchWordsArray: function() {
            var words = VB.helper.find('#vbs-voice_search_txt').val().trim();
            words = VB.helper.matchWords(words);
            words = (words) ? words : [];
            return words;
        },
        matchWords: function(text){
            text = VB.helper.checkQuotes(text);
            text = text.replace(/""/g, '"');
            return text.match(/("[^"]+")+|[\S]+/ig); // 0-9_.,'-
        },
        checkQuotes: function(text){
            // search redundant quotes
            var quotes_pos = [];
            var search_end = false;
            var pos = -1;
            while(!search_end) {
                pos = text.indexOf('"', pos + 1);
                if(pos !== -1) {
                    quotes_pos.push(pos);
                }
                else {
                    search_end = true;
                }
            }

            if(quotes_pos.length % 2 !== 0) {
                // we have a redundant quote.
                if(quotes_pos.length === 1) {
                    text += '"';
                }
                else if(quotes_pos.length >= 3) {
                    // We must add a quote after the second last quote
                    var second_last_quote_pos = quotes_pos[quotes_pos.length - 2];
                    var text_before_second_last_quote =  text.substring(0, second_last_quote_pos + 1);
                    var text_after_second_last_quote =  text.substring(second_last_quote_pos + 1);
                    text = text_before_second_last_quote + ' "' + text_after_second_last_quote;
                }
            }
            return text;
        },
        keywordsAutoTopicsColumns: function(col) {
            col = typeof col !== 'undefined' ? col : 5;
            var $kw = VB.helper.find('.vbs-keywords-list-wrapper');
            var _this = this;
            if (col === 0)
                return false;
            $kw.removeClass(_this.getColumnClassByNumber(col + 1)).addClass(_this.getColumnClassByNumber(col));
            $kw.find('ul.vbs-active li').each(function() {
                if ($(this).height() > 18) {
                    _this.keywordsAutoTopicsColumns(col - 1);
                    return false;
                }
            });
        },
        keywordsAutoColumns: function(col) {
            col = typeof col !== 'undefined' ? col : 5;
            var $kw = VB.helper.find('.vbs-keywords-list-wrapper');
            var _this = this;
            if (col === 0) {
                $kw.removeClass('vbs-auto-columns');
                return false;
            } else {
                $kw.addClass('vbs-auto-columns');
            }
            $kw.removeClass(this.getColumnClassByNumber(col + 1)).
                addClass(this.getColumnClassByNumber(col));
            $kw.find('ul li').each(function() {
                if ($(this).height() > 18) {
                    _this.keywordsAutoColumns(col - 1);
                    return false;
                }
            });
            $kw.removeClass('vbs-auto-columns');
        },
        getColumnClassByNumber: function(number) {
            switch (number) {
                case 1:
                    return 'vbs-one-col';
                case 2:
                    return 'vbs-two-col';
                case 3:
                    return 'vbs-three-col';
                case 4:
                    return 'vbs-four-col';
                case 5:
                    return 'vbs-five-col';
                default:
                    return '';
            }
        },
        filterKeywords: function(speaker_key) {
            VB.settings.filterSpeaker = speaker_key;
            var $list_li = VB.helper.find('.vbs-topics .vbs-topics-list li');
            $list_li.removeClass('vbs-disabled');
            $list_li.find('a').each(function() {
                var $thistopic = $(this);
                if (speaker_key == 'all') {
//                    $thistopic.parent().show();
                } else {
                    if ($thistopic.is('[speakers*="' + speaker_key + '"]')) {
//                        $thistopic.parent().show();
                    } else {
                        $thistopic.parent().addClass('vbs-disabled');
                    }
                    $thistopic.attr('t', $thistopic.attr('data-spt-' + speaker_key));
                }
            });

            VB.helper.find('.vbs-keywords-list-wrapper .vbs-keywords-list-tab li a').each(function() {
                var $this = $(this);
                $this.parent().removeClass('key');
                if (speaker_key == 'all') {
                    $this.parent().addClass('key').show();
                    var st = [];
                    for (var sp in VB.data.speakers) {
                        if (typeof $this.attr('data-spt-' + sp) != 'undefined') {
                            st.push($this.attr('data-spt-' + sp));
                        }
                    }
                    $this.attr('t', st.join());
                } else {
                    if ($this.is('[speakers*="' + speaker_key + '"]')) {
                        $this.parent().addClass('key').show();
                    } else {
                        $this.parent().hide();
                    }
                    $this.attr('t', $this.attr('data-spt-' + speaker_key));
                }
            });
            var active = VB.helper.find('.vbs-topics .vbs-topics-list li.vbs-active');
            if(active.is(':hidden')) {
                var li = VB.helper.find('.vbs-topics-list li.vbs-all-topics');
                li.parent().find('.vbs-active').removeClass('vbs-active');
                li.addClass('vbs-active');
                var catName = li.find('a').text().trim();
                VB.helper.find(".vbs-keywords-list-tab ul").removeClass('vbs-active');
                VB.helper.find('.vbs-keywords-list-tab ul[tid="' + catName + '"]').addClass('vbs-active');
            }

            if (VB.helper.find('#vbs-voice_search_txt').val().trim().length > 0) {
                VB.helper.find('.vbs-markers').html('');
                VB.helper.find(".vbs-next-action-btn:not([class='vbs-next-notactive'])").addClass('vbs-next-notactive');
                VB.api.getSearch([VB.helper.find('#vbs-voice_search_txt').val().trim()], false);
            }
            if(VB.settings.keywordsCounter) {
                VB.helper.find('.vbs-keywords-list-tab li a').each(function() {
                    var $this = $(this);
                    var t = $this.attr('t');
                    $this.parent().find('span').html('(' + t.split(",").length + ')');
                });
            }
        },
        setUtterance: function(utterances){
            var marker_sem = '';
            var checkbox_sem = '';
            var utterances_length = utterances.length;
            for (var i = 0; i < utterances_length; i++) {
                var utt = utterances[i];
                var segments = utt.segments;
                var seg_length = segments.length;
                for (var j = 0; j < seg_length; j++) {
                    var segment = segments[j];
                    var startPosition = VB.PlayerApi.getOffset(segment.s);
                    var endPosition = VB.PlayerApi.getOffset(segment.e);
                    var segment_width = endPosition - startPosition;
                    var timeLabel = VB.helper.parseTime(segment.s) + ' to ' + VB.helper.parseTime(segment.e);

                    var tooltip_chars_max_length = 65;
                    var title = segment.u.substr(0, tooltip_chars_max_length-3) + "..."; // multiline ellipsis

                    marker_sem += VB.templates.parse('utteranceMarker', {
                        startTime: segment.s,
                        rownum: i + 1,
                        width: segment_width,
                        position: startPosition,
                        title: title,
                        time: timeLabel
                    });
                }

                checkbox_sem += VB.templates.parse('utteranceCheckBox', {
                    rownum: i + 1,
                    title: utt.name,
                    segmentsCount: segments.length
                });
            }
            VB.helper.find('.vbs-utterance-markers').empty().append(marker_sem);
            if(checkbox_sem){
                var utteranceBlock = VB.templates.get('utteranceBlock');
                $("#" + VB.settings.controlsBlock).after($(utteranceBlock));
                $('.vbs-utterance-block').addClass(VB.data.vclass).find('ul').append(checkbox_sem);
            }
        },
        downloadFile: function(type) {
            var params = VB.api.parameters;
            params.action = 'getTranscript';
            params.content = true;
            params.format = type;
            var url = VB.settings.apiUrl + '?' + VB.common.getStringFromObject(params);
            window.location = url;
        },
        getNewUrl: function(urlparams) {
            var query = window.location.search.substring(1),
                vars = query.split('&'),
                opt = {},
                np = [];
            if (query.length > 0) {
                var vars_length = vars.length;
                for (var i = 0; i < vars_length; i++) {
                    var pair = vars[i].split('=');
                    if (pair[0] != 'vbt' && pair[0] != 'vbs') {
                        opt[pair[0]] = pair[1];
                        for (var params in urlparams) {
                            if (decodeURIComponent(pair[0]) == params) {
                                opt[pair[0]] = urlparams[params];
                            }
                        }
                    }
                }
            }
            for (var sh in VB.settings.shareParams) {
                if (typeof opt[sh] == 'undefined') {
                    opt[sh] = VB.settings.shareParams[sh];
                }
            }
            for (var key in urlparams) {
                if (typeof opt[key] == 'undefined') {
                    opt[key] = urlparams[key];
                }
            }
            for (var p in opt) {
                np.push(p + "=" + opt[p]);
            }
            return VB.settings.shareUrl ? VB.settings.shareUrl + '?' + np.join('&') : window.location.origin + window.location.pathname + '?' + np.join('&');
        },
        checkAutoStart: function() {
            var query = window.location.search.substring(1);
            var urlparams = ["vbt", "vbs"];
            var vars = query.split('&');
            var rt = {};
            var vars_length = vars.length;
            for (var i = 0; i < vars_length; i++) {
                var pair = vars[i].split('=');
                for (var params in urlparams) {
                    if (decodeURIComponent(pair[0]) == urlparams[params]) {
                        rt[urlparams[params]] = pair[1];
                    }
                }
            }
            VB.data.startParams = rt;
            return false;
        },
        waitReady: function() {
            if (VB.api.ready.keywords && VB.api.ready.metadata && VB.api.ready.transcript && VB.api.ready.comments) {

                clearInterval(VB.data.waiter);
                VB.data.waiter = null;
                VB.helper.checkErrors();
                VB.speakers.speakersWidget();
                if (Object.keys(VB.data.speakers).length > 1) {
                    VB.speakers.speakerFilterWidget(VB.data.speakers, 'all');
                }

                VB.comments.commentsTWidget();
                if (VB.settings.editKeywords) {
                    $(".vbs-keywords-block .vbs-topics").addClass('vbs-edit-topics');
                }
                if (!$('.vbs-media-block').hasClass('.less-600px')) {
                    $('.vbs-record-player .vbs-time-name-wrapper-narrow').css({'opacity': 0});
                }
                if(VB.settings.playerType === 'jwplayer' && VB.api.response.metadata !== null && !VB.settings.hasPlaylist) {
                    if(VB.helper.isApi2_0() && VB.settings.stream) {
                        var streamUrl = VB.settings.apiUrl + VB.settings.mediaId + '/streams/original?' + VB.settings.token;
                        VB.PlayerApi.loadFile(streamUrl);
                    }
                    else {
                        if (VB.PlayerApi.getRenderingMode() != "html5" && VB.settings.stream == 'rtmp') {
                            var rtmp = VB.api.response.metadata.response.rtmpUrl + "" + VB.api.response.metadata.response.rtmpFile;
                            VB.PlayerApi.loadFile(rtmp);
                        } else
                        if (VB.settings.stream === 'http' || VB.settings.stream === true) {
                            VB.PlayerApi.loadFile(VB.api.response.metadata.response.streamUrl);
                        }
                    }
                }
                if (VB.data.startParams !== false) {
                    this.autoStart(VB.data.startParams);
                }
                if(VB.api.response.keywords && VB.api.response.keywords.utterances){
                    VB.helper.setUtterance(VB.api.response.keywords.utterances);
                }

                VB.view.checkEmptyHeadersForTabs();
                VB.view.tooltips();
                VB.methods.ready();
            }
            return false;
        },
        waitReadyAfterSave: function() {
            if (VB.api.ready.keywords && VB.api.ready.metadata && VB.api.ready.transcript && VB.api.ready.comments) {
                clearTimeout(VB.data.waiterSave);
                VB.data.waiterSave = null;
                if(VB.settings.modalSave) {
                    var $popup_wrap = VB.helper.find('.vbs-save-popup-wrapper');
                    $popup_wrap.find('.vbs-save-loading-popup').fadeOut('fast');
                    $popup_wrap.find('.vbs-save-done-popup').fadeIn('fast');
                }
                else {
                    VB.helper.clearSavingMessages();
                    $('#' + VB.settings.controlsBlock).after(VB.templates.get('successSavingMessage'));
                    setTimeout(function() {
                        VB.helper.clearSavingMessages();
                    }, 3000);
                }

                setTimeout(function(){
                    if(VB.settings.modalSave) {
                        VB.helper.exitEditFullscreen();
                    }
                    VB.helper.checkErrors();
                    VB.speakers.speakersWidget();
                    VB.comments.commentsTWidget();
                    VB.view.tooltips();
                }, 800);
            }
            return false;
        },
        exitEditFullscreen: function() {
            $('#' + VB.settings.transcriptBlock).appendTo('#transcript_placement').unwrap();
            VB.helper.find('.vbs-edit-mode-prewrapper').html("");
            $('body').removeClass('vbs-no-scroll');
        },
        autoStart: function(params) {
            var played;
            if (typeof params['vbs'] != 'undefined') {
                VB.helper.find('.vbs-markers').html('');
                VB.helper.find(".vbs-next-action-btn:not([class='vbs-next-notactive'])").addClass('vbs-next-notactive');
                var words = decodeURI(params['vbs']).trim();
                words = VB.helper.matchWords(words);
                words = words ? words : [];
                var stringWords = words.join(' ');
                VB.helper.find('#vbs-voice_search_txt').val(stringWords).data('data-val', stringWords).change();
                if (words.length) {
                    VB.view.searchWordWidget(words);
                }
                var autoStart = true;
                if (typeof params['vbt'] != 'undefined') {
                    autoStart = false;
                    played = params['vbt'];
                    VB.PlayerApi.seek(played);
                }
                VB.api.getSearch(words, autoStart);
                return false;
            }
            else if (typeof params['vbt'] != 'undefined') {
                played = params['vbt'];
                VB.PlayerApi.seek(played);
            }
        },
        moveToNextMarker: function (markersContainer) {
            var lastmarker = true;
            var timesAr = [];
            var $links = markersContainer.find('a');
            $links.each(function() {
                timesAr.push(parseFloat($(this).attr('stime')));
            });
            timesAr.sort(function(a, b) {
                return parseInt(a, 10) - parseInt(b, 10);
            });
            for (var eltm in timesAr) {
                if (timesAr[eltm] > VB.PlayerApi.getPosition() + 1) {
                    VB.PlayerApi.seek(timesAr[eltm]);
                    lastmarker = false;
                    return false;
                }
            }
            // Loop markers
            if (lastmarker && $links.length) {
                VB.PlayerApi.seek(timesAr[0]);
            }
        },
        moveToPrevMarker: function (markersContainer) {
            var lastmarker = true;
            var timesAr = [];
            var $links = markersContainer.find('a');
            $links.each(function() {
                timesAr.push(parseFloat($(this).attr('stime')));
            });
            timesAr.sort(function(a, b) {
                return parseInt(b, 10) - parseInt(a, 10);
            });
            for (var eltm in timesAr) {
                if (timesAr[eltm] < VB.PlayerApi.getPosition() - 1) {
                    VB.PlayerApi.seek(timesAr[eltm]);
                    lastmarker = false;
                    return false;
                }
            }
            // Loop markers
            if (lastmarker && $links.length) {
                VB.PlayerApi.seek(timesAr[0]);
            }
        },
        startScroll: function() {
            var $marquee = VB.helper.find("#vbs-search-string .vbs-marquee");
            if($marquee.is(':visible')) {
                var $search_word_widget = $marquee.find(".vbs-search-word-widget");
                $search_word_widget.stop(true).css("left", 0);
                var words_width = 0;
                VB.helper.find(".vbs-word").width(function(i, w) {
                    words_width += w;
                });
                if (words_width > $marquee.width()) {
                    $search_word_widget.width(words_width);
                    VB.helper.scrollStringLeft();
                }
                else{
                    $search_word_widget.width($('#vbs-search-string').width());
                }
            }
        },
        scrollStringLeft: function() {
            var words_count = VB.helper.find(".vbs-word").length,
                words_animate_duration = words_count * 1200;
            var $marquee = VB.helper.find("#vbs-search-string .vbs-marquee");
            var $search_word_widget = $marquee.find(".vbs-search-word-widget");
            $search_word_widget.animate({"left": ($marquee.width()) - ($search_word_widget.width())}, {
                    duration: words_animate_duration,
                    complete: function() {
                        VB.helper.scrollStringRight();
                    }
                }
            );
        },
        scrollStringRight: function() {
            var words_count = VB.helper.find(".vbs-word").length,
                words_animate_duration = words_count * 1200;
            VB.helper.find("#vbs-search-string .vbs-marquee .vbs-search-word-widget").animate({"left": "1"}, {
                    duration: words_animate_duration,
                    complete: function() {
                        VB.helper.scrollStringLeft();
                    }
                }
            );
        },
        getMaxKeywordHeight: function() {
            var vTopics = VB.helper.find('.vbs-topics-list').height();
            var vKeywords = VB.helper.find('.vbs-keywords-list-tab ul.vbs-active').height() + 10;
            return vTopics > vKeywords ? vTopics : vKeywords;
        },
        getKeywordHeight: function() {
            var vTopics = $('.vbs-topics').height();
            var vKeywords = $('.vbs-keywords-list-tab').height() + 10;
            return vTopics > vKeywords ? vTopics : vKeywords;
        },
        checkKeyword: function(terms, times, hits) {
            var foradd = [];
            VB.helper.find('#vbs-search-string .vbs-search-word-widget .vbs-word a.vbs-add-search-word').remove();
            terms = VB.common.uniqueArray(terms);
            for (var ti in terms) {
                var term = VB.helper.replaceTrimAndLower(terms[ti]);
                if (!VB.common.findTermInArray(VB.data.keywords, term)) {
                    var ntTimes = [];
                    for (var hit in hits) {
                        if(hits[hit].term == term){
                            hits[hit].hits.map(function(hit) {
                                ntTimes = ntTimes.concat(hit.time);
                            });
                        }
                    }
                    if(ntTimes.length > 0) {
                        var plus = $('<a href="#add" class="vbs-add-search-word" title="Add to all topics"></a>');
                        plus.data('data-kwa', terms[ti]);
                        plus.data('data-kwt', ntTimes.join(','));
                        VB.helper.find('#vbs-search-string .vbs-search-word-widget .vbs-word').each(function(){
                            var word = $(this).find('.vbs-search_word').text();
                            if(word === terms[ti]) {
                                $(this).append(plus);
                            }
                        });
                    }
                }
            }
        },
        localSearch: function(elem, terms) {
            if(terms.length > 1) {
                VB.api.getSearch(terms);
                return false;
            }
            var allTimes = [];
            var colors = [];
            VB.helper.find('.vbs-widget .vbs-word').each(function(key, marker) {
                var $marker = $(marker);
                var word = $marker.find('.vbs-search_word').text().replace(/"/g, '').toLowerCase();
                colors[word] = $marker.find('.vbs-marker').css('border-bottom-color');
            });

            var times = [];
            var timesArray = elem.attr('t').split(",");
            var phrases = [];

            timesArray.map(function(time) {
                if (VB.speakers.filterResultForSpeaker(time)) {
                    times = times.concat(time);
                    phrases = phrases.concat(VB.helper.getPhraseByTime(time-1000, time + 1500, terms));
                }
            });
            var wrapper = VB.helper.find('.vbs-record-timeline-wrap');

            VB.data.markersStyles = {
                markersWrapper: wrapper,
                markersContainer: wrapper.find('.vbs-markers'),
                markersWrapperWidth: wrapper.width()
            };

            var markers_string = VB.view.markerWidget(times, phrases, colors[terms]);
            VB.data.markersStyles.markersContainer.append(markers_string);

            allTimes = allTimes.concat(times);
            allTimes.sort(function(a, b) {
                return a - b;
            });
            VB.PlayerApi.seek(allTimes[0]);
        },
        getPhraseByTime: function(startTime, endTime, term) {
            var phrase = '';
            var $words = VB.helper.find('.vbs-transcript-wrapper > span > span:wordtime(' + (startTime * 1000) + ',' + (endTime * 1000) + ')');
            phrase = VB.helper.getTextFromElems($words);
            if(typeof Fuse != 'undefined') {
                var wordsArray = phrase.split(' ');
                var termLength = term.split(' ').length;
                var wordCollocationsArray = [];
                if(termLength > 1) {
                    for (var i = 0; i < wordsArray.length; i++) {
                        var _w = '';
                        for (var j = 0; j < termLength; j++) {
                            if(wordsArray[i + j]) {
                                _w += wordsArray[i + j] + ' ';
                            }
                        }
                        wordCollocationsArray.push(_w.trim());
                    }
                }
                else {
                    wordCollocationsArray = wordsArray;
                }
                var fuseModel = new Fuse(wordCollocationsArray, {threshold: 0.4});
                var fuse_result = fuseModel.search(term);
                var result = (fuse_result.length > 0) ? fuse_result[0] : null;
                if(result !== null) {
                    phrase = '';
                    for (var k = 0; k < wordCollocationsArray.length; k++) {
                        var w = wordCollocationsArray[k];
                        w = w.split(' ')[0];
                        if(k >= result && k <= result + termLength - 1) {
                            w = '<b>' + w + '</b>';
                        }
                        phrase += w + ' ';
                    }
                }
            }
            return phrase;
        },
        getTextFromElems: function($elems) {
            var text = '';
            $elems.each(function() {
                if(!$(this).attr('m')) { // if no speaker elem
                    var thistext = $(this).text();
                    thistext = VB.helper.replaceAndTrim(thistext);
                    if (thistext !== '' && !thistext.match(/\w+/g)) {
                        text += thistext;
                    }
                    else if(thistext !== '' ) {
                        text += (text === '') ? thistext : ' ' + thistext;
                    }
                }
            });
            return text;
        },
        highlight: function(position) {
            var curtime = Math.round(position);
            if (curtime == 1) {
                curtime = 0;
            }
            var nc = Math.floor(curtime / VB.settings.transcriptHighlight);
            curtime = nc * VB.settings.transcriptHighlight;
            var $transcript_block = VB.helper.find('.vbs-transcript-block');
            var $transcript_wrapper = $transcript_block.find('.vbs-transcript-wrapper');
            var $transcript_prewrapper = $transcript_block.find('.vbs-transcript-prewrapper');

            $transcript_wrapper.children('span').removeClass('vbs-hl');
            $transcript_wrapper.children('span:wordtime(' + curtime + ',' + (curtime + VB.settings.transcriptHighlight - 1) + ')').addClass('vbs-hl');
            var spanhl = $transcript_wrapper.children('span.vbs-hl').length ? $transcript_wrapper.children('span.vbs-hl') : false;
            var transcripttext = $transcript_prewrapper.length ? $transcript_prewrapper : false;
            if (spanhl && transcripttext) {
                $transcript_prewrapper.not('.vbs-t-hover').stop(true, true).animate({
                    scrollTop: spanhl.offset().top - transcripttext.offset().top + transcripttext.scrollTop() - (transcripttext.height() - 20) / 2
                }, 500);
            }
            if ($('body').hasClass('vbs-readermode') && $transcript_prewrapper.not('.vbs-t-hover').length) {
                transcripttext = $transcript_block.length ? $transcript_block : false;
                if (spanhl && transcripttext) {
                    $transcript_block.stop(true, true).animate({
                        scrollTop: spanhl.offset().top - transcripttext.offset().top + transcripttext.scrollTop() - (transcripttext.height() - 20) / 2
                    }, 500);
                }
            }
        },
        /*
        * Set background for highlight snippets
        * @param {Boolean} isShow - flag for showing or hiding background-xolor for snippets
        * */
        manageHighlightSnippets: function (isShow) {
            var snippets = VB.data.highlightSnippets;
            var $transcript_wrapper = VB.helper.find('.vbs-transcript-wrapper');

            for (var i = 0; i < snippets.length; i++) {
                var snippet = snippets[i];
                var $words = $transcript_wrapper.find('.vbs-trans-word:wordtime(' + snippet.startTime * 1000 + ',' + snippet.endTime  * 1000 + ')');
                $words.each(function () {
                    var color = (isShow) ? snippet.color : '';
                    $(this).css('background-color', color);
                });
            }
        },
        track: function(event, args){
            args = typeof args != 'undefined' ? args : false;
            if (typeof ga !== 'undefined' && VB.settings.trackEvents) {
                switch (event) {
                    case ('play'):
                        ga('send', 'event', VB.settings.mediaId, 'Play', VB.PlayerApi.getPosition());
                        return true;
                    case ('pause'):
                        ga('send', 'event', VB.settings.mediaId, 'Pause', VB.PlayerApi.getPosition());
                        return true;
                    case ('seek'):
                        ga('send', 'event', VB.settings.mediaId, 'Seek', args);
                        return true;
                    case ('keyword'):
                        ga('send', 'event', VB.settings.mediaId, 'Keyword', args);
                        return true;
                    case ('transcript'):
                        ga('send', 'event', VB.settings.mediaId, 'Transcript', args);
                        return true;
                    default:
                        return false;
                }
            }
            return false;
        },
        editTranscriptText: function(){
            var dt = VB.api.response.transcript.transcript,
                transpart = '',
                lt = 0,
                last = 0;
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

                var sptag = VB.speakers.createSpeakerAttr(val);

                var word = VB.helper.replaceN(val.w);
                transpart += val.w.match(/\w+/g) ? '<span class="w vbs-wd ' + (sptag.length ? 'vbs-edit-speaker':'') + '" t="' + val.s + '" ' + sptag + '> ' + word + '</span>' : '<span class="vbs-wd" t="' + val.s + '" ' + sptag + '>' + word + '</span>';
            }
            transpart += '</span>';
            return transpart;
        },
        isTurn: function(turnProperty){
            return typeof turnProperty !== "undefined" && turnProperty == "turn";
        },
        getClearWordFromTranscript: function(word){
            return VB.helper.replaceAndTrim(word).replace(/:$/, "");
        },
        showSaveQuestion: function() {
            var countSpeakersWords = $('.vbs-edit-speaker').length;
            var countEditWords = VB.helper.find('.vbs-edition-block').find('.w:not(".vbs-edit-speaker")').length;
            var countWords = $('.vbs-transcript-prewrapper').find('.w').length - countSpeakersWords;
            var $popup = $('.vbs-save-popup');
            $popup.removeClass('vbs-long-edit vbs-short-edit');
            if(countEditWords > countWords && countEditWords > countWords / 5) {
                $popup.addClass('vbs-long-edit');
            }
            else if(countWords > countEditWords && countWords / 5 > countEditWords) {
                $popup.addClass('vbs-short-edit');
            }
            VB.helper.find('.vbs-save-popup-wrapper').fadeIn('fast');
        },
        saveTranscript: function() {
            var html = VB.helper.find('.vbs-edition-block').html();
            html = html.replace(/<br\s*[\/]?>/gi, "\n");
            html = html.replace(/\\n/, "\n");
            var div = document.createElement("div");
            div.innerHTML = html;
            var content = div.textContent || div.innerText || "";
            VB.api.saveTrancript(content.trim());

            var $save_popup_wrapper = VB.helper.find('.vbs-save-popup-wrapper');
            if(VB.settings.modalSave) {
                $save_popup_wrapper.find('.vbs-save-popup').fadeOut('fast');
                $save_popup_wrapper.find('.vbs-save-loading-popup').fadeIn('fast');
            }
            else {
                $save_popup_wrapper.fadeOut('fast');
                VB.helper.exitEditFullscreen();
            }
        },
        saveTranscriptComplete: function() {
            VB.helper.setIsSaving(false);
            VB.view.initAfterSaveTranscript();
            VB.data.waiterSave = setInterval(function() {
                if(VB.data.waiterSave) {
                    VB.helper.waitReadyAfterSave();
                }
            }, 100);
        },
        saveTranscriptError: function(message) {
            VB.helper.setIsSaving(false);
            if(VB.settings.modalSave) {
                var $popup_wrap = VB.helper.find('.vbs-save-popup-wrapper');
                $popup_wrap.find('.vbs-save-popup').show();
                $popup_wrap.find('.vbs-save-loading-popup').fadeOut('fast');
                $popup_wrap.fadeOut('fast');
                var errorTemplate = VB.templates.parse('abstractErrorPopup', {
                    errorTitle: 'Could not save transcript',
                    errorText: message
                });
                $('.vbsp-' + VB.helper.randId() + '.vbs-content').append(errorTemplate);
            }
            else {
                VB.helper.clearSavingMessages();
                var $errorMessage = VB.templates.parse('textErrorMessage', {
                    errorText: message
                });
                $('#' + VB.settings.controlsBlock).after($errorMessage);
            }
        },
        setIsSaving: function(val) {
            VB.data.isSaving = val;
            if(!VB.settings.modalSave) {
                if(val) {
                    $('.vbs-edit-btn').addClass('vbs-disable-button');
                    VB.helper.clearSavingMessages();
                    $('#' + VB.settings.controlsBlock).after(VB.templates.get('savingMessage'));
                }
                else {
                    $('.vbs-edit-btn').removeClass('vbs-disable-button');
                }
            }
        },
        clearSavingMessages: function() {
            $('.vbs-saving').remove();
            $('.vbs-success-saving').remove();
            $('.vbs-text-error-message').remove();
        },
        getIsSaving: function() {
            return VB.data.isSaving;
        },
        adjustMediaTime: function(){
            var $media_block = VB.helper.find('.vbs-media-block');
            var mediaTitle = $media_block.find('.vbs-section-title');
            var mediaBtns = $media_block.find('.vbs-section-btns');
            var mediaTitleRightCoord = mediaTitle.offset().left + mediaTitle.width();
            var mediaBtnsLeftCoord = mediaBtns.offset().left;

            if(mediaTitleRightCoord >= mediaBtnsLeftCoord){
                mediaTitle.find('.vbs-voice-name').hide();
                mediaTitle = $media_block.find('.vbs-section-title');
                mediaBtns = $media_block.find('.vbs-section-btns');
                mediaTitleRightCoord = mediaTitle.offset().left + mediaTitle.width();
                mediaBtnsLeftCoord = mediaBtns.offset().left;

                if(mediaTitleRightCoord >= mediaBtnsLeftCoord){
                    mediaTitle.find('.vbs-time').hide();
                    if ($media_block.hasClass('vbs-video')){
                        var time = VB.helper.parseTime(VB.data.duration);
                        VB.helper.findc('.vbs-player-wrapper').append('<span class="vbs-time vbs-time-in-player"><span class="vbs-ctime">00:00:00</span> / <span class="vbs-ftime">' + time + '</span></span>');
                    }
                }
            }
        },
        checkErrors: function(){
            if(!VB.settings.modalErrors) {
                if (VB.api.errors.processing || VB.api.errors.failure) {
                    var errorText = 'File not indexed. Search, Keywords & Transcript are unavailable for this recording.';
                    if(VB.api.errors.processing) {
                        errorText = 'Could not load recording data, indexing file may not be complete. If reload does not solve problem contact support for assistance';
                    }
                    var $errorMessage = VB.templates.parse('textErrorMessage', {
                        errorText: errorText
                    });
                    $('#' + VB.settings.controlsBlock).after($errorMessage);
                }
            }
            else {
                var $content_block = $('.vbsp-' + VB.helper.randId() + '.vbs-content');
                if (VB.api.errors.processing) {
                    $content_block.append(VB.templates.get('reloadOverlayCredentials'));
                }
                else if(VB.api.errors.failure){
                    if(!VB.settings.tabView) {
                        $content_block.append(VB.templates.get('errorPopup'));
                    }
                    else {
                        $content_block.append(VB.templates.parse('abstractAlertPopup', {
                            errorTitle: 'File has not finishing processing yet',
                            errorText: 'Search, keywords, and transcript for this file are not available. If reloading does not solve the problem, please contact support for assistance.'
                        }));
                    }
                    var $bigErrorPopup = $content_block.find('.vbs-big-error-popup');
                    var bigErrorPopupHeight = parseInt($bigErrorPopup.css('height'));
                    $bigErrorPopup.css('marginTop', -bigErrorPopupHeight / 2);
                }
            }
        },
        debug: function() {
            var pstreamUrl = 'inited';
            if (VB.settings.stream == "rtmp") {
                pstreamUrl = VB.api.response.metadata.response.rtmpUrl + VB.api.response.metadata.response.rtmpFile;
            } else if (VB.settings.stream == "http" || VB.settings.stream === true) {
                pstreamUrl = VB.api.response.metadata.response.streamUrl;
            }

            var response = {
                type: VB.settings.playerType,
                mode: VB.PlayerApi.getRenderingMode(),
                inited: VB.instances.length,
                isStream: VB.settings.stream,
                streamUrl: pstreamUrl,
                mediaID: VB.settings.mediaId ? VB.settings.mediaId : VB.settings.externalId,
                statusMetaData: VB.api.response.metadata && VB.api.response.metadata.requestStatus ? VB.api.response.metadata.requestStatus : false,
                statusKeyword: VB.api.response.keywords && VB.api.response.keywords.requestStatus ? VB.api.response.keywords.requestStatus : false,
                statusTranscript: VB.api.response.transcript && VB.api.response.transcript.requestStatus ? VB.api.response.transcript.requestStatus : false,
                statusTranscriptFileStatus: VB.api.response.transcript && VB.api.response.transcript.fileStatus ? VB.api.response.transcript.fileStatus : false,
                statusComments: VB.api.response.comments && VB.api.response.comments.requestStatus ? VB.api.response.comments.requestStatus : false,
                browserAppVersion: navigator.appVersion,
                browserUserAgent: navigator.userAgent,
                browserPlatform: navigator.platform,
                browserUserLanguage: navigator.userLanguage,
                url: window.location.href
            };

            // send logs to loggly.com
            if(typeof _LTracker != 'undefined'){
                _LTracker.push(response);
            }

            var $logger = VB.helper.find('.vbs-logger');
            if($logger.length > 0){
                $logger.remove();
            }
            else{
                VB.helper.find('.vbs-record-player').after(VB.templates.parse('loggerBlock', {response: JSON.stringify(response)}));
                var $textarea = VB.helper.find('.vbs-logger textarea');
                $textarea.bind('focus', function() {
                    this.select();
                });
            }
            console.log(response);
        },
        replaceAndTrim: function(word){
            return word.replace(/<br\s*[\/]?>/gi, "").replace(/\n/gi, "").trim();
        },
        replaceN: function(word) {
            return word.replace(/\\n/g, "<br>").replace(/\n/g, "<br>");
        },
        replaceTrimAndLower: function (word) {
            return word.replace(/"/g, '').toLowerCase().trim();
        },
        collapseNewsBlock: function(){
            var $newsBlock = $("#" + VB.settings.newsBlock);
            if ($newsBlock.length > 0 && VB.settings.toggleBlocks && VB.settings.toggleNewsBlock) {
                var $sectionBody = $newsBlock.find('.vbs-section-body');
                $newsBlock.find('.vbs-section-title').addClass('vbs-hidden').attr('data-title', 'Show News');
                $newsBlock.find('.vbs-news-words-wrapper').hide();
                $sectionBody.slideUp();
            }
        },
        expandNewsBlock: function(){
            var $newsBlock = $("#" + VB.settings.newsBlock);
            if ($newsBlock.length > 0 && VB.settings.toggleBlocks && VB.settings.toggleNewsBlock) {
                var $sectionBody = $newsBlock.find('.vbs-section-body');
                $newsBlock.find('.vbs-section-title').removeClass('vbs-hidden').attr('data-title', 'Hide News');
                $newsBlock.find('.vbs-news-words-wrapper').show();
                $sectionBody.slideDown();
            }
        },
        updateQuotesVisibility: function(){
            if(VB.settings.vbsButtons.unquotes) {
                var $search_form = VB.helper.find(".vbs-search-form");
                var terms = VB.helper.getSearchWordsArray();
                var quotedTerms = terms.filter(function(_term){
                    return (_term.indexOf('"') === 0 && _term.lastIndexOf('"') === (_term.length - 1)); // if "many words"
                });
                if(quotedTerms.length > 0) {
                    $search_form.addClass('vbs-quoted');
                }
                else {
                    $search_form.removeClass('vbs-quoted');
                }
            }
        },
        removeQuotes: function(){
            var terms = VB.helper.getSearchWordsArray();
            var words = [];
            terms.forEach(function(_term){
                if(_term.indexOf('"') === 0 && _term.lastIndexOf('"') === (_term.length - 1)) { // if "many words"
                    _term = _term.replace(/"/g, "");
                    var inner_words = _term.split(' ');
                    inner_words.forEach(function(w){
                        words.push(w);
                    });
                }
                else {
                    words.push(_term);
                }
            });

            var stringWords = words.join(' ');
            VB.helper.find('#vbs-voice_search_txt').val(stringWords).data('data-val', stringWords);
            $('#vbs-search-form').submit();
        },
        clearIntervals: function(){
            clearInterval(VB.data.waiterSave);
            VB.data.waiterSave = null;
            if(VB.instances.length > 0 && VB.instances[VB.current_instance] && VB.instances[VB.current_instance].player) {
                clearInterval(VB.instances[VB.current_instance].player.find_player_interval);
                VB.instances[VB.current_instance].player.find_player_interval = null;
            }
            clearInterval(VB.events.time);
            VB.events.time = null;
            clearInterval(VB.data.waiter);
            VB.data.waiter = null;
            clearInterval(VB.data.metadataWaiter);
            VB.data.metadataWaiter = null;
        },
        isIe: function(){
            var myNav = navigator.userAgent.toLowerCase();
            return (myNav.indexOf('msie') != -1) ? parseInt(myNav.split('msie')[1]) : false;
        },
        isRetina: function(){
            var mediaQuery = "(-webkit-min-device-pixel-ratio: 1.5),\
            (min--moz-device-pixel-ratio: 1.5),\
            (-o-min-device-pixel-ratio: 3/2),\
            (min-resolution: 1.5dppx)";
            if (window.devicePixelRatio > 1){
                return true;
            }
            if (window.matchMedia && window.matchMedia(mediaQuery).matches) {
                return true;
            }
            return false;
        },
        isMobile: function(){
            if(VB.data.isMobile) {
                return VB.data.isMobile;
            }
            var check = false;
            (function(a,b){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od|ad)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4)))check = true;})(navigator.userAgent||navigator.vendor||window.opera);
            VB.data.isMobile = check;
            return check;
        },
        is_iDevice: function(){
            var check = false;
            (function (a, b) {
                if (/ip(hone|od|ad)/i.test(a)) check = true;
            })(navigator.userAgent || navigator.vendor || window.opera);
            return check;
        },
        renderMobile: function(){
            $('body').addClass('vbs-mobile');

            if(VB.helper.isRetina()) {
                $('body').addClass('vbs-retina');
            }
        },
        getMobileWidth: function(){
            var w = $('.vbs-content').width();
            return w;
            //return (VB.helper.is_iDevice()) ? window.innerWidth - 20 : screen.availWidth - 20;
        },
        setOnTimeInterval: function() {
            VB.events.time = setInterval(function() {
                if(VB.events.time) {
                    VB.events.onTime();
                }
            }, 250);
        },
        isMediaTypeEqualVideo: function() {
            var mediaOverride = VB.settings.mediaTypeOverride;
            if (mediaOverride) {
                return (mediaOverride === 'video');
            }
            if(VB.api.response) {
                var meta_response = VB.api.response.metadata;
                return !(meta_response && meta_response.response && meta_response.response.hasVideo === false);
            }
            else {
                return true;
            }
        },

        isApi2_0: function() {
            return VB.settings.apiVersion === '2.0';
        },

        clearMessage: function() {
            if(VB.settings.localSearch) {
                $('.vbs-message').remove();
                $('.vbs-text-error-message').remove();
            }
            else {
                $('.vbs-message').fadeOut();
                $('.vbs-text-error-message').fadeOut();
            }
        },

        /*
        * @param {string} text - message text
        * @param {string} mode - 'error' || 'info' || ' success'
        * */
        showMessage: function(text, mode) {
            VB.helper.clearMessage();
            var errorMessage = VB.templates.parse('infoMessage', {
                errorText: text,
                mode: mode
            });
            VB.helper.appendMessage(errorMessage);
        },

        appendMessage: function(msg) {
            if(VB.settings.searchBarOuter) {
                $('#' + VB.settings.searchBarBlock).before(msg);
            }
            else {
                $('#' + VB.settings.keywordsBlock).before(msg);
            }
        },

        checkScrollForResize: function($transcriptBody) {
            var $transcriptContent = $transcriptBody.find('.vbs-transcript-wrapper');
            if($transcriptBody.height() > $transcriptContent.height()) {
                $transcriptBody.find('.ui-resizable-se,.ui-resizable-e').addClass('vbs-no-scroll');
            }
            else {
                $transcriptBody.find('.ui-resizable-se,.ui-resizable-e').removeClass('vbs-no-scroll');
            }
        },

        setDeletedIdsInLocalStorage: function () {
            var deletedIds = VB.helper.getDeletedIdsInLocalStorage();
            deletedIds.push(VB.settings.mediaId);
            localStorage.setItem('vbs-deleted-ids', JSON.stringify(deletedIds));
        },

        getDeletedIdsInLocalStorage: function () {
            return JSON.parse(localStorage.getItem('vbs-deleted-ids')) || [];
        },

        clearUiForDeletedIds: function () {
            var deletedIds = VB.helper.getDeletedIdsInLocalStorage();
            var isDelete = deletedIds.filter(function (_id) {
                return _id === VB.settings.mediaId;
            });
            if(isDelete.length > 0) {
                $('.vbs-section-btns,.vbs-order-human-trans,.vbs-time').remove();
                $('.vbs-record-player').hide();
                VB.helper.showMessage('No such media file!', 'error');
                VB.PlayerApi.destroy();
            }
        },

        hasSpottedKeywordsInGroups: function () {
            var keywordsData = voiceBase.api.response.keywords;
            var groups = keywordsData.groups;
            var hasSpotted = false;
            for (var i = 0; i < groups.length; i++) {
                var group = groups[i];
                if(group.keywords.length > 0) {
                    hasSpotted = true;
                    break;
                }
            }
            return hasSpotted;
        },

        showAutoGeneratedKeywords: function () {
            var $keywordsWrapper = VB.helper.find('.vbs-keywords-wrapper');
            $keywordsWrapper.find('.vbs-keyword-message').remove();
            var $topics = $keywordsWrapper .find('.vbs-topics');
            var noVisibleTopics = $topics.hasClass('vbs-no-visible-topics');
            $topics.removeClass('vbs-no-visible-topics').find('.vbs-hidden-topic').removeClass('vbs-hidden-topic');
            if(noVisibleTopics) {
                $topics.find('li').first().click();
            }
        },

        hideAutoGeneratedKeywords: function () {
            var $keywordsWrapper = VB.helper.find('.vbs-keywords-wrapper');
            var $topics = $keywordsWrapper .find('.vbs-topics');
            $topics.find('li:not(.group)').addClass('vbs-hidden-topic');
            $topics.find('li').removeClass('vbs-active');
            var $groups = $topics.find('.group');
            if($groups.length > 0) {
                $groups.first().click();
            }
            else {
                $keywordsWrapper.find('.vbs-keywords-list-tab ul').removeClass('vbs-active');
                $topics.addClass('vbs-no-visible-topics');
                if($keywordsWrapper.find('.vbs-keyword-message').length === 0) {
                    var msg = VB.templates.parse('infoMessage', {
                        errorText: 'None of the specified keywords or phrases were spotted for this media file',
                        mode: 'error'
                    });
                    var errMsg = '<div class="vbs-keyword-message">' + msg + '</div>';
                    $keywordsWrapper.prepend(errMsg);
                }
            }
        }
    };

    return VB;
})(voiceBase, jQuery);