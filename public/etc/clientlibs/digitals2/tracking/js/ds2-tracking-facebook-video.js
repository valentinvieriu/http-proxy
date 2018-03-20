(function (window, document, $, undefined) {
  $.widget('digitals2.ds2TrackingFacebookVideo', $.digitals2.ds2TrackingBase, {

    _listnersInit: function () {
      var self = this;

      $(this.element)
        .on('ds2-facebook-video--play', function (event, eventObj) {
          self._trackVideoEvent(this, eventObj);
        })
        .on('ds2-facebook-video--error', function (event, eventObj) {
          self._trackVideoEvent(this, eventObj);
        });

      this._super();
    },

    _trackVideoEvent: function (scope, eventObj) {
      var self = this;

      self._callExpandEvent(
        self.eventBuilder.newEvent()
          .eventName(eventObj.eventInfo.eventName)
          .eventAction(eventObj.eventInfo.eventAction)
          .target(eventObj.eventInfo.target)
          .cause(eventObj.eventInfo.cause)
          .videoLength(eventObj.attributes.videoLength)
          .build(),
        self.bmwTrackOptionsBuilder.options()
          .timing(true)
          .name(eventObj.eventInfo.eventAction)
          .build()
      );
    }
  });
}(window, document, jQuery));
