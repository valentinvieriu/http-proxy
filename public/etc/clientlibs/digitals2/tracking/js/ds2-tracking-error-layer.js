(function(window, document, $, undefined) {
  $.widget('digitals2.ds2TrackingErrorLayer', $.digitals2.ds2TrackingBase, {

    triggerTrackingErrorEvent: function() {
      this._callExpandEvent(
          this.eventBuilder.newEvent()
              .from(this.element.data('tracking-event'))
              .eventAction(this.TC.ERROR)
              .primaryCategory(this.TC.ERROR_MESSAGE)
              .build(),
          this.bmwTrackOptionsBuilder.options()
              .name(this.TC.ERROR)
              .build());
    }
  });

}(window, document, jQuery));
