var cookiecontroller = cookiecontroller  || {};
var console = window.console || { log: function() {},debug: function() {},dir: function() {}};

cookiecontroller.api = (function(){
		var initialized = false;
		cookiecontroller.callbackFunctions = [];
		/**
    	 * Returns a boolean stating if the cookie controller is fully initialized
    	 *
    	 */
    	function isInitialized() {
    		return initialized;
    	}


    	function registerOnInitialized(newCallbackFunction) {
			if(!isInitialized()) {
				cookiecontroller.callbackFunctions.push(newCallbackFunction);
			}
			return cookiecontroller.callbackFunctions;
		}

		return {
			/** Publish all enums. */
			isInitialized:isInitialized,
			registerOnInitialized:registerOnInitialized
		};

})();

cookiecontroller.api = (function(registerOnInitialized, myCallback) {

	var ENUM = {
			CONSENT : {
			    ACCEPTED : "ACCEPTED",
			    REJECTED : "REJECTED"
			},
		   EVENTS : {
			   /**
			    * The name of the change event when the cookie state is changed.
			    */
			   EVENT_OPT_STATUS_CHANGED:'cookieController.EVENT_OPT_STATUS_CHANGED'
		   }
	}

	var PRIVATE_ENUM = {
			CONSENT_COOKIE_NAME:"cc_consentCookie",
			SELECTOR:"cc-cookies",
			JSON:"json",
			TEST_COOKIE_NAME : "cookieDetection",
			REGULATION_TYPE : {
			    NONE : "NONE",
			    OPT_OUT : "OPT_OUT",
			    OPT_IN : "OPT_IN"
			   }
			}

	var debug = false;
	var userConsent={};
	var cookieConsentCategoriesMap={};
	var regulation;
	var timestamp;
	var onConsentChangedCallbacks=[];
	var initialized = false;

	/**
	 * Returns a boolean stating if the cookie controller is fully initialized
	 *
	 */
	function isInitialized() {
		return initialized;
	}

	/**
	 * Registers a callback function to be executed once cookie controller is fully initialised.
	 *
	 */
	function registerOnInitialized(newCallback) {
		cookiecontroller.callbackFunctions.push(newCallback);
	}

	/**
	 * This method computes the path of the language or rather the locale
	 * by the path of the current page.
	 *
	 * e.g. /../en or /../en_US
	 *
	 * We use the language or locale path to cache the cookie settings.
	 *
	 * This method returns an array of paths.
	 *
	 * @return {String[]}
	 */
	function getCookiePrivacyCategorieNodesCandidates() {
		var nodeCandidates = [];
		var localeRegex = new RegExp(".*(/[a-z]{2}_[A-Z]{2}[/.]).*");
		var languageRegex = new RegExp(".*(/[a-z]{2}[/.]).*");
		if (localeRegex.test(location.pathname)) {
			/* we add six characters to get the path including the locale node e.g. /en_US */
			nodeCandidates.push(location.pathname.slice(0, location.pathname
					.indexOf(localeRegex.exec(location.pathname)[1]) + 6));
		}
		if (languageRegex.test(location.pathname)) {
			/* we add three characters to get the path including the language node e.g. /en */
			nodeCandidates.push(location.pathname.slice(0, location.pathname
					.indexOf(languageRegex.exec(location.pathname)[1]) + 3));
		}
		return nodeCandidates;
	}
	/**
	 * This method returns the current value of a cookie
	 *
	 * @return {String}
	 */
	function _getCookie(name) {
		var start = document.cookie.indexOf( name + "=" );
		var len = start + name.length + 1;
		if ( ( !start ) && ( name != document.cookie.substring( 0, name.length ) ) ) {
			return null;
		}
		if ( start == -1 ) {
			return null;
			}
		var end = document.cookie.indexOf( ';', len );
		if ( end == -1 ){
			end = document.cookie.length;
		}
		return unescape( document.cookie.substring( len, end ) );
	}

	/**
	 * This method returns the new value of the passed cookie
	 *
	 * @param name			The name of the cookie.
	 * @param value			The value of the cookie. This value is stored on the clients computer; do not store sensitive information.
	 * @param expires		The time the cookie expires. This is a Unix timestamp so is in number of seconds since the epoch.
	 * @param path			The path on the server in which the cookie will be available on. If set to '/', the cookie will be available within the entire domain.
	 * @param domain		The domain that the cookie is available to. Setting the domain to 'www.example.com' will make the cookie available in the www subdomain and higher subdomains.
	 * @param secure		Indicates that the cookie should only be transmitted over a secure HTTPS connection from the client. When set to TRUE, the cookie will only be set if a secure connection exists.
	 */
	function _setCookie( name, value, expires, path, domain, secure ) {
		if(debug) {console.debug("setting cookie "+name+" to value "+ value)}
		if (!isNaN(parseInt(expires))) {
			var days = parseInt(expires), expires_date  = new Date();
			expires_date.setTime(+expires_date + days * 1000 * 60 * 60 * 24);
		}
		document.cookie = name+'='+escape( value ) +
			((expires_date) ? ';expires='+expires_date.toGMTString() : '' ) +
			';path=' + ((path) ? path : '/' ) +
			((domain) ? ';domain=' + domain : '' ) +
			((secure) ? ';secure' : '' );
			return getCookie(name);
	}

	/**
	 * This method deletes the passed cookie.
	 *
	 * @param name			The name of the cookie.
	 * @param path			The path on the server in which the cookie will be available on. If set to '/', the cookie will be available within the entire domain.
	 * @param domain		The domain that the cookie is available to. Setting the domain to 'www.example.com' will make the cookie available in the www subdomain and higher subdomains.
	 */
	function _deleteCookie( name, path, domain ) {
		if ( getCookie( name ) ) document.cookie = name + '=' +
			';path='+( ( path ) ? path : '/') +
			( ( domain ) ? ';domain=' + domain : '' ) +
			';expires=' + new Date(0).toUTCString();
	}

	/**
	 * @return {Object} with attributes cookie (cookie value), consent (ACCEPTED /
	 *         REJECTED), timestamp
	 */
	function readUserConsent() {
		var userConsent = undefined;
		var consentCookie = getCookie(PRIVATE_ENUM.CONSENT_COOKIE_NAME);

		if (typeof consentCookie == "string") {
			try {
				userConsent = JSON.parse(consentCookie);
			} catch (e) {
				userConsent = undefined;
			}
		}
		return userConsent;
	}

	function triggerOnSetConset(){

		onConsentChangedCallbacks.forEach(function(callbackFunction){
			callbackFunction( userConsent && userConsent.consent === ENUM.CONSENT.ACCEPTED);
		});
	}

	function deleteNonOperationalCookies() {
		 $.each(cookieConsentCategoriesMap, function(){
			if(!this['operational']) {
				deleteCookie(this['cookieKey']);
			}
		 });
	}

	/***********************************************************************
	 * Public interface *
	 **********************************************************************/
	/**
	 * Use this method to register a callback method. The callback will be triggered after setRegulationRejected or setRegulationAccepted is called.
	 * @Param {function} callback signature function(accepted)
	 */
	registerOnConsentChange= function(callback) {
		 onConsentChangedCallbacks.push(callback);
	 };
	/**
	 * call this method to switch to debugmode
	 */
	switchDebugOn = function(){
		debug=true;
	};
	/**
	 * call this method to dumps the current state
	 */
	dump = function(){
		console.dir(regulation);
		console.dir(timestamp);
		console.dir(userConsent);
		console.dir(cookieConsentCategoriesMap);
	};
	/**
	 * This method return true if the cookie can be set, if it is allowed by the regulation and the user consent.
	 * Otherwise false
	 * @param key		The cookie name
	 */
	isCookieAllowed = function(key) {
		if(debug) {
			console.dir(regulation);
			console.dir(timestamp);
			console.dir(userConsent);
		}
		var cookie=cookieConsentCategoriesMap[key];
		if(!cookie){
			if(debug) {console.log( 'cookie not defined '+ key);}
			return false;
		}

		if(!cookie.operational && cookie.needsConsent &&  regulation && regulation !== PRIVATE_ENUM.REGULATION_TYPE.NONE){
			if(userConsent && userConsent.consent === ENUM.CONSENT.REJECTED){
				if(debug) {console.debug( 'user has cookies rejected');}
				return false;
			}

			if(regulation === PRIVATE_ENUM.REGULATION_TYPE.OPT_IN && (typeof userConsent ==='undefined' || userConsent.consent !== ENUM.CONSENT.ACCEPTED)){
				if(debug) {console.debug( 'user has not cookies accepted in OPT-ID');}
				return false;
			}
		}
		return true;
	};
	/**
	 * The setter method for the cookie. The cookie will be set, if it is allowed by the regulation and the user consent.
	 * @param key		The cookie name
	 * @param value		The new value for the cookie
	 */
	setCookie = function(key,value) {
		if(debug) {
			console.dir(regulation);
			console.dir(timestamp);
			console.dir(userConsent);
		}
		var cookie=cookieConsentCategoriesMap[key];
		if(cookie && isCookieAllowed(cookie.cookieKey)){
			_setCookie(cookie.cookieKey, value, cookie.expiry);
			return true;
		}else{
			return false;
		}
	};
	/**
	 * Getter method to get the value of a cookie
	 * @param name the name of the cookie
	 */
	getCookie = function(name) {
		return _getCookie(name);
	};
	/**
	 * call this method to delete the passed cookie
	 * @param name the name of the cookie
	 */
	deleteCookie = function(name) {
		return _deleteCookie(name);
	};

	/**
	 * Call this method to switch cookies, where consent is needed, on.
	 */
	setRegulationAccepted = function() {
		 userConsent = {
				 "consent" : ENUM.CONSENT.ACCEPTED,
				 "timestamp" : timestamp
		 };
		 deleteCookie(PRIVATE_ENUM.CONSENT_COOKIE_NAME);
		 setCookie(PRIVATE_ENUM.CONSENT_COOKIE_NAME, JSON.stringify(userConsent));
		 triggerOnSetConset();

	};
	/**
	 * Call this method to switch cookies, where consent is needed, of.
	 */
	setRegulationRejected = function() {
		 deleteNonOperationalCookies();
		 userConsent = {
		      "consent" : ENUM.CONSENT.REJECTED,
	          "timestamp" : timestamp
		 };
		 deleteCookie(PRIVATE_ENUM.CONSENT_COOKIE_NAME);
		 setCookie(PRIVATE_ENUM.CONSENT_COOKIE_NAME, JSON.stringify(userConsent));
		 triggerOnSetConset();

	};
	/**
	 * Return true if the user has cookies accepted.
	 * @return {boolean} True the user has the cookies accepted and the timestamp matches
	 */
	isRegulationAccepted = function() {
		if (!hasRegulation()) {
		   return true;
		}
		if (userConsent !== undefined) {
		  if (userConsent.consent === ENUM.CONSENT.ACCEPTED && userConsent.timestamp===timestamp) {
		    return true;
		  }
		}
		return false;
	};
	/**
	 * The disclaimer must be shown when
	 * 	1. a regulation is active for the website
	 * 	2. the timestamp of the user condsents differs or user has not accepted or rejected cookies (no consens cookie exists)
	 *
	 * On load of any page this method should be called and if true is returned,
	 * a drawer (or similar UI element) to allow the user to accept/reject cookies should be shown.
	 *
	 * @return {boolean} true, when the disclaimer drawer must be shown.
	 */
	showDisclaimer = function() {
		return (userConsent === undefined || userConsent.timestamp !== timestamp ) && hasRegulation();
	};

	/**
	 * returns true if policy type is not 'NONE'. if the site has a cookie regulation, the switch on the cookie policy page for the user's consent must be shown.
	 *
	 * @return {boolean} True if regulation are configured
	 */
	hasRegulation = function() {
		return regulation !== undefined && regulation !== PRIVATE_ENUM.REGULATION_TYPE.NONE;
	};
	/**
	 * returns the current regulation type (e.g. 'OPT-IN', 'OPT-OUT').
	 * @return {String} regulation type
	 */
	getRegulationType = function(){
		return regulation;
	}
	/**
	 * this method returns true if cookies are not disabled by the browser preferences.
	 * @return {boolean} True if not disabled
	 */
	 areBrowserCookiesEnabled= function() {
	    var cookieEnabled = navigator.cookieEnabled;

	    if (cookieEnabled === false) {
	      return false;
	    }

	    if (!document.cookie && cookieEnabled === null) {
	      document.cookie = PRIVATE_ENUM.TEST_COOKIE_NAME + "=1";

	      if (!document.cookie && cookieEnabled === null) {
	        return false;
	      } else {
	        document.cookie = PRIVATE_ENUM.TEST_COOKIE_NAME + "=; expires=" + new Date(0).toUTCString();
	      }
	    }
	    return true;
	 };

	/***********************************************************************
	 * Initialization *
	 **********************************************************************/

	var urls=getCookiePrivacyCategorieNodesCandidates();
	if(debug) {console.dir(urls)}

	urls.forEach(function(url, i){

		if(debug) {console.log(url);}

		var callback = function(cookieConsentCategoriesJson){
			cookieConsentCategories=cookieConsentCategoriesJson;
			if(debug) {console.dir(cookieConsentCategories)}

			cookieConsentCategoriesMap={};
			for (j = 0; j < cookieConsentCategoriesJson.cookies.length; j++) {
				var cookie=cookieConsentCategoriesJson.cookies[j];
				cookieConsentCategoriesMap[cookie.cookieKey]=cookie;
			}
			regulation=cookieConsentCategoriesJson.regulation;
			timestamp=cookieConsentCategoriesJson.timestamp;

			//if it is last url to be loaded, initialization is completed.
			if (urls.length == i+1) {
				if (debug) {console.log('initialization finished');}
				initialized = true;
			}
		}
		cookiecontroller.http.json(url+"."+PRIVATE_ENUM.SELECTOR+"."+PRIVATE_ENUM.JSON, callback, false, this);
	});

	userConsent=readUserConsent();

	if(userConsent !== undefined && timestamp !== undefined && userConsent.timestamp !== timestamp) {
		deleteNonOperationalCookies();
		userConsent=readUserConsent();
	}

	return {
		/** Publish all enums. */
		isInitialized:isInitialized,
		dump:dump,
		isCookieAllowed:isCookieAllowed,
		switchDebugOn:switchDebugOn,
		setCookie:setCookie,
		getCookie:getCookie,
		deleteCookie:deleteCookie,
		setRegulationAccepted:setRegulationAccepted,
		setRegulationRejected:setRegulationRejected,
		isRegulationAccepted:isRegulationAccepted,
		getRegulationType:getRegulationType,
		ENUM_REGULATION_TYPE: PRIVATE_ENUM.REGULATION_TYPE,
		showDisclaimer:showDisclaimer,
		hasRegulation:hasRegulation,
		areBrowserCookiesEnabled:areBrowserCookiesEnabled,
		registerOnConsentChange:registerOnConsentChange,
		registerOnInitialized:registerOnInitialized
	};
})();

function executeCookieControllerCallbackFunctions(){
	if(cookiecontroller.api.isInitialized()){
		clearTimeout(timeout);
		if(cookiecontroller.callbackFunctions !== undefined) {
			for (i = 0; i < cookiecontroller.callbackFunctions.length; i++ ) {
				cookiecontroller.callbackFunctions[i]();
			}
		}
	}

}

var timeout = setInterval(executeCookieControllerCallbackFunctions, 100);
