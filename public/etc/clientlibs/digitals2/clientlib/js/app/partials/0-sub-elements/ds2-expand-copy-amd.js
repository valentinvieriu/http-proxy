/**
 * @author Andrei Dumitrescu
 * @description Expand copy component refactored using AMD
 */
define(
    'ds2-expand-copy',
    [
        'use!jquery',
        'use!velocity',
        'ds2-main'
    ],
    function($, velocity) {
        'use strict';
        function ds2ExpandCopy(element) {
            this.element = $(element);
            this.options = {
                copyClass: '.ds2-cms-output',
                buttonClass: '.ds2-expand--body-expand-button',
                maxLineNumber: 5,
                maxHeight: 0 //205
            };

            if (typeof Modernizr == 'object') {
                this.options.cssmask = Modernizr.cssmask;
            }

            this.create();
        };
        ds2ExpandCopy.prototype.create = function() {
            // new way: if browser supports 'css mask', we need a slightly different html structure
            if (this.options.cssmask) {
                this.element.after( $(this.options.buttonClass, this.element).parent('span.ds2-expand--body-expand-container') );
                this.expandButton = this.element.next('span.ds2-expand--body-expand-container').children('a.ds2-expand--body-expand-button');
            } else {
                // old way
                this.expandButton = $(this.options.buttonClass, this.element);
            }

            // if small, set up expanded container on create
            if (window.digitals2.main.mediaQueryWatcherCheck() === 'ds2ResizeSmall') {
                if (this.lineNumbersReached()) {
                    this.expandButtonOn();
                } else {
                    this.expandButton.css({
                        display: 'none'
                    });
                    this.element.attr('data-expanded', true);
                }
            }
            this.registerEventListeners();
        };
        ds2ExpandCopy.prototype.lineNumbersReached = function() {
            //set this to display block so height for element can be calculated
            this.element.closest('form').attr("style", "display: block !important");
            var divHeight = this.element.height(),
                lineHeight = parseInt($(this.options.copyClass, this.element).first().css('line-height'), 10),
                lineNumbers = Math.floor(divHeight / lineHeight),
                $firstheadline = $('.ds2-expand--copy-content .ds2-expand--copy-title', this.element).first(),
                headlineheight = 0,
                extraSpace = 65;
            //remove inline style after height has ben calculated
            this.element.closest('form').attr("style", "");
            if ($firstheadline.length) {
                headlineheight = $firstheadline.height() + parseInt($firstheadline.css('margin-bottom'), 10);
            }
            if (this.options.cssmask) {
                extraSpace = 5;
            }
            this.options.maxHeight = lineHeight * this.options.maxLineNumber + extraSpace + headlineheight;
            return (lineNumbers > this.options.maxLineNumber);
        };
        ds2ExpandCopy.prototype.expandButtonOn = function() {
            var self = this;
            self.expandButton.css({display: 'block'}).on('click', function(e) {
                self.expandCopyContainer();
            });
            self.element.attr('data-expanded', false).css({'height': this.options.maxHeight});
        };
        ds2ExpandCopy.prototype.registerEventListeners = function() {
            var self = this;
            // on resize, either set up expanded container ...
            $(window.digitals2.main).on('ds2ResizeSmall', function(event) {
                self.expandButtonOff();
                if (self.lineNumbersReached()) {
                    if (!self.element.hasClass('open')) {
                        self.expandButtonOn();
                    }
                } else {
                    self.expandButton.css({
                        display: 'none'
                    });
                    self.element.attr('data-expanded', true);
                }
            });
            // ...  or reset it
            $(window.digitals2.main).on('ds2ResizeMedium ds2ResizeLarge', function(event) {
                self.resetCopyContainer(self.element);
                if (self.lineNumbersReached()) {
                    self.expandButtonOff();
                }
            });
        };
        ds2ExpandCopy.prototype.expandCopyContainer = function() {
            var self = this;
            var $copy = $('.ds2-expand--body-copy', this.element),
                copyMargin = parseInt($('.ds2-cms-output', $copy).css('margin-bottom'), 10),
                copyHeight = $copy.outerHeight() + copyMargin,
                copyContainerHeight = self.element.outerHeight() + copyMargin,
                targetCopyContainerHeight = copyHeight;
            var animSpeed = Math.ceil(copyContainerHeight/targetCopyContainerHeight*10) * 50; // Calc speed dependend on height
            self.expandButton.fadeOut();
            self.element
                .addClass('open')
                .css({
                'height': copyContainerHeight
                })
                .velocity({'height': targetCopyContainerHeight}, animSpeed, 'swing',
                    function() {
                        self.element
                        .attr('data-expanded', true)
                        .trigger('expandCopyContainerEnded')
                        .css({
                            'height': ''
                        });
                    }
                );
            setTimeout(function() {
                $(window).trigger('resize');  //fixing overflow problems if expand copy inside slider
            }, 300);
        };
        ds2ExpandCopy.prototype.expandButtonOff = function() {
            this.expandButton.off('click');
            this.resetCopyContainer();
        };
        ds2ExpandCopy.prototype.resetCopyContainer = function() {
            this.element.css({
                'height': ''
            });
        };
        return ds2ExpandCopy;
    }
);
