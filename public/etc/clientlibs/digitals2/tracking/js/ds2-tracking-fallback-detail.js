(function(window, document, $, undefined) {
  $.widget('digitals2.ds2TrackingFallbackDetail', $.digitals2.ds2TrackingBase, {
    _listnersInit: function() {
      var self = this;
      var round = 1;

      $(this.element)
          .on('ds2-accordion-expandTrack', function(event, trackObj) {
            trackObj = trackObj.eventInfo.eventInfo;

            self._callExpandEvent(
                self.eventBuilder.newEvent()
                    .eventName(trackObj.eventName)
                    .eventPoints(trackObj.eventPoints)
                    .cause(trackObj.cause)
                    .eventActionIsExpand()
                    .primaryCategoryIsInteraction()
                    .build(),
                self.bmwTrackOptionsBuilder.options()
                    .expandOptions()
                    .build());
          });

      this._super();
    }
  });

}(window, document, jQuery));
