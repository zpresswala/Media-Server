(function(){
    "use strict";
    importScripts('../lib/fuse.js', 'modules/YspCommon.js');

    self.onmessage = function(e) {
        var transcript = e.data.transcript;
        var lang = e.data.lang;
        var res =  YspCommon.parseKeywords(transcript, lang);
        self.postMessage({response: res, lang: lang});
    };

})();
