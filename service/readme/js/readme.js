$(document).ready(function(){
    hljs.initHighlightingOnLoad();

    $("#affix_menu").affix({
        offset: {
            top: 50
        }
    });

    initBackTop();
});

function initBackTop(){
    // hide #back-top first
    $("#back-top").hide();

    // fade in #back-top
    $(function () {
        $(window).scroll(function () {
            if ($(this).scrollTop() > 100) {
                $('#back-top').fadeIn();
            } else {
                $('#back-top').fadeOut();
            }
        });

        // scroll body to 0px on click
        $('#back-top a').click(function () {
            $('body,html').animate({
                scrollTop: 0
            }, 800);
            return false;
        });
    });

    $('.vb-tooltip').popover({
        html: 'true',
        placement : 'right',
        trigger: 'hover',
        template: '<div class="popover" role="tooltip"><h3 class="popover-title"></h3><div class="popover-content"></div></div>',
        content: function() {
            var element = $(this);
            var img = element.attr('data-src');
            return "<img src='" + img + "'>";
        }
    });

}
