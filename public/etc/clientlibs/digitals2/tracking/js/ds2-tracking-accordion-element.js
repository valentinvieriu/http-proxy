(function (window, document, $, undefined) {
    $.widget('digitals2.ds2TrackingAccordionElement', $.digitals2.ds2TrackingBase, {
        _initialize: function (widget) {
            var self = this;
            self._super(widget);
            $(".ds2-accordion--list-item").click(function (e) {
                var h5Element = $(this).children()[0];
                var isClosed = $(h5Element).hasClass('ui-state-active');
                if (isClosed) {
                    self._onClickHandler(e);
                }
            });
        },
        _onClickHandler: function (e) {
            var self = this;
            var trackOptions = $(e.currentTarget).data('tracking-options');
            trackOptions = self.bmwTrackOptionsBuilder.options().name((trackOptions.name || '')).build();
            var trackingEvent = $(e.currentTarget).data('tracking-event');
            var target = trackingEvent.eventInfo.target;
            if (target === undefined || target === '') {
              if (window !== undefined) {
                target = window.location.href;
              }
            }
            var pEvent = self._populateClickEvent(e, trackOptions.name, target, trackingEvent.eventInfo.eventName, trackingEvent.eventInfo.cause, trackingEvent.eventInfo.effect);
            self._parseDataFromEvent(pEvent, trackOptions, e, true);
        }
    });

}(window, document, jQuery));
