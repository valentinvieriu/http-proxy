/**
 * Created by andrei.cornea on 6/8/2017.
 * referenced apps/digitals2/text/components/preconfiguration/preconfiguration_content.html
 */
define('ds2-pre-configuration',
    [
        'use!jquery',
        'ds2-image-lazyLoad'
    ], function($, ds2imagelazyLoad) {
        var preConfiguration = function(element) {
            new ds2imagelazyLoad(element);
        };
        return preConfiguration;
    });
