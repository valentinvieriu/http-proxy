/**
 * Created by catalin.lehaci on 6/21/2017.
 */
define('ds2-image-lazyLoad',
    [
        'use!jquery'
    ], function($) {
        var loadimages = function (component) {
            // image caching
            var currentComponent = $(component),
                componentImages = currentComponent.find('img[data-ds2-lazy-load]');


            //  lazy init
            componentImages.Lazy({
                attribute: 'data-img',
                scrollDirection: 'vertical',
                effect: "fadeIn",
                effectTime: 1000,
                bind: 'event',
                threshold: 500,
                chainable: false,
                beforeLoad: function (element) {
                    //   adds the spinning animation
                    $(element).addClass('ds2-image-lazy-loading');
                },
                // remove the lazy class and lets the interchange to change the image source after lazy loading
                afterLoad: function (element) {
                    var $element = $(element);
                    $element.css('height', 'auto');
                    $element.removeAttr('data-ds2-lazy-load');
                    $element.addClass('ds2-image-lazy-loaded');
                    $element.removeClass('ds2-image-lazy-loading');
                    $element.parent().removeClass('ds2-preloader');
                }
            });
            //  triggers the lazy loading
            componentImages.trigger('scroll');
            window.onfocus = function() {
                componentImages.trigger('scroll');
            };
        };
        return loadimages;
    }
);
