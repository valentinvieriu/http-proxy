/**
 * partial: cookie-disclaimer
 * author: ronny
 */


 define('ds2-cookie-consent-settings',
     ['use!jquery',
     'ds2-main'],
     function($){

        var ds2CookieConsentSettings = function(component){
            this.$element = $(component);
            this.initTrigger();
        }

        var proto = ds2CookieConsentSettings.prototype;

        proto.initTrigger = function(){
             var self = this;

//            checking if the cookie api is initialized
             if (!cookiecontroller.api.isInitialized()) {
                 cookiecontroller.api.registerOnInitialized(function() {
                  self._afterCookieControllerInitialized();
                });
              } else {
                self._afterCookieControllerInitialized();
              }
            }

        proto._afterCookieControllerInitialized = function() {
//               checking if the cookies in the browser are enabled
             if (cookiecontroller.api.areBrowserCookiesEnabled()) {
               if (cookiecontroller.api.getRegulationType() == 'OPT_IN' || cookiecontroller.api.getRegulationType() == 'OPT_OUT') {
                 this._settingActivate();
               }
             } else {
               this._settingCookiesNo();
             }
          }

        proto._settingCookiesNo = function() {
            $('.ds2-cookie-consent-settings-js--hint-deaktivated').show();
          }

        proto._settingActivate = function() {
               var self = this;

               $('.ds2-cookie-consent-settings-js--toogle').show();
               this._switchValueSet();
               this._switchInteractionSet();

               $(window).on('ds2-setRegulationAccepted ds2-setRegulationRejected', function(event) {
                 self._switchValueSet();
               });
             }

        proto._switchValueSet = function() {

            if (cookiecontroller.api.isRegulationAccepted()) {
              $('#ds2-cookie-consent-settings-js--switch', this.$element).attr('checked', true);
              $('.ds2-cookie-consent-settings-js--toogle-copy-enabled', this.$element).show();
              $('.ds2-cookie-consent-settings-js--toogle-copy-disabled', this.$element).hide();
            } else {
              $('#ds2-cookie-consent-settings-js--switch', this.$element).attr('checked', false);
              $('.ds2-cookie-consent-settings-js--toogle-copy-enabled', this.$element).hide();
              $('.ds2-cookie-consent-settings-js--toogle-copy-disabled', this.$element).show();

            }
        }

        proto._switchInteractionSet = function() {
             var self = this,
                 mouseXPos = undefined;

             $('#ds2-cookie-consent-settings-js--switch', self.$element).on('click', function() {

               if ($(this).is(':checked')) {
                 self._eventSend('ds2-setRegulationAccepted');
                 $('.ds2-cookie-consent-settings-js--hint-rejected', self.$element).hide();
               } else {
                 self._eventSend('ds2-setRegulationRejected');
                 $('.ds2-cookie-consent-settings-js--hint-rejected', self.$element).show();
               }

             })
        };

//  custom event setter
         proto._eventSend = function(pEvent) {
              window.digitals2.main.$window.trigger(pEvent);
            }

        return ds2CookieConsentSettings;
 });


