(function(window, document, $, undefined) {
  $.widget('digitals2.ds2TrackingNavigation', $.digitals2.ds2TrackingBase, {

    _addCustomWidgetEventProps: function(pEventObj, interactionEvent, pEventOptions) {
      this.eventBuilder.apply().cause(pEventObj, this.TC.TEXT_LINK);
      return pEventObj;
    },

    _listnersInit: function() {
      var self = this;

      $('.ds2-navigation-main--salesbar a', this.element)
          .on('click', function(pEvent) {
            if ($(this).hasClass('ds2-active')) {
              self._callExpandEvent(
                  self.eventBuilder.newEvent()
                      .eventName($('span', this).text().trim())
                      .eventAction(self.TC.OPEN_CONTACT)
                      .cause(self.TC.MAIN_NAVIGATION)
                      .primaryCategoryIsInteraction()
                      .build(),
                  self.bmwTrackOptionsBuilder.options()
                      .openContactOptions()
                      .build());
            }
          });
      // BMWDGTLTP-2681 - Click Types used in previous taggingplans that can be removed
      // $('.ds2-navigation-main--search a', this.element)
      //     .on('click', function(pEvent) {
      //       self._callExpandEvent(
      //           self.eventBuilder.newEvent()
      //               .eventName($('span', this).text().trim())
      //               .eventAction(self.TC.OPEN_SEARCH)
      //               .cause(self.TC.MAIN_NAVIGATION)
      //               .primaryCategoryIsInteraction()
      //               .build(),
      //           self.bmwTrackOptionsBuilder.options()
      //               .openContactOptions()
      //               .build());
      //     });

      return this._super();
    }
  });
}(window, document, jQuery));
