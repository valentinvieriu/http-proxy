/**
 * Created by catalin.lehaci on 6/21/2017.
 */

define('ds2-offer-detail', [
    'use!jquery',
    'ds2-image-lazyLoad',
    'ds2-main'
], function($, ds2imagelazyLoad) {
    var offer_detail = function(element) {
        new ds2imagelazyLoad(element);
    }
    return offer_detail;
});
