/**
 * partial: sitemap
 * author: hila
 */

define('ds2-sitemap',[
    'use!jquery',
    'ds2-main'
 ],function($){

    function Sitemap(component){
        this.options = {};
        this.$component = $(component);
        this.initTrigger();
    }

    var proto = Sitemap.prototype;

    proto.initTrigger = function(){
        var self = this;

         window.digitals2.main._equalheight();
         $(window.digitals2.main).on('ds2ResizeSmall ds2ResizeMedium ds2ResizeLarge', self, self._onResize);

    };

    proto._onResize = function(event){
        window.digitals2.main._equalheight();
    };

    return Sitemap;
});




