(function(window, document, $, undefined) {
  $.widget('digitals2.ds2TrackingNavigationSalesbar', $.digitals2.ds2TrackingBase, {

    _listnersInit: function() {
      var self = this;

      $('.ds2-link', this.element)
          .on('click', function() {

            var trackingOptionsName= $(this).data("tracking-options").name;
            var eventAction;

            if (trackingOptionsName === 'request_link' ||
                trackingOptionsName === 'configurator_link' ) {
              // BMWDGTLTP-2681 - Click Types used in previous taggingplans that can be removed
              //eventAction = (self.getEventAction() !== '') ? self.getEventAction() : 'Start_'+ $(this).text().trim();
            } else {
              eventAction = self.getEventAction();

              self._callExpandEvent(
                self.eventBuilder.newEvent()
                  .eventName($(this).text().trim())
                  .cause(self._isStickyWrapper() ? 'content bar' :
                    'Main Navigation')
                  .eventAction(eventAction)
                  .primaryCategory(self.TC.SUCCESS)
                  .delayed()
                  .build(),
                self.bmwTrackOptionsBuilder.options()
                  .name('start_XXX')
                  .timing(false) // fs???
                  .build());
            }


          });

      this._super();
    },

    _isStickyWrapper: function() {
      return !!$('.ds2-is-sticky-wrapper').length;
    }
  });

}(window, document, jQuery));
