// TO DO avoid repetation, namespace the events , put try catches blocks

(function(window, document, $, undefined) {
  $.widget('digitals2.ds2TrackingStageTeaser', $.digitals2.ds2TrackingBase, {
    _isCurrentSlideVideo: function(currentSlide, context) {
      if ($('.slick-active', context).find('.ds2-video-player').length) {
        return 'video-' + currentSlide;
      } else {
        return 'image-' + currentSlide;
      }
    },

    _listnersInit: function() {
      var self = this;
      var round = 1;

      $('.ds2-slider--main', this.element).on('ds2slider-play-video', function(event, trackObj) {
          self._callExpandEvent(trackObj,
          self.bmwTrackOptionsBuilder.options()
          .name(self.TC.START_VIDEO)
          .build());
      });

      $('.ds2-video-player:not(.ds2-layer *)', this.element)
        .on('ds2-video-player-track-absolute-progress', function(event, eventObj) {
          eventObj.eventAction = 'Progress';
          self._trackVideoEvent(this, eventObj);
        })
        .on('ds2-video-player-track-relative-progress', function(event, eventObj) {
          eventObj.eventAction = 'Milestone';
          self._trackVideoEvent(this, eventObj);
        });

      if($('.ds2-showroom-js--open-layer', this.element)) self._trackOpenShowroomLayerClick(this.element);
      if($('.ds2-video-layer-link', this.element)) self._trackOpenLayerClick('.ds2-video-layer-link', this.element);
      if($('.ds2-highlight-js--open-layer', this.element)) self._trackOpenLayerClick('.ds2-highlight-js--open-layer', this.element);

      this._super();
    },

    _trackVideoEvent: function(scope, eventObj) {
      var self = this,
          $element = $(scope),
          pMappedEvent,
          pMappedObj = {},
          eventName;

      eventName = $element.data('tracking-options').name;

      if ( $element.data('tracking-options') && $element.data('tracking-options').name ) {
        // special pMappedEvent for milestone and progress events
        if(eventObj.eventAction === 'Progress') {
          pMappedEvent = self._loopProp(self.options.mappingObj, 'record_video_progress_seconds');
        } else if(eventObj.eventAction === 'Milestone') {
          pMappedEvent = self._loopProp(self.options.mappingObj, 'record_video_progress_percent');
        } else {
          pMappedEvent = self._loopProp(self.options.mappingObj, eventName);
        }

        pMappedObj = self._mapFilter(pMappedEvent, $element.data('tracking-options').content);
      }



      self._callExpandEvent(
        self.eventBuilder.newEvent()
          .eventName(eventName)
          .eventAction(eventObj.eventAction)
          .target(eventObj.target)
          .effect(eventObj.milestone)
          .primaryCategoryIsEngagement()
          .videoLength(eventObj.duration)
          .build(),
          pMappedObj
      );
    }
  });

}(window, document, jQuery));
