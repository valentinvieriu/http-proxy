/**
 * Created by catalin.lehaci on 8/7/2017.
 */
define('ds2-iframe-lazy-load',
    [
        'use!jquery'
    ], function($) {
        var Loadiframe = function(component)
        {
            // image caching
            var $currentComponent = $(component),
                $componentIframe = $currentComponent.find("iframe[data-loader='iframe']");

            // lazy init
            $componentIframe.Lazy({
                attribute: 'data-src',
                scrollDirection: 'vertical',
                effect: 'fadeIn',
                effectTime: 200,
                bind: 'event',
                threshold: 50,
                chainable: false,
            });
            $componentIframe.trigger("scroll");
        }
        return Loadiframe;
    }
);