(function(window, document, $, undefined) {
  $.widget('digitals2.ds2TrackingTechnicalData', $.digitals2.ds2TrackingBase, {

    _create: function() {
      var ret = this._super();
      var eventName = '';
      var $defaultDropdownItem = $('.ds2-dropdown-js--item.active', this.element);

      if ($defaultDropdownItem.length > 0) {
        eventName = $('.ds2-dropdown--link', $defaultDropdownItem)
            .text().trim();

        this._callExpandEvent(
            this.eventBuilder.newEvent()
                .eventName(eventName)
                .cause(this.TC.AUTOMATIC)
                .primaryCategoryIsEngagement()
                .build(),
            this.bmwTrackOptionsBuilder.options()
                .showModelOptions()
                .timing(true)
                .build());
      }

      return ret;
    },

    _listnersInit: function() {
      var self = this;
      // BMWDGTLTP-2681 - Click Types used in previous taggingplans that can be removed
      // $(this.element)
      //     .on('ds2-technical-data-impressionTrack', function(event, trackObj) {
      //       self._callExpandEvent(
      //           self.eventBuilder.newEvent()
      //               .eventName(trackObj.eventName)
      //               .eventAction(self.TC.SHOW_MODEL_DATA)
      //               .cause(trackObj.eventCause)
      //               .primaryCategoryIsInteraction()
      //               .build(),
      //           self.bmwTrackOptionsBuilder.options()
      //               .showModelOptions()
      //               .timing(true)
      //               .build());
      //     });

      $('.ds2-accordion--element', this.element)
          .on('ds2-accordion-expandTrack', function(event, trigEvent) {
            var trackObj = trigEvent.eventInfo.eventInfo;
            self._callExpandEvent(
                self.eventBuilder.newEvent()
                    .eventName(trackObj.eventName)
                    .eventPoints(trackObj.eventPoints)
                    .cause(trackObj.cause)
                    .eventActionIsExpand()
                    .primaryCategoryIsInteraction()
                    .build(),
                self.bmwTrackOptionsBuilder.options()
                    .expandOptions()
                    .build());
          });

      this._super();
    },
    _initialize: function (widget) {
      var self = this;
      self._super(widget);
      $('.ds2-dropdown--list-item').click(function (e) {
        var technicalDataElement = $(this).closest('.ds2-technical-data');
        var trackOptions = technicalDataElement.data('tracking-options');
        var trackingEvent = technicalDataElement.data('tracking-event');
        trackOptions = self.bmwTrackOptionsBuilder.options().name((trackOptions.name || '')).build();
        trackingEvent.eventInfo.eventName = $(this)[0].children[0].innerText;
        var pEvent = self._populateClickEvent(e, trackOptions.name, trackingEvent.eventInfo.target, trackingEvent.eventInfo.eventName, trackingEvent.eventInfo.cause, trackingEvent.eventInfo.effect);
        pEvent.eventInfo.element = trackingEvent.eventInfo.element;
        self._parseDataFromEvent(pEvent, trackOptions, e, true);
      });

    }
  });

}(window, document, jQuery));
