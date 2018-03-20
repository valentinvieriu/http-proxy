// init of lazy loading

define('ds2-cluster-overview',[
    'use!jquery',
    'ds2-image-lazyLoad'
], function($, ds2imagelazyLoad) {

    var clusterOverview = function (element){
        new ds2imagelazyLoad(element);
    };

    return clusterOverview;
});
