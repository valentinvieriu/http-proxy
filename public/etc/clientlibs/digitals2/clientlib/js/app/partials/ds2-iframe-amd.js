/**
 * @author Andrei Dumitrescu
 * @description Iframe component refactoring using AMD 
 */
define(
    'ds2-iframe',
    [
        'use!jquery',
        'ds2-main'
    ], 
    function($) {
        'use strict';
        function ds2IframeAmd(element) {
            this.element = $(element);            
            this.create();
        };
        ds2IframeAmd.prototype.create = function() {
            this.pIframe = $('.ds2-iframe--player', this.element),
            this.pFallback = $('.ds2-iframe--fallback', this.element);
            this.registerEventListeners();
            this.privacyCheck();            
        };
        ds2IframeAmd.prototype.privacyCheck = function() {
            if (cookiecontroller.api.areBrowserCookiesEnabled()) {
                if (cookiecontroller.api.isRegulationAccepted() === true || !cookiecontroller.api.hasRegulation()) {
                    this.iframeInlineOpen();
                } else {
                    this.fallbackInlineOpen();
                }
            } else {
                window.parent.digitals2.messages.showCookieBrowserDisabled();
                this.fallbackInlineOpen();
            }   
        };
        ds2IframeAmd.prototype.registerEventListeners = function() {
            var self = this;
            $(window).on('ds2-consentChanged', function(event) {
                if (cookiecontroller.api.isRegulationAccepted()) {
                    self.privacyCheck();
                }
            });
            $('.ds2-consent-js--submit', this.element).on('click', function(e) {
                e.preventDefault(e);
                if (cookiecontroller.api.areBrowserCookiesEnabled()) {
                    window.digitals2.main.$window.trigger('ds2-setRegulationAccepted');
                    window.parent.location.reload();
                } else {
                    window.parent.digitals2.messages.showCookieBrowserDisabled();
                }
            });
        };
        ds2IframeAmd.prototype.iframeInlineOpen = function() {
            var iframe = this.pIframe.find('iframe');
            if (iframe.length <= 0) {
                $("<iframe></iframe>").appendTo(this.pIframe).attr('src', this.pIframe.attr('data-src')).attr('height', '100%').attr('width', '100%');
            } else {
                iframe.attr('src', iframe.attr('data-src'));
            }
            if (this.pFallback.attr('data-author-mode') == "hide") {
                this.pFallback.hide();
            }
            this.pIframe.show();
        };
        ds2IframeAmd.prototype.fallbackInlineOpen = function() {
            this.pFallback.show();
            this.pIframe.hide();
        };
        return ds2IframeAmd;
    }
);
