/**
 * @author Andrei Dumitrescu
 * @description Navigation salesbar refactoring using AMD
 */
define(
    'ds2-navigation-salesbar',
    [
        'use!jquery',
        'use!velocity',
        'ds2-main'
    ], 
    function($) {
        'use strict';
        function ds2NavigationSalesbar(element) {
            this.element = $(element);
            this.options = {
                flyoutClass: 'ds2-navigation-main--flyout-container',
                navigationClass: 'ds2-navigation-main--container',
                contentBar: 'ds2-navigation-content-bar',
                contentbarClass: 'ds2-navigation-content-bar--container',
                salesbarMenuClass: 'ds2-navigation-main--salesbar',
                salesbarClass: 'ds2-navigation-salesbar',
                salesbarButtonClass: 'ds2-sales-button',
                buildButtonClass: 'ds2-build-button',
                isMainNavClass: 'ds2-is-mainnav',
                isContentbarClass: 'is-contentbar'
            };
            this.isMobile = false;
            this.isTablet = false;
            this.salesBarClicked = false;
            this.salesBarBreadcrumbOpen = false;
            this.salesBarOpen = false;
            this.init();
        };
        ds2NavigationSalesbar.prototype.init = function() {            
            this.setDeviceValues();
            this.registerEventListeners();
        };
        ds2NavigationSalesbar.prototype.setDeviceValues = function() {
            switch (window.digitals2.main.mediaQueryWatcherCheck()) {
                case 'ds2ResizeSmall':
                    this.isMobile = true;
                break;
                case 'ds2ResizeMedium':
                    this.isTablet = true;
                break;
                default:
                    this.isMobile = false;
                    this.isTablet = false;
                break;
            }
        };
        ds2NavigationSalesbar.prototype.registerEventListeners = function() {
            var self = this;
            // on resize
            $(window.digitals2.main).on('ds2ResizeSmall ds2ResizeMedium ds2ResizeLarge ds2ResizeLargeNavi ds2ResizeMediumNavi ds2ResizeSmallNavi', self, self.onResize);
            $(window).bind('scroll touchmove', self, self.onScroll);
            //add click event for nav --> ds2-navigation-main--salesbar a
            $('.' + this.options.navigationClass + ' .' + this.options.salesbarMenuClass + ' a').bind('click', self, self.onSalesbarMainNavClick);
            $('.' + this.options.contentbarClass + ' .' + this.options.salesbarButtonClass + ' a').bind('click', self, self.onSalesbarBreadcrumbClick);
            $('.' + this.options.navigationClass).bind('salesbar:menu:close', self, self.onNaviClick);
            $(document).bind('contentbar:click', function() {
                self.closeAll();
            });
            $(document).bind('click', function(pEvent) {
                var pTarget = $(pEvent.target),
                    pTargetElementIsLi = pTarget.is('li'),
                    pTargetIsInBar = pTarget.closest('.ds2-navigation-main--salesbar').length > 0;
                if (!pTargetElementIsLi && !pTargetIsInBar) {
                    self.closeAll();
                }
            });
            this.element.on('ds2-navigation-salesbar--equalizeButtons', function() {
                self.equalizeButtons();
            });
        };
        ds2NavigationSalesbar.prototype.equalizeButtons = function() {
            switch (window.digitals2.main.mediaQueryWatcherCheck()) {
                case 'ds2ResizeSmall':
                    this.isMobile = true;
                break;
                case 'ds2ResizeMedium':
                    this.isTablet = true;
                break;
                default:
                    this.isMobile = false;
                    this.isTablet = false;
                break;
            }
        };
        ds2NavigationSalesbar.prototype.setFlyoutMargin = function(type) {
            var marginValue = 0,
                marginValueMainNav = marginValue,
                $salesButton = $('.' + this.options.contentbarClass + ' .' + this.options.salesbarButtonClass + ' a'),
                salesButtonWidth = $salesButton.width(),
                contentBarHeight = $('.' + this.options.contentBar).height(),
                $activeElementParent = (type === 'contentbar') ? $('.ds2-buttonlist', '.ds2-navigation-content-bar--container').first() : $('.ds2-navigation-main--special').first();
            if (!this.isMobile && !this.isTablet) {
                if ($activeElementParent && $activeElementParent.length > 0) {
                    if(window.digitals2.main.isLTR) {
                        marginValue = $activeElementParent.offset().left;
                        marginValueMainNav = marginValue + 7;
                    } else {
                        marginValue = $("body").width() - $activeElementParent.offset().left - $activeElementParent.outerWidth();
                        marginValueMainNav = marginValue + 7;
                    }
                }
            } else {
                if (type != 'contentbar' && $activeElementParent && $activeElementParent.length > 0) {
                    marginValueMainNav = marginValue;
                }
            }
            
            switch (type) {
                case 'contentbar':
                var flyoutWidth = (!this.isMobile && !this.isTablet) ? salesButtonWidth : '100%';
                var position = (!this.isMobile && !this.isTablet) ? 'fixed' : 'absolute';
                var space = (!this.isMobile && !this.isTablet) ? contentBarHeight : $(document).scrollTop() + contentBarHeight;
                this.element.css({
                    position: position,
                    width: flyoutWidth,
                    top: space,
                    zIndex: 2000
                }).addClass(this.options.isContentbarClass).removeClass(this.options.isMainNavClass);
                if(window.digitals2.main.isLTR) {
                    this.element.css({left: marginValue});
                    $('.' + this.options.salesbarMenuClass, this.element).first().css({marginLeft: 0});
                }
                else {
                    this.element.css({right: marginValue});
                    $('.' + this.options.salesbarMenuClass, this.element).first().css({marginRight: 0});
                }
                break;
                default:
                    this.element.removeClass(this.options.isContentbarClass).addClass(this.options.isMainNavClass);
                    if(window.digitals2.main.isLTR) {
                        $('.' + this.options.salesbarMenuClass, this.element).first().css({marginLeft: marginValueMainNav});
                    }
                    else {
                        $('.' + this.options.salesbarMenuClass, this.element).first().css({marginRight: marginValueMainNav});
                    }
                break;
            }
        };
        ds2NavigationSalesbar.prototype.equalizeButtons = function() {
            var $salesButton = $('.' + this.options.contentbarClass + ' .' + this.options.salesbarButtonClass + ' a'),
                $buildButton = $('.' + this.options.contentbarClass + ' .' + this.options.buildButtonClass + ' a'),
                pWidth = Math.max($salesButton.width(), $buildButton.width());
            if (!this.isMobile && !this.isTablet && pWidth > 0) {
                pWidth = pWidth + 2 > 285 ? 285 : pWidth + 2;   //+2 -> additional space for different fontrenerings  (ie+ff)  // max 285
                $salesButton.width(pWidth);
                $buildButton.width(pWidth);
            }
        };
        ds2NavigationSalesbar.prototype.showSalesbar = function(delay, naviflyout) {
            var self = this,
                oldHeight = 0,
                animationTime = 0;
            if (naviflyout == true) {
                oldHeight = animationHeight;
                animationTime = 300;
            }
            this.salesBarOpen = true;
            this.element.addClass('ds2-active');
            $('.ds2-navigation-main--top-bar').addClass('ds2-navigation-main--top-bar-open');
            var animationHeight = this.element.height();
            this.element.css({
                display: 'none',
                overflow: 'hidden'
            });
            $('.ds2-navigation-main--salesbar li').velocity(
                { overflow: 'hidden' },
                {
                duration: animationTime,
                complete: function() {
                    $('.ds2-navigation-main--salesbar li').css({
                        overflow: ''
                    });
                    self.element.css({
                        height: oldHeight,
                        display: 'block',
                        overflow: 'hidden'
                    });
                    $('.ds2-navigation-main--salesbar li').css({
                        opacity: 0
                    });
                    $('.ds2-navigation-main--salesbar li').velocity(
                    { opacity: 1 },
                    {
                        duration: 300,
                        complete: function() {
                        $('.ds2-navigation-main--salesbar li').css({
                            opacity: ''
                        });
                            $(document).trigger('models:click');
                        }
                    });
                    self.element.velocity({
                        height: animationHeight
                    },
                    {
                    duration: 300,
                    delay: delay,
                    complete: function() {
                        self.element.css({
                        height: '',
                        overflow: '',
                        display: ''
                        });
                    }
                    });
                }
                });
            this.salesBarClicked = false;
            // set link active
            var $link = $('.' + this.options.navigationClass + ' .' + this.options.salesbarMenuClass + ' a');
            $link.removeClass('ds2-active').addClass('ds2-active');
        };
        ds2NavigationSalesbar.prototype.hideSalesbar = function(finishFunction) {
            var self = this;
            this.element.css({
                overflow: 'hidden'
            });
            if (this.salesBarOpen) {
                this.element.velocity({
                    height: 0
                }, 300, function() {
                    self.element.css({
                        height: '',
                        display: '',
                        overflow: ''
                    });
                self.element.removeClass('ds2-active');
                if (finishFunction) {
                    finishFunction();
                }
                $('.ds2-navigation-main--top-bar').removeClass('ds2-navigation-main--top-bar-open');
                $(document).trigger('models:click');
                    self.element.removeClass(self.options.isMainNavClass).removeClass(self.options.isContentbarClass);
                });
                this.salesBarOpen = false;
            }
            // set link inactive
            var $link = $('.' + this.options.navigationClass + ' .' + this.options.salesbarMenuClass + ' a');
            $link.removeClass('ds2-active');
        };
        ds2NavigationSalesbar.prototype.showSalesBarContentBar = function() {
            var $salesButton = $('.' + this.options.contentbarClass + ' .' + this.options.salesbarButtonClass + ' a');
            this.setFlyoutMargin('contentbar');
            this.salesBarBreadcrumbOpen = true;
            $salesButton.parent().addClass('ds2-active');
            this.showSalesbar();
        };
        ds2NavigationSalesbar.prototype.hideSalesBarContentBar = function() {
            var self = this,
                $salesButton = $('.' + this.options.contentbarClass + ' .' + this.options.salesbarButtonClass + ' a');
            this.salesBarContentBarOpen = false;
            $salesButton.parent().removeClass('ds2-active');
            var finishFunction = function() {
                self.element.css({
                    position: '',
                    width: '',
                    top: '',
                    zIndex: '',
                    left: '0',
                    right: '0'
                });
            };
            this.hideSalesbar(finishFunction);
        };
        ds2NavigationSalesbar.prototype.closeAll = function() {
            var $salesButton = $('.' + this.options.contentbarClass + ' .' + this.options.salesbarButtonClass + ' a');
            if (this.salesBarBreadcrumbOpen) {
                $salesButton.parent().hasClass('ds2-active');
                this.hideSalesBarContentBar();
            }
        };
        ds2NavigationSalesbar.prototype.onSalesbarMainNavClick = function(event) {
            var self = event.data,
                oldHeight;
                if ($('.ds2-navigation-main--flyout-container').hasClass('ds2-flyout-open')) {
                    oldHeight = true;
                }
                self.setFlyoutMargin();
            if ($('.ds2-navigation-content-bar').height()) {
                $('.ds2-navigation-salesbar--container').removeClass('ds2-padding-bottom');
            } else {
                $('.ds2-navigation-salesbar--container').addClass('ds2-padding-bottom');
            }
            if ($(event.currentTarget).attr('href').length <= 1) {
                event.preventDefault();
                event.stopPropagation();
                $(document).trigger('salesbar:click');
                self.salesBarClicked = true;
                // send events to close navigation if open and set all level 1 values inactive
                var delay = 0;
                var flyoutOpen = $('.ds2-navigation-main .ds2-navigation-main--flyout-container').hasClass('ds2-flyout-open');
                if (flyoutOpen) {
                    delay = 300;
                    $('.' + self.options.navigationClass).trigger('navigation:menu:close');
                } else {
                    $('.' + self.options.navigationClass).trigger('searchform:menu:close');
                    $('.ds2-navigation-main--search a').removeClass('ds2-active');
                }
                if (self.element.hasClass('ds2-active')) {
                    self.salesBarClicked = false;
                    self.hideSalesbar();
                } else {
                    self.showSalesbar(delay, oldHeight);
                }
            }
        };
        ds2NavigationSalesbar.prototype.onSalesbarBreadcrumbClick = function(event) {
            var self = event.data,
                $target = $(event.currentTarget);
            event.preventDefault();
            event.stopPropagation();
            $(document).trigger('salesbar:click');
            if ($target.parent().hasClass('ds2-active')) {
                self.hideSalesBarContentBar();
            } else {
                self.showSalesBarContentBar();
            }
        };
        ds2NavigationSalesbar.prototype.onNaviClick = function(event) {
            var self = event.data,
                $flyout = $('.' + self.options.flyoutClass, self.element),
                newHeight = $flyout.outerHeight();
            $('.ds2-navigation-main--salesbar li').css({ opacity: 1 });
            $('.ds2-navigation-main--salesbar li').velocity(
                { opacity: 0 },
                {
                duration: 300,
                complete: function() {
                    $('.ds2-navigation-main--salesbar li').css({
                        opacity: ''
                    });
                    self.element.css({
                        overflow: 'hidden',
                        display: 'none'
                    });
                    self.element.css({
                        overflow: '',
                        display: ''
                    });
                    $('.ds2-navigation-main--flyout-container').css({
                        height: newHeight
                    });
                    self.element.removeClass('ds2-active');
                    self.element.removeClass(self.options.isMainNavClass).removeClass(self.options.isContentbarClass);
                    self.salesBarOpen = false;
                }
                });
        };
        ds2NavigationSalesbar.prototype.onResize = function(event) {
            var self = event.data,
                contentBarHeight = $('.' + self.options.contentbarClass).height(),
                $salesButton = $('.' + self.options.contentbarClass + ' .' + self.options.salesbarButtonClass + ' a');
            if (self.isMobile || self.isTablet) $salesButton.width('auto');
            var flyoutType = self.element.hasClass(self.options.isContentbarClass) ? 'contentbar' : null;
            self.setFlyoutMargin(flyoutType);
            self.equalizeButtons();
            self.setDeviceValues();
            if (self.element.hasClass('ds2-active')) {
                self.setDeviceValues();
            }
            if (self.salesBarBreadcrumbOpen) {
                self.element.css({ top: (!self.isMobile && !self.isTablet) ? contentBarHeight : $(document).scrollTop() + contentBarHeight });
            }
        };
        ds2NavigationSalesbar.prototype.onScroll = function(event) {
            var self = event.data;
            self.closeAll();
        };
        return ds2NavigationSalesbar;
    }
);
