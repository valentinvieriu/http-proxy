define('ds2-content-slider', [
    'use!jquery',
    'ds2-image-lazyLoad',
    'use!jquery-slick',
    'ds2-main'
], function($, ds2imagelazyLoad) {

    var ds2contentslider = function (element) {
        this.options = {mq: ''};
        this.element = $(element);
        new ds2imagelazyLoad(element);
        this._create();
    };

    Object.assign(ds2contentslider.prototype, {

        getEvent: function () {
            return {
                eventInfo: {
                    eventName: '',
                    eventAction: '',
                    eventPoints: '',
                    timeStamp: Date.now().toString(),
                    target: '',
                    cause: '',
                    effect: ''
                },
                category: {
                    primaryCategory: '',
                    mmdr: '',
                    eventType: ''
                },
                attributes: {
                    relatedPageName: '',
                    relatedPageCategory: '',
                    relatedComponent: {
                        componentInfo: '',
                        category: '',
                        attributes: ''
                    }
                }
            };
        },

        _create: function () {
            var self = this;
            self.options.$element = self.element;
            self.options.$slider = $('.ds2-content-slider--content', self.element);
            self.options.$navslider = $('.ds2-content-slider--nav', self.element);
            self.options.$expandCopy = $('.ds2-expand--body-copy-container', self.element);
            self.options.$round = 0;
            self.options.slidesHowMany = $('.ds2-content-slider--tile', self.element).length;
            self.options.navCause = null;
            self.options.currentSlide = 0;
            var $prevArrow = $('.slick-prev', self.options.$slider);
            var $nextArrow = $('.slick-next', self.options.$slider);
            $prevArrow.show();
            $nextArrow.show();
            if ($prevArrow[0] && $nextArrow[0]) {
                self.options.$prevArrowHtml = $prevArrow[0].outerHTML;
                self.options.$nextArrowHtml = $nextArrow[0].outerHTML;
            }
            $prevArrow.remove();
            $nextArrow.remove();
            self.options.$slidesToShow = 1;
            self.options.$autoPlay = !!self.element.hasClass('ds2-autoplay');
            if ($prevArrow[0] && $nextArrow[0]) {
                self.sliderSet();
                if (window.digitals2.main.mediaQueryWatcherCheck() === 'ds2ResizeSmall' || window.digitals2.main.mediaQueryWatcherCheck() === 'ds2ResizeMedium') {
                    self.navsliderSet(4);
                } else {
                    self.navsliderSet(6);
                }
                var $windowDigitals2Main = $(window.digitals2.main);
                $windowDigitals2Main.on('ds2ResizeSmall', function () {
                    self.options.mq = 'small';
                    self.navsliderUpdate(4);
                    self.sliderSetAdaptive();
                });
                $windowDigitals2Main.on('ds2ResizeMedium', function () {
                    self.options.mq = 'medium';
                    self.navsliderUpdate(4);
                    self.sliderSetAdaptive();
                });
                $windowDigitals2Main.on('ds2ResizeLarge', function () {
                    self.options.mq = 'large';
                    self.navsliderUpdate(6);
                    self.sliderSetAdaptive();
                });
                $windowDigitals2Main.on('ds2ResizeSmall ds2ResizeMedium ds2ResizeLarge', function (event) {
                    var $pImgHeight = $('.slick-slide img', self.options.$slider).first().height();
                    self.navsliderCheckWidth();
                });
                self.options.$expandCopy.on('expandCopyContainerEnded', function (event) {
                    self.sliderSetAdaptive();
                });
                self.arrowsSet();
                $(window).scroll(function () {
                    self.stickyBehavior();
                });
            } else {
                $('.ds2-content-slider--tile', self.element).css({'display': 'block'});
            }
            self._navCauseListeners();
        },

        _createTrackingObj: function () {
            var self = this,
                pOptions = {},
                pEvent = self.getEvent();
            pOptions.active = true;
            pOptions.type = 'impression';
            pOptions.name = 'impression';
            pOptions.useTimer = false;
            pOptions.clearVars = false;
            pOptions.timing = true;
            pEvent.eventInfo.eventName = $.trim($('.slick-active img', self.options.$element).attr('src'));
            pEvent.eventInfo.eventAction = 'Impression';
            pEvent.eventInfo.eventPoints = self.options.currentSlide;
            pEvent.eventInfo.timeStamp = Date.now();
            pEvent.eventInfo.cause = self.options.navCause;
            pEvent.eventInfo.target = $.trim($('.slick-active h3', self.options.$element).text());
            pEvent.category.primaryCategory = 'Interaction';
            pEvent.category.eventType = 'triggered';
            if (self.options.navCause === 'automatic') {
                if (self.options.currentSlide % self.options.slidesHowMany == 0) {
                    self.options.$round++;
                }
            }
            pEvent.eventInfo.effect = self.options.$round;
            return {
                pEvent: pEvent,
                pOptions: pOptions
            };
        },

        _navCauseListeners: function () {
            this.options.$slider.on('click', '.slick-next, .slick-prev', function () {
                this.options.navCause = 'icon';
            }.bind(this));
            this.options.$slider.on('swipe', function (event, slick, direction) {
                this.options.navCause = 'swipe';
            }.bind(this));
            this.options.$navslider.find('.ds2-content-slider--nav-item').on('click', function () {
                this.options.navCause = 'icon';
            }.bind(this));
        },

        navsliderUpdate: function (pSlidesToShow) {
            this.options.$navslider.slick('slickSetOption', 'slidesToShow', pSlidesToShow, true);
        },

        navsliderCheckWidth: function () {
            var pHideSpan = false;
            var self = this;
            $('.ds2-content-slider--nav-item span', self.options.$navslider).show();
            $('.ds2-content-slider--nav-item.slick-active', self.options.$navslider).each(function (index, val) {
                var $this = $(this);
                var elementWidth = $this.width();
                var pStyle = $this.attr('style');
                var pParts = pStyle.split(' ');
                $.each(pParts, function (key, value) {
                    if (value.indexOf('width')) {
                        var pWidthArr = value.split('px');
                        var pWidth = parseInt(pWidthArr[0]);
                        if (elementWidth > pWidth) {
                            pHideSpan = true;
                        }
                    }
                });
            });
            if (pHideSpan) {
                $('.ds2-content-slider--nav-item span', self.options.$navslider).hide();
            } else {
                $('.ds2-content-slider--nav-item span', self.options.$navslider).show();
            }
        },

        navsliderSet: function (pSlidesToShow) {
            var self = this;
            self.options.$navslider.on('init', function () {
                self.navsliderCheckWidth();
            });
            self.options.$navslider.slick({
                arrows: false,
                slidesToShow: pSlidesToShow,
                slidesToScroll: 1,
                asNavFor: self.options.$slider,
                dots: false,
                centerMode: false,
                centerPadding: 0,
                focusOnSelect: true,
                infinite: true,
                draggable: true,
                speed: 900,
                autoplay: self.options.$autoPlay,
                autoplaySpeed: 5000,
                rtl: window.digitals2.main.isRTL
            });
            self.options.$navslider.find('.slick-slide:not(.slick-cloned)').eq(0).addClass('ds2-content-slider--slick-active');
        },

        sliderSet: function () {
            var self = this,
                pNavslider = self.options.$navslider,
                pSlider = self.options.$slider;
            self.options.$slider.on('init', function () {
                $('.ds2-content-slider--tile', self.options.$slider).show();
            });
            self.options.$slider.slick({
                centerPadding: 0,
                centerMode: false,
                focusOnSelect: false,
                arrows: true,
                prevArrow: self.options.$prevArrowHtml,
                nextArrow: self.options.$nextArrowHtml,
                infinite: true,
                slidesToShow: self.options.$slidesToShow,
                slidesToScroll: 1,
                draggable: true,
                speed: 900,
                autoplay: self.options.$autoPlay,
                autoplaySpeed: 5000,
                asNavFor: self.options.$navslider,
                adaptiveHeight: false,
                swipe: true,
                rtl: window.digitals2.main.isRTL
            });
            self.options.$slider.on('setPosition', function () {
                self.stickyBehavior();
            });
            self.options.$slider.on('beforeChange', function (event, slick, currentSlide, nextSlide) {
                pNavslider.find('.slick-slide').removeClass('ds2-content-slider--slick-active');
                pNavslider.find('.slick-slide:not(.slick-cloned)').eq(nextSlide).addClass('ds2-content-slider--slick-active');
            });
            self.options.$slider.on('afterChange', function (event, slick, currentSlide, nextSlide) {
                self.options.currentSlide = currentSlide + 1;
                var $e = $(self.options.$element);
                if (self.options.navCause === null && $e.hasClass('ds2-autoplay') && !$e.hasClass('ds2-slider--layer')) {
                    self.options.navCause = 'automatic';
                }
                var trackObj = {};
                trackObj.currentSlide = self.options.currentSlide;
                trackObj.navCause = self.options.navCause;
                trackObj.effect = '';
                if (self.options.navCause === 'automatic') {
                    if (self.options.currentSlide % self.options.slidesHowMany === 0) {
                        self.options.$round++;
                        trackObj.effect = self.options.$round;
                    }
                }
                self.options.$element.trigger('ds2-content-slider-interaction', trackObj);
                self.options.navCause = null;
            }.bind(this));

            $(window).ready(function () {
                pSlider.imagesLoaded(function () {
                    self.sliderSetAdaptive();
                });
            });

        },

        sliderSetAdaptive: function () {
            this.options.$slider.slick('slickSetOption', 'adaptiveHeight', true, true);
        },

        arrowsSet: function () {
            var self = this,
                $prev = $('.slick-prev', self.options.$slider),
                $next = $('.slick-next', self.options.$slider),
                sliderTopPos = $('.slick-slide img', self.options.$slider).first().height() / 2 - $prev.height() / 2;
            $prev.css({top: sliderTopPos});
            $next.css({top: sliderTopPos});
        },

        stickyBehavior: function () {
            if (this.options.slidesHowMany > 1) {
                var self = this,
                    pPosition,
                    pRight,
                    pLeft,
                    pTop,
                    $prev = $('.slick-prev', self.options.$slider),
                    $next = $('.slick-next', self.options.$slider),
                    docViewTop = $(window).scrollTop(),
                    windowHeightHalf = $(window).height() / 2 - $prev.height() / 2,
                    sliderTop = self.options.$slider.offset().top,
                    sliderTopPos = $('.slick-slide img', self.options.$slider).first().height() / 2 - $prev.height() / 2, sliderEndPos = self.options.$slider.height() - 75, startPositionReached = sliderTop + sliderTopPos < docViewTop + windowHeightHalf, endPositionReached = sliderTop + sliderEndPos < docViewTop + windowHeightHalf, prevOffsetLeft, nextOffsetRight;
                if (window.digitals2.main.isRTL) {
                    prevOffsetLeft = $next.offset().left;
                    nextOffsetRight = $next.offset().left;
                } else {
                    prevOffsetLeft = $prev.offset().left;
                    nextOffsetRight = $prev.offset().left;
                }
                if (self.options.mq === 'small') {
                    sliderEndPos = self.options.$slider.height() - 55;
                }
                if (endPositionReached) {
                    pPosition = 'absolute';
                    if (self.options.mq === 'small') {
                        pRight = -12.5;
                        pLeft = -12.5;
                    } else {
                        pRight = -27.5;
                        pLeft = -27.5;
                    }
                    pTop = sliderEndPos;
                } else if (startPositionReached) {
                    pPosition = 'fixed';
                    pRight = nextOffsetRight;
                    pLeft = prevOffsetLeft;
                    pTop = windowHeightHalf;
                } else {
                    pPosition = 'absolute';
                    if (self.options.mq === 'small') {
                        pRight = -12.5;
                        pLeft = -12.5;
                    } else {
                        pRight = -27.5;
                        pLeft = -27.5;
                    }
                    pTop = sliderTopPos;
                }
                if (pPosition && !isNaN(pRight) && !isNaN(pLeft) && pTop) {
                    if (window.digitals2.main.isLTR) {
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
                    } else {
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
            }
        }
    });
    return ds2contentslider;
});
