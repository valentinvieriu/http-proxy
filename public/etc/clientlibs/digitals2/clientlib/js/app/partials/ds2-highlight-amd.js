/**
 * @author Andrei Dumitrescu
 * @description Opens an Iframe in the designated layer. Also has a fallback layer
 */
define(
    'ds2-highlight',
    [
        'use!jquery',
        'use!foundation',
        'use!foundation-reveal',
        'ds2-main'
    ], 
    function($) {
        'use strict';
        function ds2Highlight(element, foundation, reveal) {
            this.element = $(element);
            this.options = {};
            this.init();
        };
        ds2Highlight.prototype.init = function() {
            var self = this;
            /**
             * Trigger the respective path which ultimately results in opening the highlight
             * layer, the fallback layer or showing the device error.
             */
            $('.ds2-highlight-js--open-layer', this.element).on('click', function(e) {
                e.preventDefault();
                self.options.ignorePrivacy = self.element.data('ignoreprivacy');
                self.options.highlightSrc = self.element.data('highlightsrc');
                if (window.digitals2.responsivePlus.responsivePlusDeviceGet() === 0) {
                    self.desktopPath();
                } else {
                    self.mobileTabletPath();
                }
            });            
        };
        /**
         * Pass the highlight layer to privacyCheck.
         */
        ds2Highlight.prototype.desktopPath = function() {
            var $highlight = $('#' + this.element.data('highlightlayer'));
            this.privacyCheck($highlight);
        };
        /**
         * Check if a fallback layer is present and pass it to privacyCheck.
         */
        ds2Highlight.prototype.mobileTabletPath = function() {
            var hasFallback = !!this.element.data('fallbacklayer');
            if(hasFallback) {
                this.privacyCheck($('#' + this.element.data('fallbacklayer')));
            } else {
                window.digitals2.messages.showDeviceError();
            }
        };
        /**
         * Do the privacy check. Along the way we might ask for cookie consent. Ultimately the proper highlight,
         * fallback or device error layer should be shown.
         */
        ds2Highlight.prototype.privacyCheck = function($layer) {
            if(this.options.ignorePrivacy === true) {
                // Global privacy settings overriden on component level
                $('iframe', $layer).attr('src', this.options.highlightSrc);
                $layer.foundation('reveal', 'open');
            } else {
                // Check global privacy settings
                if(!cookiecontroller.api.isInitialized()) {
                    cookiecontroller.api.registerOnInitialized(function() {
                        this.privacyCheck($layer);
                    });
                } else {
                    if(cookiecontroller.api.areBrowserCookiesEnabled()) {
                        // Browser allows cookies.
                        if (!cookiecontroller.api.hasRegulation()) {
                            // Market has no regulation. Show highlight or fallback.
                            $('iframe', $layer).attr('src', this.options.highlightSrc);
                            $layer.foundation('reveal', 'open');
                        } else {
                            // Market has regulation.
                            if (cookiecontroller.api.isRegulationAccepted()) {
                                // Regulation has been accepted. Show highlight or fallback.
                                $('iframe', $layer).attr('src', this.options.highlightSrc);
                                $layer.foundation('reveal', 'open');
                            } else {
                                // Regulation has been declined. Ask for cookie consent.
                                window.digitals2.messages.showCookieDisclaimer($layer, this.options.highlightSrc);
                            }
                        }
                    } else {
                        // Browser does not allow cookies. Show error.
                        window.digitals2.messages.showCookieBrowserDisabled();
                    }
                }
            }
            // Remove iframe src on layer close.
            $(document).one('close.fndtn.reveal', $layer, function() {
                $('iframe', $layer).attr('src', '');
            });
        };
        return ds2Highlight;
    }
);
