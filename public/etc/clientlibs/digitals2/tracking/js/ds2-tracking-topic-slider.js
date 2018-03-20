(function (window, document, $, undefined) {
  $.widget('digitals2.ds2TrackingTopicSlider', $.digitals2.ds2TrackingBase, {

    _create: function () {
      var ret = this._super();
      var self = this;
      var eventName = '';
      // var target = '';
      // var currentInnerSlide = 0;
      // var $activeSlide = $('.ds2-slider--slide.slick-active', this.element).first();
      // var pImage = $activeSlide.find('img');
      // var pHeadline = $activeSlide
      //   .find("[data-toggle-content='" + currentInnerSlide + "'] h1")
      //   .first()
      //   .text()
      //   .trim();

      // if (pImage.data('tracking-event') &&
      //   pImage.data('tracking-event').eventInfo &&
      //   pImage.data('tracking-event').eventInfo.eventName
      // ) {
      //   eventName = pImage.data('tracking-event').eventInfo.eventName;
      // } else {
      //   eventName = undefined;
      // }

      // if (pHeadline) {
      //   target = pHeadline;
      // }

      var pHeadline = $(  self.element ).find("h1.ds2-stage-slider--headline" );
      if (pHeadline.length > 0) {
        pHeadline = $(pHeadline[0]).text().trim();
      }

      var pImage = $(  self.element ).find("img.ds2-image-loader--lazy" );
      if (pImage.length > 0) {
        pImage = $(pImage[0])
        pImage = $(pImage).data('tracking-event').eventInfo.eventName;
      }

      var event = this.eventBuilder.newEvent()
        .eventName(pImage)
        .eventPoints(1)
        .eventAction(this.TC.IMPRESSION)
        .cause(this.TC.DEFAULT)
        .target(pHeadline)
        .categoryInteraction()
        .build();

      event.eventInfo.element = 'Other';
      this._callExpandEvent(
        event,
        this.bmwTrackOptionsBuilder.options()
          .impressionOptions()
          .build());

      return ret;
    },

    _listnersInit: function () {
      var self = this;

      $(this.element)
        .on('ds2-topic-slider-interaction', function (event, trackObj) {
          self._callExpandEvent(
            self.eventBuilder.newEvent()
              .eventName(trackObj.eventName)
              .eventPoints(trackObj.currentSlide)
              .eventAction(self.TC.IMPRESSION)
              .effect(trackObj.effect)
              .element(trackObj.element)
              .cause(trackObj.cause)
              .target(trackObj.target)
              .effect(trackObj.effect)
              .categoryInteraction()
              .build(),
            self.bmwTrackOptionsBuilder.options()
              .impressionOptions()
              .build());
        });

      $(this.element).on('ds2slider-play-video', function (event, trackObj) {
        self._callExpandEvent(trackObj,
          self.bmwTrackOptionsBuilder.options()
            .name(self.TC.START_VIDEO)
            .build());
      });

      if ($('.ds2-showroom-js--open-layer', this.element)) self._trackOpenShowroomLayerClick(this.element);
      if ($('.ds2-video-layer-link', this.element)) self._trackOpenLayerClick('.ds2-video-layer-link', this.element);
      if ($('.ds2-highlight-js--open-layer', this.element)) self._trackOpenLayerClick('.ds2-highlight-js--open-layer', this.element);

      this._super();
    }
  });

}(window, document, jQuery));
