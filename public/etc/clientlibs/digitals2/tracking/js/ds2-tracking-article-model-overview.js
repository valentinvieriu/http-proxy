(function(window, document, $, undefined) {
  $.widget('digitals2.ds2TrackingArticleModelOverview', $.digitals2.ds2TrackingBase, {

    _listnersInit: function() {
      var self = this;

      $('.ds2-tracking-js--event', self.element).on('click', function(mouseEvent) {
        mouseEvent.preventDefault();

        var isSlider = $(this).hasClass('ds2-article-model-overview-js--slide-toggler');
        var parent = $(this).closest('.ds2-article-model-overview--model-list');
        var activeChild = parent.find('.ds2-article-model-overview--active-model').closest('li');
        var trackOptions = $(this).data('tracking-options');
        var href = $(this).attr('href') || '';
        var eventName = $(this).text().trim();

        if(trackOptions.name === 'configurator_link') {
          activeChild = $(this).closest('.ds2-article-model-overview--model-container');
        }

        var cause = activeChild.find('.ds2-article-model-overview--model-title').text().trim();

        var pEvent = self._populateClickEvent(mouseEvent, trackOptions.name, href, eventName, cause);
        dataTracking = self._parseDataFromEvent(pEvent,trackOptions, mouseEvent, true);

        if(!isSlider) {
          self._setWindowLocation(href, dataTracking.useTimer);
        }
      });
    }
  });

}(window, document, jQuery));
