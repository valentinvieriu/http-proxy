/**
 * @author Patrick Rathke
 * @description Video Player Refactoring (WIP)
 */

define(
    'ds2-video-player',
    [
        'use!jquery',
        'ds2-image-lazyLoad',
        'ds2-cookie-controller'
    ],
    function ($, ds2imagelazyLoad) {
        'use strict';

        function ds2VideoPlayer(element) {
            this.$element = $(element);
            new ds2imagelazyLoad(this.$element);

            // options cache
            this.options = {
                canAutoplay: false,
                firstPlay: true,
                isAutoloop: this.$element.hasClass('ds2-video-player-auto-loop'),
                isAutoloopNotMobile: this.$element.hasClass('ds2-video-player-no-mobile'),
                lastAction: 'start',
                parentID: this.$element.parent().attr('id'),
                startAfterYouTubeIframeAPIReady: false,
                videoViewer: undefined
            };

            // elements cache
            this.$elements = {
                body: $('body'),
                closeButton: this.$element.find('.ds2-video-player--player-close-button'),
                opener: $('.ds2-video-player--opener', this.$element),
                player: $('.ds2-video-player--player', this.$element),
                playButton: $('.ds2-video-player--play', this.$element)
            };

            // context cache (some checks not needed at the moment but possible in the future)
            this.context = {
                //container: this.$element.parents('.ds2-video-container').length > 0,
                contentPresentation: this.$element.parents('.ds2-content-presentation--keyvisual-image-container').length > 0 && this.$element.parents('.ds2-layer--content').length === 0,
                contentPresentationAutoloop: this.$element.parents('.ds2-content-presentation-auto-loop').length > 0 && this.$element.parents('.ds2-layer--content').length === 0,
                gallery: this.$element.parents('.ds2-gallery').length > 0,
                //hotspot: this.$element.parents('.ds2-hotspot').length > 0,
                //hotspotExtended: this.$element.parents('.ds2-hse-layer--keyvisual').length > 0,
                layerLink: this.$element.parents('.ds2-layer--content').length > 0,
                sound: this.$element.parents('.ds2-slider--sound-container').length  > 0,
                stagePresentation: this.$element.parents('.ds2-stage-presentation--keyvisual-image-container').length > 0 && this.$element.parents('.ds2-layer--content').length === 0,
                stagePresentationAutoloop: this.$element.parents('.ds2-stage-presentation-auto-loop').length > 0 && this.$element.parents('.ds2-layer--content').length === 0,
                stageTeaser: this.$element.parents('.ds2-stage-teaser').length  > 0,
                topicSlider: this.$element.parents('.ds2-slider-toggle-content').length  > 0
            };

            // tracking cache
            this.trackingTimer = {
                timer: null,
                remaining: 0,
                pastMilestones: []
            };
            this.relativeTrackingTimer = {
                timer: null,
                remaining: 0,
                pastMilestones: []
            };

            this._create();
        }



        var proto = ds2VideoPlayer.prototype;

        proto._create = function () {
            var self = this;

            // add this player to global player array
            window.ds2.cl.ds2Videoplayer.push(this);

            // if video layer save the layer ID
            if (this.context.layerLink) {
                this.options.openedInLayerId = this.$element.parents('.ds2-layer').attr('id');
            }
            else {
                // if not video layer add eventlistener for cookie accepted by user
                $(window).on('ds2-consentChanged', function (event) {
                    if (cookiecontroller.api.isRegulationAccepted() && self.options.lastAction === 'fallbackOpen') {
                        self._privacyCheck();
                    }
                    if (cookiecontroller.api.isRegulationAccepted() && self.options.isAutoloop && self.$element.hasClass('ds2-video-player-auto-loop-fallback')) {
                        self._autoloop(self.options.canAutoplay);
                    }
                });
            }

            // change videosources depending on media query for some components
            if(this.context.stagePresentation || this.context.contentPresentation || this.context.topicSlider) {
                $(window.digitals2.main).on('ds2ResizeSmall ds2ResizeMedium ds2ResizeLarge', function (event) {
                    self._assetChangeOnResize();
                });
            }

            // @TODO check if stopAllVideos works and why it is done differently for sound component
            self.$element.closest('.ds2-component').on('stopAllVideos', function () {
                self._videoInlineClose();
                self.videoYoutubeClose();
            });

            // wait initialized cookiecontroller
            if (!cookiecontroller.api.isInitialized()) {
                cookiecontroller.api.registerOnInitialized(function () {
                    self._afterCookieControllerInitialized();
                });
            } else {
                self._afterCookieControllerInitialized();
            }

            // if stagePresentationAutoloop or contentPresentationAutoloop is loaded check for autoplay
            if((this.context.stagePresentationAutoloop || this.context.contentPresentationAutoloop) && !this.options.canAutoplay){
                $(window).on('ds2-stage-presentation-loaded ds2-content-presentation-loaded', function() {
                    self._checkAutoplay();
                });
            }
        };



        /**
         * Autoloop videos with Autoplay
         */

        proto._checkAutoplay = function() {
            //@TODO: move to seperate js or update modernizer to use that test

            var self = this,
                delay = 250,
                testVideo = document.createElement('video');

            //create mp4 and webm sources, 5s long
            var mp4 = document.createElement('source');
            mp4.src = "data:video/mp4;base64,AAAAFGZ0eXBNU05WAAACAE1TTlYAAAOUbW9vdgAAAGxtdmhkAAAAAM9ghv7PYIb+AAACWAAACu8AAQAAAQAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgAAAnh0cmFrAAAAXHRraGQAAAAHz2CG/s9ghv4AAAABAAAAAAAACu8AAAAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAABAAAAAAFAAAAA4AAAAAAHgbWRpYQAAACBtZGhkAAAAAM9ghv7PYIb+AAALuAAANq8AAAAAAAAAIWhkbHIAAAAAbWhscnZpZGVBVlMgAAAAAAABAB4AAAABl21pbmYAAAAUdm1oZAAAAAAAAAAAAAAAAAAAACRkaW5mAAAAHGRyZWYAAAAAAAAAAQAAAAx1cmwgAAAAAQAAAVdzdGJsAAAAp3N0c2QAAAAAAAAAAQAAAJdhdmMxAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAFAAOABIAAAASAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAGP//AAAAEmNvbHJuY2xjAAEAAQABAAAAL2F2Y0MBTUAz/+EAGGdNQDOadCk/LgIgAAADACAAAAMA0eMGVAEABGjuPIAAAAAYc3R0cwAAAAAAAAABAAAADgAAA+gAAAAUc3RzcwAAAAAAAAABAAAAAQAAABxzdHNjAAAAAAAAAAEAAAABAAAADgAAAAEAAABMc3RzegAAAAAAAAAAAAAADgAAAE8AAAAOAAAADQAAAA0AAAANAAAADQAAAA0AAAANAAAADQAAAA0AAAANAAAADQAAAA4AAAAOAAAAFHN0Y28AAAAAAAAAAQAAA7AAAAA0dXVpZFVTTVQh0k/Ou4hpXPrJx0AAAAAcTVREVAABABIAAAAKVcQAAAAAAAEAAAAAAAAAqHV1aWRVU01UIdJPzruIaVz6ycdAAAAAkE1URFQABAAMAAAAC1XEAAACHAAeAAAABBXHAAEAQQBWAFMAIABNAGUAZABpAGEAAAAqAAAAASoOAAEAZABlAHQAZQBjAHQAXwBhAHUAdABvAHAAbABhAHkAAAAyAAAAA1XEAAEAMgAwADAANQBtAGUALwAwADcALwAwADYAMAA2ACAAMwA6ADUAOgAwAAABA21kYXQAAAAYZ01AM5p0KT8uAiAAAAMAIAAAAwDR4wZUAAAABGjuPIAAAAAnZYiAIAAR//eBLT+oL1eA2Nlb/edvwWZflzEVLlhlXtJvSAEGRA3ZAAAACkGaAQCyJ/8AFBAAAAAJQZoCATP/AOmBAAAACUGaAwGz/wDpgAAAAAlBmgQCM/8A6YEAAAAJQZoFArP/AOmBAAAACUGaBgMz/wDpgQAAAAlBmgcDs/8A6YEAAAAJQZoIBDP/AOmAAAAACUGaCQSz/wDpgAAAAAlBmgoFM/8A6YEAAAAJQZoLBbP/AOmAAAAACkGaDAYyJ/8AFBAAAAAKQZoNBrIv/4cMeQ==";

            var webm = document.createElement('source');
            webm.src = "data:video/webm;base64,GkXfo49CgoR3ZWJtQoeBAUKFgQEYU4BnAQAAAAAAF60RTZt0vE27jFOrhBVJqWZTrIIQA027jFOrhBZUrmtTrIIQbE27jFOrhBFNm3RTrIIXmU27jFOrhBxTu2tTrIIWs+xPvwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFUmpZuQq17GDD0JATYCjbGliZWJtbCB2MC43LjcgKyBsaWJtYXRyb3NrYSB2MC44LjFXQY9BVlNNYXRyb3NrYUZpbGVEiYRFnEAARGGIBc2Lz1QNtgBzpJCy3XZ0KNuKNZS4+fDpFxzUFlSua9iu1teBAXPFhL4G+bmDgQG5gQGIgQFVqoEAnIEAbeeBASMxT4Q/gAAAVe6BAIaFVl9WUDiqgQEj44OEE95DVSK1nIN1bmTgkbCBULqBPJqBAFSwgVBUuoE87EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB9DtnVB4eeBAKC4obaBAAAAkAMAnQEqUAA8AABHCIWFiIWEiAICAAamYnoOC6cfJa8f5Zvda4D+/7YOf//nNefQYACgnKGWgQFNANEBAAEQEAAYABhYL/QACIhgAPuC/rOgnKGWgQKbANEBAAEQEAAYABhYL/QACIhgAPuC/rKgnKGWgQPoANEBAAEQEAAYABhYL/QACIhgAPuC/rOgnKGWgQU1ANEBAAEQEAAYABhYL/QACIhgAPuC/rOgnKGWgQaDANEBAAEQEAAYABhYL/QACIhgAPuC/rKgnKGWgQfQANEBAAEQEAAYABhYL/QACIhgAPuC/rOgnKGWgQkdANEBAAEQEBRgAGFgv9AAIiGAAPuC/rOgnKGWgQprANEBAAEQEAAYABhYL/QACIhgAPuC/rKgnKGWgQu4ANEBAAEQEAAYABhYL/QACIhgAPuC/rOgnKGWgQ0FANEBAAEQEAAYABhYL/QACIhgAPuC/rOgnKGWgQ5TANEBAAEQEAAYABhYL/QACIhgAPuC/rKgnKGWgQ+gANEBAAEQEAAYABhYL/QACIhgAPuC/rOgnKGWgRDtANEBAAEQEAAYABhYL/QACIhgAPuC/rOgnKGWgRI7ANEBAAEQEAAYABhYL/QACIhgAPuC/rIcU7trQOC7jLOBALeH94EB8YIUzLuNs4IBTbeH94EB8YIUzLuNs4ICm7eH94EB8YIUzLuNs4ID6LeH94EB8YIUzLuNs4IFNbeH94EB8YIUzLuNs4IGg7eH94EB8YIUzLuNs4IH0LeH94EB8YIUzLuNs4IJHbeH94EB8YIUzLuNs4IKa7eH94EB8YIUzLuNs4ILuLeH94EB8YIUzLuNs4INBbeH94EB8YIUzLuNs4IOU7eH94EB8YIUzLuNs4IPoLeH94EB8YIUzLuNs4IQ7beH94EB8YIUzLuNs4ISO7eH94EB8YIUzBFNm3SPTbuMU6uEH0O2dVOsghTM";


            testVideo.appendChild(webm);
            testVideo.appendChild(mp4);

            testVideo.id = 'testAutoplayVideo';
            testVideo.setAttribute('autoplay','autoplay');
            testVideo.setAttribute('muted','muted');
            testVideo.setAttribute('playsinline','true');
            testVideo.setAttribute('webkit-playsinline','true');
            testVideo.setAttribute('preload', 'none');
            // video needs to be "visible" for mobile devices in order to autoplay
            testVideo.style.position = 'fixed';
            testVideo.style.top = 0;
            testVideo.style.left = 0;
            testVideo.style.height = '1px';
            testVideo.style.width = '100%';

            document.body.appendChild(testVideo);

            //test after delay if video can be autoplayed
            setTimeout(function() {
                self.options.canAutoplay = !testVideo.paused;
                self._autoloop();
                document.body.removeChild(testVideo);
            }, delay);
        };

        proto._autoloop = function () {

            if(this.options.isAutoloopNotMobile && window.digitals2.main.mediaQuery === 'ds2ResizeSmall'){
                //@TODO possibly add check for mobile horizontal view which is actual tablet breakpoint
                this.options.canAutoplay = false;
            }

            if(this.options.canAutoplay === true && cookiecontroller.api.areBrowserCookiesEnabled() && cookiecontroller.api.isRegulationAccepted() === true) {
                this._videoInlineOpen();
                this.$element.removeClass('ds2-video-player-auto-loop-fallback');
            }
            else {
                this.$element.addClass('ds2-video-player-auto-loop-fallback');
            }
        };



        /**
         * Cookie Controller & Privacy
         */

        proto._privacyCheck = function () {
            var self = this;

            if (!cookiecontroller.api.isInitialized()) {
                cookiecontroller.api.registerOnInitialized(function () {
                    self._privacyCheck();
                });
            } else {
                if (cookiecontroller.api.areBrowserCookiesEnabled()) {
                    if (cookiecontroller.api.isRegulationAccepted() === true) {
                        if (!this.options.openedInLayerId || this.options.lastAction === 'videoLayerOpen' || this.options.lastAction === 'invokeFromLayer') {
                            this._videoInlineOpen();
                        } else {
                            this._videoLayerOpen();
                        }
                    } else {
                        this.options.lastAction = 'fallbackOpen';
                        if (this.options.openedInLayerId) {
                            window.digitals2.messages.showCookieDisclaimer($(this.options.openedInLayerId));
                        } else {
                            window.digitals2.messages.showCookieDisclaimer();
                        }
                    }
                } else {
                    window.digitals2.messages.showCookieBrowserDisabled();
                }
            }
        };

        proto._afterCookieControllerInitialized = function () {
            var self = this;

            var playVideo = function (target) {
                self.options.lastAction = 'videoLayerOpen';
                self._privacyCheck();
                // let the slider know the video starts playing, sound player stops all other videos playing in sound component
                $(target).closest('.ds2-slider').trigger('playVideoStart').trigger('autoPlayDisable');
            };

            // inside the sound player the play button is optional --> check for play button
            if (this.$elements.playButton.length > 0) {
                this.$elements.playButton.on('click', function () {
                    playVideo(this);
                });
            } else if (this.context.sound) {
                // play video in sound player
                $('.ds2-video-player--img-outer', this.$element).on('click', function () {
                    playVideo(this);
                });
            }
        };



        /**
         * Layer
         */

        proto.invokeFromLayer = function () {
            var self = this;

            this.options.lastAction = 'invokeFromLayer';
            this._privacyCheck();
            setTimeout(function() {
                self._videoPlayerResize();
            }, 250);
        };

        proto.setBackFromLayer = function () {
            this.options.lastAction = 'start';
        };

        proto._videoLayerOpen = function () {
            var self = this;
            setTimeout(function () {
                self.$elements.opener.toggleClass('hide', true);
                self.$elements.player.toggleClass('hide', false);
                $(self.options.openedInLayerId).foundation('reveal', 'open');

                $(document).on('close.fndtn.reveal', '[data-reveal]', function () {
                    self._videoInlineClose();
                    self.videoYoutubeClose();
                });
            }, 500);
        };



        /**
         * Player size calculation
         */

        proto._videoPlayerRatio = function () {
            var videoOpener = this.$elements.opener.find('img'),
                dataMobile,
                dataDesktop;

            // if video is in extra container search for opener img/ratios in slider
            if(this.context.gallery || this.context.stageTeaser){
                videoOpener = $('.ds2-slider--video-player-opener[data-id="' + this.options.parentID + '"]').find('img');
            }

            dataMobile = videoOpener.data('mobile-aspect-ratio');
            dataDesktop = videoOpener.data('desktop-aspect-ratio');

            this.options.ratioDesktop = dataDesktop ? dataDesktop : (videoOpener.width()/videoOpener.height());
            this.options.ratioMobile = dataMobile ? dataMobile : this.options.ratioDesktop;

            this.options.ratioDesktopMin = (this.context.stageTeaser || this.context.topicSlider || this.context.sound) ? 20/9 : 16/9;
            this.options.ratioMobileMin = ((this.context.stagePresentation && !this.context.stagePresentationAutoloop) || (this.context.contentPresentation && !this.context.contentPresentationAutoloop)) ? 3/4 : this.options.ratioDesktopMin;
        };

        proto._videoPlayerResize = function () {
            var videoPlayer = this.$elements.player,
                videoOpener = this.$elements.opener,
                videoOpenerImage = this.$elements.opener.find('img'),
                videoOpenerWidth,
                widthPercent,
                openerRatio = this.options.ratioDesktop,
                playerMinRatio = this.options.ratioDesktopMin;

            if (window.digitals2.main.mediaQuery === 'ds2ResizeSmall') {
                openerRatio = this.options.ratioMobile;
                playerMinRatio = this.options.ratioMobileMin;
            }

            this.$elements.opener.toggleClass('hide', false);
            videoOpenerWidth = (videoOpenerImage.length > 0) ? videoOpenerImage.width() : videoOpener.width();
            widthPercent = (videoOpenerWidth / window.innerWidth) * 100;
            this.$elements.opener.toggleClass('hide', true);

            // final
            if (openerRatio < playerMinRatio) {
                videoPlayer.css({'height': widthPercent / openerRatio + 'vw'});
            }
            else {
                videoPlayer.css({'height': widthPercent / playerMinRatio + 'vw'});
            }
        };

        proto._videoPlayerFullscreenPosition = function () {
            var isFullscreen = this.videoViewer.container.isFullScreen(),
                fullscreenPlayer = $(".s7innercontainer[mode='fullscreen']", this.$element),
                scrollTop = $(window).scrollTop(),
                offset = this.$element.offset().top;

            // toggle css class on body for overflow and z-index fixes
            this.$elements.body.toggleClass('ds2-video-player--isFullscreen', isFullscreen);

            // correct s7 top position if in 'fake fullscreen mode' (full browser window) including iPad
            if (isFullscreen === true
                && fullscreenPlayer
                && this._isIos() ){
                fullscreenPlayer.css({top: (scrollTop - offset)});
            }

            // resize player after fullscreen left by user
            if (isFullscreen === false){
                this._videoPlayerResize();
            }
        };



        /**
         * generic for scene7 & youtube
         */

        proto.videoInitComplete = function () {
            var self = this,
                video = this.$element.find('video'),
                source = video.find('source');

            self._checkDuration(); //??

            self.videoViewer.container.addEventListener(s7sdk.event.AssetEvent.ASSET_CHANGED, function (event) {
                self.currentAssetPath = event.s7event.asset.name;
            }, true);

            this.videoViewer.container.addEventListener(s7sdk.event.StatusEvent.NOTF_VIEW_READY, function (pEvent) {
                self.$elements.opener.toggleClass('hide', true);
                $(window).trigger('ds2-video-player-open');
            }, true);

            this.videoViewer.container.addEventListener(s7sdk.event.ResizeEvent.FULLSCREEN_RESIZE, function (pEvent) {
                var pId = $(this).closest('.ds2-slider--video-single').attr('id');
                if (self.videoViewer.container.isFullScreen()) {
                    self._videoFullScreenModeTrigger(true, pId);
                } else {
                    $('.s7container', self.$element).attr('mode', 'normal');
                    self._videoFullScreenModeTrigger(false, pId);
                }
                self._videoPlayerFullscreenPosition();
            });

            // temp fix for BMWDGTLTP-2255 // video can't be played on ios 10
            if(this._isIosVersion() === 10){
                var oldsrc = source.attr('src'),
                    newsrc = oldsrc.replace('-AVS.m3u8', '').replace('.m3u8', '');

                if(newsrc !== oldsrc){
                    source.attr('src', newsrc);
                }
            }

            // additional attributes & styles for scene7 video
            video.attr('playsinline','true').attr('webkit-playsinline','true').css({'width':'100%','height':'100%','top':'0','left':'0'});

            // mute autolooping / autoplaying video
            if(this.options.isAutoloop && this.options.canAutoplay){
                video.attr('muted','muted').attr('autoplay','autoplay').attr('preload','none');
                video[0].volume = 0;
                video[0].muted = true;
                video[0].autpoplay = true;
                video[0].load();
                video[0].play();
            }

            // start video if not autoplay
            if(!self.options.canAutoplay && !self.options.isAutoloop){
                self.videoViewer.videoplayer.play();
            }
        };

        proto._videoInlineOpen = function () {
            var self = this,
                videoContainer = this.$element.parents('.ds2-slider--video-container').first(),
                element = $('.ds2-video-player--sceneseven', this.$element);

            // save player min ratio and opener ratio to options
            self._videoPlayerRatio();
            self._videoPlayerResize();
            $(window.digitals2.main).on('ds2ResizeSmall ds2ResizeMedium ds2ResizeLarge', self, Foundation.utils.throttle(function (e) {
                self._videoPlayerResize();
                self._videoPlayerFullscreenPosition();
            }, 250));

            if (element.length !== 0) {
                if (element.attr('id').indexOf('youtube') > -1) {
                    this._videoplayerStartYoutubeApi(element);
                } else {
                    this._videoplayerStartSDKVersion(element);
                }
                if (self.options.openedInLayerId) {
                    $(document).on('close.fndtn.reveal', '[data-reveal]', function () {
                        self._videoInlineClose();
                        self.videoYoutubeClose();
                    });
                }
            }

            this.$elements.opener.toggleClass('hide', true);
            this.$elements.player.toggleClass('hide', false);

            this.$element.closest('.ds2-slider--video-container').show();
            this.$element.closest('.ds2-slider--video-single').show();

            // @TODO check stageteaser
            if (this.context.stageTeaser && videoContainer && videoContainer.find('button').length === 0) {
                this.$element.parents('.ds2-stage-teaser').first().find('.ds2-slider--main button')
                    .clone(true, true)
                    .appendTo(videoContainer);

                videoContainer.hover(function () {
                    $('.slick-prev, .slick-next', this).css('opacity', 1);
                }, function () {
                    $('.slick-prev, .slick-next', this).css('opacity', 0);
                });
            }

            this._closeButtonEnable();
        };

        proto._videoInlineClose = function () {
            this.firstPlay = true;
            if (this.videoViewer && this.videoViewer.videoplayer) {
                this.videoViewer.videoplayer.stop();
            }
            this.$elements.player.toggleClass('hide', true);
            this.$elements.opener.toggleClass('hide', false);

            this._closeButtonDisable();
        };

        proto._checkDuration = function () {
            requestAnimFrame(function () {
            });
        };



        /**
         * scene7
         */

        proto._videoplayerStartSDKVersion = function (element) {
            var self = this,
                $sceneseven = element,
                id = $sceneseven.attr('id'),
                domain = $sceneseven.data('video-domain'),
                path = $sceneseven.data('video-path'),
                caption = $sceneseven.data('subtitle-url'),
                assetPath = self._getResponsiveUrl(),
                preset = $sceneseven.data('video-preset');

            if (self.videoViewer && self.videoViewer.videoplayer) {
                if(!self.options.canAutoplay){
                    self.videoViewer.videoplayer.play();
                }
                self._closeButtonEnable();
            }
            else {
                $sceneseven.css({'opacity': '0'});
                if (window.s7viewers !== undefined && path !== undefined) {

                    var defaultParams = {
                        'autoplay': '0',
                        'playback': 'auto',//native,auto
                        'asset': assetPath,
                        'serverurl': domain + 'is/image/',
                        'contenturl': domain + 'skins/',
                        'config': 'Scene7SharedAssets/Universal_HTML5_Video',
                        'videoserverurl': domain + 'is/content/'
                    };

                    if (this.options.isAutoloop && this.options.canAutoplay) {
                        defaultParams.autoplay = '1';
                        defaultParams.loop = '1';
                        defaultParams.iconeffect = '0';
                        defaultParams.singleclick = 'none';
                        defaultParams.doubleclick = 'none';
                    }

                    if (caption && caption.length > 0) {
                        defaultParams['caption'] = caption;
                    }

                    self.videoViewer = new s7viewers.VideoViewer({
                        'containerId': id,
                        'params': defaultParams,
                        'handlers': {
                            'initComplete': function () {
                                self.currentAssetPath = assetPath;
                                self.videoInitComplete();
                                $sceneseven.css({'opacity': ''});

                                if(self.videoViewer.isCaption)
                                {
                                    self.videoViewer.closedCaptionButton.setSelected(true);
                                    self.videoViewer.videoplayer.setCaptionEnabled(true);
                                }
                            },
                            'onFullScreenEnter': function (e) {
                                self.videoInitComplete();
                                $sceneseven.css({'opacity': ''});
                            },
                            'trackEvent': function (objID, compClass, instName, timeStamp, eventInfo) {
                                log('trackEvent --> eventInfo: ', eventInfo);

                                //var eventInfoValue = eventInfo.split(',')[0];

                                if (eventInfo.split(',')[0] === 'PLAY' && self.firstPlay === true) {

                                    var id, effect;

                                    id = $(self.$element).closest('.ds2-slider--video-single').attr('id');
                                    if (id) {
                                        effect = $("div[data-id='" + id + "']").closest('.ds2-slider--slide.slick-active').find('.ds2-stage-slider--keyvisual-cta-location').find('h1').text();
                                    }

                                    self.trackStart(
                                        self,
                                        effect,
                                        self.$element.find('video').find('source').attr('src'),
                                        self.videoViewer.videoTime.component.duration / 1000,
                                        $sceneseven.data('video-name')
                                    );

                                } else if (eventInfo.split(',')[0] === 'MILESTONE' &&
                                    eventInfo.split(',')[1] === '100' && self.context.stageTeaser) {
                                    self._videoInlineClose();
                                }
                            }
                        },
                        'localizedTexts': {
                            'en': {
                                'VideoPlayer.ERROR': 'Your Browser does not support HTML5 Video tag or the video cannot be played.'
                            },
                            'fr': {
                                'VideoPlayer.ERROR': 'Votre navigateur ne prend pas en charge la vidéo HTML5 tag ou la vidéo ne peuvent pas être lus.'
                            },
                            defaultLocale: 'en'
                        }
                    }).init();
                }
            }
        };



        /**
         * youtube
         */

        proto._videoplayerStartYoutubeApi = function (element) {
            var self = this;

            this.startAfterYouTubeIframeAPIReady = true;
            if (window.digitals2.youTubeIframeAPIReady === true) {
                this.videoplayerStartYoutubeVideo();
            }
            else {
                var tag = document.createElement('script');
                tag.src = "https://www.youtube.com/iframe_api";
                var firstScriptTag = document.getElementsByTagName('script')[0];
                firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

                $(window).on('youTubeIframeAPIReady', function() {
                    self.videoplayerStartYoutubeVideo();
                });
            }
        };

        proto.videoplayerStartYoutubeVideo = function () {
            if (this.startAfterYouTubeIframeAPIReady === false || !$('iframe.ds2-video-player--sceneseven', this.$element)) {
                return;
            }
            if ($('iframe.ds2-video-player--sceneseven', this.$element) && this.playerYoutube) {
                this.playerYoutube.playVideo();
                return;
            }

            //ds2-video-player--opener image hides when video is ready
            this.$elements.opener.toggleClass('hide', true);

            var self = this;
            var $embedContainer = $('.ds2-video-player--sceneseven', this.$element).find('.ds2-youtube-embed-container');
            var id = $embedContainer.attr('id');
            var videoPath = $('.ds2-video-player--sceneseven', this.$element).attr('video-path');

            this.playerYoutube = new YT.Player(id, {
                videoId: videoPath,
                width: '100%',
                height: '100%',
                playerVars: {
                    'modestbranding': 0,
                    'controls': 1,
                    'autohide': 1,
                    'rel': 0,
                    'showinfo': 0,
                    'playsinline': 1,
                    'iv_load_policy': 3,
                    'fs': 1
                },
                events: {
                    'onReady': function (event) {
                        event.target.playVideo();
                    },
                    'onStateChange': function (event) {
                        self.onPlayerStateChange(event, self);
                    }
                }
            });
        };

        proto.onPlayerStateChange = function (event, scope) {
            function getCurrentTime() {
                return Math.round(scope.playerYoutube.getCurrentTime());
            }

            function getCurrentPercent() {
                return Math.round(scope.playerYoutube.getCurrentTime() / scope.playerYoutube.getDuration() * 100);
            }

            function getDuration() {
                return Math.round(scope.playerYoutube.getDuration());
            }

            /**
             * test if we have reached a milestone and call tracking event
             */
            function intervalCallback() {
                var currentTime = getCurrentTime();

                // track absolute progress
                if (currentTime === 10) scope.trackProgress('abs', currentTime, scope);
                if ((currentTime % 30) === 0) scope.trackProgress('abs', currentTime, scope);
            }

            function relativeIntervalCallback() {
                var currentPercent = getCurrentPercent();

                // track relative progress
                if (currentPercent === 10) scope.trackProgress('rel', currentPercent, scope);
                if (currentPercent === 25) scope.trackProgress('rel', currentPercent, scope);
                if (currentPercent === 50) scope.trackProgress('rel', currentPercent, scope);
                if (currentPercent === 75) scope.trackProgress('rel', currentPercent, scope);
                if (currentPercent === 95) scope.trackProgress('rel', currentPercent, scope);
            }

            /**
             * receive YouTube player state
             */
            switch (event.data) {
                case YT.PlayerState.PLAYING:
                    (function () {
                        var interval = 100;
                        // video started
                        if (getCurrentTime() === 0) {
                            if (scope.firstPlay === true &&
                                (scope.lastAction === 'videoLayerOpen' || scope.lastAction === 'invokeFromLayer')) {
                                scope.trackStart(
                                    scope,
                                    '',
                                    scope.playerYoutube.getVideoUrl(),
                                    getDuration(),
                                    scope.$element.data('tracking-options').name
                                );
                            }
                            scope.trackProgress('abs', 0, scope);
                            scope.trackProgress('rel', 0, scope);
                            scope.trackingTimer.timer = setInterval(intervalCallback, interval);
                            scope.relativeTrackingTimer.timer = setInterval(relativeIntervalCallback, interval);
                        } else {
                            // video resumed
                            intervalCallback();
                            relativeIntervalCallback();
                            scope.trackingTimer.timer = setInterval(intervalCallback, interval);
                            scope.relativeTrackingTimer.timer = setInterval(relativeIntervalCallback, interval);
                        }
                    })();
                    break;

                case YT.PlayerState.PAUSED:
                case YT.PlayerState.BUFFERING:
                    clearInterval(scope.trackingTimer.timer);
                    clearInterval(scope.relativeTrackingTimer.timer);
                    break;

                case YT.PlayerState.ENDED:
                    clearInterval(scope.trackingTimer.timer);
                    clearInterval(scope.relativeTrackingTimer.timer);

                    scope.videoYoutubeClose();
                    $(scope).closest('.ds2-slider').trigger('videoOverlayClose');
                    break;
            }
        };

        proto.videoYoutubeClose = function () {
            this._videoInlineClose();
            if (this.playerYoutube) {
                var $video = $('.ds2-video-player--sceneseven', this.$element);
                var id = $video.find('.ds2-youtube-embed-container').attr('id');

                if (this.playerYoutube.length) {
                    this.playerYoutube.stopVideo(-1);
                    this.playerYoutube.seekTo(0);
                }

                clearInterval(this.trackingTimer.timer);
                clearInterval(this.relativeTrackingTimer.timer);

                $video.find('.ds2-youtube-embed-container').remove();
                $video.html('<div id="' + id + '" class="ds2-youtube-embed-container"></div>');

                this.playerYoutube = undefined;
            }
        };



        /**
         * buttons & interaction elements
         */

        proto._closeButtonEnable = function () {
            var self = this;

            if (this.context.stageTeaser || this.context.stagePresentation || this.context.contentPresentation || this.context.topicSlider.length) {
                $('.ds2-video-player--player-close-button', this.$element)
                    .toggleClass('ds2-is-visible', true)
                    .off('click')
                    .on('click', function () {
                        self._videoInlineClose();
                        self.videoYoutubeClose();
                        $(self.$element).closest('.ds2-slider').trigger('videoOverlayClose');
                    });
            }
        };

        proto._closeButtonDisable = function () {
            $('.ds2-video-player--player-close-button', this.$element)
                .toggleClass('ds2-is-visible', false)
                .off('click');
        };

        proto._videoFullScreenModeTrigger = function (pValue, pId) {
            this.$element.closest('.ds2-slider').trigger('fullscreenModeInPlayerIsActive', [pValue, pId]);
        };



        /**
         * change videosource for portrait videos on mobile
         */

        proto._getResponsiveUrl = function () {
            var self = this,
                mediaQuery = window.digitals2.main.mediaQueryWatcherCheck(),
                desktopInfos = $('.ds2-video-player--sceneseven', this.$element),
                mobileInfos = $('.ds2-video-player--mobile', this.$element);

            //@TODO what about youtube? (editor can set up two youtube links)

            if (desktopInfos.attr('id').indexOf('youtube') > -1) {
                return;
            } else if (mobileInfos.length === 0) {
                return desktopInfos.data('video-asset-path');
            }

            if (mediaQuery === 'ds2ResizeSmall') {
                return mobileInfos.data('video-asset-path');
            } else {
                return desktopInfos.data('video-asset-path');
            }

        };

        proto._assetChangeOnResize = function () {
            var self = this;
            var assetPath = self._getResponsiveUrl();

            //@TODO what about youtube? (editor can set up two youtube links)

            if (typeof self.videoViewer !== 'undefined') {
                if (assetPath !== self.currentAssetPath) {
                    if(!this.context.stagePresentationAutoloop && !this.context.contentPresentationAutoloop){
                        self._videoInlineClose();
                    }
                    self.videoViewer.setAsset(assetPath);
                }
            }
        };



        /**
         * tracking
         */

        proto.getEvent = function () {
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
        };

        proto.trackProgress = function (mode, milestone, scope) {
            if (mode === 'abs') {
                if (scope.trackingTimer.pastMilestones.indexOf(milestone) === -1) {
                    scope.trackingTimer.pastMilestones.push(milestone);
                    this.$element.trigger('ds2-video-player-track-absolute-progress', {
                        milestone: milestone,
                        duration: Math.round(scope.playerYoutube.getDuration()),
                        target: scope.playerYoutube.getVideoUrl()
                    });
                }
            }
            else if (mode === 'rel') {
                if (scope.relativeTrackingTimer.pastMilestones.indexOf(milestone) === -1) {
                    scope.relativeTrackingTimer.pastMilestones.push(milestone);
                    this.$element.trigger('ds2-video-player-track-relative-progress', {
                        milestone: milestone + '%',
                        duration: Math.round(scope.playerYoutube.getDuration()),
                        target: scope.playerYoutube.getVideoUrl()
                    });
                }
            }
        };

        proto.trackStart = function (scope, effect, target, videoLength, eventName) {
            var pEvent = scope.getEvent();
            pEvent.eventInfo.effect = effect;
            pEvent.eventInfo.eventAction = 'Start video';
            pEvent.eventInfo.target = target;
            pEvent.eventInfo.cause = 'automatic';
            pEvent.category.primaryCategory = 'Engagement';
            pEvent.attributes.videoLength = videoLength;
            pEvent.eventInfo.eventName = eventName;
            if (scope.$element.closest('.ds2-layer-video').length) {
                scope.$element.trigger('ds2-video-player-play-layer', pEvent);
            } else {
                scope.$element.trigger('ds2-video-player-play', pEvent);
            }
            scope.firstPlay = false;
        };



        /**
         * helper
         */

        proto._isIos = function () {
            return (/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream)
        };

        proto._isIosVersion = function () {
            var version = 0;
            if(this._isIos()){
                var ua = navigator.userAgent,
                    uaIndex = ua.indexOf( 'OS ');
                if (uaIndex > -1 ) {
                    version =  parseInt(ua.substr( uaIndex + 3, 2 ));
                }
            }

            return version;
        };



        //varibale to store initalized video players
        window.ds2 = window.ds2 || {};
        window.ds2.cl = window.ds2.cl || {};
        window.ds2.cl.ds2Videoplayer = window.ds2.cl.ds2Videoplayer || [];

        return ds2VideoPlayer;
    }
);

/**
 * This function needs to be registered globaly. youtube api
 */
function onYouTubeIframeAPIReady() {
    window.digitals2.youTubeIframeAPIReady = true;
    $(window).trigger('youTubeIframeAPIReady');
}
