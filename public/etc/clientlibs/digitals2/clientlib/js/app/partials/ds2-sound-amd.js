/**
 * @author Andrei Dumitrescu
 * @description AMD version of the Sound component
 */
define(
    'ds2-sound',
    [
        'use!jquery',
        'ds2-refresh-sound',
        'use!log',
        'use!slick',
        'ds2-main'
    ],
    function($, ds2ReloadSound) {

        'use strict';
        function ds2Sound(element, log) {
            this.element = $(element);
            this.options = {
                currentSlide: 0
            };
            this.init();
        }

        // reinit the component js files on editing events

        ds2ReloadSound();

        ds2Sound.prototype.init = function() {
            var self = this;
            self.options.$element = self.element;


            $(window.digitals2.main).on('ds2ResizeSmall ds2ResizeMedium ds2ResizeLarge ds2ResizeLargeNavi ds2ResizeMediumNavi ds2ResizeSmallNavi', function(){self._onResize()});

            self._addPlayerEvents();
            self._addSwipeEvents();
            self._addVideoEvents();
            self._addSliderEvents();

            self._setDownloadTriggerTrack();
            self._showCurrentSlide();
        };

        ds2Sound.prototype._onResize = function() {
            this._checkPositionBar();
        };

        ds2Sound.prototype._addPlayerEvents= function () {
            var self = this;

            // click overlay on slider thumbs
            self.element.find('.ds2-sound-player--play').on('click', function(event) {
                self._onSoundPlayClicked(self, event);
            });

            self.element.find('.ds2-sound-player--play').on('mouseover mouseleave focusin focusout', function(event) {
                var $curTarget = $(event.currentTarget);
                $curTarget.parent('.ds2-video-player--img-outer').toggleClass('zoom-effect--active');
            });

            // click play button on silder thumbnails
            self.element.find('.ds2-video-player--play-sound').on('click', function(event) {
                if (window.digitals2.main.mediaQueryWatcherCheck() === 'ds2ResizeSmall') {
                    var pId = $(event.currentTarget).closest('.ds2-slider--video-player-opener').data('id');
                    var pVideoPlayer = $('.ds2-slider--video-single[id="' + pId + '"]', self.options.$element);
                    $('.ds2-video-player--play', pVideoPlayer).trigger('click');
                }
                self._onSoundPlayClicked(self, event);
            });
        };

        ds2Sound.prototype._addSliderEvents = function() {
            var self = this;
            log('add slider events');
            self.element.find('.ds2-slider').on('afterChange', function(event, slick, currentSlide, nextSlide) {
                if (window.digitals2.main.mediaQueryWatcherCheck() === 'ds2ResizeSmall') {
                    self._deactiveSlideThumbnails();
                    self._hideAllVideos();
                    self._showCurrentSlide();
                }
            });
        };

        ds2Sound.prototype._addVideoEvents = function() {
            var self = this;

            $('.ds2-slider', self.options.$element).on('playVideoStart', function(event) {
                log('playVideoStart listener');
                $('.ds2-slider').each(function (i, elm) {
                    if($(elm)[0] !== $('.ds2-slider', self.options.$element)[0]) {
                        $(elm).trigger('stopAllVideos');
                    }
                });
            });
        };

        ds2Sound.prototype._addSwipeEvents = function() {
            var self = this;

            // swipe over video container on mobile (is position absolute so slider is not working anymore)
            self.element.find('.ds2-slider--sound-container').on('touchstart', function(event) {
                if (window.digitals2.main.mediaQueryWatcherCheck() === 'ds2ResizeSmall') {
                    var touchobj = event.originalEvent.changedTouches[0],
                        dist = 0,
                        startX = touchobj.pageX;
                }
            });

            self.element.find('.ds2-slider--sound-container').on('touchend', function(event) {
                if (window.digitals2.main.mediaQueryWatcherCheck() === 'ds2ResizeSmall') {
                    var touchobj = event.originalEvent.changedTouches[0],
                        dist = touchobj.pageX - startX;

                    if(dist > 20) {
                        $('.ds2-slider--main', self.options.$element).slick('slickPrev');
                    } else if (dist < -20) {
                        $('.ds2-slider--main', self.options.$element).slick('slickNext');
                    }
                }
            });
        };

        ds2Sound.prototype._deactiveSlideThumbnails = function() {
            $('.ds2-sound-player--play', this.options.$element).removeClass('active');
        };

        ds2Sound.prototype._hideAllDownloadButtons = function() {
            $('.ds2-video-player--download', this.options.$element).hide();
        };

        ds2Sound.prototype._hideAllVideos = function() {
            $('.ds2-slider--video-single', this.options.$element).hide();
        };

        ds2Sound.prototype._onSoundPlayClicked = function (self, event) {
            var trackObj = self._createTrackingObj();
            if (trackObj) {
                self.options.$element.trigger('tracking:video:open', trackObj);
            }

            var sliderElement = $('.ds2-slider--main', self.options.$element),
                activeSlickIndex = $(event.currentTarget).closest('.slick-slide').data('slick-index'),
                totalSliderCount = sliderElement.slick("getSlick").slideCount,
                slidesToShow = sliderElement.slick('slickGetOption', 'slidesToShow');

            $('.ds2-slider').trigger('stopAllVideos');
            // get active id and start show video
            var activeId = $(event.currentTarget).closest('.ds2-slider--video-player-opener').data('id');
            $('.ds2-slider--sound-container', self.options.$element).removeClass('active');
            self._deactiveSlideThumbnails();
            self._hideAllVideos();
            self._showCurrentSlide(activeId);
        };

        ds2Sound.prototype._checkPositionBar = function() {
            var self = this,
                sliderElement = $('.ds2-slider--main', self.options.$element),
                totalSliderCount = sliderElement.slick("getSlick").slideCount,
                slidesToShow = sliderElement.slick('slickGetOption', 'slidesToShow');

            if(totalSliderCount <= slidesToShow) {
                //hide blue bar
                $('.ds2-slider--position-bar-outer', self.options.$element).toggleClass('ds2-slider--position-bar-outer-disabled', true);
            } else {
                $('.ds2-slider--position-bar-outer', self.options.$element).toggleClass('ds2-slider--position-bar-outer-disabled', false);
            }
        };

        ds2Sound.prototype._showCurrentSlide = function(activeId) {
            var self = this,
                pId = activeId;

            if(typeof pId === 'undefined') {
                pId = $('.ds2-slider--sound .slick-current .ds2-slider--video-player-opener', self.options.$element).first().data('id');
            }

            self._checkPositionBar();

            self._hideAllDownloadButtons();
            self._videoOpen(pId);
            $('.ds2-slider--sound-container', self.options.$element).removeClass('active').addClass('active');
        };

        ds2Sound.prototype._videoOpen = function(pId) {
            var self = this;
            var pVideoPlayer = $('.ds2-slider--video-single[id="' + pId + '"]', self.options.$element);

            if (pVideoPlayer) {
                pVideoPlayer.show();
                //set current slide active for black overlay (active state)
                $('.ds2-slider--slide .ds2-slider--video-player-opener[data-id="' + pId + '"]', self.options.$element).find('.ds2-sound-player--play').addClass('active');
                $('.ds2-video-player--download[data-id="' + pId + '"]', self.options.$element).show();
            }
        };

        ds2Sound.prototype._setDownloadTriggerTrack = function() {
            var self = this;
            var download_icon = self.options.$element.find('.ds2-icon--download-white-big');

            download_icon.off('click').on('click', function(e) {

                var trackObj = {};
                var pId = $('.ds2-slider--sound .slick-current .ds2-slider--video-player-opener', self.options.$element).first().data('id');
                var pVideoPlayer = $('.ds2-slider--video-single[id="' + pId + '"]', self.options.$element);
                trackObj.eventName = $('.ds2-video-player--sceneseven', pVideoPlayer).data('video-name');
                trackObj.cause = $('.ds2-video-player--title', pVideoPlayer).text();
                trackObj.target = $('.ds2-video-player--sceneseven', pVideoPlayer).data('video-path');


                trackObj.timeStamp = Date.now();
                trackObj.eventAction = 'Download';

                trackObj.mmdr = '';
                var dataEvent = pVideoPlayer.data('tracking-event');
                if(dataEvent) {
                    trackObj.mmdr = dataEvent.category.mmdr ? dataEvent.category.mmdr : '';
                }
                self.options.$element.trigger('tracking:downloadimage', trackObj);

            });
        };

        ds2Sound.prototype._createTrackingObj = function() {
            var self = this;

            try {
                var trackObj = {};
                var pId = $('.ds2-slider--sound .slick-current .ds2-slider--video-player-opener', self.options.$element).first().data('id');
                var pVideoPlayer = $('.ds2-slider--video-single[id="' + pId + '"]', self.options.$element);
                trackObj.eventName = $('.ds2-video-player--sceneseven', pVideoPlayer).data('video-name');
                trackObj.cause = $('.ds2-video-player--title', pVideoPlayer).text();
                var playerObject = $('.ds2-video-player--sceneseven', pVideoPlayer);
                trackObj.target = playerObject.data('video-domain') + 'is/content/' + playerObject.data('video-asset-path');

                trackObj.mmdr = '';
                var dataEvent = pVideoPlayer.data('tracking-event');
                if(dataEvent) {
                    trackObj.mmdr = dataEvent.category.mmdr ? dataEvent.category.mmdr : '';
                }


                return trackObj;

            } catch (error) {
                log(error);
            }
        };

        return ds2Sound;
    }
);
