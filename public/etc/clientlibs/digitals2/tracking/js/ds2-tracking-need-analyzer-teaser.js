(function (window, document, $, undefined) {
  $.widget('digitals2.ds2TrackingNeedAnalyzerTeaser', $.digitals2.ds2TrackingBase, {

    _init: function () {
      var self = this;
    },

    /**
     * Overrides listenerInit. Implements component tracking and event
     * tracking for page links, filters and the show more button.
     * @return {None}     None
     */
    _listnersInit: function () {
      var self = this;

      $('.ds2-need-analyzer-teaser--inner a', self.element).on('click', function (mouseEvent) {
        mouseEvent.preventDefault();
        self._trackButtonClick(mouseEvent);
      });

      self._super();
    },

    _trackButtonClick: function (mouseEvent) {
      var self = this;

      var trackOptions = self.bmwTrackOptionsBuilder.options().build();
      var eventName = $(mouseEvent.currentTarget).text().trim();
      var cause = '';
      var href = $(mouseEvent.currentTarget).attr('href');
      var active = {active: true};
      var eventPoints = ''; // not applicable

      if ($('.ds2-na-input input:checked').length > 0) {
        cause = [];
      }

      $('.ds2-na-input input:checked').each(function () {
        var label = $(this).next('.ds2-na-input--container').find('label').text().trim();
        cause.push(label);
      });

      trackOptions.content = active;
      trackOptions.name = 'internal_click';

      var pEvent = self._populateClickEvent(mouseEvent, trackOptions.name, href, eventName, cause);
      pEvent.eventInfo.eventPoints = eventPoints;
      if (digitals2.tracking.api !== undefined) {
        pEvent.attributes.relatedPageCategory = digitals2.tracking.api.getPageObject(digitals2.tracking.api.getCurrentPageIndex()).page.category;
        pEvent.attributes.relatedPageName = digitals2.tracking.api.getPageObject(digitals2.tracking.api.getCurrentPageIndex()).page.pageInfo.pageName;
      }
      pEvent.category.eventType = "delayed";
      pEvent.category.primaryCategory = "Interaction";
      dataTracking = self._parseDataFromEvent(pEvent, trackOptions, mouseEvent, true);

      self._setWindowLocation(href, dataTracking.useTimer);
    }
  });

}(window, document, jQuery));
