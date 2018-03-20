

(function(window, document, $, undefined) {
  $.widget('digitals2.ds2TrackingFooter', $.digitals2.ds2TrackingBase, {

    _create: function() {
      return this._super();
    },

    _listnersInit: function(){
      // listen to  custom js  component triggered elements
      var self= this;

      if( $(".ds2-tooltip",self.options.$element).length){

        $(".ds2-tooltip",self.options.$element).on("click", function(e) {

          e.preventDefault();
          e.stopPropagation();

          var pEvent = self.getEvent();
          var pOptions = {};

          if($(this).data('tracking-options').name == 'language_selector_tooltip') {
            pEvent = self._createSelectionEvent(pEvent, 'Language Selection Layer', 'Show language layer');
            pOptions = self._createSelectionOptions(pOptions, 'show_language_layer', 'show_language_layer');

          } else if ($(this).data('tracking-options').name == 'province_selector_tooltip') {
            pEvent = self._createSelectionEvent(pEvent, 'Province Selection Layer', 'Show province layer');
            pOptions = self._createSelectionOptions(pOptions, 'show_province_layer', 'show_province_layer');
          }

          self._callExpandEvent(pEvent,pOptions);

        });
      }

      // dont remove !!!
      //this._super();
    },

    _createSelectionEvent: function(pEvent, eventName, eventAction) {
      pEvent.eventInfo.eventName = eventName;
      pEvent.eventInfo.eventAction = eventAction;
      pEvent.eventInfo.timeStamp = Date.now();
      pEvent.eventInfo.cause = 'click';

      return pEvent;
    },

    _createSelectionOptions: function(pOptions, name, type) {
      pOptions.name =  name;
      pOptions.type =  type;
      pOptions.useTimer = false;
      pOptions.timing = true;

      return pOptions;
    }
  });

}(window, document, jQuery));
