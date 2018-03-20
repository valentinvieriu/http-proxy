(function(window, document, $, undefined) {
  $.widget('digitals2.ds2TrackingLanguageSelection', $.digitals2.ds2TrackingBase, {

    _getNavigationSourceID: function() {
        return this.api.getPageObject(this.api.getCurrentPageIndex()).pageInstanceId;
    },

    _listnersInit: function() {
      var self = this;

      if( $(".ds2-link",self.options.$element).length){

        $(".ds2-link",self.options.$element).on("click", function(e) {

          var pEvent = self.getEvent();
          var pOptions = {};

          if($(this).data('tracking-options').name == 'language_selector_link') {
            pEvent = self._createSelectionEvent(pEvent, this,  'Change language', 'Language switch layer');

          } else if ($(this).data('tracking-options').name == 'province_selector_link'){
            pEvent = self._createSelectionEvent(pEvent, this, 'Change province', 'Province switch layer');
          }

          pOptions.useTimer = false;
          pOptions.timing = false;

          self._callExpandEvent(pEvent,pOptions);

        });
      }

      // TODO: change handler
      $('.ds2-tracking-js--event', this.$element).on('click', function() {
        log('LanguageSelection link click');

        try {
          var navObj = {
            navigationSource: document.title,
            navigationSourceID: this._getNavigationSourceID(),
            navigationItem: $(this).text().trim(),
            navigationComponentID: 'navigationComponentID'
          };

          self._saveNavCookie(navObj);
        } catch(error) {
          log(error);
        }
      });

      // this._super();
    },

    _createSelectionEvent: function(pEvent, element, eventAction, eventPoints) {
      pEvent.eventInfo.eventName = $(element).text().trim();
      pEvent.eventInfo.eventAction = eventAction;
      pEvent.eventInfo.eventPoints = eventPoints;
      pEvent.eventInfo.effect = $(element).text().trim();

      pEvent.eventInfo.timeStamp = Date.now();
      pEvent.eventInfo.target = $(element).attr('href');
      pEvent.eventInfo.cause = 'text link';

      return pEvent;
    }

  });



}(window, document, jQuery));
