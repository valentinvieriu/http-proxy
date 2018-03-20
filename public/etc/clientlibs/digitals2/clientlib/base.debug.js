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
"/etc/clientlibs/digitals2/clientlib/foundation/5.3.3-customized/js/foundation/foundation.js"
,"/etc/clientlibs/digitals2/clientlib/foundation/5.3.3-customized/js/foundation/foundation.dropdown.js"
,"/etc/clientlibs/digitals2/clientlib/foundation/5.3.3-customized/js/foundation/foundation.equalizer.js"
,"/etc/clientlibs/digitals2/clientlib/foundation/5.3.3-customized/js/foundation/foundation.interchange.js"
,"/etc/clientlibs/digitals2/clientlib/foundation/5.3.3-customized/js/foundation/foundation.reveal.js"
,"/etc/clientlibs/digitals2/clientlib/foundation/5.3.3-customized/js/foundation/foundation.tab.js"
,"/etc/clientlibs/digitals2/clientlib/js/vendor/log/amdModuleId.js"
,"/etc/clientlibs/digitals2/clientlib/js/vendor/log/consolelog.js"
,"/etc/clientlibs/digitals2/clientlib/js/vendor/jquery-sticky/1.0.0/jquery-sticky.js"
,"/etc/clientlibs/digitals2/clientlib/js/vendor/jquery-sticky-kit/1.1.1/jquery.sticky-kit.js"
,"/etc/clientlibs/digitals2/clientlib/js/vendor/jquery-fittext/amdModuleId.js"
,"/etc/clientlibs/digitals2/clientlib/js/vendor/jquery-fittext/1.2/jquery-fittext-customized.js"
,"/etc/clientlibs/digitals2/clientlib/js/vendor/jquery-bigtext/0.1.6-customized/jquery-bigtext.js"
,"/etc/clientlibs/digitals2/clientlib/js/vendor/jquery-slick/amdModuleId.js"
,"/etc/clientlibs/digitals2/clientlib/js/vendor/jquery-slick/1.5.5-customized/jquery-slick.js"
,"/etc/clientlibs/digitals2/clientlib/js/vendor/jquery-sleck/amdModuleId.js"
,"/etc/clientlibs/digitals2/clientlib/js/vendor/jquery-sleck/1.7.1-customized/jquery-sleck.js"
,"/etc/clientlibs/digitals2/clientlib/js/vendor/jquery-slick-lightbox/0.1.5/jquery-slick-lightbox.js"
,"/etc/clientlibs/digitals2/clientlib/js/vendor/cocoen/cocoen.min.js"
,"/etc/clientlibs/digitals2/clientlib/js/vendor/cocoen/cocoen-mobile-patch.js"
,"/etc/clientlibs/digitals2/clientlib/js/vendor/fastclick/1.0.6/fastclick.js"
,"/etc/clientlibs/digitals2/clientlib/js/vendor/modernizr/3.5.0/modernizr-custom.js"
,"/etc/clientlibs/digitals2/clientlib/js/vendor/imagesloaded/3.1.8/imagesloaded.js"
,"/etc/clientlibs/digitals2/clientlib/js/vendor/jquery-stacktable/1.0.0/jquery-stacktable.js"
,"/etc/clientlibs/digitals2/clientlib/js/vendor/velocity/amdModuleId.js"
,"/etc/clientlibs/digitals2/clientlib/js/vendor/velocity/1.2.0/velocity.js"
,"/etc/clientlibs/digitals2/clientlib/js/vendor/iscroll/5.1.3-customized/iscroll.js"
,"/etc/clientlibs/digitals2/clientlib/js/vendor/qtip/amdModuleId.js"
,"/etc/clientlibs/digitals2/clientlib/js/vendor/qtip/2.2.1/jquery-qtip.js"
,"/etc/clientlibs/digitals2/clientlib/js/vendor/jquery-dotdotdot/1.7.4/jquery.dotdotdot.min.js"
,"/etc/clientlibs/digitals2/clientlib/js/vendor/clipboard/amdModuleId.js"
,"/etc/clientlibs/digitals2/clientlib/js/vendor/clipboard/clipboard.min.js"
,"/etc/clientlibs/digitals2/clientlib/js/vendor/jquery-inview/amdModuleId.js"
,"/etc/clientlibs/digitals2/clientlib/js/vendor/jquery-inview/jquery.inview.min.js"
,"/etc/clientlibs/digitals2/clientlib/js/vendor/handlebars/1.0/handlebars.js"
,"/etc/clientlibs/digitals2/clientlib/js/vendor/isotope/amdModuleId.js"
,"/etc/clientlibs/digitals2/clientlib/js/vendor/isotope/3.0.1/isotope.pkgd.min.js"
,"/etc/clientlibs/digitals2/clientlib/js/vendor/accounting/amdModuleId.js"
,"/etc/clientlibs/digitals2/clientlib/js/vendor/accounting/0.4.2/accounting.js"
,"/etc/clientlibs/frontend-foundation/component-loader/3rdParty/requiresJS-2.2.0/requiresjs.js"
,"/etc/clientlibs/frontend-foundation/component-loader/3rdParty/requiresJS-2.2.0/require-define.js"
,"/etc/clientlibs/frontend-foundation/component-loader/3rdParty/requiresJS-2.2.0/use.js"
,"/etc/clientlibs/frontend-foundation/component-loader/3rdParty/requiresJS-2.2.0/require-config.js"
,"/etc/clientlibs/frontend-foundation/component-loader/3rdParty/jquery.lazy-1.7.0/jquery.lazy.js"
,"/etc/clientlibs/frontend-foundation/component-loader/3rdParty/bluebird-3.4.1/amdModuleId.js"
,"/etc/clientlibs/frontend-foundation/component-loader/3rdParty/bluebird-3.4.1/js/browser/bluebird.js"
,"/etc/clientlibs/frontend-foundation/component-loader/serviceInitializer/main.js"
,"/etc/clientlibs/frontend-foundation/component-loader/componentInitializer/require-config.js"
,"/etc/clientlibs/frontend-foundation/component-loader/componentInitializer/main.js"
,"/etc/clientlibs/frontend-foundation/messagebus/3rdParty/postal.xframe-0.5.0-MODIFIED/amdModuleId.js"
,"/etc/clientlibs/frontend-foundation/messagebus/3rdParty/postal.xframe-0.5.0-MODIFIED/lib/postal.xframe.modified.js"
,"/etc/clientlibs/frontend-foundation/messagebus/3rdParty/postal.request-response-0.3.1-MODIFIED/amdModuleId.js"
,"/etc/clientlibs/frontend-foundation/messagebus/3rdParty/postal.request-response-0.3.1-MODIFIED/lib/postal.request-response.modified.js"
,"/etc/clientlibs/frontend-foundation/messagebus/3rdParty/postal.preserve-0.2.0-MODIFIED/amdModuleId.js"
,"/etc/clientlibs/frontend-foundation/messagebus/3rdParty/postal.preserve-0.2.0-MODIFIED/lib/postal.preserve.modified.js"
,"/etc/clientlibs/frontend-foundation/messagebus/3rdParty/postal.js-2.0.4/amdModuleId.js"
,"/etc/clientlibs/frontend-foundation/messagebus/3rdParty/postal.js-2.0.4/lib/postal.min.js"
,"/etc/clientlibs/frontend-foundation/messagebus/3rdParty/postal.federation-0.5.3/amdModuleId.js"
,"/etc/clientlibs/frontend-foundation/messagebus/3rdParty/postal.federation-0.5.3/lib/postal.federation.js"
,"/etc/clientlibs/frontend-foundation/messagebus/3rdParty/lodash-3.10.1/amdModuleId.js"
,"/etc/clientlibs/frontend-foundation/messagebus/3rdParty/lodash-3.10.1/lodash.js"
,"/etc/clientlibs/frontend-foundation/messagebus/3rdParty/conduitjs-0.3.3/amdModuleId.js"
,"/etc/clientlibs/frontend-foundation/messagebus/3rdParty/conduitjs-0.3.3/lib/conduit.js"
,"/etc/clientlibs/frontend-foundation/messagebus/3rdParty/babel-polyfill-0.0.1/browser-polyfill.modified.min.js"
,"/etc/clientlibs/frontend-foundation/messagebus/postal.settings.js"
,"/etc/clientlibs/frontend-foundation/messagebus/postal.uuid.js"
,"/etc/clientlibs/frontend-foundation/messagebus/postal.provider.js"
,"/etc/designs/integration/clientlibs/integration.publish/js/jquery.base64.js"
,"/etc/designs/integration/clientlibs/integration.publish/js/fallbackpage.js"
,"/etc/designs/integration/clientlibs/integration.publish/js/iframeintegration.js"
,"/etc/designs/integration/clientlibs/integration.iframe.resizer/js/amdModuleId.js"
,"/etc/designs/integration/clientlibs/integration.iframe.resizer/js/iframeResizer.js"
,"/etc/designs/integration/clientlibs/integration.iframe.publish/js/ajaxComponentAmd.js"
,"/etc/designs/integration/clientlibs/integration.iframe.publish/js/iframeValidation.js"
,"/etc/designs/integration/clientlibs/integration.iframe.publish/js/loadContentAmd.js"
,"/etc/designs/integration/clientlibs/integration.iframe.publish/js/ds2-iframe-lazy-load.js"
,"/etc/clientlibs/digitals2/clientlib/js/vendor/jquery-lazy-plugins/1.7.0/jquery.lazy.plugins.js"
,"/etc/designs/integration/clientlibs/integration.iframeintegrationinit.publish/js/iframeintegrationinitAmd.js"
,"/etc/clientlibs/digitals2/clientlib/js/app/partials/0-sub-elements/ds2-accordion-element-amd.js"
,"/etc/clientlibs/digitals2/clientlib/js/app/partials/0-sub-elements/ds2-button-offer.js"
,"/etc/clientlibs/digitals2/clientlib/js/app/partials/0-sub-elements/ds2-button-url-to-check-amd.js"
,"/etc/clientlibs/digitals2/clientlib/js/app/partials/0-sub-elements/ds2-consent.js"
,"/etc/clientlibs/digitals2/clientlib/js/app/partials/0-sub-elements/ds2-cookie-disclaimer-amd.js"
,"/etc/clientlibs/digitals2/clientlib/js/app/partials/0-sub-elements/ds2-dropdown-amd.js"
,"/etc/clientlibs/digitals2/clientlib/js/app/partials/0-sub-elements/ds2-expand-copy-amd.js"
,"/etc/clientlibs/digitals2/clientlib/js/app/partials/0-sub-elements/ds2-facebook-video-amd.js"
,"/etc/clientlibs/digitals2/clientlib/js/app/partials/0-sub-elements/ds2-info-icon-amd.js"
,"/etc/clientlibs/digitals2/clientlib/js/app/partials/0-sub-elements/ds2-layer-error-old-browser.js"
,"/etc/clientlibs/digitals2/clientlib/js/app/partials/0-sub-elements/ds2-link-amd.js"
,"/etc/clientlibs/digitals2/clientlib/js/app/partials/0-sub-elements/ds2-link-box-amd.js"
,"/etc/clientlibs/digitals2/clientlib/js/app/partials/0-sub-elements/ds2-slider-amd.js"
,"/etc/clientlibs/digitals2/clientlib/js/app/partials/0-sub-elements/ds2-table-element-amd.js"
,"/etc/clientlibs/digitals2/clientlib/js/app/partials/0-sub-elements/ds2-tooltip.js"
,"/etc/clientlibs/digitals2/clientlib/js/app/partials/0-sub-elements/ds2-tooltip-amd.js"
,"/etc/clientlibs/digitals2/clientlib/js/app/partials/0-sub-elements/ds2-video-player-amd.js"
,"/etc/clientlibs/digitals2/clientlib/js/app/partials/0-sub-elements/ds2-video-layer-link-amd.js"
,"/etc/clientlibs/digitals2/clientlib/js/app/partials/0-sub-elements/ds2-usabilla-amd.js"
,"/etc/clientlibs/digitals2/clientlib/js/app/partials/ds2-article-model-overview-amd.js"
,"/etc/clientlibs/digitals2/clientlib/js/app/partials/ds2-article-background-image-amd.js"
,"/etc/clientlibs/digitals2/clientlib/js/app/partials/ds2-basic-teaser-amd.js"
,"/etc/clientlibs/digitals2/clientlib/js/app/partials/ds2-bottom-disclaimer-amd.js"
,"/etc/clientlibs/digitals2/clientlib/js/app/partials/ds2-businesscard-amd.js"
,"/etc/clientlibs/digitals2/clientlib/js/app/partials/ds2-comparison-slider-amd.js"
,"/etc/clientlibs/digitals2/clientlib/js/app/partials/ds2-content-presentation-amd.js"
,"/etc/clientlibs/digitals2/clientlib/js/app/partials/ds2-content-slider-amd.js"
,"/etc/clientlibs/digitals2/clientlib/js/app/partials/ds2-cookie-consent-settings-amd.js"
,"/etc/clientlibs/digitals2/clientlib/js/app/partials/ds2-dealerlocator.js"
,"/etc/clientlibs/digitals2/clientlib/js/app/partials/ds2-detailed-table-amd.js"
,"/etc/clientlibs/digitals2/clientlib/js/app/partials/ds2-fallback-detail-amd.js"
,"/etc/clientlibs/digitals2/clientlib/js/app/partials/ds2-glossary-overview-amd.js"
,"/etc/clientlibs/digitals2/clientlib/js/app/partials/ds2-highlight-amd.js"
,"/etc/clientlibs/digitals2/clientlib/js/app/partials/ds2-iframe-amd.js"
,"/etc/clientlibs/digitals2/clientlib/js/app/partials/ds2-layer-amd.js"
,"/etc/clientlibs/digitals2/clientlib/js/app/partials/ds2-micro-story-amd.js"
,"/etc/clientlibs/digitals2/clientlib/js/app/partials/ds2-models-amd.js"
,"/etc/clientlibs/digitals2/clientlib/js/app/partials/ds2-model-carousel-amd.js"
,"/etc/clientlibs/digitals2/clientlib/js/app/partials/ds2-navigation-cluster-prototype.js"
,"/etc/clientlibs/digitals2/clientlib/js/app/partials/ds2-navigation-cluster-sub-prototype.js"
,"/etc/clientlibs/digitals2/clientlib/js/app/partials/ds2-navigation-content-bar-amd.js"
,"/etc/clientlibs/digitals2/clientlib/js/app/partials/ds2-navigation-main-amd.js"
,"/etc/clientlibs/digitals2/clientlib/js/app/partials/ds2-navigation-footer-amd.js"
,"/etc/clientlibs/digitals2/clientlib/js/app/partials/ds2-navigation-model-small-amd.js"
,"/etc/clientlibs/digitals2/clientlib/js/app/partials/ds2-navigation-model-amd.js"
,"/etc/clientlibs/digitals2/clientlib/js/app/partials/ds2-enavigation-model-amd.js"
,"/etc/clientlibs/digitals2/clientlib/js/app/partials/ds2-navigation-salesbar-amd.js"
,"/etc/clientlibs/digitals2/clientlib/js/app/partials/ds2-all-model-overview-amd.js"
,"/etc/clientlibs/digitals2/clientlib/js/app/partials/ds2-need-analyzer-amd.js"
,"/etc/clientlibs/digitals2/clientlib/js/app/partials/ds2-need-analyzer-extended-amd.js"
,"/etc/clientlibs/digitals2/clientlib/js/app/partials/ds2-need-analyzer-algorithm-amd.js"
,"/etc/clientlibs/digitals2/clientlib/js/app/partials/ds2-need-analyzer-algorithm-extended-amd.js"
,"/etc/clientlibs/digitals2/clientlib/js/app/partials/ds2-need-analyzer-config-amd.js"
,"/etc/clientlibs/digitals2/clientlib/js/app/partials/ds2-need-analyzer-dispatcher-amd.js"
,"/etc/clientlibs/digitals2/clientlib/js/app/partials/ds2-need-analyzer-input-processor-amd.js"
,"/etc/clientlibs/digitals2/clientlib/js/app/partials/ds2-need-analyzer-input-processor-extended-amd.js"
,"/etc/clientlibs/digitals2/clientlib/js/app/partials/ds2-need-analyzer-logic.js"
,"/etc/clientlibs/digitals2/clientlib/js/app/partials/ds2-need-analyzer-recommendations-slider-amd.js"
,"/etc/clientlibs/digitals2/clientlib/js/app/partials/ds2-need-analyzer-recommendations-slider-extended-amd.js"
,"/etc/clientlibs/digitals2/clientlib/js/app/partials/ds2-need-analyzer-input-prozessor-extended-rangeslider-amd.js"
,"/etc/clientlibs/digitals2/clientlib/js/app/partials/ds2-need-analyzer-result-page-templates-amd.js"
,"/etc/clientlibs/digitals2/clientlib/js/app/partials/ds2-need-analyzer-result-page-templates-extended-amd.js"
,"/etc/clientlibs/digitals2/clientlib/js/app/partials/ds2-need-analyzer-teaser.js"
,"/etc/clientlibs/digitals2/clientlib/js/app/partials/ds2-need-analyzer-share-page.js"
,"/etc/clientlibs/digitals2/clientlib/js/app/partials/ds2-offer-detail-amd.js"
,"/etc/clientlibs/digitals2/clientlib/js/app/partials/ds2-scroll-arrow-amd.js"
,"/etc/clientlibs/digitals2/clientlib/js/app/partials/ds2-searchform-amd.js"
,"/etc/clientlibs/digitals2/clientlib/js/app/partials/ds2-showroom-amd.js"
,"/etc/clientlibs/digitals2/clientlib/js/app/partials/ds2-sitemap-amd.js"
,"/etc/clientlibs/digitals2/clientlib/js/app/partials/ds2-smartbanner-amd.js"
,"/etc/clientlibs/digitals2/clientlib/js/app/partials/ds2-sound-amd.js"
,"/etc/clientlibs/digitals2/clientlib/js/app/partials/ds2-hotspot-amd.js"
,"/etc/clientlibs/digitals2/clientlib/js/app/partials/ds2-stage-presentation-amd.js"
,"/etc/clientlibs/digitals2/clientlib/js/app/partials/ds2-stage-teaser-amd.js"
,"/etc/clientlibs/digitals2/clientlib/js/app/partials/ds2-technical-data-amd.js"
,"/etc/clientlibs/digitals2/clientlib/js/app/partials/ds2-typo-amd.js"
,"/etc/clientlibs/digitals2/clientlib/js/app/partials/ds2-sharing-amd.js"
,"/etc/clientlibs/digitals2/clientlib/js/app/partials/ds2-nsc-amd.js"
,"/etc/clientlibs/digitals2/clientlib/js/app/partials/ds2-article-overview-amd.js"
,"/etc/clientlibs/digitals2/clientlib/js/app/partials/ds2-related-articles-amd.js"
,"/etc/clientlibs/digitals2/clientlib/js/app/partials/ds2-requests-profile.js"
,"/etc/clientlibs/digitals2/clientlib/js/app/partials/ds2-topic-slider-amd.js"
,"/etc/clientlibs/digitals2/clientlib/js/app/partials/ds2-accessories.js"
,"/etc/clientlibs/digitals2/clientlib/js/app/partials/ds2-accessoryteaser.js"
,"/etc/clientlibs/digitals2/clientlib/js/app/partials/ds2-hotspot-extended-amd.js"
,"/etc/clientlibs/digitals2/clientlib/js/app/partials/ds2-pre-configuration-amd.js"
,"/etc/clientlibs/digitals2/clientlib/js/app/partials/ds2-legal-image-amd.js"
,"/etc/clientlibs/digitals2/clientlib/js/app/partials/ds2-model-brief-amd.js"
,"/etc/clientlibs/digitals2/clientlib/js/app/partials/ds2-cluster-overview-amd.js"
,"/etc/clientlibs/digitals2/clientlib/js/app/partials/ds2-versioninfo.js"
,"/etc/clientlibs/digitals2/clientlib/js/app/partials/ds2-province-selection-amd.js"
,"/etc/clientlibs/digitals2/clientlib/js/app/partials/ds2-saveconfiguration-amd.js"
,"/etc/clientlibs/digitals2/clientlib/js/app/ds2-cookie-controller-amd.js"
,"/etc/clientlibs/digitals2/clientlib/js/app/ds2-cookie-language.js"
,"/etc/clientlibs/digitals2/clientlib/js/app/ds2-cookie-province.js"
,"/etc/clientlibs/digitals2/clientlib/js/app/ds2-history-manager.js"
,"/etc/clientlibs/digitals2/clientlib/js/app/ds2-image-height.js"
,"/etc/clientlibs/digitals2/clientlib/js/app/ds2-image-loader.js"
,"/etc/clientlibs/digitals2/clientlib/js/app/ds2-image-lazy-load.js"
,"/etc/clientlibs/digitals2/clientlib/js/app/ds2-topic-slider-lazy-loading.js"
,"/etc/clientlibs/digitals2/clientlib/js/app/ds2-links-parameters.js"
,"/etc/clientlibs/digitals2/clientlib/js/app/ds2-messages.js"
,"/etc/clientlibs/digitals2/clientlib/js/app/ds2-responsive-plus.js"
,"/etc/clientlibs/digitals2/clientlib/js/app/ds2-main-amd.js"
,"/etc/clientlibs/digitals2/clientlib/js/app/ds2-require-config.js"
,"/etc/clientlibs/digitals2/clientlib/js/app/ds2-refresh-component.js"
,"/etc/clientlibs/digitals2/clientlib/js/app/ds2-refresh-components/ds2-refresh-sound.js"
,"/etc/clientlibs/frontend-foundation/component-loader/componentInitializer-init/main.js"
,"/etc/clientlibs/digitals2/tracking/js/ds2-tracking-chat.js"
,"/etc/clientlibs/digitals2/tracking/js/ds2-tracking-utils.js"
,"/etc/clientlibs/digitals2/tracking/js/ds2-tracking-base.js"
,"/etc/clientlibs/digitals2/tracking/js/ds2-tracking-accordion.js"
,"/etc/clientlibs/digitals2/tracking/js/ds2-tracking-offer-detail.js"
,"/etc/clientlibs/digitals2/tracking/js/ds2-tracking-pre-configuration.js"
,"/etc/clientlibs/digitals2/tracking/js/ds2-tracking-footer.js"
,"/etc/clientlibs/digitals2/tracking/js/ds2-tracking-model-carousel.js"
,"/etc/clientlibs/digitals2/tracking/js/ds2-tracking-technical-data.js"
,"/etc/clientlibs/digitals2/tracking/js/ds2-tracking-content-presentation.js"
,"/etc/clientlibs/digitals2/tracking/js/ds2-tracking-content-slider.js"
,"/etc/clientlibs/digitals2/tracking/js/ds2-tracking-error-layer.js"
,"/etc/clientlibs/digitals2/tracking/js/ds2-tracking-error-page.js"
,"/etc/clientlibs/digitals2/tracking/js/ds2-tracking-fallback-detail.js"
,"/etc/clientlibs/digitals2/tracking/js/ds2-tracking-gallery.js"
,"/etc/clientlibs/digitals2/tracking/js/ds2-tracking-glossary-overview.js"
,"/etc/clientlibs/digitals2/tracking/js/ds2-tracking-language-selection.js"
,"/etc/clientlibs/digitals2/tracking/js/ds2-tracking-microstory.js"
,"/etc/clientlibs/digitals2/tracking/js/ds2-tracking-model-navigation.js"
,"/etc/clientlibs/digitals2/tracking/js/ds2-tracking-model-overview.js"
,"/etc/clientlibs/digitals2/tracking/js/ds2-tracking-navigation.js"
,"/etc/clientlibs/digitals2/tracking/js/ds2-tracking-navigation-content-bar.js"
,"/etc/clientlibs/digitals2/tracking/js/ds2-tracking-navigation-salesbar.js"
,"/etc/clientlibs/digitals2/tracking/js/ds2-tracking-stage-presentation.js"
,"/etc/clientlibs/digitals2/tracking/js/ds2-tracking-stage-teaser.js"
,"/etc/clientlibs/digitals2/tracking/js/ds2-tracking-switch-layer.js"
,"/etc/clientlibs/digitals2/tracking/js/ds2-tracking-table.js"
,"/etc/clientlibs/digitals2/tracking/js/ds2-tracking-video-container.js"
,"/etc/clientlibs/digitals2/tracking/js/ds2-tracking-video-layer.js"
,"/etc/clientlibs/digitals2/tracking/js/ds2-tracking-sharing.js"
,"/etc/clientlibs/digitals2/tracking/js/ds2-tracking-magazine-text.js"
,"/etc/clientlibs/digitals2/tracking/js/ds2-tracking-sound.js"
,"/etc/clientlibs/digitals2/tracking/js/ds2-tracking-article-model-overview.js"
,"/etc/clientlibs/digitals2/tracking/js/ds2-tracking-magazine-overview.js"
,"/etc/clientlibs/digitals2/tracking/js/ds2-tracking-related-articles.js"
,"/etc/clientlibs/digitals2/tracking/js/ds2-tracking-hotspot.js"
,"/etc/clientlibs/digitals2/tracking/js/ds2-tracking-hotspot-extended.js"
,"/etc/clientlibs/digitals2/tracking/js/ds2-tracking-nsc.js"
,"/etc/clientlibs/digitals2/tracking/js/ds2-tracking-smartbanner.js"
,"/etc/clientlibs/digitals2/tracking/js/ds2-tracking-need-analyzer-teaser.js"
,"/etc/clientlibs/digitals2/tracking/js/ds2-tracking-need-analyzer-amd.js"
,"/etc/clientlibs/digitals2/tracking/js/ds2-tracking-need-analyzer-extended-amd.js"
,"/etc/clientlibs/digitals2/tracking/js/ds2-tracking-need-analyser-share-page.js"
,"/etc/clientlibs/digitals2/tracking/js/ds2-tracking-topic-slider.js"
,"/etc/clientlibs/digitals2/tracking/js/ds2-tracking-facebook-video.js"
,"/etc/clientlibs/digitals2/tracking/js/ds2-tracking-amd.js"
,"/etc/clientlibs/digitals2/tracking/js/ds2-tracking-accordion-element.js"
,"/etc/clientlibs/digitals2/tracking/js/ds2-tracking-comparison-slider.js"
,"/etc/clientlibs/digitals2/tracking/js/ds2-tracking-tooltip.js"
,"/etc/clientlibs/digitals2/tracking/js/ds2-tracking-enavigation-model.js"
,"/etc/clientlibs/digitals2/tracking/js/ds2-tracking-login.js"
,"/etc/designs/aemsearch/clientlibs/core/searchfield/js/tracking.js"
,"/etc/designs/aemsearch/clientlibs/core/searchfield/js/jquery.json.js"
,"/etc/designs/aemsearch/clientlibs/core/searchfield/js/jquery.base64.js"
,"/etc/designs/aemsearch/clientlibs/core/searchfield/js/autosuggest.js"
,"/etc/designs/aemsearch/clientlibs/core/searchfield/js/searchbox.js"
,"/etc/designs/integration/clientlibs/integration.iframe.resizercontentframe/js/contentFrameResizer.js"
,"/etc/designs/integration/clientlibs/integration.iframe.resizercontentframe/js/iframeIntegrationLib.js" 
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