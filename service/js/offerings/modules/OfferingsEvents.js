var voiceBaseOfferings = (function(me, $) {
    "use strict";

    me.events = {
        registerEvents: function() {
            $(document).off('touchstart click', '.vbs-offerings-popup-close, .vbs-offering-btn.vbs-cancel-choose-offer').on('touchstart click', '.vbs-offerings-popup-close, .vbs-offering-btn.vbs-cancel-choose-offer', function(event) {
                me.view.hidePopup();
            });

            $(document).off('touchstart click', '.vbs-offeringCell').on('touchstart click', '.vbs-offeringCell', function(event) {
                $('.vbs-offeringCell').removeClass('selected');
                $(this).addClass('selected');
                var loadingText = 'getting data...';
                me.view.updateTotalCost(loadingText, loadingText);
                var offeringId = $(this).attr('data-offer-id');
                me.api.getOfferingData(offeringId).then(function(data) {
                    me.data.currentOffer = data;
                    var productDescr = data.quality_name + ', ' + data.quality_description + ', ' + data.delivery_description;
                    me.view.updateTotalCost(data.amount_formated, productDescr);
                }, function() {
                    alert('Error of getting offering data!');
                });
            });

            $(document).off('touchstart click', '.vbs-offering-btn.vbs-aggree-btn').on('touchstart click', '.vbs-offering-btn.vbs-aggree-btn', function(event) {
                me.view.confirmOrder();
            });

            $(document).off('touchstart click', '.vbs-offering-btn.vbs-cancel-confirm-offer').on('touchstart click', '.vbs-offering-btn.vbs-cancel-confirm-offer', function(event) {
                me.view.cancelConfirmOrder();
            });

            $(document).off('touchstart click', '.vbs-offering-btn.vbs-confirm-order').on('touchstart click', '.vbs-offering-btn.vbs-confirm-order', function(event) {
                var offeringId = me.data.currentOffer.ref_offering;
                me.view.clearResponseErrorMessage();
                var $loaderContainer = $('.vbs-confirm-order-loader');
                me.view.addLoader($loaderContainer);

                if(me.settings.mode === 'upgrade') {
                    me.api.upgradeTranscript(offeringId).then(function (data) {
                        me.view.removeLoader($loaderContainer);
                        me.view.showResponseOrder(me.settings.mode, data);
                    }, function (errorMessage) {
                        me.view.removeLoader($loaderContainer);
                        me.view.showResponseErrorMessage(errorMessage);
                    });
                }
                else {
                    me.api.uploadMedia(offeringId).then(function (data) {
                        me.view.removeLoader($loaderContainer);
                        me.view.showResponseOrder(me.settings.mode, data);
                    }, function (errorMessage) {
                        me.view.removeLoader($loaderContainer);
                        me.view.showResponseErrorMessage(errorMessage);
                    });
                }
            });

        }
    };

    return me;

})(voiceBaseOfferings, jQuery);