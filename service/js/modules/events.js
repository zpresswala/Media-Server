/*
* VB.events. Register events
* */
voiceBase = (function(VB, $) {
    "use strict";

    VB.events = {
        time: null,
        onTime: function() {
            if(VB.instances[VB.current_instance].player && VB.instances[VB.current_instance].player.interface){
                if (Math.round(VB.data.position) != Math.round(VB.PlayerApi.getPosition())) {
                    if (!VB.data.clicker) {
                        VB.helper.hideLoader();
                    }
                    if (VB.settings.transcriptHighlight !== false) {
                        VB.helper.highlight(VB.PlayerApi.getPosition());
                    }
                    VB.data.movelistner = false;
                }
                if(VB.data.position === VB.data.duration) { // end of file
                    VB.helper.hideLoader();
                }
                var position = VB.data.position = VB.PlayerApi.getPosition();

                if(VB.PlayerApi.getStatus() === 'PLAYING' && VB.PlayerApi.getDuration() !== -1) {
                    if(VB.data.duration !== VB.PlayerApi.getDuration()) {
                        VB.data.duration = VB.PlayerApi.getDuration();
                        VB.view.renderTimeInMediaTitle();
                    }
                }
                var duration = VB.data.duration;

                if (VB.data.dragging === false && VB.data.movelistner === false && typeof position !== 'undefined' && duration) {
                    VB.helper.find(".vbs-player-slider").css("left", position * 100 / duration + "%");
                    VB.helper.find(".vbs-record-progress").css("width", position * 100 / duration + "%");
                    var parsedTime = VB.helper.parseTime(position);
                    VB.helper.find(".vbs-ctime").html(parsedTime);
                    VB.comments.updateTimeInPopup(position);
                    VB.helper.find('.vbs-share-popup').find('.vbsp-time').attr('vbct', position).html(parsedTime); // time in share popup
                }
                if (!VB.data.clicker) {
                    if (VB.PlayerApi.getStatus() == "PAUSED") {
                        VB.helper.find(".vbs-player-control .vbs-play-btn").removeClass('vbs-playing').attr('data-title', "Play");

                    } else if (VB.PlayerApi.getStatus() == "PLAYING") {
                        VB.helper.find(".vbs-player-control .vbs-play-btn").addClass('vbs-playing').attr('data-title', "Pause");

                    }
                }
                if (VB.PlayerApi.getBuffer()) {
                    VB.helper.find(".vbs-record_buffer").css("width", VB.PlayerApi.getBuffer() + "%");
                }
                VB.speakers.speakerIsSpeaking();
            }
        },
        registerEvents: function() {
            // Media Events
            if(VB.settings.toggleBlocks && VB.settings.toggleMediaBlock){
                VB.helper.find(".vbs-media-block .vbs-section-title").off('touchstart click').on('click touchstart', function(e) {
                    e.preventDefault();
                    var $this = $(this);
                    $this.toggleClass('vbs-hidden');
                    if ($this.hasClass('vbs-hidden')) {
                        VB.data.playerHeight = VB.data.playerDom.height();
                        if(VB.settings.playerType == 'sublime' || VB.settings.playerType == 'video_js' || VB.settings.playerType == 'jplayer' || (VB.settings.playerType == 'jwplayer' && VB.PlayerApi.getRenderingMode() === 'html5')){
                            VB.data.playerDom.hide();
                        }
                        else{
                            VB.data.playerDom.css({height: '0px'});
                        }
                        VB.helper.find('.vbs-expand-btn').hide();
                        VB.helper.findc('.vbs-player-wrapper .vbs-time').hide();
                        if($this.parents('.vbs-media-block').hasClass('vbs-video')){
                            $('.vbs-tooltip').text('Show Video');
                        }
                        $this.attr('data-title', 'Show Video');
                    } else {
                        if(VB.settings.playerType == 'sublime' || VB.settings.playerType == 'video_js' || VB.settings.playerType == 'jplayer' || (VB.settings.playerType == 'jwplayer' && VB.PlayerApi.getRenderingMode() === 'html5')){
                            VB.data.playerDom.show();
                        }
                        else{
                            VB.data.playerDom.css({height: VB.data.playerHeight + 'px'});
                        }
                        VB.helper.find('.vbs-expand-btn').show();
                        VB.helper.findc('.vbs-player-wrapper .vbs-time').show();
                        if($this.parents('.vbs-media-block').hasClass('vbs-video')){
                            $('.vbs-tooltip').text('Hide Video');
                        }
                        $this.attr('data-title', 'Hide Video');
                    }
                });
            }

            // Timeline Events
            if (VB.settings.markersInNativeTimeline) {
                $(document).off("DOMSubtreeModified", ".vbs-markers").on("DOMSubtreeModified", ".vbs-markers", function (e) {
                    if (e.target.innerHTML.length > 0) {
                        VB.view.markerWidgetForNativeTimeline();
                    } else {
                        VB.view.clearScrubberOfMarks();
                    }
                });
            }

            VB.helper.find('.vbs-markers,.vbs-custom-markers').on('touchstart click', 'a.vbs-marker', function(e) {
                e.preventDefault();
                var stime = $(this).attr('stime');
                VB.PlayerApi.seek(stime);
                return false;
            });

            VB.helper.find('.vbs-comments-wrapper-block').on('touchstart click', '.vbs-comment-preview a', function(e) {
                e.preventDefault();
                VB.helper.collapseNewsBlock();
                var stime = $(this).attr('stime');
                VB.PlayerApi.seek(stime);
                return false;
            });

            // Play
            $("." + VB.data.vclass + " .vbs-player-control, ." + VB.data.vclass +" .vbs-edit-mode-prewrapper").on('touchstart click', ".vbs-play-btn", function(e) {
                e.preventDefault();
                var $this = $(this);
                var $vbs_tooltip = $('.vbs-tooltip');
                if (!$this.hasClass("vbs-playing")) {
                    VB.helper.track('play');
                    $this.addClass('vbs-playing').attr("data-title", "Pause");
                    $vbs_tooltip.text("Pause");
                    VB.helper.showLoader();
                    VB.PlayerApi.play();
                } else {
                    $this.removeClass('vbs-playing').attr("data-title", "Play");
                    VB.helper.track('pause');
                    $vbs_tooltip.text("Play");
                    VB.helper.hideLoader();
                    VB.PlayerApi.pause();
                }
                return false;
            });

            // Prev
            $(document).off('touchstart click', ".vbs-prev-btn").on('touchstart click', ".vbs-prev-btn", function(e) {
                e.preventDefault();
                var btime = VB.PlayerApi.getPosition() - 15;
                btime = btime < 0 ? 0.001 : btime;
                VB.PlayerApi.seek(btime);
                return false;
            });

            // Next Marker Btn
            VB.helper.find('.vbs-next-action-btn').on('touchstart click', function(event) {
                event.preventDefault();
                if(!$(this).hasClass('vbs-next-notactive')){
                    var $markersContainer = VB.helper.find('.vbs-record-timeline-wrap .vbs-markers');
                    VB.helper.moveToNextMarker($markersContainer);
                }
            });

            $(window).off('resize.vbs_resize').on('resize.vbs_resize', function() {
                VB.view.resizeTimelineElements();
                if(VB.helper.isMobile()) {
                    var mobile_sizes = VB.PlayerApi.getMobilePlayerSize();
                    VB.PlayerApi.setSizePlayer(mobile_sizes.mobile_width, mobile_sizes.mobile_height);
                    $("#" + VB.settings.mediaBlock).css('width', VB.helper.getMobileWidth());
                }
                VB.view.checkResponsive();
            });

            //// DRAG
            $(document).off("mousedown", ".vbs-record-timeline-wrap .vbs-dragger").on("mousedown", ".vbs-record-timeline-wrap .vbs-dragger", function(e) {
                e.preventDefault();
                var $this = $(this).parents('.vbs-record-timeline-wrap');
                if (e.button === 0) {
                    var tlw = 100 * (e.pageX - $this.offset().left) / $this.width();
                    VB.helper.find(".vbs-player-slider").css("left", tlw + "%");
                    VB.helper.find(".vbs-record-progress").css("width", tlw + "%");
                    VB.data.movelistner = true;
                    VB.data.dragging = true;
                }
            }).off("mousemove", ".vbs-record-timeline-wrap .vbs-dragger").on("mousemove", ".vbs-record-timeline-wrap .vbs-dragger", function(e) {
                e.preventDefault();
                var $this = $(this).parents('.vbs-record-timeline-wrap');
                var tlw = 100 * (e.pageX - $this.offset().left) / $this.width();
                if (tlw > 100) {
                    tlw = 100;
                } else
                if (tlw < 0) {
                    tlw = 0;
                }
                VB.data.played = Math.round(VB.data.duration * tlw / 100);
                if (VB.data.dragging) {
                    VB.helper.find(".vbs-player-slider").css("left", tlw + "%");
                    VB.helper.find(".vbs-record-progress").css("width", tlw + "%");
                    VB.helper.find(".vbs-ctime").html(VB.helper.parseTime(VB.data.played));
                    VB.helper.find('.vbs-share-popup .vbsp-time').html(VB.helper.parseTime(VB.data.played)).attr('vbct', VB.data.played);
                    VB.comments.updateTimeInPopup(null);
                }
            }).off('mouseup.vbs_mouseup').on('mouseup.vbs_mouseup', function() {
                if (VB.data.dragging) {
                    VB.PlayerApi.seek(VB.data.played);
                    VB.helper.track('seek', VB.data.played);
                    VB.helper.find('.vbs-share-popup .vbsp-time').html(VB.helper.parseTime(VB.data.played)).attr('vbct', VB.data.played);
                    VB.comments.updateTimeInPopup(null);
                    if (VB.helper.find('#vbs-share-position').is(':checked')) {
                        var newparam = {};
                        newparam['vbt'] = VB.data.played;
                        var url = VB.helper.getNewUrl(newparam);
                        $('#vbsp-url').val(url);
                        if (typeof addthis !== 'undefined') {
                            addthis.update('share', 'url', url);
                        }
                    }
                }
                VB.data.dragging = false;
//            VB.data.movelistner = false;
            });

            // Hover on markers
            VB.helper.find(".vbs-markers,.vbs-custom-markers").on({
                mouseover: function(e) {
                    VB.helper.find('[ctime="' + $(e.target).parent().attr('stime') + '"]').fadeIn(75);
                },
                mouseout: function(e) {
                    VB.helper.find('[ctime="' + $(e.target).parent().attr('stime') + '"]').fadeOut(100);
                }
            });

            // Click on utterance markers
            VB.helper.find(".vbs-utterance-markers").on('touchstart click', '.vbs-utter-marker', function(e){
                e.preventDefault();
                var stime = $(this).attr('data-stime');
                VB.PlayerApi.seek(stime);
                return false;
            });

            // Show/hide utterance marker
            $(document).off('change', '.vbs-utterance-block input[type=checkbox]').on('change', '.vbs-utterance-block input[type=checkbox]', function(){
                var utterance_num = $(this).attr('data-row');
                VB.helper.find(".vbs-utterance-markers").find('.vbs-utter-row' + utterance_num).toggle();
            });

            VB.helper.find('.vbs-volume-toolbar, .' + VB.data.vclass + ' .vbs-edit-mode-prewrapper').on('touchstart click', '.vbs-volume-btn', function(event) {
                event.preventDefault();
                var $this = $(this);
                var $volume_toolbar = VB.helper.find('.vbs-volume-toolbar-block');
                if ($this.hasClass('show')) {
                    $volume_toolbar.fadeOut('fast');
                    $this.removeClass('show');
                } else {
                    var vol = VB.PlayerApi.getVolume();
                    VB.PlayerApi.setUiVolume(vol);
                    $volume_toolbar.fadeIn(100);
                    $this.addClass('show');
                }
            });

            $(document).off("mousedown", ".vbs-volume-toolbar-block").on("mousedown", ".vbs-volume-toolbar-block", function(e) {
                var $this = $(this);
                if (e.button === 0) {
                    var vol = 100 - 100 * (e.pageY - $this.find('.vbs-volume-slider').offset().top) / $(this).height();
                    if (vol > 100) {
                        vol = 100;
                    } else
                    if (vol < 0) {
                        vol = 0;
                    }
                    VB.PlayerApi.setUiVolume(vol);
                    VB.PlayerApi.setVolume(vol);
                    VB.data.draggingVol = true;
                }
            }).off("mousemove", ".vbs-volume-toolbar-block").on("mousemove", ".vbs-volume-toolbar-block", function(e) {
                e.preventDefault();
                var $this = $(this);
                if (VB.data.draggingVol) {
                    var vol = 100 - 100 * (e.pageY - $this.find('.vbs-volume-slider').offset().top) / $(this).height();
                    if (vol > 100) {
                        vol = 100;
                    } else
                    if (vol < 0) {
                        vol = 0;
                    }
                    VB.PlayerApi.setUiVolume(vol);
                    VB.PlayerApi.setVolume(vol);
                }
            }).on('mouseup mouseleave', function() {
                VB.data.draggingVol = false;
            });

            //* Keywords Events *//
            VB.helper.find('.vbs-keywords-block').on('click touchstart', '.vbs-keywords-list-tab li a', function(e) {
                e.preventDefault();
                VB.data.keywordClickEvent = true;
                if(VB.PlayerApi.getStatus() == 'PLAYING'){
                    VB.PlayerApi.pause();
                }
                VB.helper.showLoader();
                var $this = $(this);
                VB.helper.find('.vbs-markers').html('');
                VB.helper.find(".vbs-next-action-btn:not([class='vbs-next-notactive'])").addClass('vbs-next-notactive');
                VB.helper.removeBold();

                var termstring = $this.data("keywordInternalName");
                var term = VB.helper.termFor(termstring, 'url');
                var markerterms = VB.helper.termFor(termstring, 'marker');

                VB.helper.find('#vbs-voice_search_txt').val(term).change();
                $this.addClass('bold');
                if (markerterms.length) {
                    VB.view.searchWordWidget(markerterms);
                }
                var $voice_search_txt = VB.helper.find('#vbs-voice_search_txt');
                $voice_search_txt.data('data-val', $voice_search_txt.val());
                VB.helper.track('keyword', termstring);
                VB.api.getSearch(markerterms);
/*
                if(VB.settings.localSearch) {
                    VB.api.getSearch(markerterms); // search with fuse.js
                }
                else {
                    VB.helper.localSearch($this, markerterms); // search by times which comes from server from getFileAnalyticsSnippets query
                }
*/

                VB.api.getNews();
                VB.data.keywordClickEvent = false;
                return false;
            });

            if(VB.settings.toggleBlocks && VB.settings.toggleKeywordsBlock){
                VB.helper.find(".vbs-keywords-block .vbs-section-title").on('touchstart click', function(e) {
                    e.preventDefault();
                    var $this = $(this);
                    $this.toggleClass('vbs-hidden');
                    var $parents_keywords = $this.parents('.vbs-keywords-block');
                    if ($this.hasClass('vbs-hidden')) {
                        $this.attr('data-title', 'Show Keywords');
                        $parents_keywords.find('.vbs-section-body').slideUp();
                        $parents_keywords.find('.vbs-search-form').hide();
                    } else {
                        $this.attr('data-title', 'Hide Keywords');
                        $parents_keywords.find('.vbs-section-body').slideDown();
                        $parents_keywords.find('.vbs-search-form').show();
                    }
                });
            }

            // Show/hide more keywords
            VB.helper.find(".vbs-keywords-block .vbs-more-btn a").on('touchstart click', function(e) {
                e.preventDefault();
                if (VB.settings.keywordsHeight > VB.helper.getMaxKeywordHeight()) {
                    VB.settings.keywordsHeight = VB.helper.getKeywordHeight();
                }
                var maxKH = '100%';
                VB.helper.find('.vbs-keywords-list-wrapper').css({height: maxKH});
                var $this = $(this);

                if (VB.data.kf) {
                    VB.data.kf = false;
                    $this.text('Show More...');
                    VB.helper.find(".vbs-keywords-wrapper").animate({height: VB.settings.keywordsHeight + "px"}, 700);
                } else {
                    VB.helper.find(".vbs-keywords-wrapper").animate({height: VB.helper.getMaxKeywordHeight() + "px"}, 700);
                    $this.text('Hide More...');
                    VB.data.kf = true;
                }
                return false;
            });

            $(document).off('touchstart click', '.vbs-widget em').on('touchstart click', '.vbs-widget em', function(e) {
                e.preventDefault();
                var _this = $(this);
                var vb_words = _this.find('.vbs_word');
                var searchInput = $('#vbs-voice_search_txt');
                var words = [];

                if (vb_words.length) {
                    $.each(vb_words, function(key, value) {
                        words.push($(value).find('.search_word').text());
                        $(value).remove();
                    });
                    searchInput.val(words.join(' '));
                }
                VB.helper.find('.vbs-widget-wrap').addClass('focused');
                searchInput.css("opacity", "1");
                VB.helper.find('#vbs-search-string').hide();
                searchInput.focus();
            });

            // Clear Searchbar
            VB.helper.find('#vbs-clear-string').on('touchstart click', function(e) {
                e.preventDefault();
                if ($(this).parents('.vbs-search-form').hasClass('vbs-filled')) {
                    VB.helper.collapseNewsBlock();
                    VB.PlayerApi.pause();
                    VB.helper.find('.vbs-markers, .vbs-search-word-widget').html('');
                    VB.helper.find(".vbs-next-action-btn:not([class='vbs-next-notactive'])").addClass('vbs-next-notactive');
                    VB.helper.find('#vbs-voice_search_txt').val('').change();
                    VB.helper.find('.vbs-kwe-add').remove();
                    VB.helper.find("#vbs-search-string .vbs-marquee .vbs-search-word-widget").stop(true).css("left", 0);
                }
                return false;
            });

            // KeyUp Searchbar
            VB.helper.find('#vbs-voice_search_txt').on('keyup', function(e) {
                var words = VB.helper.getSearchWordsArray();
                if (words.length) {
                    VB.helper.find('.vbs-powered-by-label').addClass('vbs-hidden-p');
                } else {
                    VB.helper.find('.vbs-powered-by-label').removeClass('vbs-hidden-p');
                }
            });

            // Blur Searchbar
            VB.helper.find('#vbs-voice_search_txt').on('blur', function(e) {
                var words = VB.helper.getSearchWordsArray();
                if (words.length) {
                    VB.view.searchWordWidget(words);
                    VB.helper.find('.vbs-powered-by-label').addClass('vbs-hidden-p');
                } else {
                    VB.helper.find('.vbs-markers, .vbs-search-word-widget').html('');
                    VB.helper.find(".vbs-next-action-btn:not([class='vbs-next-notactive'])").addClass('vbs-next-notactive');
                    VB.helper.find('.vbs-powered-by-label').removeClass('vbs-hidden-p');
                }
                var $this = $(this);
                $this.data('data-val', $this.val());
                VB.helper.find('.vbs-widget-wrap').removeClass('focused');
                VB.helper.find('#vbs-search-string').show();
            });

            // Change Searchbar
            VB.helper.find('#vbs-voice_search_txt').on('change', function() {
                var $this = $(this);
                VB.helper.removeBold();
                var $search_string = VB.helper.find('#vbs-search-string');
                if ($this.val().length > 0) {
                    VB.helper.find(".vbs-search-form").addClass('vbs-filled');
                } else {
                    VB.helper.find(".vbs-search-form").removeClass('vbs-filled');
                    $this.css("opacity", "1");
                    $search_string.hide();
                    VB.helper.find('#vbs-voice_search_txt').focus();
                }
                if ($('#vbs-share-search').is(':checked')) {
                    var newparam = {};
                    newparam['vbs'] = encodeURI($this.val());
                    var url = VB.helper.getNewUrl(newparam);
                    VB.helper.find('#vbsp-url').val(url);
                    if (typeof addthis !== 'undefined') {
                        addthis.update('share', 'url', url);
                    }
                }
                VB.helper.find('.vbs-kwe-add').remove();
                VB.helper.updateQuotesVisibility();
                $search_string.show();
            });

            VB.helper.find('#vbs-search-btn').on('touchstart click', function(event) {
                event.preventDefault();
                VB.helper.find('#vbs-search-form').submit();
            });

            VB.helper.find('#vbs-search-form').on('submit', function() {
                if($('#vbs-searchbar-block').find('.vbs-search-form').hasClass('vbs-form-disabled')) {
                    return false;
                }
                if(VB.PlayerApi.getStatus() == 'PLAYING'){
                    VB.PlayerApi.pause();
                }
                VB.helper.find("#vbs-voice_search_txt").blur();
                VB.helper.find('.vbs-markers').html('');
                VB.helper.find(".vbs-next-action-btn:not([class='vbs-next-notactive'])").addClass('vbs-next-notactive');
                VB.helper.find('.vbs-kwe-add').remove();
                var words = VB.helper.getSearchWordsArray();

                if (words.length > 0) {
                    VB.helper.showLoader();
                    VB.view.searchWordWidget(words);
                    VB.api.getSearch(words);
                }
                else {
                    VB.helper.updateQuotesVisibility();
                }
                return false;
            });

            $(document).off('touchstart click', ".vbs-unquote-btn").on('touchstart click', ".vbs-unquote-btn", function(e) {
                e.preventDefault();
                VB.helper.removeQuotes();
            });

            VB.helper.find('#vbs-search-string').on('touchstart click', function(e) {
                e.preventDefault();
                if ($(e.target).hasClass("vbs-search-word-widget") || VB.helper.find('#vbs-voice_search_txt').val().length === 0) {
                    $(this).hide();
                    VB.helper.find('#vbs-voice_search_txt').css("opacity", "1").focus();
                }
            });

            VB.helper.find(".vbs-topics").on('touchstart click', '.vbs-topics-list li[class="vbs-active"]', function(event) {
                event.preventDefault();
            });

            VB.helper.find(".vbs-topics").on('touchstart click', '.vbs-topics-list li[class!="vbs-active"]', function(event) {
                //event.preventDefault();
                var li = $(this);
                if (li.hasClass('vbs-active') || li.hasClass('vbs-disabled')) {
                    return false;
                }
                li.parent().find('.vbs-active').removeClass('vbs-active');
                li.addClass('vbs-active');
                var href = li.find('a');
                var catName = href.text().trim();
                VB.helper.find(".vbs-keywords-list-tab ul").removeClass('vbs-active');
                VB.helper.find('.vbs-keywords-list-tab ul[tid="' + catName + '"]').addClass('vbs-active');
                if (VB.settings.keywordsColumns == 'topics') {
                    VB.helper.keywordsAutoTopicsColumns();
                }
                if (VB.settings.editKeywords) {
                    $('.vbs-topic-delete-popup').fadeOut('fast', function() {
                        $(this).remove();
                    });
                }
                VB.speakers.filterSpeakersList(href.attr('speakers').split(','));
            });

            VB.helper.find(".vbs-keywords-list-tab").on('mouseenter touchstart', 'li.key a', function(e) {
                var target = $(e.target).is('span') ? $(e.target).parent() : $(e.target) ;
                var times = target.attr('t');
                VB.view.keywordHover(times);
            });

            VB.helper.find(".vbs-keywords-list-tab").on('mouseleave touchend', 'li.key a', function(e) {
                VB.view.removeKeywordHover();
            });

            if (VB.settings.topicHover === true) {
                VB.helper.find(".vbs-keywords-block").on({
                    mouseover: function(e) {
                        var catName = $(this).text().trim();
                        var timesArray = [];
                        VB.helper.find('.vbs-keywords-list-tab ul[tid="' + catName + '"]').find('li.key a').each(function() {
                            timesArray.push($(this).attr('t'));
                        });

                        var uniqueNames = [];
                        $.each(timesArray.join().split(','), function(i, el) {
                            if ($.inArray(el, uniqueNames) === -1)
                                uniqueNames.push(el);
                        });
                        VB.view.keywordHover(uniqueNames.join());
                    },
                    mouseout: function(e) {
                        VB.view.removeKeywordHover();
                    }
                }, '.vbs-topics-list li a');
            }

            VB.helper.find('.vbs-select-language').on('touchstart click', function(event) {
                event.preventDefault();
                toggleDropdown($(this));
            });

            VB.helper.find('.vbs-select-language-wrapper .vbs-select-dropdown').on('touchstart click', 'li', function(e) {
                e.preventDefault();
                var $this = $(this);
                if($this.hasClass('vbs-disabled')){
                    return false;
                }
                $this.parents('.vbs-select-dropdown').fadeOut('fast');
                VB.view.selectLanguage({
                    lang_code: $this.attr("data-lang-code"),
                    lang_name: $this.text()
                });
            });

            VB.helper.find('.vbs-select-speaker').on('touchstart click', function(event) {
                event.preventDefault();
                toggleDropdown($(this));
            });

            var toggleDropdown = function($elem){
                if ($elem.hasClass('vbs-s-show')) {
                    VB.helper.find('.vbs-select-dropdown').fadeOut('fast');
                    $elem.removeClass('vbs-s-show');
                } else {
                    VB.helper.find('.vbs-select-dropdown').fadeIn(100);
                    $elem.addClass('vbs-s-show');
                }

            };

            /*adjusting width of speaker select*/
            var $selectSpeaker = VB.helper.find('.vbs-select-speaker');
            var $searchBtn = VB.helper.find('.vbs-search-btn');
            var $widgetWrap = VB.helper.find('.vbs-widget-wrap');
            var widgetWrapPaddings = parseInt($widgetWrap.css('paddingLeft')) + parseInt($widgetWrap.css('paddingRight'));
            var searchBtnWidth = $searchBtn.width() + parseInt($searchBtn.css('borderLeft'));

            var selSpeakPaddings =  parseInt($selectSpeaker.css('paddingLeft')) + parseInt($selectSpeaker.css('paddingRight'));
            var selSpeakBorders =  parseInt($selectSpeaker.css('borderLeftWidth')) + parseInt($selectSpeaker.css('borderRightWidth'));

            var searchMinWidth = parseInt($widgetWrap.css('minWidth'));

            if($('#vbs-keywords').width() <= 437){
                $selectSpeaker.addClass('vbs-fixed-width');
                $widgetWrap.addClass('vbs-without-min-width');
            }
            if($('#vbs-keywords').width() <= 360){
                VB.helper.find('.vbs-search-form').addClass('less-360px');
            }

            VB.helper.find('.vbs-select-speaker-wrapper .vbs-select-dropdown').on('touchstart click', 'li', function(e) {
                e.preventDefault();
                $selectSpeaker.css('width', 'auto');
                var $this = $(this);
                if($this.hasClass('vbs-disabled')){
                    return false;
                }
                VB.helper.find('.vbs-select-dropdown').fadeOut('fast');
                var speaker_key = $this.attr("data-speaker");
                var label = speaker_key == 'all' ? 'Select speaker...' : $this.text();
                VB.helper.find('.vbs-select-speaker').removeClass('vbs-s-show').html(label);
                VB.helper.filterKeywords(speaker_key);

                if(!VB.settings.searchBarOuter){
                    /* adjusting positions of searching and search btn*/
                    var parents_keywords = $this.parents('#vbs-keywords');
                    var selSpeakWidth;
                    var keywordsWidth;
                    var fixedWidthSelSpeaker;
                    if(parents_keywords.hasClass('less-600px')){
                        if(parents_keywords.width() <= 437){
                            return false;
                        }else{
                            selSpeakWidth = $selectSpeaker.width() + selSpeakPaddings + selSpeakBorders;
                            var searchMarginRight = 12;
                            $searchBtn.css('right', selSpeakWidth + searchMarginRight);
                            $widgetWrap.css('marginRight', selSpeakWidth + searchBtnWidth + searchMarginRight);

                            if($widgetWrap.width() <= searchMinWidth){
                                keywordsWidth = VB.helper.find('.vbs-keywords-block').width();
                                var $widget_wrap = VB.helper.find('.vbs-widget-wrap');
                                var searchBorders = parseInt($widget_wrap.css('borderLeftWidth')) + parseInt($widget_wrap.css('borderRightWidth'));

                                fixedWidthSelSpeaker = keywordsWidth - (searchMinWidth + searchBorders + searchBtnWidth + searchMarginRight + selSpeakBorders + selSpeakPaddings + widgetWrapPaddings);

                                $selectSpeaker.css('width', fixedWidthSelSpeaker);
                                $searchBtn.css('right', fixedWidthSelSpeaker + selSpeakPaddings + selSpeakBorders + searchMarginRight);
                                $widgetWrap.css('marginRight', fixedWidthSelSpeaker + selSpeakPaddings + selSpeakBorders + searchBtnWidth + searchMarginRight);
                            }
                        }
                    }else{
                        selSpeakWidth = $selectSpeaker.width() + selSpeakPaddings + selSpeakBorders;

                        $searchBtn.css('right', selSpeakWidth);
                        $widgetWrap.css('marginRight', selSpeakWidth + searchBtnWidth);

                        if($widgetWrap.width() <= searchMinWidth){
                            keywordsWidth = VB.helper.find('.vbs-keywords-block').width() - parseInt(VB.helper.find('.vbs-keywords-block .vbs-section-header').css('borderLeftWidth')) - parseInt(VB.helper.find('.vbs-keywords-block .vbs-section-header').css('borderRightWidth'));

                            var keywordsTitleWidth = VB.helper.find('.vbs-keywords-block .vbs-section-title').width() + parseInt(VB.helper.find('.vbs-keywords-block .vbs-search-form').css('borderLeftWidth'));

                            fixedWidthSelSpeaker = keywordsWidth - (keywordsTitleWidth + searchBtnWidth + searchMinWidth + selSpeakBorders + selSpeakPaddings + widgetWrapPaddings + 1);

                            $selectSpeaker.css('width', fixedWidthSelSpeaker);
                            $searchBtn.css('right', fixedWidthSelSpeaker + selSpeakPaddings + selSpeakBorders);
                            $widgetWrap.css('marginRight', fixedWidthSelSpeaker + selSpeakPaddings + selSpeakBorders + searchBtnWidth);
                        }
                    }
                }
            });

            if (VB.settings.editKeywords) {
                $(document).off('touchstart click', ".vbs-voicebase_up").on('touchstart click', ".vbs-voicebase_up", function(e) {
                    e.preventDefault();
                    if (typeof VB.settings.webHooks.keywordUp != 'undefined') {
                        VB.settings.webHooks.keywordUp();
                        return false;
                    }
                    var $this = $(this);
                    var txt = $this.parent().data("keywordInternalName");
                    var elem = getLinkByKeywordName(txt);
                    var ecat;
                    if (VB.helper.find('.vbs-topics')) {
                        ecat = VB.helper.find(".vbs-topics-list li.vbs-active").text();
                    }
                    var ekey = $(elem).text();
                    VB.api.editKeyword('up', ekey, ecat, elem);
                });

                $(document).off('touchstart click', ".vbs-voicebase_down").on('touchstart click', ".vbs-voicebase_down", function(e) {
                    e.preventDefault();
                    if (typeof VB.settings.webHooks.keywordDown != 'undefined') {
                        VB.settings.webHooks.keywordDown();
                        return false;
                    }
                    var $this = $(this);
                    var txt = $this.parent().data("keywordInternalName");
                    var elem = getLinkByKeywordName(txt);
                    var ecat;
                    if (VB.helper.find('.vbs-topics')) {
                        ecat = VB.helper.find(".vbs-topics-list li.vbs-active").text();
                    }
                    var ekey = $(elem).text();
                    VB.api.editKeyword('down', ekey, ecat, elem);
                });

                $(document).off('touchstart click', ".vbs-voicebase_first").on('touchstart click', ".vbs-voicebase_first", function(e) {
                    e.preventDefault();
                    if (typeof VB.settings.webHooks.keywordFirst != 'undefined') {
                        VB.settings.webHooks.keywordFirst();
                        return false;
                    }
                    var $this = $(this);
                    var txt = $this.parent().data("keywordInternalName");
                    var elem = getLinkByKeywordName(txt);
                    var ecat;
                    if (VB.helper.find('.vbs-topics')) {
                        ecat = VB.helper.find(".vbs-topics-list li.vbs-active").text();
                    }
                    var ekey = $(elem).text();
                    VB.api.editKeyword('first', ekey, ecat, elem);
                });

                $(document).off('touchstart click', ".vbs-voicebase_remove").on('touchstart click', ".vbs-voicebase_remove", function(event) {
                    event.preventDefault();
                    if (typeof VB.settings.webHooks.removeKeyword != 'undefined') {
                        VB.settings.webHooks.removeKeyword();
                        return false;
                    }
                    var $this = $(this);
                    var txt = $this.parent().data("keywordInternalName");
                    var elem = getLinkByKeywordName(txt);
                    var ecat;
                    if (VB.helper.find('.vbs-topics')) {
                        ecat = VB.helper.find(".vbs-topics-list li.vbs-active").text();
                    }
                    var ekey = $(elem).text();
                    VB.api.removeKeyword(ekey, ecat, elem);
                });

                var getLinkByKeywordName = function(keywordName) {
                    var elem;
                    VB.helper.find('.vbs-keywords-list-tab ul.vbs-active').find('a').each(function() {
                        if($(this).data("keywordInternalName") == keywordName) {
                            elem = $(this);
                            return true;
                        }
                    });
                    return elem;
                };

                $(document).off('touchstart click', ".vbs-topic-del-btn-wrap .vbs-cross-btn").on('touchstart click', ".vbs-topic-del-btn-wrap .vbs-cross-btn", function(event) {
                    event.preventDefault();
                    var $rmblock = $('.vbs-topic-delete-popup');
                    var $this = $(this);

                    if ($rmblock.length) {
                        $rmblock.fadeOut('fast', function() {
                            $rmblock.remove();
                        });
                    } else {
                        var $vbs_popup = $(document).find('.vbs-popup');
                        $vbs_popup.hide().siblings('a').removeClass('vbs-active');
                        /*appending del popup in the <body>*/
                        $(VB.templates.parse('deleteTopicPopup', {topicname: $this.parents('li').find('a').text()})).appendTo('body');
                        /*position of popup*/
                        var delBtnTopPos = $(this).offset().top;
                        var delBtnLeftPos = $(this).offset().left;
                        var $topic_delete_popup = $('.vbs-topic-delete-popup');
                        $topic_delete_popup.css({
                            'top': delBtnTopPos + 'px',
                            'left': delBtnLeftPos + 'px'
                        });
                        /*hiding popup if scroll happens*/
                        VB.helper.find('.vbs-edit-topics').scroll(function() {
                            $topic_delete_popup.fadeOut('fast', function() {
                                $(this).remove();
                            });
                        });
                    }
                });

                $(document).off('touchstart click', ".vbs-add-search-word").on('touchstart click', ".vbs-add-search-word", function(event) {
                    event.preventDefault();
                    VB.api.addKeywords($(this).data('data-kwa'), $(this).data('data-kwt'));
                });
            }

            $(document).off('touchstart click', ".vbs-topic-delete-popup .vbs-confirm-btn").on('touchstart click', ".vbs-topic-delete-popup .vbs-confirm-btn", function(event) {
                event.preventDefault();
                $('.vbs-topic-delete-popup').fadeOut('fast', function() {
                    $(this).remove();
                });
            });

            $(document).off('touchstart click', ".vbs-topic-delete-popup .vbs-cancel-btn").on('touchstart click', ".vbs-topic-delete-popup .vbs-cancel-btn", function(event) {
                event.preventDefault();
                if (typeof VB.settings.webHooks.removeTopic != 'undefined') {
                    VB.settings.webHooks.removeTopic();
                    return false;
                }
                var $this = $(this);
                var cat = $this.parents('.vbs-topic-delete-popup').attr('data-topic');
                VB.api.removeTopic(cat);
            });

            //* Transcript events *//
            VB.helper.find('.vbs-transcript-block .vbs-transcript-wrapper').on('touchstart click', 'span.w', function(e) {
                e.preventDefault();
                if(VB.PlayerApi.getStatus() == 'PLAYING'){
                    VB.PlayerApi.pause();
                }
                VB.helper.showLoader();
                VB.helper.find('.vbs-markers').html('');
                VB.helper.find(".vbs-next-action-btn:not([class='vbs-next-notactive'])").addClass('vbs-next-notactive');
                var $this = $(this);
                var stime = $this.attr('t') / 1000;

                stime = stime > 1 ? stime - 1 : stime;
                VB.helper.find(".vbs-player-slider").css("left", stime / VB.data.duration * 100 + "%");
                VB.helper.find(".vbs-record-progress").css("width", stime / VB.data.duration * 100 + "%");

                VB.PlayerApi.seek(stime);
                var word = $this.text().trim();
                VB.helper.track('transcript', word);
                if (word.match(/\s+/g)) {
                    word = '"' + word + '"';
                }
                var $voice_search_txt = VB.helper.find('#vbs-voice_search_txt');
                $voice_search_txt.val(word).change();
                if (word.length) {
                    VB.view.searchWordWidget([word]);
                }
                $voice_search_txt.data('data-val', $voice_search_txt.val());
                VB.api.getSearch([word], false);
                return false;
            });

            if(VB.settings.toggleBlocks && VB.settings.toggleTranscriptBlock){
                VB.helper.find(".vbs-transcript-block .vbs-section-title").on('touchstart click', function(e) {
                    e.preventDefault();
                    var $this = $(this);
                    $this.toggleClass('vbs-hidden');
                    if ($this.hasClass('vbs-hidden')) {
                        $this.attr('data-title', 'Show Transcript');
                        $this.parents('.vbs-transcript-block').find('.vbs-section-body').slideUp();
                    } else {
                        $this.attr('data-title', 'Hide Transcript');
                        $this.parents('.vbs-transcript-block').find('.vbs-section-body').slideDown();
                    }
                });
            }

            VB.helper.find(".vbs-transcript-block .vbs-more-btn a").on('touchstart click', function(event) {
                event.preventDefault();
                var maxTH = VB.helper.find('.vbs-transcript-wrapper').height();
                var $this = $(this);
                if (VB.data.tf) {
                    VB.data.tf = false;
                    $this.text('Show More...');
                    $(".vbs-transcript-prewrapper").animate({height: VB.settings.transcriptHeight + "px"}, 700);
                } else {
                    $(".vbs-transcript-prewrapper").animate({height: maxTH + 20 + "px"}, 700, "linear", function() {
                        $(this).css({height: "auto"});
                    });
                    $this.text('Hide More...');
                    VB.data.tf = true;
                }
            });

            VB.helper.find(".vbs-transcript-block .vbs-transcript-prewrapper").on({
                mouseover: function(e) {
                    $(this).addClass('vbs-t-hover');
                },
                mouseout: function(e) {
                    $(this).removeClass('vbs-t-hover');
                }
            });

            //* Buttons Events *//
            VB.helper.find('.vbs-section-btns').on('touchstart click', '.vbs-cloud-btn', function(event) {
                event.preventDefault();
                if (typeof VB.settings.webHooks.downloadMedia != 'undefined') {
                    VB.settings.webHooks.downloadMedia();
                    return false;
                }
                var $this = $(this);
                if ($this.hasClass('vbs-active')) {
                    $this.removeClass('vbs-active');
                    $this.parent().find('.vbs-download-popup').fadeOut('fast');
                } else {
                    $this.addClass('vbs-active');
                    $this.parent().find('.vbs-download-popup').fadeIn('fast');
                }
            });

            // Dowload transcript
            VB.helper.find('.vbs-download-popup').on('touchstart click', '.vbs-donwload-pdf, .vbs-donwload-rtf, .vbs-donwload-srt', function(event) {
                event.preventDefault();
                VB.helper.find('.vbs-cloud-btn').removeClass('vbs-active');
                VB.helper.find('.vbs-download-popup').fadeOut('fast');
                var format = $(this).attr('format');
                VB.helper.downloadFile(format);
            });

            // Donwload Audio
            VB.helper.find('.vbs-media-block').on('touchstart click', '.vbs-download-audio-btn', function(event) {
                event.preventDefault();
                if($(this).hasClass('vbs-disable-button')){
                    return false;
                }
                if (typeof VB.settings.webHooks.downloadTranscript != 'undefined') {
                    VB.settings.webHooks.downloadTranscript();
                    return false;
                }
                VB.api.downloadAudio();
            });

            // Share
            VB.helper.find('.vbs-share-btn-wrapper').on('touchstart click', '.vbs-share-btn', function(event) {
                event.preventDefault();
                if (typeof VB.settings.webHooks.socialShare != 'undefined') {
                    VB.settings.webHooks.socialShare();
                    return false;
                }
                var newparam = {};
                var ltime = VB.PlayerApi.getPosition();
                newparam['vbt'] = Math.round(ltime);
                var url = VB.helper.getNewUrl(newparam);
                var vbspTime = VB.helper.parseTime(Math.round(ltime));
                var zclipBox = typeof $.fn.zclip !== 'undefined' ? '' : 'vbs-no-zclip';
                var shareButtonsString = '';
                for (var atb in VB.settings.addThisButtons) {
                    shareButtonsString += '<a class="addthis_button_' + VB.settings.addThisButtons[atb] + '"></a>';
                }

                var addthisBox = typeof addthis !== 'undefined' ? '<div class="vbs-share-social-row vbs-clearfix">\n\
                        <span>Choose one:</span>\n\
                        <div class="vbs-social-wrapper">\n\
                            <div class="vbs-addthis-toolbox addthis_toolbox addthis_default_style">' +
                    shareButtonsString +
                    '<a class="addthis_counter addthis_bubble_style"></a>\n\
                            </div>\n\
                        </div>\n\
                    </div>' : '';
                var vbShareButton = VB.settings.voicebaseShare ? '<span>or</span><a href="#" class="vbs-voicebase-share-btn">Share with E-mail</a>' : '';
                var html = VB.templates.parse('sharePopup', {"vbt": newparam['vbt'], "vbspTime": vbspTime, "zclip": zclipBox, "addthis": addthisBox, "url": url, "vbShareButton": vbShareButton});

                var $share_popup = VB.helper.find('.vbs-share-popup');
                if ($share_popup.length === 0 || $share_popup.hasClass('vbs-hidden')) {
                    VB.helper.find('.vbs-share-popup.vbs-hidden').remove();
                    VB.helper.find('.vbs-share-btn-wrapper').append(html);
                    if (typeof $.fn.zclip !== 'undefined') {
                        VB.helper.find(".vbs-copy-btn").zclip({
                            path: VB.settings.zeroclipboard,
                            copy: function() {
                                return VB.helper.find('#vbsp-url').val();
                            }
                        });
                    }
                    if (typeof addthis !== 'undefined') {
                        addthis.toolbox('.vbs-addthis-toolbox', {}, {'url': url, 'title': VB.settings.shareTitle});
                    }
                } else {
                    $share_popup.fadeOut('fast', function() {
                        $share_popup.addClass('vbs-hidden').show();
                    });
                }
            });

            $(document).off('touchstart click', '#vbs-share-position').on('touchstart click', '#vbs-share-position', function(e) {
                var ltime = VB.PlayerApi.getPosition();
                var vbspTime = VB.helper.parseTime(Math.round(ltime));
                var newparam = {
                    vbt: Math.round(ltime)
                };
                shareActions(newparam, this);
                VB.helper.find('.vbsp-time').html(vbspTime).attr('vbct', vbspTime);
            });
            $(document).off('touchstart click', '#vbs-share-search').on('touchstart click', '#vbs-share-search', function(e) {
                var newparam = {
                    vbs: encodeURI($('#vbs-voice_search_txt').val())
                };
                shareActions(newparam, this);
            });
            $(document).off('touchstart click', '#vbs-share-file').on('touchstart click', '#vbs-share-file', function(e) {
                var newparam = {
                    vbt: 0
                };
                shareActions(newparam, this);
            });

            var shareActions = function name(newparam, context){
                VB.helper.find(".vbs-share-popup .vbs-share-radio-row").removeClass('vbs-checked');
                $(context).parents('.vbs-share-radio-row').addClass('vbs-checked');
                var url = VB.helper.getNewUrl(newparam);
                VB.helper.find('#vbsp-url').val(url);
                if (typeof addthis !== 'undefined') {
                    addthis.update('share', 'url', url);
                }
            };

            VB.helper.find('.vbs-share-btn-wrapper').on('touchstart click', '.vbs-cancel-btn', function(event) {
                event.preventDefault();
                fadeOutSharePopup();
            });

            VB.helper.find('.vbs-share-btn-wrapper').on('touchstart click', '.vbs-addthis-toolbox a', function(e) {
                e.preventDefault();
                fadeOutSharePopup();
            });

            VB.helper.find('.vbs-share-btn-wrapper').on('touchstart click', '.vbsp-url', function(event) {
                event.preventDefault();
                $(this).select();
            });

            // Share play
            var vbspPlay;
            VB.helper.find('.vbs-share-btn-wrapper').on('touchstart click', '.vbs-play-btn', function(event) {
                event.preventDefault();
                clearTimeout(vbspPlay);
                vbspPlay = setTimeout(function() {
                    VB.PlayerApi.seek($('.vbsp-time').attr('vbct'));
                }, 250);
            });

            // Share VoiceBase
            VB.helper.find('.vbs-share-btn-wrapper').on('touchstart click', '.vbs-voicebase-share-btn', function(event) {
                event.preventDefault();
                if (typeof VB.settings.webHooks.vbShare != 'undefined') {
                    VB.settings.webHooks.vbShare();
                    if (typeof VB.settings.webHooks.vbShareClose === 'undefined' || (typeof VB.settings.webHooks.vbShareClose !== 'undefined' && VB.settings.webHooks.vbShareClose === true)) {
                        fadeOutSharePopup();
                    }
                    return false;
                }
                alert('Default Voicebase Share action');
            });

            var fadeOutSharePopup = function(){
                var $share_popup = VB.helper.find('.vbs-share-popup');
                $share_popup.fadeOut('fast', function() {
                    $share_popup.addClass('vbs-hidden').show();
                });
            };

            // Delete media popup
            VB.helper.find('.vbs-section-btns').on('touchstart click', '.vbs-del-btn', function(event) {
                event.preventDefault();
                var $this = $(this);
                if($this.hasClass('vbs-disable-button')){
                    return false;
                }
                var $download_popup = $this.parent().find('.vbs-download-popup');
                if ($this.hasClass('vbs-active')) {
                    $this.removeClass('vbs-active');
                    $download_popup.fadeOut('fast');
                } else {
                    $this.addClass('vbs-active');
                    $download_popup.fadeIn('fast');
                }
            });

            window.addEventListener('storage', function (e) {
                if(e.key === 'vbs-deleted-ids') {
                    VB.helper.clearUiForDeletedIds();
                }
            }, false);

            // Delete media action
            VB.helper.find('.vbs-section-btns').on('touchstart click', '.vbs-red-btn', function(event) {
                event.preventDefault();
                VB.helper.find('.vbs-section-btns .vbs-del-btn').removeClass('vbs-active');
                $(this).parents('.vbs-popup').fadeOut('fast');
                VB.helper.setDeletedIdsInLocalStorage();
                if (typeof VB.settings.webHooks.remove != 'undefined') {
                    VB.settings.webHooks.remove();
                    return false;
                }
                alert('Default delete action');
            });

            // Delete media cancel
            VB.helper.find('.vbs-section-btns').on('touchstart click', '.vbs-blue-btn', function(event) {
                event.preventDefault();
                VB.helper.find('.vbs-section-btns .vbs-del-btn').removeClass('vbs-active');
                $(this).parents('.vbs-popup').fadeOut('fast');
            });

            // Favorite
            VB.helper.find('.vbs-section-btns').on('touchstart click', '.vbs-star-btn', function(event) {
                event.preventDefault();
                var $this = $(this);
                if($this.hasClass('vbs-disable-button')) {
                    return false;
                }
                if ($this.hasClass('vbs-active')) {
                    if (typeof VB.settings.webHooks.favoriteTrue != 'undefined') {
                        VB.settings.webHooks.favoriteTrue();
                        return false;
                    }
                    VB.api.favorite(false);
                } else {
                    if (typeof VB.settings.webHooks.favoriteFalse != 'undefined') {
                        VB.settings.webHooks.favoriteFalse();
                        return false;
                    }
                    VB.api.favorite(true);
                }
            });

            // Help
            VB.helper.find('.vbs-section-btns').on('touchstart click', '.vbs-help-btn', function(event) {
                event.preventDefault();
                if (typeof VB.settings.webHooks.help != 'undefined') {
                    VB.settings.webHooks.help();
                    return false;
                }
                window.open(VB.settings.helpUrl, '_blank');
            });

            // Fullscreen btn
            VB.helper.find('.vbs-section-btns').on('touchstart click', '.vbs-expand-btn', function(event) {
                event.preventDefault();
                if (typeof VB.settings.webHooks.fullscreen != 'undefined') {
                    VB.settings.webHooks.fullscreen();
                    return false;
                }
                $('body').addClass('vbs-fullscreen');
                if(VB.settings.playerType == 'sublime' || VB.settings.playerType == 'jplayer'){
                    var playerWrap = VB.helper.findc('.vbs-player-wrapper');
                    VB.PlayerApi.setSizePlayer(playerWrap.width(), playerWrap.height());
                }
                var controlsBlock = $('#' + VB.settings.controlsBlock);
                if(!VB.settings.markersInNativeTimeline) {
                    searcBarToFullScreen('full');
                }
                else {
                    kalturaFullScreenVideo('full');
                }

                controlsBlock.append('<a href="#" class="vbs-fullscreen-exit">Exit</a>').wrap('<div class="vbs-controls-wrapper"></div>').addClass('vbs-controls-box');
                if(VB.settings.markersInNativeTimeline) {
                    kalturaResizeSearchbar('full');
                }
                VB.view.resizeTimelineElements();
                VB.helper.collapseNewsBlock();
                return false;
            });

            // Fullscreen exit
            $(document).off('touchstart click', '.vbs-fullscreen-exit').on('touchstart click', '.vbs-fullscreen-exit', function(event) {
                event.preventDefault();
                if (typeof VB.settings.webHooks.fullscreenExit != 'undefined') {
                    VB.settings.webHooks.fullscreenExit();
                    return false;
                }
                $('body').removeClass('vbs-fullscreen');
                if(VB.settings.playerType == 'sublime' || VB.settings.playerType == 'jplayer'){
                    VB.PlayerApi.setDefaultSizePlayer();
                }

                $(this).remove();
                var controlsBlock = $('#' + VB.settings.controlsBlock);
                controlsBlock.unwrap().removeClass('vbs-controls-box');
                if(!VB.settings.markersInNativeTimeline) {
                    searcBarToFullScreen('exit_full');
                }
                else {
                    kalturaFullScreenVideo('exit_full');
                    kalturaResizeSearchbar('exit_full');
                }

                VB.view.resizeTimelineElements();
            });

            var kalturaFullScreenVideo = function (mode) {
                var controlsBlock = $('#' + VB.settings.controlsBlock);
                var $searchBar = $('#vbs-searchbar-block');
                if(mode == 'full'){
                    controlsBlock.addClass('vbs-native-markers');
                    if(VB.settings.searchBarOuter){
                        controlsBlock.append($searchBar);
                    }
                    else{
                        var sem = '<div id="vbs-searchbar-block" class="vbs-controls-after-searchbar vbs-searchbar-outer"></div>';
                        controlsBlock.append(sem);
                        $searchBar = $('#vbs-searchbar-block');
                        $searchBar.append($('.vbs-search-form'));
                        $searchBar.append($('.vbs-after-controls-wrapper'));
                    }
                }
                else if(mode == 'exit_full'){
                    controlsBlock.removeClass('vbs-native-markers');
                    if(!VB.settings.searchBarOuter){
                        $('.vbs-keywords-block .vbs-section-title').after($('.vbs-search-form'));
                        $('.vbs-keywords-block').find('.vbs-controls-after-searchbar').empty().append($('.vbs-after-controls-wrapper'));
                        $('#vbs-searchbar-block').remove();
                    }
                    else{
                        controlsBlock.after($searchBar);
                    }
                }
            };

            var kalturaResizeSearchbar = function (mode) {
                var $searchBar = $('#vbs-searchbar-block');
                if(mode == 'full') {
                    var calcWidth = $searchBar.width() - $('.vbs-fullscreen-exit').width() - $('.vbs-after-controls-wrapper').width() - 20;
                    $searchBar.find('.vbs-search-form').width(calcWidth);
                    $('.vbs-controls-wrapper').height('85px');
                }
                else if(mode == 'exit_full'){
                    if(VB.settings.searchBarOuter){
                        $searchBar.find('.vbs-search-form').width($searchBar.width() - $('.vbs-controls-after-searchbar .vbs-after-controls-wrapper').width()  - 2);
                    }
                    else {
                        $('.vbs-search-form').width('inherit');
                    }
                }
            };

            /*reader mode*/
            VB.helper.find('.vbs-section-btns').on('touchstart click', '.vbs-readermode-btn', function(event) {
                event.preventDefault();
                if (typeof VB.settings.webHooks.readermode != 'undefined') {
                    VB.settings.webHooks.readermode();
                    return false;
                }
                VB.view.hideTooltips();

                $('body').addClass('vbs-readermode');
                var controlsBlock = $('#' + VB.settings.controlsBlock);
                searcBarToFullScreen('full');
                controlsBlock.append('<a href="javascript:void(0)" class="vbs-reader-exit">Exit</a>').wrap('<div id="vbs-controls-placement"><div class="vbs-controls-wrapper"></div></div>').addClass('vbs-controls-box');
                VB.view.resizeTimelineElements();
                var classes = VB.data.vclass;
                if(VB.settings.localApp) {
                    classes += ' vbs-local-app';
                }
                $('body').append('<div id="vbs-reader-wrap" class="' + classes + '"></div>');
                $('.vbs-controls-wrapper').appendTo('#vbs-reader-wrap');
                $('.vbs-transcript-block').appendTo('#vbs-reader-wrap');
                VB.helper.collapseNewsBlock();
            });
            $(document).off('touchstart click', '.vbs-reader-exit').on('touchstart click', '.vbs-reader-exit', function(event) {
                event.preventDefault();
                if (typeof VB.settings.webHooks.readermodeExit != 'undefined') {
                    VB.settings.webHooks.readermodeExit();
                    return false;
                }
                $('body').removeClass('vbs-readermode');
                $(this).remove();

                $('.vbs-controls-wrapper').appendTo('#vbs-controls-placement').unwrap();
                $('.vbs-transcript-block').appendTo('#' + VB.settings.transcriptBlock);
                $('#vbs-reader-wrap').remove();

                var controlsBlock = $('#' + VB.settings.controlsBlock);
                controlsBlock.unwrap().removeClass('vbs-controls-box');
                searcBarToFullScreen('exit_full');
                VB.view.resizeTimelineElements();
            });

            var searcBarToFullScreen = function(mode){
                var controlsBlock = $('#' + VB.settings.controlsBlock);
                var $searchBar = $('#vbs-searchbar-block');
                if(mode == 'full'){
                    if(!VB.settings.searchBarOuter){
                        controlsBlock.append($('.vbs-search-form'));
                    }
                    else{
                        $searchBar.css('height', 0);
                        controlsBlock.append($searchBar);
                    }
                    if (controlsBlock.hasClass('less-600px') && !VB.helper.isMobile()) {
                        controlsBlock.removeClass('less-600px').addClass('less-600px-backup');
                    }
                    if(VB.settings.markersInNativeTimeline) {
                        VB.view.resetControlsPlace();
                    }
                }
                else if(mode == 'exit_full'){
                    if(!VB.settings.searchBarOuter){
                        $('.vbs-keywords-block .vbs-section-title').after($('.vbs-search-form'));
                    }
                    else{
                        $searchBar.css('height', '32px');
                        controlsBlock.after($searchBar);
                    }
                    if (controlsBlock.hasClass('less-600px-backup') && !VB.helper.isMobile()) {
                        controlsBlock.removeClass('less-600px-backup').addClass('less-600px');
                    }
                    if(VB.settings.markersInNativeTimeline) {
                        VB.view.renderControlsAfterSearchBar();
                    }
                }
            };

            //* Comments events *//
            if(VB.settings.toggleBlocks && VB.settings.toggleCommentBlock){
                VB.helper.find(".vbs-comments-block .vbs-section-title").on('touchstart click', function(e) {
                    e.preventDefault();
                    VB.comments.toggleBlockHandler($(this));
                });
            }

            VB.helper.find('.vbs-comments-block .vbs-section-btns').on('touchstart click', '.vbs-comments-btn', function(event) {
                event.preventDefault();
                if (typeof VB.settings.webHooks.comment != 'undefined') {
                    VB.settings.webHooks.comment();
                    return false;
                }
                VB.comments.clickAddCommentHandler($(this));
            });

            VB.helper.find('.vbs-comments-block').on('touchstart click', '.vbs-section-header .vbs-confirm-btn', function(event) {
                event.preventDefault();
                VB.comments.confirmAddCommentHandler($(this));
            });

            VB.helper.find('.vbs-comments-block').on('touchstart click', '.vbs-play-btn', function(event) {
                event.preventDefault();
                VB.helper.collapseNewsBlock();
                VB.comments.playCommentHandler($(this));
            });

            VB.helper.find('.vbs-comments-block').on('touchstart click', '.vbs-comment-time', function(event) {
                event.preventDefault();
                VB.comments.commentTimeHandler($(this));
                VB.helper.collapseNewsBlock();
            });

            VB.helper.find('.vbs-comments-block').on('touchstart click', '.vbs-comment-reply', function(event) {
                event.preventDefault();
                VB.helper.collapseNewsBlock();
                if (typeof VB.settings.webHooks.comment != 'undefined') {
                    VB.settings.webHooks.comment();
                    return false;
                }
                VB.comments.replyHandler($(this));
            });

            // EDIT COMMENT BTN
            VB.helper.find('.vbs-comments-block').on('touchstart click', '.vbs-comment-edit', function(event) {
                event.preventDefault();
                VB.helper.collapseNewsBlock();
                if (typeof VB.settings.webHooks.commentEdit != 'undefined') {
                    VB.settings.webHooks.commentEdit();
                    return false;
                }
                VB.comments.editHandler($(this));
            });

            // CANCEL BTN
            VB.helper.find('.vbs-comments-block').on('touchstart click', '.vbs-section-header .vbs-cancel-btn, .vbs-comment-reply-wrapper .vbs-cancel-btn, .vbs-comment-edit-btn-wrapper .vbs-cancel-btn, .vbs-comment-delete-btn-wrapper .vbs-confirm-btn', function(event) {
                event.preventDefault();
                VB.helper.collapseNewsBlock();
                VB.comments.cancelHandler($(this));
            });

            // REPLY BTN
            VB.helper.find('.vbs-comments-block').on('touchstart click', '.vbs-comment-reply-wrapper .vbs-confirm-btn', function(event) {
                event.preventDefault();
                VB.helper.collapseNewsBlock();
                VB.comments.replyConfirmHandler($(this));
            });

            // EDIT COMMENT
            VB.helper.find('.vbs-comments-block').on('touchstart click', '.vbs-comment-edit-btn-wrapper .vbs-confirm-btn', function(event) {
                event.preventDefault();
                VB.helper.collapseNewsBlock();
                VB.comments.editConfirmHandler($(this));
            });

            // DELETE COMMENT BTN
            VB.helper.find('.vbs-comments-block').on('touchstart click', '.vbs-comment-delete', function(event) {
                event.preventDefault();
                VB.helper.collapseNewsBlock();
                VB.comments.deleteHandler($(this));
            });

            // DELETE CONFIRM
            VB.helper.find('.vbs-comments-block').on('touchstart click', '.vbs-comment-delete-btn-wrapper .vbs-cancel-btn', function(event) {
                event.preventDefault();
                if (typeof VB.settings.webHooks.commentDelete != 'undefined') {
                    VB.settings.webHooks.commentDelete();
                    return false;
                }
                VB.comments.deleteConfirmHandler($(this));
            });

            // Evernote
            VB.helper.find('.vbs-section-btns').on('touchstart click', '.vbs-evernote-btn', function(event) {
                event.preventDefault();
                if (typeof VB.settings.webHooks.evernote != 'undefined') {
                    VB.settings.webHooks.evernote();
                    return false;
                }
                if (typeof filepicker !== 'undefined') {
                    var evtitle = VB.api.response.metadata !== null && VB.api.response.metadata.response.title !== '' ? VB.api.response.metadata.response.title : 'VoiceBase';
                    filepicker.exportFile(VB.api.getAutoNotesHtmlURL(), {service: 'EVERNOTE', suggestedFilename: evtitle});
                }
            });

            // Edit transcript
            VB.helper.find('.vbs-section-btns').on('touchstart click', '.vbs-edit-btn', function(event) {
                event.preventDefault();
                if(VB.helper.getIsSaving()) {
                    return false;
                }
                if (typeof VB.settings.webHooks.editTranscript != 'undefined') {
                    VB.settings.webHooks.editTranscript();
                    return false;
                }
                VB.view.hideTooltips();
                VB.data.savingSpeakers = $.extend({}, VB.data.speakers);
                VB.helper.find('.vbs-edit-mode-prewrapper').html(VB.templates.parse('vbs-edit-trans-mode', {ourtranscript: VB.helper.editTranscriptText()}));
                $('body').addClass('vbs-no-scroll');

                var $transcriptBlock = $('#' + VB.settings.transcriptBlock);
                $transcriptBlock.wrap('<div id="transcript_placement"></div>');
                $('body').append('<div id="vbs-edit-wrap"  class="' + VB.data.vclass + '"></div>');
                $transcriptBlock.appendTo('#vbs-edit-wrap');

                VB.helper.collapseNewsBlock();
            });

            // Edit transcript exit
            VB.helper.find('.vbs-transcript-block').on('touchstart click', '.vbs-edit-mode-exit', function(event) {
                event.preventDefault();
                if (typeof VB.settings.webHooks.editTranscriptExit != 'undefined') {
                    VB.settings.webHooks.editTranscriptExit();
                    return false;
                }
                VB.data.speakers = VB.data.savingSpeakers;

                $('#' + VB.settings.transcriptBlock).appendTo('#transcript_placement').unwrap();
                $('#vbs-edit-wrap').remove();

                VB.helper.find('.vbs-edit-mode-prewrapper').html("");
                $('body').removeClass('vbs-no-scroll');
            });

            // Edit transcript Save popup
            VB.helper.find('.vbs-transcript-block').on('touchstart click', '.vbs-save-edition-popup-trigger', function(event) {
                event.preventDefault();
                VB.helper.showSaveQuestion();
            });

            // Edit transcript Cancel
            VB.helper.find('.vbs-transcript-block').on('touchstart click', '.vbs-cancel-edition-btn', function(event) {
                event.preventDefault();
                VB.helper.find('.vbs-save-popup-wrapper').fadeOut('fast');
            });

            // Edit transcript Discard Changes
            VB.helper.find('.vbs-transcript-block').on('touchstart click', '.vbs-discard-edition-btn', function(event) {
                event.preventDefault();
                VB.helper.find('.vbs-edit-mode-prewrapper').html(VB.templates.parse('vbs-edit-trans-mode', {ourtranscript: VB.helper.editTranscriptText()}));
            });

            // Edit transcript Save Changes
            VB.helper.find('.vbs-transcript-block').on('touchstart click', '.vbs-save-edition-btn', function(event) {
                event.preventDefault();
                VB.helper.saveTranscript();
            });

            // Print
            $('.vbs-section-btns').on('touchstart click', '.vbs-print-btn', function(event) {
                event.preventDefault();
                if (typeof VB.settings.webHooks.print != 'undefined') {
                    VB.settings.webHooks.print();
                    return false;
                }

                var w = window.open('', '', 'height=' + screen.availHeight + ',width=' + screen.availWidth + ',left=0,top=0');
                w.document.write('<html><head><title></title>');
                w.document.write('</head><body >');

                var $transcript = $('.vbs-transcript-wrapper').clone();
                $transcript.find('.vbs-trans-info').remove();
                w.document.write($transcript.html());
                w.document.write('</body></html>');

                w.document.close();
                w.focus();
                w.print();
                w.close();
            });

            // Order
            $('.vbs-transcript-block').on('touchstart click', '.vbs-order-human-trans a', function(event) {
                if (typeof VB.settings.webHooks.orderTranscript != 'undefined') {
                    var mediaLength = (VB.data.duration / 60).toFixed(2);
                    VB.settings.webHooks.orderTranscript({
                        apiUrl: VB.settings.apiUrl,
                        version: VB.settings.version,
                        apiKey: VB.settings.apiKey,
                        password: VB.settings.password,
                        mediaId: VB.settings.mediaId,
                        mediaUrl: VB.api.response.metadata.response.streamUrl,
                        recordName: VB.api.response.metadata.response.title,
                        mediaLengthInMinutes: mediaLength
                    });
                    return false;
                }
            });

            //* News events *//
            if(VB.settings.toggleBlocks && VB.settings.toggleNewsBlock){
                VB.helper.find(".vbs-news-block .vbs-section-title").on('touchstart click', function(e) {
                    e.preventDefault();
                    var $this = $(this);
                    $this.toggleClass('vbs-hidden');
                    var $section_body = $this.parents('.vbs-news-block').find('.vbs-section-body');
                    if ($this.hasClass('vbs-hidden')) {
                        VB.helper.collapseNewsBlock();
                    } else {
                        VB.helper.expandNewsBlock();
                        VB.api.getNews();
                    }
                });
            }


            //* Other Events *//
            $(document).off('touchstart click', '.vbs-reload-overlay,.vbs-white-popup-overlay').on('touchstart click', '.vbs-reload-overlay,.vbs-white-popup-overlay', function(e) {
                e.preventDefault();
                var $this = $(this);
                if($this.hasClass('vbs-white-popup-overlay') && VB.settings.tabView) {
                    return false;
                }
                $this.fadeOut('fast', function() {
                    $this.remove();
                });
                var $target = $(e.target);
                if($target.hasClass('vbs-reload-btn')) {
                    location.reload();
                }
            });

            // Context menu

            if (VB.settings.contextMenu || VB.settings.editKeywords) {
                VB.helper.find(".vbs-record-timeline-wrap").on("contextmenu taphold", function(event) {
                    VB.common.vbmenus(event, 'timeline', this);
                });
                VB.helper.find('.vbs-keywords-wrapper').on("contextmenu taphold", ".vbs-keywords-list-wrapper li a", function(event) {
                    VB.common.vbmenus(event, 'keyword', this);
                });
                VB.helper.find('.vbs-transcript-prewrapper').on("contextmenu taphold", ".vbs-transcript-wrapper span.w", function(event) {
                    VB.common.vbmenus(event, 'transcript', this);
                });
                $(document).off('click.vbs_vbcmenu').on("click.vbs_vbcmenu", function(e) {
                    if(e.which === 1) {
                        $("ul.vbs-vbcmenu").css({'top': '-5000px'});
                    }
                });
            }

            // Edit Events
            VB.helper.find(".vbs-transcript-block").on("contextmenu taphold", '.vbs-edition-block span.vbs-wd', function(event) {
                event.preventDefault();
                VB.common.vbEditMenu(event, this);
            });

            $(document).off('keydown', '.vbs-edition-block').on('keydown', '.vbs-edition-block', function(event) {
                if (event.keyCode == 13) {
                    document.execCommand('insertHTML', false, '<br>');
                }
            });

            $(document).off('touchstart click', '.vbsc-edit-play').on('touchstart click', '.vbsc-edit-play', function(event) {
                event.preventDefault();
                var stime = $(this).attr('data-time');
                VB.PlayerApi.seek(stime);
            });

            $(document).off('touchstart click', '.vbsc-edit-speaker').on('touchstart click', '.vbsc-edit-speaker', function(event) {
                event.preventDefault();
                VB.speakers.createInsertSpeakerDialog($(this));
            });

            $(document).off('touchstart click', '.vbs-select-insert-speaker').on('touchstart click', '.vbs-select-insert-speaker', function(e) {
                e.preventDefault();
                toggleDropdown($(this));
            });

            $(document).off('touchstart click', '.vbs-select-insert-speaker-wrapper .vbs-select-dropdown li').on('touchstart click', '.vbs-select-insert-speaker-wrapper .vbs-select-dropdown li', function(e) {
                e.preventDefault();
                VB.speakers.selectSpeakerInInsertDialog($(this));
            });

            $(document).off('touchstart click', '.vbs-insert-speaker-popup .vbs-cancel-btn').on('touchstart click', '.vbs-insert-speaker-popup .vbs-cancel-btn', function(e) {
                e.preventDefault();
                VB.common.hidePopup($('.vbs-insert-speaker-popup'));
            });

            $(document).off('touchstart click', '.vbs-insert-speaker-popup .vbs-confirm-btn').on('touchstart click', '.vbs-insert-speaker-popup .vbs-confirm-btn', function(e) {
                e.preventDefault();
                var $insertPopup = $('.vbs-insert-speaker-popup');
                var isValid = VB.validator.validate($insertPopup);
                if(isValid) {
                    VB.speakers.insertSpeakerToEditor();
                    VB.common.hidePopup($insertPopup);
                }
            });

            $(document).off('touchstart click', '.vbsc-rename-speaker').on('touchstart click', '.vbsc-rename-speaker', function(event) {
                event.preventDefault();
                VB.speakers.createRenameSpeakerDialog($(this));
            });

            $(document).off('touchstart click', '.vbs-rename-speaker-popup .vbs-cancel-btn').on('touchstart click', '.vbs-rename-speaker-popup .vbs-cancel-btn', function(e) {
                e.preventDefault();
                VB.speakers.enableRenameAllSpeakersInEditor();
                VB.common.hidePopup($('.vbs-rename-speaker-popup'));
            });

            $(document).off('touchstart click', '.vbs-rename-speaker-popup .vbs-confirm-btn').on('touchstart click', '.vbs-rename-speaker-popup .vbs-confirm-btn', function(e) {
                e.preventDefault();
                var $renamePopup = $('.vbs-rename-speaker-popup');
                var isValid = VB.validator.validate($renamePopup);
                if(isValid) {
                    VB.speakers.renameSpeaker();
                    VB.common.hidePopup($renamePopup);
                }
            });

            /*
            * Edit speaker from editor (contenteditable)
            * */
            $(document).off('blur keyup paste', '.vbs-edition-block').on('blur keyup paste', '.vbs-edition-block', function(e) {
                var selection = (window.getSelection) ? window.getSelection() : document.selection;
                if(selection.focusNode && selection.focusNode.parentElement) {
                    var $element = $(selection.focusNode.parentElement);
                    if($element.hasClass('vbs-edit-speaker')) {
                        VB.speakers.renameSpeakerFromEditor($element);
                    }
                }
            });

            if (VB.settings.debug) {
                $(document).off('keydown.vbs_keydown').on('keydown.vbs_keydown', function(e) {
                    var key = e.which || e.keyCode;
                    if (key === 71 && (e.metaKey || e.ctrlKey) && e.altKey) { // ctrl+alt+g
                        VB.helper.debug();
                    }
                });
            }

            // tab events
            if(VB.settings.tabView){
                $(document).off('click touchstart', '.vbs-tabs-links a').on('click touchstart', '.vbs-tabs-links a', function(e){
                    e.preventDefault();
                    var $this = $(this);
                    var linkTarget = $this.attr('data-href');

                    if(!$this.hasClass('vbs-active')){
                        $this.siblings().removeClass('vbs-active');
                        $this.addClass('vbs-active');
                    }

                    $('.vbs-tab').each(function(){
                        $(this).removeClass('vbs-tab-visible');
                    });

                    $(linkTarget).addClass('vbs-tab-visible');
                    return false;
                });
            }

            $(document).off('touchstart click', '.vbs-selected-playlist-item').on('touchstart click', '.vbs-selected-playlist-item', function(e) {
                e.preventDefault();
                var $playlist = $(this).parents('.vbs-playlist');
                $playlist.toggleClass('collapsed');
                if(!$playlist.hasClass('collapsed')) {
                    var index = VB.PlayerApi.getPlaylistItemIndex();
                    var $playlistItem = $playlist.find('[data-playlist-item-index='+ index +']');
                    $playlist.animate({scrollTop: $playlistItem.offset().top - $playlistItem.parent().offset().top});
                }
            });

            $(document).off('touchstart click', '.vbs-playlist-item').on('touchstart click', '.vbs-playlist-item', function(e) {
                e.preventDefault();
                var index = $(this).attr('data-playlist-item-index');
                var playlist = $(this).parents('.vbs-playlist');
                playlist.addClass('collapsed');
                VB.PlayerApi.setPlaylistItem(index);
            });

            $(document).off('touchstart click', '.vbs-cancel-search').on('touchstart click', '.vbs-cancel-search', function(e) {
                e.preventDefault();
                if(VB.data.searchWorker) {
                    VB.data.searchWorker.terminate();
                }
                VB.helper.clearMessage();
                VB.helper.hideLoader();
                VB.data.clicker = false;
                VB.PlayerApi.play();
            });

        }

    };

    return VB;
})(voiceBase, jQuery);