/**
 * partial: need analyzer teaser
 * author: gregor
 *
 * this file is referenced in /app/templates/pages/page-need-analyzer.hbs
 */

(function(window, document, $, undefined) {
  /**
   * keep everything in our digitals2 namespace
   * window.digitals2.loremIpsum = 'dolor sit';
   */

  $.widget('digitals2.ds2NeedAnalyzerTeaser', {
    options: {
        teaser: '.ds2-need-analyzer-teaser',
    },
    _create: function() {
        //init variables 
        var self = this,
            $element = this.element,
            options = self.options;
        //add property to options inside create, otherwise referencing to other property inside was not possible
        
        options.urlBase = $('.button', $element).attr('href');  //same as: options.urlBase = $($element).find('.button').attr('href');
        //on init: go through methods or initial URL modification, in case user clicks on link button to teaser immediately
        self._getQ1TeaserParameters($element);

        // $(options.teaser).find('.ds2-js-filter--checkbox').on('click', function() {
        $('.ds2-js-filter--checkbox', $element).on('click', function() { //same as: options.urlBase = $($element).find('.ds2-js-filter--checkbox').on('click', function() {
          var $selfParent = $(this).closest(options.teaser);
          self._getQ1TeaserParameters($selfParent);
        });
    },
    _getQ1TeaserParameters: function($thisTeaser) {
        var self = this,
            $element = this.element,
            options = self.options,
            $teaser = $thisTeaser;

        //iteration for edge case, that several q1 teasers on one page, to get them all straight
        // for (var i = $teaser.length-1; i >= 0; i--) {
          var valueUrl = options.urlBase,
              answers = [];

          answers = $('.ds2-js-filter--checkbox', $teaser).map(function (x, y) {
          // answers = $teaser.eq(i).find('input').map(function (x, y) {
            return y.id + '=' + $(y).prop('checked');
          });
          valueUrl += (valueUrl.split('?')[1] ? '&' : '#/?') + answers.toArray().join('&');
          
          self._refreshQ1TeaserButtonUrl(valueUrl, $teaser)
        // }
        return valueUrl;
    },
    _refreshQ1TeaserButtonUrl: function(url, $teaser) {
        // $teaser.find('.button').attr('href', url);
        $('.button', $teaser).attr('href', url);
    }
  });

  $(window).on('initializeComponents', function() {
    $('.ds2-need-analyzer-teaser').ds2NeedAnalyzerTeaser();
  });

}(window, document, jQuery));
