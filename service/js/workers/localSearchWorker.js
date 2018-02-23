(function() {
    "use strict";

    importScripts('../lib/fuse.min.js', 'localSearchHelper.js');

    self.onmessage = function(e) {
        var results = localSearchHelper.localTranscriptSearch(e.data.transcript, e.data.terms);
        self.postMessage({results: results});
    };

})();