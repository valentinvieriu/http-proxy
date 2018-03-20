define( 'ds2-slider', [
    'use!jquery',
    'use!jquery-slick',
    'use!velocity',
    'use!log',
    'ds2-image-lazyLoad',
    'ds2-main'
], function( $, slick, velocity, log, ds2imagelazyLoad ) {

    var ds2Slider = function(element) {
        this.options = {
            currentSlide: 0
        };
        this.element = $(element);
        this._create();
    };
    var proto = ds2Slider.prototype;

    proto._create = function() {
        var self = this;
        self.options.$element = self.element;
        this.options.slider = $('.ds2-slider--main', this.element);
        this.options.sliderBottom = $('.ds2-slider--bottom', this.element);
        this.options.fullscreenModeInPlayerIsActive = false;
        this.options.prevArrow = $('.slick-prev', this.options.slider);
        this.options.nextArrow = $('.slick-next', this.options.slider);
        this.options.noSliding = self.element.hasClass('ds2-slider--no-sliding');

        if (this.options.prevArrow[0] && this.options.nextArrow[0]) {
            this.options.prevArrowHtml = this.options.prevArrow[0].outerHTML;
            this.options.nextArrowHtml = this.options.nextArrow[0].outerHTML;
        }
        this.options.prevArrow.remove();
        this.options.nextArrow.remove();

        // to check if the click has been triggered clicking on an image
        this.options.isImage = false;
        // to disable sending tracking events on page load
        this.options.sliderTrackingActive = false;

        this.options.sliderMaxWidth = 1200;
        this.options.gridMaxWidth = parseFloat($('.ds2-row-padding').css('max-width'));

        this.options.sliderSize = this.options.slider.find('.ds2-slider--slide').size() - this.options.slider.find('.slick-cloned').size();

        this.options.slickLightboxInit = false;
        this.options.sliderOversizeInit = false;
        this.options.centerPadding = '37px';//parseFloat($('.ds2-slider--space-helper').css('padding-left')) + 'px';
        this.options.adaptiveHeight = false;
        this.options.slidesToShowMedium = 1;

        this.options.AUTOMATIC = 'automatic';
        this.options.ICON = 'icon';
        this.options.SWIPE = 'swipe';
        this.options.IMAGE = 'image';
        // image loading optimization.
        var initDelayedImage = function() {
            var $this = $(this);
            var imageSrc = $this.data('delayed-img-src');
            if (imageSrc.length > 0) {
                $this.attr('data-interchange', imageSrc);
            } else {
                console.error('Cannot find image-src for delayed images.');
            }
        };
        if (this.element.closest('.ds2-stage-teaser').length > 0) {
            this.delayedImages = $('.ds2-img--delayed', this.element);
            this.immediateImages = this.element.find('.ds2-slider--img').not(this.delayedImages);
            if (this.immediateImages.complete) {
                self.delayedImages.each(initDelayedImage)
            }
            this.immediateImages.load(function(evt) {
                self.immediateImages.unbind(evt);
                self.delayedImages.each(initDelayedImage);
                self.delayedImages.foundation('interchange', 'reflow');
            });
        }

        if ($('.ds2-video-player', this.options.$element).length) {
            $('.ds2-video-player', this.options.$element)
                .on('ds2-video-player-play', function(event, trackObj) {
                    if (digitals2.tracking.eventBuilder) {
                        var slider = $(event.target).closest('.ds2-slider');
                        var eventName = 'Start video';
                        var activeElements = $('.slick-current, .slick-active', slider);
                        if (activeElements.length > 1) {
                            eventName = $(activeElements[1]).text().trim();
                        }
                        var imgObj = $(event.target).parent().prev().find('img');
                        var target = $(imgObj).attr('src');
                        trackObj = digitals2.tracking.eventBuilder.newEvent()
                            .eventName(eventName)
                            .eventAction('Start video')
                            .build();
                        trackObj.eventInfo.target = target;

                        $('.ds2-slider--main', self.options.$element).trigger('ds2slider-play-video', trackObj);
                    }
                });
            this._addSwipeEvents();
        }

        $(this.options.$element).off('videoOverlayClose').on('videoOverlayClose', function(e) {
            self._videoOverlayClose();
        });

        $(this.options.$element).off('fullscreenModeInPlayerIsActive').on('fullscreenModeInPlayerIsActive', function(e, pValue, pId) {

            self.options.fullscreenModeInPlayerIsActive = pValue;
            var pActive = $('.ds2-slider--video-player-opener', self.options.$element).parent().not('.slick-cloned').find('[data-id="' + pId + '"]').parent();

            if (pValue === false) {
                self.options.$element.css({
                    'position': 'relative'
                });
                self._videoOverlayUpdate();
            }
            else {
                self.options.$element.css({
                    'position': 'static'
                });
                var pTop = pActive.offset().top;

                $('.ds2-slider--video-container', self.options.$element).css({
                    'top': pTop,
                    'position': 'absolute'
                });

                $(window).on('scroll', function() {
                    if (self.options.fullscreenModeInPlayerIsActive === true) {
                        $('.ds2-slider--video-container', self.options.$element).css({
                            'top': $(window).scrollTop(),
                            'position': 'absolute'
                        });
                    }
                });

            }
        });

        this.options.onAfterChangeTrigger = null;

        if (this.options.slider.hasClass('ds2-autoplay') && !this.options.slider.hasClass('ds2-slider--layer')) {
            this.options.sliderAutoPlay = true;
        } else {
            this.options.sliderAutoPlay = false;
        }

        this.options.interactionInAuthorDisabled = this.options.slider.hasClass('ds2-slider--swipe-disabled');

        if (this.options.noSliding) {
            new ds2imagelazyLoad(this.options.$element);
        }
        else {
            if (this.options.slider.hasClass('ds2-slider--gallery')) {
                this.options.view = 1; // gallery videos
                this.options.sliderMaxWidth = 1680;
                this.options.slidesToShow = 1;
                this.options.centerPadding = '23%';
                this.options.centerPaddingMedium = '42.5px';
                this.options.centerPaddingSmall = '17.5px';
                this.options.centerMode = true;
                this.options.centerModeMedium = true;
                this.options.centerModeSmall = true;
                this.options.arrowsMedium = true;
                self.showNavButtons(this.options.slider);

                // modifier for model overview
                if (this.options.slider.hasClass('ds2-slider--gallery-model-overview')) {
                    this.options.modelOverview = true;
                }

            } else if (this.options.slider.hasClass('ds2-slider--gallery-twoColumns')) {
                this.options.view = 2; // gallery images
                //$sliderMaxWidth = 1680;
                this.options.slidesToShow = 2;
                this.options.centerPadding = 0;
                this.options.centerPaddingMedium = '42.5px';
                this.options.centerPaddingSmall = '17.5px';
                this.options.centerMode = true;
                this.options.centerModeMedium = true;
                this.options.centerModeSmall = true;
                this.options.arrowsMedium = true;
                self.showNavButtons(this.options.slider);

            } else if (this.options.slider.hasClass('ds2-slider--twoColumns')) {
                this.options.view = 4; // fallback detail
                this.options.slidesToShow = 2;
                this.options.slidesToShowMedium = 2;
                this.options.centerPadding = 0;
                this.options.centerPaddingMedium = 0;
                this.options.centerPaddingSmall = 0;
                this.options.centerMode = false;
                this.options.centerModeMedium = false;
                this.options.centerModeSmall = false;
                this.options.arrowsMedium = true;
                if (this.options.slider.closest('.ds2-technical-data-js--slider').length) {
                    this.options.slidesToShowMedium = 1;
                }
                self.showNavButtons(this.options.slider);

            } else if (this.options.slider.hasClass('ds2-slider--stage')) {
                this.options.view = 5; // stage teaser
                this.options.sliderMaxWidth = 1680;
                this.options.slidesToShow = 1;
                this.options.centerPadding = 0;
                this.options.centerPaddingMedium = 0;
                this.options.centerPaddingSmall = 0;
                this.options.centerMode = false;
                this.options.centerModeMedium = false;
                this.options.centerModeSmall = false;
                this.options.arrowsMedium = true;
                self.showNavButtons(this.options.slider);

            } else if (this.options.slider.hasClass('ds2-slider--teaser')) {
                this.options.view = 6; // teaser (large-6)
                this.options.slidesToShow = 1;
                this.options.centerPadding = 0;
                this.options.centerPaddingMedium = 0;
                this.options.centerPaddingSmall = 0;
                this.options.centerMode = false;
                this.options.centerModeMedium = false;
                this.options.centerModeSmall = false;
                this.options.arrowsMedium = true;
                self.showNavButtons(this.options.slider);

            } else if (this.options.slider.hasClass('ds2-slider--fourColumns')) {
                this.options.view = 4; // fallback detail
                this.options.slidesToShow = 4;
                this.options.slidesToShowMedium = 2;
                this.options.centerPadding = 0;
                this.options.centerPaddingMedium = 0;
                this.options.centerPaddingSmall = 0;
                this.options.centerMode = false;
                this.options.centerModeMedium = false;
                this.options.centerModeSmall = false;
                this.options.arrowsMedium = true;
                self.showNavButtons(this.options.slider);

            } else {
                //class: ds2-slider--fullSize, ds2-slider--layer
                this.options.view = 3; // standard view
                this.options.slidesToShow = 1;
                this.options.centerPadding = 0;
                this.options.centerPaddingMedium = 0;
                this.options.centerPaddingSmall = 0;
                this.options.centerMode = false;
                this.options.centerModeMedium = false;
                this.options.centerModeSmall = false;
                this.options.arrowsMedium = true;
                if (this.options.slider.hasClass('ds2-slider--layer')) {
                    //this.options.adaptiveHeight = true;
                }
                self.showNavButtons(this.options.slider);
            }

            if (this.options.prevArrowHtml && this.options.nextArrowHtml) {
                self.initSlider(self, this.options.slider, true, this.options.sliderBottom);
                self.sliderUpdate(this.options.slider);
                self.initSliderBottom(self, this.options.sliderBottom, false, this.options.slider);
                self.sliderUpdate(this.options.sliderBottom);

                this.options.slider.slick('slickGoTo', 0, true);//CHANGED: from 1 to 0

                self.setOversizeOuterSpace();
                self.initPositionBar();
                self.initLightbox();

                $(window.digitals2.main).on('ds2ResizeLarge ds2ResizeMedium ds2ResizeSmall', function (event) {

                    if (self.options.slider.hasClass('ds2-slider--layer')) {
                        var $sliderLayerWidth = Math.round(self.options.gridMaxWidth * 0.66);
                        var viewportWidth = Math.max(document.documentElement.clientWidth, window.innerWidth);
                        // make sure $sliderLayerWidth isn't bigger as viewportWidth
                        $sliderLayerWidth = $sliderLayerWidth > viewportWidth ? viewportWidth : $sliderLayerWidth;
                        $('.ds2-layer .ds2-row-padding').css('width', $sliderLayerWidth );
                        $('.ds2-layer').addClass('ds2-layer--container-slider');
                        self.sliderUpdate(self.options.slider);
                        self.sliderUpdate(self.options.sliderBottom);

                    } else {
                        self.sliderUpdate(self.options.slider);
                        self.sliderUpdate(self.options.sliderBottom);

                        if (self.options.slider.hasClass('ds2-slider--gallery-twoColumns')) {
                            self.setOversizeOuterSpace();

                        } else if (self.options.slider.hasClass('ds2-slider--gallery')) {
                            if (window.digitals2.main.mediaQueryWatcherCheck() === 'ds2ResizeLarge') {
                                $('.slick-prev, .slick-next', self.options.slider).css('width', '23%');
                            }
                            else {
                                $('.slick-prev, .slick-next', self.options.slider).css('width', 'auto');
                            }
                        }
                    }

                    self.initPositionBar();
                    if (event.type === 'ds2ResizeLarge') {
                        self.initLightbox();
                    } else {
                        self.destroyLightbox();
                    }

                    self.playVideo();
                    self.sliderClickableHalf();
                    self.checkEventsToDisableAutoplay();
                    self.setTriggerTrack();
                });

                $(window).trigger('resize');
            } else {
                $(this.element).hide();
            }

            this.options.slider.on('dragstart', function (event) {
                event.preventDefault();
            });

        }

        self._videoOpenerInit();

        // fade in hidden content
        $('.ds2-preloading-content', this.element).velocity({ opacity: 1 }, { duration: 400 });
    };

    proto._addSwipeEvents = function() {
        var self = this,
            touchobj,
            dist,
            startX;

        log('_addSwipeEvents');

        // swipe over video container on mobile (is position absolute so slider is not working anymore)
        self.options.$element.find('.ds2-slider--video-container').on('touchstart', function(event) {
            touchobj = event.originalEvent.changedTouches[0];
            dist = 0;
            startX = touchobj.pageX;
        });

        self.options.$element.find('.ds2-slider--video-container').on('touchend', function(event) {
            touchobj = event.originalEvent.changedTouches[0];
            dist = touchobj.pageX - startX;

            if(dist > 20) {
                log('show prev');
                self.options.slider.slick('slickPrev');
            } else if (dist < -20) {
                log('show next');
                self.options.slider.slick('slickNext');
            }
        });
    };

    proto.initSlider = function(self, $slider, $arrowsLarge, $sliderSibling) {
        this.options.slider.on('init', function() {
            new ds2imagelazyLoad($slider);
            // fix lazyload images in slick clones
            setTimeout(function() {
                $('.slick-cloned img[data-ds2-lazy-load][data-img]', $slider).each(function () {
                    $(this).attr('src', $(this).attr('data-img'))
                        .removeAttr('data-img style')
                        .removeClass('ds2-image-lazy-loading')
                        .addClass('ds2-image-lazy-loaded');
                });
            }, 250);
            self.options.sliderTrackingActive = true;
        });

        this.options.slider.slick({
            centerPadding: this.options.centerPadding,
            centerMode: this.options.centerMode,
            focusOnSelect: false,
            arrows: $arrowsLarge,
            prevArrow: this.options.prevArrowHtml,
            nextArrow: this.options.nextArrowHtml,
            infinite: true,
            lazyLoad: 'ondemand',
            slidesToShow: this.options.slidesToShow,
            slidesToScroll: 1,
            asNavFor: $sliderSibling,
            autoplay: this.options.sliderAutoPlay,
            speed: 500,
            autoplaySpeed: 5000,
            pauseOnHover: false,
            adaptiveHeight: this.options.adaptiveHeight,
            swipe: !this.options.interactionInAuthorDisabled,
            draggable: !this.options.interactionInAuthorDisabled,
            zIndex: 120,
            rtl: window.digitals2.main.isRTL
        });

        this.options.slider.on('setPosition', function(event, slick, currentSlide, nextSlide) {
            self._videoOverlayUpdate();
        });

        this.options.slider.on('beforeChange', function(event, slick, currentSlide, nextSlide) {
            if ($slider.hasClass('ds2-slider--main') && !$slider.hasClass('ds2-slider--sound')) {
                self.stopAllVideos();
            }
        });

        this.options.slider.on('afterChange', function(event, slick, currentSlide, nextSlide) {
            if ($slider.hasClass('ds2-slider--main')) {
                self._videoOpenerInit();

                $slider.data('slide-index', currentSlide);

                var trackObj;
                self.initPositionBar();

                if (self.options.sliderTrackingActive) {
                    if(!$('.ds2-slider--main', self.options.$element).hasClass('ds2-slider--sound')) {
                        trackObj = self._createTrackingObj();

                        if (trackObj) {
                            trackObj.numSlides = self.options.sliderSize;
                            $('.ds2-slider--main', self.options.$element).trigger('sliderChanged', trackObj);
                        }
                    }
                }
            }
        });

        this.options.slider.on("onSwipeMove", function (event, slick, offset) {
            var ratio = 1;
            var bottomSlick = self.options.sliderBottom && self.options.sliderBottom.slick("getSlick");

            if (bottomSlick) {
                ratio = bottomSlick.slideWidth / slick.slideWidth;
                bottomSlick.changePosition(offset * ratio);
            }
        });

    };

    proto.initSliderBottom = function(self, $slider, $arrowsLarge, $sliderSibling) {

        this.options.sliderBottom.on('init', function() {

            // trigger js in cloned slides for sliders with more than one slide in view
            if((self.options.view === 2 || self.options.view === 4) && $('.slick-cloned [data-loader="amdLoader"]', $slider).length){
                require(['componentInitializer'], function (componentInitializer) {
                    componentInitializer.initAll($('.slick-cloned', $slider));
                });
            }
        });

        this.options.sliderBottom = $slider.slick({
            centerPadding: this.options.centerPadding,
            centerMode: this.options.centerMode,
            focusOnSelect: false,
            arrows: $arrowsLarge,
            prevArrow: this.options.prevArrowHtml,
            nextArrow: this.options.nextArrowHtml,
            infinite: true,
            slidesToShow: this.options.slidesToShow,
            slidesToScroll: 1,
            asNavFor: $sliderSibling,
            autoplay: this.options.sliderAutoPlay,
            autoplaySpeed: 5000,
            pauseOnHover: false,
            adaptiveHeight: this.options.adaptiveHeight,
            swipe: !this.options.interactionInAuthorDisabled,
            draggable: !this.options.interactionInAuthorDisabled,
            zIndex: 100,
            rtl: window.digitals2.main.isRTL
        });
    };

    proto._createTrackingObj = function() {
        try {
            var trackObj = {};
            var pImage = $('.ds2-slider--slide.slick-active', this.element).first().find('img');

            trackObj.currentSlide = this.options.currentSlide;

            if (pImage.data('tracking-event') &&
                pImage.data('tracking-event').eventInfo &&
                pImage.data('tracking-event').eventInfo.eventName
            )
            {
                trackObj.eventName = pImage.data('tracking-event').eventInfo.eventName;
            } else {
                var isVideo = $(pImage).children()[0];
                isVideo = $(isVideo).hasClass('ds2-slider--video-player-opener');
                var currentTextObj;
                if (isVideo) {
                    currentTextObj = $('div[data-slick-index="' + trackObj.currentSlide + '"]:has(h4)');
                    if (currentTextObj.length > 0) {
                        currentTextObj = $(currentTextObj)[1];
                    } else {
                        currentTextObj = $(currentTextObj)[0];
                    }
                } else {
                    currentTextObj = $('div[data-slick-index="' + trackObj.currentSlide + '"]:has(h4)')[0];
                }

                currentTextObj = $(currentTextObj).find('h4');
                trackObj.eventName = $(currentTextObj).text().trim()
            }

            trackObj.target = pImage.attr('src');
            trackObj.timeStamp = Date.now();

            if (this.options.sliderAutoPlay === true) {
                trackObj.cause = this.options.AUTOMATIC;
            } else {
                var deviceIndex = window.digitals2.responsivePlus.responsivePlusDeviceGet();

                if (this.options.isImage === true) {
                    trackObj.cause = this.options.IMAGE;
                    trackObj.element = 'Image';
                } else if (deviceIndex === 0) {
                    trackObj.cause = this.options.ICON;
                    trackObj.element = 'Button';
                } else {
                    trackObj.cause = this.options.SWIPE;
                    trackObj.element = 'Other';
                }
            }
            return trackObj;

        } catch (error) {
            log(error);
        }
    };

    proto.sliderUpdate = function($slider) {
        this.options.fullscreenModeInPlayerIsActive = false;
        var $centerMode;
        var $centerPadding;
        var $slidesToShow;
        var $arrows;

        if (!$slider.hasClass('ds2-slider--layer') && !this.options.fullscreenModeInPlayerIsActive) {

            if (window.digitals2.main.mediaQueryWatcherCheck() === 'ds2ResizeSmall') {
                $centerMode = this.options.centerModeSmall;
                $centerPadding = this.options.centerPaddingSmall;
                $slidesToShow = 1;
                $arrows = !$slider.hasClass('ds2-slider--bottom') ? this.options.arrowsMedium : false;

            } else if (window.digitals2.main.mediaQueryWatcherCheck() === 'ds2ResizeMedium') {
                $centerMode = this.options.centerModeMedium;
                $centerPadding = this.options.centerPaddingMedium;
                $slidesToShow = this.options.slidesToShowMedium ? this.options.slidesToShowMedium : 1;
                $arrows = !$slider.hasClass('ds2-slider--bottom') ? this.options.arrowsMedium : false;

                if (this.options.$element.find('.ds2-slider--main.ds2-slider--twoColumns').length > 0) {
                    $slidesToShow = 2;
                }

            } else if (window.digitals2.main.mediaQueryWatcherCheck() === 'ds2ResizeLarge') {
                $centerMode = this.options.centerMode;//true;
                $centerPadding = this.options.centerPadding;//'125px';
                $slidesToShow = this.options.slidesToShow;//2;
                $arrows = true;
            }

            var redraw = false;

            if( $slider.slick('slickGetOption', 'centerMode') !== $centerMode) {
                $slider.slick('slickSetOption', 'centerMode', $centerMode, false);
                redraw = true;
            }
            if( $slider.slick('slickGetOption', 'centerPadding') !== $centerPadding) {
                $slider.slick('slickSetOption', 'centerPadding', $centerPadding, false);
                redraw = true;
            }
            if( $slider.slick('slickGetOption', 'slidesToShow') !== $slidesToShow) {
                $slider.slick('slickSetOption', 'slidesToShow', $slidesToShow, false);
                redraw = true;
            }
            if( $slider.slick('slickGetOption', 'arrows') !== $arrows) {
                $slider.slick('slickSetOption', 'arrows', $arrows, false);
                redraw = true;
            }

            if( redraw === true) {
                $slider.slick('slickSetOption', 'arrows', $arrows, true);
            }
        }
        this.initPositionBar();
    };

    proto.sliderClickableHalf = function() {
        var self = this;

        if( this.options.view !== 1 && this.options.view !== 2 && !this.options.interactionInAuthorDisabled) {
            $('.ds2-slider--slide', this.options.slider).on('click', function(e){
                if (!$(e.target).parents('.ds2-buttonlist').length) {
                    if($(e.target).is('.ds2-video-player--play') || $(e.target).is('.ds2-sound-player--play') || $(e.target).is('.ds2-icon--play-white') || $(e.target).is('.ds2-info-icon')){
                        return;
                    }
                    if (self.options.view === 4) {
                        var $activeSiblings = $(this).closest('.slick-slider').find('.slick-active'),
                            slideDirection = $activeSiblings.index(this);

                        if (slideDirection === 0) {
                            self.options.slider.slick('slickPrev');
                        } else {
                            self.options.slider.slick('slickNext');
                        }

                    } else {
                        var x = e.pageX - $('img', this).offset().left;

                        var width = $('img', this).width(),
                            where = width / 2;
                        if (x > where) {
                            self.options.slider.slick('slickNext');
                        } else {
                            self.options.slider.slick('slickPrev');
                        }
                    }
                }
            });
        }
    };

    proto.setOversizeOuterSpace = function() {
        var $centerPadding;

        if (this.options.view === 2 && $(window).width() > this.options.gridMaxWidth) {

            if ($(window).width() < 1680) {
                $centerPadding = ($(window).width() - 1200) / 2 + 'px';
            } else {
                $centerPadding = 240 + 'px'; // max-width
            }

            this.options.slider.slick('slickSetOption', 'centerPadding', $centerPadding, true);
            $('.slick-prev, .slick-next', this.options.slider).css('width', $centerPadding);
            this.options.sliderOversizeInit = true;

        } else if (this.options.view === 2) {

            var redrawValue;
            if (window.digitals2.main.mediaQueryWatcherCheck() === 'ds2ResizeSmall') {
                redrawValue = this.options.centerPaddingSmall;
            } else if (window.digitals2.main.mediaQueryWatcherCheck() === 'ds2ResizeMedium') {
                redrawValue = this.options.centerPaddingMedium;
            } else {
                redrawValue = '37px';
            }
            if(redrawValue && redrawValue !== this.options.slider.slick('slickGetOption', 'centerPadding')) {
                this.options.slider.slick('slickSetOption', 'centerPadding', redrawValue, true);
            }
        }
    };

    proto._videoOpenerInit = function() {
        var self = this;
        var pId;
        var pPlayButton;
        var singleVideos;

        if(self.options.noSliding) {
            pId = $('.ds2-slider--slide .ds2-slider--video-player-opener', this.options.$element).data('id');
            pPlayButton = $('.ds2-slider--slide .ds2-slider--video-player-opener', this.options.$element).find('.ds2-video-player--play');

            // fix for BMWST-6851
            singleVideos = $('.ds2-slider--video-single', this.options.$element);
            if (singleVideos.length > 0) {
                singleVideos.toggleClass('hide', true);
            }
        }
        else {
            pId = $('.slick-active .ds2-slider--video-player-opener', this.options.$element).data('id');
            pPlayButton = $('.slick-active .ds2-slider--video-player-opener', this.options.$element).find('.ds2-video-player--play');
        }

        $(pPlayButton, this.options.$element).off('click').on('click', function(event) {
            if (digitals2.tracking.eventBuilder) {
                var slider = $(event.target).closest('.ds2-slider');
                var eventName = 'Open video',
                 target = '',
                 element = '';

                var activeElements = $('.slick-current, .slick-active', slider);
                if (activeElements.length > 1) {
                    eventName = $(activeElements[1]).text().trim();
                }

                var dataEvent;
                if(self.options.noSliding) {
                    dataEvent = singleVideos.find('.ds2-tracking-js--event').first().data('tracking-event');
                } else {
                    dataEvent = $('#' + pId).find('.ds2-tracking-js--event').first().data('tracking-event');
                }
                if(dataEvent) {
                    target = dataEvent.eventInfo.target ? dataEvent.eventInfo.target : '';
                    element = dataEvent.eventInfo.element ? dataEvent.eventInfo.element : '';
                }
                
                var trackObj = digitals2.tracking.eventBuilder.newEvent()
                    .eventName(eventName)
                    .eventAction('Open video')
                    .target(target)
                    .element(element)
                    .build();
                $(window).trigger('video-open', trackObj);
            }
            self._videoOverlayOpen(pId);
        });

        $(window).resize(function(event) {
            self._videoOverlayUpdate();
        });

    };

    proto._videoOverlayOpen = function(pId) {
        var self = this,
            videoContainer = $('.ds2-slider--video-container', this.options.$element),
            pVideoPlayer = $('#' + pId, videoContainer),
            playerArray = window.ds2.cl.ds2Videoplayer,
            target = '';

        //console.log(pId, playerArray);
        if (pVideoPlayer.length) {
            self.options.activeLayerVideoId = pId;

            self._videoOverlayUpdate();
            self.autoPlayDisable();

            videoContainer.removeClass('hide');
            pVideoPlayer.removeClass('hide');

            // invoke video from initialized player array
            for (var i = 0;  i <  playerArray.length; ++i) {
                if(playerArray[i].options.parentID === pId){
                    playerArray[i].invokeFromLayer();
                }
            }
            if (digitals2.tracking.eventBuilder) {
                var dataEvent = pVideoPlayer.find('.ds2-tracking-js--event').first().data('tracking-event');
                if(dataEvent) {
                    target = dataEvent.eventInfo.target ? dataEvent.eventInfo.target : '';
                }
                $(window).trigger('video-start',
                    digitals2.tracking.eventBuilder.newEvent()
                        .eventName('Start video')
                        .eventAction('Start video')
                        .target(target)
                        .build());
            }
        }
    };

    proto._clearVideoLayer = function(pId) {
        var $layer = $('#' + pId);
        $layer.find('.s7videotime').remove();
        $layer.find('.s7iconeffect').remove();
        $layer.find('.s7videoplayer').empty();
        $layer.find('.s7controlbar').empty();
    };

    proto._videoOverlayClose = function() {
        var videoContainer = $('.ds2-slider--video-container', this.options.$element),
            pVideoPlayer = $('.ds2-slider--video-single', this.options.$element);

        if (pVideoPlayer) {
            videoContainer.addClass('hide');
            pVideoPlayer.addClass('hide');
        }

        this.options.activeLayerVideoId = null;
        this.options.$element.trigger('allVideosStopped');
    };

    proto._videoLayerCalculatePosition = function() {};

    proto._videoOverlayUpdate = function() {
        var pActive = $('.ds2-slider--video-player-opener', this.options.$element).parent().not('.slick-cloned').find('[data-id="' + this.options.activeLayerVideoId + '"]').parent();

        if (pActive.length <= 0) {
            //log('no active video layer');
            return;
        }

        var pW = pActive.find('.ds2-video-player--img-outer').innerWidth();

        if (this.options.fullscreenModeInPlayerIsActive === false) {
            $('.ds2-slider--video-container', this.options.$element).css({
                'top': 0,
                'left': '50%',
                'margin-left': -pW/2,
                'width': pW,
                'position': 'absolute'
            });

        }
    };

    proto.playVideo = function() {};

    proto.stopAllVideos = function() {
        var self = this;
        self.options.$element.trigger('stopAllVideos');
        if(!self.options.slider.hasClass('ds2-slider--sound')) {
            self._videoOverlayClose();
        }
    };

    proto.checkEventsToDisableAutoplay = function() {
        var self = this;

        $('.slick-prev, .slick-next', this.options.slider).on('click', function() {
            self.autoPlayDisable();
        });
        this.options.$element.on('autoPlayDisable', function() {
            self.autoPlayDisable();
        });
    };

    proto.autoPlayDisable = function() {
        var self = this;
        if (!self.options.noSliding){
            if (this.options.slider.slick('slickGetOption', 'autoplay') === true) {
                this.options.slider.slick('slickPause');
                this.options.slider.slick('slickSetOption', 'autoplay', false, false);
                this.options.sliderBottom.slick('slickPause');
                this.options.sliderBottom.slick('slickSetOption', 'autoplay', false, false);
            }
        }
    };

    proto.initPositionBar = function() {
        this.options.currentSlide = this.options.slider.slick('slickCurrentSlide');

        if (this.options.view === 2 || this.options.view === 3 || this.options.view === 4) {
            this.options.extraSpace = 7.5;
        } else {
            this.options.extraSpace = 0;
        }

        this.options.extraSpaceWidth = 0;

        if (this.options.view !== 3 && this.options.view !== 6 && this.options.view !== 5) {
            this.options.extraSpaceWidth = 15;

            if (window.digitals2.main.mediaQueryWatcherCheck() === 'ds2ResizeSmall') {
                if (this.options.view === 4) {
                    this.options.extraSpaceWidth = 0;
                } else if (this.options.view === 1 || this.options.view === 2) {
                    this.options.extraSpaceWidth = 5;
                }
            } else if (window.digitals2.main.mediaQueryWatcherCheck() === 'ds2ResizeMedium') {
                if (this.options.view === 1 || this.options.view === 2) {
                    this.options.extraSpaceWidth = 5;
                }
            }
        }

        if (this.options.view === 1 && window.digitals2.main.mediaQueryWatcherCheck() === 'ds2ResizeLarge') {

            if ($(window).width() < 1680) {
                if ($(window).width() < this.options.gridMaxWidth) {
                    this.options.sliderWidth = $(window).width() - 90;
                } else {
                    this.options.sliderWidth = $(window).width() - ($(window).width() - 1185);
                }

            } else {
                this.options.sliderWidth = 1185;
            }

            if (this.options.modelOverview) {
                // reset the outerbar to full width (prevents being stuck to previous width on window resize)
                $('.ds2-slider--position-bar-outer').width('100%');
                this.options.sliderWidth = $('.ds2-slider--position-bar-outer').width();
            }

        } else {
            this.options.sliderWidth = $('.slick-list', this.options.slider).width() - this.options.extraSpaceWidth;
        }

        var addSpace = 0;
        if(this.options.view === 2){
            // Even Number of items:
            if(!(this.options.sliderSize % 2)){
                if(this.options.currentSlide+1 === this.options.sliderSize/2 ){
                    addSpace = -1* this.options.extraSpace;
                } else if (this.options.currentSlide === this.options.sliderSize/2){
                    addSpace = this.options.extraSpace;
                }
            }
        }

        this.options.positionBarWidth = (this.options.sliderWidth)/this.options.sliderSize;
        this.options.positionBarSpace = this.options.currentSlide*this.options.positionBarWidth + this.options.extraSpace + addSpace;

        $('.ds2-slider--position-bar', this.element).css('width', this.options.positionBarWidth + 'px');
        if(window.digitals2.main.isLTR){
            $('.ds2-slider--position-bar', this.element).css('transform', 'translateX(' + this.options.positionBarSpace + 'px)');
        }
        else {
            $('.ds2-slider--position-bar', this.element).css('transform', 'translateX(-' + this.options.positionBarSpace + 'px)');
        }

        if (this.options.view === 1) {
            $('.ds2-slider--position-bar-outer', this.element).css('width', this.options.sliderWidth + 'px');
        }
    };

    proto.showNavButtons = function() {
        this.options.slider.hover(function() {
            $('.slick-prev, .slick-next', this).css('opacity', 1);
        }, function() {
            $('.slick-prev, .slick-next', this).css('opacity', 0);
        });
    };

    proto.setTriggerTrack = function() {
        var self = this;
        var download_icon = self.options.$element.find('.ds2-icon--download-white');

        download_icon.off('click').on('click', function(e) {

            var trackObj = {};
            var updatedIndex = self.options.currentSlide;

            trackObj.eventPoints = 'image-' + updatedIndex;
            trackObj.eventName = $(this).attr('download');
            trackObj.timeStamp = Date.now();
            trackObj.eventAction = 'Download';
            trackObj.target = $(this).attr('download');

            var dataEvent = $(this).data('tracking-event');
            var dataOptions = $(this).data('tracking-options');

            trackObj.mmdr = dataEvent.category.mmdr;

            $('.ds2-slider--main', self.options.$element).trigger('download-image', trackObj);

        });

    };

    proto.destroyLightbox = function() {
        $('.ds2-slider--zoom', this.options.$element).off('click');
    };

    proto.initLightbox = function() {
        var self = this;

        $('.ds2-slider--zoom', self.options.$element).off('click').on('click', function(event) {

            self.autoPlayDisable();

            var pId = '#' + $(this).attr('data-reveal-id');
            var $activeSlide = $(this).closest('.ds2-slider--slide').data('slick-index');
            var layerSliders = $('.ds2-slider--layer', pId);
            //layerSliders.slick('slickSetOption', 'centerPadding', 0, true);
            layerSliders.slick('slickGoTo', $activeSlide, true);

            setTimeout(function(){
                self.sliderUpdate(layerSliders);
                layerSliders.slick('slickGoTo', $activeSlide);
            }, 750);

            var download_icon = layerSliders.parent().find('.ds2-icon--download-white');
            download_icon.off('click').on('click', function(e) {

                var trackObj = {};
                var closest = $(this).closest('.ds2-slider--layer');
                var updatedIndex = closest.slick('slickCurrentSlide');

                trackObj.eventPoints = 'image-' + updatedIndex;
                trackObj.eventName = $(this).data('tracking-options').name;
                trackObj.timeStamp = Date.now();
                trackObj.eventAction = 'Download';
                trackObj.target = $(this).attr('download');

                var dataEvent = $(this).data('tracking-event');
                var dataOptions = $(this).data('tracking-options');

                trackObj.mmdr = dataEvent.category.mmdr;
                $('.ds2-slider--main', self.options.$element).trigger('download-image', trackObj);
                e.stopPropagation();
            });
            // BMWDGTLEP-2681 - general click tracking
            // var arrow_button = layerSliders.closest('.ds2-slider').find('.ds2-slider--clickable-half');
            // arrow_button.unbind('click.tracking');
            // arrow_button.on('click.tracking', function(e) {
            //
            //     var trackObj = {};
            //     var closest = $(this).closest('.ds2-slider--layer');
            //     var updatedIndex = closest.slick('slickCurrentSlide');
            //     var dataEvent = $(this).closest('.ds2-slider').data('tracking-event');
            //     var dataOptions = $(this).closest('.ds2-slider').data('tracking-options');
            //
            //     $('.ds2-slider--main', self.options.$element).trigger('expand-click-arrow',
            //         digitals2.tracking.eventBuilder.newEvent()
            //             .eventName('Exterior')
            //             .eventAction('Open image')
            //             .eventPoints('image-' + updatedIndex)
            //             .mmdr(dataEvent.category.mmdr)
            //             .cause('arrow')
            //             .element('Other')
            //             .target($(this).closest('.ds2-slider--layer').find('.slick-current .ds2-slider--img-outer .ds2-slider--img').attr('src'))
            //             .build());
            //     e.stopPropagation();
            // });
            // layerSliders.unbind('click.tracking');
            // layerSliders.unbind('swipe.tracking');
            // layerSliders.on('click.tracking', function() {
            //   var trackObj = {};
            //   var $layer = $(this).closest('.ds2-slider--layer');
            //   var updatedIndex = $layer.slick('slickCurrentSlide');
            //   var dataEvent = $(this).closest('.ds2-slider').data('tracking-event');
            //   var dataOptions = $(this).closest('.ds2-slider').data('tracking-options');
            //
            //   $('.ds2-slider--main', self.options.$element).trigger('slider-swipe-tracking',
            //     digitals2.tracking.eventBuilder.newEvent()
            //       .eventName('Exterior')
            //       .eventAction('Open image')
            //       .eventPoints('image-' + updatedIndex)
            //       .mmdr(dataEvent.category.mmdr)
            //       .cause('swipe')
            //       .element('Other')
            //       .target($(this).closest('.ds2-slider--layer').find('.slick-current .ds2-slider--img-outer .ds2-slider--img').attr('src'))
            //       .build());
            // });
            // layerSliders.on('swipe.tracking', function() {
            //     var trackObj = {};
            //     var $layer = $(this).closest('.ds2-slider--layer');
            //     var updatedIndex = $layer.slick('slickCurrentSlide');
            //     var dataEvent = $(this).closest('.ds2-slider').data('tracking-event');
            //     var dataOptions = $(this).closest('.ds2-slider').data('tracking-options');
            //
            //     $('.ds2-slider--main', self.options.$element).trigger('slider-swipe-tracking',
            //         digitals2.tracking.eventBuilder.newEvent()
            //             .eventName('Exterior')
            //             .eventAction('Open image')
            //             .eventPoints('image-' + updatedIndex)
            //             .mmdr(dataEvent.category.mmdr)
            //             .cause('swipe')
            //             .element('Other')
            //             .target($(this).closest('.ds2-slider--layer').find('.slick-current .ds2-slider--img-outer .ds2-slider--img').attr('src'))
            //             .build());
            // });
            //
            // //Tracking
            // var trackObj = {};
            // trackObj.eventAction = 'Open image';
            // trackObj.currentSlide = self.options.currentSlide;
            // trackObj.eventName = $('img', this).attr('src');
            // trackObj.cause = '';
            // trackObj.element = '';
            // trackObj.activeSlide = $activeSlide;
            // if($(this).data('tracking-event')) {
            //     trackObj.mmdr = $(this).data('tracking-event').category.mmdr;
            // }
            //
            // var a = $(event.originalEvent.srcElement).prop('tagName');
            // if(a === 'SPAN') {
            //     trackObj.cause = 'icon';
            //     trackObj.element = 'Button';
            // } else if(a === 'IMG') {
            //     trackObj.cause = 'image';
            //     trackObj.element = 'Image';
            // }
            // $('.ds2-slider--main', self.options.$element).trigger('expand-click-zoom', trackObj);
        });
    };

    return ds2Slider;
} );

/*
 * Fallback in case AMD Markup is missing
 * @TODO check if it can be removed with QA
 */
require( [ 'ds2-slider' ], function( ds2Slider ) {
    $( '.ds2-slider' ).not( "[data-loader='amdLoader']" ).each( function( ) {
        return new ds2Slider( this );
    } );
} );
