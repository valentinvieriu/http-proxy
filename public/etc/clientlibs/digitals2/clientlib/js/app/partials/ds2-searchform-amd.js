define(
    'ds2-searchform',
    [
        'use!jquery',
        'use!velocity',
        'ds2-main'
    ], 
    function($, velocity) {
        'use strict';
        function ds2Searchform(element) {
            this.element = $(element);
            this.options = {
                trigger: '.ds2-navigation-main--search',
                target: '.ds2-searchform-js',
                closeTrigger: '.ds2-searchform-js--close',
                navigationClass: 'ds2-navigation-main--container',
                navigationTopBar: '.ds2-navigation-main--top-bar',
                navigationTopBarOpen: 'ds2-navigation-main--top-bar-open',
                hasCloseButton: false,
                closeBtnContent: 'ds2-navigation-element--flyout-close',
                animateTime: 300
            };
            this.init();
        };

        ds2Searchform.prototype.init = function() {
            var self = this,
                $trigger = $('a', this.options.trigger),
                $closeTrigger = $(this.options.closeTrigger),
                areWeOnSearchResultsPage = false;

            $('.ds2-navigation-main--container').on('searchform:menu:close', self, self.closeSearchForm);
            areWeOnSearchResultsPage = ($('.aems-sr-searchbox').length > 0) ? true : false;
            
            if (!areWeOnSearchResultsPage) {
                // Trigger in main navi
                $trigger.off();
                $trigger.on('click', function(e) {
                    e.preventDefault();
                    self.toggleSearchForm($(this));
                });

                // trigger in close icon
                $closeTrigger.off();
                $closeTrigger.on('click', function(e) {
                    e.preventDefault();
                    self.toggleSearchForm($(this));
                });
            } else {
                $trigger.off();
                $trigger.on('click', function(e) {
                    e.preventDefault();
                    $('#aems-inputsearch').focus();
                });
                // TODO: When backend cant set that variable
                // $trigger.addClass('ds2-active-page');
            }
            $(window.digitals2.main).on('ds2ResizeSmall ds2ResizeMedium ds2ResizeLarge ds2ResizeLargeNavi ds2ResizeMediumNavi ds2ResizeSmallNavi', self, self.onResize);

            if ($('div').hasClass(this.options.closeBtnContent)) {
                this.options.hasCloseButton = true;
            }
        };

        ds2Searchform.prototype.closeSearchForm = function() {
            $('.ds2-searchform').css({
                overflow: 'hidden'
            });
            $('.ds2-searchform').velocity(
                { height: 0 },
            {
                duration: 300,
                complete: function() {
                    $('.ds2-searchform').css({
                        height: '',
                        overflow: ''
                    });
                }
            });
        };

        ds2Searchform.prototype.toggleSearchForm = function($trigger) {
            var self = this,
                $target = $(this.options.target),
                targetHeight = $target.height();
            if (0 === targetHeight) {
                self.closeFlyout();
                self.autoHeightAnimate($target, this.options.animateTime, 'ds2-open');

                //BMWST-3149 Change phone and tablet header height
                self.openHeaderHeight();

            } else {
                $target.stop().animate({ height: '0'}, this.options.animateTime, function() {
                    self.setTriggerClass('ds2-inactive');
                    $(document).trigger('models:click');
                });

                //BMWST-3149 Change phone and tablet header height
                self.closeHeaderHeight();
            }
        };

        ds2Searchform.prototype.autoHeightAnimate = function(element, time, mode) {
            var curHeight = element.height(), // Get Default Height
            autoHeight = element.css('height', 'auto').height(); // Get Auto Height

            this.setTriggerClass('ds2-active');

            element.height(curHeight); // Reset to Default Height

            element.velocity(
            {height: autoHeight},
            {
                duration: 300,
                complete: function() {
                mode === 'ds2-open' ? element.height('auto') : null;
                $(document).trigger('models:click');
            }
            }); // Animate to Auto Height
        };

        ds2Searchform.prototype.closeFlyout = function() {
            var flyoutContainer = $('.ds2-navigation-main--flyout-container'),
                navigationSalesbar = $('.ds2-navigation-salesbar');

            if (flyoutContainer.hasClass('ds2-flyout-open')) {
                this.element = flyoutContainer;
            } else if (navigationSalesbar.hasClass('ds2-active')) {
                $('.ds2-navigation-main--salesbar a').removeClass('ds2-active');
                this.element = navigationSalesbar;
            }

            this.element.css({
                overflow: 'hidden'
            });
            $('.ds2-searchform').velocity(
                { height: 0 },
                {
                    duration: 300,
                    complete: function() {

                        flyoutContainer.removeClass('ds2-flyout-open');
                        $('.ds2-navigation-main--level-1 li a').removeClass('ds2-active');
                        $('.ds2-navigation-main--menu li a').removeClass('ds2-active');
                        navigationSalesbar.removeClass('ds2-active');
                        $('.ds2-searchform').css({
                            display: '',
                            height: '',
                            overflow: ''
                        });
                }
            });
        };

        ds2Searchform.prototype.closeHeaderHeight = function() {
            $(this.options.navigationTopBar).removeClass(this.options.navigationTopBarOpen);
        };

        ds2Searchform.prototype.openHeaderHeight = function() {
            if (!this.options.hasCloseButton) {
                if ($('.ds2-navigation-main--id-module').css('display') != 'none') {
                    $(this.options.navigationTopBar).addClass(this.options.navigationTopBarOpen);
                } else {
                    $(this.options.navigationTopBar).removeClass(this.options.navigationTopBarOpen);
                }
            } else {
                $(this.options.navigationTopBar).removeClass(this.options.navigationTopBarOpen);
            }
        };

        ds2Searchform.prototype.setTriggerClass = function(mode) {
            var $trigger = $('a', this.options.trigger),
                activeClass = 'ds2-active';

            switch (mode) {
                case 'ds2-active':
                    $trigger.addClass(activeClass);
                break;
                case 'ds2-inactive':
                    $trigger.removeClass(activeClass);
                break;
            }
        };

        ds2Searchform.prototype.onResize = function(self) {};

        return ds2Searchform;
    }
);
