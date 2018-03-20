define('ds2-scroll-arrow',[

    'use!jquery',
    'ds2-main'

],function($){

 var Scrollarrow = function (element){
        this.options ={
              mainWrapper: 'ds2-main-wrapper',
              scrollArrow: 'ds2-scroll-arrow'
        };

        this.$element = $(element);
        this.initTrigger();

    }


var proto = Scrollarrow.prototype;

    proto.initTrigger = function(){

        var self = this;

        self.isMobile = false;
        self.isTablet = false;

        self._setDeviceValues();
        self._firstImageFind();

         // on resize
          $(window.digitals2.main).on('ds2ResizeSmall ds2ResizeMedium ds2ResizeLarge ds2ResizeLargeNavi ds2ResizeMediumNavi ds2ResizeSmallNavi', self, self._onResize);

          $(window).on('ds2CookieControllerAnimFinished', self, self._onResize);

          $(window).on('scroll touchmove', self, self._onScroll);

          this.$element.on('click', self, self._onscrollArrowClick);
    }



    proto._setDeviceValues = function(){

        var self = this;

          switch (window.digitals2.main.mediaQueryWatcherCheck()) {
            case 'ds2ResizeSmall':
              self.isMobile = true;
              break;
            case 'ds2ResizeMedium':
              self.isTablet = true;
              break;
            default:
              self.isMobile = false;
              self.isTablet = false;
              break;
          }
    };

    proto._firstImageFind = function(){

              var self = this,
                  pFirstImage = $('.' + this.options.mainWrapper, this.element).find('img').eq(0);

              pFirstImage.one('load', function() {
                self._getImageHeight();
              }).each(function() {

                if (this.complete) {
                  $(this).ready();
                }

              });
    };

    proto._getImageHeight = function(){

          if ($('.ds2-main-wrapper .ds2-component').first().find('img')) {
                var self = this,
                    imageContainer = $('.ds2-main-wrapper').find('img').eq(0).parent(),
                    imageHeight = imageContainer.height(),
                    viewportHeight = $(window).height(),
                    offset = undefined,
                    offsetBottom = undefined;


                if (imageContainer.offset()) {
                  offset = imageContainer.offset();
                  offsetBottom = viewportHeight - offset.top - imageHeight;
                }

               self.$element.removeClass('active');

                if ((offsetBottom < 35) && (imageHeight != 0) && ($(window).scrollTop() == 0)) {
                  self.$element.addClass('active');
                }
                if (imageHeight == 0) {
                  setTimeout(function() { self._getImageHeight(); },200);
                }
              }
    };

     /*********************************************************
         *                  EVENT LISTENER                       *
         * *******************************************************/


    proto._onResize = function(event){

         var self = event.data;

              self._setDeviceValues();
              self._getImageHeight();

    };


    proto._onScroll = function(event){
         event.data.$element.removeClass('active');
    };


    proto._onscrollArrowClick = function(event){

         var viewportHeight = $(window).height();
              $('html,body')
                  .stop()
                  .animate({scrollTop: viewportHeight},{duration: 600, easing: 'swing'});
    };

    return Scrollarrow;

});
