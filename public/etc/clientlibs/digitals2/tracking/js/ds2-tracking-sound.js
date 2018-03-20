(function(window, document, $, undefined) {
  $.widget('digitals2.ds2TrackingSound', $.digitals2.ds2TrackingBase, {

    _listnersInit: function() {
      var self = this;

      $('.ds2-video-player', this.element)
          .on('ds2-video-player-play', function(event, trackObj) {
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

      self._sliderInit();
      self._downloadButtonInit();
      self._super();
    },

    _sliderInit:function () {
      var self = this;

      self.element
        .off('tracking:video:open').on('tracking:video:open', function(event, trackObj) {

          log('_sliderInit --> tracking:video:open');

          self._callExpandEvent(
              self.eventBuilder.newEvent()
                  .eventName(trackObj.eventName)
                  .eventAction(self.TC.OPEN_VIDEO)
                  .eventPoints('')
                  .cause(trackObj.cause)
                  .effect('')
                  .target(trackObj.target)
                  .primaryCategoryIsEngagement()
                  .mmdr(trackObj.mmdr)
                  .build(),
              self.bmwTrackOptionsBuilder.options()
                  .timing(true)
                  .name(self.TC.OPEN_VIDEO)
                  .build());
        });
    },

    _downloadButtonInit:function () {
      var self = this;

      self.element
        .off('tracking:downloadimage').on('tracking:downloadimage', function(event, trackObj) {

          self._callExpandEvent(
              self.eventBuilder.newEvent()
                  .eventName(trackObj.eventName)
                  .eventAction(trackObj.eventAction)
                  .eventPoints('')
                  .cause(trackObj.cause)
                  .effect('')
                  .target(trackObj.target)
                  .mmdr(trackObj.mmdr)
                  .primaryCategoryIsEngagement()
                  .build(),
              self.bmwTrackOptionsBuilder.options()
                  .timing(true)
                  .name("download")
                  .build());
        });
    },

    _trackVideoEvent: function(scope, eventObj) {
      var self = this,
          $element = $(scope),
          pMappedEvent,
          pMappedObj = {};

      if ( $element.data('tracking-options') && $element.data('tracking-options').name ) {
        eventName = $element.data('tracking-options').name;
        pMappedEvent = self._loopProp(self.options.mappingObj, eventName);
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
