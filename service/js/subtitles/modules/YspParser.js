var YSP = (function(me, $) {
    "use strict";

    me.parser = {
        getLangs: function(){
            me.options.parsedLanguages = $.ajax({
                type: 'POST',
                url: 'http://www.youtube.com/api/timedtext?v=' + me.options.video_id + '&expire=1&type=list',
                dataType: 'xml',
                success: function(data){
                    var track_doc = data.documentElement;
                    var tracks = $(track_doc).find('track');
                    var langs_promises = [];
                    for (var i = 0; i < tracks.length; i++) {
                        var track = tracks[i];
                        var lang_code = $(track).attr('lang_code');
                        var lang_name = $(track).attr('lang_translated');
                        if(lang_code){
                            var lang_obj = {};
                            lang_obj[lang_code] = lang_name;
                            me.options.languages.push(lang_obj);
                            var _promise = me.parser.getSubtitlesByLang(lang_code);
                            langs_promises.push(_promise);
                        }
                    }
                    $.when.apply(me, langs_promises).then(me.parser.parseSubtitle);
                },
                error: function(jqXHR, textStatus, errorThrown){
                    console.log(errorThrown + ': Error ' + jqXHR.status);
                }
            });
        },

        getSubtitlesByLang: function(lang){
            return $.ajax({
                type: 'POST',
                url: 'http://www.youtube.com/api/timedtext?v=' + me.options.video_id + '&lang=' + lang,
                success: function(data){
                    me.options.youtube_subtitles[lang] = data.documentElement;
                },
                error: function(jqXHR, textStatus, errorThrown){
                    console.log(errorThrown + ': Error ' + jqXHR.status);
                }
            });
        },

        parseTranscript: function(transcript_dom){
            var transcript = [];

            $(transcript_dom).find('text').each(function(){
                var text_elem = $(this);
                var text = text_elem.text();
                var words = text.split(/(?=\W)(?=\s)/);

                var start = text_elem.attr('start');
                start = (start) ? start * 1000 : 0;
                var duration = text_elem.attr('dur');
                duration = (duration) ? duration * 1000 : 0;
                var end = start + duration;

                for (var i = 0; i < words.length; i++) {
                    var name = words[i].trim();
                    var word = {
                        w: name,
                        s: start,
                        e: end,
                        p: transcript.length + 1
                    };
                    transcript.push(word);

                }
            });

            return {
                transcript: {
                    transcript: transcript,
                    transcriptType: "machine",
                    fileStatus: "MACHINECOMPLETE",
                    requestStatus: "SUCCESS"
                }
            };
        },

        startWorkerKeywordParser: function(transcripts){
            console.time('keywords_workers');
            var i = 0;
            var workers = [];

            var handleKeywordWorkerResult = function(e){
                i--;
                me.options.keywords[e.data.lang] = e.data.response;
                if(i === 0) {
                    console.timeEnd('keywords_workers');
                    me.options.parsedKeywords.resolve();
                }
            };

            for (var lang in transcripts) {
                if (transcripts.hasOwnProperty(lang)) {
                    workers[i] = new Worker('js/subtitles/parserWorker.js');
                    workers[i].onerror = function(e){
                        console.log(['ERROR: Line ', e.lineno, ' in ', e.filename, ': ', e.message].join(''));
                    };
                    workers[i].onmessage = handleKeywordWorkerResult;
                    workers[i].postMessage({transcript: transcripts[lang], lang: lang});
                    i++;
                }
            }
        },

        parseSubtitle: function(){
            console.time('parseSubtitle');
            var youtubeSubtitles = me.options.youtube_subtitles;
            for (var lang in  youtubeSubtitles) {
                if (youtubeSubtitles.hasOwnProperty(lang)) {
                    var parse_result = me.parser.parseTranscript(youtubeSubtitles[lang]);
                    me.options.transcripts[lang] = parse_result.transcript;
                    if(!window.Worker){
                        me.options.keywords[lang] = YspCommon.parseKeywords(me.options.transcripts[lang], lang);
                    }
                }
            }
            if(!!window.Worker){
                me.parser.startWorkerKeywordParser(me.options.transcripts);
            }
            else {
                me.options.parsedKeywords.resolve();
            }
            me.options.parsedTranscript.resolve();
        },

        getVideoId: function(){
            var video_id = null;
            if(me.youtube_player && me.youtube_player.getVideoUrl){
                var video_url = me.youtube_player.getVideoUrl();
                video_url = video_url.substring(video_url.indexOf('&v') + 1);
                video_id = video_url.substring(video_url.indexOf('=') + 1);
                if(video_id.indexOf('&') != -1){
                    video_id = video_id.substring(0, video_id.indexOf('&'));
                }
            }
            else {
                console.log('Youtube player is not ready!');
            }
            return video_id;
        }
    };

    return me;

})(YSP, jQuery);