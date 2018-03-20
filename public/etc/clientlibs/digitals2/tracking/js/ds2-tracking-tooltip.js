(function(window, document, $, undefined) {
  $.widget('digitals2.ds2TrackingTooltip', $.digitals2.ds2TrackingBase, {

    _create: function() {
      var ret = this._super();

      var self = this;
      var element = self.element[0];
      $(element).click(function (e) {
        var $dataElement = $(element);
        if (!($dataElement.data('tracking-options') && $dataElement.data('tracking-event'))) {
            $dataElement = $dataElement.parent();
            e.currentTarget = $dataElement;
            self.options.$element = $dataElement;
        }
        if (!($dataElement.data('tracking-options') && $dataElement.data('tracking-event'))) {
            $dataElement = $dataElement.parent();
            e.currentTarget = $dataElement;
            self.options.$element = $dataElement;
        }
        var trackOptions = $dataElement.data('tracking-options');
        var trackingEvent = $dataElement.data('tracking-event');
        if (trackOptions && trackingEvent) {
            trackOptions = self.bmwTrackOptionsBuilder.options().name((trackOptions.name || '')).build();
            var pEvent = self._populateClickEvent(e, trackOptions.name, trackingEvent.eventInfo.target, trackingEvent.eventInfo.eventName, trackingEvent.eventInfo.cause, trackingEvent.eventInfo.effect);
            pEvent.eventInfo.eventAction = 'Open Tooltip';
            self._parseDataFromEvent(pEvent, trackOptions, e, true);
        }
      });
      return ret;
    }
  });

}(window, document, jQuery));
