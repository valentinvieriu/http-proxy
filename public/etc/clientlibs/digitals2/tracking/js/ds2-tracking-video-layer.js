(function(window, document, $, undefined) {
  $.widget('digitals2.ds2TrackingVideoLayer', $.digitals2.ds2TrackingBase, {

    _listnersInit: function() {
      var self = this;

      $('.ds2-video-player', this.element)
          .on('ds2-video-player-play-layer', function(event, trackObj) {
            self._callExpandEvent(trackObj,
                self.bmwTrackOptionsBuilder.options()
                    .name(self.TC.START_VIDEO)
                    .build());
          })
          .on('ds2-video-player-track-absolute-progress', function(event, eventObj) {
            eventObj.eventAction = 'Progress';
            self._trackVideoEvent(this, eventObj);
          })
          .on('ds2-video-player-track-relative-progress', function(event, eventObj) {
            eventObj.eventAction = 'Milestone';
            self._trackVideoEvent(this, eventObj);
          });

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
