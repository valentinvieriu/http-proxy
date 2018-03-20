(function(window, document, $, undefined) {

  $.widget('digitals2.ds2TrackingBase', {

    /**
     * The tracking api instance passed via options.
     *
     * @type {{addEventTracking: Function,
     *         addVirtualPage: Function,
     *         closeVirtualPage: Function,
     *         closeAllVirtualPages: Function,
     *         eventCookieSave: Function,
     *         getAllPages: Function,
     *         getCurrentPageIndex: Function,
     *         getPageObject: Function,
     *         getVersion: Function
     *         initComponentTracking: Function,
     *         initProductTracking: Function,
     *         isTrackingDisabled: Function,
     *         switchDevModeOn: Function,
     *         trackClickEvents: Function,
     *         updateComponentTracking: Function,
     *         updateProductTracking: Function,
     *         updateUser: Function }}
     */
    api: null,

    /**
     * @type {digitals2.tracking.bmwTrackOptionsBuilder}
     */
    bmwTrackOptionsBuilder: null,

    /**
     * @type {digitals2.tracking.dispatcher}
     */
    dispatcher: null,

    /**
     * @type {digitals2.tracking.eventBuilder}
     */
    eventBuilder: null,

    /**
     * @type {digitals2.tracking.TrackingConstants}
     */
    TC: null,

    /**
     * Implicit default values for the trackingOptions object.
     *
     * @type {{trackingOptions: {
     *          component: string,
     *          componentData: string,
     *          eventCause: string }}}
     */
    options: {
      trackingOptions: {
        component: '',
        eventCause: '',
        componentData: ''
      }
    },

    /**
     * The map containing the event actions mapping.
     *
     * @type {{download_link: string,
     *         video_link: string,
     *         highlight_link: string,
     *         external_link: string,
     *         page_link: string,
     *         email_link: string,
     *         request_link: string,
     *         configurator_link: string,
     *         phone_number: string,
     *         internal_click: string,
     *         outbound_click: string }}
     */
    eventActionsMapping: {
      'download_link': 'Download',
      'video_link': 'Open video',
      'highlight_link': 'Open highlight',
      'external_link': 'Outbound click',
      'page_link': 'Internal click',
      'anchor_link': 'Reach Viewport',
      //'anchor_link_extern': 'Reach Viewport',
      'anchor_link_extern': 'Outbound click',
      'email_link': 'Email',
      'configurator_link': 'Start VCO',  // ?
      'phone_number': 'Call',
      'internal_click': 'Internal click',
      'outbound_click': 'Outbound click',
      'request_link': 'Internal click',
      'iframe_button': 'IFrame button click',
      'showroom_link': 'IFrame button click',
      'accordion_element': 'Open content',
      'accordion_element_row': 'Open content',
      'technical_data': 'Selection'
    },

    /**
     * The properties of a error object returned by the tracking api.
     *
     * @type {Array.<String>}
     * @const
     * @private
     */
    errorProperties: ['errorCode', 'errorMessage', 'type'],

    /**
     * Indicates if the given object is an error object.
     *
     * @param {object} obj The object to test.
     * @return {boolean} true is the object is matches the structure of an
     *                   error, false else.
     * @private
     */
    _isError: function(obj) {
      return _.isObject(obj) && !_.difference(_.keys(obj), this.errorProperties);
    },

    /**
     * Checks if certain preconditions are met.
     *
     * @return {boolean} true if all preconditions are met, false else.
     * @private
     */
    _checkPreconditions: function() {
      var hasComponentInfo = !!this._getTrackingComponent();
      var hasComponentName = !!(_.has(this, 'options.trackingOptions.component'));
      return hasComponentInfo && hasComponentName;
    },

    /**
     * Creates an event object.
     *
     * @return {{eventInfo: {
     *              eventName: string,
     *              eventAction: string,
     *              eventPoints: string,
     *              timeStamp: string,
     *              target: string,
     *              cause: string,
     *              effect: string},
     *            category: {
     *              primaryCategory: string,
     *              mmdr: string,
     *              eventType: string},
     *            attributes: {
     *              relatedPageName: string,
     *              relatedPageCategory: string,
     *              relatedComponent: {
     *                componentInfo: string,
     *                category: string,
     *                attributes: string}}}}
     */
    getEvent: function() {
      return this.eventBuilder.newEvent().build();
    },

    select: function(selector) {
      return $(selector, this.element);
    },

    getEventAction: function() {
      var data = $(this.element).data('tracking-event');
      if (data && _.has(data, 'eventInfo.eventAction')) {
        return data.eventInfo.eventAction;
      }
      return '';
    },

    /**
     * @param {string} selector
     * @return {string} the value of eventInfo.eventName or an empty string.
     */
    getEventName: function(selector) {
      var data = this.select(selector).data('tracking-event');
      if (data && _.has(data, 'eventInfo.eventName')) {
        return data.eventInfo.eventName;
      }
      return '';
    },

    /**
     * @param {object} jQueryObject
     * @return {string} the value of category.mmdr or an empty string.
     */
    getMarketingModelRange: function(jQueryObject) {
      var data = jQueryObject.data('tracking-event');
      if (data && _.has(data, 'category.mmdr')) {
        return data.category.mmdr;
      }
      return '';
    },

    /**
     * Returns the name of 'this' component.
     *
     * @return {string} the name of 'this' component or a warning message,
     *                  if the name could not be resolved from
     *                  this.options.trackingOptions.component.
     * @private
     */
    _getComponentName: function() {
      if (_.has(this, 'options.trackingOptions.component')) {
        return this.options.trackingOptions.component;
      }
      return 'trackingOptions.component not set';
    },

    /**
     * The default constructor.
     *
     * @private
     */
    _create: function() {
      this.options.$element = this.element;
      this.api = this.options.api;
      this.dispatcher = this.options.dispatcher;
      this.eventBuilder = this.options.eventBuilder;
      this.bmwTrackOptionsBuilder = this.options.bmwTrackOptionsBuilder;
      this.TC = this.options.TC;
      if (!this._checkPreconditions()) {
        log('_create: preconditions are not met; exit;', this._getComponentName(), this._getTrackingComponent());
        return;
      }

      this.options.mappingObj = this.dispatcher.mapComponent(this.options.trackingOptions.component);
      this.options.primaryCategoryMap = this.dispatcher.primaryCategoryMap;
      this._initialize(this);
    },

    /**
     * Returns the tracking-component object from the markup.
     *
     * @return {object} The tracking-component object from the markup or null, if it is not set.
     * @private
     */
    _getTrackingComponent: function() {
      return this.options.$element.data('tracking-component');
    },

    /**
      * Returns cause in dependency from HTML-Object
      *
      *@return {string}
      *@private
      */
    _getCause: function(elm){
      var self = this;
      var cause = self.TC.TEXT_LINK;

      if(elm.is('img')){
        cause = self.TC.IMAGE;
      }else if(elm.is('h2')){
        cause = self.TC.HEADLINE;
      }else if(elm.is('div.ds2-cms-output') || elm.is('div.ds2-cms-output p')){
        cause = self.TC.COPY;
      }else if(elm.closest('.ds2-button--price') && elm.closest('.ds2-button--price').text() === elm.text() ||
        elm.find('.ds2-button--price').length){
        cause = self.TC.PRICE;
      }
      return cause;
    },

    /**
     * Registers the component.
     * @private
     */
    _register: function() {
      var pComponentData = this._getTrackingComponent();
      var obj = this.api.initComponentTracking(pComponentData, this.api.getCurrentPageIndex());

      if (this._isError(obj)) {
        log('_register: ', this.options.trackingOptions.component, obj.errorMessage, 'exit;');
        return;
      }

      this.options.trackingOptions.componentData = obj;
      if (obj) {
        this.options.$element.attr('data-tracking-index', obj.componentIndex);
      } else {
        log('- component:', this.options.trackingOptions.component);
      }
    },

    /**
     * Initialises the object when the tracking api is available.
     * @param {object} widget
     *        'this' widget.
     * @private
     */
    _initialize: function(widget) {
      widget._register();
      widget._listnersInit();
      widget._visibilityCheck();
      widget._sliderInit();
    },
    _sliderInit: function() {
      var self = this;
      var round = 1;
      $( '.ds2-slider--main:not(.ds2-slider--layer):not(.ds2-slider--sound):not(.ds2-slider--topic)', self.element ).each(function( index ) {
        var currentImg = $('.slick-active img', this);
        var eventName;
        if(!currentImg.attr('src') &&
            currentImg.data('interchange') &&
            currentImg.data('interchange').split(',')[0]) {

          eventName = currentImg.data('interchange').split(',')[0].substr(1);
        } else {
          eventName = currentImg.attr('src');
        }

        self._callExpandEvent(
          self.eventBuilder.newEvent()
              .eventName(eventName)
              .eventPoints(1)
              .eventAction(self.TC.IMPRESSION)
              .cause(self.TC.DEFAULT)
              .categoryInteraction()
              .build(),
          self.bmwTrackOptionsBuilder.options()
              .impressionOptions()
              .build());
      });

      $('.ds2-slider--main:not(.ds2-slider--sound)', self.element)
        .on('sliderChanged', function(event, trackObj) {
          if (self.TC.AUTOMATIC === trackObj.cause) {
            if (trackObj.currentSlide % trackObj.numSlides === 0) {
              round++;
            }
          }
          var eventPoints, isVideo;
          if($(this).closest('.ds2-gallery').length > 0){
            if ($('.slick-active', this).find('.ds2-slider--video-player-opener').length) {
              eventPoints = 'video-' + (trackObj.currentSlide+1);
              isVideo = true;
            } else {
              eventPoints = 'image-' + (trackObj.currentSlide+1);
              isVideo = false;
            }
          }else{
            eventPoints = (trackObj.currentSlide+1);
          }

          self._callExpandEvent(
              self.eventBuilder.newEvent()
                  .eventName(trackObj.eventName || self.getEventName('.slick-active img'))
                  .eventAction(isVideo ? self.TC.OPEN_VIDEO : self.TC.OPEN_IMAGE)
                  .eventPoints(eventPoints)
                  .cause(trackObj.cause)
                  .target(trackObj.target)
                  .effect(round)
                  .primaryCategoryIsInteraction()
                  .build(),
              self.bmwTrackOptionsBuilder.options()
                  .impressionOptions()
                  .build());
        });
    },
    /**
     * Checks the visibility of the component.
     *
     * @private
     */
    _visibilityCheck: function() {
      log('_visibilityCheck');
      var pComponentVisible = this.options.$element.is(':visible');
      var pComponentData = this._getTrackingComponent();

      // pComponentData might be null
      if (pComponentData && pComponentData.attributes &&
          (pComponentVisible !== pComponentData.attributes.visible)) {
        var pIndex = this.options.$element.data('tracking-index');
        var pObject = {attributes: {visible: pComponentVisible}};

        var ret = this.api.updateComponentTracking(pIndex, pObject, this.api.getCurrentPageIndex());
        if (this._isError(ret)) {
          log('_visibilityCheck: ', this.options.trackingOptions.component, ret.errorMessage, 'exit;');
        }
      }
    },

    _mapFilter: function(mappedOptions, dataOption) {
      log('_mapFilter', mappedOptions, dataOption);
      var trackingOptionsResult = _.cloneDeep(mappedOptions);

      for (var propertyName in mappedOptions) {
        if (dataOption[propertyName]) {
          trackingOptionsResult[propertyName] = dataOption[propertyName];
        }
      }

      return trackingOptionsResult;
    },

    _loopProp: function(obj, prop) {
      log('_loopProp', obj, prop);
      for (var propertyName in obj) {
        if (propertyName === prop && (Object.keys(obj[propertyName]).length) > 1) {
          return obj[propertyName];
        } else {
          var insideObj = obj[propertyName];
          for (var internalPropName in insideObj) {
            if (internalPropName === prop) {
              return insideObj[internalPropName];
            }
          }
        }
      }
      return {};
    },

    /**
     * Returns the primaryCategory for the given linkType parameter.
     *
     * @param {object} linkTypesMap
     *        The map containing the map[ing of link types and their respective primaryCategory.
     * @param {string} linkType
     *        The link type to get the primary category for.
     * @return {string} the value for the primary category of the given link type or an empty string, if no
     *                  primary category could be resolved..
     * @private
     */
    _getPrimaryCategoryFromMapping: function(linkTypesMap, linkType) {
      log('_getPrimaryCategoryFromMapping', linkTypesMap, linkType);
      for (var propName in linkTypesMap) {
        if (propName === linkType) {
          return linkTypesMap[linkType].primaryCategory || '';
        }
      }
      return '';
    },

    _parseDataFromEvent: function(pEventObj, pEventOptions, pEvent, isClick) {
      var pMappedEvent = this._loopProp(this.options.mappingObj, pEventOptions.name);
      var pMappedObj = this._mapFilter(pMappedEvent, pEventOptions.content);

      pEventObj = this._addEventAttributes(pEventObj);
      pEventObj = this._addCustomWidgetEventProps(pEventObj, pEvent, pEventOptions);
      if (!pEventObj.hasOwnProperty('category') || !pEventObj.category.hasOwnProperty('eventType') || pEventObj.category.eventType === undefined || pEventObj.category.eventType.length === 0) {
        pEventObj.category.eventType = this._eventTypeDecide(pMappedObj.timing);
      }

      if (isClick) {
        var primaryCategory = this._getPrimaryCategoryFromMapping(this.options.primaryCategoryMap, pEventOptions.name);
        if (primaryCategory !== '') {
          pEventObj.category.primaryCategory = primaryCategory;
        }
        if (pEventObj.category.primaryCategory === undefined) {
          pEventObj.category.primaryCategory = '';
        }

      }

      //window.digitals2.tracking.dispatcher.trackEvent(pEventObj, pMappedObj);
      window.digitals2.tracking.dispatcher.trackEvent(pEventObj, pEventOptions);
      return pMappedObj;
    },

    // just a function to extend in case you want to add additional values
    _addCustomWidgetEventProps: function(pEventObj, pEvent, pEventOptions) {
      // add some functionalities on the extended widget
      return pEventObj;
    },

    /**
     * @param {string} linkType
     * @return {string} The mapped event action.
     * @private
     */
    _mapLinkTypeToEventAction: function(linkType) {
      log('_mapLinkTypeToEventAction', linkType);
      return this.eventActionsMapping[linkType] || '';
    },

    /**
     * BMWST-4351
     * @param {string} idCurrentMenu id of the current menu
     * @param {object} currentTarget The mouse event target
     * @return {string} breadCrumbs The main menu, sub menu and current menu (where user clicked)
     * @private
     */
    _getMenuParents: function(idCurrentMenu, currentTarget){
      var breadCrumbs = [];

      if(idCurrentMenu){
        var currentMenu = $('li[data-main-id="'+idCurrentMenu+'"]').first(),
        currentMenuTitle, mainMenuChildren, mainMenuTitle;

        //get currentTarget menu - e.g Stage Presentation
        if(currentMenu) currentMenuTitle = currentMenu.find('a').first().text().trim();

        //get main menu - e.g Components Showcase
        var mainMenu = currentTarget.parents().find('.ds2-navigation-main--level-1');

        //e.g idCurrentMenu is ds2-navi-3-1-18, then mainMenuId is ds2-navi-3-1
        var mainMenuId = idCurrentMenu.substring(0, idCurrentMenu.lastIndexOf('-'));

        if(mainMenu && mainMenuId) mainMenuChildren = mainMenu.children('li[data-main-id="'+mainMenuId+'"]').first();
        if(mainMenuChildren) mainMenuTitle = mainMenuChildren.find('a').first().text().trim();

        //main navigation allows max '3 levels'
        if(!_.isUndefined(mainMenuTitle) && !_.isEmpty(mainMenuTitle)) breadCrumbs.push(mainMenuTitle); //level 1
        if(!_.isUndefined(currentMenuTitle) && !_.isEmpty(currentMenuTitle)) breadCrumbs.push(currentMenuTitle); //level 2
      }

      //currentTarget link text is always part of the breadCrumb - e.g Buttons Variant
      breadCrumbs.push(currentTarget.text().trim()); //level 3
      var breadCrumbsString = '';
      for(var i = 0; i < breadCrumbs.length; i++) {
        breadCrumbsString += breadCrumbs[i];
        if (i != breadCrumbs.length - 1) {
          breadCrumbsString += '::';
        }
      }
      //return JSON.stringify(breadCrumbs);
      return breadCrumbsString;
    },

    /**
     * @param {object} currentTarget The mouse event target
     * @return {integer || ''} eventPoints The slider index or an empty string if the index is not found
     * @private
     */
    _getEventPoints: function(currentTarget){
      var eventPoints,
          slickIndex;
      if(currentTarget){
        //if it is a stage teaser
        if(currentTarget.closest('.ds2-slider--slide').length &&
          currentTarget.closest('.ds2-slider--slide').hasClass('slick-current')) {
          slickIndex = currentTarget.closest('.ds2-slider--slide').data('slickIndex');

        //if it is a content slider
        }else if(currentTarget.closest('.ds2-content-slider--tile').length &&
                currentTarget.closest('.ds2-content-slider--tile').hasClass('slick-current') ) {
          slickIndex = currentTarget.closest('.ds2-content-slider--tile').data('slickIndex');

        //if it is in the main navigation
        }else if(currentTarget.closest('.ds2-component').hasClass('ds2-navigation-main')){

          //identifies the menu where currentTarget link belongs
          var targetMenu = currentTarget.closest('ul'),
            idCurrentMenu = targetMenu.data('link-main-id');

          //set eventPoints with the navigation breadcrumbs
          eventPoints = this._getMenuParents(idCurrentMenu, currentTarget);
        }
      }
      if(_.isNumber(slickIndex)) eventPoints = slickIndex + 1;
      return eventPoints || '';
    },

    /**
     * Populates the default event data passed.
     * @param {object} mouseEvent An event passed.
     * @param {string} paramName
     * @param {string} target
     * @param {string} eventName
     * @param {string} cause
     * @return {{eventInfo: {
     *            eventName: string,
     *            eventAction: string,
     *            eventPoints: string,
     *            timeStamp: string,
     *            target: string,
     *            cause: string,
     *            effect: string},
     *          category: {
     *            primaryCategory: string,
     *            mmdr: string,
     *            eventType: string},
     *          attributes: {
     *            relatedPageName: string,
     *            relatedPageCategory: string,
     *            relatedComponent: {
     *              componentInfo: string,
     *              category: string,
     *              attributes: string}}}}
     * @private
     */
    _populateClickEvent: function(mouseEvent, paramName, target, eventName, cause, effect) {
      var self = this,
          currentTarget = $(mouseEvent.currentTarget),
          data = currentTarget.data('tracking-event') || '',
          eventAction = self._mapLinkTypeToEventAction(paramName),
          element;

      //get the correct eventAction BMWST-4228 and BMWST-5280
      if(_.has(data, 'eventInfo.eventAction') && !_.isEmpty(data.eventInfo.eventAction)) eventAction = data.eventInfo.eventAction;
      // get the correct element on expand navigation
      if(_.has(data, 'eventInfo.element') && !_.isEmpty(data.eventInfo.element)) element = data.eventInfo.element;


        //BMWST-4750/BMWST-4350 (track clicks on slider) and BMWST-4351 (tracks wording of the link as eventPoint in main navigation)
      var eventPoints = self._getEventPoints(currentTarget);
      if ($(mouseEvent.currentTarget).hasClass('ds2-navigation-main--link')) {
        eventName = eventPoints;
      }
      return self.eventBuilder.newEvent()
          .from(data)
          .cause(cause)
          .effect(effect)
          .element(element)
          .eventName(eventName)
          .eventAction(eventAction)
          .target(target)
          .eventPoints(eventPoints)
          .build();
    },
    /**
     * Track clicks on ds2Showroom buttons
     * Used in ds2TrackingStageTeaser and ds2TrackingContentSlider - BMWST-4350
     */
    _trackOpenShowroomLayerClick: function(element){
      var self = this;

      $('.ds2-showroom-js--open-layer', element).on('click', function(clickEvent) {
        var currentTarget = $(clickEvent.currentTarget),
            trackingOptions = currentTarget.data('tracking-options'),
            showroomlayer = currentTarget.closest('.ds2-showroom').data('showroomlayer');
        //the iframe src (target) is accessible after it is 'opened'
        $('#' + showroomlayer).bind('opened', function(openEvent) {
          var target = $(openEvent.currentTarget).find('iframe').attr('src');
          self._callExpandEvent(
            self._populateClickEvent(clickEvent, trackingOptions.name, target, 'IFrame-button', currentTarget.text().trim()),
            self.bmwTrackOptionsBuilder.options()
            .build()
          );
        });
      });
    },

    /**
     * Track clicks on ds2VideoLayerLink and ds2Highlight
     * Used in ds2TrackingStageTeaser and ds2TrackingContentSlider - BMWST-4350
     */
    _trackOpenLayerClick: function(componentClass, element){
      var self = this;

      $(componentClass, element).on('click', function(mouseEvent) {
          mouseEvent.preventDefault();
          mouseEvent.stopPropagation();

          var title = $(this).text().trim(),
              currentTarget = mouseEvent.currentTarget,
              trackOptions = $(this).data('tracking-options'),
              trackEvent = $(currentTarget).data('tracking-event'),
              href = $(this).attr('href') || '',
              cause = _.has(trackEvent, 'eventInfo.cause') ? trackEvent.eventInfo.cause : '',
              target = _.has(trackEvent, 'eventInfo.target') ? trackEvent.eventInfo.target : href,
              effect = _.has(trackEvent, 'eventInfo.effect') ? trackEvent.eventInfo.effect : '',
              revealId = $(this).data('reveal-id');

          if($(this).closest('.ds2-component') && $(this).closest('.ds2-component').hasClass('ds2-highlight')){
            var highlight = $(this).closest('.ds2-component'),
                layer = highlight.data('highlightlayer'),
                trackComponent = $('#'+layer).data('tracking-component'),
                componentID;

            if(_.has(trackComponent, 'componentInfo.componentID')) componentID = trackComponent.componentInfo.componentID;
            if(!_.isUndefined(componentID)) target = componentID;
          }

          self._parseDataFromEvent(
              self._populateClickEvent(mouseEvent, trackOptions.name, target, title, cause, effect),
              trackOptions,
              mouseEvent,
              true
          );

          self.dispatcher.navCookieGetData(this);

          if (!_.isUndefined(revealId)) {
            $('#' + revealId).foundation('reveal', 'open');
          }
      });
    },

    _triggerDefaultTrackingClicks: function() {
      var self = this;

      $('.ds2-tracking-js--event', self.options.$element).on('click', function(mouseEvent) {
        self._triggerDefaultTrackingHandler($(this), mouseEvent);
      });
    },

    _manualTriggerDefaultTrackingClicks: function() {
      var self = this;
      var eventPostfix = "";
      var componentPath = this.options.$element.data('component-path');
      if (componentPath) {
        eventPostfix = componentPath;
      } else {
        eventPostfix = 'tracking';
      }
      var wholeEvenName = 'ds2-manual-click:' + eventPostfix;
      $(window).on(wholeEvenName, function(event, $element, mouseEvent) {
        self._triggerDefaultTrackingHandler($element, mouseEvent);
      });
    },

    _triggerDefaultTrackingHandler: function($clickedElement, mouseEvent) {

      var self = this,
          dataTracking,
          trackOptions,
          href = $clickedElement.attr('href') || '',
          hrefHostname = $clickedElement.prop('hostname'),
          target = $clickedElement.attr('target') || '',
          title = $clickedElement.attr('title') || '',
          hasHash = (href.indexOf('#') >= 0),
          anchor = href.split('#', 1).pop(),
          pathname = window.location.pathname,
          hostname = window.location.hostname,
          contentBarHeight = 0,
          scrollTarget;

      // if info icon is clicked inside an a tag
      if( $(mouseEvent.target).is('span') &&
          $(mouseEvent.target).parent().is('span') &&
          $(mouseEvent.target).parent().data('open-onclick')) {
        mouseEvent.stopImmediatePropagation();
        mouseEvent.preventDefault();
        return true;
      }

      if( $(mouseEvent.currentTarget).hasClass('nsc-button')) {
          return true;
      }

      // Check if triggered link Link is an anchor
      // added if link is a page link
      if ($clickedElement.data('tracking-options')) {
        trackOptions = $clickedElement.data('tracking-options');
        if (trackOptions.content) {
          if (!trackOptions.content.active) {
            return false;
          }
        }
        // href.indexOf('#') > 0: anchor
        // href.length > 3: ???
        // href.indexOf('#/') < 0: configurator link
        if (href.indexOf('#') >= 0 &&
            href.length >= 3 &&
            href.indexOf('#/') < 0) {

          if(anchor == pathname) {
            trackOptions.name = trackOptions.name || self.TC.INTERNAL_CLICK;
          } else {
            trackOptions.name = trackOptions.name || self.TC.OUTBOUND_CLICK;
          }
          trackOptions.eventInfo = trackOptions.eventInfo || {};
          trackOptions.eventInfo.element = self.TC.TEXT_LINK;

          mouseEvent.preventDefault();
          mouseEvent.stopPropagation();
          trackOptions.timing = true;
          trackOptions.useTimer = false;
          self._parseDataFromEvent(
              self._populateClickEvent(mouseEvent, trackOptions.name, href, title, 'Anchor', trackOptions.effect),
              trackOptions, mouseEvent, true);

          self.dispatcher.navCookieGetData($clickedElement);

          if('_blank' !== target && anchor != pathname){
            self._setWindowLocation(href, useTimer || '_self' === target);
          } else if ('_blank' === target && hostname !== hrefHostname) {
              window.open(href, target);
          } else {
            scrollTarget = href.split('#').pop();

            if ($('.ds2-navigation-content-bar').length) {
              contentBarHeight = -$('.ds2-navigation-content-bar').outerHeight(true);
            }

            $('#' + scrollTarget).velocity('scroll', {
              duration: 500,
              offset: contentBarHeight,
              easing: 'ease-in-out'
            });
          }

        } else {
          if (href && !hasHash ||
              href && hasHash && anchor.length > 0 ||
              href.length === 1 && hasHash) {
            mouseEvent.preventDefault();
            mouseEvent.stopPropagation();

            // removed due to BMWST-6901
            // if (href === '#') {
            //   href = '';
            // }
            if ($clickedElement.hasClass('ds2-navigation-main--link')) {
              trackEvent = $clickedElement.data('tracking-event');

              var linkTarget;
              var linkEventName;
              var linkCause;

              if (typeof trackEvent === 'object' && trackEvent.eventInfo === 'object') {
                linkTarget = trackEvent.eventInfo.target;
                linkEventName = trackEvent.eventInfo.eventName;
                linkCause = trackEvent.eventInfo.cause;
              }

              linkTarget = linkTarget || $clickedElement.attr('href');
              linkEventName = linkEventName || $clickedElement.text().trim();
              linkCause = linkCause || self._getCause($clickedElement);

              self.dispatcher.navCookieGetData($clickedElement[0]);

              var timing = self._getTimingByEventType(trackEvent);
              self._callExpandEvent(
                self._populateClickEvent(mouseEvent, self.TC.MAIN_NAVIGATION, linkTarget, linkEventName, linkCause),
                self.bmwTrackOptionsBuilder.options()
                    .openMainNavigationOptions()
                    //timing false -> eventType delayed -> event is saved in the cookies
                    .timing(timing)
                    .useTimer(false)
                    .build()
              );
            }

            if ($clickedElement.hasClass('usabilla-integrated-button')) {
                trackEvent = $clickedElement.data('tracking-event');
                var timing = self._getTimingByEventType(trackEvent);
                trackOptions = self.bmwTrackOptionsBuilder.options()
                    .name(trackEvent.eventInfo.track)
                    //timing false -> eventType delayed -> event is saved in the cookies
                    .active(trackOptions.content.active)
                    .timing(timing)
                    .useTimer(false)
                    .build()
            }

            if(title.length === 0) {
                title = $clickedElement.text().trim();
            }

            var currentTarget = mouseEvent.currentTarget;
            var data = $(currentTarget).data('tracking-event');
            var eiTarget = _.has(data, 'eventInfo.target') ? data.eventInfo.target : href;
            var eiEventName = _.has(data, 'eventInfo.eventName') ? data.eventInfo.eventName : title;
            var eiCause = _.has(data, 'eventInfo.cause') ? data.eventInfo.cause : '';
            var eiEffect = _.has(data, 'eventInfo.effect') ? data.eventInfo.effect : '';
            

            // needed for content teaser eventInfo.cause / will be set by _getCause() / not for buttons BMWST-4680
            if($(currentTarget).closest('.ds2-component').hasClass('ds2-basic-teaser') && $(currentTarget).hasClass('ds2-link')) {
                eiCause = self._getCause($(currentTarget));
            }

            dataTracking = self._parseDataFromEvent(
                self._populateClickEvent(mouseEvent, trackOptions.name, eiTarget, eiEventName, eiCause, eiEffect),
                trackOptions,
                mouseEvent,
                true);

            // for previous page tracking
            self.dispatcher.navCookieGetData($clickedElement[0]);

            var revealId = $clickedElement.data('reveal-id');

            if (!_.isUndefined(revealId)) {
              $('#' + revealId).foundation('reveal', 'open');
            } else if ($clickedElement.closest('li').hasClass('ds2-has-sublevel') &&
                      !$clickedElement.closest('ul').hasClass('ds2-navigation-main--level-3') || //WARNING: otherwise no opening of level 3 with submenues
                      $clickedElement.closest('li').hasClass('ds2-sales-button') // this prevents sales bar button from updating the window.location
              )
            {
              log('just frontend navigation click, no redirect needed');
            } else {
              var useTimer = true === dataTracking.useTimer;

              if ('download' === dataTracking.name) {
                if(('_blank' !== target) && (href !== '#')) {
                  self._setWindowLocation(href, useTimer || '_self' === target);
                }
              }

              if ('_blank' === target) {
                window.open(href, target);
              } else if (href !== '#') {
                self._setWindowLocation(href, useTimer);
              }
            }
          }
        }
      }
    },

    _getTimingByEventType: function (pEvent) {
      var timing = true;
      if (pEvent.hasOwnProperty('category') && pEvent.category.hasOwnProperty('eventType') && pEvent.category.eventType !== undefined && pEvent.category.eventType.length > 0) {
        if (pEvent.category.eventType == 'delayed') {
          timing = false;
        } else {
          timing = true;
        }
      }
      return timing;
    },

    /**
     * Sets the window.location.
     *
     * @param {string} href The new location.
     * @param {boolean} deferred if true, the opening will be delayed by 200ms.
     * @private
     */
    _setWindowLocation: function(href, deferred) {
      if (deferred) {
        setTimeout(function() {
          window.location = href;
        }, 200);
      } else {
        window.location = href;
      }
    },

    /**
     * Adds properties to the event which are accessed by the tracking api
     * or 'this' component.
     *
     * @param {object} trackingEvent The event to be modified,
     * @return {object} the origin event passed.
     * @private
     */
    _addEventAttributes: function(trackingEvent) {
      log('_addEventAttributes', trackingEvent);

      this.eventBuilder.apply()
          .relatedComponent(trackingEvent, _.cloneDeep(this._getTrackingComponent()));
      return trackingEvent;
    },

    _callExpandEvent: function(pEvent, pOptions) {
      var trackingEvent = this._addEventAttributes(pEvent);

      if (pEvent.hasOwnProperty('category') && pEvent.category.hasOwnProperty('eventType') && pEvent.category.eventType !== undefined && pEvent.category.eventType.length > 0) {
        trackingEvent.category.eventType = pEvent.category.eventType;
      } else {
        trackingEvent.category.eventType = this._eventTypeDecide(pOptions.timing);
      }

      window.digitals2.tracking.dispatcher.trackEvent(trackingEvent, pOptions);
    },

    _eventTypeDecide: function(timing) {
      var eventType;
      if (timing == false) {
        eventType = 'delayed';
      } else {
        eventType = 'triggered';
      }
      return eventType;
    },

    /**
     * initializes the event listeners.
     * @private
     */
    _listnersInit: function() {
      this._triggerDefaultTrackingClicks();
      this._manualTriggerDefaultTrackingClicks();
    }
  });
}(window, document, jQuery));
