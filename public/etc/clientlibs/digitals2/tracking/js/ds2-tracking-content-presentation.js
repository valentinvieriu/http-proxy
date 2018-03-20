(function(window, document, $, undefined) {
  $.widget('digitals2.ds2TrackingContentPresentation', $.digitals2.ds2TrackingBase, {

    _listnersInit: function() {
      var self = this;
      $(this.element)
          .on('ds2-contentPresentation-expandTrack', function(event, trackObj) {
            self._callExpandEvent(
                self.eventBuilder.newEvent()
                    .eventName(self.select('h1').text().trim())
                    .eventAction(self.TC.EXPAND)
                    .categoryInteraction()
                    .build(),
                self.bmwTrackOptionsBuilder.options()
                    .name(self.TC.OPEN_HIGHLIGHT)
                    .build());
          });

      this._super();
    }
  });

}(window, document, jQuery));
