/**
 * @author Andrei Dumitrescu
 * @description Layer component refactoring
 */
define(
    'ds2-layer',
    [
        'use!jquery',
        'ds2-nsc',
        'ds2-main'
    ],
    function($, NSC) {
        'use strict';
        function ds2Layer(element) {
            this.element = $(element);
            this.options = {
                scrollablePart: '.ds2-layer--copy',
                scrollablePartInner: '.ds2-layer--scrollablepart',
                applyModalClosingFunctionality: this.element.attr('data-uncancelable') !== 'undefined' ? false : true
            };
            this.create();
        }

        ds2Layer.prototype.create = function() {
            var self = this;
            self.slider = undefined;
            //self.currentLayer = undefined;
            self.scrollContainer = self.element.find(self.options.scrollablePart);
            self.scrollContent = self.element.find(self.options.scrollablePartInner);
            self.scrollLayerContent = self.element.find('.ds2-layer--content');
            self._setDeviceValues();
            self.identifier = self.element.attr('id');
            self.isGallery = (self.element.closest('.ds2-gallery').length > 0) ? true : false;
            if(self.options.applyModalClosingFunctionality === true) {
                self._applyModalClosing();
            }
            // self._setHeight($element, self.isMobile, self.isTablet);

            //EVENT BINDINGS REGISTRY LAYER
            $('.ds2-login-js--cancel', self.element).on('click', function() {
                self.element.foundation('reveal', 'close');
            });
            $('.ds2-registration-js--cancel', self.element).on('click', function() {
                self.element.foundation('reveal', 'close');
            });

            $('.ds2-login-js--to-password', self.element).on('click', function() {
                window.digitals2.main.openLayer('#gcdmForgottenPassword');
            });
            $('.ds2-login-js--to-register', self.element).on('click', function() {
                window.digitals2.main.openLayer('#gcdmRegistration');
            });
            $('.ds2-login-js--to-login', self.element).on('click', function() {
                window.digitals2.main.openLayer('#gcdmLogin');
            });

            $(document).on('ds2-policyConformationRequired', function() {
                var $policyLayer = $('.ds2-layer.ds2-layer--policy');
                $policyLayer.removeClass('ng-hide');
                $policyLayer.foundation('reveal','open');
            });

            // prevent layer scrolling if scrolling a dropdown
            var $selects = self.element.find('select');
            $selects.on('mousewheel scroll touchstart pointerdown MSPointerDown mousedown', function(e) {
                e.stopPropagation();
            });

            $(document)
                .on('opened', '[data-reveal]', function () {
                if($(this).attr('id') === self.identifier) {

                    self._openedListner();
                    self._checkHeight();
                    self.invoke();

                    $('#ds2-reveal-container .ds2-nsc')
                        .toArray( )
                        .map( function( item ) {
                            new NSC( item );
                        } );
                }
                })
                .on('closed', '[data-reveal]', function () {
                if($(this).attr('id') === self.identifier) {
                    self.slider = $('.ds2-slider', this.element).removeClass('opened');
                    $(this).css({'display':''});
                    $(this).css({'top':''});
                    self.kill();
                }
                });

            $(window.digitals2.main).on('ds2ResizeSmall ds2ResizeMedium ds2ResizeLarge', self, function(e){
                self._onResize();
            });

            self._checkHeight();
        };

        ds2Layer.prototype.invoke = function() {
            var self = this;
            if(this.iscrollInterval) {
                clearInterval(this.iscrollInterval);
            }
            this.iscrollInterval = setInterval(function() { self._iscrollRefresh(); }, 1000);
        };

        ds2Layer.prototype.kill = function() {
            if(this.iscrollInterval) {
                clearInterval(this.iscrollInterval);
            }
        };

        ds2Layer.prototype._openedListner = function() {
            var self = this;
            self.slider = $('.ds2-slider', this.element);

            self.slider.find('.ds2-slider--slide').addClass('ds2-slider--slide-single-image');
            self.slider.addClass('opened');
        };

        ds2Layer.prototype._setDeviceValues = function() {
            var self = this;
            switch (window.digitals2.main.mediaQueryWatcherCheck()) {
                case 'ds2ResizeSmall':
                self.isMobile = true;
                self.isTablet = false;
                break;
                case 'ds2ResizeMedium':
                self.isTablet = true;
                self.isMobile = false;
                break;
                default:
                self.isMobile = false;
                self.isTablet = false;
                break;
            }
        };

        ds2Layer.prototype._applyModalClosing = function() {
            var self = this;
            self.element.on('click touch', function(e){
                if (!($(e.target).parents('.ds2-layer--container').length == 1 || $(e.target).hasClass('ds2-layer--container'))){
                $(self.element).foundation('reveal', 'close');
                }
            });
        };

        ds2Layer.prototype._checkHeight = function() {
            var self = this;
            var spacing = 180;

            if (self.isTablet) {
                spacing = 150;
            }else if(self.isMobile) {
                spacing = 80;
            }

            if( $('.ds2-iscroll-container',this.element) &&
                $('.ds2-iscroll-container',this.element).css('max-height') !== "none"
                ) {
                $('.ds2-iscroll-container',this.element).css('max-height','');
            }

            var viewportHeight = $(window).outerHeight();
            //var layerActualHeight = self.scrollContainer.outerHeight();
            var layerContentActualHeight = self.scrollLayerContent.outerHeight();
            var footerHeight = this.element.find('h2').outerHeight()|| 0;

            var scrollContainerHeight = (viewportHeight - spacing) - footerHeight;

            if(layerContentActualHeight >= scrollContainerHeight) {
                self.scrollContainer.css('max-height', scrollContainerHeight);
                self.currentScrollContainerHeight = scrollContainerHeight;
            }
            self._doScroll();
        };

        ds2Layer.prototype._doScroll = function() {
            var self = this;
            if (self.scrollContainer.length > 0 && self.scrollContent.length > 0 && self.identifier) {
                var elm = '#' + self.identifier + ' ' + self.options.scrollablePart;
                self.scrollContainer.addClass('ds2-iscroll-container');
                self.scrollContent.addClass('ds2-iscroll-content');

                if(!self.iscroll){
                    self.iscroll = new IScroll(elm, {
                        mouseWheel: true,
                        scrollbars: 'custom',
                        interactiveScrollbars: true,
                        click: false, // false needed, otherwise no clicking of checkboxes in registration possible
                        tap: true,
                        bounce: false,
                        momentum: true,
                        probeType: 1,
                        preventDefault: false,
                        preventDefaultException: { tagName: /^(INPUT|TEXTAREA|BUTTON|SELECT|OPTION|option|select)$/i }
                    });
                    self.element.data('digitals2-ds2Layer', {iscroll: self.iscroll});
                }else {
                    self.iscroll.refresh();
                }

            }
        };

        ds2Layer.prototype._iscrollRefresh = function() {
            if(this.iscroll){
                this.iscroll.refresh();
                this.element.data('digitals2-ds2Layer', {iscroll: this.iscroll});
            }
        };

        ds2Layer.prototype._onResize = function() {
            var self = this;
            self._setDeviceValues();

            if (self.isGallery) {
                var zoomLinks = $('.ds2-slider--zoom[data-reveal-id]');
                var videoZoomLinks = $('.ds2-video-layer-link');
                if(self.isMobile || self.isTablet){
                    // disable video layer for medium & small
                    videoZoomLinks.each(function() {
                        $(this).attr('data-reveal-id-disabled', $(this).attr('data-reveal-id')).removeAttr('data-reveal-id');
                    });
                    // disable image layer
                    zoomLinks.attr('disabled', true);
                } else{
                    // enable video layer for large
                    videoZoomLinks.each(function() {
                        $(this).attr('data-reveal-id', $(this).attr('data-reveal-id-disabled')).removeAttr('data-reveal-id-disabled');
                    });
                    // enable image layer
                    zoomLinks.attr('disabled', false);
                }
            }


            if (self.isMobile) {
                self.element.css({'top': '0px'});
            }

            self.scrollContainer.css({'max-height': 'none'});
            self._checkHeight();
        };

        return ds2Layer;
    }
);
