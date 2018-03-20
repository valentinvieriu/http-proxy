/**
 * partial: navigation-main
 * author: nadine
 *
 */

define( 'ds2-navigation-main', [
    'use!jquery',
    'ds2-main',
    'use!velocity'
], function( $ ) {
    
    var ds2navigationMain = function(element){
        var self = this;
        self.options = {
            asOverlay: false,
            flyoutClass: 'ds2-navigation-main--flyout-container',
            flyoutContentClass: '.ds2-navigation-main--flyout .ds2-navigation-main--content',
            flyoutMainContentClass: '.ds2-navigation-main--flyout',
            flyoutContentHeight: 0,
            level1Class: 'ds2-navigation-main--level-1',
            level2Class: 'ds2-navigation-main--level-2',
            level3Class: 'ds2-navigation-main--level-3',
            menuClass: 'ds2-navigation-main--menu',
            navigationClass: 'ds2-navigation-main--container',
            fastlaneClass: 'ds2-navigation-main--fastlane',
            specialClass: 'ds2-navigation-main--special',
            navigationTopBar: '.ds2-navigation-main--top-bar',
            navigationTopBarOpen: 'ds2-navigation-main--top-bar-open',
            hasCloseButton: false,
            closeBtnContent: 'ds2-navigation-element--flyout-close',
            closeBtn: 'ds2-icon--close-white',
            openLoginLayer : "ds2-login-js"
        };
        self.element = element;
        self.$element = $(element);
        self.init();
    }
    var Proto = ds2navigationMain.prototype;
    Proto.init = function() {
        var self     = this,
            options  = this.options,
            $element = this.element;
        self.isMobile = false;
        self.isTablet = false;
        self._setDeviceValues();
      
        self._setIdModuleOnConfiguratorPage();
        // on resize
        $(window.digitals2.main).on('ds2ResizeSmall ds2ResizeMedium ds2ResizeLarge ds2ResizeLargeNavi ds2ResizeMediumNavi ds2ResizeSmallNavi ds2ResizeSmallIntegration ds2ResizeMediumIntegration ds2ResizeLargeIntegration', self, self._onResize);
        self._createFlyout();
        //$('> li a', $(options.level1Class)).bind('click', self, self._onLevel1Click);
        //$('.ds2-navigation-main--menu a', $element).bind('click', self, self._onMenuClick);
        //BMWST-2727 Additional close button for H5VCO and fullscreen flyout
        //$('ul:not(.' + options.specialClass + ') li a', $element).on('click', self, self._onFullscreenFlyout);
        $('.ds2-cookie-disclaimer-js--submit, .ds2-cookie-disclaimer-js--deny').on('click', function(e) {
            e.preventDefault();
            self._closeFlyout();
        });
        $(document).on('ds2-navigationCloseFlyout' , function() {
            self._closeFlyout();
        });
        $('.' + options.closeBtn).on('click', function(e) {
            e.preventDefault();
            self._closeFlyout();
        });
        $('ul:not(.' + options.specialClass + ') li a:not(.button)', $element).on('click', self, self._onClick);
        $('.' + options.navigationClass, $element).on('navigation:menu:close', self, self._onSalesbarClick);
        if ($('div').hasClass(options.closeBtnContent)) {
            options.hasCloseButton = true;
        }
        //BMWST-2866 Hide footer on mobile/tablet when keyboard is open for DLO and HVCO5
        var focusBound = false;
        $(window).on('resize', Foundation.utils.throttle(function(e) {
            var ds2mainFooter = $('.ds2-main-footer');
            if ( $('html').hasClass('touch') && ds2mainFooter.css('position') == 'fixed') {
                var input = $('input');
                input.on('focus' , function(event) {
                    ds2mainFooter.fadeOut();
                });
                input.on('blur' , function(event) {
                    ds2mainFooter.fadeIn();
                });
                if (!focusBound) {
                    if (document.activeElement.tagName.toLowerCase() == 'input') {
                        ds2mainFooter.fadeOut();
                        focusBound = true;
                    }
                }
            }
        }, 250));
        window.digitals2.main.layerInit();
    };
    Proto._createIScroll = function(mousewheel) {
        var self = this,
            options = this.options,
            $element = this.element;
        $('.ds2-navigation-main', $element).addClass('ds2-iscroll-container');
        $('.ds2-navigation-main--flyout-container', $element).addClass('ds2-iscroll-content');
        self.iscroll = new IScroll('.ds2-navigation-main--flyout-container', {
            mouseWheel: mousewheel,
            scrollbars: true,
            click: true,
            tap: true,
            bounce: false,
            momentum: true,
            probeType: 1,
            interactiveScrollbars: true
        });
        if (mousewheel) {
            self._addIScrollEvents();
        }
    };
    Proto._addIScrollEvents = function() {
        var self = this,
            options = this.options,
            $element = this.element;
        self.iscroll
            .on('scrollEnd', function() {
                self._onScrollEnd();
            });
        self.iscroll
            .on('scrollStart', function() {
                self._onScrollStart();
            });
    };
    Proto._animateModulId = function() {
        var self = this,
            options = this.options,
            $element = this.element;
        $('.ds2-navigation-main--id-module-slider', $element).slick({
            dots: false,
            infinite: true,
            speed: 1000,
            fade: true,
            cssEase: 'linear',
            autoplay: true,
            arrows: false,
            centerPadding: 0
        });
    };
    Proto._setDeviceValues = function() {
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
        switch (window.digitals2.main.mediaQueryNaviWatcherCheck()) {
            case 'ds2ResizeMediumNavi':
                self.isTablet = true;
                break;
        }
    };
    Proto._addBackLink = function($elm, dataId, levelClass) {
        var self = this,
            options = this.options,
            $element = this.element;
        // remove backlinks with same levelClass
        $('.ds2-navigation-main--backlist li', $(options.flyoutContentClass))
            .each(function(i, elm) {
                if ($(elm).attr('data-level-class') === levelClass) {
                    $(elm).remove();
                }
            });
        var $clone = $elm.parent().clone();
        
        $('span', $clone).remove();
        $('.ds2-layer.ds2-nsc.reveal-modal', $clone).remove();

        $('> a', $clone)
            .removeClass('ds2-active ds2-icon--arrow-big-r-white')
            .addClass('ds2-icon ds2-icon--arrow-big-l-white ds-icon--left');
        
        $('.ds2-navigation-main--backlist', $(options.flyoutContentClass))
            .append(
                '<li data-link-main-id="' + dataId + '" data-level-class="' + levelClass + '" class="ds2-navigation-main--item">' +
                $clone.html() + '</li>');
        $('.ds2-navigation-main--backlist a', $(options.flyoutContentClass)).unbind().bind('click', self, self._onBacklinkClick);
    };
    Proto._removeBackLink = function($elm) {
        var self = this,
            options = this.options,
            $element = this.element,
            dataId = $elm.parent().attr('data-link-main-id');
        $('.ds2-navigation-main--backlist li', $(options.flyoutContentClass))
            .each(function(i, elm) {
                if ($(elm).attr('data-link-main-id') === dataId) {
                    $(elm).remove();
                }
            });
    };
    Proto._removeAllBackLinks = function() {
        var options = this.options;
        $('.ds2-navigation-main--backlist li', $(options.flyoutContentClass)).remove();
    };
    Proto._resetLevel1Links = function(resetMenuButton) {
        var self = this,
            options = self.options,
            $element = self.element;
        $('.' + options.level1Class + ' a', $element).removeClass('ds2-active');
        if (resetMenuButton) {
            $('.ds2-navigation-main--menu a', $element).removeClass('ds2-active');
        }
    };
    Proto._removeBorder = function() {
        $('.ds2-navigation-main--level-3').removeClass('ds2-border-left');
        $('.ds2-navigation-main--level-2').removeClass('ds2-border-right');
    };
    Proto._addBorder = function() {
        var self = this,
            options = self.options,
            level2Height = $('.' + options.level2Class + '.ds2-open').height(),
            level3Height = $('.' + options.level3Class + '.ds2-open').height();
        if ($('.' + options.level3Class).hasClass('ds2-open')) {
            if (level2Height >= level3Height && level3Height != 0) {
                $('.' + options.level2Class).addClass('ds2-border-right');
            } else if (level2Height < level3Height && level3Height != 0) {
                $('.' + options.level3Class).addClass('ds2-border-left');
            } else if (level3Height == 0) {
                self._removeBorder();
            }
        }
    };
    Proto._onScrollStart = function() {
        var self = this,
            options = this.options,
            $element = this.element;
    };
    Proto._onScrollEnd = function() {
        var self = this,
            options = this.options,
            $element = this.element;
        if (self.iscroll.y <= self.iscroll.maxScrollY) {
        }
    };
    /*********************************************************
     *                  EVENT LISTENER                       *
     * *******************************************************/
    Proto._onClick = function(event) {
        var self = event.data,
            $clickedElement = $(event.currentTarget),
            isActivePage;
        isActivePage = $clickedElement.hasClass('ds2-active-page');

        $(window).trigger('ds2-manual-click:ds2-navigation-main', [$clickedElement, event]);
        // HINT: REMOVED because: BMWST-2982
        // if(isActivePage){
        //   event.preventDefault();
        // }
        var ds2NavigationSalesbarContainer = $('.ds2-navigation-salesbar--container'),
            ds2NavigationMainFlyout        = $('.ds2-navigation-main--flyout');
        
        if ($('.ds2-navigation-content-bar').height()) {
            ds2NavigationSalesbarContainer.removeClass('ds2-padding-bottom');
            ds2NavigationMainFlyout.removeClass('ds2-padding-bottom');
        } else {
            ds2NavigationMainFlyout.addClass('ds2-padding-bottom');
            ds2NavigationSalesbarContainer.addClass('ds2-padding-bottom');
        }
        var clickedHref = $clickedElement.attr('href');
        if ( clickedHref && clickedHref.length <= 1) {
            self._removeBorder(); //Has to be infront of preventDefault
            event.preventDefault();
            var options = self.options,
                $element = self.element,
                // main id of clicked element --> used to link to lists inside flyout
                dataId = $clickedElement.parent().attr('data-main-id'),
                // for creating back button get active open element (if not available it is the level 1 to return to)
                dataIdOpenContent,
                // container level the element is inside
                containerClass = $clickedElement.closest('ul').attr('class').replace('ds2-open', '').replace('ds2-active', '').replace('ds2-navigation-main--list', '').replace(' ', '').replace(' ', ''),
                // class inside flyout which the subnav belongs to
                openContainerClass,
                // value if the layout should open
                // --> false (do nothing)
                // --> 'open'
                // --> 'close'
                openFlyout = false;
            if (self.isTablet || self.isMobile || containerClass === options.level1Class) {
                // Add old class to link to previous level (which is the new "headline" for the menu).
                $('.' + options.level1Class + ' a.ds2-active', $element).addClass('ds2-old');
            } else {
                $('.' + containerClass + ' a.ds2-active', $element).removeClass('ds2-active');
            }
            if (dataId == 'ds2-level1-1' || containerClass == options.fastlaneClass) {
                $('.' + options.navigationClass + ' a', $element).removeClass('ds2-active').removeClass('ds2-old');
                $(options.flyoutContentClass + ' a.ds2-active', $element).removeClass('ds2-active');
                $('.' + options.level1Class + ' li a').removeClass('ds2-underline');
            }
            /*
             * set active link
             * If the clicked menu item is already open, close the flyout.
             * Otherwise open the flyout.
             */
            if ($clickedElement.hasClass('ds2-active')) {
                $clickedElement.removeClass('ds2-active');
                if (containerClass === options.menuClass || (containerClass === options.level1Class && (!self.isTablet && !self.isMobile))) {
                    $('.' + options.menuClass + ' a').removeClass('ds2-active');
                    openFlyout = 'close';
                }
            } else {
                if(!$clickedElement.hasClass('ds2-login-js--layer-opener')) {
                    $clickedElement.addClass('ds2-active');
                }
                $('.' + options.menuClass + ' a').removeClass('ds2-active').addClass('ds2-active');
                if (containerClass === options.menuClass || (containerClass === options.level1Class && (!self.isTablet && !self.isMobile))) {
                    openFlyout = 'open';
                }
            }
            if (openFlyout && openFlyout === 'close') {
                // If flyout should close, remove active class from menu icon (shown on medium down only) and from currently active link inside the flyout.
                $('.' + options.navigationClass + ' a', $element).removeClass('ds2-active').removeClass('ds2-old');
                $(options.flyoutContentClass + ' a.ds2-active', $element).removeClass('ds2-active');
                self._closeFlyout();
            } else {
                // Flyout should open, check which level is going to be opened.
                switch (containerClass) {
                    case options.menuClass:
                        openContainerClass = options.level1Class;
                        break;
                    case options.level1Class:
                        openContainerClass = options.level2Class;
                        break;
                    case options.level2Class:
                        openContainerClass = options.level3Class;
                        break;
                    case options.level3Class:
                        $('.' + options.level1Class + ' li a').removeClass('ds2-underline');
                        $('.' + options.level1Class + ' li .ds2-active').addClass('ds2-underline');
                        $('.' + options.fastlaneClass + ' li a', $element).removeClass('ds2-active');
                        self._closeFlyout();
                        break;
                }
                // reset all a inside flyout
                if (openContainerClass != options.level2Class) {
                    $(options.flyoutContentClass + ' .' + openContainerClass + ' a.ds2-active', $element).removeClass('ds2-active');
                    $(options.flyoutContentClass + ' .' + openContainerClass, $element).removeClass('ds2-open');
                }
                var elUl = $(options.flyoutContentClass + ' ul', $element);
                // if level 1
                if (containerClass === options.level1Class) {
                    $('.' + options.navigationClass + ' .' + options.level1Class + ' a.ds2-old', $element).removeClass('ds2-active ds2-old');
                    if (openContainerClass != options.level2Class) {
                        elUl.removeClass('ds2-open');
                    }
                    // if desktop
                    if (!self.isTablet && !self.isMobile) {
                        // reset open contents, remove backlinks, reset level 1 links
                        self._removeAllBackLinks();
                    } else {
                        // level 1 inside flyout was clicked --> set level 1 active outside
                        $('.' + options.level1Class + ' li', $element)
                            .each(function(i, elm) {
                                if ($(elm).attr('data-main-id') === dataId) {
                                    $('> a', $(elm)).addClass('ds2-active');
                                }
                            });
                    }
                } else {
                    // level 1 inside flyout was clicked --> set level 1 active outside
                    $('.' + options.navigationClass + ' .' + options.level2Class + ' a.ds2-old', $element).removeClass('ds2-active ds2-old');
                }
                // WTF?!
                var attrDMI = $('.' + options.menuClass + ' li', $element).attr('data-main-id');
                dataIdOpenContent = $(options.flyoutContentClass + ' ul.ds2-active.ds2-open', $element).attr('data-link-main-id') || attrDMI;
                //check if first open value is id given by dataIdOpenContent --> this is not the case on desktop -> second level two has-sublevel items
                var checkdataIdOpenContent = $(options.flyoutContentClass + ' ul.ds2-open.ds2-active', $element).attr('data-link-main-id') || attrDMI;
                if (checkdataIdOpenContent !== dataIdOpenContent) {
                    dataIdOpenContent = checkdataIdOpenContent;
                } // WTF END
                // if menu button was clicked
                if (containerClass === options.menuClass) {
                    // reset all ul's and active links
                    if (openFlyout !== 'close') {
                        self._removeAllBackLinks();
                    }
                    self._resetLevel1Links();
                    elUl.removeClass('ds2-open');
                } else {
                    // add Backlink Button
                    if ($clickedElement.attr('data-back-disable') !== 'disabled') {
                        self._addBackLink($clickedElement, dataIdOpenContent, containerClass);
                    }
                }
                if ($('.' + options.flyoutClass).hasClass('ds2-flyout-open') && !self.isTablet && !self.isMobile) {
                    var elLi = $('.' + openContainerClass + ' li');
                    elLi.css({
                        opacity: 1
                    });
                    elLi
                        .velocity('stop')
                        .velocity(
                            { opacity: 0 },
                            {
                                duration: 300,
                                complete: function() {
                                    elLi.css({
                                    opacity: ''
                                });
                                // reset active container
                                elUl.removeClass('ds2-active');
                                // show level
                                self._showFlyoutLevel(dataId, openContainerClass);
                            }
                        });
                } else {
                    // reset active container
                    elUl.removeClass('ds2-active');
                    // show level
                    self._showFlyoutLevel(dataId, openContainerClass);
                }
                if (openFlyout && openFlyout === 'open') {
                    var salesBarOpen = $('.ds2-navigation-salesbar').hasClass('ds2-active'),
                        delay = 0;
                    if (salesBarOpen) {
                        log('navi says: salesbar is open...');
                        delay = 300;
                    } else {
                        log('navi says: salesbar is closed...');
                    }
                    self._openFlyout(delay);
                }
            } // if close flyout else
        } // if href not a link
    };
    Proto._onSalesbarClick = function(event) {
        var self = event.data,
            options = self.options,
            $flyout = $('.' + options.flyoutClass, $element),
            animationTime = 300,
            $element = self.element,
            newHeight = $('.ds2-navigation-salesbar').outerHeight();
        if ( $flyout.hasClass('ds2-flyout-open')) {
            $('.' + options.navigationClass + ' a', $element).removeClass('ds2-active').removeClass('ds2-old');
            $(options.flyoutContentClass + ' a.ds2-active', $element).removeClass('ds2-active');
            $flyout.css({
                overflow: 'hidden'
            });
            if ($flyout.hasClass('ds2-flyout-open')) {
                var elemNavMainCOntent = $('.ds2-navigation-main--content ul li');
                elemNavMainCOntent.css({
                    opacity: 1
                });
                elemNavMainCOntent
                    .velocity('stop')
                    .velocity(
                        { opacity: 0 },
                        {
                            duration: 300,
                            complete: function() {
                                elemNavMainCOntent.css({
                                    opacity: ''
                                });
                            }
                        });
                $flyout
                    .velocity('stop')
                    .velocity(
                        { height: newHeight },
                        animationTime,
                        function() {
                            $flyout.css({
                                height: '',
                                display: 'none'
                            });
                        })
                    .removeClass('ds2-flyout-open');
                self._setNaviHeight();
            }
        }
    };
    Proto._onBacklinkClick = function(event) {
        event.preventDefault();
        var self = event.data,
            options = self.options,
            $element = self.element,
            $clickedElm = $(event.currentTarget),
            dataId = $clickedElm.parent().attr('data-link-main-id'),
            levelClass = $clickedElm.parent().attr('data-level-class');
        self._removeBackLink($clickedElm);
        $(options.flyoutContentClass + ' ul', $element).removeClass('ds2-active ds2-open');
        $(options.flyoutContentClass + ' ul.' + levelClass + ' a', $element).removeClass('ds2-active');
        if (levelClass === options.level1Class) {
            self._resetLevel1Links();
        }
        self._showFlyoutLevel(dataId, levelClass);
    };
    Proto._onResize = function(event) {
        var self = event.data,
            options = self.options,
            $element = self.element;
        self._setDeviceValues();
        self._setFlyoutMargin();
        self._setNaviHeight();
        if ($('.' + options.flyoutClass).hasClass('ds2-flyout-open') ||
            $('.ds2-searchform').outerHeight(true) > 0) {
            self._openHeaderHeight();
        } else {
            self._closeHeaderHeight();
        }
        if (options.hasCloseButton) {
            self._checkFlyoutFullscreen();
        }
        // check if level 1 should be visible or not --> on desktop we get a white space therefor close flayout if only level 1 is visible
        var tempHasClass = $('.' + options.navigationClass + ' .' + options.menuClass + ' a', $element).hasClass('ds2-active'),
            tempLength = $('.' + options.navigationClass + ' .' + options.level1Class + ' a.ds2-active', $element).length,
            tempFlyoutClass = $('.' + options.flyoutClass, $element);
        
        var isActive = tempHasClass && (tempLength <= 0);
        if (self.isMobile || self.isTablet) {
            isActive = tempHasClass || (tempLength > 0);
        }
        if (!self.isMobile && !self.isTablet) {
            if (isActive) {
                tempFlyoutClass
                    .removeClass('ds2-flyout-open')
                    .css({
                        display: ''
                    });
            }
        } else {
            if (isActive) {
                tempFlyoutClass
                    .removeClass('ds2-flyout-open')
                    .addClass('ds2-flyout-open');
            } else {
                tempFlyoutClass
                    .removeClass('ds2-flyout-open');
            }
        }
    };
    /*********************************************************
     *                 EVENT LISTENER END                    *
     * *******************************************************/
    /*
     * Show Flyout
     *
     * @param {Object} dataId_ id which has been clicked (can be Level 1 or 2)
     * @param {Object} levelClass class of leven that should be opened (click on level 1 opens level 2)
     * @param {Object} marginLeft_ set the margin if click on level 1 and desktop
     */
    
    Proto._showFlyoutLevel = function(dataId_, levelClass) {
        log('show flyout: ' + dataId_);
        var self = this,
            options = this.options,
            $element = this.element;
        //reset --> hide all ul's with active class + child ul's
        $(options.flyoutContentClass + ' ul:not(.ds2-active)', $element).removeClass('ds2-active');
        $(options.flyoutContentClass + ' ul:not(.ds2-open)', $element)
            .removeClass('ds2-open')
            .css({
                marginLeft: ''
            });
        if (levelClass == options.level2Class) {
            $(options.flyoutContentClass + ' .' + options.level1Class + ' a.ds2-active', $element).removeClass('ds2-active');
            $(options.flyoutContentClass + ' .' + options.level1Class, $element).removeClass('ds2-open');
            $(options.flyoutContentClass + ' ul', $element).removeClass('ds2-open');
            $('.ds2-navigation-main--content ul li a').removeClass('ds2-active');
        }
        $(options.flyoutContentClass + ' ul.' + levelClass, $element)
            .each(function(i, elm) {
                var elm =  $(elm);
                if ( elm.attr('data-link-main-id') === dataId_) {
                    elm.addClass('ds2-active ds2-open');
                }
            });
        if ($('.' + options.flyoutClass, $element).hasClass('ds2-flyout-open')) {
            self._adjustFlyoutHeight(levelClass);
        }
        self._setFlyoutMargin();
    };
    Proto._setFlyoutMargin = function() {
        var self = this,
            options = this.options,
            $element = self.element,
            marginValue = 0,
            $activeElementParent = $('.' + options.navigationClass + ' .' + options.level1Class + ' li a.ds2-active').first().parent();
        if (!self.isMobile && !self.isTablet) {
            if ($activeElementParent && $activeElementParent.length > 0) {
                var elem = $(options.flyoutContentClass + ' ul.ds2-open:not(.' + options.level1Class + ')', $element);
                if(window.digitals2.main.isLTR) {
                    marginValue = $activeElementParent.offset().left - $('nav', $element).offset().left;
                    elem.first().css({marginLeft: marginValue });
                } else {
                    marginValue = $("body").width() - $activeElementParent.offset().left - $activeElementParent.outerWidth() - $('nav', $element).offset().left;
                    elem.first().css({marginRight: marginValue });
                }
            }
        }
    };
    Proto._decreasePaddingOfFlyout = function() {
        var pContentbar = $('.ds2-navigation-content-bar'),
            pContentbarHeight = pContentbar.height(),
            pMainFlyout = $('.ds2-navigation-main--flyout');
        if (pContentbar && pContentbarHeight && pMainFlyout) {
            pMainFlyout.removeClass('ds2-padding-bottom');
        }
    };
    Proto._openFlyout = function(delay) {
        var self = this,
            options = this.options,
            $element = self.element,
            $flyout = $('.' + options.flyoutClass, $element),
            endHeight,
            animationTime = 300,
            newHeight = 0,
            firstanimation = 0;
        if (!$flyout.hasClass('ds2-flyout-open')) {
            log('navi says: flyout is not open...');
            //BMWST-3149 Change phone and tablet header height
            self._openHeaderHeight();
            this._decreasePaddingOfFlyout();
            var elem = $('.' + options.navigationClass);
            if ($('.ds2-navigation-salesbar').hasClass('ds2-active')) {
                elem.trigger('salesbar:menu:close');
                $('.ds2-navigation-main--salesbar a').removeClass('ds2-active');
                newHeight = $('.ds2-navigation-salesbar').outerHeight();
                firstanimation = animationTime;
            } else {
                $('.ds2-navigation-main--search a').removeClass('ds2-active');
                elem.trigger('searchform:menu:close');
            }
            endHeight = $flyout.outerHeight();
            log('start open flyout animation');
            var elemNavMainContent = $('.ds2-navigation-main--content ul li');
            $('.ds2-navigation-main--content')
                .velocity('stop')
                .velocity(
                    { overflow: 'hidden' },
                    {
                        duration: firstanimation,
                        complete: function() {
                            elemNavMainContent.css({
                                opacity: 0
                            });
                            elemNavMainContent
                                .velocity('stop')
                                .velocity(
                                    { opacity: 1 },
                                    {
                                        duration: animationTime,
                                        complete: function() {
                                            elemNavMainContent.css({
                                                opacity: ''
                                            });
                                        }
                                    });
                            $flyout.css({
                                display: 'block',
                                overflow: 'hidden',
                                height: newHeight
                            });
                            
                            $flyout
                                .velocity('stop')
                                .velocity(
                                    { height: endHeight },
                                    {
                                        duration: animationTime,
                                        complete: function() {
                                            $flyout.css({
                                                overflow: '',
                                                height: ''
                                            });
                                            options.flyoutContentHeight = $flyout.height();
                                            log('finish open flyout animation');
                                            log('check if flyout fullscreen');
                                            if (options.hasCloseButton) {
                                                self._checkFlyoutFullscreen();
                                            }
                                            log('----------');
                                            $(document).trigger('models:click');
                                        }
                                    })
                                .addClass('ds2-flyout-open');
                        }
                    });
            self._setNaviHeight();
        } else {
            log('navi says: flyout is already open...');
            log('----------');
        }
    };
    Proto._closeFlyout = function() {
        var self = this,
            options = this.options,
            $element = self.element,
            $flyout = $('.' + options.flyoutClass, $element),
            animationTime = 300;
        log('start close flyout animation');
        $flyout.css({
            overflow: 'hidden'
        });
        if ($flyout.hasClass('ds2-flyout-open')) {
            //BMWST-3149 Change phone and tablet header height
            self._closeHeaderHeight();
            $flyout
                .velocity('stop')
                .velocity(
                    { height: 0 },
                    animationTime,
                    function() {
                        log('finish close flyout animation');
                        log('----------');
                        $flyout.css({
                            display: '',
                            overflow: '',
                            height: ''
                        });
                        $('.ds2-navigation-main--menu li a').removeClass('ds2-active');
                        $('.' + options.level1Class + ' li a').removeClass('ds2-active');
                        $(document).trigger('models:click');
                    })
                .removeClass('ds2-flyout-open');
            self._setNaviHeight();
        }
    };
    Proto._adjustFlyoutHeight = function(levelClass) {
        var self = this,
            options = this.options,
            $element = self.element,
            $flyout = $('.' + options.flyoutClass, $element),
            oldHeight = options.flyoutContentHeight,
            endHeight = ($flyout).height();
        log('got old height of ' + oldHeight);
        log('got new height of ' + endHeight);
        self._addBorder();
        $('.' + levelClass + ' li').css({
            opacity: 0
        });
        $('.' + levelClass + ' li')
            .velocity(
                { opacity: 1 },
                {
                    duration: 300,
                    complete: function() {
                        $('.' + levelClass + ' li').css({
                            opacity: ''
                        });
                    }
                });
        if (endHeight != oldHeight) {
            log('start adjust flyout height animation');
            $flyout.css({
                display: 'block',
                overflow: 'hidden',
                height: oldHeight
            });
            $flyout
                .velocity('stop')
                .velocity(
                    { height: endHeight },
                    {
                        duration: 300,
                        complete: function() {
                            $flyout.css({
                                overflow: '',
                                height: ''
                            });
                            options.flyoutContentHeight = endHeight;
                            log('finish adjust flyout height animation');
                            log('check if flyout fullscreen');
                            if (options.hasCloseButton) {
                                self._checkFlyoutFullscreen();
                            }
                          log('----------');
                        }
                    });
        } else {
            log('no need to adjust flyout height');
        }
    };
    //BMWST-2727 Flyout fullscreen for H5VCO and DLO
    Proto._checkFlyoutFullscreen = function() {
        var self = this,
            options = this.options;
        var currentFlyoutHeight     = $('.' + options.flyoutClass).outerHeight(true),
            maxFlyoutHeight         = 0;
            headerHeight            = $('.ds2-navigation-main--container').outerHeight(true),
            footerHeight            = $('.ds2-main-footer').outerHeight(true),
            cookieDisHeight         = $('.ds2-cookie-disclaimer').outerHeight(true),
            integrationWatcher = window.digitals2.main.mediaQueryIntegrationWatcherCheck();
        if (integrationWatcher != 'ds2ResizeSmallIntegration') {
            maxFlyoutHeight = $(window).height() - headerHeight - footerHeight;
            if ($('.ds2-cookie-disclaimer').css('display') != 'none') {
                maxFlyoutHeight = maxFlyoutHeight - cookieDisHeight;
            }
            log('CurrentFlyout: ' + currentFlyoutHeight);
            log('MaxFlyoutHeight: ' + maxFlyoutHeight);
            if (currentFlyoutHeight >= maxFlyoutHeight) {
                $('.' + options.flyoutClass).css({
                    'max-height': maxFlyoutHeight,
                });
                $(options.flyoutMainContentClass).css({
                    'padding-bottom': '70px'
                });
                $('.' + options.closeBtnContent).fadeIn().css({
                    'position': 'absolute',
                    'bottom' : '0'
                });
                if (self.iscroll != null) {
                    self.iscroll.destroy();
                    self._createIScroll(true);
                } else {
                    self._createIScroll(true);
                }
            } else {
                $('.' + options.flyoutClass).removeAttr('style');
                $(options.flyoutMainContentClass).removeAttr('style');
                $('.' + options.closeBtnContent).fadeOut();
                if (self.iscroll != null) {
                    self.iscroll.destroy();
                }
            }
        } else {
            $('.' + options.flyoutClass).removeAttr('style');
            $(options.flyoutMainContentClass).removeAttr('style');
            $('.' + options.closeBtnContent).fadeOut();
            if (self.iscroll != null) {
                self.iscroll.destroy();
            }
        }
        if (self.iscroll != null) {
            setTimeout(function() {
                self.iscroll.refresh();
            }, 0);
        }
    };
    //BMWST-3149 Change phone and tablet header height
    Proto._closeHeaderHeight = function() {
        var options = this.options;
        $(options.navigationTopBar).removeClass(options.navigationTopBarOpen);
    };
    Proto._openHeaderHeight = function() {
        var options = this.options;
        if (!options.hasCloseButton) {
            if ($('.ds2-navigation-main--id-module').css('display') != 'none') {
                $(options.navigationTopBar).addClass(options.navigationTopBarOpen);
            } else {
                $(options.navigationTopBar).removeClass(options.navigationTopBarOpen);
            }
        } else {
            $(options.navigationTopBar).removeClass(options.navigationTopBarOpen);
        }
    };
    /*
     * Create the markup for the Flyout
     */
    Proto._createFlyout = function() {
        var self          = this,
            options       = this.options,
            $element      = this.$element,
            $flyoutCClass = $(options.flyoutContentClass, $element);
        // create level 1 used for < tablet
        $('.' + options.menuClass + ' > li', $element)
            .each( function(j, menuElm) {
                //get level 1 elements
                var _level1 = self._getLevelNavigation('level-1', $element, $(menuElm).attr('data-main-id'), true);
                $flyoutCClass.append(_level1);
            });
        $('.' + options.level1Class + ' > li', $element)
            .each(function(i, elm) {
                //get level 2 elements
                var _level2 = self._getLevelNavigation('level-2', elm, $('.ds2-navigation-main--level-2', elm).parent().attr('data-main-id'));
                //get level 3 elements
                var _level3 = '';
                $('.ds2-navigation-main--level-3', elm)
                    .each(function(k, level3Elm) {
                        _level3 += self._getLevelNavigation('level-3', $(level3Elm).parent(), $(level3Elm).parent().attr('data-main-id'));
                    });
                $flyoutCClass
                    .append(_level2)
                    .append(_level3);
                // clean up
                $('li a', $flyoutCClass).removeClass('ds2-icon--all-models-white');
            });    
    };
    /*
     * For creating the markup we need the level navigation from the nav inside the dom
     * pass the correct params to get the html for the level
     *
     * this function removes any ul's (deeper level) inside the level
     *
     * @param {Object} level_ level needed (level-2, level-3)
     * @param {Object} elm_ parent elm where the needed level is inside
     */
    Proto._getLevelNavigation = function(level_, elm_, dataId_, includeFastlane_) {
        var _levelHtml,
            _dataId;
        if ($('.ds2-navigation-main--' + level_, elm_).length > 0) {
            _dataId = dataId_;
            _levelHtml = '<ul class="' + 'ds2-navigation-main--' + level_ + '" data-link-main-id="' + _dataId + '">';
            // HINT: there are elements that should be visible in navigation with class=ds2-navigation-main--invisible
            $('.ds2-navigation-main--' + level_ + ' > li', elm_)
                .not('.ds2-navigation-main--invisible')
                .each(function(j, elmLevel) {
                    var hasSubLevel = $('ul', elmLevel).length > 0,
                        elmLevelElem = $(elmLevel);
                    if (hasSubLevel) {
                        _levelHtml += '<li class="ds2-has-sublevel" data-main-id="' + elmLevelElem.attr('data-main-id') + '">';
                    } else {
                        _levelHtml += '<li>';
                    }
                    var _clone = elmLevelElem.clone();
                    if (hasSubLevel && level_ !== 'level-3') { // don't add span for links to level 3 since we can't go deeper in flyout
                        $('> a', _clone).addClass('ds2-icon ds2-icon--arrow-big-r-white');
                    }
                    // remove deeper level
                    $('ul', _clone).remove();
                    _levelHtml += _clone.html() + '</li>';
                });
            if (includeFastlane_) {
                _levelHtml += this._getFastlaneNavigation();
            }
            _levelHtml += '</ul>';
        }
        return _levelHtml;
    };
    /*
     * get markup for fastlane to add to level-1 inside flyout
     */
    Proto._getFastlaneNavigation = function() {
        var _levelHtml;
        var $element = this.element;
        _levelHtml = '';
        $('.ds2-navigation-main--fastlane > li', $element)
            .each(function(j, elmFastlane) {
                var _clone = $(elmFastlane).clone();
                _clone.find('.ds2-nsc-js--data > .ds2-layer').remove();
                _levelHtml += '<li>';
                _levelHtml += _clone.html() + '</li>';
            });
        return _levelHtml;
    };
    /*********************************************************
     *                       FLYOUT END                      *
     * *******************************************************/
    Proto._setNaviHeight = function() {
        var self = this,
            options = this.options,
            $element = this.element,
            animationTime = 300;
        var resetNavi = function() {
            $('#ds2-globalnav')
                .removeClass('navi-height-set')
                .css({
                    height: ''
                });
        };
        if ($('.' + options.flyoutClass, $element).hasClass('ds2-flyout-open')) {
            var navMainElem = $('.ds2-navigation-main--id-module', $element);
            var idModuleHeight = navMainElem.height(),
                idModuleVisible = !navMainElem.hasClass('ds2-navigation-main--hide-for-medium-down');
            if ((self.isMobile || self.isTablet) && idModuleVisible) {
                $('#ds2-globalnav')
                    .addClass('navi-height-set')
                    .velocity('stop')
                    .velocity({ height: idModuleHeight + 5 }, animationTime);
            } else {
                resetNavi();
            }
        } else {
            // back to small nav size
            if (self.isMobile || self.isTablet) {
                var newHeight,
                    globalNavElem = $('#ds2-globalnav'),
                    oldHeight = globalNavElem.height();
                globalNavElem.css({
                    height: ''
                });
                newHeight = globalNavElem.height();
                globalNavElem.css({
                    height: oldHeight
                });
                globalNavElem
                    .addClass('navi-height-set')
                    .velocity('stop')
                    .velocity(
                        { height: newHeight },
                        animationTime,
                        function() {
                            globalNavElem.css({
                                height: ''
                            });
                        });
            } else {
                resetNavi();
            }
        }
    };
    /*
    *  Change ID Module based on Vehicle Brand/Series Attributes
    *  The h5vco.configurationChanged event provides the attribute series and brand.
    *  series provides for BMW i vehicles "i" and for M vehicles "M". "1", "2" etc. for other BMW series.
    *  The attribute brand is BI for i series and BM for all BMW series including M.
    */
    Proto._setIdModuleOnConfiguratorPage = function() {
        if (window.ds2configurator) {
            var self = this,
                options = this.options,
                $element = this.element;
            window.ds2configurator.$
                .subscribe("h5vco.configurationChanged", function(vehicleData) {
                    var idModule                = $('.ds2-navigation-main--id-module', $element);
                    var idModuleNoPrint         = $('.ds2-noprint', idModule);
                    var idModuleNoPrintPathBmwi = idModuleNoPrint.data('pathBmwi');
                    var idModuleNoPrintPathBmw  = idModuleNoPrint.data('pathBmw');
                    var idModulePrint           = $('.ds2-printonly', idModule);
                    var idModulePrintPathBmwi   = idModulePrint.data('pathBmwi');
                    var idModulePrintPathBmw    = idModulePrint.data('pathBmw');
                    if (vehicleData.brand == 'BI') {
                        if (idModuleNoPrintPathBmwi) {
                            idModuleNoPrint.attr('src', idModuleNoPrintPathBmwi);
                        }
                        if (idModulePrintPathBmwi) {
                            idModulePrint.attr('src', idModulePrintPathBmwi);
                        }
                    } else if (vehicleData.brand == 'BM') {
                        if (idModuleNoPrintPathBmw) {
                            idModuleNoPrint.attr('src', idModuleNoPrintPathBmw);
                        }
                        if (idModulePrintPathBmw) {
                            idModulePrint.attr('src', idModulePrintPathBmw);
                        }
                    }
                });
        }      
    };
    return ds2navigationMain;
});
