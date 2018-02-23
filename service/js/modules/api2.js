/*
 * VB.api 2.0
 * Interaction with the server REST API
 * */
voiceBase = (function(VB, $) {
    "use strict";

    VB.api2_0 = {
        getToken: function(parameters) {
            var username = VB.settings.apiKey;
            var password = VB.settings.password;

            var url = VB.settings.apiUrl + 'access/users/+' + username.toLowerCase() + '/tokens';

            $.ajax({
                type: 'GET',
                url: url,
                headers: {
                    'Authorization': 'Basic ' + btoa(username + ':' + password)
                },
                success: function(data){
                    if(data.tokens && data.tokens.length > 0) {
                        VB.api.setToken({
                            token: data.tokens[0].token,
                            requestStatus: "SUCCESS"
                        });
                    }
                },
                error: function(jqXHR, textStatus, errorThrown){
                    console.log(errorThrown + ': Error ' + jqXHR.status);
                }
            });
        },

        getMetaData: function() {
            var url = VB.settings.apiUrl + 'media/' + VB.settings.mediaId;

            $.ajax({
                type: 'GET',
                url: url,
                beforeSend: function(xhr) {
                    xhr.setRequestHeader('Authorization', 'Bearer ' + VB.settings.token);
                },
                success: function(data) {
                    var media = data.media;

                    var metadata = {
                        requestStatus: "PLUGIN"
                    };
                    if(media && media.metadata && !$.isEmptyObject(media.metadata)) {
                        metadata = {
                            requestStatus: "SUCCESS",
                            response: {
                                lengthMs: media.metadata.length.milliseconds
                            }
                        };
                    }
                    VB.api.setMetaData(metadata);

                    if(media) {
                        if(media.keywords && media.keywords.latest) {
                            var keywords = media.keywords.latest;
                            var keywordsData = {
                                requestStatus: "SUCCESS",
                                keywords: keywords.words || [],
                                categories: keywords.categories || {},
                                groups: keywords.groups || []
                            };
                            VB.api.setKeywords(keywordsData);
                        }
                        if(media.transcripts && media.transcripts.latest) {
                            var transcript = media.transcripts.latest;
                            var transcriptsData = {
                                requestStatus: "SUCCESS",
                                transcriptType: transcript.type,
                                transcript: transcript.words
                            };
                            VB.api.setTranscript(transcriptsData);
                        }
                        VB.api.ready.comments = true; // TODO comments in api 2.0
                    }
                },
                error: function(jqXHR, textStatus, errorThrown){
                    console.log(errorThrown + ': Error ' + jqXHR.status);
                }
            });
        }

    };

    return VB;
})(voiceBase, jQuery);