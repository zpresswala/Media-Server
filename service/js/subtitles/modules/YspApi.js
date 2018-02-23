var YSP = (function(me, $) {
    "use strict";

    me.youtube_player = null;
    me.options = null;

    me.api = {
        init: function(player_id){
            me.options = {
                player_id: player_id,
                youtube_subtitles: {},
                transcripts: {},
                keywords: {},
                languages: [],
                parsedLanguages: null, // deffered
                parsedTranscript: $.Deferred(),
                parsedKeywords: $.Deferred()
            };
            me.youtube_player = document.getElementById(player_id);
            me.options.video_id = me.parser.getVideoId();
            if(!me.youtube_player && !me.options.video_id) {
                console.log('Player Id was wrong!');
            }

            me.api.getSubtitles();
        },

        getSubtitles: function(){
            me.parser.getLangs();
        },

        getLanguages: function(callback){
            me.options.parsedLanguages.done(function(){
                 if(callback){
                     callback({
                         languages: me.options.languages
                     });
                 }
            });
        },

        getTranscript: function(callback){
            me.options.parsedTranscript.done(function(){
                if(callback){
                    callback({
                        transcripts: me.options.transcripts
                    });
                }
            });
        },

        getKeywords: function(callback){
            me.options.parsedKeywords.done(function(){
                if(callback){
                    callback({
                        keywords: me.options.keywords
                    });
                }
            });
        }
    };

    return me;

})(YSP, jQuery);