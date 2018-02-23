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