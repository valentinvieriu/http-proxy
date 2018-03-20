define('ds2-need-analyzer-extended',
  [
    'use!jquery',
    'ds2-na-dispatcher',
    'ds2-need-analyzer-input-processor-extended',
    'use!log',
    'ds2-image-lazyLoad',
    'ds2-cookie-controller',
    'ds2-main'
  ], function ($, dispatcher, inputProcessor, log, ds2imagelazyLoad) {
    'use strict';

    function NeedAnalyzer(component) {
      this.$component = $(component);   //TODO not sure if needed

      this.options = {
        needAnalyzer: '.ds2-need-analyzer',
        needAnalyzerNav: '.ds2-need-analyzer--navigation',
        needAnalyzerNavSteps: '.ds2-need-analyzer--nav-item',
        needAnalyzerSteps: '.ds2-need-analyzer--step',
        needAnalyzerButtonArea: '.ds2-need-analyzer--button-area',
        //dom selector buttons
        // $needAnalyzerStart: $('.ds2-need-analyzer--button-start'),
        needAnalyzerBack: '.ds2-need-analyzer--button-back',
        needAnalyzerNext: '.ds2-need-analyzer--button-next',
        needAnalyzerRestart: '.ds2-need-analyzer--button-restart',
        // needAnalyzerConfigure: '.ds2-need-analyzer--button-configure',
        // needAnalyzerBuy: '.ds2-need-analyzer--button-buy',
        needAnalyzerOutbound: '.ds2-need-analyzer--button-outbound',
        needAnalyzerShare: '.ds2-na-tooltip--share-medium-down',
        needAnalyzerStepLength: undefined,
        prevStepIndex: undefined,
        initSlide: undefined,
        isInit: true,
        hashSlash: true, //potential switch # vs. #/
        //variable for further processing
        hash: undefined,
        hashSubstrValue: undefined,
        currentHref: undefined,
        urlValues: undefined,
        allStepHeights: undefined,
        isMobile: undefined,
        isTablet: undefined,
        paddingBottom: 0,
        currentStepIndex: undefined,
        windowHeight: window.innerHeight || $(window).height(),
        entryType: 'Default',
        matchType: 'No Answers'
      };

      new ds2imagelazyLoad(this.$component);
      this.initTrigger();
    }

    NeedAnalyzer.prototype.initTrigger = function () {
      //TODO split this mess up
      var self = this,
        options = self.options;

      inputProcessor.init();

      //put in option object to be addressed by all methods
      options.$element = this.element; //declared once and saved in options object for all methods
      options.urlQuestion2 = $(options.needAnalyzerSteps).eq(2).data('url');
      options.btnGroupResult = [$(options.needAnalyzerRestart), $(options.needAnalyzerOutbound), $(options.needAnalyzerShare)];
      options.initSlide = $(options.needAnalyzerSteps).eq(0).data('url');
      options.hashSubstrValue = options.hashSlash ? 2 : 1;
      options.needAnalyzerStepLength = $(options.needAnalyzerSteps).length;
      //initially launch method to get device information
      self._deviceCheck();

      $(options.needAnalyzerNavSteps).on('click', function (e) {
        e.preventDefault();

        if (!$(this).hasClass('active')) {
          self._clickHandlerNavigation(this);
        }
      });

      window.digitals2.ds2NeedAnalyzerPageTrackingQueue = [];

      //EVENTS
      //event click internal navigation buttons
      $('[data-internal]').on('click', function (e) {
        e.preventDefault();
        self._clickHandlerNavigation(this);
        this.blur();
      });
      //initial call cookie controller check

      //TODO duplicate, put this separately

      if (!cookiecontroller.api.isInitialized()) {
        cookiecontroller.api.registerOnInitialized(function () {
          self._privacyCheck();
        });
      }
      else {
        self._privacyCheck();
      }

      self._getHeightAllSteps();

      //use foundation function to avoid several shots on resize event, on resize reassure height of all steps & set need analyzer height according to current step
      $(window).on('resize', Foundation.utils.throttle(function (e) {
        //recheck window.innerHeght after resize event
        options.windowHeight = window.innerHeight || $(window).height();
        self._deviceCheck();
        self._getHeightAllSteps();
        if (options.currentStepIndex) {
          self._setHeightNeedAnalyzer(options.currentStepIndex);
        }
        // self._hideSharingTooltip();
        self._setPaddingBottom();
        self._scrollPosition();
        // self._viewportHeightRegulation();
      }, 500));
      // window.digitals2.main.$window.on('scroll', function () {
      //     self._scrollPosition();
      // });
      $(window).on('scroll', function () {
        self._scrollPosition();
      });

      //beside scroll event also initially trigger scrollPosition to make sure button area properly initialized
      self._scrollPosition();

      //these go tos should happen before the initialization, otherwise the app will be entered with other initially value, then overwritten, which does not look nice from a visual point of view and causes performance issues from a technical point of view - probably hard to fix due to loading time
      dispatcher.listen('go-to-result', function () {
        // self._changeStep(options.needAnalyzerStepLength - 1); //TODO why is step setting and hash update separate?? it's the same logic
        self._updateUrl($(options.needAnalyzerSteps).eq(options.needAnalyzerStepLength - 1).data('url'));
        self.options.entryType = 'Cookie';
      });

      dispatcher.listen('go-to-q2', function () {
        // self._changeStep(2); //TODO why is step setting and hash update separate?? it's the same logic
        self._updateUrl(options.urlQuestion2);
        self.options.entryType = 'Teaser';
      });

      dispatcher.listen('error', function (msg) {
        self._showFallback('error');
        log('error', msg);
        $(options.needAnalyzerButtonArea).addClass('ds2-need-analyzer--button-area-hide'); //TODO perhaps consider calling this elsewhere
        // $(options.needAnalyzerNav).addClass('hide');
      });

      dispatcher.listen('na-switch-headline', function (matchType) {
        self.options.matchType = matchType;
      });

      //trigger needed after height adjustments inside result step, for proper calculation
      dispatcher.listen('buttonArea', function () {
        self._scrollPosition();
      });

      dispatcher.listen('track-detail-layer-step', function (trackingInfoDetailLayer) {
        self._trackStep(trackingInfoDetailLayer);
      });

      $(options.needAnalyzerRestart).on('click', self._restartClear);

      if ((window.navigator.appName == 'Microsoft Internet Explorer') || ((window.navigator.appName == 'Netscape') && (new RegExp("Trident/.*rv:([0-9]{1,}[\.0-9]{0,})").exec(window.navigator.userAgent) != null))) {
        this.$component.addClass('ds2-need-analyzer-IE');
      }
    };

    NeedAnalyzer.prototype._privacyCheck = function () {
      var self = this;

      if (cookiecontroller.api.areBrowserCookiesEnabled() && cookiecontroller.api.isRegulationAccepted() === true) {
        self._initStepController();
        self._closeFallback();
      }
      else {
        self._showFallback('cookie');
      }
      //event to check if any change in ds2-content
      $(window).on('ds2-consentChanged ds2-setRegulationAccepted', function (event) { //TODO all events should be bound in one place
        if (cookiecontroller.api.isRegulationAccepted()) {
          self._privacyCheck();
        }
      });
    };

    NeedAnalyzer.prototype._closeFallback = function () {
      $('.ds2-need-analyzer--fallback-cookie').removeClass('active visible');
    };

    NeedAnalyzer.prototype._showFallback = function (income) {
      var self = this,
        options = self.options,
        $page = $('.ds2-need-analyzer--fallback-' + income);

      $page.addClass('active visible');

      //event listener for cookie button, if initialized
      if (income === "cookie") {
        $('.ds2-need-analyzer-cookie-disclaimer--submit').on('click', function (e) {
          e.preventDefault();
          // window.digitals2.main.$window.trigger('ds2-setRegulationAccepted');
          $(window).trigger('ds2-setRegulationAccepted');
          // $page.removeClass('active'); //not necessary since all siblings get there classes active deleted anyways
        });
      }
      //in case error occurs when another page was already active before, remove active page status - not perfect since active one would just disappear now, but it is an error anyways, so not too important
      if (!options.isInit) {
        $page.siblings().removeClass('active prev');
      }
      self._setHeightNeedAnalyzer($page);
    };

    NeedAnalyzer.prototype._initStepController = function () {
      var self = this,
        options = self.options;

      // self._getHeightAllSteps();
      self._getCurrentHash();

      if (options.hash.length === 0) { //if no hash, navigate to start
        options.hash = options.initSlide;
        self._updateUrl(options.hash);
      }
      else if (options.hash.indexOf('?') > -1) {
      } //important: do not delete this else if because it prevents the wrong navigation on init coming from Q1 teaser
      else {  //any other case, so if coming in with normal hashtag
        self._updateStep(options.hash);
        //eventually enhancement: so far does not make sure it matches any step - maybe that could be improved
      }
      self._setHashchangeEvent();
      // self._stickyButtonArea();
      //to trigger the button area showup when app is entirely scrolled up (scrollPosition method did not trigger there)
      if (parseInt($('.ds2-need-analyzer--step.active').css('height')) > $(window).height(), 10) {
        this._fixButtonArea();
      }
    };

    NeedAnalyzer.prototype._getHeightAllSteps = function () {
      var self = this,
        options = self.options,
        stepHeight;

      options.allStepHeights = [];

      for (var i = 0; i <= options.needAnalyzerStepLength - 1; i++) {
        stepHeight = $(options.needAnalyzerSteps).eq(i).outerHeight();
        //don't set height on each step, otherwise no succes on resize
        // $(options.needAnalyzerSteps).eq(i).css('height', stepHeight);
        options.allStepHeights.push(stepHeight);
      }
      return options.allStepHeights;
    };

    NeedAnalyzer.prototype._setHeightNeedAnalyzer = function (activeStepIndex) {
      var self = this,
        options = self.options;

      if (activeStepIndex < $(options.needAnalyzerSteps).length - 1) { //setting all but last steps
        $(options.needAnalyzer).css('height', options.allStepHeights[activeStepIndex]);
      }
      else if (activeStepIndex === $(options.needAnalyzerSteps).length - 1) { //setting last step
        //dispatcher not necessary if just height auto value needed, but if it turns out that proper value needs to be set, then needed
        dispatcher.post('setResultStepHeight');
      }
      else if (typeof activeStepIndex !== 'number') { //for fallback pages, where no index is in parameter
        $(options.needAnalyzer).css('height', activeStepIndex.outerHeight());
      }
      //TODO: trigger the _scrollPosition() after the height was adjusted, maybe on event ontransitonend!
      //to always have buttonArea immediately right postioned, also after step change without triggered scroll event
      self._scrollPosition(); //as long as no transition on need analyzer application height change, this repositioning can happen immediately
    };

    NeedAnalyzer.prototype._getCurrentHash = function () {
      var self = this,
        options = self.options,
        anotherHash;

      options.hash = window.location.hash.substr(options.hashSubstrValue);
      // log('hash: ', options.hash, ' - indexOf #', options.hash.indexOf('#'), ' result: ', options.hash.substr(0, options.hash.indexOf('#')));

      //edge case: when hash on hashslash, ignore, e.g. footnotes
      if (window.location.hash.substr(options.hashSubstrValue).indexOf('#') >= 0) {
        options.hash = options.hash.substr(0, options.hash.indexOf('#'));
        anotherHash = true;
      }
      else {
        options.hash = window.location.hash.substr(options.hashSubstrValue);
        anotherHash = false;
      }

      return [options.hash, anotherHash];
    };

    NeedAnalyzer.prototype._updateUrl = function (dataUrl) {
      //   var self = this,
      //       options = self.options;
      window.location.hash = '/' + dataUrl;
    };

    NeedAnalyzer.prototype._updateStep = function (dataUrl) {
      var self = this,
        options = self.options;

      for (var i = options.needAnalyzerStepLength - 1; i >= 0; i--) {
        // if url found in step data attr & this picked element is
        // definitely not the same as before (in case of wrong hash-change trigger)
        if ($(options.needAnalyzerSteps).eq(i).data('url') === dataUrl) {
          if (i !== options.prevStepIndex) {
            options.currentStepIndex = i;
            self._getHeightAllSteps();
            self._changeStep(i);
            self._stepExceptions(i);
            self._setPaddingBottom();
            // needs to happen after step exception to get the proper height of the button area
            // self._stickyButtonArea();
            self._scrollPosition();
            self._trackStep();
            options.prevStepIndex = i;
          }
          return true;
        }
      }
      // fallback (only reaching this point of function if step update before already failed:
      // in case someone enters a wrong hashtag or something accidentally went wrong and there is not match between data url and intended step: update url again to init slide and go through here again
      self._updateUrl(options.initSlide);
      return false;
    };

    NeedAnalyzer.prototype._changeStep = function (activeStepIndex) {
      var self = this,
        options = self.options;

      // if (activeStepIndex != options.prevStepIndex) {
      var $stepSelected = $(options.needAnalyzerSteps).eq(activeStepIndex);
      var $stepPrevious = $(options.needAnalyzerSteps).eq(options.prevStepIndex);
      log($stepPrevious + ' > ' + $stepSelected);

      // reset prev and active
      //$(options.needAnalyzerSteps).not($stepSelected).removeClass('active');
      // $(options.needAnalyzerSteps).not($stepPrevious).removeClass('prev');
      // set prev and active and reset/delete the classes from all siblings
      $(options.needAnalyzerSteps).removeClass('left right active');

      $stepSelected.addClass('active').siblings().removeClass('active');
      $stepPrevious.addClass('prev').siblings().removeClass('prev');

      // reset steps


      // set steps
      for (var i = options.needAnalyzerStepLength - 1; i >= 0; i--) {
        if (i > activeStepIndex) {
          $(options.needAnalyzerSteps).eq(i).addClass('right');
        }
        else if (i < activeStepIndex) {
          $(options.needAnalyzerSteps).eq(i).addClass('left');
        }
      }

      /*** EDGE CASES ***/
      // back to start screen
      if (activeStepIndex !== 0) {
        // navigation update - index -1 since first step not in step navigation, which makes step navigation index 0 == step index 1
        $(options.needAnalyzerNavSteps).eq(activeStepIndex - 1).addClass('active').siblings().removeClass('active');
      }
      self._setHeightNeedAnalyzer(activeStepIndex);
    };
    // method to feature all step exception, where to hide certain elements etc
    NeedAnalyzer.prototype._stepExceptions = function (activeStepIndex) {
      var self = this,
        options = self.options;

      // conditions to check active step conditions
      if (activeStepIndex > 0 && activeStepIndex < $(options.needAnalyzerSteps).length - 1) { //conditions for everything but start or result screen
        self._refreshButtonValues(activeStepIndex);

        // special handler for back button with exception between question 1 & 2
        if (activeStepIndex >= 2 && $(options.needAnalyzerBack).hasClass('hide')) { //conditions when question 2-4 and back button was hidden
          $(options.needAnalyzerBack).removeClass('hide');
        }
        else if (activeStepIndex < 2 && !$(options.needAnalyzerBack).hasClass('hide')) { //conditions when question 1 and back button was not hidden already
          $(options.needAnalyzerBack).addClass('hide');
        }
      }
      else if (activeStepIndex === $(options.needAnalyzerSteps).length - 1) { //conditions result screen
        for (var i = options.btnGroupResult.length - 1; i >= 0; i--) {
          options.btnGroupResult[i].removeClass('hide');
        }
        $(options.needAnalyzerBack).addClass('hide');
        $(options.needAnalyzerNext).addClass('hide');

        //no input notification check
        dispatcher.post('checkNoInputNotification', 'checkShow');

        // tracking
        $('.ds2-na-recommendations-slider').trigger('tracking:needanalyzer:product:update', {matchType: 'Perfect Match Model'});

      }
      else if (activeStepIndex === 0) { //conditions start screen, when not init (since on init markup is set accordingly by default)
        $(options.needAnalyzerButtonArea).addClass('ds2-need-analyzer--button-area-hide');
        $(options.needAnalyzerNav).addClass('hide');
        $(options.needAnalyzerNavSteps).removeClass('active');
        $(options.needAnalyzerSteps).eq(activeStepIndex).addClass('ds2-need-analyzer--zoom-animation');
      }
      // conditions to check if coming from last or first step
      if (options.prevStepIndex === 0 || (options.isInit && activeStepIndex !== 0)) { //conditions coming from first step or init not on first step
        $(options.needAnalyzerNav).removeClass('hide');
        $(options.needAnalyzerButtonArea).removeClass('ds2-need-analyzer--button-area-hide');
        $(options.needAnalyzerSteps).eq(options.prevStepIndex).removeClass('ds2-need-analyzer--zoom-animation');
      }
      else if (options.prevStepIndex === $(options.needAnalyzerSteps).length - 1) { //conditions coming from last step
        for (var i = options.btnGroupResult.length - 1; i >= 0; i--) {
          options.btnGroupResult[i].addClass('hide');
        }
        $(options.needAnalyzerNext).removeClass('hide');
        dispatcher.post('checkNoInputNotification', 'hide');
      }

      // last, if first init, declare it is over
      if (options.isInit) {
        options.isInit = false;
      }
    };

    NeedAnalyzer.prototype._refreshButtonValues = function (activeStepIndex) {
      var self = this,
        options = self.options;
      var backStep = $(options.needAnalyzerSteps).eq(activeStepIndex - 1).data('url');
      var nextStep = $(options.needAnalyzerSteps).eq(activeStepIndex + 1).data('url');

      $(options.needAnalyzerBack).data('url', backStep);
      $(options.needAnalyzerNext).data('url', nextStep);
      // log('data back: ', $(options.needAnalyzerBack).data('url'), ' , data next: ', $(options.needAnalyzerNext).data('url'));
    };
    // handle click events on elements with proper data-url
    NeedAnalyzer.prototype._clickHandlerNavigation = function (el) {
      var self = this,
        options = self.options,
        dataUrl = $(el).data('url');

      if (dataUrl) {
        self._updateUrl(dataUrl);
      }
      // self._clickHandlerNavigation - this element: ', el );
    };

    NeedAnalyzer.prototype._setHashchangeEvent = function () {
      var self = this;
      var $container = $('.ds2-page--need-analyzer');

      $(window).on('hashchange', function () { //TODO should be bound in _create
        var getCurrentHash = self._getCurrentHash();
        var hashValue = getCurrentHash[0];
        var furtherHashSet = getCurrentHash[1];

        log('getCurrentHash: ', getCurrentHash, ' - hashValue: ', hashValue, ' - anotherHash: ', furtherHashSet);

        if (!furtherHashSet) {
          if ($container.scrollTop() > 10) {
            $container.velocity("scroll", {
              duration: 400,
              offset: 0,
              easing: "ease-in-out",
              complete: function () {
                setTimeout(function () {
                  self._updateStep(hashValue);
                }, 2);
              }
            });
          }
          else {
            self._updateStep(hashValue);
          }
        }
      });
    };

    NeedAnalyzer.prototype._setPaddingBottom = function () {
      var self = this,
        options = self.options;

      options.buttonAreaHeight = $(options.needAnalyzerButtonArea).height();
      options.singleButtonHeight = $(options.needAnalyzerNext).height();

      if (options.isMobile && options.currentStepIndex >= 1) {
        $(options.needAnalyzer).css('paddingBottom', options.buttonAreaHeight + 'px');
      }
      else {
        $(options.needAnalyzer).css('paddingBottom', '0px');
      }
    };

    NeedAnalyzer.prototype._fixButtonArea = function () {
      var self = this,
        options = self.options;

      $(options.needAnalyzerButtonArea).addClass('fixed');
      $(options.needAnalyzerButtonArea).css('bottom', '-' + (options.buttonAreaHeight - options.singleButtonHeight) + 'px');
    };

    NeedAnalyzer.prototype._unfixButtonArea = function () {
      var self = this,
        options = self.options;
      $(options.needAnalyzerButtonArea).removeClass('fixed');
      $(options.needAnalyzerButtonArea).css('bottom', '0px');
    };

    NeedAnalyzer.prototype._scrollPosition = function () {
      var self = this,
        options = self.options,
        scrollTop = $(window).scrollTop(),
        componentOffset = this.$component.offset(),
        componentHeight = this.$component.outerHeight(),
        viewport = {};

      viewport.bottom = scrollTop + this.options.windowHeight;

      if (viewport.bottom <= (componentOffset.top + componentHeight + options.singleButtonHeight - options.buttonAreaHeight)) {
        this._fixButtonArea();
      }
      else {
        this._unfixButtonArea();
      }
    };

    NeedAnalyzer.prototype._deviceCheck = function () {
      var self = this,
        options = self.options;

      if (!window.digitals2.main) {
        options.isMobile = false;
        options.isTablet = false;
        return;
      }

      switch (window.digitals2.main.mediaQueryWatcherCheck()) {
        case 'ds2ResizeSmall':
          options.isMobile = true;
          options.isTablet = false;
          break;
        case 'ds2ResizeMedium':
          options.isMobile = false;
          options.isTablet = true;
          break;
        default:
          options.isMobile = false;
          options.isTablet = false;
          break;
      }
      // self._viewportRegulations();
    };

    NeedAnalyzer.prototype._trackStep = function (trackingInfoDetailLayer) {
      var self = this;
      var options = self.options;
      var currentStepIndex = trackingInfoDetailLayer ? trackingInfoDetailLayer.currentStepIndex : options.currentStepIndex;
      var prevStepIndex = options.prevStepIndex;
      var currentSlide = $(options.needAnalyzerSteps).eq(currentStepIndex);
      var prevSlide = $(options.needAnalyzerSteps).eq(prevStepIndex);
      var entryType = self.options.entryType;
      var matchType = self.options.matchType;
      var questionHistory = dispatcher.getHistoryObj('question-history');
      var prevAnswers = [];
      var isWildcards = false;
      var trackingInfos = {
        'currentSlide': currentSlide,
        'prevSlide': prevSlide,
        'prevAnswers': prevAnswers,
        'isWildcards': isWildcards,
        'entryType': entryType
      };

      if (currentSlide.attr('data-url') === 'my-perfect-match') {
        trackingInfos.matchType = matchType;
      }

      $(questionHistory).each(function () {
        this.selections.each(function () {
          if (this.checked === true) {
            var label = $(this.offsetParent).find('label').text().trim();
            prevAnswers.push(label);
          }
        });
        this.wildcards.each(function () {
          if (this.checked === true) {
            var label = $(this.offsetParent).find('label').text().trim();
            prevAnswers.push(label);
            isWildcards = true;
          }
        });
        this.ranges.each(function () {
          if (this) {
            var $element = $(this).prev().find('.ds2-na-input--rangeslider-numberoutput');
            var currency = $element.data('before');
            var label = currency + $element.text().trim(); //$(this)[0].value - if there is no currency need
            prevAnswers.push(label);
          }
        });
      });

      trackingInfos.prevAnswers = prevAnswers.toString();
      trackingInfos.isWildcards = isWildcards;
      trackingInfos.currentStepIndex = currentStepIndex;
      trackingInfos.detailLayerHeadline = trackingInfoDetailLayer ? trackingInfoDetailLayer.headline : undefined;

      // on first page load no virtual page is created because js is not initialized
      // add trackingInfos to queue --> will be checked by tracking js first
      if (window.digitals2.ds2NeedAnalyzerPageTrackingQueue) {
        window.digitals2.ds2NeedAnalyzerPageTrackingQueue.push(trackingInfos);
      }

      dispatcher.post('track-step', trackingInfos);
      dispatcher.destroyHistoryObj('question-history');
    };

    // _hideSharingTooltip: function() {
    //   $('.ds2-tooltip').qtip('hide');
    // },

    NeedAnalyzer.prototype._restartClear = function () {
      dispatcher.post('clearUserData');
    };

    return NeedAnalyzer;
  });
