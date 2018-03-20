(function(window, document, $, undefined) {
  $.widget('digitals2.ds2TrackingModelCarousel', $.digitals2.ds2TrackingBase, {

    _init: function() {
      this.options.isImage = false;
      this.options.lapCounter = 1;
    },

    _create: function() {
      var ret = this._super();
      this.options.isImage = false;
      this.options.lapCounter = 1;
      return ret;
    },

    /**
     * @param {boolean} sliderAutoPlay
     * @param {object} self "this" widget.
     * @param {int} deviceIndex
     * @return {string}
     * @private
     */
    getCause: function(sliderAutoPlay, self, deviceIndex) {
      if (sliderAutoPlay) {
        return self.TC.AUTOMATIC;
      } else {
        if (true === self.options.isImage) {
          return self.TC.IMAGE;
        } else {
          if (0 === deviceIndex) {
            return self.TC.ICON;
          } else {
            return self.TC.SWIPE;
          }
        }
      }
    },

    _addCustomWidgetEventProps: function(pEventObj, pEvent, pEventOptions) {
      this.eventBuilder.apply().cause(pEventObj,
          $('.ds2-content-slider--description.slick-active h3', this.element).text().trim());
      this.eventBuilder.apply().eventPoints(pEventObj, (1 + parseInt($('.ds2-model-carousel--image-slide.slick-active', this.element).data('slick-index'), 10)).toString().trim());
      return pEventObj;
    },

    _listnersInit: function() {
      var self = this;

      $('.ds2-model-carousel--image-slide', this.element)
          .on('click', function() {
            self.options.isImage = true;
          });

      $('.slick-prev, .slick-next', this.element)
          .on('click', function() {
            self.options.isImage = false;
          });

      $('.ds2-model-carousel--image-slider', this.element)
          .on('ds2-model-carousel-change', function(event, slickObj) {

            var $slider = self.select('.ds2-model-carousel--image-slider'),
                sliderAutoPlay = $slider.hasClass('ds2-autoplay'),
                deviceIndex = window.digitals2.responsivePlus.device;

            self._callExpandEvent(
                self.eventBuilder.newEvent()
                    .eventName($('.ds2-content-slider--description.slick-active h3', self.element).text().trim())
                    .eventAction(self.TC.IMPRESSION)
                    .eventPoints(slickObj.currentSlide)
                    .cause(self.getCause(sliderAutoPlay, self, deviceIndex))
                    .effect(self.options.lapCounter)
                    .primaryCategoryIsInteraction()
                    .build(),
                self.bmwTrackOptionsBuilder.options()
                    .impressionOptions()
                    .build());
          });

      this._super();
    }
  });

}(window, document, jQuery));
