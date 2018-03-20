window.digitals2 = window.digitals2 || {};
window.digitals2.tracking = window.digitals2.tracking || {};


/**
 * @type {{AUTOMATIC: string,
 *         CALL: string,
 *         CAUSE: string,
 *         CLICK: string,
 *         DELAYED: string,
 *         DOWNLOAD: string,
 *         EFFECT: string,
 *         EMAIL: string,
 *         ENGAGEMENT: string,
 *         ERROR: string,
 *         EVENT_ACTION: string,
 *         EVENT_NAME: string,
 *         EVENT_POINTS: string,
 *         EVENT_TYPE: string,
 *         EXPAND: string,
 *         IMPRESSION: string,
 *         INTERACTION: string,
 *         INTERNAL_CLICK: string,
 *         MILESTONE: string,
 *         MMDR: string,
 *         OPEN_HIGHLIGHT: string,
 *         OPEN_IMAGE: string,
 *         OPEN_VIDEO: string,
 *         OUTBOUND_CLICK: string,
 *         PROGRESS: string,
 *         PRIMARY_CATEGORY: string,
 *         SUB_CATEGORY: string,
 *         RELATED_COMPONENT: string,
 *         RELATED_PAGE_CATEGORY: string,
 *         RELATED_PAGE_NAME: string,
 *         SHOW_INFORMATION_LAYER: string,
 *         SHOW_MODEL_DATA: string,
 *         START_VIDEO: string,
 *         TARGET: string,
 *         TRIGGERED: string}}
 */
window.digitals2.tracking.TrackingConstants = {

  /**
   * @type {string}
   * @const
   */
  AUTOMATIC: 'automatic',

  /**
   * @type {string}
   * @const
   */
  CALL: 'call',

  /**
   * @type {string}
   * @const
   */
  CAUSE: 'cause',

  /**
   * @type {string}
   * @const
   */
  CONTENT_BAR: 'Content bar',

  /**
   * @type {string}
   * @const
   */
  CLICK: 'click',

  /**
   * @type {string}
   * @const
   */
  COPY: 'copy',

  /**
   * @type {string}
   * @const
   */
  DEFAULT: 'default',

  /**
   * @type {string}
   * @const
   */
  DELAYED: 'delayed',

  /**
   * @type {string}
   * @const
   */
  DOWNLOAD: 'download',

  /**
   * @type {string}
   * @const
   */
  EFFECT: 'effect',

  /**
   * @type {string}
   * @const
   */
  ELEMENT_VALUE_BUTTON: 'Button',

  /**
   * @type {string}
   * @const
   */
  ELEMENT_VALUE_IMAGE: 'Image',

  /**
   * @type {string}
   * @const
   */
  ELEMENT_VALUE_OTHER: 'Other',

  /**
   * @type {string}
   * @const
   */
  ELEMENT_VALUE_TEXT: 'Text',

  /**
   * @type {string}
   * @const
   */
  EMAIL: 'email',

  /**
   * @type {string}
   * @const
   */
  ENGAGEMENT: 'Engagement',

  /**
   * @type {string}
   * @const
   */
  ERROR: 'Error',

  /**
   * @type {string}
   * @const
   */
  ERROR_MESSAGE: 'Error message',

  /**
   * @type {string}
   * @const
   */
  EVENT_ACTION: 'eventAction',

  /**
   * @type {string}
   * @const
   */
  EVENT_NAME: 'eventName',

  /**
   * @type {string}
   * @const
   */
  EVENT_POINTS: 'eventPoints',

  /**
   * @type {string}
   * @const
   */
  EVENT_TYPE: 'eventType',

  /**
   * @type {string}
   * @const
   */
  EXPAND: 'Expand',

  /**
   * @type {string}
   * @const
   */
  FILTER: 'filter',


  /**
   * @type {string}
   * @const
   */
  HEADLINE: 'headline',
  /**
   * @type {string}
   * @const
   */
  SUBHEADLINE: 'subheadline',

  /**
   * @type {string}
   * @const
   */
  ICON: 'icon',

  /**
   * @type {string}
   * @const
   */
  IMAGE: 'image',

  /**
   * @type {string}
   * @const
   */
  IMPRESSION: 'Impression',

  /**
   * @type {string}
   * @const
   */
  INTERACTION: 'Interaction',


  /**
   * @type {string}
   * @const
   */

  SHARE: 'Share',


  /**
   * @type {string}
   * @const
   */
  INTERNAL_CLICK: 'internal_click',

  /**
   * @type {string}
   * @const
   */
  MAIN_NAVIGATION: 'Main navigation',

  /**
   * @type {string}
   * @const
   */
  MILESTONE: 'milestone',

  /**
   * @type {string}
   * @const
   */
  MMDR: 'mmdr',

  /**
   * @type {string}
   * @const
   */
  OPEN_CONTACT_BUTTON: 'Open contact button',

  /**
   * @type {string}
   * @const
   */
  OPEN_HIGHLIGHT: 'Open highlight',

  /**
   * @type {string}
   * @const
   */
  OPEN_IMAGE: 'Open image',

  /**
   * @type {string}
   * @const
   */
  OPEN_SEARCH: 'Open search',

  /**
   * @type {string}
   * @const
   */
  OPEN_VIDEO: 'Open video',

  /**
   * @type {string}
   * @const
   */
  OUTBOUND_CLICK: 'outbound_click',

  /**
   * @type {string}
   * @const
   */
  PROGRESS: 'progress',

  /**
   * @type {string}
   * @const
   */
  PRIMARY_CATEGORY: 'primaryCategory',

  /**
   * @type {string}
   * @const
   */
  SUB_CATEGORY: 'subCategory01',

  /**
   * @type {string}
   * @const
   */
  RELATED_COMPONENT: 'relatedPageComponent',

  /**
   * @type {string}
   * @const
   */
  RELATED_PAGE_CATEGORY: 'relatedPageCategory',

  /**
   * @type {string}
   * @const
   */
  RELATED_PAGE_NAME: 'relatedPageName',

  /**
   * @type {string}
   * @const
   */
  SHOW_INFORMATION_LAYER: 'Show information layer',

  /**
   * @type {string}
   * @const
   */
  SHOW_MODEL_DATA: 'Show model data',

  /**
   * @type {string}
   * @const
   */
  START_VIDEO: 'Start video',

  /**
   * @type {string}
   * @const
   */
  SUCCESS: 'Success',

  /**
   * @type {string}
   * @const
   */
  SWIPE: 'swipe',

  /**
   * @type {string}
   * @const
   */
  TARGET: 'target',

  /**
   * @type {string}
   * @const
   */
  TEXT_LINK: 'text link',

  /**
   * @type {string}
   * @const
   */
  PRICE: 'price',

  /**
   * @type {string}
   * @const
   */
  TRIGGERED: 'triggered',

    /**
     * @type {string}
     * @const
     */
    OTHER: 'other'
};


/**
 * @type {{DELAYED: string,
 *         ENGAGEMENT: string,
 *         ERROR: string,
 *         IMPRESSION: string,
 *         INTERACTION: string,
 *         OPEN_IMAGE: string,
 *         TRIGGERED: string,
 *         apply: Function,
 *         newEvent: Function}}
 */
window.digitals2.tracking.eventBuilder = (function(api) {

  var TC = digitals2.tracking.TrackingConstants;
  var eventInfoProperties = [
    TC.CAUSE,
    TC.EFFECT,
    TC.EVENT_ACTION,
    TC.EVENT_NAME,
    TC.EVENT_POINTS,
    TC.TARGET
  ];
  var categoryProperties = [
    TC.MMDR,
    TC.PRIMARY_CATEGORY,
    TC.SUB_CATEGORY,
    TC.EVENT_TYPE
  ];
  var attributesProperties = [
    TC.RELATED_PAGE_NAME,
    TC.RELATED_PAGE_CATEGORY,
    TC.RELATED_COMPONENT
  ];

  /**
   * Copies the given properties from source to target.
   * @param {object} source The source object.
   * @param {object} target The target object.
   * @param {array} properties The properties to be copied.
   */
  function copy(source, target, properties) {
    if (!source) {
      return;
    }

    var i = 0;
    var length = properties.length;
    var name = null;

    for (; i < length; i++) {
      name = properties[i];
      if (source[name] && '' !== source[name]) {
        target[name] = source[name];
      }
    }
  }

  /**
   * Creates an event object.
   *
   * @return {{eventInfo: {
   *             cause: string,
   *             effect: string},
   *             eventAction: string,
   *             eventName: string,
   *             eventPoints: string,
   *             target: string,
   *             timeStamp: string,
   *           category: {
   *             primaryCategory: string,
   *             mmdr: string,
   *             eventType: string},
   *           attributes: {
   *             relatedPageName: string,
   *             relatedPageCategory: string,
   *             relatedComponent: {
   *               componentInfo: string,
   *               category: string,
   *               attributes: string}}}}
   */
  function create() {
    var page = api.getPageObject(api.getCurrentPageIndex());

    return {
      eventInfo: {
        cause: '',
        effect: '',
        element: '',
        eventAction: '',
        eventName: '',
        eventPoints: '',
        target: '',
        timeStamp: Date.now().toString()
      },
      category: {
        primaryCategory: '',
        mmdr: _.has(page, 'category.mmdr') ? page.category.mmdr : '',
        eventType: TC.TRIGGERED
      },
      attributes: {
        relatedPageName: page.pageName || '',
        relatedPageCategory: page.category || {},
        relatedComponent: {
          componentInfo: {},
          category: {},
          attributes: {}
        }
      }
    };
  }

  return {

    /**
     * @return {{delayed: Function,
     *           relatedComponent: Function,
     *           relatedPageCategory: Function,
     *           relatedPageName: Function}}
     */
    apply: function() {
      return {

        /**
         * @param {object} event
         * @param {string} cause
         * @return {digitals2.tracking.eventBuilder}
         */
        cause: function(event, cause) {
          event.eventInfo.cause = cause;
          return this;
        },

        /**
         * @param {object} event
         * @return {digitals2.tracking.eventBuilder}
         */
        delayed: function(event) {
          event.category.eventType = TC.DELAYED;
          return this;
        },

        /**
         * @param {object} event
         * @param {string} eventAction
         * @return {digitals2.tracking.eventBuilder}
         */
        eventAction: function(event, eventAction) {
          event.eventInfo.eventAction = eventAction;
          return this;
        },


        /**
         * @param {object} event
         * @param {string} eventPoints
         * @return {digitals2.tracking.eventBuilder}
         */
        eventPoints: function(event, eventPoints) {
          event.eventInfo.eventPoints = eventPoints;
          return this;
        },

        /**
         * @param {object} event
         * @param {object} relatedComponent
         * @return {digitals2.tracking.eventBuilder}
         */
        relatedComponent: function(event, relatedComponent) {
          event.attributes.relatedComponent = relatedComponent;
          return this;
        },

        /**
         * @param {object} event
         * @param {string} relatedPageName
         * @return {digitals2.tracking.eventBuilder}
         */
        relatedPageName: function(event, relatedPageName) {
          event.attributes.relatedPageName = relatedPageName;
          return this;
        },

        /**
         * @param {object} event
         * @param {object} relatedPageCategory
         * @return {digitals2.tracking.eventBuilder}
         */
        relatedPageCategory: function(event, relatedPageCategory) {
          event.attributes.relatedPageCategory = relatedPageCategory;
          return this;
        }
      };
    },

    /**
     *
     * @return {{build: Function,
     *           cause: Function,
     *           categoryInteraction: Function,
     *           delayed: Function,
     *           effect: Function,
     *           eventAction: Function,
     *           eventActionIsError: Function,
     *           eventActionIsExpand: Function,
     *           eventActionIsImpression: Function,
     *           eventName: Function,
     *           eventPoints: Function,
     *           target: Function}}
     */
    newEvent: function() {
      var data = create();
      return {
        /**
         * @return {object}
         */
        build: function() {
          return data;
        },

        /**
         * @param {string} cause
         * @return {digitals2.tracking.eventBuilder}
         */
        cause: function(cause) {
          data.eventInfo.cause = cause;
          return this;
        },

        /**
         * Sets the category.primaryCategory to 'Interaction'.
         * @return {digitals2.tracking.eventBuilder}
         */
        categoryInteraction: function() {
          data.category.primaryCategory = TC.INTERACTION;
          return this;
        },

        /**
         * Sets the attributes.relatedComponentID
         * @return {digitals2.tracking.eventBuilder}
         */
        relatedComponentID: function(id) {
          data.attributes.relatedComponentID = id;
          return this;
        },

        /**
         * Sets the eventType to 'delayed'.
         * @return {digitals2.tracking.eventBuilder}
         */
        delayed: function() {
          data.category.eventType = TC.DELAYED;
          return this;
        },

        /**
         * @param {string} effect
         * @return {digitals2.tracking.eventBuilder}
         */
        effect: function(effect) {
          data.eventInfo.effect = effect;
          return this;
        },

        /**
         * @param {string} element
         * @return {digitals2.tracking.eventBuilder}
         */
        element: function(element) {
          data.eventInfo.element = element;
          return this;
        },

        /**
         * @return {digitals2.tracking.eventBuilder}
         */
        elementIsButton: function() {
          return this.element(TC.ELEMENT_VALUE_BUTTON);
        },

        /**
         * @return {digitals2.tracking.eventBuilder}
         */
        elementIsImage: function() {
          return this.element(TC.ELEMENT_VALUE_IMAGE);
        },

        /**
         * @return {digitals2.tracking.eventBuilder}
         */
        elementIsOther: function() {
          return this.element(TC.ELEMENT_VALUE_OTHER);
        },

        /**
         * @return {digitals2.tracking.eventBuilder}
         */
        elementIsText: function() {
          return this.element(TC.ELEMENT_VALUE_TEXT);
        },

        /**
         * @param {string} eventAction
         * @return {digitals2.tracking.eventBuilder}
         */
        eventAction: function(eventAction) {
          data.eventInfo.eventAction = eventAction;
          return this;
        },

        /**
         * Sets event.eventInfo.eventAction to 'Error'.
         * @return {digitals2.tracking.eventBuilder}
         */
        eventActionIsError: function() {
          return this.eventAction(TC.ERROR);
        },

        /**
         * Sets event.eventInfo.eventAction to 'Expand'.
         * @return {digitals2.tracking.eventBuilder}
         */
        eventActionIsExpand: function() {
          return this.eventAction(TC.EXPAND);
        },

        /**
         * Sets event.eventInfo.eventAction to 'Impression'.
         * @return {digitals2.tracking.eventBuilder}
         */
        eventActionIsImpression: function() {
          return this.eventAction(TC.IMPRESSION);
        },

        /**
         * @param {string} eventName
         * @return {digitals2.tracking.eventBuilder}
         */
        eventName: function(eventName) {
          data.eventInfo.eventName = eventName;
          return this;
        },

        /**
         * @param {string|number} eventPoints
         * @return {digitals2.tracking.eventBuilder}
         */
        eventPoints: function(eventPoints) {
          data.eventInfo.eventPoints = eventPoints.toString();
          return this;
        },

        /**
         * @param {object} source The source object to copy values from.
         * @return {digitals2.tracking.eventBuilder}
         */
        from: function(source) {
          if (!source) {
            return this;
          }
          copy(source.eventInfo, data.eventInfo, eventInfoProperties);
          copy(source.category, data.category, categoryProperties);
          copy(source.attributes, data.attributes, attributesProperties);
          return this;
        },

        /**
         * @param {string} mmdr
         * @return {digitals2.tracking.eventBuilder}
         */
        mmdr: function(mmdr) {
          data.category.mmdr = mmdr;
          return this;
        },

        /**
         * @param {string} search
         * @return {digitals2.tracking.eventBuilder}
         */
        onsiteSearch: function(search) {
          data.attributes.onsiteSearch = search;
          return this;
        },

        /**
         * @param {string} term
         * @return {digitals2.tracking.eventBuilder}
         */
        onsiteSearchTerm: function(term) {
          data.attributes.onsiteSearch = term;
          return this;
        },

        /**
         * @param {string} results
         * @return {digitals2.tracking.eventBuilder}
         */
        onsiteSearchResults: function(results) {
          data.attributes.onsiteSearchResults = results;
          return this;
        },

        /**
         * @param {string} type
         * @return {digitals2.tracking.eventBuilder}
         */
        onsiteSearchResultsType: function(type) {
          data.attributes.onsiteSearchResultsType = type;
          return this;
        },

        /**
         * @param {string} filters
         * @return {digitals2.tracking.eventBuilder}
         */
        onsiteSearchResultsFilters: function(filters) {
          data.attributes.onsiteSearchResultsFilters = filters;
          return this;
        },

        /**
         * @param {number} duration
         * @return {digitals2.tracking.eventBuilder}
         */
        videoLength: function(duration) {
          data.attributes.videoLength = duration;
          return this;
        },

        /**
         * @param {string} primaryCategory
         * @return {digitals2.tracking.eventBuilder}
         */
        primaryCategory: function(primaryCategory) {
          data.category.primaryCategory = primaryCategory;
          return this;
        },

        /**
         * @return {digitals2.tracking.eventBuilder}
         */
        primaryCategoryIsEngagement: function() {
          return this.primaryCategory(TC.ENGAGEMENT);
        },

        /**
         * @return {digitals2.tracking.eventBuilder}
         */
        primaryCategoryIsInteraction: function() {
          return this.primaryCategory(TC.INTERACTION);
        },

        /**
         * @param {string} target
         * @return {digitals2.tracking.eventBuilder}
         */
        target: function(target) {
          data.eventInfo.target = target;
          return this;
        }
      };
    }
  };
}(window.digitals2.tracking.api));


/**
 * @type {{options: Function}}
 */
window.digitals2.tracking.bmwTrackOptionsBuilder = (function() {

  var TC = digitals2.tracking.TrackingConstants;

  /**
   * Creates an event object.
   *
   * @return {{active: boolean,
   *           name: string,
   *           timing: boolean,
   *           type: string,
   *           useTimer: boolean}}
   */
  function create() {
    return {
      active: true,
      name: '',
      timing: true,
      type: TC.CLICK,
      useTimer: false
    };
  }

  return {

    /**
     * @type {Function}
     * @return {{active: Function,
     *           build: Function,
     *           name: Function
     *           timing: Function
     *           useTimer: Function}}
     */
    options: function() {
      var data = create();
      return {

        /**
         * @type {Function}
         * @param {boolean} active
         * @return {digitals2.tracking.bmwTrackOptionsBuilder}
         */
        active: function(active) {
          data.active = active;
          return this;
        },

        /**
         * @type {Function}
         * @return {{active: boolean,
         *           name: string,
         *           timing: boolean,
         *           type: string,
         *           useTimer: boolean}}
         */
        build: function() {
          return {
            active: data.active,
            name: data.name,
            timing: data.timing,
            type: data.type,
            useTimer: data.useTimer
          };
        },

        /**
         * @type {Function}
         * @return {{active: boolean,
         *           name: string,
         *           timing: boolean,
         *           type: string,
         *           useTimer: boolean}}
         */
        callOptions: function() {
          return this.name(TC.CALL).build();
        },

        /**
         * @type {Function}
         * @return {{active: boolean,
         *           name: string,
         *           timing: boolean,
         *           type: string,
         *           useTimer: boolean}}
         */
        downloadOptions: function() {
          return this.name(TC.DOWNLOAD).build();
        },

        /**
         * @type {Function}
         * @return {{active: boolean,
         *           name: string,
         *           timing: boolean,
         *           type: string,
         *           useTimer: boolean}}
         */
        openContactOptions: function() {
           return this.type(TC.OPEN_CONTACT_BUTTON).name(TC.OPEN_CONTACT_BUTTON);
        },

        /**
         * @type {Function}
         * @return {{active: boolean,
         *           name: string,
         *           timing: boolean,
         *           type: string,
         *           useTimer: boolean}}
         */
        openSearchOptions: function() {
           return this.type(TC.OPEN_SEARCH).name(TC.OPEN_SEARCH);
        },

        /**
         * @type {Function}
         * @return {{active: boolean,
         *           name: string,
         *           timing: boolean,
         *           type: string,
         *           useTimer: boolean}}
         */
        emailOptions: function() {
          return this.name(TC.EMAIL).build();
        },

        /**
         * @return {{active: boolean,
         *           name: string,
         *           timing: boolean,
         *           type: string,
         *           useTimer: boolean}}
         */
        expandOptions: function() {
          return this.name(TC.EXPAND);
        },

        /**
         * @type {Function}
         * @return {{active: boolean,
         *           name: string,
         *           timing: boolean,
         *           type: string,
         *           useTimer: boolean}}
         */
        impressionOptions: function() {
          return this.type(TC.IMPRESSION).name(TC.IMPRESSION);
        },

        /**
         * @type {Function}
         * @return {{active: boolean,
         *           name: string,
         *           timing: boolean,
         *           type: string,
         *           useTimer: boolean}}
         */
        showModelOptions: function() {
          return this.name(TC.SHOW_MODEL_DATA);
        },

        /**
         * @type {Function}
         * @return {{active: boolean,
         *           name: string,
         *           timing: boolean,
         *           type: string,
         *           useTimer: boolean}}
         */
        milestoneOptions: function() {
          return this.name(TC.MILESTONE).build();
        },

        /**
         * @type {Function}
         * @param {string} name
         * @return {digitals2.tracking.bmwTrackOptionsBuilder}
         */
        name: function(name) {
          data.name = (name || '').toLowerCase().replace(/\s+/g, '_');
          return this;
        },

        /**
         * @type {Function}
         * @return {{active: boolean,
         *           name: string,
         *           timing: boolean,
         *           type: string,
         *           useTimer: boolean}}
         */
        openHighlightOptions: function() {
          return this.name(TC.OPEN_HIGHLIGHT);
        },

        /**
         * @type {Function}
         * @return {{active: boolean,
         *           name: string,
         *           timing: boolean,
         *           type: string,
         *           useTimer: boolean}}
         */
        openVideoOptions: function() {
          return this.name(TC.OPEN_VIDEO);
        },

        /**
         * @type {Function}
         * @return {{active: boolean,
         *           name: string,
         *           timing: boolean,
         *           type: string,
         *           useTimer: boolean}}
         */
        openMainNavigationOptions: function() {
          return this.type(TC.MAIN_NAVIGATION).name(TC.MAIN_NAVIGATION);
        },

        /**
         * @type {Function}
         * @return {{active: boolean,
         *           name: string,
         *           timing: boolean,
         *           type: string,
         *           useTimer: boolean}}
         */
        progressOptions: function() {
          return this.name(TC.PROGRESS);
        },

        /**
         * @type {Function}
         * @return {{active: boolean,
         *           name: string,
         *           timing: boolean,
         *           type: string,
         *           useTimer: boolean}}
         */
        showInformationLayerOptions: function() {
          return this.name(TC.SHOW_INFORMATION_LAYER);
        },

        /**
         * @type {Function}
         * @param {boolean} timing
         * @return {digitals2.tracking.bmwTrackOptionsBuilder}
         */
        timing: function(timing) {
          data.timing = timing;
          return this;
        },

        /**
         * @type {Function}
         * @param {string} type
         * @return {digitals2.tracking.bmwTrackOptionsBuilder}
         */
        type: function(type) {
          data.type = type;
          return this;
        },

        /**
         * @type {Function}
         * @param {boolean} useTimer
         * @return {digitals2.tracking.bmwTrackOptionsBuilder}
         */
        useTimer: function(useTimer) {
          data.useTimer = useTimer;
          return this;
        }
      };
    }
  };
}());


/**
 *
 */
window.digitals2.tracking.eventDispatcher = (function() {

  var events = [];

  return function(componentName) {
    return {
      dispatch: function(componentInfo, trackingEvent, options) {
        events.push({
          componentInfo: componentInfo,
          componentName: componentName,
          trackingEvnet: trackingEvent,
          options: options
        });
      },

      flush: function() {
        var ret = events;
        events = [];
        return ret;
      }
    };
  };
}());

window.digitals2.tracking.TrackDecorator = (function() {
  return function(element) {

  };
}());
