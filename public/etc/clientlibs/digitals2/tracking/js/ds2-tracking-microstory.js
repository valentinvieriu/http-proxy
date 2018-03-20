(function(window, document, $, undefined) {
  $.widget('digitals2.ds2TrackingMicroStory', $.digitals2.ds2TrackingBase, {

    _listnersInit: function() {
      var self = this;

      $('.ds2-expand--body-copy-container', this.element)
          .on('expandCopyContainerEnded', function() {
            self._callExpandEvent(
                self.eventBuilder.newEvent()
                    .eventName($('h2:visible', self.element).text().trim() + ' : ' + $('.ds2-expand--copy-title:first:visible', self.element).text().trim())
                    .eventAction(self.TC.EXPAND)
                    .categoryInteraction()
                    .build(),
                self.bmwTrackOptionsBuilder.options()
                    .name(self.TC.EXPAND.toLowerCase())
                    .build());
          });

      this._super();
    }

  });
}(window, document, jQuery));