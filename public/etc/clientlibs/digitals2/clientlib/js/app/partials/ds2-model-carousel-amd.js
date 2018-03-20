/**
 * @author Andrei Dumitrescu
 * @description Refactored Model Carousel using AMD
 */
define(
    'ds2-model-carousel',
    [
        'use!jquery',
        'use!jquery-slick',
        'ds2-main'
    ], 
    function($, slick) {
        'use strict';
        var ds2ModelCarousel = function( element ) {
            this.element = $(element);
            this.options = {};
            this.create();
        };

        var proto = ds2ModelCarousel.prototype;

        proto.create = function() {
            var self = this;
            this.options.$contentItem = $('.ds2-model-carousel--content-item', this.element);
            this.options.$header = $('.ds2-model-carousel--head', this.element);
            this.options.$imageSlider = $('.ds2-model-carousel--image-slider', this.element);
            this.options.$contentSlider = $('.ds2-model-carousel--content-slider', this.element);
            this.options.contentSliderInitialized = false;
            this.options.$prevButton = $('.slick-prev', this.options.$contentItem);
            this.options.$nextButton = $('.slick-next', this.options.$contentItem);
            this.options.$slickList = $('.slick-list', this.options.$contentItem);
            this.options.sliderMax = $('.ds2-model-carousel--image-slide', this.options.$imageSlider).length;
            this.options.slideIs = 0;
            this.options.slideWas = 0;
            this.options.slideDirection = 'none';
            this.options.sliderHeight = 0;
            this.options.sliderWidth = 0;
            this.options.sliderDuration = 900;
            // disabled infinite loop for version with 1 or 2 cars
            this.options.infinite = this.options.sliderMax > 2;
             // styles for the 3 visible cars
            if(window.digitals2.main.isLTR) {
                this.options.carSizes = {
                    next: {
                        width: '50%',
                        marginTop: '30px',
                        marginLeft: 0
                    },
                    center: {
                        width: '100%',
                        marginTop: 0,
                        marginLeft: 'auto'
                    },
                    prev: {
                        width: '50%',
                        marginTop: '30px',
                        marginLeft: '50%'
                    }
                };
            }
            // flip for RTL support
            if(window.digitals2.main.isRTL){
                this.options.carSizes = {
                next: {
                    width: '50%',
                    marginTop: '30px',
                    marginRight: 0
                },
                center: {
                    width: '100%',
                    marginTop: 0,
                    marginRight: 'auto'
                },
                prev: {
                    width: '50%',
                    marginTop: '30px',
                    marginRight: '50%'
                }
                };
            }
             //Smoother Animation via transition if browser can handle it
            //Exclude transitions for browser which cant handle transitions
            this.options.transitionReady = Modernizr.csstransitions;
            this.initImageSlider();
            this.initContentSlider();
            if (self.options.sliderMax > 1) {
                window.digitals2.main.$window.on('scroll', function() {
                    self.stickyButtons();
                });
            }
            window.digitals2.main.$window.on('resize', Foundation.utils.throttle(function() {
                self.defaultSizes();
                self.stickyButtons();
            }, this.options.sliderDuration));
            if (this.options.sliderMax === 1) {
                this.defaultSizes();
            }
        };

        proto.initImageSlider = function() {
            var self = this;
            this.options.$imageSlider.on('init', function() {
                self.defaultSizes();
                self.stickyButtons();
                if (self.options.sliderMax == 2) {
                    self.toggleButtons();
                }
            });
            this.options.$imageSlider.on('beforeChange', function(event, slick, currentSlide, nextSlide) {
                self.options.slideIs = nextSlide;
                self.options.slideWas = currentSlide;
                if(self.options.slideIs != self.options.slideWas) { //BMWST-4429 //avoid image resizing on focusing the image in the center
                    if (self.options.sliderMax == 2) {
                        self.toggleButtons();
                        // standard center image id greater than prev image id
                        if ((self.options.slideIs == 1)) {
                            self.options.slideDirection = 'next';
                        }
                        // standard center image id smaller than prev image id
                        else {
                            self.options.slideDirection = 'prev';
                        }
                    } else {
                        // first image is center, prev image was last image
                        if ((self.options.slideIs == 0) && (self.options.slideWas == self.options.sliderMax - 1)) {
                            self.options.slideDirection = 'next';
                        }
                        // last image is center, prev image was first image
                        else if ((self.options.slideIs == self.options.sliderMax - 1) && (self.options.slideWas == 0)) {
                            self.options.slideDirection = 'prev';
                        }
                        // standard center image id greater than prev image id
                        else if ((self.options.slideIs > self.options.slideWas)) {
                            self.options.slideDirection = 'next';
                        }
                        // standard center image id smaller than prev image id
                        else if ((self.options.slideIs < self.options.slideWas)) {
                            self.options.slideDirection = 'prev';
                        }
                    }
                    self.animate(self.options.slideDirection);
                }
            });
            this.options.$imageSlider.on('afterChange', function(event, slick, currentSlide) {
                self.stickyButtons();
                $('.ds2-model-carousel--image-slider', self.element).trigger('ds2-model-carousel-change', {currentSlide: currentSlide, totalSlides: slick.slideCount});  // tracking stuff causes bugs
            });
            this.options.$imageSlider.slick({
                centerPadding: '25%',
                centerMode: true,
                focusOnSelect: true,
                prevArrow: $('.slick-prev', this.options.$contentItem),
                nextArrow: $('.slick-next', this.options.$contentItem),
                infinite: this.options.infinite,
                speed: this.options.sliderDuration,
                asNavFor: this.options.$contentSlider,
                touchMove: false,
                rtl: window.digitals2.main.isRTL,
                responsive: [
                {
                    breakpoint: 520,
                    settings: {
                        centerPadding: 0,
                        centerMode: false
                    }
                }
                ]
            });
        };

        proto.initContentSlider = function() {
            var self = this;
            this.options.$contentSlider.on('init', function() {
                self.defaultSizes();
                self.options.contentSliderInitialized = true;
            });
            this.options.$contentSlider.slick({
                infinite: this.options.infinite,
                centerPadding: 0,
                draggable: false,
                touchMove: false,
                arrows: false,
                asNavFor: this.options.$imageSlider,
                speed: this.options.sliderDuration,
                adaptiveHeight: true,
                rtl: window.digitals2.main.isRTL
            });
        };

        proto.defaultSizes = function() {
            var $allImages = $('img', '.ds2-model-carousel--image-slider .slick-slide', this.element),
                $allData = $('.ds2-model-carousel--content-slider .slick-slide', parent.element),
                $centerContainer = $('.ds2-model-carousel--image-slider .slick-center', this.element),
                $center = $centerContainer.children('img'),
                $prev = $centerContainer.prev().children('img'),
                $next = $centerContainer.next().children('img');

            if (this.options.transitionReady == true) {
                // default image sizes for medium-up (center image large, left/right images smaller)
                if (window.digitals2.main.mediaQueryWatcherCheck() != 'ds2ResizeSmall') {
                    $center
                    .removeClass('ds2-model-carousel--move-center')
                    .removeClass('ds2-model-carousel--move-prev')
                    .removeClass('ds2-model-carousel--move-next');
                    $next.addClass('ds2-model-carousel--move-next');
                    $prev.addClass('ds2-model-carousel--move-prev');
                }
                // default image sizes for small (one image only)
                else {
                    $allImages
                    .removeClass('ds2-model-carousel--move-next')
                    .removeClass('ds2-model-carousel--move-prev')
                    .addClass('ds2-model-carousel--move-center');
                }
            } else {
                // default image sizes for medium-up (center image large, left/right images smaller)
                if (window.digitals2.main.mediaQueryWatcherCheck() != 'ds2ResizeSmall') {
                    $next.css(this.options.carSizes.next);
                    $center.css(this.options.carSizes.center);
                    $prev.css(this.options.carSizes.prev);
                }
                // default image sizes for small (one image only)
                else {
                    $allImages.css(this.options.carSizes.center);
                }
            }
            this.options.sliderWidth = this.options.$imageSlider.width();
            if (this.options.sliderWidth >= 875) {    //980 (large) - 2*37.5 (component row padding left&right) - (2*15 content slider margin)
                $allData.css({
                    'padding-left': this.options.sliderWidth / 4 + 7.5,
                    'padding-right': this.options.sliderWidth / 4 + 7.5
                });
            }
            else {
                $allData.css({
                    'padding-left': 0,
                    'padding-right': 0
                });
            }
            // need to set height of image slider to prevent jumping on animation
            if (window.digitals2.main.mediaQueryWatcherCheck() != 'ds2ResizeSmall') {
                this.options.sliderWidth = this.options.sliderWidth / 2 - 15;
            }
            this.options.sliderHeight = this.options.sliderWidth / 16 * 9;
            this.options.$imageSlider.css('height', this.options.sliderHeight);

            //force slick repaint after content resize to make adaptive height work on orientation change
            if(this.options.contentSliderInitialized === true){
                this.options.$slickList.removeAttr('style');
                this.options.$contentSlider.slick('slickSetOption', 'adaptiveHeight', true, true);
            }
        };

        proto.stickyButtons = function() {
            var $prev = this.options.$prevButton,
                $next = this.options.$nextButton,
                docViewTop = $(window).scrollTop(),
                windowHeightHalf = $(window).height() / 2 - $prev.height() / 2,
                sliderTop = this.options.$contentItem.offset().top - this.options.$header.height(),
                sliderTopPos = this.options.sliderHeight / 2 - $prev.height() / 2 + this.options.$header.height(),
                sliderEndPos = this.options.$contentItem.height() - 100 + this.options.$header.height(),
                startPositionReached = sliderTop + sliderTopPos < docViewTop + windowHeightHalf,
                endPositionReached = sliderTop + sliderEndPos < docViewTop + windowHeightHalf,
                offset = this.options.$imageSlider.offset().left,
                pPosition, pRight, pLeft, pTop;
            if (window.digitals2.main.mediaQueryWatcherCheck() == 'ds2ResizeSmall') {
                sliderEndPos = this.options.$contentItem.height() - windowHeightHalf / 2 + this.options.$header.height();
                endPositionReached = sliderTop + sliderEndPos < docViewTop + windowHeightHalf;
            }
            if (endPositionReached) {
                pPosition = 'absolute';
                if (window.digitals2.main.mediaQueryWatcherCheck() == 'ds2ResizeSmall') {
                    pRight = -20;
                    pLeft = -20;
                } else {
                    pRight = -35; // BMWST-2082
                    pLeft = -35;  //
                }
                pTop = sliderEndPos;
            }
            else if (startPositionReached)
            {
                pPosition = 'fixed';
                if (window.digitals2.main.mediaQueryWatcherCheck() == 'ds2ResizeSmall') {
                    pRight = offset - 20;
                    pLeft = offset - 20;
                } else {
                    pRight = offset - 35; // BMWST-2082
                    pLeft = offset - 35;  //
                }
                pTop = windowHeightHalf;
            }
            else
            {
                pPosition = 'absolute';
                if (window.digitals2.main.mediaQueryWatcherCheck() == 'ds2ResizeSmall') {
                    pRight = -20;
                    pLeft = -20;
                } else {
                    pRight = -35; // BMWST-2082
                    pLeft = -35;  //
                }
                pTop = sliderTopPos;
            }
            if (pPosition && !isNaN(pRight) && !isNaN(pLeft) && pTop) {
                if(window.digitals2.main.isLTR){
                    $next.css({
                        position: pPosition,
                        right: pRight,
                        top: pTop
                    });
                    $prev.css({
                        position: pPosition,
                        left: pLeft,
                        top: pTop
                    });
                    }
                    else {
                    $next.css({
                        position: pPosition,
                        left: pRight,
                        top: pTop
                    });
                    $prev.css({
                        position: pPosition,
                        right: pLeft,
                        top: pTop
                    });
                }
            }
        };

        proto.animate = function(direction) {
            if (window.digitals2.main.mediaQueryWatcherCheck() != 'ds2ResizeSmall') {
                var self = this,
                    animationSettings = {
                        duration: this.options.sliderDuration,
                        delay: 0,
                        sequenceQueue: false
                    },
                    $centerContainer = $('.ds2-model-carousel--image-slider .slick-center', this.element),
                    $center = $centerContainer.children('img'),
                    // prev1: left from center and visible
                    // prev2: 2 left from center and not visible
                    $prev1 = $centerContainer.prev().children('img'),
                    $prev2 = $centerContainer.prev().prev().children('img'),
                    // next1: right from center and visible
                    // next2: 2 right from center and not visible
                    $next1 = $centerContainer.next().children('img'),
                    $next2 = $centerContainer.next().next().children('img');
                if (self.options.transitionReady == true) {
                    // Transitions
                    if (direction == 'next') {
                        //Set new behavior
                        $next2.removeClass('ds2-model-carousel--move-prev ds2-model-carousel--move-center').addClass('ds2-model-carousel--move-next');
                        $next1.removeClass('ds2-model-carousel--move-next ds2-model-carousel--move-prev').addClass('ds2-model-carousel--move-center');
                        $center.removeClass('ds2-model-carousel--move-center ds2-model-carousel--move-next').addClass('ds2-model-carousel--move-prev');
                    }
                    else if (direction == 'prev') {
                        //Set new bahvior
                        $center.removeClass('ds2-model-carousel--move-center ds2-model-carousel--move-prev').addClass('ds2-model-carousel--move-next');
                        $prev1.removeClass('ds2-model-carousel--move-prev ds2-model-carousel--move-next').addClass('ds2-model-carousel--move-center');
                        $prev2.removeClass('ds2-model-carousel--move-next ds2-model-carousel--move-center').addClass('ds2-model-carousel--move-prev');
                    }
                } else {
                //Velocity
                    if (direction == 'next') {
                        // animate 2-right from center (invisible) to 1-right from center
                        $next2.velocity(self.options.carSizes.next, animationSettings);
                        // animate 1-right from center (invisible) to center
                        $next1.velocity(self.options.carSizes.center, animationSettings);
                        // animate center to 1-left from center
                        $center.velocity(self.options.carSizes.prev, animationSettings);
                    }
                    else if (direction == 'prev') {
                        // animate center to 1-right from center
                        $center.velocity(self.options.carSizes.next, animationSettings);
                        // animate 1-left from center to center
                        $prev1.velocity(self.options.carSizes.center, animationSettings);
                        // animate 2-left from center (invisible) to 1-left from center
                        $prev2.velocity(self.options.carSizes.prev, animationSettings);
                    }
                }
            }
        };

        proto.toggleButtons = function() {
            if ((this.options.slideIs == 0)) {
                $('.slick-next', this.options.$contentItem).css('opacity', '1.0');
                $('.slick-prev', this.options.$contentItem).css('opacity', '0.0');
            }
            else {
                $('.slick-next', this.options.$contentItem).css('opacity', '0.0');
                $('.slick-prev', this.options.$contentItem).css('opacity', '1.0');
            }
        };

        return ds2ModelCarousel;
    }
);
