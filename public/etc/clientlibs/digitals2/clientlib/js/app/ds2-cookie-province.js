window.digitals2 = window.digitals2 || {};
var ds2DataProvince = ds2DataProvince || undefined;
window.digitals2.cookieProvince = (function(){
  function init() {
    var self = this;

    if(!cookiecontroller.api.isInitialized()) {
      cookiecontroller.api.registerOnInitialized(function(){
        self._afterCookieControllerInitialized();
      });
    } else {
      self._afterCookieControllerInitialized();
    }


  }
  function _afterCookieControllerInitialized() {
    if(cookiecontroller.api.areBrowserCookiesEnabled()) {

      this.provinceSelectionClick();

      var prov_consentCookie = cookiecontroller.api.getCookie('prov_consentCookie');
      this._provincePageRedirect(prov_consentCookie);
      this._provinceCookieRedirect(prov_consentCookie);
    }
  }

  /**
   * redirect to province selection page if data province path is set
   */
  function _provincePageRedirect(cookie) {
    var listProvince;
    var listHref;

    if(window.cookiecontroller.api.areBrowserCookiesEnabled()) {
      if(ds2DataProvince &&
        (ds2DataProvince.curr_province === '' || ds2DataProvince.curr_province) &&
        !cookie &&
        (languageredirect  === false)) {
        //window.location.replace(ds2DataProvince.provincePath);
        //provinceSelection.openProvinceSelectionModal('', true, true);
      }
    } else {

      if(ds2DataProvince &&
        ds2DataProvince.provinceList) {

        listProvince = ds2DataProvince.provinceList || [];
        listHref = window.location.href.split('#/')
            .shift()
            .split('.html')
            .shift()
            .split('/')
            .pop()
            .split('.') || [];

        for( var i = 0; i<listProvince.length; i++) {
          for( var k = 0; k<listHref.length; k++) {

            if( listProvince[i] == listHref[k]) {
              return;
            }
          }
        }

        //window.location.replace(ds2DataProvince.provincePath);
        if(!cookie) {
          //provinceSelection.openProvinceSelectionModal('', true, true);
        }
      }
    }
  }

  /**
   * if cookie is set and url is different to current province url redirect to the correct province url
   */
  function _provinceCookieRedirect(cookie) {
    if(window.cookiecontroller.api.areBrowserCookiesEnabled()) {
      if( ds2DataProvince &&
        (ds2DataProvince.curr_province === '' || ds2DataProvince.curr_province)  &&
        ds2DataProvince.curr_province_path &&
        cookie &&
        cookie != ds2DataProvince.curr_province &&
        (languageredirect  === false)) {

        //window.location.replace(ds2DataProvince.curr_province_path + "." + cookie +".html");
        // provinceSelection.openProvinceSelectionModal('', true, true);
      }
    }
  }

  /*
   * set cookie by data-province tag and redirect to href
   */
  function provinceSelectionClick() {
    $(window).ready(function() {

      var ref= window.location.hash.substr(1);

      $('a[data-province]').on('click', function(event) {

        event.preventDefault();
        event.stopImmediatePropagation();

        if($(this).data('province')) {
          log('data-province',$(this).data('province'));

          if(!cookiecontroller.api.isInitialized()) {
            cookiecontroller.api.registerOnInitialized(function(){
              cookiecontroller.api.setCookie('prov_consentCookie', $(this).data('province'));
            });
          } else {
            cookiecontroller.api.setCookie('prov_consentCookie', $(this).data('province'));
          }

          if(ref.length > 1) {
            //window.location.href = ref + "." + $(this).data('province') +".html";
            provinceSelection.openProvinceSelectionModal('', true, 0);
          }
          else if($(this).attr('href').length > 1) {
            //window.location.href = $(this).attr('href');
            provinceSelection.openProvinceSelectionModal('', true, 0);
          }
        }

      });
    });
  }

  return {
    init:init,
    _afterCookieControllerInitialized:_afterCookieControllerInitialized,
    _provincePageRedirect:_provincePageRedirect,
    _provinceCookieRedirect:_provinceCookieRedirect,
    provinceSelectionClick:provinceSelectionClick
  };
})();
window.digitals2.cookieProvince.init();
