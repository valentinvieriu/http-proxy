/**
 * @partial: ds2FacebookVideo
 * @author: thomas
 *
 */
define('ds2-facebook-video', [
    'use!jquery',
    'ds2-main'],
  function ($) {
    'use strict';

    var ds2FacebookVideo = function (element) {
      this.$element = $(element);

      // options
      // Attention: please use the same as in ds2-sharing.js
      // ToDo: centralize the loading fo the facebook API SDK
      this.options = {
        fbApiSrc: '//connect.facebook.net/de_DE/sdk.js',
        fbAppId: '63095557214',
        fbApiVersion: 'v2.5'
      };

      // event cache
      this.evt = {
        consentChanged: 'ds2-consentChanged'
      };

      // selector cache
      this.sel = {
        iframeContainer: '.ds2-fbv-container',
        iframeFallback: '.ds2-fbv--privacyfallback',
        $connectionFallback: '.ds2-fbv--connectionfallback'
      };

      this.init();
    };
    var proto = ds2FacebookVideo.prototype;

    /**
     * Init the component and attach the required event listeners
     */
    proto.init = function () {
      var self = this,
        options = self.options;

      self.fbVideoPlayerId = $('.fb-video', self.$element).attr('id');

      self.$privacyFallback = $(self.sel.iframeFallback, self.$element);
      self.$connectionFallback = $(self.sel.$connectionFallback, self.$element);

      /**
       * initialisation of the facebook API
       */
      self.$connectionFallback.hide();

      var accFbIFunc = window.fbAsyncInit;
      window.fbAsyncInit = function () {
        if (typeof accFbIFunc === 'function') {
          accFbIFunc();
        }
        self.$connectionFallback.hide();
        // Get Embedded Video Player API Instance
        self._getFbVideoInstance();
      };

      /**
       * check cookie controller status
       */
      self._privacyCheck();
      $(window).on(self.evt.consentChanged, function () {
        if (cookiecontroller.api.isRegulationAccepted()) {
          self._privacyCheck();
        }
      });

      /**
       * authormode refresh handler
       */
      if (window.digitals2.main.cqIsInEditMode === true) {
        var origOpen = XMLHttpRequest.prototype.open;
        XMLHttpRequest.prototype.open = function () {
          this.addEventListener('load', function () {
            // Refresh only if ajax response contains the new component content
            if (this.responseText.indexOf(self.fbVideoPlayerId) > -1) {
              self._onRefresh();
            }
          });
          origOpen.apply(this, arguments);
        };
      }
    };

    /**
     * Get the facebook video instance
     * @private
     */
    proto._getFbVideoInstance = function () {
      var self = this;

      FB.Event.subscribe('xfbml.ready', function (msg) {
        if (msg.type === 'video' && msg.id === self.fbVideoPlayerId) {
          self._bindVideoEvents(msg.instance);
        }
      });
    };

    /**
     * Load facebook video API SDK
     * @private
     */
    proto._loadFbApi = function () {
      var self = this,
        options = self.options,
        fbApiUrl = self.options.fbApiSrc + '#xfbml=1' + '&version=' + options.fbApiVersion + '&appId=' + options.fbAppId;

      self.$privacyFallback.hide();

      if ($('#facebook-jssdk').length == 0) {
        $('<script/>', {
          id: 'facebook-jssdk',
          src: fbApiUrl
        }).prependTo('body');
      }

      var waitForConnection = setTimeout(function () {
        if (typeof(FB) == 'undefined' || FB == null) {
          self.$connectionFallback.show();
        }
      }, 3000);
    };

    /**
     * Check if browser cookies are allowed or not
     * @private
     */
    proto._privacyCheck = function () {
      var self = this;

      if (!cookiecontroller.api.isInitialized()) {
        cookiecontroller.api.registerOnInitialized(function () {
          self._privacyCheck();
        });
      } else {
        if (cookiecontroller.api.areBrowserCookiesEnabled()) {
          if (cookiecontroller.api.isRegulationAccepted() === true) {
            self._loadFbApi();
          }
        }
        else {
          window.digitals2.messages.showCookieBrowserDisabled();
        }
      }
    };

    /**
     * Subscribing to facebook embedded videoplayer events for tracking
     * @private
     */
    proto._bindVideoEvents = function (playerInst) {
      var self = this,
        videoDuration = playerInst.getDuration();

      self.evt.played = false;

      self.evt.playing = playerInst.subscribe('startedPlaying', function (e) {
        if (!self.evt.played) {
          self._trackStart(playerInst);
        }
        self.evt.played = true;
      });

      self.evt.error = playerInst.subscribe('error', function (e) {
        self._trackError(playerInst);
      });
    };

    /**
     * Treatment when modify the content in author mode
     * @private
     */
    proto._onRefresh = function () {
      var self = this;

      if (typeof FB !== 'undefined') {
        setTimeout(function () {
          FB.XFBML.parse(document.body);
        }, 1000);
      }
    };

    /**
     * Creates an tracking event object
     * @returns {{eventInfo: {eventName: string, eventAction: string, eventPoints: string, timeStamp: string, target: string, cause: string, effect: string}, category: {primaryCategory: string, mmdr: string, eventType: string}, attributes: {relatedPageName: string, relatedPageCategory: string, relatedComponent: {componentInfo: string, category: string, attributes: string}}}}
     * @private
     */
    proto._getTrackingEvent = function () {
      var self = this;

      return {
        eventInfo: {
          element: '',
          eventName: '',
          eventAction: '',
          eventPoints: '',
          timeStamp: Date.now().toString(),
          target: '',
          cause: '',
          effect: ''
        },
        category: {
          mmdr: '',
          eventType: ''
        },
        attributes: {
          videoLength: '',
          relatedComponent: {
            componentInfo: '',
            category: '',
            attributes: ''
          }
        }
      };
    };

    /**
     * Trigger event for tracking start video
     * @param playerInst
     * @private
     */
    proto._trackStart = function (playerInst) {
      var self = this,
        pEvent = self._getTrackingEvent();

      // eventInfo
      pEvent.eventInfo.eventAction = 'Start video';
      pEvent.eventInfo.target = $('.fb-video', self.$element).attr('data-href');
      //eventName - Video ID (number) from FB video url
      pEvent.eventInfo.eventName = pEvent.eventInfo.target.replace(/^(.+?)\/*?$/, "$1").split('/').slice(-1)[0];

      if ($('.fb-video', self.$element).attr('data-autoplay') === "true") {
        pEvent.eventInfo.cause = 'automatic';
      } else {
        pEvent.eventInfo.cause = 'click'
      }

      // attributes
      pEvent.attributes.videoLength = playerInst.getDuration();

      self.$element.trigger('ds2-facebook-video--play', pEvent);
    };

    /**
     * Trigger event for tracking start video
     * @param playerInst
     * @private
     */
    proto._trackError = function (playerInst) {
      var self = this,
        pEvent = self._getTrackingEvent();

      // eventInfo
      pEvent.eventInfo.eventAction = 'Error';
      pEvent.eventInfo.cause = 'Could not load video';

      if (self.$element.data('tracking-options') && self.$element.data('tracking-options').name) {
        pEvent.eventInfo.eventName = self.$element.data('tracking-options').name;
      }

      // attributes
      pEvent.attributes.videoLength = playerInst.getDuration();

      self.$element.trigger('ds2-facebook-video--error', pEvent);
    };

    return ds2FacebookVideo;
  });
