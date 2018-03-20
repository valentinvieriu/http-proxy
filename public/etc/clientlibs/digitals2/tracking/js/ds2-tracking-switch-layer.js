

(function(window, document, $, undefined) {
  $.widget('digitals2.ds2TrackingSwitchLayer', $.digitals2.ds2TrackingBase, {

    _create: function() {

      return this._super();
    },

    _listnersInit: function(){
      // listen to  custom js  component triggered elements
      var self= this;

      if( $(".ds2-link",self.options.$element).length){

        $(".ds2-link",self.options.$element).on("click", function(e) {

          e.preventDefault();
          e.stopPropagation();

          var pEvent = self.getEvent();
          var pOptions = {};

          if($(this).data('tracking-options').name == 'language_selector_link') {
            pEvent = self._createSelectionEvent(pEvent, this, 'Change language', 'Language switch layer');

          } else if ($(this).data('tracking-options').name == 'province_selector_link'){
            pEvent = self._createSelectionEvent(pEvent, this, 'Change province', 'Province switch layer');
          }

          pOptions.useTimer = false;
          pOptions.timing = false;

          self._callExpandEvent(pEvent,pOptions);

        });
      }

      //this._super();
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
