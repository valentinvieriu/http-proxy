/**
 * partial: navigation-model-small
 * author: Hristo Eftimov
 */
define( 'ds2-navigation-model-small', [
    'use!jquery',
    'use!velocity'
], function( $ ) {
    var mainObject = window.digitals2.main;
    var navModelSmall = function( element ) {
        var self = this;
        self.activeModel = undefined;
        self.mediaQuerie = undefined;
        self.isMobile = false;
        self.isTablet = false;
        self.$carContainer = $('.ds2-navigation-model-small--card-item');
        self.options = {
            modelsCardItem: '.ds2-navigation-model-small--card-item',
            resizeEvents: 'ds2ResizeSmall ds2ResizeMedium ds2ResizeLarge ds2ResizeLargeNavi ds2ResizeMediumNavi ds2ResizeSmallNavi'
        };
        // update the device type
        self._setDeviceValues();
        // reflow equalizer
        $(self.options.modelsCardItem).imagesLoaded(function() {
            mainObject._equalheight();
        });
        // bind the resize event
        $(mainObject).on(self.options.resizeEvents, self, self._onResize);
        // load the images
        self._loadImg();
    };

    /**
     * Store the navigation-model-small prototype
     * @type {object}
     */

    var proto = navModelSmall.prototype;
    /**
     * Destroy the component
     */
    proto._destroy = function() {
    };
    /**
     * Get the device size and
     * update the object properties
     */
    proto._setDeviceValues = function() {
        var self = this;
        // Equalize the height of window
        mainObject._equalheight();
        switch (mainObject.mediaQueryWatcherCheck()) {
            case 'ds2ResizeSmall':
                self.isMobile = true;
                break;
        }
        switch (mainObject.mediaQueryNaviWatcherCheck()) {
            case 'ds2ResizeSmallNavi':
                self.isTablet = true;
                self.$carContainer.removeClass('medium-4').addClass('medium-6');
                break;
            case 'ds2ResizeMediumNavi':
                self.isTablet = true;
                self.$carContainer.removeClass('large-3 medium-6').addClass('medium-4');
                break;
            case 'ds2ResizeLargeNavi':
                self.isMobile = false;
                self.isTablet = false;
                self.$carContainer.removeClass('medium-4').addClass('large-3');
                break;
        }
    };
    /**
     * Update the device sizes properties
     * on window resize event
     */
    proto._onResize = function(event) {
        event.data._setDeviceValues();
    }
    /**
     * Load the image based on the data-src attribute
     */
    proto._loadImg = function() {
      var self = this,
          $images = $('img[data-src]', self.$carContainer);
        // loop all available
        $.each( $images, function( i, val ) {
            var $image = $(val),
                src = $image.attr('data-src');
            // set the image source based on data
            if (src) {
                $image.attr('src', src).removeAttr('data-src');
            };
            // hide preloader & fade in image if loading is ready
            $image.on('load', function () {
                $(this).velocity({opacity: 1}, {duration: 500});
                $(this).closest('.ds2-model-card--image').addClass('ds2-img-loaded');
            });
        });
    };
    return navModelSmall;
});