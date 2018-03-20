(function(window, document, $, undefined) {
  $.widget('digitals2.ds2TrackingPreConfiguration', $.digitals2.ds2TrackingBase, {
    _listnersInit: function() {
      var self = this;

      $('.ds2-info-icon', this.element)
          .on('click', function(pEvent) {
            self._callExpandEvent(
                self.eventBuilder.newEvent()
                    .eventName($(this).data('tracking-options').name)
                    .eventAction(self.TC.SHOW_INFORMATION_LAYER)
                    .primaryCategoryIsInteraction()
                    .build(),
                self.bmwTrackOptionsBuilder.options()
                    .type(self.TC.CLICK)
                    .name(self.TC.SHOW_INFORMATION_LAYER)
                    .build());
          });

      // dont remove !!!
      this._super();
    }
  });

}(window, document, jQuery));
