define('ds2-bottom-disclaimer', [
    'use!jquery'
], function ($) {
    var footerDisclaimer = function (element) {
        var self = this;

        $('.ds2-disclaimer-dropdown a[data-disclaimer]').on('click', function (event) {
            self.updateFooterDisclaimer($(event.target).data('disclaimer'));
        });

        self.updateFooterDisclaimer($('.ds2-disclaimer-dropdown li.active a').data('disclaimer'));
    }

    footerDisclaimer.prototype.updateFooterDisclaimer = function (disclaimerId) {
        var disclaimerFooter = $('.ds2-bottom-disclaimer');
        disclaimerFooter.find('[data-disclaimer]:visible').hide();
        disclaimerFooter.find('[data-disclaimer=' + disclaimerId + ']').show();
    };

    return footerDisclaimer;
});
