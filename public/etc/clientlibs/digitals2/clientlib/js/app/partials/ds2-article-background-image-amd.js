/**
 *
 * author: Christian Gjelstrup
 *
 */


define( 'ds2-article-background-image', [
    'use!jquery',
    'ds2-main'
], function($) {
    function ArticleBackgroundImg (component){
        this.$component = $(component);
        this.initTrigger();

    }

    var proto = ArticleBackgroundImg.prototype;
    proto.initTrigger = function(){
         var self = this;
        this._setMaxHeight();
        $(window.digitals2.main).on('ds2ResizeMedium ds2ResizeLarge', self, function(e){
             self._setMaxHeight();
         });
    }

    proto._setMaxHeight = function () {
          var $backgroundImage =  this.$component.find('.ds2-article-background-image--image-container'),
              maxHeight = $(document).height() - $backgroundImage.offset().top;
          $backgroundImage.css('max-height', maxHeight);
      }

      return ArticleBackgroundImg;
});
