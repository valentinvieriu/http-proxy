/**
 * Created by catalin.lehaci on 6/22/2017.
 */
define('ds2-fallback-detail', [
    'use!jquery',
    'ds2-image-lazyLoad',
    'use!jquery-slick',
    'ds2-main'
], function($, ds2imagelazyLoad) {

    var fallback_detail = function(element) {
        new ds2imagelazyLoad(element);
    }
    return fallback_detail;
});
