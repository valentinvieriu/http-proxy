/**
 * Created by andrei.cornea on 6/7/2017.
 * referenced apps/digitals2/media/components/rendetiveimage/rendetiveimage.html
 */

define('ds2-legal-image',[
    'use!jquery',
    'ds2-image-lazyLoad'
], function($, ds2imagelazyLoad) {

    var legalImage = function(element) {
        new ds2imagelazyLoad(element);
    };

    return legalImage;
});
