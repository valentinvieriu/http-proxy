/**
 * partial: model brief
 * Created by andrei.cornea
 *
 * this is referenced in apps/digitals2/teasers/components/modelbrief/modelbrief_content.html
 */

define('ds2-model-brief', [
    'use!jquery',
    'ds2-image-lazyLoad'
], function($, ds2imagelazyLoad) {

    var ModeBrief = function(element) {

        new ds2imagelazyLoad(element);
    };
    return ModeBrief;
});
