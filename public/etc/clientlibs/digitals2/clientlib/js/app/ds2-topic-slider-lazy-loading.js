/**
 * Created by andrei.cornea on 9/7/2017.
 */


define('ds2-image-lazyLoad-TopicSlider',
    [
        'use!jquery'
    ], function($) {
        var loadimages = function (component) {

            // image caching
            var currentComponent = $(component),
                componentImages = currentComponent.find('img[data-ds2-lazy-load]').first();

            //  lazy init

            this.instance = componentImages.lazy({
                attribute: 'data-img',
                chainable: false,
                effect: "fadeIn",
                effectTime: 500,
                autoDestroy: false,
                bind:'event',
                threshold: 50,
                //visibleOnly: true,
                beforeLoad: function (element) {
                    //   adds the spinning animation

                    $(element).parents('[data-toggle-content]').addClass('ds2-model-card--image');

                },
                // remove the lazy class and lets the interchange to change the image source after lazy loading
                afterLoad: function (element) {
                    var $element = $(element);

                    $element.parents('[data-toggle-content]').removeClass('ds2-model-card--image');
                    $element.removeAttr('data-ds2-lazy-load');
                }
            });


        };



        return loadimages ;
    }
);