

define( 'ds2-cookie-controller',
    [
        'use!jquery',
        'use!log',
        'use!foundation',
        'use!velocity'
    ],
    function( $ ) {

        function ds2CookieController() {
            this.$window = $(window);
            this.initTrigger();

        }

        var proto = ds2CookieController.prototype;

        proto.initTrigger = function () {

            this.init();

        };

        proto.init = function() {
            var self = this;

            if(cookiecontroller.api.isInitialized()) {
                self.generellCookieBehaviorSet();
            } else {
                cookiecontroller.api.registerOnInitialized(function(){
                    self.generellCookieBehaviorSet();
                });
            }
        }

        proto.generellCookieBehaviorSet  = function() {
            var self = this,
                pShowDisclaimer = cookiecontroller.api.showDisclaimer();
            // cookiecontroller.api.switchDebugOn();
            //OPT_OUT: SET immediately the regulation accepted
            //
            if(cookiecontroller.api.areBrowserCookiesEnabled()) {
                if(cookiecontroller.api.hasRegulation()) {
                    if(cookiecontroller.api.getRegulationType() == 'OPT_OUT') {
                        if(pShowDisclaimer === true) {
                            cookiecontroller.api.setRegulationAccepted();
                        }
                    }
                }
            }
            //display Disclaimer or not
            $(window).ready(function() {
                if(cookiecontroller.api.areBrowserCookiesEnabled()) {
                    var optoutConfirmed = Boolean(cookiecontroller.api.getCookie('cc_optoutConfirmed'));
                    if(!cookiecontroller.api.hasRegulation()) {
                        //NONE: do nothing
                    } else if(cookiecontroller.api.getRegulationType() == 'OPT_IN' && pShowDisclaimer === true){
                        self.cookieOptInOpen();
                    } else if(cookiecontroller.api.getRegulationType() == 'OPT_OUT' && pShowDisclaimer === true || cookiecontroller.api.getRegulationType() == 'OPT_OUT' && optoutConfirmed !== true) {
                        self.cookieOptOutOpen();
                    }
                }
                else {
                    self.cookieErrorOpen();
                }
            });
            // consent change
            cookiecontroller.api.registerOnConsentChange(self.consentChanged);

            // events from cookie-disclaimer
            $(window).on('ds2-setRegulationAccepted ds2-setRegulationRejected ds2-closeAll ds2-optoutConfirmed', function(event) {
                switch(event.type){
                    case 'ds2-setRegulationAccepted':
                        self.setRegulationAccepted();
                        self.closeAll();
                        break;
                    case 'ds2-setRegulationRejected':
                        self.setRegulationRejected();
                        self.closeAll();
                        break;
                    case 'ds2-closeAll':
                        self.closeAll();
                        break;
                    case 'ds2-optoutConfirmed':
                        self.optoutConfirmedCookieSave();
                        break;
                    default:
                }
            });

        }

        proto.cookieContentRemove  = function() {
        }
        proto.optoutConfirmedCookieSave  = function() {
            if(cookiecontroller.api.areBrowserCookiesEnabled() && cookiecontroller.api.getRegulationType() == 'OPT_OUT') {
                cookiecontroller.api.setCookie('cc_optoutConfirmed', true);
            }
        }
        proto.cookieContentRevert = function() {
        }
        proto.cookieErrorOpen  = function() {
            $('.ds2-cookie-controller-js--no-cookies').show();
        }
        proto.cookieErrorClose  = function() {
            $('.ds2-cookie-controller-js--no-cookies').hide();
        }
        proto.cookieOptInOpen  = function() {
            $('.ds2-cookie-controller-js--opt-in')
                .velocity("slideDown", { 
                    duration: 400,
                    complete: function() {
                      $(window).trigger('opt-in-show');
                    }
                  });
        }
        proto.cookieOptInClose  = function() {
            $('.ds2-cookie-controller-js--opt-in')
                .velocity("slideUp", { 
                    duration: 400,
                    complete: function() {
                      $(window).trigger('opt-in-hide');
                    }
                });
        }
        proto.cookieOptOutOpen = function() {
            $('.ds2-cookie-controller-js--opt-out')
                .velocity("slideDown", { duration: 400, delay: 2000 });
        }
        proto.cookieOptOutClose  = function() {
            $('.ds2-cookie-controller-js--opt-out')
                .velocity("slideUp", { duration: 400 });
        }
        proto.setRegulationRejected = function() {
            cookiecontroller.api.setRegulationRejected();
        }
        proto.setRegulationAccepted = function() {
            if(cookiecontroller.api.isRegulationAccepted()===false) {
                cookiecontroller.api.setRegulationAccepted();
            }
        }
        proto.consentChanged = function() {
            log('consentChanged');
            $(window).trigger('ds2-consentChanged');
        }
        proto.closeAll = function() {
            this.cookieErrorClose();
            this.cookieOptInClose();
            this.cookieOptOutClose();
        }

        window.digitals2 = window.digitals2 || {};
        window.digitals2.cookieController = new ds2CookieController();

        return ds2CookieController;

    });

requirejs(['use!velocity','ds2-cookie-controller'], function (ds2CookieController) {

});
