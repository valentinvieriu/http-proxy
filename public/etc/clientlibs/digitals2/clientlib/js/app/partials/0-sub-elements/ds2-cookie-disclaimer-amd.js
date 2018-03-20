/**
 * partial: cookie-disclaimer
 * author: ronny
 */
define('ds2-cookie-disclaimer',['use!jquery','use!log',
    'ds2-main'],function($,log){

    function CookieDisclaimer (component){
        this.$element = $(component);
        this.initTrigger();
    }

    var proto = CookieDisclaimer.prototype;

    proto.initTrigger = function(){
        this._buttonsInteractionSet();
    }

    proto._buttonsInteractionSet = function() {
            var self = this;

            $('.ds2-cookie-disclaimer-js--deny' , self.$element).on('click', function(e) {
                  e.preventDefault();
                  self._eventSend('ds2-setRegulationRejected');
            });

            $('.ds2-cookie-disclaimer-js--submit' , self.$element).on('click', function(e) {
                  e.preventDefault();
                  self._eventSend('ds2-setRegulationAccepted');
            });

            $('.ds2-cookie-disclaimer-js--close' , self.$element).on('click', function(e) {
                  e.preventDefault();
                  self._eventSend('ds2-optoutConfirmed');
                  self._eventSend('ds2-closeAll');
            });

            $('.ds2-cookie-disclaimer-js--button-close' , self.$element).on('click', function(e) {
                   e.preventDefault();
                   self._eventSend('ds2-closeAll');
            });
      }

//     custom event trigger method
    proto._eventSend = function(pEvent) {
          window.digitals2.main.$window.trigger(pEvent);
    }

    return CookieDisclaimer;

});

