/**
 * @author Christoph Behounek
 * @description iframeintegrationinit.js refactoring using AMD
 */
define(
    'ds2-iframe-integration',
    [
        'use!jquery',
        'iFrameResize'
    ],
    function ($, iFrameResize) {
        'use strict';

        function iframeIntegration(element) {
            this.element = $(element);
            this.create();
        };

        iframeIntegration.prototype.create = function () {
            var self = this;
            this.privacyCheck();
            this.loadIframe();
        };

        iframeIntegration.prototype.privacyCheck = function () {
            try {
                cookiecontroller.api.registerOnConsentChange(function () {
                    window.location.reload();
                });
            } catch (e) {
                console.error("cookiecontroller failed to listen to the cookie consent. Page will not reload on change consent.");
            }
        };

        iframeIntegration.prototype.loadIframe = function () {
            var parent = this.element.parent(),
                self = this,
                iframeintegrationcomponentpath = parent.find(".iframeintegration-component-path");

            if (iframeintegrationcomponentpath && iframeintegrationcomponentpath.length !== 0) {

                var iframeintegrationcomponentpathhref = iframeintegrationcomponentpath.attr('href');
                if (iframeintegrationcomponentpathhref.lastIndexOf('.html') > 0) {
                    iframeintegrationcomponentpathhref = iframeintegrationcomponentpathhref.substring(0, iframeintegrationcomponentpathhref.lastIndexOf('.html'));
                }

                var excludeprivacycontrol = iframeintegrationcomponentpath.data('int-excludeprivacycontrol');

                if (!excludeprivacycontrol && !cookiecontroller.api.isRegulationAccepted()) {
                    var privacyFallbackPagePath = iframeintegrationcomponentpath.data('int-privacyfallbackpagepath');
                    window.integration.fallbackpage.replaceElementWithFallbackpage(this.element.attr("id"), privacyFallbackPagePath);
                } else {
                    //needed to put # url parameters to Java URL as queryParams.
                    var queryString = window.integration.getQueryParameters(),
                        processIframe = (function (data) {
                            var iFrameElement = $(data);
                            if (iFrameElement.is('iframe')) {
                                var iFrameSource = iFrameElement.attr('src');
                                if (iFrameSource === undefined) {
                                    $.get(iframeintegrationcomponentpathhref + '.default.ajax?' + queryString).success(function (data) {
                                        self.replaceWithIFrame(iframeintegrationcomponentpath, data, parent);
                                    });
                                } else {
                                    self.replaceWithIFrame(iframeintegrationcomponentpath, data, parent);
                                }
                            } else {
                                $.get(iframeintegrationcomponentpathhref + '.default.ajax?' + queryString).success(function (data) {
                                    self.replaceWithIFrame(iframeintegrationcomponentpath, data, parent);
                                });
                            }

                        });

                    $.get(iframeintegrationcomponentpathhref + "." + window.integration.iframeintegration.getDeviceTypeSelector() + '.ajax?' + queryString).success(
                        processIframe
                    );
                }
            }
        };

        iframeIntegration.prototype.replaceWithIFrame = function (iframeintegrationcomponentpath, data, parent) {
            var iFrameElement = $(data),
                $iframeintegrationcontainer = $(".iframeintegrationcontainer", parent),
                $iframeintegrationcomponentpath = $(".iframeintegration-component-path", parent),
                isLayer = parent.hasClass("ds2-layer--content");

            if (iFrameElement.is('iframe')) {
                var iFrameSource = iFrameElement.attr('src');
                if (iFrameSource === undefined) {
                    var fallbackPagePath = iframeintegrationcomponentpath.data('int-fallback-page-path');
                    if (fallbackPagePath !== undefined) {
                        window.integration.fallbackpage.replaceElement('iframeintegrationcontainer', fallbackPagePath);
                    }
                    return false;
                }

                var palceholderNames = window.integration.iframeintegration.extractAllUrlParameterPlaceholer(iFrameSource);
                if (palceholderNames.length > 0) {
                    var hashParameter = window.integration.iframeintegration.getAllHashParameter();
                    palceholderNames.forEach(function (placeholder) {
                        if (typeof hashParameter[placeholder] !== 'undefined') {
                            iFrameSource = iFrameSource.replace(new RegExp('\\$\\{urlParameter\\.' + placeholder + '\\}', 'g'), hashParameter[placeholder])
                        }
                    });
                }
                iFrameSource = iFrameSource.replace(/\$\{clientContext\.cookiesAllowed\}/g, cookiecontroller.api.isRegulationAccepted());
                iFrameElement.attr('src', iFrameSource);

                /* bookmarking */
                var iFrameHref = document.createElement('a');
                iFrameHref.href = iFrameElement.attr('src');

                if (!isLayer) {
                    if (window.location.hash && (/(^#bookmark=|.*&bookmark=|#\/bookmark=)([^\&])/).test(window.location.hash)) {
                        var hashiFrameHref = document.createElement('a');
                        hashiFrameHref.href = $.base64.decode(window.location.hash.replace(/(^#bookmark=|.*&bookmark=|#\/bookmark=)([^\&]*)/, "$2"));

                        if (hashiFrameHref.host === iFrameHref.host) {
                            if (iFrameHref.search || hashiFrameHref.search) {
                                hashiFrameHref.search = $.grep([hashiFrameHref.search.replace(/^\?/, ''), iFrameHref.search.replace(/^\?/, '')], Boolean).join("&");
                            }
                            iFrameElement.attr('src', hashiFrameHref.href);
                        }
                    } else {
                        window.location.hash = (window.location.hash ? window.location.hash.substring(1) + '&' : "") + '/bookmark=' + $.base64.encode(iFrameHref.href);
                    }
                }
            }

            var autoHeight = iFrameElement.attr('data-int-autoheight') != "false",
                scrolling = iFrameElement.attr('scrolling') != 'no',
                width = iFrameElement.attr('width'),
                height = iFrameElement.attr('height'),
                sandbox = $iframeintegrationcomponentpath.attr('data-sandbox'),
                heightCalculationMethodData = iframeintegrationcomponentpath.data('int-heightcalculationmethod') ? iframeintegrationcomponentpath.data('int-heightcalculationmethod') : 'bodyOffset';

            if (sandbox === 'true' || sandbox === true || sandbox === undefined) {
                iFrameElement.attr('sandbox', '');
            }
            else if (sandbox !== 'false' && sandbox !== false) {
                iFrameElement.attr('sandbox', sandbox);
            }

            if (width) {
                if (width.indexOf('px') >= 1) {
                    width += ';';
                } else if (width.indexOf('%') == -1) {
                    width += 'px;';
                }
            } else {
                width = '100%;';
            }
            if (height) {
                if (height.indexOf('px') >= 1) {
                    height += ';';
                } else if (height.indexOf('%') == -1) {
                    height += 'px;';
                }
            } else {
                height = '100%;';
            }

            if (isIphoneOrIpad()) {
                var $childIframe = $iframeintegrationcontainer.children('iframe'),
                    iframeIntegrationContainer = $iframeintegrationcontainer[0],
                    strippedHeight = height.replace(/;/g, "");

                if (scrolling) {
                    iframeIntegrationContainer.classList.add('scrolling');
                }
                if (autoHeight) {
                    iframeIntegrationContainer.style.minHeight = strippedHeight;
                } else {
                    iframeIntegrationContainer.style.height = strippedHeight;
                }
                if ($childIframe.length) {
                    $childIframe.remove();
                }
                $iframeintegrationcontainer
                    .append(iFrameElement)
                    .css({'width': '100%'});
                //http://stackoverflow.com/a/23083463
                iFrameElement
                    .css({'width': '1px', 'min-width': '100%', '*width': '100%'})
                    .attr('width', '100%');
            } else {
                $iframeintegrationcontainer.replaceWith(iFrameElement);
                iFrameElement.css('max-width', '100%');
            }


            if (autoHeight) {
                iFrameElement.ready(function () {
                    var isOldIE = (navigator.userAgent.indexOf("MSIE") !== -1); // Detect IE10 and below
                    iFrameResize({
                        log: false,
                        enablePublicMethods: true,
                        sizeHeight: autoHeight,
                        heightCalculationMethod: isOldIE ? 'max' : heightCalculationMethodData,
                        scrolling: scrolling,
                        messageCallback: function (messageData) {
                            if (messageData.message !== undefined && messageData.message.href !== undefined) {
                                if ((/(^#bookmark=|.*&bookmark=|#\/bookmark=)([^\&]*)/).test(window.location.hash)) {
                                    var baseUrl = window.location.href.split('#');
                                    window.history.replaceState(undefined, undefined, window.location.hash.replace(/(bookmark=)[^\&]+/g, "$1" + jQuery.base64.encode(messageData.message.href)))
                                } else {
                                    window.history.replaceState(undefined, undefined, '#/' + (window.location.hash ? window.location.hash.substring(1) + '&' : "") + 'bookmark=' + jQuery.base64.encode(messageData.message.href));
                                }
                            }
                        }
                    }, iFrameElement[0]);
                });
            }
            ;

            window.integration.fallbackpage.triggerHiresinit($(iFrameElement[0].contentWindow));
        };

        return iframeIntegration;
    }
);


