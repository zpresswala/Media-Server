voiceBase = (function(VB, $) {
    "use strict";

    VB.comments = {

        getComments: function(hide, rebuild) {
            var _parameters = {};
            jQuery.extend(_parameters, VB.api.parameters);
            VB.api.data.tmp.hide = (typeof hide != 'undefined') ? hide : (VB.settings.expandCommentsBlock) ? false : true;
            VB.api.data.tmp.rebuild = typeof rebuild != 'undefined' ? rebuild : false;
            _parameters.action = 'getComments';
            if (VB.settings.commentsUsername && VB.settings.commentsUsername !== '') {
                _parameters.username = VB.settings.commentsUsername;
            }
            VB.api.call(_parameters, VB.comments.setComments);
        },

        setComments: function(data) {
            if (data.requestStatus == 'SUCCESS') {
                var comments_html = '',
                    comments_count_string = '';

                if (data.response.threads !== undefined) {
                    var comments_count = 0;
                    var iiissd = 0;

                    VB.data.commentsThreads = data.response.threads;
                    for (var thread_key in data.response.threads) {
                        // Get thread
                        var thread = data.response.threads[thread_key];

                        for (var comment_key in thread.comments) {
                            // Get comment
                            var comment = thread.comments[comment_key];

                            // Get comment level
                            var comment_level = comment.level;
                            if (comment.level > '5') {
                                comment_level = '5';
                            }

                            // Get "commented at"
                            var commented_at = VB.helper.parseTime(thread.timeStamp);

                            comments_html += '<div class="vbs-comment-row vbs-answer' + comment_level + '">\n\
                                                              <div class="vbs-comment-title">\n\
                                                                  <span class="vbs-comment-author">' + comment.userName + '</span> ';
                            if (comment_level == 1) {
                                comments_html += '<span>commented at</span>\n\
                                                                  <a href="javascript:void(0)" class="vbs-comment-time" data-vbct="' + thread.timeStamp + '">' + commented_at + '</a>';
                            } else {
                                comments_html += '<span>replied</span>';
                            }
                            var vbsweb = comment.canEdit ? 'vbs-with-edition-btns' : '';
                            comments_html += '</div>\n\
                                                              <div class="vbs-comment-content ' + vbsweb + '">\n\
                                                                  <div class="vbs-arrow"></div>\n\
                                                                  <div class="vbs-comment-message">\n\
                                                                      <p>' + comment.content + '</p>\n\
                                                                  </div>';
                            var showCommentsBtn = true;
                            if(VB.settings.restrictions.length > 0) {
                                showCommentsBtn = VB.settings.restrictions.indexOf('manageComments') > -1 || VB.settings.restrictions.indexOf('manageOwnComments') > -1;
                            }

                            if(showCommentsBtn) {
                                if (comment.canEdit) {
                                    comments_html +=
                                        '<div class="vbs-comment-edit-wrapper">\n\
                                                <div class="vbs-comment-edit-btn-wrapper">\n\
                                                    <a href="#" c_id="' + comment.id + '" c_tm="' + thread.timeStamp + '" class="vbs-comment-edit vbs-popup-btn">Edit</a>\n\
                                                </div>\n\
                                                <div class="vbs-comment-delete-btn-wrapper">\n\
                                                    <a href="#" c_id="' + comment.id + '" class="vbs-comment-delete vbs-popup-btn">Delete</a>\n\
                                                </div>\n\
                                            </div>';
                                } else {
                                    comments_html +=
                                        '<div class="vbs-comment-reply-wrapper">\n\
                                                <a href="#"  c_id="' + comment.id + '" class="vbs-comment-reply vbs-popup-btn">Reply</a>\n\
                                            </div>';
                                }
                            }
                            comments_html += '</div>\n\
                                                          </div>\n\
                                                      </div>';
                            iiissd++;
                            comments_count++;
                        }
                    }

                    comments_count_string += comments_count + ' Comment(s)';
                } else {
                    comments_count_string += 'No Comments';
                    comments_html += '<div class="vbs-comment-row"><div class="vbs-comment-title">No Comments</div></div>';
                }

                $('.vbs-comments-block .vbs-section-name').attr('style', 'width: 200px;').text(comments_count_string);
                VB.comments.commentsWidget(comments_html, VB.api.data.tmp.hide);
                if (VB.api.data.tmp.rebuild) {
                    VB.comments.commentsTWidget();
                }
            } else {
                var $commentsBlock = VB.helper.find('.vbs-comments-block');
                $commentsBlock.append(VB.templates.get('disabler'));
                if(!VB.settings.tabView) {
                    $commentsBlock.show();
                    $commentsBlock.find('.vbs-section-body').hide();
                    $commentsBlock.find('.vbs-section-title .vbs-section-name').text('Comments');
                }

                VB.api.setErrors(data);
            }
            VB.api.ready.comments = true;
        },

        addComment: function(comment_data) {
            var _parameters = {};
            jQuery.extend(_parameters, VB.api.parameters);
            _parameters.action = 'addComment';
            _parameters.comment = comment_data.comment;
            if (comment_data.comment_timestamp !== false) {
                _parameters.timeStamp = comment_data.comment_timestamp;
            }
            if (comment_data.parent_comment_id !== false) {
                _parameters.commentId = comment_data.parent_comment_id;
            }
            if (VB.settings.commentsUsername && VB.settings.commentsUsername !== '') {
                _parameters.username = VB.settings.commentsUsername;
            }
            if (VB.settings.commentsUserhandle && VB.settings.commentsUserhandle !== '') {
                _parameters.userhandle = VB.settings.commentsUserhandle;
            }
            VB.api.call(_parameters, VB.comments.sendComment);
        },

        sendComment: function(data) {
            if (data.requestStatus == 'SUCCESS') {
                VB.comments.getComments(VB.helper.find('.vbs-comments-block .vbs-section-title').hasClass('vbs-hidden'), true);
            } else {
                VB.helper.showMessage(data.statusMessage, 'error');
            }
        },

        editComment: function(comment_data) {
            var _parameters = {};
            jQuery.extend(_parameters, VB.api.parameters);
            _parameters.action = 'editComment';
            _parameters.comment = comment_data.comment;
            _parameters.commentId = comment_data.comment_id;

            if (VB.settings.commentsUsername && VB.settings.commentsUsername !== '') {
                _parameters.username = VB.settings.commentsUsername;
            }
            VB.api.call(_parameters, VB.comments.sendEditComment);
        },

        sendEditComment: function(data) {
            var parent_div = VB.api.data.tmp.commentParent;
            var comment_data = VB.api.data.tmp.commentData;
            if (data.requestStatus == 'SUCCESS') {
                parent_div.parents('.vbs-comment-content').find('.vbs-comment-message p').text(comment_data.comment);
                parent_div.remove();
                var commentId = comment_data.comment_id;
                var threads = VB.data.commentsThreads;
                for (var key in  threads) {
                    if(threads.hasOwnProperty(key)) {
                        var comments = threads[key].comments;
                        comments.forEach(function(comment){
                            if(comment.id == commentId) {
                                comment.content = comment_data.comment;
                            }
                        });
                    }
                }
                VB.comments.commentsTWidget();
            } else {
                parent_div.find("textarea").attr('disabled', false);
                VB.helper.showMessage(data.statusMessage, 'error');
            }
        },

        deleteComment: function(comment_id) {
            var _parameters = {};
            jQuery.extend(_parameters, VB.api.parameters);
            _parameters.action = 'deleteComment';
            _parameters.commentId = comment_id;
            if (VB.settings.commentsUsername && VB.settings.commentsUsername !== '') {
                _parameters.username = VB.settings.commentsUsername;
            }
            VB.api.call(_parameters, VB.comments.sendComment);
        },

        commentsWidget: function(data, hide) {
            var $comments_block = VB.helper.find('.vbs-comments-block');
            $comments_block.find('.vbs-section-body').html(data);
            if (hide) {
                $comments_block.find('.vbs-section-body').hide();
                $comments_block.find('.vbs-section-title').addClass('vbs-hidden');
            }
            $comments_block.slideDown('fast');
        },

        commentsTWidget: function() {
            var wrapper = VB.helper.find('.vbs-record-timeline-wrap');
            var cmhtml = '';
            for (var thread_key in VB.data.commentsThreads) {
                var stime = VB.data.commentsThreads[thread_key].timeStamp;
                var position = (stime * wrapper.width()) / VB.data.duration;
                var rightClass = stime > VB.data.duration / 2 ? 'vbs-from-right' : '';
                var commentText = VB.data.commentsThreads[thread_key].comments[0].content;
                cmhtml += VB.templates.parse('vbsCommentsTimeline', {
                    position: position,
                    rightClass: rightClass,
                    stime: stime,
                    commentText: commentText
                });
            }
            VB.helper.find('.vbs-comments-wrapper-block').html(cmhtml);
            if(VB.settings.markersInNativeTimeline && VB.settings.cssPathForPlayerFrame) {
                VB.comments.commentsWidgetForNativeTimeline();
            }
        },

        resizeCommentsTWidget: function() {
            var wrapperWidth = VB.helper.find('.vbs-record-timeline-wrap').width();
            var duration = VB.data.duration;

            VB.helper.find('.vbs-comments-wrapper-block div.vbs-comments-wrapper ').each(function() {
                var $commentWrapper = $(this);
                var commentTime = $commentWrapper.attr('stime');
                var position = (commentTime * wrapperWidth) / duration;
                $commentWrapper.css('left', position);
            });

        },

        /*
         * Integrate comments markers to native kaltura timelime
         * */
        commentsWidgetForNativeTimeline: function() {
            var origComments = $('.vbs-comments-wrapper-block').find('.vbs-comments-wrapper');
            var $playerIframe = VB.PlayerApi.getPlayerIframe();
            var scrubberHandleContainer = $playerIframe.find('.scrubber');
            if(scrubberHandleContainer.find('.vbs-comments-wrapper-block').length === 0) {
                scrubberHandleContainer.append('<div class="vbs-comments-wrapper-block"></div>');
            }
            var $scrubberComments = scrubberHandleContainer.find('.vbs-comments-wrapper-block');
            $scrubberComments.empty();
            $.each(origComments, function (k, origComment) {
                VB.comments.createScruberComment(origComment, $scrubberComments);
            });
        },
        createScruberComment: function(origComment, $container) {
            var duration = VB.data.duration;
            var commentTime = $(origComment).attr('stime');
            var left = (commentTime / duration) * 100;
            var rightClass = commentTime > VB.data.duration / 2 ? 'vbs-from-right' : '';
            var commentText = $(origComment).find('a').text();

            var $comment = $(VB.templates.parse('vbsCommentsTimeline', {
                position: '0',
                rightClass: rightClass,
                stime: commentTime,
                commentText: commentText
            }));
            $comment.css({
                top: '-15px',
                left: left + '%'
            });
            $comment.find('.vbs-comment-preview').css({
                'z-index': 99999999991
            });
            if(!rightClass) {
                $comment.find('.vbs-comment-preview').css({
                    'padding-left': '10px'
                });
            }
            $container.append($comment);
        },

        // handlers from event.js
        toggleBlockHandler: function($block) {
            $block.toggleClass('vbs-hidden');
            var $section_body = $block.parents('.vbs-comments-block').find('.vbs-section-body');
            if ($block.hasClass('vbs-hidden')) {
                $block.attr('data-title', 'Show Comments');
                $section_body.slideUp();
            } else {
                $block.attr('data-title', 'Hide Comments');
                $section_body.slideDown();
                VB.helper.collapseNewsBlock();
            }
        },

        clickAddCommentHandler: function($addButton) {
            var newparam = {};
            var ltime = VB.data.position;
            newparam['vbt'] = Math.round(ltime);
            var vbspTime = VB.helper.parseTime(Math.round(ltime));
            var html = VB.templates.parse('commentPopup', {
                "vbt": newparam['vbt'],
                "vbspTime": vbspTime
            });

            var $comments_popup = VB.helper.find('.vbs-comments-popup');
            var $section_btns = VB.helper.find('.vbs-comments-block .vbs-section-btns');
            if($addButton.hasClass('vbs-active')){ // button is pressed
                $comments_popup.fadeOut('fast', function() { // remove popup
                    $section_btns.find('.vbs-comments-btn').removeClass('vbs-active');
                    $comments_popup.remove();
                });
            }
            else{ // activate popup
                VB.helper.find('.vbs-comments-popup').each(function(){ // remove all comments popups
                    $(this).remove();
                });

                $section_btns.find('.vbs-clearfix li').append(html);
                $section_btns.find('.vbs-comments-btn').addClass('vbs-active');
                VB.helper.find('.vbs-comments-popup').show();
                $('#vbs-comment-text').focus();
            }
            VB.helper.collapseNewsBlock();
        },

        confirmAddCommentHandler: function($confirmButton) {
            VB.helper.collapseNewsBlock();

            var parent_div = $confirmButton.parent(".vbs-comment-footer").parent(".vbs-comments-popup"),
                comment_data = {},
                comment_text = parent_div.find("#vbs-comment-text").val(),
                comment_timestamp = parent_div.find("#vbs-comment-timeline").attr("vbct");

            if (comment_text === "") {
                alert("Text of comment is required.");
                return false;
            } else {
                VB.helper.find('.vbs-comments-popup').fadeOut('fast', function() {
                    VB.helper.find('.vbs-comments-block .vbs-section-btns .vbs-comments-btn').removeClass('vbs-active');
                    VB.helper.find('.vbs-comments-popup').addClass('vbs-hidden');
                });
            }

            comment_data['comment'] = comment_text;
            comment_data['comment_timestamp'] = comment_timestamp;
            comment_data['parent_comment_id'] = false;

            VB.comments.addComment(comment_data);
        },

        playCommentHandler: function($playButton) {
            var vbspPlayForComments = setTimeout(function() {
                clearTimeout(vbspPlayForComments);
                VB.PlayerApi.seek($playButton.parent('.vbs-comment-popup-row').find('#vbs-comment-timeline').attr('vbct'));
            }, 250);
        },

        replyHandler: function($replyBtn) {
            var html = VB.templates.parse('commentReplyPopup', {
                "c_id": $replyBtn.attr('c_id')
            });

            var parent_div = $replyBtn.parent('.vbs-comment-reply-wrapper');

            if (parent_div.find('.vbs-comments-popup').length === 0) {
                VB.helper.find('.vbs-comments-popup').addClass('old_reply_popup');
                parent_div.append(html);
                parent_div.find('.vbs-comments-popup').show();
            }
            else {
                parent_div.find('.vbs-comments-popup').remove();
            }
            VB.helper.find('.vbs-comments-popup.old_reply_popup').remove();
            VB.helper.find('.vbs-comments-block .vbs-section-btns .vbs-comments-btn').removeClass('vbs-active');
        },

        replyConfirmHandler: function($confirmButton) {
            var parent_div = $confirmButton.parents(".vbs-comment-footer").parents(".vbs-comments-popup"),
                comment_data = {},
                comment_text = parent_div.find("#vbs-comment-reply-text").val(),
                parent_comment_id = $confirmButton.attr("c_id");
            if (comment_text === "") {
                alert("Text of comment is required.");
                return false;
            }
            else {
                parent_div.parents('.vbs-comment-reply-wrapper').find('.vbs-comments-popup').remove();
            }
            comment_data['comment'] = comment_text;
            comment_data['comment_timestamp'] = false;
            comment_data['parent_comment_id'] = parent_comment_id;
            VB.comments.addComment(comment_data);
        },

        editHandler: function($editBtn) {
            var ctm = $editBtn.attr('c_tm');
            var vbspTime = VB.helper.parseTime(Math.round(ctm));
            var commentBlock = $editBtn.parents('.vbs-comment-row');
            var commentText = commentBlock.find('.vbs-comment-message p').text();
            var templateObj = {
                c_id: $editBtn.attr('c_id'),
                vbt: ctm,
                vbspTime: vbspTime,
                commentText: commentText
            };
            var html = commentBlock.hasClass('vbs-answer1') ? VB.templates.parse('commentEditFirstPopup', templateObj) : VB.templates.parse('commentEditPopup', templateObj);
            var parent_div = $editBtn.parent('.vbs-comment-edit-btn-wrapper');
            if (parent_div.find('.vbs-comments-popup').length === 0) {
                VB.helper.find('.vbs-comments-popup').addClass('old_reply_popup');
                parent_div.append(html);
                parent_div.find('.vbs-comments-popup').show();
                parent_div.find('textarea').focus();
            } else {
                parent_div.find('.vbs-comments-popup').remove();
            }
            VB.helper.find('.vbs-comments-popup.old_reply_popup').remove();
            VB.helper.find('.vbs-comments-block .vbs-section-btns .vbs-comments-btn').removeClass('vbs-active');
        },

        editConfirmHandler: function($confirmButton) {
            var parent_div = $confirmButton.parents(".vbs-comments-popup"),
                comment_data = {},
                comment_text = parent_div.find("textarea").val(),
                comment_id = $confirmButton.attr("c_id");
            if (comment_text === "") {
                alert("Text of comment is required.");
                return false;
            }
            comment_data['comment'] = comment_text;
            comment_data['comment_timestamp'] = false;
            comment_data['comment_id'] = comment_id;
            parent_div.find("textarea").attr('disabled', true);
            VB.api.data.tmp.commentParent = parent_div;
            VB.api.data.tmp.commentData = comment_data;
            VB.comments.editComment(comment_data);
        },

        deleteHandler: function($deleteButton) {
            var html = VB.templates.parse('commentDeletePopup', {c_id: $deleteButton.attr('c_id')});
            var parent_div = $deleteButton.parent('.vbs-comment-delete-btn-wrapper');

            if (parent_div.find('.vbs-comments-popup').length === 0) {
                VB.helper.find('.vbs-comments-popup').addClass('old_reply_popup');
                parent_div.append(html);
                parent_div.find('.vbs-comments-popup').show();
            }
            else {
                parent_div.find('.vbs-comments-popup').remove();
            }
            VB.helper.find('.vbs-comments-popup.old_reply_popup').remove();
            VB.helper.find('.vbs-comments-block .vbs-section-btns .vbs-comments-btn').removeClass('vbs-active');
        },

        deleteConfirmHandler: function($confirmButton) {
            var comment_id = $confirmButton.attr("c_id");
            VB.comments.deleteComment(comment_id);
            $confirmButton.parents('.vbs-comment-edit-wrapper').remove();
        },

        cancelHandler: function($button) {
            var $popup = $button.parents('.vbs-comments-popup');
            $popup.fadeOut('fast', function() {
                VB.helper.find('.vbs-comments-block .vbs-section-btns .vbs-comments-btn').removeClass('vbs-active');
                $popup.addClass('vbs-hidden').remove();
            });
        },

        commentTimeHandler: function($time) {
            var comment_time = $time.attr('data-vbct');
            if(comment_time){
                VB.PlayerApi.seek(comment_time);
            }
        },

        updateTimeInPopup: function(position) {
            var time = (position || position === 0) ? position : VB.data.played;
            VB.helper.find('.vbs-comments-add-popup #vbs-comment-timeline')
                .html(VB.helper.parseTime(time))
                .attr('vbct', time);
        }

    };

    return VB;
})(voiceBase, jQuery);