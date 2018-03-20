/**
 * partial: highlight
 * author: patrick
 */

define( 'ds2-showroom', [
    'use!jquery',
    'use!foundation',
    'ds2-iframe-integration',
    'ds2-main'
], function($,foundation,iframeintegration) {

    function Showroom(component){
        this.$component = $(component);
        this.initTrigger();
    }

    var proto = Showroom.prototype;

    proto.initTrigger = function(){

        var self = this,
            layerid = self.$component.data('showroomlayer');


        $('.ds2-showroom-js--open-layer', this.$component).on('click', function(e) {
            e.preventDefault();
            var id = '#' + layerid;

            $(id, this.$component).find(".iframeintegration-layer-container").each(function(){new iframeintegration(this)});
            $(id, this.$component).foundation('reveal', 'open');
        });
    }

    return Showroom;
});

