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
var voiceBaseOfferings = (function(me, $) {
    "use strict";

    me.templates = {
        offeringPopup: function() {
            return '' +
                '<div class="vbs-offerings-popup">' +
                '   <div class="vbs-offerings-popup-header">' +
                '       <h2 class="vbs-offerings-popup-header-title">Choose the Accuracy and Delivery You Need</h2>' +
                '       <a href="javascript:void(0)" class="vbs-offerings-popup-close">x</a>' +
                '   </div>' +
                '   <div class="vbs-offerings-popup-body">' +
                '       <div class="vbs-choose-offer-container"></div>' +
                '       <div class="vbs-confirm-offer-container"></div>' +
                '   </div>' +
                '   <div class="vbs-offerings-popup-footer">' +
                '       ' +
                '   </div>' +
                '</div>';
        },

        ajaxLoader: function() {
            return '' +
                '<div class="vbs-ajax-loader"></div>';
        },

        offeringTable: function() {
            return '<div class="vbs-humanRequest">' +
                '<table>' +
                '   <thead>' +
                '       <th class="vbs-summary">Accuracy</th>' +
                '       <th class="vbs-delivery vbs-delivery-1">1 Day</th>' +
                '       <th class="vbs-delivery vbs-delivery-2-4">2-4 Days</th>' +
                '       <th class="vbs-delivery vbs-delivery-5-7">5-7 Days</th>' +
                '       <th style="width: 140px;"># Human Reviews</th>' +
                '       <th class="vbs-last">Recommended for</th>' +
                '   </thead>' +
                '   <tbody>' +
                '       <tr class="vbs-accuracy-row vbs-accuracy-econo">' +
                '           <td class="vbs-accuracy">' +
                '               <h5>Econo 90-95%</h5>' +
                '               <span class="vbs-accuracy-label">Speaker Turns</span>' +
                '           </td>' +
                '           <td class="vbs-delivery vbs-delivery-1"></td>' +
                '           <td class="vbs-delivery vbs-delivery-2-4"></td>' +
                '           <td class="vbs-delivery vbs-delivery-5-7"></td>' +
                '           <td class="vbs-review">' +
                '               <strong>1</strong><br>' +
                '               <span>human review</span>' +
                '           </td>' +
                '           <td class="vbs-recommended">' +
                '               <span>Lectures, sermons, drafts, SEO and documents which will be edited, lowest price</span>' +
                '           </td>' +
                '       </tr>' +
                '       <tr class="vbs-accuracy-row vbs-pro-98">' +
                '           <td class="vbs-accuracy">' +
                '               <h5>Pro 98%</h5>' +
                '               <span class="vbs-accuracy-label">Speaker Turns</span>' +
                '           </td>' +
                '           <td class="vbs-delivery vbs-delivery-1"></td>' +
                '           <td class="vbs-delivery vbs-delivery-2-4"></td>' +
                '           <td class="vbs-delivery vbs-delivery-5-7"></td>' +
                '           <td class="vbs-review" rowspan="2">' +
                '               <strong>2</strong><br>' +
                '               <span>human reviews</span>' +
                '           </td>' +
                '           <td class="vbs-recommended" rowspan="2">' +
                '               <span>Interviews, webinars, corporate, research & most other use cases. Generally OK for internal distribution with little or no reviews.</span>' +
                '           </td>' +
                '       </tr>' +
                '       <tr class="vbs-accuracy-row vbs-pro-plus-98">' +
                '           <td class="vbs-accuracy">' +
                '               <h5>Pro+ 98%</h5>' +
                '               <span class="vbs-accuracy-label">Speaker ID</span>' +
                '           </td>' +
                '           <td class="vbs-delivery vbs-delivery-1"></td>' +
                '           <td class="vbs-delivery vbs-delivery-2-4"></td>' +
                '           <td class="vbs-delivery vbs-delivery-5-7"></td>' +
                '       </tr>' +
                '       <tr class="vbs-accuracy-row vbs-premium-99">' +
                '           <td class="vbs-accuracy">' +
                '               <h5>Premium 99%</h5>' +
                '               <span class="vbs-accuracy-label">Speaker Turns</span>' +
                '           </td>' +
                '           <td class="vbs-delivery vbs-delivery-1"></td>' +
                '           <td class="vbs-delivery vbs-delivery-2-4"></td>' +
                '           <td class="vbs-delivery vbs-delivery-5-7"></td>' +
                '           <td class="vbs-review" rowspan="2">' +
                '               <strong>3</strong><br>' +
                '               <span>human reviews</span>' +
                '           </td>' +
                '           <td class="vbs-recommended" rowspan="2">' +
                '               <span>Critical or legal matters, published content, highest possible accuracy.</span>' +
                '           </td>' +
                '       </tr>' +
                '       <tr class="vbs-accuracy-row vbs-premium-plus-99 vbs-row-last">' +
                '           <td class="vbs-accuracy">' +
                '               <h5>Premium+ 99%</h5>' +
                '               <span class="vbs-accuracy-label">Speaker ID</span>' +
                '           </td>' +
                '           <td class="vbs-delivery vbs-delivery-1"></td>' +
                '           <td class="vbs-delivery vbs-delivery-2-4"></td>' +
                '           <td class="vbs-delivery vbs-delivery-5-7"></td>' +
                '       </tr>' +
                '   </tbody>' +
                '</table>' +
                '</div>';
        },

        offeringCell: function() {
            return '' +
                '<div class="block vbs-offeringCell" id="offering_{{ offeringId }}" data-offer-id="{{ offeringId }}">' +
                '   <strong>{{ productPrice }}</strong>' +
                '   <span> per min</span>' +
                '</div>';
        },

        totalInfo: function() {
            return '' +
                '<div class="vbs-humanCost">' +
                '   <div class="vbs-cost">' +
                '       <span class="vbs-cost-label">Total Cost to Transcribe File ({{ mediaLength }}m): </span>' +
                '       <span class="vbs-cost-value">{{ costValue }}</span>' +
                '   </div>' +
                '   <small class="vbs-product-description">' +
                '       <span class="vbs-product-description-label">Selection</span>' +
                '       <span class="vbs-product-description-value">{{ productDescription }}</span>' +
                '   </small>' +
                '</div>';
        },

        offeringButtons: function() {
            return '' +
                '<div class="vbs-offering-buttons">' +
                '   <span>' +
                '       <input type="submit" name="main" value="Continue" class="vbs-offering-btn vbs-aggree-btn">' +
                '   </span>' +
                '   <span>' +
                '       <a href="javascript:void(0)" class="vbs-offering-btn vbs-cancel-btn vbs-cancel-choose-offer">Cancel</a>' +
                '   </span>' +
                '   <div class="vbs-human-terms">' +
                '       by ordering you agree to our ' +
                '       <a href="http://www.voicebase.com/terms-of-use" target="_blank">Terms of Use</a>' +
                '   </div>' +
                '</div>';
        },

        confirmationPage: function() {
            return '' +
                '<div class="vbs-confirm-offer-inner-container">' +
                '   <ul class="vbs-order-details">' +
                '       <li class="vbs-order-details-title">' +
                '           <dl>' +
                '               <dt>Record Name</dt>' +
                '               <dd class="vbs-dd-length">Length</dd>' +
                '               <dd>Rate</dd>' +
                '               <dd class="vbs-dd-last">Cost</dd>' +
                '           </dl>' +
                '       </li>' +
                '       <li>' +
                '           <dl>' +
                '               <dt class="vbs-record-name">{{ recordName }}</dt>' +
                '               <dd class="vbs-dd-length">{{ mediaLengthInMinutes }}</dd>' +
                '               <dd></dd>' +
                '               <dd class="vbs-dd-last">{{ amount }}</dd>' +
                '           </dl>' +
                '       </li>' +
                '       <li class="vbs-order-details-total">' +
                '           <dl>' +
                '               <dt>TOTAL:</dt>' +
                '               <dd class="vbs-dd-length">{{ mediaLengthInMinutes }}</dd>' +
                '               <dd></dd>' +
                '               <dd class="vbs-dd-last">{{ amount }}</dd>' +
                '           </dl>' +
                '       </li>' +
                '   </ul>' +
                '   <div class="vbs-clearfix"></div>' +
                '   <p>{{ qualityDescription }}, {{ deliveryDescription }} <br></p>' +
                '   <div class="vbs-form-group vbs-field-orderform-notesfortranscriber">' +
                '       <textarea class="vbs-form-field vbs-form-textarea vbs-orderform-notesfortranscriber" name="OrderForm[notesForTranscriber]" rows="3" cols="50" placeholder="Notes for transcriber: names, brand names, acronyms, and other words to help create an accurate transcript. We cannot change the order here. Do NOT request price changes or partial transcription of the recording."></textarea>' +
                '   </div>' +
                '   <div class="vbs-offer-text">' +
                '       <div>&gt;{{ percent }}% of intelligible content will be transcribed. </div>' +
                '       <div>Best efforts will be made to identify speakers </div>' +
                '       <div>Unintelligible content will not be transcribed. </div>' +
                '       <div>Extremely bad audio will be rejected. </div>' +
                '       <div>Transcript will be delivered by email</div>' +
                '       <div>and on the individual recording playback page within the specified time</div>' +
                '   </div>' +
                '   <div>' +
                '       <div class="vbs-offer-text2" dir="ltr">Transcription quality and delivery are highly dependent on a variety of factors including, but not limited to, audio quality, accents, background noise, and speaker fluency. Accuracy is measured relative to the intelligible portion of the recording.</div>' +
                '       <div class="vbs-offer-text2" dir="ltr">' +
                '           Speaker identification works best with 2-5 speakers. More than 5 speaker may delay the transcript and may have some misidentification.. <br>' +
                '       </div> <br>' +
                '       <p class="vbs-offer-text2 vbs-mt0" dir="ltr">Customers maximum and sole remedy in the event of errors or any alleged damages arising from any aspect of transcript quality or delivery is a refund of the original transcript price.</p>' +
                '   </div>' +
                '</div>' +
                '<div class="vbs-response-error-message"></div>' +
                '<div class="vbs-confirmation-response-info">' +
                '   <div class="vbs-response-message-container"></div>' +
                '   <div class="vbs-close-btn">' +
                '       <span>' +
                '           <a href="javascript:void(0)" class="vbs-offering-btn vbs-cancel-btn vbs-offerings-popup-close">Close</a>' +
                '       </span>' +
                '   </div>' +
                '</div>' +
                '<div class="vbs-confirm-order-loader"></div>' +
                '<div class="vbs-confirmation-buttons">' +
                '   <span>' +
                '       <input type="submit" name="main" value="Place Your Order" class="vbs-offering-btn vbs-aggree-btn vbs-confirm-order">' +
                '   </span>' +
                '   <span>' +
                '       <a href="javascript:void(0)" class="vbs-offering-btn vbs-cancel-btn vbs-cancel-confirm-offer">Cancel</a>' +
                '   </span>' +
                '</div>';
        },

        uploadMediaResponseInfo: function() {
            return '' +
                '<div class="vbs-response-message">' +
                '   <strong>Your order is successfully accepted!</strong>' +
                '</div>' +
                '<div class="vbs-response-message-label">Media id: {{ mediaId }}</div>' +
                '<div class="vbs-response-message-label">File url: <a href="{{ fileUrl }}" target="_blank">{{ fileUrl }}</a></div>';
        },

        upgradeTranscriptResponseInfo: function() {
            return '' +
                '<div class="vbs-response-message">' +
                '   <strong>Your order is successfully accepted!</strong>' +
                '</div>' +
                '<div class="vbs-response-message-label">Media id: {{ mediaId }}</div>';
        }

    };

    return me;

})(voiceBaseOfferings, jQuery);
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