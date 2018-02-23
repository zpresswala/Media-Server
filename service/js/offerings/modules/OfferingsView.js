var voiceBaseOfferings = (function(me, $) {
    "use strict";

    me.view = {
        createPopup: function() {
            me.view.removePopup();
            var $popup = $(me.view.getTemplate('offeringPopup'));
            me.view.addLoader($popup.find('.vbs-offerings-popup-body'));
            $('body').append($popup);
        },

        createOfferTable: function(offerData) {
            var deliveryCheck = {
                'vbs-delivery-1': {name: "1 Day", hasInResponse: false},
                'vbs-delivery-2-4': {name: "2-4 Days", hasInResponse: false},
                'vbs-delivery-5-7': {name: "5-7 Days", hasInResponse: false}
            };
            var accuracyCheck = {
                'vbs-accuracy-econo': {name: "Econo 90-95%", hasInResponse: false, values: {}},
                'vbs-pro-98': {name: "Pro 98%", hasInResponse: false, values: {}},
                'vbs-pro-plus-98': {name: "Pro+ 98%", hasInResponse: false, values: {}},
                'vbs-premium-99': {name: "Premium 99%", hasInResponse: false, values: {}},
                'vbs-premium-plus-99': {name: "Premium+ 99%", hasInResponse: false, values: {}}
            };
            offerData.offerings.forEach(function(offering) {
                var findDelivery = me.view.getKeyByName(deliveryCheck, offering.deliveryTime);
                if(findDelivery) {
                    deliveryCheck[findDelivery].hasInResponse = true;
                }

                var findAccurancy = me.view.getItemByName(accuracyCheck, offering.accuracy);
                if(findAccurancy) {
                    findAccurancy.hasInResponse = true;
                    findAccurancy.values[findDelivery] = {
                        id: offering.offeringId,
                        cost: offering.cost,
                        productPrice: offering.productPrice
                    };
                }

            });

            var $table = $(me.view.getTemplate('offeringTable'));
            for (var key in deliveryCheck) {
                if(!deliveryCheck[key].hasInResponse) {
                    $table.find(key).remove();
                }
            }
            for (key in accuracyCheck) {
                if(!accuracyCheck[key].hasInResponse) {
                    $table.find(key).remove();
                }
                else {
                    for (var i in accuracyCheck[key].values) {
                        var value = accuracyCheck[key].values[i];
                        var sem = me.view.getTemplate('offeringCell', {
                            offeringId: value.id,
                            productPrice: value.productPrice
                        });
                        $table.find('.' + key).find('.' + i).html(sem);
                    }
                }
            }

            $('.vbs-offerings-popup').find('.vbs-choose-offer-container').empty().append($table);
            me.view.removeLoader($('.vbs-offerings-popup').find('.vbs-offerings-popup-body'));
            var buttonsSem = me.view.getTemplate('offeringButtons');
            $('.vbs-humanRequest').after(buttonsSem);
            $('#offering_6').click();
        },

        updateTotalCost: function(costValue, productDescription) {
            $('.vbs-humanCost').remove();

            var totalSem = me.view.getTemplate('totalInfo', {
                mediaLength: me.settings.mediaLengthInMinutes,
                costValue: costValue,
                productDescription: productDescription
            });
            $('.vbs-humanRequest').after(totalSem);
        },

        createConfirmationPage: function() {
            var offer = me.data.currentOffer;

            var percentIndex = offer.quality_description.indexOf('%');
            var percent = offer.quality_description.substring(percentIndex - 2, percentIndex);
            var confirmationPage = me.view.getTemplate('confirmationPage', {
                recordName: me.settings.recordName,
                mediaLengthInMinutes: me.settings.mediaLengthInMinutes,
                amount: offer.amount_formated,
                deliveryDescription: offer.delivery_description,
                qualityDescription: offer.quality_description,
                percent: percent
            });
            $('.vbs-offerings-popup').find('.vbs-confirm-offer-container').empty().append(confirmationPage);

        },

        confirmOrder: function() {
            $('.vbs-offerings-popup').find('.vbs-offerings-popup-header-title').text('Order Details');
            me.view.createConfirmationPage();

            var $offerContainer = $('.vbs-offerings-popup').find('.vbs-confirm-offer-container');
            $('.vbs-offerings-popup').find('.vbs-choose-offer-container').hide();
            $offerContainer.show();
        },

        cancelConfirmOrder: function() {
            $('.vbs-offerings-popup').find('.vbs-offerings-popup-header-title').text('Choose the Accuracy and Delivery You Need');
            $('.vbs-offerings-popup').find('.vbs-choose-offer-container').show();
            $('.vbs-offerings-popup').find('.vbs-confirm-offer-container').hide();
        },

        showResponseOrder: function (mode, data) {
            $('.vbs-confirmation-buttons').hide();
            var $info = $('.vbs-confirmation-response-info');
            var template;
            if(mode === 'upgrade') {
                template = me.view.getTemplate('upgradeTranscriptResponseInfo', {
                    mediaId: me.settings.mediaId
                });
            }
            else if(mode === 'new') {
                template = me.view.getTemplate('uploadMediaResponseInfo', {
                    mediaId: data.mediaId,
                    fileUrl: data.fileUrl
                });
            }
            $info.find('.vbs-response-message-container').empty().append(template);
            $info.show();
        },

        showResponseErrorMessage: function (errorMessage) {
            $('.vbs-response-error-message').empty().append('Error: ' + errorMessage);
        },

        clearResponseErrorMessage: function () {
            $('.vbs-response-error-message').empty();
        },

        getKeyByName: function(itemsCollection, name) {
            var _key = null;
            for (var key in itemsCollection) {
                if(itemsCollection[key].name === name) {
                    _key = key;
                    break;
                }
            }
            return _key;
        },

        getItemByName: function(itemsCollection, name) {
            var accuracy = null;
            for (var key in itemsCollection) {
                if(itemsCollection[key].name === name) {
                    accuracy = itemsCollection[key];
                    break;
                }
            }
            return accuracy;
        },

        addLoader: function($container) {
            $container.append(me.view.getTemplate('ajaxLoader'));
        },

        removeLoader: function($container) {
            $container.find('.vbs-ajax-loader').remove();

        },

        showPopup: function() {
            $('.vbs-offerings-popup').show();
        },

        hidePopup: function() {
            $('.vbs-offerings-popup').hide();
        },

        removePopup: function() {
            $('.vbs-offerings-popup').remove();
        },

        getTemplate: function(name, vars) {
            if(!me.templates[name]) return '';
            var template = me.templates[name]();
            for (var i in vars) {
                var rex = new RegExp("{{\\s*" + i + "\\s*}}", "gi");
                template = template.replace(rex, vars[i]);
            }
            return template;
        }
    };

    return me;

})(voiceBaseOfferings, jQuery);