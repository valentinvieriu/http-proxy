(function(window, document, $, undefined) {
  $.widget('digitals2.ds2TrackingStagePresentation', $.digitals2.ds2TrackingBase, {

    _listnersInit: function() {
      var self = this;

      // dont track events for the videolayers included inside component, its tracked separate
      $('.ds2-video-player:not(.ds2-layer *),.ds2-video-player-auto-loop', this.element)
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

      $(window).on('ds2-video-player-open', function() {
        var opt = self.options.open_video_fired;
        if (!opt) {
          self.options.open_video_fired = true;
          if (digitals2) {
            var pageObj = digitals2.tracking.api.getPageObject(digitals2.tracking.api.getCurrentPageIndex());
            if (pageObj) {
              var target = pageObj.event[pageObj.event.length - 1].eventInfo.eventName;
              pageObj.event[pageObj.event.length - 1].eventInfo.target = target;
              pageObj.event[pageObj.event.length - 1].eventInfo.eventName = "";
              pageObj.event[pageObj.event.length - 1].eventInfo.element = "Other";
              pageObj.event[pageObj.event.length - 1].eventInfo.eventType = "triggered";
              pageObj.event[pageObj.event.length - 1].category.primaryCategory = "triggered";

              self._callExpandEvent(
                self.eventBuilder.newEvent()
                  .eventName("")
                  .eventAction("Start video")
                  .eventPoints("")
                  .cause("")
                  .effect("")
                  .target(target)
                  .element("Other")
                  .primaryCategory("triggered")
                  .mmdr("")
                  .build(),
                self.bmwTrackOptionsBuilder.options()
                  .name(self.TC.START_VIDEO)
                  .build());

            }
          }
        }
      });


      $(window).on('ds2-video-player-play-layer', function() {

        if (digitals2) {
          var pageObj = digitals2.tracking.api.getPageObject(digitals2.tracking.api.getCurrentPageIndex());
          if (pageObj) {
            var target = pageObj.event[pageObj.event.length - 2].eventInfo.eventName;
            pageObj.event[pageObj.event.length - 2].eventInfo.target = target;
            pageObj.event[pageObj.event.length - 2].eventInfo.eventName = "";
            pageObj.event[pageObj.event.length - 2].eventInfo.element = "Other";
            pageObj.event[pageObj.event.length - 2].eventInfo.eventType = "triggered";
            pageObj.event[pageObj.event.length - 2].category.primaryCategory = "triggered";

            pageObj.event[pageObj.event.length - 1].eventInfo.target = target;
            pageObj.event[pageObj.event.length - 1].eventInfo.eventName = "";
            pageObj.event[pageObj.event.length - 1].eventInfo.cause = "";
            pageObj.event[pageObj.event.length - 1].eventInfo.effect = "";
            pageObj.event[pageObj.event.length - 1].eventInfo.element = "Other";
            pageObj.event[pageObj.event.length - 1].eventInfo.eventType = "triggered";
            pageObj.event[pageObj.event.length - 1].category.primaryCategory = "triggered";

          }
        }
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
