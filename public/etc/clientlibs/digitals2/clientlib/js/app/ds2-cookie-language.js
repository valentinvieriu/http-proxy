var languageredirect = false;
var ds2DataLanguage = ds2DataLanguage || undefined;

window.digitals2 = window.digitals2 || {};
window.digitals2.cookieLanguage = (function(){
  function init() {
    var self = this;

    // not be available in author mode
    if (cookiecontroller && cookiecontroller.api) {
      if (!cookiecontroller.api.isInitialized()) {
        cookiecontroller.api.registerOnInitialized(function () {
          self._afterCookieControllerInitialized();
        });
      } else {
        self._afterCookieControllerInitialized();
      }
    }
  }

  function _afterCookieControllerInitialized() {
    if (cookiecontroller.api.areBrowserCookiesEnabled()) {

      this.languageSelectionClick();

      var lang_consentCookie = cookiecontroller.api.getCookie('lang_consentCookie');
      this._languagePageRedirect(lang_consentCookie);
      this._languageCookieRedirect(lang_consentCookie);
    }
  }

  function _languagePageRedirect(cookie) {

    if(window.cookiecontroller.api.areBrowserCookiesEnabled()) {

      if(ds2DataLanguage &&
        ds2DataLanguage.languagePath &&
        !cookie) {

        languageredirect  = true;
        window.location.replace(ds2DataLanguage.languagePath);
      }
    }
  }

  /**
   * on homepage: if cookie is set and url is different to current language url redirect to language homepage
   */
  function _languageCookieRedirect(cookie) {

    if(window.cookiecontroller.api.areBrowserCookiesEnabled()) {

      if(ds2DataLanguage &&
        ds2DataLanguage.homepage == true &&
        cookie &&
        cookie != ds2DataLanguage.currLanguagePath) {

        languageredirect  = true;
        window.location.replace(cookie);
      }
    }
  }


  /*
   * set cookie by data-lang tag and redirect to href
   */
  function languageSelectionClick() {
    $(window).ready(function() {

    $('a[data-lang]').on('click', function (event) {

      event.preventDefault();
      event.stopImmediatePropagation();

      if($(this).data('lang')) {
        log('data-lang',$(this).data('lang'));

        if(!cookiecontroller.api.isInitialized()) {
          cookiecontroller.api.registerOnInitialized(function(){
            cookiecontroller.api.setCookie('lang_consentCookie', $(this).data('lang'));
          });
        } else {
          cookiecontroller.api.setCookie('lang_consentCookie', $(this).data('lang'));
        }
      }

      if($(this).data('province-page') && $(this).data('province-page') !== '') {
        window.location.href = $(this).data('province-page');
      }
      else if ($(this).attr('href').length > 1) {
        window.location.href = $(this).attr('href');
      }

      });
    });
  }

  return {
    init: init,
    _afterCookieControllerInitialized: _afterCookieControllerInitialized,
    _languagePageRedirect: _languagePageRedirect,
    _languageCookieRedirect: _languageCookieRedirect,
    languageSelectionClick: languageSelectionClick
  };
})();
window.digitals2.cookieLanguage.init();
