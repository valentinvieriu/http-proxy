/* Parts of the code are based on iframeResizer.contentWindow.js by David J. Bradshaw - MIT License" */

;(function(window, document, undefined) {
	'use strict';

	var config = {
			autoResize            : true,
			base                  : 10,
			calculateWidth        : false,
			doubleEventList       : { 'resize': 1, 'click': 1 },
			eventCancelTimer      : 128,
			height                : 1,
			firstRun              : true,
			heightCalcModeDefault : 'offset',
			heightCalcMode        : 'offset',
			initLock              : true,
			initMsg               : '',
			inPageLinks           : {},
			interval              : 32,
			logging               : false,
			msgID                 : '[iFrameSizer]',  //Must match host page msg ID
			msgIdLen              : 0,
			myID                  : '',
			publicMethods         : false,
			resetRequiredMethods  : { max: 1, scroll: 1, bodyScroll: 1 ,documentElementScroll: 1 },
			targetOriginDefault   : '*',
			target                : window.parent,
			tolerance             : 0,
			triggerLocked         : false,
			triggerLockedTimer    : null,
			width                 : 1
	};

	config.msgIdLen = config.msgID.length;

	function addEventListener(el, evt, func) {
		if ('addEventListener' in window){
			el.addEventListener(evt, func, false);
		} else if ('attachEvent' in window){
			el.attachEvent('on' + evt, func);
		}
	}

	function init() {
		readData();
		injectClearFixIntoBodyElement();
		checkHeightMode();
		stopInfiniteResizingOfIFrame();
		setupPublicMethods();
		startEventListeners();
		config.inPageLinks = setupInPageLinks();
		sendSize('init', 'Init message from host page');
	}

	function readData() {
		var data = config.initMsg.substr(config.msgIdLen).split(':');

		function strBool(str){
			return str === 'true';
		}

		config.myID             = data[0];
		config.calculateWidth   = (undefined !== data[2]) ? strBool(data[2])  : config.calculateWidth;
		config.logging          = (undefined !== data[3]) ? strBool(data[3])  : config.logging;
		config.interval         = (undefined !== data[4]) ? Number(data[4])   : config.interval;
		config.publicMethods    = (undefined !== data[5]) ? strBool(data[5])  : config.publicMethods;
		config.autoResize       = (undefined !== data[6]) ? strBool(data[6])  : config.autoResize;
		config.heightCalcMode   = (undefined !== data[8]) ? data[8]           : config.heightCalcMode;
		config.tolerance        = (undefined !== data[11]) ? Number(data[11]) : config.tolerance;
	}

	function stopInfiniteResizingOfIFrame() {
		document.documentElement.style.height = '';
		document.body.style.height = '';
	}

	function addTriggerEvent(options) {

		function addListener(eventName) {
			addEventListener(window, eventName, function() {
				sendSize(options.eventName, options.eventType);
			});
		}

		if (options.eventNames && Array.prototype.map){
			options.eventName = options.eventNames[0];
			options.eventNames.map(addListener);
		} else {
			addListener(options.eventName);
		}
	}

	function initEventListeners() {
		addTriggerEvent({ eventType: 'Animation Start',           eventNames: ['animationstart','webkitAnimationStart'] });
		addTriggerEvent({ eventType: 'Animation Iteration',       eventNames: ['animationiteration','webkitAnimationIteration'] });
		addTriggerEvent({ eventType: 'Animation End',             eventNames: ['animationend','webkitAnimationEnd'] });
		addTriggerEvent({ eventType: 'Device Orientation Change', eventName:  'deviceorientation' });
		addTriggerEvent({ eventType: 'Transition End',            eventNames: ['transitionend','webkitTransitionEnd','MSTransitionEnd','oTransitionEnd','otransitionend'] });
		addTriggerEvent({ eventType: 'Window Clicked',            eventName:  'click' });
		addTriggerEvent({ eventType: 'Window Resized',            eventName:  'resize' });
	}

	function checkHeightMode() {
		if (config.heightCalcModeDefault !== config.heightCalcMode) {
			if (!(config.heightCalcMode in getHeight)) {
				config.heightCalcMode='bodyScroll';
			}
		}
	}

	function startEventListeners() {
		if (config.autoResize === true) {
			initEventListeners();
			setupMutationObserver();
		}
	}

	function injectClearFixIntoBodyElement() {
		var clearFix = document.createElement('div');

		clearFix.style.clear = 'both';
		clearFix.style.display = 'block';

		document.body.appendChild(clearFix);
	}

	function setupInPageLinks() {

		function getPagePosition () {
			return {
				x: (window.pageXOffset !== undefined) ? window.pageXOffset : document.documentElement.scrollLeft,
				y: (window.pageYOffset !== undefined) ? window.pageYOffset : document.documentElement.scrollTop
			};
		}

		function getElementPosition(el) {
			var elPosition   = el.getBoundingClientRect(),
				pagePosition = getPagePosition();

			return {
				x: parseInt(elPosition.left, 10) + parseInt(pagePosition.x, 10),
				y: parseInt(elPosition.top, 10)  + parseInt(pagePosition.y, 10)
			};
		}

		function findTarget(href) {

			function jumpToTaget(target) {
				var jumpPosition = getElementPosition(target);

				sendMsg(jumpPosition.y, jumpPosition.x, 'scrollToOffset');
			}

			var	target = document.querySelector(href) || document.querySelector('[name="' + href.substr(1) + '"]');

			if (null !== target) {
				jumpToTaget(target);
			} else {
				sendMsg(0, 0, 'inPageLink', href);
			}
		}

		function checkLocationHash() {
			var hash = location.hash;

			if ('' !== hash && '#' !== hash && '#/' !== hash.substr(0,2)){
				findTarget(hash);
			}
		}

		function bindAnchors() {
			function setupLink(el) {
				function linkClicked(e) {
					e.preventDefault();

					/*jshint validthis:true */
					findTarget(this.getAttribute('href'));
				}

				if ('#' !== el.getAttribute('href')) {
					addEventListener(el, 'click', linkClicked);
				}
			}

			Array.prototype.forEach.call(document.querySelectorAll('a[href^="#"]'), setupLink);
		}

		function bindLocationHash() {
			addEventListener(window, 'hashchange', checkLocationHash);
		}

		function initCheck() {
			setTimeout(checkLocationHash, config.eventCancelTimer);
		}

		if (Array.prototype.forEach && document.querySelectorAll) {
			bindAnchors();
			bindLocationHash();
			initCheck();
		}

		return {
			findTarget: findTarget
		};
	}

	function setupPublicMethods() {
		if (config.publicMethods) {

			window.parentIFrame = {
				close: function() {
					sendSize('close', 'parentIFrame.close()', 0, 0);
				},

				getId: function() {
					return config.myID;
				},

				moveToAnchor: function(hash) {
					config.inPageLinks.findTarget(hash);
				},

				reset: function() {
					resetIFrame('parentIFrame.reset');
				},

				scrollTo: function(x, y) {
					sendMsg(y, x, 'scrollTo');
				},

				scrollToOffset: function(x, y){
					sendMsg(y, x, 'scrollToOffset');
				},

				sendMessage: function(msg, targetOrigin) {
					sendMsg(0, 0, 'message', JSON.stringify(msg), targetOrigin);
				},

				setHeightCalculationMethod: function(heightCalculationMethod) {
					config.heightCalcMode = heightCalculationMethod;
					checkHeightMode();
				},

				setTargetOrigin: function (targetOrigin) {
					config.targetOriginDefault = targetOrigin;
				},

				size: function(customHeight, customWidth) {
					var valString = '' + (customHeight ? customHeight : '') + (customWidth ? ',' + customWidth : '');
					lockTrigger();
					sendSize('size', 'parentIFrame.size(' + valString + ')', customHeight, customWidth);
				}
			};
		}
	}

	function initInterval() {
		if (config.interval !== 0) {
			setInterval(function() {
				sendSize('interval', 'setInterval: ' + config.interval);
			}, Math.abs(config.interval));
		}
	}

	function setupInjectElementLoadListners(mutations) {
		function addLoadListener(element){
			if (element.height === undefined || element.width === undefined || 0 === element.height || 0 === element.width) {
				addEventListener(element, 'load', function() {
					sendSize('imageLoad', 'Image loaded');
				});
			}
		}

		mutations.forEach(function(mutation) {
			if (mutation.type === 'attributes' && mutation.attributeName === 'src') {
				addLoadListener(mutation.target);
			} else if (mutation.type === 'childList') {
				var images = mutation.target.querySelectorAll('img');
				Array.prototype.forEach.call(images, function(image) {
					addLoadListener(image);
				});
			}
		});
	}

	function setupMutationObserver(){
		var MutationObserver = window.MutationObserver || window.WebKitMutationObserver;

		function createMutationObserver(){
			var target = document.querySelector('body'),

				config = {
					attributes            : true,
					attributeOldValue     : false,
					characterData         : true,
					characterDataOldValue : false,
					childList             : true,
					subtree               : true
				},

				observer = new MutationObserver(function(mutations) {
					sendSize('mutationObserver', 'mutationObserver: ' + mutations[0].target + ' ' + mutations[0].type);
					setupInjectElementLoadListners(mutations);
				});

			observer.observe(target, config);
		}

		if (MutationObserver) {
			if (config.interval < 0) {
				initInterval();
			} else {
				createMutationObserver();
			}
		} else {
			initInterval();
		}
	}

	function getBodyOffsetHeight() {
		function getComputedBodyStyle(prop) {
			function convertUnitsToPxForIE8(value) {
				var PIXEL = /^\d+(px)?$/i;

				if (PIXEL.test(value)) {
					return parseInt(value, config.base);
				}

				var style = el.style.left,
					runtimeStyle = el.runtimeStyle.left;

				el.runtimeStyle.left = el.currentStyle.left;
				el.style.left = value || 0;
				value = el.style.pixelLeft;
				el.style.left = style;
				el.runtimeStyle.left = runtimeStyle;

				return value;
			}

			var el = document.body,
				retVal = 0;

			if (('defaultView' in document) && ('getComputedStyle' in document.defaultView)) {
				retVal = document.defaultView.getComputedStyle(el, null);
				retVal = (null !== retVal) ? retVal[prop] : 0;
			} else {
				retVal = convertUnitsToPxForIE8(el.currentStyle[prop]);
			}

			return parseInt(retVal, config.base);
		}

		return 	document.body.offsetHeight +
				getComputedBodyStyle('marginTop') +
				getComputedBodyStyle('marginBottom');
	}

	function getBodyScrollHeight() {
		return document.body.scrollHeight;
	}

	function getDEOffsetHeight() {
		return document.documentElement.offsetHeight;
	}

	function getDEScrollHeight() {
		return document.documentElement.scrollHeight;
	}

	function getLowestElementHeight() {
		var allElements       = document.querySelectorAll('body *'),
			allElementsLength = allElements.length,
			maxBottomVal      = 0;

		for (var i = 0; i < allElementsLength; i++) {
			if (allElements[i].getBoundingClientRect().bottom > maxBottomVal) {
				maxBottomVal = allElements[i].getBoundingClientRect().bottom;
			}
		}

		return maxBottomVal;
	}

	function getAllHeights() {
		return [
			getBodyOffsetHeight(),
			getBodyScrollHeight(),
			getDEOffsetHeight(),
			getDEScrollHeight()
		];
	}

	function getMaxHeight() {
		return Math.max.apply(null,getAllHeights());
	}

	function getMinHeight() {
		return Math.min.apply(null,getAllHeights());
	}

	function getBestHeight() {
		return Math.max(getBodyOffsetHeight(),getLowestElementHeight());
	}

	var getHeight = {
		offset                : getBodyOffsetHeight,
		bodyOffset            : getBodyOffsetHeight,
		bodyScroll            : getBodyScrollHeight,
		documentElementOffset : getDEOffsetHeight,
		scroll                : getDEScrollHeight,
		documentElementScroll : getDEScrollHeight,
		max                   : getMaxHeight,
		min                   : getMinHeight,
		grow                  : getMaxHeight,
		lowestElement         : getBestHeight
	};

	function getWidth() {
		return Math.max(
			document.documentElement.scrollWidth,
			document.body.scrollWidth
		);
	}

	function sendSize(triggerEvent, triggerEventDesc, customHeight, customWidth) {
		var	currentHeight, currentWidth;

		function resizeIFrame() {
			config.height = currentHeight;
			config.width  = currentWidth;

			sendMsg(config.height, config.width, triggerEvent);
		}

		function isDoubleFiredEvent() {
			return  config.triggerLocked && (triggerEvent in config.doubleEventList);
		}

		function isSizeChangeDetected() {
			function checkTolarance(a, b){
				var retVal = Math.abs(a - b) <= config.tolerance;
				return !retVal;
			}

			currentHeight = (undefined !== customHeight)  ? customHeight : getHeight[config.heightCalcMode]();
			currentWidth  = (undefined !== customWidth )  ? customWidth  : getWidth();

			return	checkTolarance(config.height, currentHeight) ||
					(config.calculateWidth && checkTolarance(config.width, currentWidth));
		}

		function isForceResizableEvent() {
			return !(triggerEvent in {'init': 1, 'interval': 1, 'size': 1});
		}

		function isForceResizableHeightCalcMode() {
			return (config.heightCalcMode in config.resetRequiredMethods);
		}

		function checkDownSizing() {
			if (isForceResizableEvent() && isForceResizableHeightCalcMode()) {
				resetIFrame(triggerEventDesc);
			}
		}

		if (!isDoubleFiredEvent()) {
			if (isSizeChangeDetected()) {
				lockTrigger();
				resizeIFrame();
			} else {
				checkDownSizing();
			}
		}
	}

	function lockTrigger() {
		if (!config.triggerLocked) {
			config.triggerLocked = true;
		}
		clearTimeout(config.triggerLockedTimer);
		config.triggerLockedTimer = setTimeout(function() {
			config.triggerLocked = false;
		}, config.eventCancelTimer);
	}

	function triggerReset(triggerEvent) {
		config.height = getHeight[config.heightCalcMode]();
		config.width  = getWidth();

		sendMsg(config.height, config.width, triggerEvent);
	}

	function resetIFrame() {
		var hcm = config.heightCalcMode;
		config.heightCalcMode = config.heightCalcModeDefault;

		lockTrigger();
		triggerReset('reset');

		config.heightCalcMode = hcm;
	}

	function sendMsg(height, width, triggerEvent, msg, targetOrigin) {
		function setTargetOrigin() {
			if (targetOrigin === undefined) {
				targetOrigin = config.targetOriginDefault;
			}
		}

		function sendToParent() {
			var size  = height + ':' + width,
				message = config.myID + ':' +  size + ':' + triggerEvent + (undefined !== msg ? ':' + msg : '');

			config.target.postMessage(config.msgID + message, targetOrigin);
		}

		setTargetOrigin();
		sendToParent();
	}

	function receiver(event) {
		function isMessageForUs() {
			return config.msgID === ('' + event.data).substr(0, config.msgIdLen);
		}

		function initFromParent(){
			config.initMsg = event.data;
			config.target  = event.source;

			init();
			config.firstRun = false;

			setTimeout(function() {
				config.initLock = false;
			}, config.eventCancelTimer);
		}

		function resetFromParent() {
			if (!config.initLock) {
				triggerReset('resetPage');
			}
		}

		function getMessageType() {
			return event.data.split(']')[1];
		}

		function isInitMsg() {
			return event.data.split(':')[2] in {'true': 1, 'false': 1};
		}

		if (isMessageForUs()) {
			if (config.firstRun && isInitMsg()) {
				initFromParent();
			} else if (getMessageType() === 'reset') {
				resetFromParent();
			}
		}
	}

	addEventListener(window, 'message', receiver);

})(window, document);