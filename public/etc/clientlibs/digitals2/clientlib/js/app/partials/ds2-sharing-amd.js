define( 'ds2-sharing', [
    'use!jquery',
    'ds2-main'
], function( $ ) {

  // event cache
  var evt = {
    consentChanged:   'ds2-consentChanged'
  };

  // selector cache
  var sel = {
    iframeFallback:   '.ds2-iframe--fallback',
    facebookFallback: '.ds2-facebook-fallback',
    sharingFacebook:  '.ds2-sharing--facebook',
    sharingTwitter:   '.ds2-sharing--twitter',
    sharingGoogle:    '.ds2-sharing--google',
    sharingCopy:      '.ds2-sharing--copy',
    clipboardItem:    '.ds2-clipboard-item',
    sharingClipboard: '.ds2-sharing--clipboard',
    sharing:          '.ds2-sharing'
  };

  // css class name cache
  var cls = {
    sharingDisabled:  'ds2-sharing--disabled'
  };

  var Sharing = function(element) {
    this.$element = $(element);
    this._create();
  };

  var proto = Sharing.prototype;

  proto._create = function() {
    var self = this;

    self.fallback = $(sel.iframeFallback, self.$element);
    self.facebookFallback = $(sel.facebookFallback, self.$element);
    self.facebook = (self.$element.find(sel.sharingFacebook).length !=0 );
    self.twitter = (self.$element.find(sel.sharingTwitter).length !=0 );
    self.google = (self.$element.find(sel.sharingGoogle).length !=0 );

    $(window).on(evt.consentChanged, function(){
      if (cookiecontroller.api.isRegulationAccepted()) {
        self._privacyCheck();
      }
    });

    self._disableSharing();
    self._tryClipBoard();
    self._privacyCheck();
  },

  proto._disableSharing = function() {
    var self = this;

    self.$element.addClass(cls.sharingDisabled);
    self.fallback.addClass(cls.sharingDisabled);
    self.facebookFallback.css("display", "inline");
  },

  proto._tryClipBoard = function() {
    var self = this,
        clip = new Clipboard(sel.sharingClipboard);

    self.$element.find(sel.clipboardItem).val(window.location.href);

    clip.on('error', function(e) {
      var selection = window.getSelection;
      $(sel.sharingClipboard).html("Press Ctrl+C to copy");
    });
  },

  proto._privacyCheck = function() {
    var self = this;

    if (!cookiecontroller.api.isInitialized()) {
       cookiecontroller.api.registerOnInitialized(function() {
        self._privacyCheck();
      });
    } else {
      if (cookiecontroller.api.areBrowserCookiesEnabled()) {
        if (cookiecontroller.api.isRegulationAccepted() === true) {
          self._enableSharing();
        }
      }
       else {
        window.digitals2.messages.showCookieBrowserDisabled();
      }
    }
  },

  proto._enableSharing = function() {
     var self = this;

     self.$element.removeClass(cls.sharingDisabled);
     self.fallback.removeClass(cls.sharingDisabled);
     self.fallback.removeClass(cls.sharingClipboard);
     self.facebookFallback.css("display", "none");

     if(self.facebook) {
       self._includeFacebook();
     }
     if(self.twitter){
       self._includeTwitter();
     }
     if(self.google){
       self._includeGoogle();
     }
  },

  proto._includeFacebook = function() {
    var fbSrc = $('<div id="fb-root"></div><script>(function(d, s, id) { var js, fjs = d.getElementsByTagName(s)[0];if (d.getElementById(id)) return;js = d.createElement(s); js.id = id;js.src = "//connect.facebook.net/de_DE/sdk.js#xfbml=1&version=v2.5&appId=63095557214";fjs.parentNode.insertBefore(js, fjs);}(document, "script", "facebook-jssdk"));</script>');
    fbSrc.prependTo('body');
  },

  proto._includeTwitter = function(){
    var twtSrc = $("<script>!function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0],p=/^http:/.test(d.location)?'http':'https';if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src=p+'://platform.twitter.com/widgets.js';fjs.parentNode.insertBefore(js,fjs);}}(document, 'script', 'twitter-wjs');</script>");
    twtSrc.prependTo('body');
  },

  proto._includeGoogle = function(){
    var googleSrc = $('<script src="https://apis.google.com/js/platform.js" async defer ></script>');
    googleSrc.prependTo('body');
  }

  return Sharing;

} );
