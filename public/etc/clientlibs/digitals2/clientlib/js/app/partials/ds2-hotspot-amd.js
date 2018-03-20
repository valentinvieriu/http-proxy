/**
 * @partial: hotspot
 * @author: christian // TODO: find out any contacts. Who is this?
 * @description: // TODO: Please describe me ASAP,
 *                  but only when you know more about the context
 *                  and where / in which use-cases I am present!
 */
define('ds2-hotspot', [
        'use!jquery',
        'ds2-image-lazyLoad',
        'use!IScroll',
        // Adding jQuery UI as a dependency, because the .accordion() method is used
        'use!jquery-ui',
        'ds2-main'],
    function ($, ds2imagelazyLoad, IScroll, jQueryUI) {
        'use strict';

        var ds2Hotspot = function (element) {
            this.$element = $(element);
            new ds2imagelazyLoad(element);
            this.options = {
                // Stores currently selected (opened) hotspot id
                activeId: null,
                hotspotClass: 'ds2-icon--hotspot',
                hotspotActiveClass: 'ds2-icon--hotspot-blue'
            };

            this.init();
        };

        /**
         * Getters and setters of the currently selected (opened) hotspot id.
         *
         * @param {string or null} id
         */
        ds2Hotspot.prototype.setActiveId = function(id){
            if (typeof id === 'undefined') {
                console.error('Missing hotspot item ID');

                return;
            }

            this.options.activeId = id;
        };
        ds2Hotspot.prototype.getActiveId = function(){
            return this.options.activeId || null;
        };

        /**
         * Init the component and attach the required event listeners
         */
        ds2Hotspot.prototype.init = function() {
            var self = this;

            // Attach opening a hotspot event listeners
            $('.ds2-hotspot--keyvisual-hotspot-dot--input', self.$element).on('click', function (event) {
                var $this = $(this);
                self.resetHotspotActiveness();

                /**
                 * The event listener is attached to multiple hotspot items.
                 * In case the event listener hits another hotspot item,
                 * different the the one which is selected, do not proceed.
                 */
                if (! $this.prop('checked')) {
                    return false;
                }

                var $target = $this.next('.ds2-hotspot-element')
                    .find('.ds2-hotspot-element--content');

                $this.prev()
                    .toggleClass(self.options.hotspotActiveClass, true)
                    .toggleClass(self.options.hotspotClass, false);

                self.openHotspot($target, $this.val());

                // Tracking
                // can be more than one titles from cms
                // therefore we need to get first h3
                var title = $target.find('h3').first().text();
                self.$element.trigger('tracking:hotspot:click', {name: title});
            });

            // Attach closeing a hotspot event listeners
            $('.ds2-hotspot-element--close a', self.$element).on('click', function (event) {
                var $hotspotContainer = $(this).closest('.ds2-hotspot--keyvisual-hotspots');

                $('.ds2-hotspot--keyvisual-hotspot-dot--input', $hotspotContainer)
                    .prop('checked',false);
                $('.ds2-hotspot--keyvisual-hotspots label', $hotspotContainer)
                    .removeClass(self.options.hotspotActiveClass)
                    .removeClass(self.options.hotspotClass)
                    .addClass(self.options.hotspotClass);

                self.$element.trigger('stopAllVideos');
                self.setActiveId(null);
                self.destroySmoothScrolling();
            });

            // Attach accordion item toggle event listeners
            $('.ds2-accordion--list-item', self.$element).on('click', function(e) {
                self.resetHotspotActiveness();

                var $currentTarget = $(e.currentTarget);
                var hotspotId = $currentTarget.data('content-id');
                var $target = $('#' + hotspotId, self.$element);

                $target.prop('checked',true);
                $target.prev()
                    .toggleClass(self.options.hotspotActiveClass, true)
                    .toggleClass(self.options.hotspotClass, false);

                // Tracking
                //check if accordion is not already open
                if ($currentTarget.find('.ui-state-active').length > 0) {
                    var title = $(e.currentTarget).find('.ds2-accordion--title').text();
                    title = title.replace(/(\r\n|\n|\r)/gm,"");
                    self.$element.trigger('tracking:hotspot:click', {name: $.trim(title)});
                }
            });

            $(window.digitals2.main).on(
                'ds2ResizeSmall ds2ResizeMedium ds2ResizeLarge',
                self, self.onResize.bind(self)
            );
        };

        /**
         * Init the smooth scrolling / custom scrolling
         * for the content inside the hotspot modal.
         *
         * @param  {jQuery object} $target_
         */
        ds2Hotspot.prototype.initSmoothScrolling = function($target_) {
            var self = this;

            /**
             * In case smooth scrolling is already initiated, just refresh it.
             * To ensure that JavaScript gets the updated properties
             * we should defer the refresh by invoking it in a zero-timeout function.
             *
             * Consider that if you have a very complex HTML structure
             * you may give the browser some more rest
             * and raise the timeout to 100 or 200 milliseconds.
             *
             * See iScroll docs for more info:
             * https://github.com/cubiq/iscroll#mastering-the-refresh-method
             *
             * TODO: I don't think that's a valid use-case,
             * since each time when modal is closed, smooth scrolling is destroyed.
             * Moreover, for each hotspot the $target_ is different,
             * so the refresh won't properly work.
             * If used in a valid use-case, make sure you adjust it!
             */
            if (self.iscroll) {
                setTimeout(function () {
                    self.iscroll.refresh();
                }, 0);

                return;
            }

            self.iscroll = new IScroll($target_.get(0), {
                mouseWheel: true,
                scrollbars: true,
                interactiveScrollbars: true,
                // false needed here,
                // otherwise clicking of checkboxes in the registration is not possible
                click: false,
                tap: true,
                bounce: false,
                momentum: true,
                probeType: 1,
                preventDefault: false
            });
        };

        /**
         * Destroy the smooth scrolling,
         * to free some memory when it is not needed anymore.
         *
         * Additionally, by recommendation in the plugin docs,
         * assign the variable holding the smooth scrolling to `null`, see:
         * https://github.com/cubiq/iscroll#destroy
         */
        ds2Hotspot.prototype.destroySmoothScrolling = function($) {
            var self = this;

            if(! self.iscroll) {
                return;
            }

            self.iscroll.destroy();
            self.iscroll = null;
        };

        /**
         * Make the height of the modal as big as the outer content wrapper allows.
         *
         * @param  {jQuery object} $target_
         */
        ds2Hotspot.prototype.setModalContentHeight = function($target_){
            $target_.closest('.ds2-hotspot-element--content')
                .css({
                    maxHeight: '' // reset first to read out new height and give the chance to grow again after resize
                })
                .css({
                    maxHeight: $target_.closest('.ds2-hotspot-element--content-wrapper').height()
                });
        };

        /**
         * Reset all component hotspots active styling (classes)
         */
        ds2Hotspot.prototype.resetHotspotActiveness = function () {
            var self = this;

            $('.ds2-hotspot--keyvisual-hotspots label', self.$element)
                .toggleClass(self.options.hotspotActiveClass, false)
                .toggleClass(self.options.hotspotClass, true);
        };

        ds2Hotspot.prototype.openHotspot = function ($target_, id_) {
            // Do nothing in case the target element is missing
            if (! $target_.length) {
                return;
            }

            var self = this;

            self.setActiveId(id_);
            self.setModalContentHeight($target_);
            self.initSmoothScrolling($target_);

            // Open the item in the accordion, associated with the chosen hotspot
            var $indexItem = $(".ds2-accordion--element", self.$element)
                .find('[data-content-id="' + id_ + '"]');
            $(".ds2-accordion--element", self.$element)
                .accordion({ active: $indexItem.index() });

            /**
             * On mobile, wait a second for the accordion animation to finish,
             * each accordion animation needs 500,
             * and then scroll down the currently active accordion item.
             */
            if (window.digitals2.main.mediaQueryWatcherCheck() === 'ds2ResizeSmall') {
                setTimeout(function () {
                    var $offsetItem =
                        $('.ds2-accordion--content.ui-accordion-content-active', self.$element)
                            .closest('.ds2-accordion--list-item');

                    $offsetItem.velocity(
                        'scroll', { duration: 300 }
                    );
                }, 1000);
            }
        };

        ds2Hotspot.prototype.onResize = function() {
            var self = this;
            var currentActiveId = self.getActiveId();

            if (currentActiveId) {
                var $target = $('.ds2-hotspot-element[data-id="' + currentActiveId + '"]');

                this.setModalContentHeight($target);
            }
        };

        return ds2Hotspot;
    });
