(function(window, document, $, undefined) {
  $.widget('digitals2.ds2TrackingModelOverview', $.digitals2.ds2TrackingBase, {

    _listnersInit: function() {
      var self = this;
      $(window).on('ds2-model-overview--filtered', function( event ,dataTrackObj) {
          var TC = digitals2.tracking.TrackingConstants;

          var trackingEvent = self.eventBuilder.newEvent()
            .eventAction('Filter')
            .primaryCategoryIsInteraction()
            .eventName(dataTrackObj.eventName)
            .cause(dataTrackObj.cause)
            .build();

          trackingEvent.category.mmdr = dataTrackObj.category.mmdr;

          var trackingOptions = self.bmwTrackOptionsBuilder.options()
            .name(TC.FILTER)
            .useTimer(true)
            .build();

          self._callExpandEvent(trackingEvent, trackingOptions);
        });
      this._super();
    }
  });

}(window, document, jQuery));
