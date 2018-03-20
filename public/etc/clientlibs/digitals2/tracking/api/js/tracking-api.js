/*global mini, digitals2, CryptoJS, JSON */

/**
 * @fileOverview Provides utility functions for page, component,
 * event and user tracking
 *
 * Changes in 0.7.6p:
 * - BMWST-3701: making event length of event array configurable. dev mode
 *   will still contain all elements written.
 *
 * Changes in 0.7.5p:
 * - eventCookiePutInDatalayer: extend page.attributes object instead
 *   of overwriting the cookie (fixes re-opened BMWST-3495)
 *
 * Changes in 0.7.4p:
 * - eventCookiePutInDatalayer: reset page.attributes if no data should
 *   be saved from previous page (fixes BMWST-3495)
 *
 * Changes in 0.7.3p:
 * - eventCookieSave: save event cookie from internal link for target page
 * - eventCookiePutInDatalayer: load event cookie from internal link on
 *   target page
 *
 * @version 0.7.6.2p
 */
window.digitals2 = window.digitals2 || {};
window.digitals2.$ = $;
window.digitals2.tracking = window.digitals2.tracking || {};

/**
 * Public available constants.
 * @namespace digitals2.tracking
 * @since 0.7.4p
 */
window.digitals2.tracking.Constants = {
  API_INITIALIZED: 'digitals2:tracking:api:initialized',
  RELEASE_VERSION: '4.1.11',
  API_VERSION: '0.8.0'
};

window.digitals2.tracking.loggerForCategory = (function () {

  var C = window.digitals2.tracking.Constants;
  var version = C.API_VERSION;
  var stackTrace = [];
  var loggingEnabled = false;
  var slice = Array.prototype.slice;
  var maxLength = 300;
  var loggers = {};

  function toConsole(logEntry) {
    if (logEntry.logLevel && console) {
      if (console[logEntry.logLevel]) {
        console[logEntry.logLevel].apply(console, logEntry.args);
      } else if (console.log)
        console.log.apply(console, logEntry.args);
    }
  }

  function decorator(logLevel, category, args) {
    var item = {
      logLevel: logLevel,
      category: category,
      args: args
    };
    stackTrace[stackTrace.length] = item;
    if (loggingEnabled) {
      toConsole(item);
    }

    if (stackTrace.length > maxLength) {
      stackTrace.shift();
    }
  }

  function toArgs(category, args) {
    return [['[', new Date(), category, version, ']'].join(' '), args];
  }

  return function (category) {
    return loggers[category] || (loggers[category] = {
      debug: function () {
        decorator('debug', category, toArgs(category, slice.call(arguments)));
      },

      error: function () {
        decorator('error', category, toArgs(category, slice.call(arguments)));
      },

      info: function () {
        decorator('info', category, toArgs(category, slice.call(arguments)));
      },

      log: function () {
        decorator('log', category, toArgs(category, slice.call(arguments)));
      },

      warn: function () {
        decorator('warn', category, toArgs(category, slice.call(arguments)));
      },

      printAll: function (enabled) {
        loggingEnabled = !!enabled;
        var length = stackTrace.length;
        for (var i = 0; i < length; i++) {
          toConsole(stackTrace[i]);
        }
      },

      printLast: function (enabled) {
        loggingEnabled = !!enabled;
        toConsole(stackTrace[stackTrace.length - 1]);
      },

      flush: function (enabled) {
        this.printAll(!!enabled);
        stackTrace = [];
      }
    });
  };
}());

window.digitals2.tracking.Utils = {
  defaultDataLayer: function () {
    return {
      version: '1.0',
      activePageIndex: 0,
      pages: [{
        pageInstanceId: document.location.href,
        component: [],
        event: [],
        product: [],
        page: {
          pageInfo: {
            pageName: document.location.href.split('/').pop(),
            pageTitle: document.title,
            sysEnv: '',
            envWork: '',
            version: 1.0,
            geoRegion: '',
            language: ''
          },
          category: {
            pageType: 'page',
            primaryPurpose: '',
            primaryCategory: '',
            subCategory01: ''
          },
          attributes: {
            template: '',
            virtualPage: false
          }
        },
        user: [{profileInfo: {}}]
      }]
    }
  }
};

/**
 *
 * @type {{hookTypes,
 *        fields,
 *        set,
 *        setAnonymized,
 *        newCategoryObj,
 *        getPageType,
 *        setPageType,
 *        getPrimaryCategory,
 *        setPrimaryCategory,
 *        getPrimaryPurpose,
 *        setPrimaryPurpose,
 *        getSubCategory01,
 *        setSubCategory01,
 *        getNavigationSource,
 *        setNavigationSource,
 *        getPageResponsiveType,
 *        setPageResponsiveType,
 *        getTemplate,
 *        setTemplate,
 *        getVirtualPage,
 *        setVirtualPage,
 *        getYearOfLaunch,
 *        setYearOfLaunch,
 *        getDestinationUrl,
 *        setDestinationUrl,
 *        getEnvWork,
 *        setEnvWork,
 *        getGeoRegion,
 *        setGeoRegion,
 *        getLanguage,
 *        setLanguage,
 *        getPageId,
 *        setPageId,
 *        getPageName,
 *        setPageName,
 *        getPagetitle,
 *        setPagetitle,
 *        getReferringUrl,
 *        setReferringUrl,
 *        getSysEnv,
 *        setSysEnv,
 *        getVersion,
 *        setVersion,
 *        userdata,
 *        setCommitHooks}}
 */
window.digitals2.tracking.pageHelper = (function () {

  var fields = {
      NAVIGATION_SOURCE: 'page.attributes.navigationSource',
      PAGE_RESPONSIVE_TYPE: 'page.attributes.pageResponsiveType',
      TEMPLATE: 'page.attributes.template',
      VIRTUAL_PAGE: 'page.attributes.virtualPage',
      YEAR_OF_LAUNCH: 'page.attributes.yearOfLaunch',
      PAGE_TYPE: 'page.category.pageType',
      PRIMARY_CATEGORY: 'page.category.primaryCategory',
      PRIMARY_PURPOSE: 'page.category.primaryPurpose',
      SUB_CATEGORY_01: 'page.category.subCategory01',
      DESTINATION_URL: 'page.pageInfo.destinationUrl',
      ENV_WORK: 'page.pageInfo.envWork',
      GEO_REGION: 'page.pageInfo.geoRegion',
      LANGUAGE: 'page.pageInfo.language',
      PAGE_ID: 'page.pageInfo.pageID',
      PAGE_NAME: 'page.pageInfo.pageName',
      PAGE_TITLE: 'page.pageInfo.pageTitle',
      REFERRING_URL: 'page.pageInfo.referringUrl',
      SYS_ENV: 'page.pageInfo.sysEnv',
      VERSION: 'page.pageInfo.version'
    },
    userFields = {
      SEGMENT_LOGGED: 'user[0].segment.logged',
      SEGMENT_INTERNAL: 'user[0].segment.internal',
      POSTAL_CODE: 'user[0].segment.userSelectedPostalCode',
      CITY: 'user[0].segment.userSelectedCity',
      COUNTRY: 'user[0].segment.userSelectedCountry',
      GENDER: 'user[0].segment.userSelectedGender',
      TITLE: 'user[0].segment.userSelectedTitle',
      YEAR_OF_BIRTH: 'user[0].segment.userSelectedYearofBirth',
      ADDRESS_TYPE: 'user[0].segment.userSelectedAddressType',
      CURRENT_VEHICLE: 'user[0].segment.userSelectedCurrentVehicle',
      NEXT_PLANNED_PURCHASE: 'user[0].segment.userSelectedNextPlannedPurchase',
      PREFERRED_DATE: 'user[0].segment.userSelectedPreferredDate',
      INTERESTS: 'user[0].segment.userSelectedInterests',
      PREFERRED_CONTACT_METHOD: 'user[0].segment.userSelectedPreferredContactMethod',
      FIRST_NAME: 'user[0].segment.userSelectedFirstName',
      LAST_NAME: 'user[0].segment.userSelectedLastName',
      ADDRESS: 'user[0].segment.userSelectedAddress',
      PHONE: 'user[0].segment.userSelectedPhoneNumber',
      EMAIL: 'user[0].segment.userSelectedMailAddress',
      VIN: 'user[0].segment.userSelectedVIN'
    },
    hookTypes = {
      FAILED_COMMIT: 'failed::commit',
      PRE_COMMIT: 'pre::commit',
      POST_COMMIT: 'post::commit'
    },
    commitHooks = {};

  function hasConstraintsOnField(field) {
    var pre = commitHooks[hookTypes.PRE_COMMIT] || {};
    var preCommitHook = pre[field] || pre['any'];
    var post = commitHooks[hookTypes.POST_COMMIT] || {};
    var postCommitHook = post[field] || post['any'];
    var failed = commitHooks[hookTypes.FAILED_COMMIT] || {};
    var failedCommitHook = failed[field] || failed['any'];
    return preCommitHook || postCommitHook || failedCommitHook;
  }

  function constraintBasedCommit(pageObj, field, value) {
    var valid = true;
    var pre = commitHooks[hookTypes.PRE_COMMIT] || {};
    var preCommitHook = pre[field] || pre['any'];
    var post = commitHooks[hookTypes.POST_COMMIT] || {};
    var postCommitHook = post[field] || post['any'];
    var failed = commitHooks[hookTypes.FAILED_COMMIT] || {};
    var failedCommitHook = failed[field] || failed['any'];

    if (_.isFunction(preCommitHook)) {
      valid = false !== preCommitHook.call(this, pageObj, field, value);
    }
    if (valid) {
      _.set(pageObj, field, value);
      postCommitHook.call(this, pageObj, field, value);
    } else {
      if (!failedCommitHook && window.console && window.console.error) {
        window.console.error.call(window.console, "Could not set value for field '" + field + "'");
      } else {
        failedCommitHook.call(this, pageObj, field, value);
      }
    }
  }

  function toString(value) {
    return (value || '').toString();
  }

  function set(pageObj, field, value) {
    if (hasConstraintsOnField(field)) {
      constraintBasedCommit(pageObj, field, toString(value));
    } else {
      _.set(pageObj, field, toString(value));
    }
    return this;
  }

  function setAnonymized(pageObj, field, value) {
    if (hasConstraintsOnField(field)) {
      constraintBasedCommit(pageObj, field, anonymize(toString(value)));
    } else {
      _.set(pageObj, field, anonymize(toString(value)));
    }
    return this;
  }

  function setCommitHooks(value) {
    commitHooks = (value || {});
  }

  function anonymize(value) {
    return !!value && !!value.length ? 'filled' : 'empty';
  }

  //------------------------------------
  //                page.pageInfo
  //------------------------------------

  function getNavigationSource(pageObj) {
    return _.get(pageObj, fields.PAGE_TYPE);
  }

  function setNavigationSource(pageObj, value) {
    return set.call(this, pageObj, fields.PAGE_TYPE, value);
  }

  function getPageResponsiveType(pageObj) {
    return _.get(pageObj, fields.PAGE_RESPONSIVE_TYPE);
  }

  function setPageResponsiveType(pageObj, value) {
    return set.call(this, pageObj, fields.PAGE_RESPONSIVE_TYPE, value);
  }

  function getTemplate(pageObj) {
    return _.get(pageObj, fields.TEMPLATE);
  }

  function setTemplate(pageObj, value) {
    return set.call(this, pageObj, fields.TEMPLATE, value);
  }

  function getVirtualPage(pageObj) {
    return _.get(pageObj, fields.VIRTUAL_PAGE);
  }

  function setVirtualPage(pageObj, value) {
    return set.call(this, pageObj, fields.VIRTUAL_PAGE, value);
  }

  function getYearOfLaunch(pageObj) {
    return _.get(pageObj, fields.YEAR_OF_LAUNCH);
  }

  function setYearOfLaunch(pageObj, value) {
    return set.call(this, pageObj, fields.YEAR_OF_LAUNCH, value);
  }

  //------------------------------------
  //                page.category
  //------------------------------------

  function newCategoryObj(pageObj) {
    _.set(pageObj, 'page.category', {});
    return this;
  }

  function getPageType(pageObj) {
    return set.call(this, pageObj, fields.PAGE_TYPE);
  }

  function setPageType(pageObj, value) {
    return set.call(this, pageObj, fields.PAGE_TYPE, value);
  }

  function getPrimaryCategory(pageObj) {
    return _.get(pageObj, fields.PRIMARY_CATEGORY);
  }

  function setPrimaryCategory(pageObj, value) {
    return set.call(this, pageObj, fields.PRIMARY_CATEGORY, value);
  }

  function getPrimaryPurpose(pageObj) {
    return set.call(this, pageObj, fields.PRIMARY_PURPOSE);
  }

  function setPrimaryPurpose(pageObj, value) {
    return set.call(this, pageObj, fields.PRIMARY_PURPOSE, value);
  }

  function getSubCategory01(pageObj) {
    return _.get(pageObj, fields.SUB_CATEGORY_01);
  }

  function setSubCategory01(pageObj, value) {
    return set.call(this, pageObj, fields.SUB_CATEGORY_01, value);
  }

  //------------------------------------
  //              page.pageInfo
  //------------------------------------

  function getDestinationUrl(pageObj) {
    return _.get(pageObj, fields.DESTINATION_URL);
  }

  function setDestinationUrl(pageObj, value) {
    return set.call(this, pageObj, fields.DESTINATION_URL, value);
  }

  function getEnvWork(pageObj) {
    return _.get(pageObj, fields.ENV_WORK);
  }

  function setEnvWork(pageObj, value) {
    return set.call(this, pageObj, fields.ENV_WORK, value);
  }

  function getGeoRegion(pageObj) {
    return _.get(pageObj, fields.GEO_REGION);
  }

  function setGeoRegion(pageObj, value) {
    return set.call(this, pageObj, fields.GEO_REGION, value);
  }

  function getLanguage(pageObj) {
    return set.call(this, pageObj, fields.LANGUAGE);
  }

  function setLanguage(pageObj, value) {
    return set.call(this, pageObj, fields.LANGUAGE, value);
  }

  function getPageId(pageObj) {
    return _.get(pageObj, fields.PAGE_ID);
  }

  function setPageId(pageObj, value) {
    return set.call(this, pageObj, fields.PAGE_ID, value);
  }

  function getPageName(pageObj) {
    return _.get(pageObj, fields.PAGE_NAME);
  }

  function setPageName(pageObj, value) {
    return set.call(this, pageObj, fields.PAGE_NAME, value);
  }

  function getPageTitle(pageObj) {
    return _.get(pageObj, fields.PAGE_TITLE);
  }

  function setPageTitle(pageObj, value) {
    return set.call(this, pageObj, fields.PAGE_TITLE, value);
  }

  function getReferringUrl(pageObj) {
    return _.get(pageObj, fields.REFERRING_URL);
  }

  function setReferringUrl(pageObj, value) {
    return set.call(this, pageObj, fields.REFERRING_URL, value);
  }

  function getSysEnv(pageObj) {
    return _.get(pageObj, fields.SYS_ENV);
  }

  function setSysEnv(pageObj, value) {
    return set.call(this, pageObj, fields.SYS_ENV, value);
  }

  function getVersion(pageObj) {
    return _.get(pageObj, fields.VERSION);
  }

  function setVersion(pageObj, value) {
    return set.call(this, pageObj, fields.VERSION, value);
  }

  //------------------------------------
  //                user fields
  //------------------------------------

  function setLogged(pageObj, value) {
    return set.call(this, pageObj, userFields.SEGMENT_LOGGED, value || 'no');
  }

  function setInternal(pageObj, value) {
    return set.call(this, pageObj, userFields.SEGMENT_INTERNAL, value);
  }

  function setPostalCode(pageObj, value) {
    return set.call(this, pageObj, userFields.POSTAL_CODE, value);
  }

  function setCity(pageObj, value) {
    return set.call(this, pageObj, userFields.CITY, value);
  }

  function setCountry(pageObj, value) {
    return set.call(this, pageObj, userFields.COUNTRY, value);
  }

  function setGender(pageObj, value) {
    return set.call(this, pageObj, userFields.GENDER, value);
  }

  function setTitle(pageObj, value) {
    return set.call(this, pageObj, userFields.TITLE, value);
  }

  function setYearOfBirth(pageObj, value) {
    return set.call(this, pageObj, userFields.YEAR_OF_BIRTH, value);
  }

  function setAddressType(pageObj, value) {
    return set.call(this, pageObj, userFields.ADDRESS_TYPE, value);
  }

  function setCurrentVehicle(pageObj, value) {
    return set.call(this, pageObj, userFields.CURRENT_VEHICLE, value);
  }

  function setNextPlannedPurchase(pageObj, value) {
    return set.call(this, pageObj, userFields.NEXT_PLANNED_PURCHASE, value);
  }

  function setPreferredDate(pageObj, value) {
    return set.call(this, pageObj, userFields.PREFERRED_DATE, value);
  }

  function setInterests(pageObj, value) {
    return set.call(this, pageObj, userFields.INTERESTS, value);
  }

  function setPreferredContactMethod(pageObj, value) {
    return set.call(this, pageObj, userFields.PREFERRED_CONTACT_METHOD, value);
  }

  function setFirstName(pageObj, value) {
    return setAnonymized.call(this, pageObj, userFields.FIRST_NAME, value);
  }

  function setLastName(pageObj, value) {
    return setAnonymized.call(this, pageObj, userFields.LAST_NAME, value);
  }

  function setAddress(pageObj, value) {
    return setAnonymized.call(this, pageObj, userFields.ADDRESS, value);
  }

  function setAddressType(pageObj, value) {
    return setAnonymized.call(this, pageObj, userFields.ADDRESS, value);
  }

  function setPhoneNumber(pageObj, value) {
    return setAnonymized.call(this, pageObj, userFields.PHONE, value);
  }

  function setMailAddress(pageObj, value) {
    return setAnonymized.call(this, pageObj, userFields.EMAIL, value);
  }

  function setVIN(pageObj, value) {
    return setAnonymized.call(this, pageObj, userFields.VIN, value);
  }

  return {
    hookTypes: hookTypes,
    fields: fields,
    set: set,
    setAnonymized: setAnonymized,
    newCategoryObj: newCategoryObj,
    getPageType: getPageType,
    setPageType: setPageType,
    getPrimaryCategory: getPrimaryCategory,
    setPrimaryCategory: setPrimaryCategory,
    getPrimaryPurpose: getPrimaryPurpose,
    setPrimaryPurpose: setPrimaryPurpose,
    getSubCategory01: getSubCategory01,
    setSubCategory01: setSubCategory01,
    getNavigationSource: getNavigationSource,
    setNavigationSource: setNavigationSource,
    getPageResponsiveType: getPageResponsiveType,
    setPageResponsiveType: setPageResponsiveType,
    getTemplate: getTemplate,
    setTemplate: setTemplate,
    getVirtualPage: getVirtualPage,
    setVirtualPage: setVirtualPage,
    getYearOfLaunch: getYearOfLaunch,
    setYearOfLaunch: setYearOfLaunch,
    getDestinationUrl: getDestinationUrl,
    setDestinationUrl: setDestinationUrl,
    getEnvWork: getEnvWork,
    setEnvWork: setEnvWork,
    getGeoRegion: getGeoRegion,
    setGeoRegion: setGeoRegion,
    getLanguage: getLanguage,
    setLanguage: setLanguage,
    getPageId: getPageId,
    setPageId: setPageId,
    getPageName: getPageName,
    setPageName: setPageName,
    getPageTitle: getPageTitle,
    setPageTitle: setPageTitle,
    getReferringUrl: getReferringUrl,
    setReferringUrl: setReferringUrl,
    getSysEnv: getSysEnv,
    setSysEnv: setSysEnv,
    getVersion: getVersion,
    setVersion: setVersion,
    /**
     * @type {{setLogged,
      setInternal,
      setPostalCode,
      setCity,
      setCountry,
      setGender,
      setTitle,
      setYearOfBirth,
      setAddressType,
      setCurrentVehicle,
      setNextPlannedPurchase,
      setPreferredDate,
      setInterests,
      setPreferredContactMethod,
      setFirstName,
      setLastName,
      setAddress,
      setAddressType,
      setPhoneNumber,
      setMailAddress,
      setVIN}}
     */
    userDataHelper: {
      setLogged: setLogged,
      setInternal: setInternal,
      setPostalCode: setPostalCode,
      setCity: setCity,
      setCountry: setCountry,
      setGender: setGender,
      setTitle: setTitle,
      setYearOfBirth: setYearOfBirth,
      setAddressType: setAddressType,
      setCurrentVehicle: setCurrentVehicle,
      setNextPlannedPurchase: setNextPlannedPurchase,
      setPreferredDate: setPreferredDate,
      setInterests: setInterests,
      setPreferredContactMethod: setPreferredContactMethod,
      setFirstName: setFirstName,
      setLastName: setLastName,
      setAddress: setAddress,
      setAddressType: setAddressType,
      setPhoneNumber: setPhoneNumber,
      setMailAddress: setMailAddress,
      setVIN: setVIN
    },
    setCommitHooks: setCommitHooks
  };
}());

/**
 * Tracking functionality
 * @namespace digitals2.tracking.impl
 */
window.digitals2.tracking.core = (function ($, window, $window, document, cookiecontroller, eventArrayLength, undefined) {
  'use strict';

  /**
   * Module which encapsulates the management of callback functions.
   *
   * @type {{registerObserverCallback: Function}}
   */
  var APIInitializationObserver = (function () {

    /**
     * The logger.
     */
    var log = window.digitals2.tracking.loggerForCategory('digitals2.tracking');

    /**
     * The window.digitals2.tracking.api object.
     * @type {object}
     */
    var apiObject = null;

    /**
     * The tracking api object
     * @type {Array}
     */
    var callbacks = [];

    /**
     * Indicates if the api object is set and the window.digitals2.tracking.Constants.API_INITIALIZED event
     * was handled.
     * @type {boolean} true of the observers can be notified, false else.
     */
    var cookieControllerInitialized = false;

    /**
     * Indicates that the tracking api object has been set and that the cookie controller api has been
     * initialized.
     *
     * @return {boolean} "true" when the api object has been set and the cookie controller has been initialized,
     *        false, else.
     */
    function isInitialized() {
      return (null != apiObject) && cookieControllerInitialized;
    }

    /**
     * Called when the API object is set.
     */
    function invokeCallbacks(apiObject) {
      log.info('APIInitializationObserver:invokeCallbacks');
      if (isInitialized()) {
        callbacks.forEach(function (callbackFunction, index, arr) {
          callbackFunction.call(null, apiObject, cookiecontroller.api);
        });
      } else {
        log.warn('APIInitializationObserver:invokeCallbacks - invocation stopped, cookie controller is not initialized.');
      }
    }

    /**
     * Registers a callback function.
     * @param callback A callback function.
     */
    function registerObserverCallback(callback) {
      log.info('APIInitializationObserver:registerObserverCallback');
      callbacks[callbacks.length] = callback;
      if (isInitialized()) {
        callback.call(null, apiObject, cookiecontroller);
      }
    }

    /**
     * Sets the api singleton instance.
     * @param api The api object.
     */
    function setApiObject(api) {
      log.info('APIInitializationObserver:setApiObject');
      apiObject = api;
      if (isInitialized()) {
        invokeCallbacks();
      }
    }

    if (cookiecontroller && cookiecontroller.api) {
      var ccApi = cookiecontroller.api;
      if (!ccApi.isInitialized()) {
        ccApi.registerOnInitialized(function () {
          cookieControllerInitialized = true;
          invokeCallbacks();
        });
      } else {
        cookieControllerInitialized = true
        invokeCallbacks();
      }
    } else {
      log.error('cookie controller is not available');
    }

    return {
      setApiObject: setApiObject,
      registerObserverCallback: registerObserverCallback
    }
  }());

  // Instance stores a reference to the Singleton
  var Constants = window.digitals2.tracking.Constants;
  var log = window.digitals2.tracking.loggerForCategory('digitals2.tracking');
  var targetOrigin = null;

  /**
   * The data layer api instance.
   * @type {object}
   */
  var instance = null;

  /**
   * Indicates if the API was initialized correctly. The API depends on the
   * cookie controller which this has to be initialized first.
   * The cookie loads JSON data calling the page with the selector 'cookie'
   * and the extension JSON.
   * @type {boolean}
   */
  var initialised = false;

  cookiecontroller = cookiecontroller || {};

  /**
   * Initialise the tracking
   * @memberOf digitals2.tracking
   */
  function initTracking(dataLayer, eventArrayLength) {
    log.info('initTracking', dataLayer, eventArrayLength);
    var trackingObj = $.extend(true, {}, dataLayer),
      EVENT_ARRAY_LENGTH = eventArrayLength,
      pageTrackingArr = trackingObj.pages,
      mainPageTrackingObj = trackingObj.pages[0],
      namespace = 'digitals2:tracking:',
      isDevMode = mainPageTrackingObj.page.pageInfo.envWork === 'dev',
      EVENT_ATTR_COOKIE = 'cc_digital_eventAttributes',
      EVENT_FROM_PREVIOUS_PAGE = 'eventFromPreviousPage',
      HISTORY_COOKIE = 'HistoryCookie',
      USER_COOKIE = 'cc_digital_userCookie',
      SESSION_ID_COOKIE = 'bmwSessionCookie',
      VISITOR_ID_COOKIE = 'visitorid',
      CLC_COOKIE = 'clc_campaign_lead_context',
      PROFILE_COOKIE = 'cc_digital_profileCookie',
      AEM_TRACKING_COOKIE = 'aems_tracking',
      // TEST_COOKIE = 'cc_consentCookie',
      TEST_COOKIE = 'cc_digital_testCookie',
      cookiesAllowed = false,
      PAGE_WIDE = 768,
      ccapi = cookiecontroller.api || {},
      ccEnabled = cookiecontroller.api || false,
      ERRORS = {
        CODE1: {
          'type': 'error',
          'errorCode': '1',
          'errorMessage': 'The pageId passed to the function does not exist'
        },
        CODE2: {
          'type': 'error',
          'errorCode': '2',
          'errorMessage': 'The pageId is a required parameter on this function'
        },
        CODE3: {
          'type': 'error',
          'errorCode': '3',
          'errorMessage': 'The component element passed to the function does not exist'
        },
        CODE4: {
          'type': 'error',
          'errorCode': '4',
          'errorMessage': 'The component element passed to the function does not have the required data attribute'
        },
        CODE5: {
          'type': 'error',
          'errorCode': '5',
          'errorMessage': 'The format or type of the data passed to the function is not correct'
        }
      };

    function setClcCookie() {
      var campaignProperties = (function () {
        /*
         * {
         *   cid: "pm_f60s_loc_socm_fb_liad_7mis7_20161201",
         *   ccid: "146001",
         *   clc: "MINI digital",
         *   ctid: "146000"
         * }
         */
        var propertyMap = {
          ccid: 'campaignId',
          clc: 'leadContext',
          ctid: 'treatmentId'
        };
        var parameters = {};
        var query = window.location.search.substring(1);

        query.split("&").forEach(function (arg, index, array) {
          var pair = arg.split("=");
          var key = pair[0];
          if (typeof key === "string" && propertyMap[pair[0]]) {
            parameters[propertyMap[key]] = decodeURIComponent(pair[1]);
          }
        });

        return _.keys(parameters).length ? parameters : null;
      }());
      if (campaignProperties) {
        return ccapi.setCookie(CLC_COOKIE, JSON.stringify(campaignProperties));
      }
      return null;
    }

    function getClcCookie() {
      try {
        return JSON.parse(getCookie({
          cookiesDisallowed: JSON.stringify({disabled: true}),
          cookieId: CLC_COOKIE,
          cookieValue: JSON.stringify({})
        }));
      } catch (e) {
        window['console'] && console.error(e);
      }
      return null;
    }

    function deleteClcCookie() {
      return ccapi.deleteCookie(CLC_COOKIE);
    }

    /**
     * Initalise tracking functionality
     * @memberOf digitals2.tracking
     */
    function init() {
      log.info('init');
      // Check the cookie preferences
      getCookiesAllowed();

      mainPageTrackingObj.page.attributes = mainPageTrackingObj.page.attributes || {};

      // Initialise our values and listeners
      initValues(mainPageTrackingObj.page.pageInfo, mainPageTrackingObj.page.attributes);
      initUser();
      initListeners();
      setClcCookie();
      _searchTrackingInit();
      _eventCookiePutInDatalayer();
      _backButtonCheck();
    }

    function getTargetOrigin() {
      return targetOrigin;
    }

    function setTargetOrigin(origin) {
      targetOrigin = origin;
    }

    /**
     * Try to set a cookie with the cookie controller API.
     * If we're not able to set a cookie, cookies are not allowed.
     *
     * @memberOf digitals2.tracking.impl
     */
    function getCookiesAllowed() {
      if (!ccEnabled) {
        cookiesAllowed = false;
        return;
      }

      // First set the cookie, this will only work if it is allowed by
      // the regulation type, and the browser
      ccapi.setCookie(TEST_COOKIE, 'true');

      // Check the value returns
      if (ccapi.getCookie(TEST_COOKIE) === 'true') {
        // Remove the cookie and tell the API cookies are allowed
        ccapi.deleteCookie(TEST_COOKIE);
        cookiesAllowed = true;
      } else {
        cookiesAllowed = false;
      }
    }

    /**
     * Set the inital tracking values that are accessible via JS
     * @memberOf digitals2.tracking.impl
     * @param {Object}  pageInfo                 The page info object that we want to update - main on first init, or the virtual page object
     * @param {Object}  pageAttributes           The page attributes object that we want to update - main on first init, or the virtual page object
     * @param {string}  virtualDestinationUrl    Pass in a destination url to override the API using the document.location.href
     * @param {string}  virtualReferringUrl      Pass in a referrer url to override the API using the document.referrer
     * @param {boolean} preventAttrMerge         Don't merge the cookie attributes into the passed object
     */
    function initValues(pageInfo, pageAttributes, virtualDestinationUrl, virtualReferringUrl, preventAttrMerge) {
      var destinationUrl = virtualDestinationUrl || document.location.href,
        referringUrl = virtualReferringUrl || document.referrer,
        attributesObj = {};
      var eventCookieAvailable = false;
      // Get the eventAttributes from a cookie
      attributesObj = JSON.parse(ccEnabled && !preventAttrMerge ? ccapi.getCookie(EVENT_ATTR_COOKIE) : '{}');
      if (!attributesObj) {
        attributesObj = {
          navigationSource: 'external',
          navigationItem: 'external',
          navigationComponentID: 'external'
        };
      } else {
        ccapi && ccapi.deleteCookie(EVENT_ATTR_COOKIE);
        eventCookieAvailable = true;
      }

      // Merge the JS set pageInfo into pageInfo object of the main page in dataLayer
      $.extend(pageInfo, {
        destinationUrl: destinationUrl,
        referringUrl: referringUrl
      });

      // Merge the JS set attributes into attributes object of the main page in dataLayer and responsive page type
      $.extend(pageAttributes, attributesObj, {
        pageResponsiveType: ($(window).width() > PAGE_WIDE) ? 'wide' : 'narrow'
      });

      return eventCookieAvailable;
    }

    /**
     * check if tracking cookie is set from previous search
     * put it into datalayer
     * remove cookie
     * @memberOf digitals2.tracking.impl
     */
    function _searchTrackingInit() {
      var pSearchCookieValues = _searchCookieGet();

      if (pSearchCookieValues !== null) {
        initComponentTracking(pSearchCookieValues, getCurrentPageIndex());
        _searchCookieDelete();
      }
    }

    /**
     * get search cookie
     * @memberOf digitals2.tracking.impl
     */
    function _searchCookieGet() {
      if (!cookiesAllowed) {
        return {};
      }
      return JSON.parse(ccapi.getCookie(AEM_TRACKING_COOKIE));
    }

    /**
     * delete search cookie
     * @memberOf digitals2.tracking.impl
     */
    function _searchCookieDelete() {
      if (!cookiesAllowed) {
        return {};
      }
      ccapi.deleteCookie(AEM_TRACKING_COOKIE);
    }

    /**
     * save event cookie from internal link for target page
     * @memberOf digitals2.tracking.impl
     * @param {Object}  trackingEvent                 event informations
     * @param {Object}  trackingOptions               event options
     */
    function eventCookieSave(trackingEvent, trackingOptions) {
      if (trackingEvent &&
        trackingEvent.category &&
        trackingEvent.category.eventType &&
        trackingEvent.category.eventType === 'delayed') {

        var pToSaveData = {
          trackingEvent: trackingEvent,
          trackingOptions: trackingOptions
        };

        if (!cookiesAllowed) {
          return;
        }
        ccapi.setCookie(EVENT_FROM_PREVIOUS_PAGE, JSON.stringify(pToSaveData));
      }
    }

    /**
     * Load event cookie from internal link on target page
     * add values to dataLayer
     * delete the cookie
     * @memberOf digitals2.tracking.impl
     */
    function _eventCookiePutInDatalayer() {
      log.info(_eventCookiePutInDatalayer.name);
      var pToSaveData,
        attributesObj;

      try {
        pToSaveData = JSON.parse(ccapi.getCookie(EVENT_FROM_PREVIOUS_PAGE));
      } catch (e) {
        log.error('- ', e);
      }

      if (null !== pToSaveData) {
        // addEventTracking({}, pToSaveData.trackingEvent, getLastActiveVirtualPageId());
        var pages = pageTrackingArr;
        pages.forEach(function (pageObj, index, arr) {
          if (pageObj.event) {
            log.info('- ', pageObj, pToSaveData);
            pageObj.event.unshift(pToSaveData.trackingEvent);
          } else {
          }
        });
        ccapi.deleteCookie(EVENT_FROM_PREVIOUS_PAGE);
      }
    }

    function _backButtonCheck() {
      if (!cookiesAllowed) {
        return;
      }
      var oldHistoryLength = parseInt(ccapi.getCookie(HISTORY_COOKIE), 10);
      var newHistoryLength = parseInt(window.history.length, 10);
      if (oldHistoryLength == newHistoryLength) {
        var attributesObj = {
          navigationSource: 'external',
          navigationItem: 'external',
          navigationComponentID: 'external'
        };
        $.extend(mainPageTrackingObj.page.attributes, attributesObj);
      }

      window.onbeforeunload = function (e) {
        ccapi.setCookie(HISTORY_COOKIE, window.history.length);
      };
    }

    /**
     * Set the initial values in the user object
     * @memberOf digitals2.tracking.impl
     */
    function initUser() {

      var userObj = (mainPageTrackingObj.user && mainPageTrackingObj.user.length > 0 ?
        mainPageTrackingObj.user[0].profileInfo : {}),
        sessionID = ccEnabled ? sessionSet() : '',
        visitorID = ccEnabled ? ccapi.getCookie(VISITOR_ID_COOKIE) : false, // visitor id from extra cookie written by external service BMWST-2915
        userCookie = getUserCookie(),
        userProfileCookie = ccEnabled ? ccapi.getCookie(PROFILE_COOKIE) : false,
        digitalsTracking = window.digitals2.tracking,
        currentPageIndex;

      $(window).on('load', function () {
        if (digitalsTracking && digitalsTracking.api) {
          currentPageIndex = digitalsTracking.api.getCurrentPageIndex();
          digitalsTracking.pageHelper.userDataHelper.setLogged(digitalsTracking.api.getPageObject(currentPageIndex), 'no');
        }

        userObj.sessionIDx = parseInt(userCookie.sessionIDx || 1, 10);

        // If it's the same user on a different session, they are returningStatus
        userObj.returningStatus = sessionID !== userCookie.sessionID;

        // If the user is returning, increment the session count
        if (cookiesAllowed) {
          if (userObj.returningStatus) {
            userObj.sessionIDx += 1;
          }

          // if visitorid is set by generell external service cookie
          if (visitorID) {
            userObj.visitorID = visitorID;
          }
          else if (userCookie.visitorID) {
            userObj.visitorID = userCookie.visitorID;
          } else {
            userObj.visitorID = sessionID;
          }
        }

        userObj.sessionID = sessionID;

        // Update the user cookie
        writeUserCookie(userObj);

        // Check for and write profileId value
        if (userProfileCookie) {
          // If the user's profile value exists in a cookie, push into the dataLayer
          updateUser(userProfileCookie);
        }
      });

      // Get the previous session count from the cookie

    }

    /**
     * set session when not set
     * @memberOf digitals2.tracking
     *
     *
     */
    function sessionSet() {

      var pSessionID;

      if (!cookiesAllowed) {
        return '';
      }

      if (ccEnabled) {
        pSessionID = ccapi.getCookie(SESSION_ID_COOKIE);
      }

      //create new session when not set in session cookie
      if (pSessionID === undefined || pSessionID === null) {
        pSessionID = parseInt(Date.now() * Math.random(), 10) + '';
      }

      // set the cookie in every case with new expiry date
      ccapi.setCookie(SESSION_ID_COOKIE, pSessionID);

      return ccapi.getCookie(SESSION_ID_COOKIE);
    }

    /**
     * update session and dependencies in usercookie and datalayer
     * @memberOf digitals2.tracking
     *
     *
     */
    function sessionUpdate() {
      var userObj = (mainPageTrackingObj.user && mainPageTrackingObj.user.length > 0 ?
        mainPageTrackingObj.user[0].profileInfo :
        {}),
        sessionID = ccEnabled ? sessionSet() : '',
        userProfileCookie = ccEnabled ? ccapi.getCookie(PROFILE_COOKIE) : false;

      userObj.sessionID = sessionID;

      // Update the user cookie
      writeUserCookie(userObj);

      // Check for and write profileId value
      if (userProfileCookie) {
        // If the user's profile value exists in a cookie, push into the dataLayer
        updateUser(userProfileCookie);
      }
    }

    /**
     * Retrieve the session cookie, if it doesn't exist create it
     * @memberOf digitals2.tracking
     *
     * @return {String} The session ID string
     */
    function getSession() {
      return getCookie({
        cookiesDisallowed: '',
        cookieId: SESSION_ID_COOKIE,
        cookieValue: parseInt(Date.now() * Math.random(), 10) + ''
      });
    }

    /**
     * Retrieve the user cookie which contains the previous session id, count and status
     * @memberOf digitals2.tracking.impl
     *
     * @return {Object} User object
     * @todo Change user cookie to use the BMW IT Cookie Control
     */
    function getUserCookie() {
      if (!cookiesAllowed) {
        return {};
      }

      // If the cookie doesn't exist, and we're allowed cookies, create it with default values
      if (!ccapi.getCookie(USER_COOKIE)) {
        ccapi.setCookie(USER_COOKIE, JSON.stringify({
          'visitorID': '',
          'returningStatus': false,
          'sessionID': '',
          'sessionIDx': 1
        }));
      }

      return JSON.parse(ccapi.getCookie(USER_COOKIE));
    }

    /**
     * Save the user cookie using the calculated values from initUser()
     * @memberOf digitals2.tracking.impl
     *
     * @param  {Object} userObj User object
     *
     * @return {Boolean} Whether the save was successful
     * @todo Change user cookie to use the BMW IT Cookie Control
     */
    function writeUserCookie(userObj) {
      // Bail out if cookies aren't allowed
      if (!cookiesAllowed) {
        return false;
      }

      return ccapi.setCookie(USER_COOKIE, JSON.stringify({
        'visitorID': userObj.visitorID,
        'returningStatus': userObj.returningStatus,
        'sessionID': userObj.sessionID,
        'sessionIDx': userObj.sessionIDx || '1'
      }));
    }

    /**
     * Update the user object in all pages with the passed profileId
     * @memberOf digitals2.tracking.impl
     *
     * @param  {String}         profileId           The user's profile ID as returned from login
     * @param  {Boolean}        hashId              Should we hash this value before storing
     * @param  {Boolean}        storeSessionValue   Persist the value in a session cookie
     * @param  {Object}         props               A generic object containing key/value pairs.
     */
    function updateUser(profileId, hashId, storeSessionValue, props) {
      log.info('updateUser', profileId, hashId, storeSessionValue, props);
      try {
        // Do we want to hash the ID and is the profileId not an empty string?
        if (hashId && profileId !== '') {
          profileId = hashValue(profileId);
        }

        if (storeSessionValue && cookiesAllowed) {
          ccapi.setCookie(PROFILE_COOKIE, profileId);
        }

        $.each(pageTrackingArr, function (i, page) {
          page.user[0].profileInfo.profileId = profileId;
          if (props) {
            $.extend(true, page.user[0], props);
          }
        });
      } catch (errorObj) {
        log.error('updateUser', errorObj);
        return errorObj;
      }
    }

    /**
     * Intialise the listeners for component and event updates
     * @memberOf digitals2.tracking.impl
     */
    function initListeners() {
      // Bail out if cookies aren't allowed
      if (!cookiesAllowed) {
        return false;
      }

      // TODO: MINDIGB-6280 - Removed for inital release to prevent empty event tracking
      //$(document).on('click.tracking', 'a:not(.md-tracking-custom a), button:not(.md-tracking-custom button)', trackClickEvents);
    }

    /**
     * Initialise the tracking of a component, push the values into the dataLayer
     * @memberOf digitals2.tracking.impl
     * @param    {Object}    obj                 The jQuery element of the component or a full tracking object
     * @param    {Number}    [pageId]            Virtual pageId or will add to the last page object in the array.
     * @return  {Object}                        An object containing the page id and the component array index for the initalised component
     */
    function initComponentTracking(obj, pageId) {
      log.info('initComponentTracking', obj, pageId);
      var isJqObj = false,
        $el = {},
        virtualPage = false,
        componentIndex = 0,
        componentObj = {},
        pageTrackingArrIndex = 0;

      try {

        // Check if the object passed is a jQuery element
        isJqObj = (obj instanceof $);

        if (isJqObj) {
          $el = obj;
          handleErrors(!$el.length, 3);
        }

        // Check if the component already exists in the array
        componentIndex = isJqObj ? $el.data('tracking-index') : undefined;

        // Get the component specific tracking object from the element's data or use the plain object
        componentObj = isJqObj ? $el.data('tracking-component') : obj;

        // Track the virtual page we are adding the event to
        pageTrackingArrIndex = getLastActiveVirtualPageId();

        if (isJqObj) {
          // If a jQuery element is passed in and the tracking-component data attribute doesn't exist
          handleErrors(!componentObj, 4);
        } else {
          // If the object passed in is null or not an object
          handleErrors(componentObj === null || typeof componentObj !== 'object', 5);
        }

        // If we already have the component index in our array, update the object
        if (typeof componentIndex !== 'undefined') {
          updateComponentTracking($el, componentObj, pageId);

          // Else push our object to the component array
        } else {

          // If a pageId is passed in
          if (pageId) {

            // Check if our virtual page pageId exists in the virtual pages array
            virtualPage = getVirtualPage(pageId);
          }

          // If a pageId is passed in but a page object does not exist at that index, throw an error
          handleErrors(pageId && !virtualPage, 1);

          // If a virtualPage does exist, grab the object at the provided array index
          if (virtualPage) {
            pageTrackingArrIndex = pageId;
          }

          pageTrackingArr[pageTrackingArrIndex].component = pageTrackingArr[pageTrackingArrIndex].component || [];
          pageTrackingArr[pageTrackingArrIndex].component.push(componentObj);

          componentIndex = pageTrackingArr[pageTrackingArrIndex].component.length - 1;

          if (isJqObj) {
            // If the component is a jQuery object, it can track its own index
            storeComponentIndex($el, componentIndex);
          }

          // Expose event to the window with the pageId and the page object that is updated
          triggerEvent('initComponentTracking', [pageTrackingArrIndex, getPageObject(pageTrackingArrIndex)]);

          return {
            pageId: pageTrackingArrIndex,
            componentIndex: componentIndex
          };
        }
      } catch (errorObj) {
        log.error('initComponentTracking', errorObj);
        return errorObj;
      }
    }

    /**
     * Store our the index of our component in the component array to the data of the component
     * @memberOf digitals2.tracking.impl
     * @param  {jQuery}    $el                  The jQuery element object
     * @param  {Number}    componentIndex       The index to store
     */
    function storeComponentIndex($el, componentIndex) {
      $el.attr('data-tracking-index', componentIndex);
    }

    /**
     * Update a component's tracking values
     * @memberOf digitals2.tracking.impl
     * @param  {Object}    componentObj     The jQuery element object or component ID to merge with
     * @param  {Object}    obj              The object to merge the component object with
     * @param  {Number}    pageId           Virtual pageId
     * @return {Object}                    Component index and pageId or an error code object
     */
    function updateComponentTracking(componentObj, obj, pageId) {
      log.info('updateComponentTracking', componentObj, obj, pageId);
      var isJqObj = false,
        componentIndex = componentObj,
        thisComponentTrackingArr = [],
        virtualPage = false;

      try {
        // Check if the object passed is a jQuery element
        isJqObj = (componentObj instanceof $);

        handleErrors(pageId === undefined, 2);
        handleErrors(!isJqObj && typeof componentIndex !== 'number', 5);
        handleErrors(obj === null || typeof obj !== 'object', 5);

        if (isJqObj) {
          componentIndex = componentObj.data('tracking-index');
          handleErrors(componentIndex === undefined, 4);
        }

        virtualPage = getVirtualPage(pageId);

        handleErrors(!virtualPage, 1);

        thisComponentTrackingArr = pageTrackingArr[pageId].component;

        $.extend(true, thisComponentTrackingArr[componentIndex], obj);

        // Expose event to the window with the pageId and the page object that is updated
        triggerEvent('updateComponentTracking', [pageId, getPageObject(pageId)]);

        return {
          pageId: pageId,
          componentIndex: componentIndex
        };
      } catch (errorObj) {
        log.info('updateComponentTracking', errorObj);
        return errorObj;
      }
    }

    /**
     * Initialise the tracking of a product, push the values into the dataLayer
     * @memberOf digitals2.tracking.impl
     * @param    {Object}    obj                 The jQuery element of the produc or a full tracking object
     * @param    {Number}    [pageId]            Virtual pageId or will add to the last page object in the array.
     * @return  {Object}                        An object containing the page id and the product array index for the initalised product
     */
    function initProductTracking(obj, pageId) {
      log.info('initProductTracking', obj, pageId);
      var isJqObj = false,
        $el = {},
        virtualPage = false,
        productIndex = 0,
        productObj = {},
        pageTrackingArrIndex = 0;

      try {

        // Check if the object passed is a jQuery element
        isJqObj = (obj instanceof $);

        if (isJqObj) {
          $el = obj;
          handleErrors(!$el.length, 3);
        }

        // Check if the product already exists in the array
        productIndex = isJqObj ? $el.data('tracking-product-index') : undefined;

        // Get the product specific tracking object from the element's data
        productObj = isJqObj ? $el.data('tracking-product') : obj;

        // Track the virtual page we are adding the event to
        pageTrackingArrIndex = getLastActiveVirtualPageId();

        if (isJqObj) {
          // If a jQuery element is passed in and the tracking-component data attribute doesn't exist
          handleErrors(!productObj, 4);
        } else {
          // If the object passed in is null or not an object
          handleErrors(productObj === null || typeof productObj !== 'object', 5);
        }

        // If we already have the product index in our array, update the object
        if (typeof productIndex !== 'undefined') {
          updateProductTracking($el, productObj, pageId);

          // Else push our object to the product array
        } else {

          // If a pageId is passed in
          if (pageId) {
            virtualPage = getVirtualPage(pageId);
          }

          // If a pageId is passed in but a page object does not exist at that index, throw an error
          handleErrors(pageId && !virtualPage, 1);

          // If a virtualPage does exist, grab the object at the provided array index
          if (virtualPage) {
            pageTrackingArrIndex = pageId;
          }

          pageTrackingArr[pageTrackingArrIndex].product.push(productObj);

          productIndex = pageTrackingArr[pageTrackingArrIndex].product.length - 1;

          if (isJqObj) {
            storeProductIndex($el, productIndex);
          }

          // Expose event to the window with the pageId and the page object that is updated
          triggerEvent('initProductTracking', [pageTrackingArrIndex, getPageObject(pageTrackingArrIndex)]);

          return {
            pageId: pageTrackingArrIndex,
            productIndex: productIndex
          };
        }
      } catch (errorObj) {
        log.error('initProductTracking', errorObj);
        return errorObj;
      }
    }

    /**
     * Store our the index of our product in the component array to the data of the product
     * @memberOf digitals2.tracking.impl
     * @param  {Number}    productIndex         The index of the object in the poduct array
     * @param  {jQuery}    $el                  The jQuery element object
     */
    function storeProductIndex($el, productIndex) {
      $el.attr('data-tracking-product-index', productIndex);
    }

    /**
     * Update our product's tracking values
     * @memberOf digitals2.tracking.impl
     * @param  {Object}    productObj       The jQuery element object or product ID to merge with
     * @param  {Object}    obj              The object to merge the product object with
     * @param  {Number}    pageId           Virtual pageId
     * @return {Object}                    Product index and pageId or an error code object
     */
    function updateProductTracking(productObj, obj, pageId) {
      log.info('updateProductTracking', productObj, obj, pageId);
      var isJqObj = false,
        productIndex = productObj,
        thisProductTrackingArr = [],
        virtualPage = false;

      try {

        // Check if the object passed is a jQuery element
        isJqObj = (productObj instanceof $);

        handleErrors(pageId === undefined, 2);
        handleErrors(!isJqObj && typeof productIndex !== 'number', 5);
        handleErrors(obj === null || typeof obj !== 'object', 5);

        if (isJqObj) {
          productIndex = productObj.data('tracking-product-index');
          handleErrors(productIndex === undefined, 4);
        }

        virtualPage = getVirtualPage(pageId);

        handleErrors(!virtualPage, 1);

        thisProductTrackingArr = pageTrackingArr[pageId].product;

        $.extend(true, thisProductTrackingArr[productIndex], obj);

        // Expose event to the window with the pageId and the page object that is updated
        triggerEvent('updateProductTracking', [pageId, getPageObject(pageId)]);

        return {
          pageId: pageId,
          productIndex: productIndex
        };
      } catch (errorObj) {
        log.error('updateProductTracking', errorObj);
        return errorObj;
      }
    }

    /**
     * Push an event into the event array
     * @memberOf digitals2.tracking.impl
     * @param   {Object}    defaultTrackingEventObject      An object containing the default values for a component’s tracking event (e.g.: Related component, category)
     * @param   {Object}    elementTrackingEventObject      An object containing values specific to the current tracking event that was triggered (e.g.: Event name, effect)
     * @param   {Number}    pageId                          Virtual pageId or will add to the page object at index 0.
     * @return {Object}                                    pageId & page object that this component was added to or an error code object
     */
    function addEventTracking(defaultTrackingEventObject, elementTrackingEventObject, pageId) {
      log.info('addEventTracking', defaultTrackingEventObject, elementTrackingEventObject, pageId);
      var eventObj = {},
        virtualPage = 0,
        pageId = window.digitals2.tracking.api.getCurrentPageIndex();

      try {
        handleErrors(pageId === undefined, 2);
        handleErrors(typeof defaultTrackingEventObject !== 'object', 5);

        // Get our virtual page
        virtualPage = getVirtualPage(pageId);
        handleErrors(!virtualPage, 1);

        $.extend(true, eventObj, defaultTrackingEventObject, elementTrackingEventObject);

        pageTrackingArr[pageId].event = pageTrackingArr[pageId].event || [];

        var eventArray = pageTrackingArr[pageId].event;
        eventArray.push(eventObj);
        // Replace event object with new one if not dev mode
        // BMWST-3701 as requested by Feld-M, the length of
        // the event array is not 1 anymore, but is configured
        // externally.
        if (!isDevMode && (EVENT_ARRAY_LENGTH < eventArray.length)) {
          eventArray.shift();
        }

        // Expose event to the window with the pageId and the page object that is updated
        triggerEvent('addEventTracking', [pageId, getPageObject(pageId)]);

        // new expiry time when user interacts with page
        sessionUpdate();

        return {
          pageId: pageId,
          pageObj: pageTrackingArr[pageId]
        };
      } catch (errorObj) {
        log.error('addEventTracking', errorObj);
        return errorObj;
      }
    }

    /**
     * Tracking clicks on all anchors and buttons
     * @memberOf digitals2.tracking.impl
     * @param {jQuery.Event}    e   The event that fired this function
     * @todo Change user cookie to use the BMW IT Cookie Control
     */
    function trackClickEvents(e) {

      var $this = $(e.target),
        defaultTrackingEventObject = {},
        elementTrackingEventObject = {},
        // Grab the element specific data, event data, and date
        specificEventObject = {
          eventInfo: {
            eventName: e.currentTarget.innerText,
            eventAction: e.type,
            timeStamp: Date.now().toString()
          }
        };

      if ($this.hasClass('.md-js-tracking-event')) {
        defaultTrackingEventObject = $this.closest('.md-js-tracking-event-parent').data('event-children');
        elementTrackingEventObject = $this.data('event');
      }

      // Merge the defaultTrackingEvents (defaults) objects and the the specificEventObject (element, event and time specific data)
      elementTrackingEventObject = $.extend(true, specificEventObject, elementTrackingEventObject);

      addEventTracking(defaultTrackingEventObject, elementTrackingEventObject, getLastActiveVirtualPageId());

      if (cookiesAllowed) {
        // Push event attributes into a cookie
        ccapi.setCookie(EVENT_ATTR_COOKIE, JSON.stringify(getEventAttributes(e)));
      }

      return true;
    }

    /**
     * Build the event attribute object that gets stored to show the next page
     * @memberOf digitals2.tracking.impl
     * @param {jQuery.Event} e The event containing data we want to set pageAttributes for
     */
    function getEventAttributes(e) {

      var $this = $(e.target),
        component = $this.closest('.md-component'),
        elementEventAttributeObject = $this.data('event-attribute-object'),
        eventAttributeObject = {};

      eventAttributeObject = {
        navigationLevel: elementEventAttributeObject && elementEventAttributeObject.navigationLevel ? elementEventAttributeObject.navigationLevel + '' : '5',
        navigationItemType: e.target.nodeName,
        navigationComponentID: component.attr('id') || 'noId',
        navigationComponentName: component.data('component-name') || 'noName',
        navigationSource: getPageObject(getCurrentPageIndex()).page.pageInfo.pageName,
        navigationItem: $this.text(),
        navigationStickyType: elementEventAttributeObject && elementEventAttributeObject.navigationStickyType ? elementEventAttributeObject.navigationStickyType : '',
        navigationStickyUse: elementEventAttributeObject && elementEventAttributeObject.navigationStickyUse ? elementEventAttributeObject.navigationStickyUse : ''
      };

      eventAttributeObject = $.extend(true, eventAttributeObject, elementEventAttributeObject);

      return eventAttributeObject;
    }

    /**
     * Push a record into the virtual page aray when a virtual page loads
     * @memberOf digitals2.tracking.impl
     * @param   {Object}    pageObj                     Virtual page specific object
     * @param   {String}    destinationUrl              Pass in an override to using document.location.href
     * @param   {String}    referringUrl                Pass in an override to using document.referrer
     * @return {Object}                                pageId & page object that this component was added to or an error code object
     */
    function addVirtualPage(pageObj, destinationUrl, referringUrl) {
      log.info('addVirtualPage', pageObj, destinationUrl, referringUrl);
      // Create a new object so we're not pushing a reference
      var virtualPageObj = {};
      var returnedObj = {};

      // Get the eventAttributeObject
      $.extend(true, virtualPageObj, pageObj);

      // Push into our page array
      pageTrackingArr.push(virtualPageObj);

      // Initialise the values of this page object
      var page = virtualPageObj.page = virtualPageObj.page || {};
      var pageInfo = (page.pageInfo = page.pageInfo || {});
      var attributes = (page.attributes = page.attributes || {});
      initValues(pageInfo, attributes, destinationUrl || document.location.href, referringUrl || document.referrer, true);

      // Update the active page index
      trackingObj.activePageIndex = pageTrackingArr.length - 1;

      duplicatePageDetails(trackingObj.activePageIndex);

      returnedObj = getPageObject(trackingObj.activePageIndex);

      // Expose new page id and page object in window event
      triggerEvent('addVirtualPage', [trackingObj.activePageIndex, returnedObj]);

      return {
        pageId: trackingObj.activePageIndex,
        pageObj: returnedObj
      };
    }

    /**
     * Mark the all or a specific virtual page as closed and remove from virtual page array.
     * @memberOf digitals2.tracking
     * @param   {string}    [pageId]                    Optional parameter - specific virtual page id if more than one is open
     * @return {Object}                                pageId & page object that this component was added to or an error code object
     */
    function closeVirtualPage(pageId) {
      log.info('closeVirtualPage', pageId);
      var virtualPage = getVirtualPage(pageId),
        pageTrackingArrIndex = 0,
        returnedObj = {};

      try {
        // Throw an error if a pageId is passed but a page object doesn't exist in the page array at the pageId index
        handleErrors((pageId !== undefined && !virtualPage) || getLastActiveVirtualPageId() === 0, 1);

        if (virtualPage) {

          // Set flag marking page closed
          pageTrackingArr[pageId].pageClosed = 'true';

          // Get the last active page in case the page being closed was the last
          trackingObj.activePageIndex = getLastActiveVirtualPageId();
        } else {

          // Get the last active page
          pageTrackingArrIndex = getLastActiveVirtualPageId();

          // Set flag marking page closed
          pageTrackingArr[pageTrackingArrIndex].pageClosed = 'true';

          // Get the last active page again
          trackingObj.activePageIndex = getLastActiveVirtualPageId();
        }

        returnedObj = getPageObject(trackingObj.activePageIndex);

        // Expose new page id (the last active page object) and current page object in window event
        triggerEvent('closeVirtualPage', [trackingObj.activePageIndex, returnedObj]);

        return {
          pageId: trackingObj.activePageIndex,
          pageObj: returnedObj
        };
      } catch (errorObj) {
        log.error('closeVirtualPage', errorObj);
        return errorObj;
      }
    }

    /**
     * Close all virtualPages within the defined params
     * @param {Object}  [options]                   Options object
     * @param {Integer} options.closeAllAfterIdx    The index in the virtual page array where we want to remove all pages after
     * @memberOf digitals2.tracking
     */
    function closeAllVirtualPages(options) {
      log.info('closeVirtualPage', options);
      var vpIdx = trackingObj.pages.length,
        vpLimit = options && options.closeAllAfterIdx || 0;

      for (; vpIdx > vpLimit; vpIdx--) {
        if (getVirtualPage(vpIdx)) {
          closeVirtualPage(vpIdx);
        }
      }
    }

    /**
     * @class
     * @name virtualPage
     * @property {Integer}  idx     The index of the object in the virtual page array
     * @property {Object}   obj     The actual virtual page object
     */

    /** Get the virtual page based on a pageId
     * @memberOf digitals2.tracking.impl
     * @param   {string}                pageId  Virtual page ID
     * @return {Object|Boolean}        Returns page object or false if no object exists and provided index
     */
    function getVirtualPage(pageId) {
      // Check the virtual page array for the specific page ID
      if (pageId !== undefined && pageTrackingArr[pageId] && pageTrackingArr[pageId].pageClosed !== 'true') {
        return pageTrackingArr[pageId];
      }

      return false;
    }

    /** Get the last virtual page that is active
     * @memberOf digitals2.tracking
     * @return {Object} Returns the last active virtual page object
     */
    function getLastActiveVirtualPageId() {

      for (var i = pageTrackingArr.length; i--;) {

        // Get the last active page that doesn't have the pageClosed param set
        if (pageTrackingArr[i].pageClosed !== 'true') {
          return i;
        }
      }
    }

    /** Duplicate the details from main page object to provided pageId
     * @memberOf digitals2.tracking.impl
     * @param   {string}                pageId  Virtual page ID
     */
    function duplicatePageDetails(pageId) {

      var objectToMerge = {
        'user': [
          {
            'profileInfo': mainPageTrackingObj.user[0].profileInfo
          }
        ]
      };

      $.extend(trackingObj.pages[pageId], objectToMerge);
    }

    /** Get page object with the pageId value
     * @memberOf digitals2.tracking.impl
     * @param {string}              pageId  Virtual page ID
     * @return {Object}            Returns page object or error object if no pageId passed or page object doesn't exist at index
     */
    function getPageObject(pageId) {

      try {
        handleErrors(pageId === undefined, 2);

        var virtualPage = getVirtualPage(pageId);

        handleErrors(!virtualPage, 1);

        if (cookiesAllowed) {
          return convertToAdobeDTMProps(pageTrackingArr[pageId]);
        } else {
          return {};
        }
      } catch (errorObj) {
        log.error('getPageObject', errorObj);
        return errorObj;
      }
    }

    /**
     * Get the pages array
     * @memberOf digitals2.tracking.impl
     * @return {Array} The entire pages array
     */
    function getAllPages() {
      // Bail out if cookies aren't allowed
      if (cookiesAllowed) {
        return convertToAdobeDTMProps(pageTrackingArr);
      } else {
        return [];
      }
    }

    /**
     * Public method to check that cookies & tracking are allowed
     * @memberOf digitals2.tracking.impl
     * @return {Boolean} True if tracking allowed, False if not
     */
    function isTrackingDisabled() {
      return !cookiesAllowed;
    }

    /**
     * Public method to switch dev mode on
     * @memberOf digitals2.tracking.impl
     */
    function switchDevModeOn() {
      isDevMode = true;
      log.printAll('', isDevMode);
    }

    /**
     * Public method to access the current page index that a component should interact with
     * @memberOf digitals2.tracking.impl
     */
    function getCurrentPageIndex() {
      return trackingObj.activePageIndex;
    }

    /**
     * Trigger events on the window
     * @memberOf digitals2.tracking.impl
     * @param {string}  eventName       The name of the event to trigger on the window
     * @param {array}   eventParams     Parameters to expose
     *
     */
    function triggerEvent(eventName, eventParams) {
      // Bail out if cookies aren't allowed
      if (cookiesAllowed) {
        $window.trigger(namespace + eventName, eventParams);
      }
    }

    /**
     * Hash a value using a secret passphrase
     *  Embed CryptoJS into API to allow SHA256 hashing
     * @memberOf digitals2.tracking.impl
     * @param {string}  value      The value to hash
     *
     */
    function hashValue(value) {
      /* jshint ignore:start */
      /* jscs:disable*/

      /*
       CryptoJS v3.1.2
       code.google.com/p/crypto-js
       (c) 2009-2013 by Jeff Mott. All rights reserved.
       code.google.com/p/crypto-js/wiki/License
       */
      var CryptoJS = CryptoJS || function (h, s) {
        var f = {}, t = f.lib = {}, g = function () {
          }, j = t.Base = {
            extend: function (a) {
              g.prototype = this;
              var c = new g;
              a && c.mixIn(a);
              c.hasOwnProperty('init') || (c.init = function () {
                c.$super.init.apply(this, arguments)
              });
              c.init.prototype = c;
              c.$super = this;
              return c
            }, create: function () {
              var a = this.extend();
              a.init.apply(a, arguments);
              return a
            }, init: function () {
            }, mixIn: function (a) {
              for (var c in a) a.hasOwnProperty(c) && (this[c] = a[c]);
              a.hasOwnProperty('toString') && (this.toString = a.toString)
            }, clone: function () {
              return this.init.prototype.extend(this)
            }
          },
          q = t.WordArray = j.extend({
            init: function (a, c) {
              a = this.words = a || [];
              this.sigBytes = c != s ? c : 4 * a.length
            }, toString: function (a) {
              return (a || u).stringify(this)
            }, concat: function (a) {
              var c = this.words, d = a.words, b = this.sigBytes;
              a = a.sigBytes;
              this.clamp();
              if (b % 4) for (var e = 0; e < a; e++) c[b + e >>> 2] |= (d[e >>> 2] >>> 24 - 8 * (e % 4) & 255) << 24 - 8 * ((b + e) % 4); else if (65535 < d.length) for (e = 0; e < a; e += 4) c[b + e >>> 2] = d[e >>> 2]; else c.push.apply(c, d);
              this.sigBytes += a;
              return this
            }, clamp: function () {
              var a = this.words, c = this.sigBytes;
              a[c >>> 2] &= 4294967295 <<
                32 - 8 * (c % 4);
              a.length = h.ceil(c / 4)
            }, clone: function () {
              var a = j.clone.call(this);
              a.words = this.words.slice(0);
              return a
            }, random: function (a) {
              for (var c = [], d = 0; d < a; d += 4) c.push(4294967296 * h.random() | 0);
              return new q.init(c, a)
            }
          }), v = f.enc = {}, u = v.Hex = {
            stringify: function (a) {
              var c = a.words;
              a = a.sigBytes;
              for (var d = [], b = 0; b < a; b++) {
                var e = c[b >>> 2] >>> 24 - 8 * (b % 4) & 255;
                d.push((e >>> 4).toString(16));
                d.push((e & 15).toString(16))
              }
              return d.join('')
            }, parse: function (a) {
              for (var c = a.length, d = [], b = 0; b < c; b += 2) d[b >>> 3] |= parseInt(a.substr(b,
                2), 16) << 24 - 4 * (b % 8);
              return new q.init(d, c / 2)
            }
          }, k = v.Latin1 = {
            stringify: function (a) {
              var c = a.words;
              a = a.sigBytes;
              for (var d = [], b = 0; b < a; b++) d.push(String.fromCharCode(c[b >>> 2] >>> 24 - 8 * (b % 4) & 255));
              return d.join('')
            }, parse: function (a) {
              for (var c = a.length, d = [], b = 0; b < c; b++) d[b >>> 2] |= (a.charCodeAt(b) & 255) << 24 - 8 * (b % 4);
              return new q.init(d, c)
            }
          }, l = v.Utf8 = {
            stringify: function (a) {
              try {
                return decodeURIComponent(escape(k.stringify(a)))
              } catch (c) {
                throw Error('Malformed UTF-8 data');
              }
            }, parse: function (a) {
              return k.parse(unescape(encodeURIComponent(a)))
            }
          },
          x = t.BufferedBlockAlgorithm = j.extend({
            reset: function () {
              this._data = new q.init;
              this._nDataBytes = 0
            }, _append: function (a) {
              'string' == typeof a && (a = l.parse(a));
              this._data.concat(a);
              this._nDataBytes += a.sigBytes
            }, _process: function (a) {
              var c = this._data, d = c.words, b = c.sigBytes, e = this.blockSize, f = b / (4 * e),
                f = a ? h.ceil(f) : h.max((f | 0) - this._minBufferSize, 0);
              a = f * e;
              b = h.min(4 * a, b);
              if (a) {
                for (var m = 0; m < a; m += e) this._doProcessBlock(d, m);
                m = d.splice(0, a);
                c.sigBytes -= b
              }
              return new q.init(m, b)
            }, clone: function () {
              var a = j.clone.call(this);
              a._data = this._data.clone();
              return a
            }, _minBufferSize: 0
          });
        t.Hasher = x.extend({
          cfg: j.extend(), init: function (a) {
            this.cfg = this.cfg.extend(a);
            this.reset()
          }, reset: function () {
            x.reset.call(this);
            this._doReset()
          }, update: function (a) {
            this._append(a);
            this._process();
            return this
          }, finalize: function (a) {
            a && this._append(a);
            return this._doFinalize()
          }, blockSize: 16, _createHelper: function (a) {
            return function (c, d) {
              return (new a.init(d)).finalize(c)
            }
          }, _createHmacHelper: function (a) {
            return function (c, d) {
              return (new w.HMAC.init(a,
                d)).finalize(c)
            }
          }
        });
        var w = f.algo = {};
        return f
      }(Math);
      (function (h) {
        for (var s = CryptoJS, f = s.lib, t = f.WordArray, g = f.Hasher, f = s.algo, j = [], q = [], v = function (a) {
          return 4294967296 * (a - (a | 0)) | 0
        }, u = 2, k = 0; 64 > k;) {
          var l;
          a: {
            l = u;
            for (var x = h.sqrt(l), w = 2; w <= x; w++) if (!(l % w)) {
              l = !1;
              break a
            }
            l = !0
          }
          l && (8 > k && (j[k] = v(h.pow(u, 0.5))), q[k] = v(h.pow(u, 1 / 3)), k++);
          u++
        }
        var a = [], f = f.SHA256 = g.extend({
          _doReset: function () {
            this._hash = new t.init(j.slice(0))
          }, _doProcessBlock: function (c, d) {
            for (var b = this._hash.words, e = b[0], f = b[1], m = b[2], h = b[3], p = b[4], j = b[5], k = b[6], l = b[7], n = 0; 64 > n; n++) {
              if (16 > n) a[n] =
                c[d + n] | 0; else {
                var r = a[n - 15], g = a[n - 2];
                a[n] = ((r << 25 | r >>> 7) ^ (r << 14 | r >>> 18) ^ r >>> 3) + a[n - 7] + ((g << 15 | g >>> 17) ^ (g << 13 | g >>> 19) ^ g >>> 10) + a[n - 16]
              }
              r = l + ((p << 26 | p >>> 6) ^ (p << 21 | p >>> 11) ^ (p << 7 | p >>> 25)) + (p & j ^ ~p & k) + q[n] + a[n];
              g = ((e << 30 | e >>> 2) ^ (e << 19 | e >>> 13) ^ (e << 10 | e >>> 22)) + (e & f ^ e & m ^ f & m);
              l = k;
              k = j;
              j = p;
              p = h + r | 0;
              h = m;
              m = f;
              f = e;
              e = r + g | 0
            }
            b[0] = b[0] + e | 0;
            b[1] = b[1] + f | 0;
            b[2] = b[2] + m | 0;
            b[3] = b[3] + h | 0;
            b[4] = b[4] + p | 0;
            b[5] = b[5] + j | 0;
            b[6] = b[6] + k | 0;
            b[7] = b[7] + l | 0
          }, _doFinalize: function () {
            var a = this._data, d = a.words, b = 8 * this._nDataBytes, e = 8 * a.sigBytes;
            d[e >>> 5] |= 128 << 24 - e % 32;
            d[(e + 64 >>> 9 << 4) + 14] = h.floor(b / 4294967296);
            d[(e + 64 >>> 9 << 4) + 15] = b;
            a.sigBytes = 4 * d.length;
            this._process();
            return this._hash
          }, clone: function () {
            var a = g.clone.call(this);
            a._hash = this._hash.clone();
            return a
          }
        });
        s.SHA256 = g._createHelper(f);
        s.HmacSHA256 = g._createHmacHelper(f)
      })(Math);

      /* jscs:enable*/
      /* jshint ignore:end */

      // Hash our value with SHA256
      // Parse the value as UTF8
      // Return the hash as a hex string
      return CryptoJS.SHA256(CryptoJS.enc.Utf8.parse(value)).toString(CryptoJS.enc.Hex);
    }

    /**
     * Pass all object through this conversion to ensure we're always passing strings to the dataLayer
     * @memberOf digitals2.tracking.impl
     * @param {Object}     data      The object that we want to convert the properties of
     */
    function convertToAdobeDTMProps(data) {
      var exclude = ['array', 'function', 'object'];

      (function update(obj) {
        for (var key in obj) {
          if (obj.hasOwnProperty(key)) {
            var value = obj[key],
              type = $.type(value);
            if ($.inArray(type, exclude) === -1) {
              // convert to string
              obj[key] = value + '';
            } else if (type === 'object' || type === 'array') {
              update(obj[key]);
            }
          }
        }
      }(data));

      return data;
    }

    /**
     * Get a cookie, and create if it doesn't exist
     * @memberOf digitals2.tracking.impl
     *
     * @param   {Object}  options                     Options object
     * @param   {String}  options.cookiesDisallowed   The default value to return if cookies are not allowed
     * @param   {String}  options.cookieId            The name of the cookie we want to get
     * @param   {String}  options.cookieValue         The value of the cookie if it doesn't exist. You'll need to stringify objects.
     * @return  {String}                              The value of the cookie
     */
    function getCookie(options) {
      if (!cookiesAllowed) {
        return options.cookiesDisallowed;
      }

      // If the cookie doesn't exist, and we're allowed cookies, create it with default values
      if (!ccapi.getCookie(options.cookieId)) {
        ccapi.setCookie(options.cookieId, options.cookieValue);
      }

      return ccapi.getCookie(options.cookieId);
    }

    /**
     * Handle errors
     * @memberOf digitals2.tracking.impl
     * @param {Boolean}     isError     Should an error message be thrown
     * @param {Number}      errorCode   The number of the error code
     */
    function handleErrors(isError, errorCode) {
      var errorObject = {};

      if (isError) {
        errorObject = ERRORS['CODE' + errorCode];

        if (isDevMode) {
          log.error(errorObject);
        }

        // Throw an exception
        throw errorObject;
      }
    }

    /**
     * Returns the version of the current api implementation.
     * @memberOf digitals2.tracking.impl
     *
     * @returns {string} the version of the current api implementation.
     */
    function getVersion() {
      return Constants.API_VERSION;
    }

    /**
     * Indicates if the api is used in an iframe or not.
     *
     * @returns {boolean} true, if the api is used in an iFrame, false else.
     * @since 0.7.6p
     */
    function inContentWindow() {
      return window !== window.top;
    }

    /**
     * Indicates if the api runs in dev mode or not.
     *
     * @returns {boolean} true, if the api is used in dev mode, false else.
     * @since 0.7.6.1p
     */
    function isDevMode() {
      return isDevMode;
    }

    function registerObserverCallback(callbackFunction) {
      APIInitializationObserver.registerObserverCallback(callbackFunction);
    }

    // Check for consent change and re-run init
    if (ccEnabled) {
      ccapi.registerOnConsentChange(init);
      if (!ccapi.isInitialized()) {
        ccapi.registerOnInitialized(init);
      } else {
        init();
      }
    } else {
      init();
    }

    function getObserver() {
      return APIInitializationObserver;
    }

    //---------------------------------------------------------------------------
    //
    //            Virtual Page Adapter
    //
    //---------------------------------------------------------------------------

    var virtualPageAdapter = (function () {

      var cache = {};

      //------------------------------------------------------------------------
      //
      //          Private Methods
      //
      //------------------------------------------------------------------------

      function getContextByName(contextName) {
        var normalized = contextName || 'default';
        if (!cache[normalized]) {
          cache[normalized] = {
            name: normalized,
            pages: []
          };
        }
        return cache[normalized];
      }

      function getLastPageForContext(contextName) {
        var pages = getOpenPagesForContext(contextName);
        return pages[pages.length - 1];
      }

      function getPageIndexOfPageForContext(contextName, pageObj) {
        var pages = getPagesForContext(contextName)
          .filter(isOpen)
          .filter(function (pageData, index, harray) {
            return pageData.pageObj === pageObj;
          })
          .map(function (pageData, index, harray) {
            return pageData.pageId;
          });
        if (!!pages.length) {
          return pages[0];
        } else {
          return 0;
        }
      }

      function getPageIndexOfCurrentPageForContext(contextName) {
        return getPageIndexOfPageForContext(contextName, getCurrentPageForContext(contextName));
      }

      function getPageObj(pageData) {
        if (pageData.pageObj && pageData.pageId) {
          return pageData.pageObj;
        } else if (pageData.pageInstanceId) { // in case of a wrongly passed argument
          return pageData;
        } else {
          return null;
        }
      }

      function getPagesForContext(contextName) {
        return getContextByName(contextName).pages;
      }

      function isOpen(pageData, index, arr) {
        return pageData.pageObj.pageClosed !== 'true';
      }

      //------------------------------------------------------------------------
      //
      //          Public Method Implementations
      //
      //------------------------------------------------------------------------

      function addEventForCurrentPageOfContext(contextName, event) {
        return addEventTracking({}, event, getPageIndexOfCurrentPageForContext(contextName));
      }

      function addVirtualPageForContext(contextName, pageObj) {
        getPagesForContext(contextName)
          .push(addVirtualPage(pageObj, pageObj.page.pageInfo.destinationUrl, pageObj.page.pageInfo.referringUrl));
        return getLastPageForContext(contextName);
      }

      function closeAllVirtualPagesOfContext(contextName) {
        getPagesForContext(contextName)
          .filter(isOpen)
          .forEach(function (pageData, index, arr) {
            closeVirtualPage(pageData.pageId);
          });
      }

      function closeVirtualPageOfContext(contextName, pageObj) {
        getPagesForContext(contextName)
          .forEach(function (pageData, index, arr) {
            if (pageData.pageObj === pageObj) {
              closeVirtualPage(pageData.pageId);
            }
          });
      }

      function getOpenPagesForContext(contextName) {
        return getPagesForContext(contextName)
          .filter(isOpen)
          .map(getPageObj)
          .filter(function (pageObj, index, arr) {
            return null !== pageObj;
          });
      }

      function getCurrentPageForContext(contextName) {
        var pages = getOpenPagesForContext(contextName);
        if (!pages.length) {
          return getPageObject(0);
        }
        return pages[pages.length - 1];
      }

      function newVirtualPageForContext(contextName) {
        return addVirtualPageForContext(contextName, getLastPageForContext(contextName) || getPageObject(0));
      }

      //------------------------------------------------------------------------
      //
      //          Public Methods Export
      //
      //------------------------------------------------------------------------

      return {
        addEventForCurrentPageOfContext: addEventForCurrentPageOfContext,
        addVirtualPageForContext: addVirtualPageForContext,
        closeAllVirtualPagesOfContext: closeAllVirtualPagesOfContext,
        closeVirtualPageOfContext: closeVirtualPageOfContext,
        getCurrentPageForContext: getCurrentPageForContext,
        getOpenPagesForContext: getOpenPagesForContext,
        getPageIndexOfCurrentPageForContext: getPageIndexOfCurrentPageForContext,
        getPageIndexOfPageForContext: getPageIndexOfPageForContext,
        newVirtualPageForContext: newVirtualPageForContext
      };
    }());

    /* Public Methods */
    return {
      getClcCookie: getClcCookie,
      deleteClcCookie: deleteClcCookie,
      addEventForCurrentPageOfContext: virtualPageAdapter.addEventForCurrentPageOfContext,
      addEventTracking: addEventTracking,
      addVirtualPage: addVirtualPage,
      addVirtualPageForContext: virtualPageAdapter.addVirtualPageForContext,
      closeAllVirtualPages: closeAllVirtualPages,
      closeAllVirtualPagesOfContext: virtualPageAdapter.closeAllVirtualPagesOfContext,
      closeVirtualPage: closeVirtualPage,
      closeVirtualPageOfContext: virtualPageAdapter.closeVirtualPageOfContext,
      eventCookieSave: eventCookieSave,
      getAllPages: getAllPages,
      getCurrentPageForContext: virtualPageAdapter.getCurrentPageForContext,
      getCurrentPageIndex: getCurrentPageIndex,
      getObserver: getObserver,
      getOpenPagesForContext: virtualPageAdapter.getOpenPagesForContext,
      getPageObject: getPageObject,
      getTargetOrigin: getTargetOrigin,
      getVersion: getVersion,
      inContentWindow: inContentWindow,
      initComponentTracking: initComponentTracking,
      initProductTracking: initProductTracking,
      initTracking: initTracking,
      isDevMode: isDevMode,
      isTrackingDisabled: isTrackingDisabled,
      newVirtualPageForContext: virtualPageAdapter.newVirtualPageForContext,
      registerObserverCallback: registerObserverCallback,
      setTargetOrigin: setTargetOrigin,
      switchDevModeOn: switchDevModeOn,
      trackClickEvents: trackClickEvents,
      updateComponentTracking: updateComponentTracking,
      updateProductTracking: updateProductTracking,
      updateUser: updateUser
    };
  }

  return {
    getInstance: function (dataLayer, targetOrigins, eventArrayLength) {
      if (_.isEmpty(dataLayer)) {
        log.error('getInstance, dataLayer may not be empty', dataLayer, targetOrigins, eventArrayLength);
        return false;
      }

      if (!instance) {
        instance = initTracking(dataLayer, eventArrayLength || 50);
      }
      return instance;
    }
  };

})(window.digitals2.$, window, window.digitals2.$(window), document, window.cookiecontroller);

/**
 * Changes in 0.7.6.1p:
 * - BMWST-2661: poviding the possibility to send messages
 *   via {@link Window#postmessage} between windows/iframes.
 * - implementation guideline: https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage
 *
 * @version 0.7.6.1p
 */
window.digitals2.tracking.impl = (function ($, window, $window, document, cookiecontroller, core, undefined) {

  'use strict';

  var log = window.digitals2.tracking.loggerForCategory('digitals2.tracking');
  // Instance stores a reference to the Singleton
  var Constants = window.digitals2.tracking.Constants;
  var coreInstance = null;
  var scope = {pageId: 10};
  var delegate = null;

  function post(window, member, args, type) {
    var message = null;

    try {
      if (member === 'request:addVirtualPage') {
        message = JSON.stringify({
          methodName: member,
          args: args,
          type: type,
          digitalData: coreInstance.getPageObject(0)
        });
      } else {
        message = JSON.stringify({methodName: member, args: args, type: type});
      }
    } catch (e) {
      log.error('post', e);
    }

    if (window && message) {
      window.postMessage(message, '*');
    }
  }

  function getPageId() {
    return scope.pageId;
  }

  function initTracking(coreInstance, delegate, dataLayer, targetOrigins) {
    log.info('initTracking');
    var delegatedMethods = ['addEventTracking'];
    for (var methodName in coreInstance) {
      if (_.isFunction(coreInstance[methodName])) {
        delegate[methodName] = coreInstance[methodName];
      }
    }

    delegate.isDelegate = true;

    _.each(delegatedMethods, function (member) {
      delegate[member] = function () {
        var args = [];
        var params = [];
        for (var i = 0; i < arguments.length; i++) {
          params[i] = args[i] = arguments[i]
        }
        args[args.length - 2] = getPageId();
        params[params.length - 2] = 0;

        log.info('member:', member, 'args', args);
        post(window.parent, member, args, arguments[arguments.length - 1], delegate);
        return coreInstance[member].apply(coreInstance[member], params);
      };
    });

    return delegate;
  }

  function isAllowedDomain(coreInstance, targetOrigins, origin) {
    if (coreInstance.inContentWindow() || '*' == targetOrigins.toString()) {
      return true;
    }

    if (!targetOrigins.length) {
      return false;
    }

    return targetOrigins.indexOf(origin) > -1;
  }

  function broker(coreInstance, delegate, dataLayer, targetOrigins) {
    $(window).on("message onmessage", function messageHandler(event) {
      log.info('messageHandler', event.originalEvent.origin);
      var messageEvent = event.originalEvent;
      var origin = messageEvent.origin;
      var data = messageEvent.data;
      var ret = null;
      if (!isAllowedDomain(coreInstance, targetOrigins, origin)) {
        return;
      }

      /** @type {{args: Array, methodName: string type: string }} */
      var message;
      try {
        // jQuery contains MessageEvent.
        message = JSON.parse(data);
      } catch (e) {
        log.error('broker', e);
      }

      if (message) {
        log.info('message:' + message.methodName, message.args);
        // top frame
        if (!coreInstance.inContentWindow()) {
          if (message.methodName === 'request:addVirtualPage') {
            var page = coreInstance.getPageObject(0);
            ret = coreInstance.addVirtualPage.apply(coreInstance, [page, message.args[1], message.args[2]]);
            if (ret && ret.pageId) {
              scope.pageId = ret.pageId;
              if (message.digitalData) {
                var digitalData = message.digitalData;
                var pageObject = coreInstance.getPageObject(ret.pageId);
                log.debug('merging', pageObject, digitalData);
                $.extend(true, pageObject, digitalData);
                if (_.has(pageObject, 'page.attributes.virtualPage')) {
                  pageObject.page.attributes.virtualPage = 'true'
                }
              }
            }
            post(messageEvent.source, 'response:addVirtualPage', [ret.pageId], '')
          } else if (coreInstance[message.methodName]) {
            ret = coreInstance[message.methodName].apply(coreInstance, message.args);
            var options = {
              active: true,
              name: message.type,
              timing: true,
              type: message.type,
              useTimer: false
            };
            if (message.type && '' != message.type) {
              $(window).trigger('ds2trackEvent', [ret, options]);
            }
          }
        } else {
          if (message.methodName === 'response:addVirtualPage') {
            scope.pageId = message.args[0];
          }
        }
      }
    });
  }

  return {
    getInstance: function getInstance(dataLayer, targetOrigins, eventArrayLength) {
      // the delegate has been initialized and may be returned directly.
      if (delegate) {
        return delegate;
      }

      if (_.isEmpty(dataLayer)) {
        return false;
      }

      targetOrigins = targetOrigins || [];

      if (!coreInstance) {
        coreInstance = core.getInstance(dataLayer, targetOrigins, eventArrayLength);

        broker(coreInstance, delegate, dataLayer, targetOrigins);

        if (!coreInstance.inContentWindow()) {
          $(function () {
            var $iframes = $('.iframe');
            var length = $iframes.length;
            if ($iframes.length === length) {
              $iframes.each(function (index, iframe) {
                post(iframe.contentWindow, 'request:addVirtualPage', [{}, document.location.href, document.referrer],
                  '', coreInstance);
              });
            }
          });

          delegate = coreInstance;
        } else {
          delegate = initTracking(coreInstance, {}, dataLayer, targetOrigins);
          post(window.parent, 'request:addVirtualPage', [{}, document.location.href, document.referrer],
            '', coreInstance);
        }

        $window.trigger(Constants.API_INITIALIZED);
      }
      delegate.getObserver().setApiObject(delegate);
      return delegate;
    }
  };
}(window.digitals2.$, window, window.digitals2.$(window), document, window.cookiecontroller, window.digitals2.tracking.core));

/*
 // example setup for commit hooks.
 window.digitals2.tracking.pageHelper.setCommitHooks({
 'failed::commit': {
 'any': function (pageObj, field, value) {
 console.log('failed::commit "%s": "%s"', field, value);
 return !value; // simple indicator if the value is a valid value or not
 }
 },
 'post::commit': {
 'any': function (pageObj, field, value) {
 console.log('post::commit  "%s": "%s"', field, value);
 }
 },
 'pre::commit': {
 'any': function (pageObj, field, value) {
 console.log('pre::commit: "%s": "%s"', field, value);
 }
 }
 });
 */
