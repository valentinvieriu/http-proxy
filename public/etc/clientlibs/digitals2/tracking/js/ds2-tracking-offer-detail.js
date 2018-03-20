(function(window, document, $, undefined) {
  $.widget('digitals2.ds2TrackingOfferDetail', $.digitals2.ds2TrackingBase, {

    /**
     * @param {object} scope 'this' object.
     * @param {object} trackObj
     * @return {string}
     */
    getHeadline: function(scope, trackObj) { // fs??? not used anymore
      return $('.ds2-accordion--title', scope.options.$element)
          .eq(trackObj.eventInfo.eventPoints - 1).text().trim();
    },

    _listnersInit: function() {
      var self = this;

      $('.ds2-accordion--element', this.element)
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
