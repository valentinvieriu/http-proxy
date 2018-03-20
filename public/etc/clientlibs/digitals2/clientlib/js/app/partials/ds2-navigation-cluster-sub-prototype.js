/**
 * partial: boilerplate
 * author: ronny
 *
 * this file is referenced in /app/templates/pages/boilerplate.hbs
 */

(function(window, document, $, undefined) {

  /**
   * keep everything in our digitals2 namespace
   * window.digitals2.loremIpsum = 'dolor sit';
   */

  $.widget('digitals2.ds2NavigationClusterSub', {

    options: {
    },

    _create: function() {
    },

    _destroy: function() {
    }

  });

  $(window).on('initializeComponents', function() {
    $('.ds2-cluster-navigation-mobile-sub').ds2NavigationClusterSub();
  });

}(window, document, jQuery));
