(function(window, document, $, undefined) {
  $.widget('digitals2.ds2TrackingContentSlider', $.digitals2.ds2TrackingBase, {

    _create: function() {
      var ret = this._super();
      var self = this;
      var eventName = '';

      if(!$('.slick-active img', self.options.$element).attr('src') &&
          $('.slick-active img', self.options.$element).data('interchange') &&
          $('.slick-active img', self.options.$element).data('interchange').split(',')[0]) {

        eventName = $('.slick-active img', self.options.$element).data('interchange').split(',')[0].substr(1);
      } else {
        eventName = $('.slick-active img', self.options.$element).attr('src');
      }

      this._callExpandEvent(
        this.eventBuilder.newEvent()
            .eventName(eventName)
            .eventPoints(1)
            .eventAction(this.TC.IMPRESSION)
            .cause(this.TC.DEFAULT)
            .target($('.ds2-content-slider--slick-active a span', this.element).text().trim())
            .categoryInteraction()
            .build(),
        this.bmwTrackOptionsBuilder.options()
            .impressionOptions()
            .build());

      return ret;
    },

    _listnersInit: function() {
      var self = this;

      $(this.element)
        .on('ds2-content-slider-interaction', function(event,trackObj) {
          self._callExpandEvent(
            self.eventBuilder.newEvent()
                .eventName($('.slick-active img', self.options.$element).attr('src').trim())
                .eventPoints(trackObj.currentSlide)
                .eventAction(self.TC.IMPRESSION)
                .cause(trackObj.navCause)
                .target($('.ds2-content-slider--slick-active a span', self.element).text().trim())
                .effect(trackObj.effect)
                .categoryInteraction()
                .build(),
            self.bmwTrackOptionsBuilder.options()
                .impressionOptions()
                .build());
        });

      if($('.ds2-showroom-js--open-layer', this.element)) self._trackOpenShowroomLayerClick(this.element);
      if($('.ds2-video-layer-link', this.element)) self._trackOpenLayerClick('.ds2-video-layer-link', this.element);
      if($('.ds2-highlight-js--open-layer', this.element)) self._trackOpenLayerClick('.ds2-highlight-js--open-layer', this.element);

      this._super();
    }
  });

}(window, document, jQuery));
