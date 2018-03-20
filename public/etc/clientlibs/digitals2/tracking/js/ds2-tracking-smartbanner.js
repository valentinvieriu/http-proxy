(function(window, document, $, undefined) {
  $.widget('digitals2.ds2TrackingSmartbanner', $.digitals2.ds2TrackingBase, {

    _initialize: function(widget) {
      this._super(widget);
      this._trackImpression($('.smartbanner-button'));
    },

    _listnersInit: function() {
      var self = this;
      $(window).on('smartbanner-tracking', function(event, $element, mouseEvent) {
        self._trackLayerButtonClick($element, mouseEvent);
      });
      self._super();
    },

    _visibilityCheck: function() {
      var self = this;
      var pComponentVisible = $('.smartbanner-button').length > 0;
      var pIndex = self.options.$element.data('tracking-index');
      var pObject = {attributes: {visible: pComponentVisible}};
      self.api.updateComponentTracking(pIndex, pObject, self.api.getCurrentPageIndex());
    },

    _trackLayerButtonClick: function ($element, mouseEvent) {
      var self = this;

      var trackOptions = self.bmwTrackOptionsBuilder.options().build();
      var target = $element.attr('href');
      var eventName = self._getEventName($element);
      var cause = "";
      var effect = "";
      var active = {active:true};
      var eventPoints = '';

      trackOptions.content = active;
      trackOptions.name = 'external_link';

      var pEvent = self._populateClickEvent(mouseEvent, trackOptions.name, target, eventName, cause, effect);
      pEvent.eventInfo.eventPoints = eventPoints;
      pEvent.eventInfo.element = self.TC.TEXT_LINK;
      pEvent.category.primaryCategory = self.TC.INTERACTION;
      self._parseDataFromEvent(pEvent, trackOptions, mouseEvent, false);

      setTimeout(function() {
        window.location = target
      }, 200);
    },

    _trackImpression: function ($element) {
      if( !$element.length ){
        //smart banner not available;
        return;
      }
      var self = this;
      var eventName = self._getEventName($element);

      self._callExpandEvent(
        self.eventBuilder.newEvent()
          .eventName(eventName)
          .eventAction(self.TC.IMPRESSION)
          .build(),
        self.bmwTrackOptionsBuilder.options()
          .impressionOptions()
          .build());
    },

    _getEventName : function ($element) {
      var $component = $('.ds2-smartbanner');
      var openText = $component.data('open-text');
      var currentText = $element.find('.smartbanner-button-text').text();

      var eventName = "";
      if (openText === currentText) {
        eventName = "View";
      } else {
        eventName = "Install";
      }
      return eventName;
    }

  });

}(window, document, jQuery));