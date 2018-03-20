(function(window, document, $, undefined) {
  $.widget('digitals2.ds2TrackingErrorPage', $.digitals2.ds2TrackingBase, {

    _listnersInit: function() {
      this._callExpandEvent(
          this.eventBuilder.newEvent()
              .from(this.element.data('tracking-event'))
              .eventAction(this.TC.ERROR)
              .primaryCategory(this.TC.ERROR_MESSAGE)
              .build(),
          this.bmwTrackOptionsBuilder.options()
              .name(this.TC.ERROR.toLowerCase())
              .build());

      this._super();
    }
  });

}(window, document, jQuery));
