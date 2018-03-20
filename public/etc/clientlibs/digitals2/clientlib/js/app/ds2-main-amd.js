window.digitals2 = window.digitals2 || {};
window.digitals2.main = window.digitals2.main || {};
window.digitals2.main.cqIsInEditMode = false;
if (window.CQ && window.CQ.WCM && window.CQ.WCM.isEditMode() && !window.CQ.WCM.isPreviewMode()) {
    window.digitals2.main.cqIsInEditMode = true;
}

// Object assign polyfill
if( typeof Object.assign != 'function' ) {
    Object.assign = _.assign.bind( _ );
}

//
define( 'ds2-main',
    [
        'use!jquery',
        'ds2-video-player',
        'use!log',
        'use!foundation-utils',
        'ds2-cookie-controller',
        'use!velocity'
    ],
    function( $ , ds2Videoplayer ) {

        function ds2Main (){
            this.$window = $(window);
            this.initTrigger();

        }

        var proto = ds2Main.prototype;

        proto.initTrigger = function () {

            this.init();
            this.customizeFoundation();
            this.$window.trigger('initializeComponents');
            this.correctAnchorScrolling();
            this.delayLinkAction();
            this.positionFooter();

        };

        proto.init = function () {
            var cqIsInEditMode = false;
            var loginOpendFromExternal;
            var loginOpendFromExternalThroughSaveButton;
            var registrationSuccessful;
            var loginSuccessful;

            var self = this;
            // responsive breakpoints
            $breakpointSmall = 520;
            $breakpointMedium = 980;
            $breakpointLarge = 1280;

            this.direction = document.documentElement.dir;
            this.isRTL = (this.direction === "rtl");
            this.isLTR = !this.isRTL;
            this.scrollToAnkers = true;


            $.fn.hasAttr = function (name) {
                return this.attr(name) !== undefined;
            };


            // Register custom media query
            Foundation.utils.register_media('small-navi', 'small-navi');
            Foundation.utils.register_media('medium-navi', 'medium-navi');
            Foundation.utils.register_media('large-navi', 'large-navi');

            Foundation.utils.register_media('small-integration', 'small-integration');
            Foundation.utils.register_media('medium-integration', 'medium-integration');
            Foundation.utils.register_media('large-integration', 'large-integration');

            this.mediaQuery = this.mediaQueryWatcherSet();
            this.mediaQueryNavi = this.mediaQueryNaviWatcherSet();
            this.mediaQueryIntegration = this.mediaQueryIntegrationWatcherSet();

            this.mediaQueryWatcherHandler(this.mediaQuery);
            this.mediaQueryWatcherHandler(this.mediaQueryNavi);
            this.mediaQueryWatcherHandler(this.mediaQueryIntegration);

            this.mediaQueryWatcher();
            this.checkCQMode();

            this.policyConformationIsRequired;

            this.externalCommunicationInit();
            $(window).on("message onmessage", function (event) {
                var messageEvent = event.originalEvent; // get MessageEvent from jQuery event
                var origin = messageEvent.origin; // origin domain from sending window
                var data = messageEvent.data; // expected as JSON string
                var object = null;

                try {
                    object = JSON.parse(data);
                } catch (e) {
                }

                if (null != object && origin.indexOf('.bmw.') >= 0 && ('changeIdModule' === object.type) && object.imgSrc) {
                    $('.ds2-navigation-main--id-module img').attr('src', object.imgSrc);
                }
            });

            this.checkFrame();

        };
        /*
         *
         * check if cq is in editmode, needed for BMWST-2991
         */
        proto.checkCQMode= function () {
            if (window.CQ && window.CQ.WCM && window.CQ.WCM.isEditMode() && !window.CQ.WCM.isPreviewMode()) {
                this.cqIsInEditMode = true;
            }
        };

        proto.delayLinkAction = function() {
            $('a').each(function() {
                var linkHash = this.hash;
                if (linkHash && linkHash.length > 0) {
                    var functionalHash = linkHash.indexOf("/");

                    if (functionalHash > 0) {
                        return;
                    }

                    var $this = $(this);
                    $this.on('click', function(e) {
                        e.preventDefault();
                        //links with hash need to be delayed
                        setTimeout(function() {
                            if($this.attr('target') === '_blank'){
                                window.open($this.attr('href'), '_blank');
                            } else {
                                window.location.href = $this.attr('href');
                            }
                        }, 100);
                    });
                }
            });
        };

        /**
         *  BWMST-3503 Scrolling for Anchors
         *  If an anchor hash is in the url when the page loads
         *  Correct the position after anchor-scroll-event
         */
        proto.correctAnchorScrolling= function () {
            var self = this,
                contentBarHeight = 0,
                userScrolled = false,
                hashPos = window.location.href.indexOf("#"),
                isIntegrationUrl = window.location.href.indexOf("/", hashPos),
                target = window.location.hash.split("#").pop();

            //Prevent none anchor urls from executing the scrolling
            if (isIntegrationUrl > 0) {
                return;
            }
            //Correct anchor scrolling
            else if (window.location.hash) {

                $(window).on('mousewheel DOMMouseScroll MozMousePixelScroll', function () {
                    userScrolled = true;
                });


                window.digitals2 = window.digitals2 || {};
                window.digitals2.main = window.digitals2.main || {};
                window.digitals2.main.scrollToAnkers = window.digitals2.main.scrollToAnkers || {};

                if (userScrolled || !window.digitals2.main.scrollToAnkers) {
                    return;
                }

                if ($('.ds2-navigation-content-bar--button').length) {
                    contentBarHeight = contentBarHeight - ($('.ds2-navigation-content-bar--button').height() / 2);
                }

                try {
                    var $target = $('#' + target);
                    var _this = this;
                    //give few ms for lazyloaded components
                    setTimeout(function() {
                        $target.velocity("scroll", {
                            duration: 500,
                            offset: contentBarHeight,
                            easing: "ease-in-out",
                            complete: function() {
                                //give few ms for lazyloaded components
                                setTimeout(function() {
                                    //check if lazyloaded components don't modify top offset
                                    if (!_this.isInViewPort($target)) {
                                            $target.velocity("scroll", {
                                            duration: 500,
                                            offset: contentBarHeight,
                                            easing: "ease-in-out"
                                        });
                                    }
                                }, 10);
                            }
                        });
                    }, 10);
                }
                catch (err) {
                  //no handling of errors needed, this is just to prevent the error
                }
            }
        };

        proto.isInViewPort = function($element) {
            var $window = $(window);
            var top = $element.offset().top;
            var bottom = $element.offset().top + $element.outerHeight();
            var viewPortBottom = $window.scrollTop() + $window.height();
            var viewPortTop = $window.scrollTop();

            return (viewPortBottom > top) && (viewPortTop < bottom);
        };


        proto._equalheight= function (parent, container) {
            /* Due custom breakpoints the foundation equalizer is buggy here.
             So we need a custom function … */

            var self = this,
                options = this.options,
                currentTallest = 0,
                currentRowStart = 0,
                rowDivs = [],
                $el,
                topPosition = 0,
                $parent = parent ? $(parent) : $('body'),
                $container = container ? $($(container), $parent) : $('[data-newequalizer]', $parent),
                $items;

            if (!self.isMobile) {
                $container.each(function () {
                    $items = $('[data-newequalizer-watch]', $(this));
                    $items.each(function () {

                        $el = $(this);
                        $el.height('');
                        topPostion = $el.offset().top;

                        if (currentRowStart != topPostion) {
                            for (currentDiv = 0; currentDiv < rowDivs.length; currentDiv++) {
                                rowDivs[currentDiv].height(currentTallest);
                            }

                            rowDivs.length = 0; // empty the array
                            currentRowStart = topPostion;
                            currentTallest = $el.height();
                            rowDivs.push($el);

                        } else {
                            rowDivs.push($el);
                            currentTallest = (currentTallest < $el.height()) ? ($el.height()) : (currentTallest);
                        }
                        for (currentDiv = 0; currentDiv < rowDivs.length; currentDiv++) {
                            rowDivs[currentDiv].height(currentTallest);
                        }
                    });
                });
            } else {
                $('[data-newequalizer-watch]').height('');
            }
        };

        /**
         * returns a number which can be used to apply correct spacing
         * between elements based on our $base-margin SCSS variable
         * @param  {object} $element [jQuery selector]
         * @param  {number} spacing  [desired $base-margin factor]
         * @return {number}          [calculated number to be used as distance]
         */
        proto.fontSpacing= function ($element, spacing) {
            // TODO: BMWST-754 get (correct?) distance and base margin (15) out of css
            var fontSize = parseInt($element.css('font-size'), 10),
                lineHeight = parseInt($element.css('line-height'), 10),
                distance = 0.3; // 0.2 in css

            return Math.round(15 * spacing - (lineHeight - (fontSize - fontSize * distance)) * 0.5);
        };

        proto.customizeFoundation= function () {
            Foundation.global.namespace = '';
            $(document).foundation({
                reveal: {
                    animation: 'fade',
                    animation_speed: 250,
                    close_on_background_click: true,
                    close_on_esc: false,
                    multiple_opened: true,
                    root_element: '#ds2-reveal-container'
                }
            });
            this.revealInit();
        };

        proto.revealInit= function () {
            var self = this;
            //TODO: check if gcdm-c-userAccount and not gcdm-accessToken
            //TODO: do this inside nn.gcdm.js
            // if(sessionStorage.getItem('gcdm-accessToken') === null && sessionStorage.getItem('gcdm-c-userAccount') !== null) {
            //   this.openLayer('#gcdmPolicy');
            // }
            //
            $(document).on('opened', '[data-reveal]', function (e) {
                var $form = $(this).find('form');
                if ($(e.currentTarget).attr('id') && $(this).attr('id')) {
                    var pVideoPlayer = $(this).find('.ds2-video-player'),
                        playerArray = window.ds2.cl.ds2Videoplayer;
                    if (pVideoPlayer.length > 0) {
                         // invoke video from initialized player array
                         for (var i = 0;  i <  playerArray.length; ++i) {
                             if(playerArray[i].options.openedInLayerId === $(this).attr('id')){
                                 playerArray[i].invokeFromLayer();
                                 return;
                             }
                         }
                    }
                }

                //GCDM down case
                if (
                    $form &&
                    typeof angular !== 'undefined' &&
                    angular.element($form).scope() &&
                    angular.element($form).scope().gcdmShowSystemNotAvailableMessageState
                ) {

                    $('#gcdmError').find('.ds2-dialog-button--show-for-layer').removeClass('hide');
                    $('#gcdmError').find('.ds2-dialog-button--show-for-page').addClass('hide');
                    self.openLayer('#gcdmError');
                }

            });
            $(document).on('close', '[data-reveal]', function (e) {
                if ($(e.currentTarget).attr('id') && $(this).attr('id')) {
                    self.scrolllockDeactivate();
                }
            });
            $(document).on('closed', '[data-reveal]', function (e) {

                if ($(e.currentTarget).attr('id') && $(this).attr('id')) {
                    if ($(this).attr('id') == 'gcdmLogin') {
                        self.loginIsClosing();
                    }
                    $(document).trigger('ds2-navigationCloseFlyout');
                }
                //BMWST-5332 if regulation is not accepted in layer, set back videoplayer status
                if ($(e.currentTarget).attr('id') && $(this).attr('id')) {
                    if ($(this).attr('id') === 'ds2-messages-js--cookie-disclaimer' && !cookiecontroller.api.isRegulationAccepted()) {

                        $('.ds2-video-player').each(function (index) {
                            new ds2Videoplayer(this).setBackFromLayer();
                        });
                    }
                }
            });

            $(document).on('opened', '[data-reveal]', function (e) {
                if ($(e.currentTarget).attr('id') && $(this).attr('id')) {
                    self.scrolllockActivate();
                }
            });
        };

        proto.layerInit= function () {
            //invoken from ds2-navigation-main.js after build mobile and tablet navigation
            var self = this;
            var id;

            $('.ds2-login-js--layer-opener').on('click', function () {
                id = $(this).data('layerId');
                self.loginOpendFromExternal = $(this).data('layerNoRedirect');
                self.openLayer(id);
            });
        };

        proto.externalCommunicationInit= function () {
            var self = this;
            if (window.ds2configurator) {
                ds2configurator.$.subscribe('h5vco.account.openLogin', function () {
                    self.loginOpenFromExternal();
                });
                ds2configurator.$.subscribe('h5vco.account.openLoginThroughSaveButton', function () {
                    self.loginOpenThroughSaveButtonFromExternal();
                });
            }
            $(document).on('ds2-reactionAfterLogin', function () {
                self.reactionAfterLogin();
            });
            $(document).on('ds2-policyConformationRequired', function () {
                self.policyConformationRequired();
            });
            $(document).on('ds2-reactionAfterRegistration', function () {
                self.reactionAfterRegistration();
            });
            $(document).on('ds2-reactionAfterReregistration', function () {
                self.closeLayer('#gcdmReregistration');
            });
            $(document).on('ds2-reactionAfterPolicy', function () {
                self.reactionAfterPolicy();
            });
            $(document).on('ds2-dlo-error', function () {
                self.openLayer('#ds2-messages-js--dlo-error');
            });
            $('#ds2-messages-js--dlo-error .close').on('click', function () {
                $('#ds2-messages-js--dlo-error').foundation('reveal', 'close');
            });
            $(document).on('ds2-gcdmDownError-invokedFromPage', function () {
                $('#gcdmError').find('.ds2-dialog-button--show-for-layer').addClass('hide');
                $('#gcdmError').find('.ds2-dialog-button--show-for-page').removeClass('hide');
                self.openLayer('#gcdmError');
            });
            $(document).on('ds2-gcdmDownError-invokedFromLayer', function () {
                $('#gcdmError').find('.ds2-dialog-button--show-for-layer').removeClass('hide');
                $('#gcdmError').find('.ds2-dialog-button--show-for-page').addClass('hide');
                self.openLayer('#gcdmError');
            });

        };

        proto.reactionAfterLogin= function () {
            var targetUrl;

            if ($('#login_form')) {

                this.loginSuccessful = true;
//            if(!this.loginOpendFromExternal) {
//                targetUrl = $('#login_form').data('redirectGarage');
//                this.redirectToTargetPage(targetUrl);
//            }
                this.closeLayer('#gcdmLogin');
            }
        };

        proto.reactionAfterRegistration= function () {
            var self = this;
            this.registrationSuccessful = true;

            if (this.loginOpendFromExternalThroughSaveButton) {
                $('.ds2-registration--button-save', '#gcdmRegistration').on('click', function () {
                    self.registrationCloseViaSave();
                });
                $('.ds2-registration--button-save', '#gcdmRegistration').removeClass('hide');
                $('.ds2-registration--button-end', '#gcdmRegistration').addClass('hide');
            } else {
                $('.ds2-registration--button-save', '#gcdmRegistration').addClass('hide');
                $('.ds2-registration--button-end', '#gcdmRegistration').removeClass('hide');
            }
        };

        proto.reactionAfterPolicy= function () {
            this.openLayer('#gcdmReregistration');
        };
        proto.policyConformationRequired= function () {
            var self = this;
            this.policyConformationIsRequired = true;
            this.closeLayer('#gcdmLogin');
        };

        proto.loginOpenFromExternal= function () {
            this.loginOpendFromExternal = true;
            this.openLayer('#gcdmLogin');
        };

        proto.loginOpenThroughSaveButtonFromExternal= function () {
            this.loginOpendFromExternal = true;
            this.loginOpendFromExternalThroughSaveButton = true;
            this.openLayer('#gcdmLogin');
        };

        proto.loginIsClosing= function () {
            if (window.ds2configurator && this.loginOpendFromExternal) {

                this.loginOpendFromExternal = false;

                if (!this.loginSuccessful) {
                    ds2configurator.$.publish('h5vco.account.cancelLogin');
                }

            }
        };

        proto.registrationCloseViaSave= function () {
            if (window.ds2configurator && this.loginOpendFromExternalThroughSaveButton) {

                this.loginOpendFromExternalThroughSaveButton = false;

                if (this.registrationSuccessful) {
                    ds2configurator.$.publish('h5vco.account.closeRegisterThroughSaveButton');
                    this.closeLayer('#gcdmRegistration');
                }

            }
        };

        proto.redirectToTargetPage= function (url) {

            var self = this;
            var url = url;
            if (this.policyConformationIsRequired === true) {
                return;
            }
            setTimeout(function () {
                if (self.policyConformationIsRequired === true) {
                    return;
                }
                window.location = url;
            }, 500);
        };

        proto.closeLayer= function (id) {
            $(id).foundation('reveal', 'close');
        };

        proto.openLayer= function (id) {
            var urlExternalAngularLib = $('#ds2-reveal-container').data('angularapi-url');
            var urlExternalGcdmLib = $('#ds2-reveal-container').data('gcdmformapi-url');
            var urlExternalFormsLib = $('#ds2-reveal-container').data('formsapi-url');
            var scripts = [];

            if(urlExternalAngularLib && urlExternalGcdmLib){
                scripts.push(
                    {
                        url: urlExternalAngularLib,
                        isLoaded: function(){return $.isPlainObject(window.angular);}
                    });
                scripts.push(
                    {
                        url: urlExternalGcdmLib,
                        isLoaded: function(){return $.isPlainObject(window.gcdm);}
                    });
                scripts.push(
                    {
                        url: urlExternalFormsLib,
                        isLoaded: function(){return !!$('head > script[src="'+ urlExternalFormsLib + '"]').length;}
                    });
                
                this.lazyLoadScriptMulti(scripts)
                    .then(function(message){
                        $(id).foundation('reveal', 'open');
                        log(window.angular);
                        log(window.gcdm);
                    })
                    .fail(function(err){
                        log(err);
                    });
            }
            else {
                $(id).foundation('reveal', 'open');
            }
        };

      /**
       * Lazy Load Multiple Script Files In Parallel, Maintaining Execution Order As If They Loaded In Series (For Better Performance)
       * @memberof mini.digital.util
       * @param {Array} scripts Array of 'script' objects {url: "url to script", isLoaded : function(){//should return true when script is considered as loaded}}
       * @returns {Promise}
       */
        proto.lazyLoadScriptMulti = function(scripts) {
            var deferred = $.Deferred(),
            timeout = 10000,
            script,
            scriptTag,
            scriptsToLoad = [],
            scriptsToLoadIndex = 0,
            scriptsToLoadLength = 0,
            pendingScripts = [],
            lastScript = document.scripts[document.scripts.length - 1],
            supportsScriptAsync = 'async' in lastScript,
            loadCount = 0;

            /**
             * Get a list of scripts to be loaded that haven't already been loaded.
             * @private
             * @memberOf mini.digital.util.lazyLoadScriptMulti
             * @param {Array} scripts Array of all the scripts that have been requested to be loaded
             * @returns {Array} Array of all the scripts that have been requested to be loaded that haven't already been loaded
             */
            function getScriptsToLoad(scripts) {
                var scriptsToLoad = [],
                    script,
                    scriptsIndex = 0,
                    scriptsLength = scripts.length;

                for (; scriptsIndex < scriptsLength; scriptsIndex++) {
                    script = scripts[scriptsIndex];

                    if (!$.isFunction(script.isLoaded) || !script.isLoaded()) {
                      scriptsToLoad.push(script);
                    }
                }

                return scriptsToLoad;
            }

            /**
             * Increment the load counter - when all the scripts have loaded, resolve the master promise.
             * @private
             * @memberOf mini.digital.util.lazyLoadScriptMulti
             */
            function incrementLoadCount() {
                loadCount++;
                if (loadCount === scriptsToLoadLength && scriptsToLoadLength !== 0) {
                    window.initGcdm();
                    deferred.resolve();
                }
            }

            /**
             * Handle script load state in old IE only.
             * @private
             * @memberOf mini.digital.util.lazyLoadScriptMulti
             */
            function readyStateChange() {
                var pendingScript;
                while (pendingScripts[0] && pendingScripts[0].readyState === 'loaded') {
                    pendingScript = pendingScripts.shift();
                    pendingScript.onreadystatechange = null;
                    // using appendChild() fails in some cases in old IE, so use insertBefore() instead
                    lastScript.parentNode.insertBefore(pendingScript, lastScript);
                    incrementLoadCount();
                }
            }

            scriptsToLoad = getScriptsToLoad(scripts);
            scriptsToLoadLength = scriptsToLoad.length;

            if (scriptsToLoad.length) {
                for (; scriptsToLoadIndex < scriptsToLoadLength; scriptsToLoadIndex++) {
                    script = scriptsToLoad[scriptsToLoadIndex];
                    scriptTag = document.createElement('script');
                    if (supportsScriptAsync) {
                        scriptTag.async = false;
                        scriptTag.onload = incrementLoadCount;
                        scriptTag.src = script.url;
                        document.head.appendChild(scriptTag);
                    } else if (lastScript.readyState) {
                        pendingScripts.push(scriptTag);
                        scriptTag.onreadystatechange = readyStateChange;
                        scriptTag.src = script.url;
                    } else {
                        scriptTag.defer = 'defer';
                        scriptTag.onload = incrementLoadCount;
                        scriptTag.src = script.url;
                        document.body.appendChild(scriptTag);
                    }
                }

                window.setTimeout(function() {
                    deferred.reject();
                }, timeout);
            } else {
                deferred.resolve();
            }
            return deferred.promise();
        };

        proto.isIOS = function() {
            return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
        };

        proto.scrolllockActivate= function () {
            if (window.ds2configurator) {
                window.ds2configurator.$.publish('h5vco.openModalLayer');
            }
            $('body').addClass('ds2-scrolllock');
            //fix for scroll on iOS devices
            if (this.isIOS()) {
               $('html').css({
                    'height': '100%',
                    'overflow': 'hidden'
                });
            }
        };

        proto.scrolllockDeactivate= function () {
            if (window.ds2configurator) {
                window.ds2configurator.$.publish('h5vco.closeModalLayer', this.scrollpositionBeforeOpeningLayer || 0);
            }
            $('body').removeClass('ds2-scrolllock');

            //fix for scroll on iOS devices
            if (this.isIOS()) {
                $('html').css({
                    'height': '',
                    'overflow': ''
                });
            }
        };

        proto.mediaQueryWatcherSet= function () {
            var query = 'ds2ResizeLarge';

            if (matchMedia(Foundation.media_queries['large']).matches) {
                query = 'ds2ResizeLarge';
            } else if (matchMedia(Foundation.media_queries['medium']).matches) {
                query = 'ds2ResizeMedium';
            } else if (matchMedia(Foundation.media_queries['small']).matches) {
                query = 'ds2ResizeSmall';
            }
            this.mediaQuery = query;
            return query;
        };

        proto.mediaQueryWatcherCheck= function () {
            return this.mediaQuery;
        };

        proto.mediaQueryNaviWatcherSet= function () {
            var query = 'ds2ResizeLargeNavi';

            if (matchMedia(Foundation.media_queries['large-navi']).matches) {
                query = 'ds2ResizeLargeNavi';
            } else if (matchMedia(Foundation.media_queries['medium-navi']).matches) {
                query = 'ds2ResizeMediumNavi';
            } else if (matchMedia(Foundation.media_queries['small-navi']).matches) {
                query = 'ds2ResizeSmallNavi';
            }

            this.mediaQueryNavi = query;
            return query;
        };

        proto.mediaQueryNaviWatcherCheck= function () {
            return this.mediaQueryNavi;
        };

        //Media Queries for HTML5 Configurator
        proto.mediaQueryIntegrationWatcherSet= function () {
            var query = 'ds2ResizeLargeIntegration';

            if (matchMedia(Foundation.media_queries['large-integration']).matches) {
                query = 'ds2ResizeLargeIntegration';
            } else if (matchMedia(Foundation.media_queries['medium-integration']).matches) {
                query = 'ds2ResizeMediumIntegration';
            } else if (matchMedia(Foundation.media_queries['small-integration']).matches) {
                query = 'ds2ResizeSmallIntegration';
            }

            this.mediaQueryIntegration = query;
            return query;
        };

        proto.mediaQueryIntegrationWatcherCheck= function () {
            return this.mediaQueryIntegration;
        };

        proto.mediaQueryWatcher= function () {
            var self = this;

            this.$window.on('resize', Foundation.utils.throttle(function (e) {

                var query = self.mediaQueryWatcherSet();
                var queryNavi = self.mediaQueryNaviWatcherSet();
                var queryIntegration = self.mediaQueryIntegrationWatcherCheck();

                self.mediaQueryWatcherHandler(query);
                self.mediaQueryWatcherHandler(queryNavi);
                self.mediaQueryWatcherHandler(queryIntegration);
            }, 500));
        };

        proto.mediaQueryWatcherHandler= function (pQuery) {
            $(this).trigger(pQuery);
        };

        proto.componentsUpdate= function () { //update/reinit components e.g. after ajax calls
            window.digitals2.main.$window.trigger('initializeComponents'); //BMWST-4441
            $(document).foundation('interchange', 'reflow'); //BMWST-4440
        };

        proto.checkFrame= function () {
            if (window.self !== window.top) {
                $(window.self.document.body).addClass("ds2-iframe--body");
            }
        };

        proto.positionFooter= function () {
            var func = function () {
                var navHeight = $('.ds2-navigation-main').height();
                var footerHeight = $('footer').height() + parseInt($('footer').css('padding-top'));
                var contentHeight = $('main').height();
                var windowHeight = $(window).height();
                if (navHeight + contentHeight < windowHeight) {
                    var minHeight = windowHeight - navHeight - footerHeight;
                    $('main').css('min-height', minHeight);
                }
            };

            func();
            $(window).resize(func);
        };

        window.digitals2.main = undefined;
        window.digitals2.main = new ds2Main();

        return ds2Main;
    });

requirejs(['ds2-main'], function (ds2Main) {

});
