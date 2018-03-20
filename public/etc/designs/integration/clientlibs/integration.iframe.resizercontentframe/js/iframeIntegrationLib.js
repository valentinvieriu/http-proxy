/*
 * File: iframeIntegrationLib.js
 * Description: Include this file in any page being loaded into an iframe to establish bookmarking functionality.
 * Requires: contentFrameResizer.js
 * Author: Dirk Messetat (Netcentric)
 */

;(function(document, window, undefined) {
    'use strict';
		var firstRun=true,
		msgID = '[iFrameSizer]', /*Must match host page msg ID*/
		msgIdLen = msgID.length;

    function addEventListener(el,evt,func){
		if ('addEventListener' in window){
			el.addEventListener(evt,func, false);
		} else if ('attachEvent' in window){ /*IE*/
			el.attachEvent('on'+evt,func);
		}
	}



    function receiver(event) {
		function isMessageForUs(){
			return msgID === (''+event.data).substr(0,msgIdLen); /* ''+ Protects against non-string messages */
		}

		function initFromParent(){
			/* Bookmarking */
			window.parentIFrame.sendMessage({href : window.location.href});
		}

		function isInitMsg(){
				/* test if this message is from a child below us. This is an ugly test, however, updating
				the message format would break backwards compatibity.
				*/

				return event.data.split(':')[2] in {'true':1,'false':1};
		}

		if (isMessageForUs()){
			if (firstRun && isInitMsg()){ //Check msg ID
				initFromParent();
			}
		}
	}
	addEventListener(window,'message',receiver);
})(document, window);