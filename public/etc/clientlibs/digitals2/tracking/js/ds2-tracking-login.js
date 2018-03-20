(function(document, $, undefined) {
  $.widget('digitals2.ds2TrackingLogin', {

    _create: function() {
      this._trackLoginStatus();
    },

    _trackLoginStatus: function() {
      var dataObj = this._getPage();

      if (typeof dataObj !== 'object' || typeof dataObj.user === 'undefined') {
        return;
      }

      if (this._isLoggedIn()) {
          dataObj.user[0].segment = dataObj.user[0].segment || {};
          dataObj.user[0].segment.logged = 'yes'
          dataObj.user[0].segment.accountID = this._getUserId();
	
      } else {
          dataObj.user[0].logged = 'no';
      }
    },

    _isLoggedIn: function() {
        var gcdmToken = sessionStorage.getItem('gcdm-accessToken');
        return gcdmToken ? true : false;
    },
    
    _getUserId: function() {
        var userInfo = sessionStorage.getItem('gcdm-c-userAccount');
        if (userInfo) {
          var userInfoObj = JSON.parse(userInfo);
          var mail = userInfoObj.mail || "";
          return mail;
        }
        return "";
    },
    
    _getPage: function() {
      var number = this._getPageNumber();
      if (typeof number !== 'undefined') {
        return digitals2.tracking.api.getPageObject(number);
      } 
    },

    _getPageNumber: function () {
      if (typeof window.digitalData === 'object') {
        return window.digitals2.tracking.api.getCurrentPageIndex();
      }
    }

  });

}(document, jQuery));