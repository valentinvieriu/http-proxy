/**
 * sub: link
 * author: Manuel
 */

define( 'ds2-link', [
        'use!jquery',
        'ds2-video-layer-link',
        'use!velocity',
        'ds2-main'
    ], 
    function($,videoLayerLink) {
        'use strict';
        function ds2Link(element) {
            this.element = $(element);
            this.options = {
                linkTruncateClass: 'ds2-ellipsis',
                linkTruncateClassShort: 'ds2-ellipsis-short',
                maxLineNumber: 4,
                maxLineNumberShort: 2
            };
            this.initTrigger();
            new videoLayerLink(element);
        };

        var proto = ds2Link.prototype;

        proto.initTrigger = function() {
            var self = this,
            options = self.options,
            $element = self.element;

            self.options.$element = $element;

            if (this.options.$element.hasClass(this.options.linkTruncateClass)) {
                self._linkTruncate(this.options.maxLineNumber);
            } else if (this.options.$element.hasClass(this.options.linkTruncateClassShort)) {
                self._linkTruncate(this.options.maxLineNumberShort);
            }

            //BWMST-3503
            //Applay custom scrolling for anchors
            //On click on an anchor link
            //if the anchor is on the same page
            var href = $($element).attr('href'),
                contentBarHeight = 0,
                anchor = '',
                pathname = window.location.pathname,
                target = '';

            if (href != null) {
                anchor = href.split('#', 1).pop();
                // href.indexOf('#') > 0: anchor
                // href.length > 3: ???
                // href.indexOf('#/') < 0: configurator link
                if (href.indexOf('#') > 0 &&
                    href.length > 3 &&
                    href.indexOf('#/') < 0 &&
                    anchor == pathname) {

                    $($element).on('click', function(e) {

                        e.preventDefault();

                        if ($('.ds2-navigation-content-bar').length) {
                            contentBarHeight = -$('.ds2-navigation-content-bar').outerHeight(true);
                        }

                        target = href.split('#').pop();

                        $('#' + target).velocity('scroll', {
                            duration: 500,
                            offset: contentBarHeight,
                            easing: 'ease-in-out'
                        });
                    });
                }
            } 
        }

        proto._linkTruncate = function(maxLineNumber) {
            var options = this.options,
                link = $(this.options.$element),
                lineHeight = parseInt($(this.options.$element).css('line-height')),
                maxHeight = lineHeight * maxLineNumber;

            $(this.options.$element).parent().dotdotdot({
                height: maxHeight,
                // fallbackToLetter: false,
                wrap: 'letter',
                watch: true,
                tolerance : 12,
            });
        }

        
        return ds2Link;
    }
);
