(function (window, document, $, undefined) {
  $.widget('digitals2.ds2TrackingHotspotExtended', $.digitals2.ds2TrackingBase, {

    _listnersInit: function () {
      var self = this;

      self.element.on('ds2-hse--layer-open', function (event, eventObj) {
        self._trackHseEvent(eventObj);
      });

      self.element.on('ds2-hse--tooltip-open', function (event, eventObj) {
        self._trackHseEvent(eventObj);
      });

      $('.ds2-video-player--play', self.element).click(function (e) {
        var target = "";
        var mmdr = "";
        var element = $(this).closest('.ds2-video-player');
        if (element.length > 0) {
          var trackingEvent = $(element).data('tracking-event');
          if (trackingEvent && trackingEvent.eventInfo) {
            var trackObj = trackingEvent.eventInfo;
            target = trackObj.target;
            mmdr = trackObj.mmdr;
          }
        }
        self._callExpandEvent(
          self.eventBuilder.newEvent()
            .eventName("")
            .eventAction("Open video")
            .eventPoints("")
            .cause("")
            .effect("")
            .target(target)
            .element("Button")
            .primaryCategory("triggered")
            .mmdr(mmdr)
            .build(),
          self.bmwTrackOptionsBuilder.options()
            .name(self.TC.OPEN_VIDEO)
            .build());


        self._callExpandEvent(
          self.eventBuilder.newEvent()
            .eventName("")
            .eventAction("Start video")
            .eventPoints("")
            .cause("")
            .effect("")
            .target(target)
            .element("")
            .primaryCategory("triggered")
            .mmdr(mmdr)
            .build(),
          self.bmwTrackOptionsBuilder.options()
            .name(self.TC.START_VIDEO)
            .build());
      });


      self._super();
    },

    _trackHseEvent: function (eventObj) {
      var self = this;

      // update Tracking Component Layer
      var pIndex = self.element.data('tracking-index');

      if (eventObj.hasOwnProperty('compTracking')) {
        self.api.updateComponentTracking(pIndex, eventObj.compTracking, self.api.getCurrentPageIndex());
      }

      // TODO: eventInfo.element is not included right now?
      if (eventObj !== undefined) {
        self._callExpandEvent(
          self.eventBuilder.newEvent()
            .eventName(eventObj.eventInfo.eventName)
            .eventAction(eventObj.eventInfo.eventAction)
            .element(eventObj.eventInfo.element)
            .target(eventObj.eventInfo.target)
            .cause(eventObj.eventInfo.cause)
            .build(),
          self.bmwTrackOptionsBuilder.options()
            .name(eventObj.eventInfo.eventAction)
            .timing(true)
            .build()
        );
      }
    }

  });

}(window, document, jQuery));
