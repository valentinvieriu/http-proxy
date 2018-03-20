(function(window, document, $, undefined) {
  $.widget('digitals2.ds2TrackingNavigationContentBar', $.digitals2.ds2TrackingBase, {

    _listnersInit: function() {
      var self = this;

      // BMWDGTLTP-2681 - Click Types used in previous taggingplans that can be removed
      // $('.ds2-sales-button .button', this.element)
      //     .on('click', function() {
      //       var $this = $(this),
      //           isOpening = $this.parent('.ds2-sales-button').hasClass('active');
      //
      //       if (isOpening) {
      //         self._callExpandEvent(
      //             self.eventBuilder.newEvent()
      //                 .eventName($this.text().trim())
      //                 .eventAction(self.TC.OPEN_CONTACT_BUTTON)
      //                 .cause(self.TC.CONTENT_BAR)
      //                 .primaryCategoryIsInteraction()
      //                 .build(),
      //             self.bmwTrackOptionsBuilder.options()
      //                 .name(self.TC.OPEN_CONTACT_BUTTON)
      //                 .build());
      //       }
      //     });

      this._super();
    }
  });

}(window, document, jQuery));
