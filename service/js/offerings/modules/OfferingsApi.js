var voiceBaseOfferings = (function(me, $) {
    "use strict";

    me.api = {
        getOfferings: function(callback) {
            var url = me.settings.apiUrl;
            var data = {
                version: me.settings.version,
                apikey: me.settings.apiKey,
                password: me.settings.password,
                action: me.settings.action,
                length: me.settings.mediaLengthInMinutes,
                language: me.settings.language
            };
            $.ajax({
                type: 'GET',
                url: url,
                data: data,
                success: function(data){
                    if(callback){
                        callback(data);
                    }
                },
                error: function(jqXHR, textStatus, errorThrown){
                    console.log(errorThrown + ': Error ' + jqXHR.status);
                }
            });
        },

        getOfferingData: function(offeringId) {
            var deferred = new $.Deferred();
            var url = me.settings.apiUrl.replace('services', 'voice_file');
            url += '/getOfferingData';
            $.ajax({
                type: 'GET',
                url: url,
                data: {
                    offeringId: offeringId,
                    mediaId: me.settings.mediaId,
                    length: me.settings.mediaLengthInMinutes * 60,
                    languageId: 1, // TODO languages,
                    maxFileLength: me.settings.mediaLengthInMinutes * 60
                },
                success: function(data){
                    deferred.resolve(JSON.parse(data));
                },
                error: function(jqXHR, textStatus, errorThrown){
                    console.log(errorThrown + ': Error ' + jqXHR.status);
                    deferred.reject();
                }
            });

            return deferred.promise();
        },

        upgradeTranscript: function(offeringId) {
            var deferred = new $.Deferred();

            var url = me.settings.apiUrl;
            $.ajax({
                type: 'GET',
                url: url,
                data: {
                    version: me.settings.version,
                    apikey: me.settings.apiKey,
                    password: me.settings.password,
                    action: 'upgradeTranscript',
                    mediaId: me.settings.mediaId,
                    offeringID: offeringId
                },
                success: function(data){
                    if(data.requestStatus === 'SUCCESS') {
                        deferred.resolve(data);
                    }
                    else {
                        deferred.reject(data.statusMessage);
                    }
                },
                error: function(jqXHR, textStatus, errorThrown){
                    console.log(errorThrown + ': Error ' + jqXHR.status);
                    deferred.reject(errorThrown + ': Error ' + jqXHR.status);
                }
            });


            return deferred.promise();
        },

        uploadMedia: function(offeringId) {
            var deferred = new $.Deferred();

            var url = me.settings.apiUrl;
            $.ajax({
                type: 'GET',
                url: url,
                data: {
                    version: me.settings.version,
                    apikey: me.settings.apiKey,
                    password: me.settings.password,
                    action: 'uploadMedia',
                    mediaURL: me.settings.mediaUrl,
                    transcriptType: 'human',
                    offeringID: offeringId
                },
                success: function(data) {
                    if(data.requestStatus === 'SUCCESS') {
                        deferred.resolve(data);
                    }
                    else {
                        deferred.reject(data.statusMessage);
                    }
                },
                error: function(jqXHR, textStatus, errorThrown){
                    console.log(errorThrown + ': Error ' + jqXHR.status);
                    deferred.reject(errorThrown + ': Error ' + jqXHR.status);
                }
            });

            return deferred.promise();
        }
    };

    return me;

})(voiceBaseOfferings, jQuery);