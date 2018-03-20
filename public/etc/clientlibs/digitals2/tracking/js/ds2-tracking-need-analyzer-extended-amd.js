define('ds2-need-analyzer-extended-tracking', ['use!jquery', 'ds2-na-dispatcher', 'ds2-cookie-controller', 'ds2-main', 'ds2-need-analyzer-algorithm-extended', 'ds2-need-analyzer-extended'], function ($, dispatcher) {
  $.widget('digitals2.ds2TrackingNeedAnalyzerExtended', $.digitals2.ds2TrackingBase, {

    _init: function () {
      var self = this;

      self.trackingInitialized = false;
    },

    /**
     * Overrides listenerInit. Implements component tracking and event
     * tracking for page links, filters and the show more button.
     * @return {None}     None
     */
    _listnersInit: function () {
      var self = this;

      self._checkPageTrackingQueue();

      dispatcher.listen('track-step', function (trackingInfos) {
        self._updatePageTracking(trackingInfos);
      });

      dispatcher.listen('error', function (message) {
        self._trackErrorMessage(message);
      });

      $('.ds2-na-recommendations-slider', self.element)
        .on('tracking:needanalyzer:product:update', function (e, trackObj) {
          var slider = $('.ds2-na-recommendations-slider', self.element);
          var $currentSlide = $('.slick-active.slick-center', slider);
          var configAdditional = $currentSlide.data('config-additional');
          var jsonObject = configAdditional ? JSON.parse(decodeURI(configAdditional)) : {};

          if (!$.isEmptyObject(jsonObject)) {
            var index = $currentSlide.data('slick-index');
            index = index || 0;
            index = index + 1;
            self._trackPerfectMatchModel(jsonObject, trackObj.matchType, index);
          }
        });

      $(self.element).on('click', '.ds2-need-analyzer--button-outbound', function (e) {
        var eventAction = 'Call to Action';
        var buttonName = $(e.currentTarget).text().trim();
        var eventName = $(e.currentTarget).closest('[data-tracking-event-name]').attr('data-tracking-event-name');
        self._trackPerfectMatchButtonClick(e, eventName, eventAction, false, false, buttonName);
      });

      $(self.element).on('click', '.ds2-na-recommendations-slider--result_arrow', function (e) {
        var eventName = 'Change model';
        var buttonName = $(e.target).closest('button').text().trim();
        self._trackPerfectMatchButtonClick(e, eventName, buttonName, false, false, "See next best match");
      });

      $(self.element).on('click', '.ds2-need-analyzer--button-restart', function (e) {
        var eventName = 'Start again';
        var buttonName = $(e.currentTarget).text().trim();
        self._trackPerfectMatchButtonClick(e, eventName, buttonName, false, false, "Restart");
      });

      // Share Links
      $('a.ds2-need-analyzer--share-link').on('click', function (e) {
        var eventName = 'Share';
        var buttonName = eventName;
        self._trackPerfectMatchButtonClick(e, eventName, buttonName, false, true, "Share");
      });

      $('body').on('click', '[data-reveal-id="ds2-na-result-detail-layer"]', function () {
        var trackingInfoDetailLayer = {
          currentStepIndex: 6,
          headline: "Configuration Details"
        };
        dispatcher.post('track-detail-layer-step', trackingInfoDetailLayer);
      });

      $('.ds2-need-analyzer--info-text').on('click', function (mouseEvent) {
        var eventName = $(mouseEvent.currentTarget).text().trim();
        self._trackOpenTooltip(mouseEvent, 'Text', eventName);
      });

      $(window).on('ds2-tooltip-icon-need-analyzer', function (e, mouseEvent) {
        var eventName = '';
        self._trackOpenTooltip(mouseEvent, 'Other', eventName);
      });

      self._initDetailLayerTracking();

      self._super();
    },


    _trackOpenTooltip: function (mouseEvent, element, eventName) {
      var self = this;

      var trackOptions = self.bmwTrackOptionsBuilder.options().build();
      var cause = '';
      var href = "";
      var active = {active:true};
      var eventPoints = '';
      var evetnAction = "Open Tooltip"


      trackOptions.content = active;
      trackOptions.name = 'open_tooltip';

      var pEvent = self._populateClickEvent(mouseEvent, trackOptions.name, href, eventName, cause);
      pEvent.eventInfo.eventPoints = eventPoints;
      pEvent.eventInfo.evetnAction = evetnAction;
      pEvent.eventInfo.element = element;

      if (digitals2.tracking.api !== undefined) {
        pEvent.attributes.relatedPageCategory = digitals2.tracking.api.getPageObject(digitals2.tracking.api.getCurrentPageIndex()).page.category;
        pEvent.attributes.relatedPageName = digitals2.tracking.api.getPageObject(digitals2.tracking.api.getCurrentPageIndex()).page.pageInfo.pageName;
      }
      pEvent.category.eventType = "triggered";

      dataTracking = self._parseDataFromEvent(pEvent, trackOptions, mouseEvent, true);
    },

    _initDetailLayerTracking: function () {
      var $selection = $('[data-reveal-id="ds2-na-result-detail-layer"]');

      $selection.each(function (elem) {
        elem.on('click', function () {
          var currentStepIndex = 6;
          dispatcher.post('track-detail-layer-step', currentStepIndex);
        });
      });
    },

    _checkPageTrackingQueue: function () {
      var self = this;

      if (window.digitals2.ds2NeedAnalyzerPageTrackingQueue) {
        $.each(window.digitals2.ds2NeedAnalyzerPageTrackingQueue, function () {
          self._updatePageTracking(this);
        });
        window.digitals2.ds2NeedAnalyzerPageTrackingQueue = null;
      }
    },

    /**
     * Slider step tracking
     * @param  {object} trackingInfos all information given by the need analyzer
     * @return {none}               none
     */
    _updatePageTracking: function (trackingInfos) {
      var self = this;
      var dataLayer = window.digitals2.tracking.Utils.defaultDataLayer();
      var pageObj = dataLayer.pages[0];
      var currentSlide = trackingInfos.currentSlide;
      var previousSlide = trackingInfos.prevSlide;
      var prevAnswers = trackingInfos.prevAnswers;
      var isWildcards = trackingInfos.isWildcards;
      var entryType = trackingInfos.entryType;
      var matchType = trackingInfos.matchType;
      var currentUrl = $(currentSlide).attr('data-url');
      var prevUrl = $(previousSlide).attr('data-url');
      var navItems = $('.ds2-need-analyzer--list-steps', self.element);
      var currentNavItem = navItems.find("[data-url='" + currentUrl + "']");
      var currentHeadline = trackingInfos.detailLayerHeadline || currentNavItem.find('.ds2-need-analyzer--step-name').text().trim();
      var currentQuestion = currentSlide.find('.ds2-need-analyzer--headline').text().trim();
      var prevQuestion = previousSlide.find('.ds2-need-analyzer--headline').text().trim();
      var trackingComponent = $(self.element).data('tracking-component');
      var componentID = trackingComponent.componentInfo.componentID;

      var optionsName = 'need_analyzer_step';
      var options = window.digitals2.tracking.bmwTrackOptionsBuilder.options();

      var pageName = currentUrl;

      switch (trackingInfos.currentStepIndex) {
        case 0:
          pageName = 'Start Page';
          break;
        case 1:
          pageName = 'Question 1';
          break;
        case 2:
          pageName = 'Question 2';
          break;
        case 3:
          pageName = 'Question 3';
          break;
        case 4:
          pageName = 'Question 4';
          break;
        case 5:
          pageName = 'My Perfect Match';
          break;
        case 6:
          pageName = 'Configuration Details';
          break;
      }
      $.extend(true, pageObj, self.api.getPageObject(digitals2.tracking.api.getCurrentPageIndex()));
      pageObj.pageInstanceId = self.api.getPageObject(0).pageInstanceId;
      pageObj.page.pageInfo.pageName = pageName;
      pageObj.page.pageInfo.timeStamp = Date.now().toString();
      pageObj.page.attributes.pageHeadline = currentHeadline;
      pageObj.page.attributes.currentQuestion = currentQuestion;
      pageObj.page.attributes.previousQuestion = prevQuestion;
      pageObj.page.attributes.previousAnswers = prevAnswers;
      pageObj.page.attributes.previousWildcards = isWildcards;
      pageObj.page.attributes.entryType = entryType;
      pageObj.page.attributes.matchType = matchType;
      pageObj.page.attributes.virtualPage = true;
      pageObj.page.attributes.relatedComponentID = componentID;

      options.name(optionsName);

      //TODO maybe we have to check wheather the pageLayer is already saved
      //and update the existing layer with the api
      self.api.addVirtualPageForContext('contextName', pageObj);
      window.digitals2.tracking.dispatcher.bmwTrack(options.build());
    },

    /**
     * Track product update
     **/
    _trackPerfectMatchModel: function (trackObj, matchType, index) {
      var self = this;
      var optionsName = 'need_analyzer_product';
      var options = window.digitals2.tracking.bmwTrackOptionsBuilder.options();

      var pIndex = $(this.element).data('tracking-index'),
        pObject = { // product tracking object
          productInfo: {
            productName: trackObj.marketingModelRange
          },
          attributes: {
            mmdr: trackObj.modelRange,
            serie: trackObj.series,
            bodyType: trackObj.bodyType,
            modelCode: trackObj.modelCode,
            yearOfLaunch: '',
            matchType: matchType, //"Perfect Match Model" | "Alternative Model"
            position: index
          }
        };

      options.name(optionsName);

      self.api.initProductTracking(pObject, self.api.getCurrentPageIndex());
      window.digitals2.tracking.dispatcher.bmwTrack(options.build());
    },

    /**
     * All Buttons, Restart Button has delayed false
     **/
    _trackPerfectMatchButtonClick: function (e, eventName, buttonName, delayed, isShareButton, cause) {
      var self = this;
      var tOptions = self.bmwTrackOptionsBuilder.options();
      var tEvent = self.eventBuilder.newEvent();
      var eventAction = delayed ? self.TC.INTERNAL_CLICK : buttonName;
      var cause = cause ? cause : buttonName;
      var target = $(e.currentTarget).attr('href');
      var eventPoints = '';
      var trackingComponent = $(self.element).data('tracking-component');
      var relatedComponentID = trackingComponent.componentInfo.componentID;

      if (target === '#' || target === undefined) {
        target = document.URL;
      }

      tEvent.eventName(eventName);
      tEvent.eventAction(eventAction);
      if (eventName === 'Change model') {
        tEvent.eventAction(eventName);
      }
      tEvent.eventPoints(eventPoints);
      tEvent.cause(cause);
      tEvent.target(target);
      tEvent.relatedComponentID(relatedComponentID);
      tEvent.primaryCategoryIsInteraction();

      if (isShareButton) {
        tEvent.effect($(e.currentTarget).attr('title'));
      }

      tOptions.name('need_analyzer_interaction');

      tOptions = tOptions.build();
      tEvent = tEvent.build();

      if (delayed) {
        self.eventBuilder.apply().delayed(tEvent);
      }

      window.digitals2.tracking.dispatcher.trackEvent(tEvent, tOptions);

      if (delayed) {
        self._setWindowLocation(target, delayed);
      }
    },

    _trackErrorMessage: function (message) {
      var self = this;

      var trackingComponent = $(self.element).data('tracking-component');
      var componentID = trackingComponent.componentInfo.componentID;

      self._callExpandEvent(
        self.eventBuilder.newEvent()
          .eventName('Technical Error')
          .eventAction('Error')
          .target('')
          .cause(message)
          .effect('page')
          .primaryCategory(this.TC.ERROR_MESSAGE)
          .relatedComponentID(componentID)
          .build(),
        self.bmwTrackOptionsBuilder.options()
          .name(this.TC.ERROR)
          .build()
      );
    }
  });
});
