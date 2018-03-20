/*************************************************************************
 *
 * ADOBE CONFIDENTIAL
 * __________________
 *
 *  Copyright 2011 Adobe Systems Incorporated
 *  All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 **************************************************************************/

// make Loader class private, ie. define, execute and forget,
// in order to load multiple Loader.js on the same page without conflicts
(function() {

  /**
   * The <code>Loader</code> class loads all CQ depending js sources.
   * Sample how to include the Loader in an HTML document:
   * @class
   * @param {String} resourcePath The resource path
   */
  var Loader = function(resourcePath) {

      /** @type String */
      Loader.resourcePath = resourcePath ? resourcePath : "";

  };

  /**
   * If a XHR hook function is defined, the specified URL is run through the hook and
   * returned accordingly.
   * @param {String} url The URL
   * @return {String} The hooked URL (or the original URL, if no XHR hook is defined
   */
  Loader.execHook = function(url) {
      if (typeof G_XHR_HOOK != "undefined") {
          var p = {
              "url": url,
              "method": "GET"
          };
          return G_XHR_HOOK(p).url;
      }
      return url;
  };

  /**
   * Gets a page from a URL and returns the response.
   * @static
   * @private
   * @param {String} url The URL
   * @return The response
   * @type String
   */
  Loader.get = function(url) {
      url = Loader.execHook(url);
      var httpcon = document.all ?
          new ActiveXObject("Microsoft.XMLHTTP") : new XMLHttpRequest();
      if (httpcon) {
          try {
              httpcon.open('GET', url, false);
              httpcon.send(null);
              return httpcon.responseText;
          }
          catch (e) {
              return "";
          }
      } else {
          return "";
      }
  };

  /**
   * Checks if the content returned by a request to <code>url</code> is empty.
   * @static
   * @private
   * @param {String} url The url to verify
   * @return {Boolean} True if empty file at given url. False otherwise.
   * @type Boolean
   */
  Loader.isEmpty = function(url) {
      var responseText = Loader.get(url);
      responseText = responseText.replace(new RegExp("\\s", "ig"),"");
      return responseText.length == 0;
  };

  /**
   * JavaScript to load
   * @private
   * @final
   * @type String[]
   */
  Loader.js =  [ 
"/apps/cookiecontroller/components/par/cookiecontroller/clientlibs/js/cookiecontroller.js"
,"/apps/cookiecontroller/components/par/cookiecontroller/clientlibs/js/cookiecontroller.http.js"
,"/apps/cookiecontroller/components/par/cookiecontroller/clientlibs/js/cookiecontroller.api.js"
,"/etc/clientlibs/digitals2/clientlib/js/vendor/jquery/amdModuleId.js"
,"/etc/clientlibs/digitals2/clientlib/js/vendor/jquery/2.1.1/jquery.js"
,"/etc/clientlibs/digitals2/clientlib/js/vendor/jquery-ui/amdModuleId.js"
,"/etc/clientlibs/digitals2/clientlib/js/vendor/jquery-ui/1.11.2/jquery-ui.js"
,"/etc/clientlibs/digitals2/clientlib/js/vendor/lodash/amdModuleId.js"
,"/etc/clientlibs/digitals2/clientlib/js/vendor/lodash/3.10.0/sources/lodash.js"
,"/etc/clientlibs/digitals2/tracking/api/js/tracking-api.js" 
];

  /**
   * Sets the path where the sources will be loaded from.
   * @param {String} path The path
   */
  Loader.prototype.setResourcePath = function(path) {
      Loader.resourcePath = path;
  };

  /**
   * Loads the javascript sources.
   * @private
   */
  Loader.prototype.draw = function() {
      this.createScriptElements(Loader.resourcePath, Loader.js);
  };

  /**
   * Creates the script elements to load the javascript sources.
   * @private
   * @param {String} path The path
   * @param {String[]} sources The sources
   */
  Loader.prototype.createScriptElements = function(path, sources) {
      for (var elem in sources) {
          // we don't want to request the "remove" function
          if (!sources.hasOwnProperty(elem)) continue;

          var url = path + sources[elem];

          if (document.all || window.navigator.appVersion.indexOf("Safari") >= 0) {
  //             check if script exists to avoid errors in IE
              if (Loader.isEmpty(url)) {
                  continue;
              }
          }

          if ( document.readyState == "complete" ) {
              // avoid calls to document.write after the document is loaded
              var scriptNode = document.createElement('script');
              scriptNode.src = Loader.execHook(url);
              scriptNode.type = 'text/javascript';
              document.body.appendChild(scriptNode);
          } else {
              // make sure that the link rewriter does not touch the script string
              var scriptStr = "\<scri";
              scriptStr += "pt type='text/javascript' sr";
              scriptStr += "c='" + Loader.execHook(url) + "'>\</sc";
              scriptStr += "ript>";
              document.write(scriptStr);
          }
      }
  };

  new Loader("").draw();

})();