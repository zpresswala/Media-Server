/*
* VB.view
* */
voiceBase = (function(VB, $) {
    "use strict";

    VB.view = {
        main: null,
        pluginDiv: null,
        init: function(elem) {
            this.initMainElem(elem);
            if(!VB.settings.hasPlaylist && !VB.settings.localApp){ // else initializing after player ready event
                this.initApi();
            }
            if(VB.helper.isMobile()) {
                VB.helper.renderMobile();
            }
        },
        initMainElem: function(elem){
            this.main = (elem[0].tagName === 'OBJECT' && VB.settings.playerType == 'jwplayer') ? $(elem).parent() : elem;
            var divnode = document.createElement('div');
            divnode.className = 'vbsp-' + VB.helper.randId() + ' vbs-content';
            divnode.innerHTML = VB.templates.get('mainDiv');
            this.pluginDiv = $(divnode);
            $(this.main).after(this.pluginDiv);
        },
        initApi: function(){
            VB.api.init();
            if (!VB.settings.token && !VB.settings.example && !VB.settings.localApp) {
                VB.api.getToken(VB.settings.tokenTimeOut);
            } else if (VB.settings.example && !VB.settings.localApp) {
                VB.api.getExampleToken();
            } else {
                VB.view.initWithToken();
            }
        },
        initWithToken: function() {
            VB.data.vclass = 'vbs-' + VB.helper.randId();
            $('.vbs-white-popup-overlay').remove();
            $('.vbs-text-error-message').remove();
            VB.view.renderMediaBlock();
            if(!VB.settings.localApp){
                VB.api.getMetaData();
            }
            else {
                VB.api.setLocalMetaData();
            }

            VB.view.renderControlsBlock();

            if(VB.settings.showKeywordsBlock){
                VB.view.renderKeywordsBlock();
                if(!VB.settings.localApp && !VB.helper.isApi2_0()) {
                    VB.api.getKeywords();
                }
            }
            else{
                VB.api.ready.keywords = true;
            }

            if(VB.settings.showTranscriptBlock){
                VB.view.renderTranscriptBlock();
                if(!VB.settings.localApp && !VB.helper.isApi2_0()) {
                    VB.api.getTranscript();
                }
            }
            else{
                VB.api.ready.transcript = true;
            }

            if(VB.settings.showCommentsBlock){
                VB.view.renderCommentsBlock();
                if(!VB.helper.isApi2_0()) {
                    VB.comments.getComments();
                }
            }
            else{
                VB.api.ready.comments = true;
            }

            if(VB.settings.localApp) {
                VB.view.renderLanguageBlock();
            }

            if(VB.settings.showNewsBlock){
                VB.view.renderNewsBlock();
            }

            if(VB.settings.tabView){
                VB.view.renderTabs();
            }

            checkToggleBlocks();
            checkHeaderVisibility();

            VB.data.waiter = setInterval(function() {
                if(VB.data.waiter) {
                    VB.helper.waitReady();
                }
            }, 100);
            VB.events.registerEvents();
        },
        initLocalData: function(){
            var lang_code = VB.data.localData.selected_language;

            var $keywordsBlock = $("#" + VB.settings.keywordsBlock);
            var $transcriptBlock = $("#" + VB.settings.transcriptBlock);
            if(!VB.data.localData.keywords) {
                YSP.api.getKeywords(function(data){
                    VB.data.localData.keywords = data.keywords;
                    $keywordsBlock.removeClass('vbs-loading');
                    VB.api.setKeywords(VB.data.localData.keywords[VB.data.localData.selected_language]);
                });
            }
            else{
                VB.api.setKeywords(VB.data.localData.keywords[lang_code]);
            }

            if(!VB.data.localData.transcripts) {
                YSP.api.getTranscript(function(data){
                    VB.data.localData.transcripts = data.transcripts;
                    $transcriptBlock.removeClass('vbs-loading');
                    VB.api.setTranscript(VB.data.localData.transcripts[VB.data.localData.selected_language]);
                });
            }
            else{
                VB.api.setTranscript(VB.data.localData.transcripts[lang_code]);
            }
        },
        renderControlsBlock: function(){
            var $controlsBlock = $("#" + VB.settings.controlsBlock);
            $controlsBlock.empty().html(VB.templates.get('vbs-controls')).addClass(VB.data.vclass + ' vbs-controls').css({width: VB.settings.controlsWidth});
            VB.view.setResponsiveClass($controlsBlock);
            if(!VB.settings.showControlsBlock) {
                $controlsBlock.addClass('vbs-hide-controls');
            }
        },
        renderMediaBlock: function(){
            var $mediaBlock = $("#" + VB.settings.mediaBlock);
            $mediaBlock.empty().html(VB.templates.parse('vbs-media')).addClass(VB.data.vclass).css({width: VB.settings.mediaWidth});
            VB.view.setResponsiveClass($mediaBlock);
        },
        renderTimeInMediaTitle: function(){
            var $mediaBlock = $("#" + VB.settings.mediaBlock);

            var timestring = VB.helper.parseTime(VB.data.duration); // in seconds
            VB.helper.find('.vbs-ftime').text(timestring);
            if($mediaBlock.hasClass('less-600px') || !VB.settings.hasMediaBlockHeader) {
                $('.vbs-time-in-player').find('.vbs-time').show();
            }
            else {
                $mediaBlock.find('.vbs-section-header').find('.vbs-time').show();
            }

        },
        renderKeywordsBlock: function(){
            var $keywordsBlock = $("#" + VB.settings.keywordsBlock);
            var $controlsBlock = $("#" + VB.settings.controlsBlock);

            if(!VB.settings.searchBarOuter){ // search bar in keywords block
                $keywordsBlock.empty().html(VB.templates.parse('vbs-keywords', {styles: 'height: ' + VB.settings.keywordsHeight + 'px;'})).addClass(VB.data.vclass).css({width: VB.settings.keywordsWidth});
                VB.view.setResponsiveClass($keywordsBlock);
            }
            else{
                $('#vbs-searchbar-block').remove();
                var searchBar_container = $("#" + VB.settings.searchBarBlock);
                if(searchBar_container.length > 0) {
                    searchBar_container.empty().append(VB.templates.parse('vbs-searchbar-outer'));
                }
                else {
                    $controlsBlock.after(VB.templates.parse('vbs-searchbar-outer'));
                }
                var searchBarBlock = $('#vbs-searchbar-block');
                searchBarBlock.addClass(VB.data.vclass).css({width: VB.settings.searchBarBlockWidth});
                $keywordsBlock.empty().html(VB.templates.parse('vbs-keywords', {styles: 'height: ' + VB.settings.keywordsHeight + 'px;'})).addClass(VB.data.vclass).css({width: VB.settings.keywordsWidth});
                $keywordsBlock.find('.vbs-search-form').addClass('no_border');
            }
            if(VB.settings.markersInNativeTimeline) {
                VB.view.renderControlsAfterSearchBar();
            }
            if(VB.settings.localApp) {
                $keywordsBlock.addClass('vbs-local-app vbs-loading');
                $keywordsBlock.find('.vbs-section-title').attr('data-title', 'Loading keywords');
            }
        },
        renderControlsAfterSearchBar: function() {
            if(VB.settings.searchBarOuter) {
                var searchBarBlock = $('#vbs-searchbar-block');
                searchBarBlock.addClass('vbs-controls-after-searchbar vbs-searchbar-outer');
                $('.vbs-after-controls-wrapper').remove();
                searchBarBlock.find('.vbs-search-form').after(VB.templates.get('controlsContainer'));
                $('.vbs-prev-btn,.vbs-next-action-btn').appendTo('.vbs-controls-after-searchbar .vbs-player-control');
                $('.vbs-share-btn-wrapper').appendTo('.vbs-controls-after-searchbar .vbs-share-control');
                searchBarBlock.find('.vbs-search-form').width(searchBarBlock.width() - $('.vbs-controls-after-searchbar .vbs-after-controls-wrapper').width()  - 2);
            }
            else {
                var $keywordsBlock = $('.vbs-keywords-block ');
                var $searchForm = $('.vbs-search-form');
                if($keywordsBlock.find('.vbs-section-btns').length === 0) {
                    $searchForm.after('<div class="vbs-section-btns"><ul></ul></div>');
                }
                var $sectionBtns = $keywordsBlock.find('.vbs-section-btns');
                $sectionBtns.find('.vbs-controls-after-searchbar').remove();
                $sectionBtns.addClass('vbs-controls-after-searchbar-wrapper').find('ul').append('<li class="vbs-controls-after-searchbar vbs-searchbar-inner"></li>');
                $sectionBtns.find('.vbs-controls-after-searchbar').append(VB.templates.get('controlsContainer'));
                $('.vbs-prev-btn,.vbs-next-action-btn').appendTo('.vbs-controls-after-searchbar-wrapper .vbs-player-control');
                $('.vbs-share-btn-wrapper').appendTo('.vbs-controls-after-searchbar-wrapper .vbs-share-control');
                $searchForm.removeClass('vbs-one-btn vbs-no-btns');
                if(VB.settings.vbsButtons.evernote && typeof filepicker !== 'undefined') {
                    $searchForm.addClass('vbs-four-btns');
                }
                else {
                    $searchForm.addClass('vbs-three-btns');
                }
            }
        },
        resetControlsPlace: function() {
            $('.vbs-controls-after-searchbar').find('.vbs-prev-btn').appendTo('.vbs-record-player .vbs-player-control');
            $('.vbs-controls-after-searchbar').find('.vbs-next-action-btn').appendTo('.vbs-record-player .vbs-player-control');
            $('.vbs-search-form').removeClass('vbs-four-btns vbs-three-btns');
            $('.vbs-volume-toolbar').after($('.vbs-controls-after-searchbar').find('.vbs-share-btn-wrapper'));
            if(VB.settings.searchBarOuter) {
                $('.vbs-search-form').width(295);
            }
        },
        renderTabs: function(){
            var $keywordsBlock = $("#" + VB.settings.keywordsBlock);
            var $tabs = $('.vbs-tabs-view');
            VB.view.setResponsiveClass($tabs);
            if(!$tabs.hasClass('less-600px') && !$tabs.hasClass('less-480px')) {
                $tabs.addClass('vbs-normal-width');
            }

            var $tabs_links = $('.vbs-tabs-links');
            $tabs_links.find('a').removeClass('vbs-active');
            $tabs_links.find('[data-href=".vbs-keywords-block"]').addClass('vbs-active');
            $keywordsBlock.find('.vbs-keywords-block').addClass('vbs-tab-visible');
        },
        checkEmptyHeadersForTabs: function(){
            var $tabs = $('.vbs-tabs-view');
            if(!$tabs.hasClass('vbs-normal-width')) {
                $('.vbs-tab').each(function(){
                    var $header = $(this).find('.vbs-section-header');
                    var has_speaker = ($(this).hasClass('vbs-keywords-block') && $header.find('.vbs-no-speaker').length === 0) ? true : false;
                    if(!has_speaker && $header.find('.vbs-section-btns').length === 0) {
                        $(this).addClass('vbs-tab-empty-header');
                    }
                });
            }
        },
        renderTranscriptBlock: function(){
            var $transcriptBlock = $("#" + VB.settings.transcriptBlock);
            $transcriptBlock.addClass(VB.data.vclass).empty().html(VB.templates.get('vbs-transcript')).css({width: VB.settings.transcriptWidth});
            VB.view.setResponsiveClass($transcriptBlock);
            if(VB.settings.localApp) {
                $transcriptBlock.addClass('vbs-local-app vbs-loading');
                $transcriptBlock.find('.vbs-section-title').attr('data-title', 'Loading transcript');
            }
        },
        renderCommentsBlock: function(){
            var $commentsBlock = $("#" + VB.settings.commentsBlock);
            $commentsBlock.addClass(VB.data.vclass).empty().html(VB.templates.get('vbs-comments')).css({width: VB.settings.commentsWidth});
            VB.view.setResponsiveClass($commentsBlock);
        },
        renderNewsBlock: function(){
            var $newsBlock = $("#" + VB.settings.newsBlock);
            $newsBlock.addClass(VB.data.vclass).empty().html(VB.templates.get('vbs-news')).css({width: VB.settings.newsWidth});
            VB.view.setResponsiveClass($newsBlock);
            if(VB.settings.expandNewsBlock) {
                VB.helper.expandNewsBlock();
            }
            else {
                VB.helper.collapseNewsBlock();
            }
        },
        renderLanguageBlock: function(){
            if(VB.data.localData.languages && VB.data.localData.languages.length > 0){
                var $mediaBlock = $("#" + VB.settings.mediaBlock);
                var $controls = $mediaBlock.find('.vbs-section-header .vbs-section-btns');
                $controls.after(VB.templates.get('languageSelect'));
                var $languageSelect = $mediaBlock.find('.vbs-select-language-wrapper');

                var english = [];
                var sem = '';
                for (var i = 0; i < VB.data.localData.languages.length; i++) {
                    var lang = VB.data.localData.languages[i];
                    var lang_code = Object.keys(lang)[0];
                    var lang_name = lang[lang_code];
                    var lang_obj = {
                        lang_code: lang_code,
                        lang_name: lang_name
                    };
                    sem += VB.templates.parse('languageItem', lang_obj);
                    if(lang_code.indexOf('en') === 0){
                        english.push(lang_obj);
                    }
                }
                $languageSelect.find('.vbs-select-dropdown').html(sem);
                if(english.length > 0){
                    VB.view.selectLanguage(english[0]);
                }
                else {
                    VB.view.selectLanguage(VB.data.localData.languages[0]);
                }
            }
        },
        selectLanguage: function(lang_obj){
            var $langTitle = $('.vbs-select-language-wrapper').find('.vbs-select-language');
            var lang_code = lang_obj.lang_code;
            $langTitle.removeClass('vbs-s-show').html(lang_obj.lang_name).attr(lang_code);
            VB.data.localData.selected_language = lang_code;
            VB.view.initLocalData();
        },
        checkResponsive: function(){
            var blocks = [
                $("#" + VB.settings.controlsBlock),
                $("#" + VB.settings.mediaBlock),
                $("#" + VB.settings.keywordsBlock),
                $("#" + VB.settings.transcriptBlock),
                $("#" + VB.settings.commentsBlock),
                $("#" + VB.settings.newsBlock)
            ];
            blocks.forEach(function($block){
                VB.view.setResponsiveClass($block);
            });
        },
        setResponsiveClass: function($block){
            if ($block.width() < VB.settings.mediumResponsive && $block.width() >= VB.settings.minResponsive) {
                $block.addClass('less-600px');
            } else if ($block.width() < VB.settings.minResponsive) {
                $block.addClass('less-600px').addClass('less-460px');
            }
        },
        initAfterSaveTranscript: function() {
            // Keyword clear
            VB.api.ready.keywords = false;
            VB.helper.find('.vbs-keywords-block .vbs-topics').html('');
            VB.helper.find('.vbs-keywords-block .vbs-keywords-list-tab').html('');
            VB.helper.find('.vbs-select-speaker-wrapper .vbs-select-dropdown').html('');
            VB.helper.find('.vbs-search-form').addClass('vbs-no-speaker');
            VB.data.speakers = {};
            // Transcript clear
            VB.api.ready.transcript = false;
            VB.helper.find('.vbs-transcript-block').removeClass('vbs-human').removeClass('vbs-with-order-btn');
            VB.helper.find('.vbs-transcript-block .vbs-transcript-wrapper').html('').removeClass('vbs-turntimes');
            VB.helper.find('.vbs-speakers').html('').removeClass('vbs-machine');
            VB.helper.find('.vbs-media-block .vbs-section-title, .vbs-time-name-wrapper-narrow').removeClass('vbs-machine');
            // ReInit
            VB.api.getKeywords();
            VB.api.getTranscript();
        },
        searchWordWidget: function(words) {
            if(words.length > 0) {
                var wrapper = VB.helper.find('.vbs-search-word-widget');
                var $voice_search_txt = VB.helper.find('#vbs-voice_search_txt');
                $voice_search_txt.css("opacity", "0");
                VB.helper.find('#vbs-search-string').show();
                var markers_string = "";
                for (var i in words) {
                    var tmpcolor = '';
                    if (i > 7) {
                        tmpcolor = '#' + ('000000' + (Math.random() * 0xFFFFFF << 0).toString(16)).slice(-6);
                    } else {
                        tmpcolor = VB.settings.colors[i];
                    }
                    markers_string += " " + VB.templates.parse('searchWordTemplate', {
                        'word': words[i],
                        'clean_word': words[i].replace(/"/g, ''),
                        'color': tmpcolor
                    }, 'span');
                }
                wrapper.html(markers_string);
                if (VB.data.searcht && VB.settings.editKeywords && $voice_search_txt.data('data-val') == $voice_search_txt.val()) {
                    VB.helper.checkKeyword(words, VB.data.searcht, VB.data.searchHits);
                }
                if($voice_search_txt.data('data-val') != $voice_search_txt.val()) {
                    VB.data.searcht = null;
                    VB.data.searchHits = null;
                }
                VB.helper.updateQuotesVisibility();
                VB.helper.startScroll();
            }
        },
        markerWidget: function(times, phrases, color) {
            var wrapper = VB.data.markersStyles.markersWrapper;
            var markers_div = VB.data.markersStyles.markersContainer;
            var wrapperWidth = VB.data.markersStyles.markersWrapperWidth;
            var markers_string = "";
            if (typeof (color) === 'undefined' || color === null) {
                color = VB.settings.colors[0];
            }
            if (typeof (phrases) === 'undefined' || phrases === null) {
                phrases = null;
            }
            for (var i in times) {
                var position = (times[i] * wrapperWidth) / VB.data.duration;
                var phrase = typeof (phrases[i]) == 'undefined' ? '' : phrases[i];
                phrase = VB.common.unEscapeHtml(phrases[i]);
                markers_string += " " + VB.templates.parse('markerTemplate', {
                    'position': position,
                    'time': times[i],
                    'stcolor': color,
                    'phrase': phrase
                });
            }
            return markers_string;
        },

        showCustomMarkers: function () {
            var wrapper = VB.helper.find('.vbs-record-timeline-wrap');
            var markers_div = $('.vbs-custom-markers');

            if(markers_div.find('.vbs-custom-marker').length === 0) {
                var wrapperWidth = wrapper.width();
                var markers = VB.data.customMarkers;
                var customMarkers = "";

                for (var time in markers) {
                    var position = (time * wrapperWidth) / VB.data.duration;
                    var phrase = markers[time];
                    phrase = VB.common.unEscapeHtml(phrase);
                    customMarkers += " " + VB.templates.parse('customMarkerTemplate', {
                        'position': position,
                        'time': time,
                        'stcolor': '#aaa',
                        'phrase': phrase
                    });
                }

                markers_div.append(customMarkers);
            }
            markers_div.show();
        },

        hideCustomMarkers: function () {
            var markers_div = $('.vbs-custom-markers');
            markers_div.hide();
        },

        /*
        * Methods from Panda OS. Integrate keywords markers to native kaltura timelime
        * */
        markerWidgetForNativeTimeline: function(){
            var duration = VB.data.duration;
            var origMarkers = $('.vbs-markers').find('.vbs-marker');
            var $playerIframe = VB.PlayerApi.getPlayerIframe();
            VB.view.clearScrubberOfMarks();

            $.each(origMarkers, function (k, origMarker){
                var markerTime = $(origMarker).attr('stime');
                var markerColor = $(origMarker).css('border-bottom-color');
                var leftPx = $(origMarker).css('left');
                var left = (markerTime / duration) * 100;
                VB.view.createScruberMark('vb_scrubber_mark' + k , markerColor, left, 10, 'keyword-marks keyword-mark-' + k);

                var origPhraseBar = $('span[ctime="' +  markerTime + '"]');
                if (typeof origMarker != 'undefined'){
                    VB.view.createPhraseBar('vb_scrubber_mark' + k , origPhraseBar.text());
                } else {
                    console.log('Keyword phrase-bar not found for ' + markerTime);
                }
            });
        },
        clearScrubberOfMarks: function(){
            var $playerIframe = VB.PlayerApi.getPlayerIframe();
            $playerIframe.find('.keyword-marks').remove();
            $playerIframe.find('.vb-keyphrase').remove();

        },
        createScruberMark: function(elemId, color, left, width, classes){
            var $playerIframe = VB.PlayerApi.getPlayerIframe();

            var $currentTimeMarkElem = $playerIframe.find('.playHead');
            var $markerElem = $playerIframe.find('#' + elemId);
            if($markerElem.length > 0) {
                $markerElem.css('left', left + '%');
            }
            else {
                width = (typeof width !== 'undefined') ? width : 10;
                color = (typeof color !== 'undefined') ? color : '#dddddd';

                var $scrubberElm = $playerIframe.find('.scrubber');
                var height = $scrubberElm.height();
                $markerElem = jQuery('<a class="scrubber-marker ' + classes + '"></a>');
                VB.view.setMarkerCss($markerElem, height, left, color, elemId, width);
                $currentTimeMarkElem.after($markerElem);
            }
        },
        createPhraseBar: function(markerElemId, content){
            var $playerIframe = VB.PlayerApi.getPlayerIframe();

            var phraseElem = $('<span class="vb-keyphrase" style="display: none;">' + content + '</span>');
            phraseElem.css({
                'position': 'absolute',
                'text-align': 'center',
                'width': '100%',
                'height': '17px',
                'padding-top': '3px',
                'margin-top': '-20px',
                'background-color': '#EDF0F8',
                'border-radius': '2px',
                'color': '#333',
                'font-family': 'Helvetica, Arial, sans-serif',
                'font-size': '13px',
                'z-index': 99
            }).attr('sourcemarker', markerElemId);

            $playerIframe.find('.controlBarContainer').prepend(phraseElem);

            $playerIframe.find('#' + markerElemId).mouseenter(function(){
                $playerIframe.find('span[sourcemarker=' + this.id + ']').show();
            });

            $playerIframe.find('#' + markerElemId).mouseleave(function(){
                $playerIframe.find('span[sourcemarker=' + this.id + ']').hide();
            });

        },
        setMarkerCss: function($markerElem, height, left, color, elemId, width){
            $markerElem.css({
                'border-top-width': height,
                'border-top-style': 'solid',
                'border-top-color': color,
                'left': left + '%',
                'position': 'absolute',
                'border-left-width': width / 2,
                'border-left-style': 'solid',
                'border-left-color': 'transparent',
                'border-right-width': width / 2,
                'border-right-style': 'solid',
                'border-right-color': 'transparent',
                'z-index': 99
            }).attr('id', elemId);
        },
        /*
        * END of Panda OS methods
        * */


        keywordHover: function(times) {
            if(times === '') {
                return false;
            }
            var wrapper = VB.helper.find('.vbs-record-timeline-wrap');
            var markers_string = '';
            times = times.split(",");
            for (var i in times) {
                var position = ((parseFloat(times[i])) * wrapper.width()) / VB.data.duration;
                markers_string += " " + VB.templates.parse('markerKeyTemplate', {
                    'position': position,
                    'time': parseFloat(times[i])
                });
            }
            VB.helper.find('.vbs-markers-hovers').html(markers_string);
        },
        removeKeywordHover: function() {
            VB.helper.find('.vbs-markers-hovers').html("");
        },
        favorite: function(opt) {
            if (opt)
                VB.helper.find(".vbs-star-btn").addClass('vbs-active').attr('data-tile', 'Remove from Favorites');
            else
                VB.helper.find(".vbs-star-btn").removeClass('vbs-active').attr('data-tile', 'Add from Favorites');
            return opt;
        },
        favoriteToggle: function() {
            VB.helper.find(".vbs-star-btn").toggleClass('vbs-active');
            return true;
        },
        resizeTimelineElements: function() {
            // Markers
            var wrapperWidth = VB.helper.find('.vbs-record-timeline-wrap').width();
            var duration = VB.data.duration;
            VB.helper.find('.vbs-markers a').each(function() {
                var $this = $(this);
                var markerTime = $this.attr('stime');
                var position = (markerTime * wrapperWidth) / duration;
                $this.css('left', position);
            });
            VB.speakers.resizeSpeakers();
            VB.comments.resizeCommentsTWidget();

            VB.helper.startScroll();
        },
        tooltips: function() {
            /* tooltips*/
            $('.vbs-tooltip').remove();
            $('body').append('<span class="vbs-tooltip"></span>');
            $('[data-title]').each(function() {
                var $this = $(this);
                var $vbsTooltip = $('.vbs-tooltip');
                $this.hover(
                    function() {
                        $vbsTooltip.stop(true, true).hide();
                        var title = $this.attr('data-title');
                        $vbsTooltip.text(title);

                        var pos = VB.view.getPositionElementForTooltip($this);
                        var tooltipWidth = parseInt($vbsTooltip.css('width')) + 20;
                        var tooltipHeight = 34; // height of tooltip

                        var calculatedOffset = {
                            top: (pos.top > tooltipHeight) ? pos.top - tooltipHeight : pos.top + pos.height + 8, // 8 - height of arrow
                            left: pos.left + pos.width / 2 - tooltipWidth / 2
                        };

                        $vbsTooltip.css({
                            "top": calculatedOffset.top + "px",
                            "left": calculatedOffset.left + "px"
                        });

                        if(pos.top > tooltipHeight) {
                            $vbsTooltip.removeClass('vbs-arrow-on-top');
                        } else {
                            $vbsTooltip.addClass('vbs-arrow-on-top');
                        }

                        $vbsTooltip.stop(true, true).fadeIn(100);
                    }, function() {
                        $vbsTooltip.stop(true, true).fadeOut(100);
                    }
                );
            });
        },
        getPositionElementForTooltip: function($element){
            var elRect = $element[0].getBoundingClientRect();
            var elOffset  = $element.offset();
            var scroll = { scroll: $element.scrollTop() };

            var $body = $('body');
            var bodyOffset = {
                top: 0,
                left: 0
            };
            if($body.css('position') === 'absolute' || $body.css('position') === 'relative' || $body.css('position') === 'fixed'){
                bodyOffset = $body.offset();
            }
            var pos = $.extend({}, elRect, scroll, elOffset);
            pos.top -= bodyOffset.top;
            pos.left -= bodyOffset.left;

            return pos;
        },
        hideTooltips: function() {
            $('.vbs-tooltip').hide();
        }
    };

    function hideToggleArrows($block){
        $block.find('.vbs-section-title').addClass('vbs-no-toggle');
    }

    function checkToggleBlocks(){
        if(!VB.settings.toggleBlocks) {
            $('.vbs-section-title').addClass('vbs-no-toggle');
        }
        else {
            if(!VB.settings.toggleMediaBlock){
                hideToggleArrows($("#" + VB.settings.mediaBlock));
            }
            if(!VB.settings.toggleKeywordsBlock){
                hideToggleArrows($("#" + VB.settings.keywordsBlock));
            }
            if(!VB.settings.toggleTranscriptBlock){
                hideToggleArrows($("#" + VB.settings.transcriptBlock));
            }
            if(!VB.settings.toggleCommentBlock){
                hideToggleArrows($("#" + VB.settings.commentsBlock));
            }
            if(!VB.settings.toggleNewsBlock){
                hideToggleArrows($("#" + VB.settings.newsBlock));
            }
        }
    }

    function checkHeaderVisibility(){
        var $mediaBlock = $("#" + VB.settings.mediaBlock);
        var $keywordsBlock = $("#" + VB.settings.keywordsBlock);
        var $transcriptBlock = $("#" + VB.settings.transcriptBlock);
        var $commentsBlock = $("#" + VB.settings.commentsBlock);

        if(!VB.settings.hasMediaBlockHeader){
            $mediaBlock.hide();
        }
        if(!VB.settings.hasKeywordsBlockHeader){
            $keywordsBlock.find('.vbs-keywords-block').addClass('vbs-no-header');
        }
        if(!VB.settings.hasTranscriptBlockHeader){
            $transcriptBlock.find('.vbs-transcript-block').addClass('vbs-no-header');
        }
        if(!VB.settings.hasCommentsBlockHeader){
            $commentsBlock.find('.vbs-comments-block').addClass('vbs-no-header');
        }
    }

    return VB;
})(voiceBase, jQuery);