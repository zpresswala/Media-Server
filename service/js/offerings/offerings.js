var voiceBaseOfferings = (function($) {
    "use strict";

    var me = {};

    me.init = function(_settings) {
        me.reSettings(_settings);
        me.view.createPopup();
        me.view.showPopup();
        me.events.registerEvents();
        me.api.getOfferings(function(data) {
            me.view.createOfferTable(data);
        });
    };

    me.reSettings = function(_settings) {
        me.settings = $.extend(true, me.settings, _settings);
    };

    me.settings = {
        apiUrl: '',
        version: '1.1',
        action: 'getOfferings',
        apiKey: '',
        password: '',
        mediaId: '',
        mediaLengthInMinutes: 0,
        language: 'en',
        recordName: '',
        mode: 'upgrade',
        mediaUrl: ''
    };

    me.data = {
        currentOffer: null
    };

    return me;
})(jQuery);