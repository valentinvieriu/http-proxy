/**
 * partial: content-presentation
 * author: ronny
 *
 */

 define('ds2-content-presentation',[
     'use!jquery',
     'ds2-image-lazyLoad',
     'use!velocity',
     'use!jquery-fittext',
     'ds2-main'
 ], function($, ds2imageLazyLoad){

    function ContentPresentation(component){
            this.$component = $(component);
            this.options = {
               h1: '.ds2-content-presentation--keyvisual-cta-container h1',
               h3: '.ds2-content-presentation--keyvisual-cta-container h3',
               expandCopySel: '.ds2-expand--body-copy-container',
               masterWithElementSel: '.ds2-content-presentation--keyvisual',
               duration : 400
            }
            new ds2imageLazyLoad(component);
            this.initTrigger();
        }

     var proto = ContentPresentation.prototype;

     proto.initTrigger = function(){
          var self = this,
           component = self.$component;

          self.$expandCopy = $(self.options.expandCopySel, component);

          self.$expandCopy.on('expandCopyContainerEnded', function(event) {

            $(component).trigger('ds2-contentPresentation-expandTrack');
          });

          //CHECK: line-height must be in percent
          self._fontScaling(
            self.options.h1, component, 3, '35px', '48px', $(self.options.masterWithElementSel)
          );
          self._fontScaling(
            self.options.h3, component, 3, '20px', '25px', $(self.options.masterWithElementSel)
          );

//        loading animation on page load
          $('.ds2-content-presentation--keyvisual-image-container img',self.$component).ready(function() {
            $('.ds2-preloader-wrapper', self.$component).velocity({ opacity: 0 }, { duration: self.options.duration });
            $('.ds2-preloading-content', self.$component).velocity({ opacity: 1 }, {
                duration: self.options.duration,
                complete: function() {$(window).trigger('ds2-content-presentation-loaded')}
            });
          });
     }

//     the fontScaling setter
     proto._fontScaling = function(element, parentElement, pFactor, pSizeMin, pSizeMax, masterElement){
         $(element, parentElement).fitText(pFactor, { minFontSize: pSizeMin, maxFontSize: pSizeMax, masterWithElement: masterElement });
     }

     return ContentPresentation;
 })

