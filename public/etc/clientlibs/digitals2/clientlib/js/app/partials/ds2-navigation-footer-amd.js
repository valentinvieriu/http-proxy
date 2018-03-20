/**
 * partial: navigation-footer
 * author: ronny
 *
 */
define('ds2-main-footer',['use!jquery',
        'ds2-main'],
   function($){

    function MainFooter(component){
        this.$component = $(component);
        this.initTrigger();
    }

    var proto = MainFooter.prototype;

    proto.initTrigger = function(){
        this._hoverCreate();

    };

    proto._hoverCreate = function() {

        $('.ds2-main-footer--js-link', this.element).each(function() {
            
            var self = $(this);
            var img = $('img',this);
            
          self.on('mouseover',function(){
            img.attr('src', img.data('hover'));

          });
          self.on('mouseout',function(){
            img.attr('src', img.data('default'));
          });
        });
      }

    return MainFooter;
});
