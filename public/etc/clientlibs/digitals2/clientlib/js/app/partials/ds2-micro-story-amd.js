/**
 * Created by catalin.lehaci on 6/22/2017.
 */
define('ds2-micro-story', [
    'use!jquery',
    'ds2-image-lazyLoad',
    'ds2-main'
], function($, ds2imagelazyLoad) {

    var microStory = function(element) {
        new ds2imagelazyLoad(element);
     }
    return microStory;
});
