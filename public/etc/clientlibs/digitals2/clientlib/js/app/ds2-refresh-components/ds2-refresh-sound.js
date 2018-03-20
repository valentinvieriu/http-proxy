/**
 * Created by andrei.cornea on 10/6/2017.
 */

define('ds2-refresh-sound',
    [
        'use!jquery',
        'use!slick',
        'ds2-refresh-components',
        'ds2-slider',
        'ds2-image-lazyLoad',
        'use!foundation'
    ],
    function($, slick, ds2refreshcomponent, ds2Slider, ds2imagelazyLoad , foundation){


        function refreshSound(component){

            new ds2Slider(component);
            $(component).foundation('interchange','reflow');
            new ds2imagelazyLoad(component);

        }


        return function(){ ds2refreshcomponent(refreshSound); }

    }
);
