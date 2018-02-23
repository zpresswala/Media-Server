/*
 * Module for speaker functionality
 * */
voiceBase = (function(VB, $) {
    "use strict";

    jQuery.extend(jQuery.expr[':'], {
        "speakertime": function(element, i, match, elements) {
            var s = parseFloat($(element).attr('s'));
            var e = parseFloat($(element).attr('e'));
            var minMaxValues = match[3].split(/\s?,\s?/);
            var value = parseFloat(minMaxValues[0]);
            return !isNaN(s) && !isNaN(e) && !isNaN(value) && value <= e && value >= s;
        }
    });

    VB.speakers = {
        inSpeakers: function (needleName) {
            for (var iss in VB.data.speakers) {
                if (VB.data.speakers[iss].toLowerCase() == needleName.toLowerCase())
                    return true;
            }
            return false;
        },

        getSpeakerNameByKey: function(key) {
            return typeof VB.data.speakers[key] != 'undefined' ? VB.data.speakers[key] : '';
        },

        getSpeakerKeyByName: function(name) {
            for (var iss in VB.data.speakers) {
                if (VB.data.speakers[iss].toLowerCase() == name.toLowerCase())
                    return iss;
            }
            return '';
        },

        setSpeakerName: function(speakerKey, newSpeakerName){
            for (var iss in VB.data.speakers) {
                if (iss === speakerKey){
                    VB.data.speakers[iss] = newSpeakerName;
                    return true;
                }
            }
            return false;
        },

        addSpeakerKey: function(speaker_name){
            if (speaker_name && !VB.speakers.inSpeakers(speaker_name) && speaker_name != '>>') {
                var num = Object.keys(VB.data.speakers).length + 1;
                VB.data.speakers['vbs-sp' + num + 'o'] = speaker_name;
            }
        },

        filterResultForSpeaker: function(time) {
            if (typeof VB.settings.filterSpeaker == 'undefined' || VB.settings.filterSpeaker == 'all') {
                return true;
            }
            for (var sp in VB.data.allSpeakers) {
                if (time * 1000 > parseFloat(VB.data.allSpeakers[sp].t) &&
                    ((typeof VB.data.allSpeakers[parseInt(sp) + 1] != 'undefined' && time * 1000 <= parseFloat(VB.data.allSpeakers[parseInt(sp) + 1].t)) ||
                    (typeof VB.data.allSpeakers[parseInt(sp) + 1] == 'undefined' && time * 1000 <= VB.data.duration * 1000)) &&
                    VB.speakers.getSpeakerKeyByName(VB.data.allSpeakers[parseInt(sp)].s) == VB.settings.filterSpeaker
                ) {
                    return true;
                }
            }
            return false;
        },

        filterSpeakersList: function(speakers) {
            VB.helper.find('.vbs-select-dropdown li').removeClass('vbs-disabled').each(function(){
                var $this = $(this);
                var sp = $this.attr('data-speaker');
                if(speakers.indexOf(sp) < 0 && sp != 'all') {
                    $this.addClass('vbs-disabled');
                }
            });
        },

        parseSpeakersInCategory: function(category, speakersName, speakersArray){
            for (var si in category.speakers) {
                var speaker_name = VB.helper.replaceAndTrim(category.speakers[si]);
                VB.speakers.addSpeakerKey(speaker_name);
                if (!VB.common.inArrayV(speakersName, speaker_name)) {
                    var num = Object.keys(speakersArray).length + 1;
                    speakersName.push(speaker_name);
                    speakersArray.push('vbs-sp' + num + 'o');
                }
            }

            var isps = [];
            if (typeof category.speakers != "undefined" && category.speakers.length) {
                for (var isp in category.speakers) {
                    isps.push(VB.speakers.getSpeakerKeyByName(VB.helper.replaceAndTrim(category.speakers[isp])));
                }
            }
            isps.join();

            return {
                isps: isps,
                speakersName: speakersName,
                speakersArray: speakersArray
            };

        },

        createSpeakerAttr: function(transcriptWord){
            var isTurn = VB.helper.isTurn(transcriptWord.m);
            var clearWord = VB.helper.getClearWordFromTranscript(transcriptWord.w);
            var speakerName = (isTurn) ? clearWord : false;
            var sptag = '';
            if(speakerName) {
                VB.speakers.addSpeakerKey(speakerName);
                var speakerKey = VB.speakers.getSpeakerKeyByName(speakerName);
                sptag ='m="' + speakerKey + '"';
            }
            return sptag;
        },

        /*
         * show "{{Speaker}} is speaking" in player heading
         * */
        speakerIsSpeaking: function() {
            var ct = VB.data.position * 1000;
            var curspeaker = $('.vbs-speakers > div:speakertime(' + ct + ')');
            if (curspeaker.length) {
                var speakerKey = curspeaker.attr('cnum');
                var speakerName = VB.speakers.getSpeakerNameByKey(speakerKey);
                if (typeof speakerName != 'undefined' && (VB.data.lspeaker != speakerName && speakerName.trim() != '>>')) {
                    VB.data.lspeaker = speakerName;
                    var spblock = VB.templates.parse('speakerIsSpeaking', {
                        speakerKey: speakerKey,
                        speakerName: speakerName
                    });
                    VB.helper.find('.vbs-voice-name').html(spblock);
                    VB.helper.adjustMediaTime();
                }
            } else {
                VB.helper.find('.vbs-voice-name').html('');
            }
        },

        speakersWidget: function() {
            var speakers = [];
            var snn = 1;
            var $transcript_wrapper = VB.helper.find('.vbs-transcript-block .vbs-transcript-wrapper');
            $transcript_wrapper.find('span.w[m]').each(function(index) {
                var $this = $(this);
                var spitem = {};
                spitem.s = VB.speakers.getSpeakerNameByKey($this.attr('m'));
                spitem.t = $this.attr('t');
                speakers.push(spitem);
                var br = "", spclass;
                if (VB.settings.turnTimes) {
                    if (spitem.s.trim() == '>>') {
                        spclass = snn % 2 ? 'vbs-sp1' : 'vbs-sp2';
                        snn++;
                    } else {
                        spclass = VB.speakers.getSpeakerKeyByName(spitem.s);
                    }
                    br += VB.templates.parse('speakerTranscriptLabel', {
                        spClass: spclass,
                        speakerName: spitem.s,
                        speakerTime: VB.helper.parseTime(spitem.t / 1000)
                    });
                }
                jQuery(br).insertBefore(this);
            });
            if (snn > 1) {
                $transcript_wrapper.addClass('vbs-machine');
            }
            snn = 1;
            VB.data.allSpeakers = speakers;
            if (speakers.length) {
                VB.speakers.renderSpeakersInTimeline();
                if (snn > 1) {
                    $speakers.addClass('vbs-machine');
                    VB.helper.find('.vbs-media-block .vbs-section-title, .vbs-time-name-wrapper-narrow').addClass('vbs-machine');
                }
            }
        },

        renderSpeakersInTimeline: function() {
            var $transcript_wrapper = VB.helper.find('.vbs-transcript-block .vbs-transcript-wrapper');
            var speakers = VB.data.allSpeakers;
            if (speakers.length) {
                if (VB.settings.turnTimes) {
                    $transcript_wrapper.addClass('vbs-turntimes');
                }
                var wrapperWidth = VB.helper.find('.vbs-record-timeline-wrap').width() - 1;
                var speakers_string = '';
                for (var i in speakers) {
                    speakers[i].s = VB.helper.replaceAndTrim(speakers[i].s);
                    var position = ((speakers[i].t) / 1000 * wrapperWidth) / VB.data.duration;
                    var width;
                    if (typeof speakers[parseFloat(i) + 1] !== "undefined") {
                        width = ((speakers[parseFloat(i) + 1].t - speakers[parseFloat(i)].t) / 1000 * wrapperWidth) / VB.data.duration;
                    } else {
                        width = ((VB.data.duration - (speakers[parseFloat(i)].t) / 1000) * wrapperWidth) / VB.data.duration;
                    }
                    var end;
                    if (typeof speakers[parseFloat(i) + 1] !== "undefined") {
                        end = parseFloat(speakers[parseFloat(i) + 1].t);
                    } else {
                        end = VB.data.duration * 1000;
                    }
                    var colorclass;
                    if (speakers[i].s.trim() == '>>') {
                        colorclass = snn % 2 ? 'vbs-sp1' : 'vbs-sp2';
                        snn++;
                    } else {
                        colorclass = VB.speakers.getSpeakerKeyByName(speakers[i].s);
                    }
                    speakers_string += " " + VB.templates.parse('speakersTemplate', {
                        'position': position,
                        'width': width,
                        's': parseFloat(speakers[parseFloat(i)].t),
                        'e': end,
                        'speaker': speakers[i].s,
                        'colorclass': colorclass
                    });
                }

                var $speakers = VB.helper.find('.vbs-speakers');
                $speakers.html(speakers_string);
            }
        },

        speakerFilterWidget: function(speakers) {
            var speakers_string = '<li data-speaker="all">All Speakers</li>';
            for (var sp in speakers) {
                speakers_string += '<li data-speaker="' + sp + '">' + speakers[sp] + '</li>';
            }
            VB.helper.find('.vbs-search-form').removeClass('vbs-no-speaker');
            if(!VB.settings.searchBarOuter){
                var $keywordsBlock = VB.helper.findc("#" + VB.settings.keywordsBlock);
                var $keywords_wrapper = VB.helper.find('.vbs-keywords-wrapper');
                if ($keywordsBlock.width() < VB.settings.mediumResponsiveWithSpeakers && $keywordsBlock.width() >= VB.settings.minResponsive) {
                    $keywordsBlock.addClass('less-600px');
                    $keywords_wrapper.height($keywords_wrapper.height() - 55);
                }
            }
            VB.helper.find('.vbs-select-speaker-wrapper .vbs-select-dropdown').html(speakers_string);
        },

        resizeSpeakers: function(){
            VB.speakers.renderSpeakersInTimeline();
        },

        /*
        * Insert speaker in editor
        * */
        createInsertSpeakerDialog: function($insertMenuItem) {
            $('.vbs-insert-speaker-popup').remove();

            var $menu = $insertMenuItem.parents('.vbs-vbcmenu');
            var $editWrapper = $('.vbs-edit-mode-wrapper');
            $editWrapper.append(VB.templates.parse('insertSpeakerPopup'));

            var $selectSpeaker = $('.vbs-select-insert-speaker-wrapper');
            var $dropdown = $selectSpeaker.find('.vbs-select-dropdown');

            var speakers_keys = VB.speakers.getSpeakersFromEditor();

            var sem = VB.templates.get('firstSpeakerItem');
            for (var i = 0; i < speakers_keys.length; i++) {
                var speaker_key = speakers_keys[i];
                var speaker_name = VB.speakers.getSpeakerNameByKey(speaker_key);
                sem += VB.templates.parse('speakerItem', {
                    speaker_name: speaker_name,
                    speaker_key: speaker_key
                });
            }
            $dropdown.html(sem);

            $('.vbs-insert-speaker-popup').css({
                top: $menu.offset().top + $editWrapper.scrollTop(),
                left: $menu.offset().left
            }).fadeIn(function(){
                $('.vbs-insert-speaker-input').focus();
            });
        },

        selectSpeakerInInsertDialog: function($speakerItem){
            $speakerItem.parents('.vbs-select-dropdown').fadeOut('fast');
            var $speakerTitle = $('.vbs-select-insert-speaker');

            var $resultSimple = $speakerTitle.find('.vbs-speaker-selected');
            var $inputNewSpeakerWrapper = $('.vbs-speaker-input-wrapper');
            var speakerKey = $speakerItem.attr('data-speaker-key');
            if(!speakerKey) {
                var $input = $inputNewSpeakerWrapper.find('.vbs-insert-speaker-input');
                $inputNewSpeakerWrapper.show();
                $speakerTitle.addClass('vbs-new-speaker');
                $resultSimple.html('Insert new speaker');
                setTimeout(function(){
                    $input.focus();
                }, 0);
            }
            else {
                var name = VB.speakers.getSpeakerNameByKey(speakerKey);
                $speakerTitle.removeClass('vbs-new-speaker').attr('data-speaker-key', speakerKey);
                $inputNewSpeakerWrapper.hide();
                $resultSimple.html(name);
            }
            $speakerTitle.removeClass('vbs-s-show');
        },

        insertSpeakerToEditor: function(){
            var selected = $('.vbs-edit-mode-wrapper').find('.vbs-menu-target');
            var stime = $(selected).attr('t');

            var $speakerTitle = $('.vbs-select-insert-speaker');

            var speakerName, speakerKey;
            if($speakerTitle.hasClass('vbs-new-speaker')) {
                speakerName = $('.vbs-insert-speaker-input').val();
                VB.speakers.addSpeakerKey(speakerName);
                speakerKey = VB.speakers.getSpeakerKeyByName(speakerName);
            }
            else {
                speakerKey = $speakerTitle.attr('data-speaker-key');
                speakerName = VB.speakers.getSpeakerNameByKey(speakerKey);
            }
            if(!selected.prev().hasClass('vbs-edit-speaker') && speakerKey){
                var insertText = VB.templates.parse('insertSpeakerText', {
                    speakerKey: speakerKey,
                    speakerTime: stime,
                    speakerName: speakerName
                });
                selected.first().before(insertText);
            }
        },

        getSpeakersFromEditor: function(){
            var unique_speakers = [];
            var speakersElements = $('.vbs-edit-speaker');
            speakersElements.each(function(){
                var key = $(this).attr('m');
                var findingSpeaker = unique_speakers.filter(function(_key){
                    return _key === key;
                });
                if(!findingSpeaker.length) {
                    unique_speakers.push(key);
                }
            });
            return unique_speakers;
        },

        findSpeakerElementsInEditor: function(speakerKey){
            var $editWrapper = $('.vbs-edit-mode-wrapper');
            var speakersElements = [];
            $editWrapper.find('.vbs-edit-speaker').each(function(){
                var key = $(this).attr('m');
                if(speakerKey === key) {
                    speakersElements.push($(this));
                }
            });
            return speakersElements;
        },

        /*
         * Rename speaker in editor
         * */
        createRenameSpeakerDialog: function($renameMenuItem){
            $('.vbs-rename-speaker-popup').remove();
            VB.speakers.enableRenameAllSpeakersInEditor();

            var $menu = $renameMenuItem.parents('.vbs-vbcmenu');
            var currentSpeakerKey = $renameMenuItem.attr('data-speaker-key');
            var currentSpeakerName = VB.speakers.getSpeakerNameByKey(currentSpeakerKey);
            var $editWrapper = $('.vbs-edit-mode-wrapper');
            $editWrapper.append(VB.templates.parse('renameSpeakerPopup', {
                current_speaker_key: currentSpeakerKey,
                current_speaker_name: currentSpeakerName
            }));

            VB.speakers.disableRenameSpeakersInEditor(currentSpeakerKey);

            setTimeout(function(){
                $('#vbs-rename_speaker_input').focus();
            }, 0);

            $('.vbs-rename-speaker-popup').css({
                top: $menu.offset().top + $editWrapper.scrollTop(),
                left: $menu.offset().left
            }).fadeIn();
        },

        /* Rename speaker from dialog */
        renameSpeaker: function(){
            var $editWrapper = $('.vbs-edit-mode-wrapper');
            var new_name = $('#vbs-rename_speaker_input').val();
            var old_key = $('#vbs-rename_speaker_input').attr('data-old-speaker-key');

            if(!VB.speakers.inSpeakers(new_name)) {
                VB.speakers.addSpeakerKey(new_name);
            }
            var new_key = VB.speakers.getSpeakerKeyByName(new_name);

            var $speakerElements = VB.speakers.findSpeakerElementsInEditor(old_key);
            $speakerElements.forEach(function($elem){
                $elem.text(new_name + ':').prepend('<br><br>').attr('m', new_key);
            });

            VB.speakers.clearEditorSpeakers();
            VB.speakers.enableRenameAllSpeakersInEditor(old_key);
        },

        renameSpeakerFromEditor: function($element) {
            var speakerKey = $element.attr('m');
            var speakerName = VB.helper.getClearWordFromTranscript($element.text());

            if(speakerName.lastIndexOf(':') != -1) { // some char after ":".
                speakerName = speakerName.substring(0, speakerName.lastIndexOf(':'));
            }

            if(!VB.speakers.inSpeakers(speakerName)) {
                VB.speakers.addSpeakerKey(speakerName);
            }

            speakerKey = VB.speakers.getSpeakerKeyByName(speakerName);
            $element.attr('m', speakerKey);

            VB.speakers.clearEditorSpeakers();
        },

        clearEditorSpeakers: function() {
            var $editWrapper = $('.vbs-edit-mode-wrapper');
            var keys = Object.keys(voiceBase.data.speakers);
            for (var i = 0; i < keys.length; i++) {
                var speakerElements = $editWrapper.find('span.w[m="' + keys[i] + '"]');
                if(speakerElements.length === 0) {
                    VB.data.speakers[keys[i]] = '';
                }
            }
        },

        disableRenameSpeakersInEditor: function(speakerkey){
            var $speakerElements = VB.speakers.findSpeakerElementsInEditor(speakerkey);
            $speakerElements.forEach(function($elem){
                $elem.attr('contenteditable', 'false');
            });
        },

        enableRenameAllSpeakersInEditor: function(){
            var $speakerElements =  $('.vbs-edit-speaker');
            $speakerElements.each(function(){
                $(this).attr('contenteditable', 'true');
            });
        }

    };

    return VB;
})(voiceBase, jQuery);