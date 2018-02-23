/*
* VB.Player and VB.interface.
* Work with players
* */
voiceBase = (function(VB, $) {
    "use strict";

    VB.Player = function(a, playerId) {
        var me = this;
        me.instance = a;
        var playerType = VB.settings.playerType;
        playerType = playerType.toLowerCase().replace(/^\s+|\s+$/, "");
        me.player_type = playerType;
        me.instance.player_ready = false;
        me.find_player_interval = setInterval(function() {
            if(me.find_player_interval) {
                try {
                    me.interface = new VB.interface[playerType](playerId, me.instance);
                    clearInterval(me.find_player_interval);
                    me.find_player_interval = null;
                    VB.helper.setOnTimeInterval();
                } catch (f) {
                    console.log(f);
                }
            }
        }, 250);
    };

    VB.interface = {
        youtube: function(a, b) {
            var me = this;
            me.instance = b;
            if (document.getElementById(a) && document.getElementById(a).tagName.toLowerCase() == "iframe") {
                if (typeof YT == "undefined" || typeof YT.Player == "undefined"){
                    throw "not_ready";
                }
                if (!YT.loaded){
                    throw "not_ready";
                }
                if (me.instance.ytplayerloaded){
                    return !1;
                }
                me.youtube_player = new YT.Player(a);
                me.instance.ytplayerloaded = !0;
            }
            else {
                me.youtube_player = window.document[a];
            }

            me.play = function() {
                me.youtube_player.playVideo();
            };

            me.pause = function() {
                me.youtube_player.pauseVideo();
            };

            me.play_state = function() {
                try {
                    var a = me.youtube_player.getPlayerState();
                    return parseInt(a) == 1 || parseInt(a) == 5 ? "PLAYING" : "PAUSED";
                } catch (b) {
                    return "PAUSED";
                }
            };

            me.position = function() {
                try {
                    return me.youtube_player.getCurrentTime() + 0.07;
                } catch (b) {
                    return 0;
                }
            };

            me.duration = function() {
                return me.youtube_player ? parseInt(me.youtube_player.getDuration() + 0.5) : !1;
            };

            me.seek = function(position) {
                position = parseInt(position, 10);
                me.youtube_player.seekTo(position);
                me.play();
            };

            me.get_volume = function() {
                return me.youtube_player ? me.youtube_player.getVolume() : !1;
            };

            me.set_volume = function(a) {
                me.youtube_player.setVolume(a);
            };

            me.get_buffer = function() {
                return (me.youtube_player && me.youtube_player.getVideoBytesLoaded) ? ( me.youtube_player.getVideoBytesLoaded() * 100 / me.youtube_player.getVideoBytesTotal() ) : !1;
            };
            me.destroy = function () {
            };

            window.onYouTubePlayerReady = function(playerId){
                if(!me.instance.player_ready){
                    me.instance.player_ready = true;
                    if(VB.settings.localApp) {
                        YSP.api.init('ytplayer');
                        YSP.api.getLanguages(function(data){
                            VB.data.localData.languages = data.languages;
                            VB.view.initApi();
                        });
                    }
                }
            };
        },
        jwplayer: function(playerId, b) {
            var me = this;
            me.instance = b;
            if (typeof jwplayer != "undefined" && jwplayer(playerId) && jwplayer(playerId).play){
                me.jw_player = jwplayer(playerId);
                me.jw_player.onReady(function(){
                    readyPlayer();
                });

                me.jw_player.onError(function(e) {
                    $('.vbs-text-error-message').remove();
                    var errorText = e.message;
                    if(errorText === 'Error loading media: File could not be played' && VB.helper.is_iDevice()) {
                        errorText = 'This media file cannot be played on your current device and operating system. Please try on a different device or upgrade to a supported version of iOS 8.';
                    }
                    var errorMessage = VB.templates.parse('textErrorMessage', {
                        errorText: errorText
                    });
                    $('#' + VB.settings.controlsBlock).after(errorMessage);
                });

                var initJwMethods = function(){
                    me.play = function() {
                        me.jw_player.play();
                    };
                    me.pause = function() {
                        me.jw_player.pause();
                    };
                    me.play_state = function() {
                        return me.jw_player.getState() == "PLAYING" ? "PLAYING" : "PAUSED";
                    };
                    me.position = function() {
                        return me.jw_player.getPosition();
                    };
                    me.duration = function() {
                        return me.jw_player.getDuration();
                    };
                    me.seek = function(t) {
                        me.jw_player.seek(t);
                    };
                    me.get_volume = function() {
                        return me.jw_player.getVolume();
                    };
                    me.set_volume = function(a) {
                        return me.jw_player.setVolume(a);
                    };
                    me.get_buffer = function() {
                        return me.jw_player.getBuffer();
                    };
                    me.get_rendering_mode = function() {
                        return me.jw_player.getRenderingMode();
                    };
                    me.load_file = function(f) {
                        if(VB.settings.hasPlaylist){
                            me.jw_player.load(f);
                        }
                        else {
                            me.jw_player.load([{file: f}]);
                        }
                    };
                    me.getWidth = function(){
                        var width = me.jw_player.getWidth();
                        if(width === '100%'){
                            var container = me.jw_player.getContainer();
                            width = $(container).width();
                        }
                        return width;
                    };
                    me.getHeight = function(){
                        var height = me.jw_player.getHeight();
                        if(height === '100%'){
                            var container = me.jw_player.getContainer();
                            height = $(container).height();
                        }
                        return height;
                    };
                    me.setSize =  function(width, height){
                        if(width === null || typeof width === 'undefined') {
                            width = me.jw_player.getWidth();
                        }
                        if(height === null || typeof height === 'undefined') {
                            height = me.jw_player.getHeight();
                        }
                        me.jw_player.resize(width, height);
                    };
                    var prev_item_id = null;
                    me.initPluginFromPlaylistItem = function(){
                        var item = me.getCurrentPlaylistItem();
                        var vbs_id = VB.PlayerApi.getPlaylistItemId(item);
                        if(vbs_id.id !== prev_item_id) {
                            prev_item_id = vbs_id.id;
                            delete VB.settings.mediaId;
                            delete VB.settings.externalId;
                            VB.helper.clearIntervals();
                            if(vbs_id.isMediaid) {
                                VB.settings.mediaId = item.vbs_mediaid;
                            }
                            else {
                                VB.settings.externalId = item.vbs_externalid;
                            }

                            VB.helper.setOnTimeInterval();
                            VB.view.initApi();

                            var index = me.jw_player.getPlaylistIndex();
                            $('.vbs-playlist-item').removeClass('active');
                            $('.vbs-selected-playlist-item').find('.vbs-item-name').text(item.title);
                            var $playlistItem = $('[data-playlist-item-index='+ index +']');
                            $playlistItem.addClass('active');
                            $playlistItem[0].scrollIntoView();
                        }
                    };
                    me.setPlaylistItem = function(index) { // for changing playlist item
                        index = parseInt(index);
                        me.jw_player.playlistItem(index);
                    };
                    me.getPlaylistItemIndex = function() { // for changing playlist item
                        return me.jw_player.getPlaylistIndex();
                    };
                    me.onChangePlayListItem = function(){
                        me.jw_player.onPlaylistItem(function(){
                            me.initPluginFromPlaylistItem();
                        });
                    };
                    me.getCurrentPlaylistItem = function(){
                        return me.jw_player.getPlaylistItem();
                    };
                    me.getPlaylist = function(){
                        return me.jw_player.getPlaylist();
                    };
                    me.renderPlaylist = function() {
                        var playlist = me.getPlaylist();
                        $('#' + VB.settings.controlsBlock).before(VB.templates.get('playlist'));
                        var itemsTmpl = '';
                        playlist.forEach(function(_item, index) {
                            itemsTmpl += VB.templates.parse('playlist-item', {
                                title: _item.title,
                                index: index
                            });
                        });
                        $('.vbs-playlist-dropdown').append(itemsTmpl);

                    };
                    me.destroy = function () {
                        if(me.jw_player.getRenderingMode()) {
                            me.jw_player.remove();
                        }
                    };
                };

                var readyPlayer = function() {
                    me.instance.player_ready = true;
                    initJwMethods();

                    if(VB.helper.isMobile()) {
                        var mobile_sizes = VB.PlayerApi.getMobilePlayerSize();
                        me.setSize(mobile_sizes.mobile_width, mobile_sizes.mobile_height);
                        $("#" + VB.settings.mediaBlock).css('width', mobile_sizes.mobile_width);
                    }

                    if(VB.settings.hasPlaylist){
                        if(!VB.settings.nativePlaylist) {
                            me.renderPlaylist();
                        }
                        me.onChangePlayListItem();
                    }
                };

                initJwMethods();
                me.instance.player_ready = true;
            }
            else {
                throw "not_ready";
            }
        },
        kaltura: function(t, e) {
            var me = this;
            me.instance = e;
            me.kaltura_player = $("#" + t).get(0);
            me.kaltura_states = {
                buffered: 0,
                bytes_total: 0,
                player_state: false,
                playhead_time: 0,
                volume: 1,
                ready: false
            };

            window.bytesTotalChangeHandler = function(data){
                me.kaltura_states.bytes_total = data;
            };

            window.html5_kaltura_play_handler = function(data){
                console.log('Kaltura is PLAYING!');
                me.kaltura_states.player_state = true;
            };

            window.html5_kaltura_pause_handler = function(){
                console.log('Kaltura is PAUSED!');
                me.kaltura_states.player_state = false;
            };

            window.html5_kaltura_update_playhead = function(t){
                me.kaltura_states.playhead_time = parseFloat(t);
            };

            window.volumeChangedHandler = function(volumeValue){
                me.kaltura_states.volume = volumeValue.newVolume;
            };

            window.bytesDownloadedChangeHandler = function(data, id){
                me.kaltura_states.buffered = data.newValue;
            };

            window.playerSeekEndHandler = function(){
                me.play();
            };

            me.player_state = !1;
            me.playhead_time = 0;
            me.player_id = t;

            me.play = function () {
                me.kaltura_player.sendNotification("doPlay");
            };
            me.pause = function () {
                me.kaltura_player.sendNotification("doPause");
            };
            me.play_state = function () {
                return (me.kaltura_states.player_state) ? 'PLAYING' : 'PAUSED';
            };
            me.position = function () {
                return me.kaltura_states.playhead_time;
            };
            me.duration = function () {
                return me.kaltura_player.evaluate("{mediaProxy.entry.msDuration}") / 1000;
            };
            me.video_id = function () {
                return me.kaltura_player.evaluate("{mediaProxy.entry.id}");
            };
            me.seek = function (t) {
                me.kaltura_player.sendNotification("doPlay");

                setTimeout(function(){
                    me.kaltura_player.sendNotification("doSeek", parseFloat(parseInt(t)));
                }, 0);
            };
            me.play_file = function (t) {
                if (t.video_id != this.video_id()) {
                    var e = t.m || 0;
                    me.kaltura_player.sendNotification("changeMedia", {
                        entryId: t.video_id, seekFromStart: e.toString()
                    });
                    me.timer = setInterval(function () {
                        return "PLAYING" == me.play_state() && me.video_id() == t.video_id ? (clearInterval(me.timer), !0) : void me.play();
                    }, 200);
                } else
                    this.seek(t.m);
            };
            me.get_buffer = function(t) {
                if(me.kaltura_states.bytes_total && me.kaltura_states.buffered){
                    return me.kaltura_states.buffered * 100 / me.kaltura_states.bytes_total;
                }
                return 0;
            };
            me.get_volume = function() {
                return me.kaltura_states.volume * 100;
            };
            me.set_volume = function(a) {
                me.kaltura_player.sendNotification('changeVolume', a/100);
            };

            me.getPlayerIframe = function(){
                return $('#' + me.player_id + '_ifp').contents();
            };

            me.destroy = function () {
            };

            window.kdpReady = function(){
                me.kaltura_states.ready = true;
                me.instance.player_ready = true;
                console.log('Kaltura is ready!');

                me.kaltura_player.addJsListener("volumeChanged", "volumeChangedHandler");

                me.kaltura_player.addJsListener("playerPlayed", 'html5_kaltura_play_handler');
                me.kaltura_player.addJsListener("playerPaused", 'html5_kaltura_pause_handler');
                me.kaltura_player.addJsListener("playerPlayEnd", 'html5_kaltura_pause_handler');
                me.kaltura_player.addJsListener("playerUpdatePlayhead", 'html5_kaltura_update_playhead');
                me.kaltura_player.addJsListener("bytesTotalChange", "bytesTotalChangeHandler");
                me.kaltura_player.addJsListener("bytesDownloadedChange", "bytesDownloadedChangeHandler");
                me.kaltura_player.addJsListener("playerSeekEnd", "playerSeekEndHandler");
                if(me.kaltura_player.tagName == 'OBJECT'){ // flash player
                    me.play();
                }
                if(VB.settings.markersInNativeTimeline && VB.settings.cssPathForPlayerFrame) {
                    var cssLink = document.createElement("link");
                    cssLink.href = VB.settings.cssPathForPlayerFrame;
                    cssLink .rel = "stylesheet";
                    cssLink .type = "text/css";
                    var $playerIframe = me.getPlayerIframe();
                    $playerIframe[0].body.appendChild(cssLink);
                }
            };

            window.jsCallbackReady = function(player_id) {
                //me.kaltura_player.addJsListener("kdpReady", "kdpReady");
            };

            if (!me.kaltura_player || !me.kaltura_player.addJsListener) {
                throw "not_ready";
            }
            else {
                window.kdpReady();
            }

        },
        flowplayer: function(player_id, e) {
            var me = this;
            me.instance = e;
            if (typeof flowplayer === "undefined" ){
                throw "not_ready";
            }
            me.flow_player = $('#' + player_id);
            var api = flowplayer(me.flow_player);

            me.play = function() {
                api.play();
            };
            me.pause = function() {
                return api.pause();
            };
            me.play_state = function() {
                var status = api.paused;
                return (status) ? "PAUSED" : "PLAYING";
            };
            me.position = function() {
                return (api.video) ? api.video.time : 0;
            };
            me.duration = function() {
                return (api.video) ? api.video.duration : 0; // 1e3 ??
            };
            me.seek = function(position) {
                api.seek(position); // in seconds
                me.play();
            };
            me.get_buffer = function(t) {
                if(api.video){ // in percent
                    return api.video.buffer * 100 / me.duration();
                }
                return 0;
            };
            me.flow_player.bind("volume", function() {
                var vol = me.get_volume();
                VB.PlayerApi.setUiVolume(vol);
            });
            me.get_volume = function() {
                return api.volumeLevel*100;
            };
            me.set_volume = function(volume) {
                api.volume(volume/100);
            };
            me.destroy = function () {
            };
        },
        sublime: function(player_id, e) {
            var me = this;
            me.instance = e;
            if(typeof sublime == "undefined" || typeof sublime.player == "undefined"){
                throw "not_ready";
            }
            else if(typeof sublime.player(player_id) == "undefined"){
                throw "not_ready";
            }
            me.player_id = player_id;
            me.default_size = {
                width: $('#' + me.player_id).width(),
                height: $('#' + me.player_id).height()
            };
            me.player_state = !1;
            var api = sublime.player(me.player_id);
            api.on({
                start: function() {
                    me.player_state = "PLAYING";
                },
                end: function() {
                    me.player_state = "PAUSED";
                },
                stop: function() {
                    me.player_state = "PAUSED";
                },
                pause: function() {
                    me.player_state = "PAUSED";
                },
                play: function() {
                    me.player_state = "PLAYING";
                }
            });
            me.play = function() {
                api.play();
            };
            me.pause = function() {
                api.pause();
            };
            me.play_state = function() {
                return me.player_state;
            };
            me.position = function() {
                return api.playbackTime();
            };
            me.duration = function() {
                return api.duration();
            };
            me.get_buffer = function(t) {
                return 0;
            };
            me.seek = function(position) {
                api.seekTo(position);
                me.play();
            };
            me.setSize = function(width, height){
                api.setSize(width, height);
            };
            me.setDefaultSize = function(){
                api.setSize(me.default_size.width, me.default_size.height);
            };
            me.destroy = function () {
            };
        },
        video_js: function(t, e) {
            var me = this;
            me.instance = e;
            me.player_id = t;
            if (typeof _V_ === "undefined")
                throw "not_ready";
            var api = _V_(t);
            me.instance.player_ready = true;
            me.play = function() {
                api.play();
            };
            me.pause = function() {
                api.pause();
            };
            me.play_state = function() {
                return api.paused() ? "PAUSED" : "PLAYING";
            };
            me.position = function() {
                return api.currentTime();
            };
            me.duration = function() {
                return api.duration();
            };
            me.seek = function(position) {
                api.currentTime(position);
                me.play();
            };
            me.get_buffer = function(t) {
                return api.bufferedPercent() * 100 || 0;
            };
            api.on("volumechange", function() {
                var vol = me.get_volume();
                VB.PlayerApi.setUiVolume(vol);
            });
            me.get_volume = function() {
                return api.volume() * 100;
            };
            me.set_volume = function(volume) {
                api.volume(volume / 100);
            };
            me.destroy = function () {
                if($('#' + me.player_id).length > 0) {
                    api.dispose();
                }
            };
        },
        jplayer: function(player_id, instance){
            var me = this;
            me.instance = instance;
            me.player_id = player_id;
            var $player = $('#' + me.player_id);

            me.default_size = {
                width: $('#' + me.player_id).width(),
                height: $('#' + me.player_id).height()
            };

            me.play = function(){
                $player.jPlayer("play");
            };
            me.pause = function(){
                $player.jPlayer("pause");
            };
            me.play_state = function() {
                return $player.data('jPlayer').status.paused ? "PAUSED" : "PLAYING";
            };
            me.position = function() {
                return $player.data('jPlayer').status.currentTime || 0;
            };
            me.duration = function() {
                return $player.data('jPlayer').status.duration || 0;
            };
            me.seek = function(position) { // in seconds
                position = parseInt(position);
                $player.jPlayer("play", position);
            };
            me.get_buffer = function(t) {
                return 0;
            };
            me.get_volume = function() {
                return ($player.data("jPlayer").options.volume * 100) || 0;
            };
            me.set_volume = function(volume) {
                $('#jplayer').jPlayer("volume", volume / 100);
            };
            me.isVideo = function(){
                return $player.data('jPlayer').status.video;
            };
            me.getGui = function(){
                return $($player.data('jPlayer').ancestorJq);
            };
            me.initEvents = function(){
                $player.bind($.jPlayer.event.volumechange, function(){
                    var vol = me.get_volume();
                    VB.PlayerApi.setUiVolume(vol);
                });
            };
            me.setSize = function(width, height){
                $player.jPlayer({
                    size:  {
                        width: width,
                        height: height
                    }
                });
            };
            me.setDefaultSize = function(){
                me.setSize(me.default_size.width, me.default_size.height);
            };
            me.destroy = function () {
            };

            var init = function(){
                var $gui = me.getGui();
                if(!me.isVideo()){
                    $gui.hide();
                }
                me.initEvents();
            };
            init();

        }
    };

    VB.PlayerApi = {
        startPlayer: function(start_time) {
            VB.helper.showLoader();
            window.setTimeout(function() {
                VB.PlayerApi.cseek(start_time);
            }, 200);

            window.setTimeout(function() {
                VB.data.movelistner = false;
                VB.data.dragging = false;
            }, 300);
        },
        cseek: function(time) {
            VB.instances[VB.current_instance].player.interface.seek(time);
        },
        seek: function(time) {
            VB.PlayerApi.startPlayer(time);
        },
        play: function() {
            VB.instances[VB.current_instance].player.interface.play();
        },
        pause: function() {
            VB.instances[VB.current_instance].player.interface.pause();
        },
        getOffset: function(startTime){
            var wrapper = VB.helper.find('.vbs-record-timeline-wrap');
            return (startTime * wrapper.width()) / VB.data.duration;
        },
        getDuration: function() {
            return VB.instances[VB.current_instance].player.interface.duration();
        },
        getPosition: function() {
            return VB.instances[VB.current_instance].player.interface.position();
        },
        getStatus: function() {
            return VB.instances[VB.current_instance].player.interface.play_state();
        },
        getVolume: function() {
            return VB.instances[VB.current_instance].player.interface.get_volume();
        },
        setVolume: function(vol) { // set player volume
            return VB.instances[VB.current_instance].player.interface.set_volume(vol);
        },
        setUiVolume: function(vol){
            VB.helper.find(".vbs-volume-slider-full").css("height", vol + "%");
            VB.helper.find(".vbs-volume-slider-handler").css("bottom", vol + "%");
        },
        getBuffer: function() {
            return VB.instances[VB.current_instance].player.interface.get_buffer();
        },
        getRenderingMode: function() {
            return VB.instances[VB.current_instance].player.interface.get_rendering_mode();
        },
        loadFile: function(f) {
            return VB.instances[VB.current_instance].player.interface.load_file(f);
        },
        isPlayerReady: function(){
            return VB.instances[VB.current_instance].player_ready;
        },
        getMobilePlayerSize: function(){
            var player_width = VB.PlayerApi.getPlayerWidth();
            var player_height = VB.PlayerApi.getPlayerHeight();
            var ratio = (player_width && player_height) ? player_width / player_height : 0;
            var mobile_width = VB.helper.getMobileWidth();
            var mobile_height = mobile_width / ratio;
            mobile_height = (mobile_height > screen.availHeight) ? screen.availHeight : mobile_height;
            return {
                mobile_width: mobile_width,
                mobile_height: mobile_height
            };
        },
        getPlayerWidth: function(){
            return VB.instances[VB.current_instance].player.interface.getWidth();
        },
        getPlayerHeight: function(){
            return VB.instances[VB.current_instance].player.interface.getHeight();
        },
        setSizePlayer: function(width, height) {
            var _interface = VB.instances[VB.current_instance].player.interface;
            if(_interface && _interface.setSize) {
                return _interface.setSize(width, height);
            }
            return null;
        },
        setDefaultSizePlayer: function() {
            return VB.instances[VB.current_instance].player.interface.setDefaultSize();
        },
        hidePlayer: function(){
            if(VB.settings.playerType != 'kaltura'){
                var waitinstance = setInterval(function() {
                    if (VB.instances.length) {
                        clearTimeout(waitinstance);
                        VB.helper.findc('.vbs-player-wrapper').css({"height": 0});
                        if(VB.settings.playerType === 'jwplayer') {
                            VB.PlayerApi.setSizePlayer(0, 0);
                            $('#' + VB.settings.playerId).css({"opacity": 0});
                        }
                    }
                }, 100);
            }
        },
        setPlaylistItem: function(index){
            return VB.instances[VB.current_instance].player.interface.setPlaylistItem(index);
        },
        getPlaylistItemIndex: function(){
            return VB.instances[VB.current_instance].player.interface.getPlaylistItemIndex();
        },
        getPlaylist: function(){
            return VB.instances[VB.current_instance].player.interface.getPlaylist();
        },
        getCurrentPlaylistItem: function(){
            return VB.instances[VB.current_instance].player.interface.getCurrentPlaylistItem();
        },
        getPlaylistItemId: function(item){
            var id;
            var isMediaid = false;
            if(item.vbs_mediaid) {
                id = item.vbs_mediaid;
                isMediaid = true;
            }
            else if(item.vbs_externalid) {
                id = item.vbs_externalid;
            }
            return {
                id: id,
                isMediaid: isMediaid
            };
        },
        getStreamUrl: function(response){
            var stream_url = '';
            if (VB.PlayerApi.getRenderingMode() != "html5" && VB.settings.stream == 'rtmp') {
                stream_url = response.rtmpUrl + "" + response.rtmpFile;
            }
            else if (VB.settings.stream == 'http' || VB.settings.stream === true) {
                stream_url = response.streamUrl;
            }
            return stream_url;

        },
        getPlayerIframe: function(){
            return VB.instances[VB.current_instance].player.interface.getPlayerIframe();
        },
        destroy: function () {
            if( VB.instances[VB.current_instance] &&
                VB.instances[VB.current_instance].player &&
                VB.instances[VB.current_instance].player.interface &&
                VB.instances[VB.current_instance].player.interface.destroy ) {

                VB.instances[VB.current_instance].player.interface.destroy();
            }
        }
    };

    return VB;
})(voiceBase, jQuery);