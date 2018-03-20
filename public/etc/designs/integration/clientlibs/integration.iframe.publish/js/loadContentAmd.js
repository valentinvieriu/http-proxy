/**
 * @author Christoph Behounek
 * @description loadcontent.js refactoring using AMD
 */
define(
    'ds2-iframe-content-loader',
    [
        'use!jquery',
        'iFrameResize',
        'ds2-iframe-content-loader-ajax',
        'ds2-iframe',
        'ds2-expand-copy',
        'ds2-iframe-lazy-load',
    ],
    function($,iFrameResize,ajaxLoader,ds2Iframe,ds2ExpandCopy, ds2iframelazyLoad) {
        'use strict';
        function loadcontentAmd(element) {
            this.element = $(element);
            this.create();
        };

        loadcontentAmd.prototype.create = function() {
            var self = this;
            this.privacyCheck();
            this.configure();
        };

        loadcontentAmd.prototype.privacyCheck = function() {
            try {
                cookiecontroller.api.registerOnConsentChange(function () {
                    window.location.reload();
                });
            }
            catch (e) {
                console.error("cookiecontroller failed to listen to the cookie consent. Page will not reload on change consent.");
            }
        };

        loadcontentAmd.prototype.configure = function() {
            this.iframe = null,
            this.id = "iframe" + this.element.data("int-id"),
            this.path = this.element.data("int-iframe-component-path"),
            this.deviceType = ajaxLoader.getDeviceType(),
            this.width =  this.element.data("int-width"),
            this.autoHeight = this.element.data("int-auto-height") == true,
            this.height =  this.element.data("int-height"),
            this.showMobileLink = this.element.data("int-show-mobile-link"),
            this.mobileLinkText = this.element.data("int-mobile-link-text"),
            this.privacyFallbackPage = this.element.data("int-privacy-fallback-page"),
            this.scrolling =  this.element.data("int-scrolling"),
            this.sandbox =  this.element.data("sandbox");

            if(this.autoHeight) {
                this.scrolling = "no";
            }

            if(this.height) {
                this.height+="px";
            }
            else {
                this.height = "100%";
            }

            if(this.width) {
                this.width+="px";
            }
            else {
                this.width = "100%";
            }

            if(this.sandbox === 'false' || this.sandbox === false) {
                this.sandbox = "";
            }
            else if(this.sandbox === 'true' || this.sandbox === true || this.sandbox === undefined){
                this.sandbox = "sandbox";
            }
            else {
                this.sandbox = "sandbox=\"" + sandbox + "\"";
            }

            var callback = (function(showUrl, url) {
                var link,$frameWindow;

                if (showUrl) {
                    link = url;
                } else {
                    link = this.privacyFallbackPage;
                }

                if (!link) {
                    this.element.replaceWith("<div>Please enter your IFrame component URL before using it.</div>");
                    return false;
                }

                if (ajaxLoader.getDeviceType().localeCompare("smartphone") == 0 && this.showMobileLink) {
                    this.element.replaceWith("<a href='" + link + "' id=" + this.id + " >" + this.mobileLinkText + "</a>");
                    return false;
                }

                if (isIphoneOrIpad()) {

                    var addScrolling = "overflow:auto;-webkit-overflow-scrolling:touch;";

                    if (this.autoHeight) {
                        this.element.append('<div style="' + 'width:' + this.width + '; ' + addScrolling + '">' + '<iframe id="' + this.id + '" data-loader="' + 'iframe' + '" data-src="' + link + '" width="' + this.width + '" height="' + this.height + '" scrolling="' + this.scrolling + '" frameBorder="0" ' + this.sandbox + '><p>Your browser does not support iframes.</p></iframe></div>');
                        this.iframe = $("#" + this.id);
                    } else {
                        this.element.append('<div style="height:' + this.height + '; width:' + this.width + '; ' + addScrolling + '">' + '<iframe id="' + this.id + '" data-loader="' + 'iframe' + '" data-src="' + link + '" width="' + this.width + '" height="' + this.height + ' scrolling="' + this.scrolling + '" frameBorder="0" ' + this.sandbox + '><p>Your browser does not support iframes.</p></iframe></div>');
                    }
                } else {
                    // added data loader attribute needed for the lazy load iframe plugin
                    this.element.append('<iframe id="' + this.id + '" data-loader="' + 'iframe' + '" width="' + this.width + '" height="' + this.height + '" scrolling="' + this.scrolling + '" style="min-height:' + this.height + ';" frameBorder="0" ' + this.sandbox + '><p>Your browser does not support iframes.</p></iframe>');
                    this.iframe = this.element.find("#" + this.id);
                    // added the data-src attribute where the url it's stored from where the lazy loading gets the src
                    this.iframe.attr("data-src", $('<p />').html(link).text());
                }
                //int of lazy loading iframe
                new ds2iframelazyLoad(this.element);
                var self = this;

                this.iframe.ready(function(){
                    var isOldIE = (navigator.userAgent.indexOf("MSIE") !== -1); // Detect IE10 and below
                    var heightCalculationMethodData = self.element.data('heightcalculationmethod') ? self.element.data('heightcalculationmethod') : 'bodyOffset'
                    iFrameResize({
                        log: false,
                        enablePublicMethods: true,
                        sizeHeight: self.autoHeight,
                        heightCalculationMethod: isOldIE ? 'max' : heightCalculationMethodData,
                        scrolling: self.scrolling !== "no",
                        messageCallback: function (messageData) {
                            if (messageData.message !== undefined && messageData.message.href !== undefined) {
                                if ((/(^#bookmark=|.*&bookmark=|#\/bookmark=)([^\&]*)/).test(window.location.hash)) {
                                    var baseUrl = window.location.href.split('#');
                                    window.history.replaceState(undefined,undefined, window.location.hash.replace(/(bookmark=)[^\&]+/g, "$1" + jQuery.base64.encode(messageData.message.href)))
                                } else {
                                    window.history.replaceState(undefined,undefined,'#'+ (window.location.hash ? window.location.hash.substring(1) + '&' : "/") + 'bookmark=' + jQuery.base64.encode(messageData.message.href));
                                }
                            }
                        }
                    }, self.iframe[0]);
                    try {
                        $frameWindow = $(self.iframe[0].contentWindow);
                        new ds2Iframe($frameWindow.find('.ds2-iframe'));
                        new ds2ExpandCopy($frameWindow.find('.ds2-expand--body-copy-container'));
                    }
                    catch (e) {
                        console.error("could not initialise fallback component elements");
                    };
                });
            }).bind(this);

            ajaxLoader.executeComponentAjaxCall(this.id, this.path, this.deviceType, this.privacyFallbackPage, callback);
        };

        return loadcontentAmd;
});
