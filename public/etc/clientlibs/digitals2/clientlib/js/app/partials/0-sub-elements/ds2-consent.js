/**
 * partial: consent
 * author: ronny
 */

(function(window, document, $, undefined) {

  $.widget('digitals2.ds2Consent', {
    options: {
    },

    _create: function() {
      var self = this;
      this.options.$element = this.element;
      self._buttonsInteractionSet();
    },

    _buttonsInteractionSet: function() {
      var self = this;
      $('.ds2-consent-js--deny' , self.options.$element).on('click', function(e) {
        event.preventDefault();
        self._eventSend('ds2-setRegulationRejected');
      });
      $('.ds2-consent-js--submit' , self.options.$element).on('click', function(e) {
        event.preventDefault();
        self._eventSend('ds2-setRegulationAccepted');
      });
      $('.ds2-consent-js--close' , self.options.$element).on('click', function(e) {
        event.preventDefault();
         self._eventSend('ds2-closeAll');
      });
      $('.ds2-consent-js--button-close' , self.options.$element).on('click', function(e) {
        event.preventDefault();
         self._eventSend('ds2-closeAll');
      });
    },
    _eventSend: function(pEvent) {
      window.digitals2.main.$window.trigger(pEvent);
    }
  });

  $(window).on('initializeComponents', function() {
    $('.ds2-consent').ds2Consent();
  });

}(window, document, jQuery));
