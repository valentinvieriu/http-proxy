(function (window, document, $, undefined) {
  $.widget('digitals2.ds2TrackingEnavigationModel', $.digitals2.ds2TrackingBase, {

    _create: function () {
      var ret = this._super();
      var self = this;

      self.$modelNavigationComponent = $('#ds2-model-navigation'); //tracking component data
      self.$modelMenu = self.$modelNavigationComponent.children('#ds2-model-menu'); //tracking event data

      self.$modelNavigationComponent.on('navigationItemActiveChange', function (event) {
        if (event.eventType.toLowerCase() === 'click' || event.eventType.toLowerCase() === 'swipe') {
          self._trackModelNavigation(event);
        }
      });

      return ret;
    },

    _trackModelNavigation: function (event) {
      var self = this;
      var trackingEvent = self._getTrackingEvent();
      var trackingOptions = self._getTrackingOptions();
      var pEvent;
      var eventName = self._getActiveNavItemName(event);
      var eventAction = trackingEvent.eventInfo.eventAction;
      var eventPoints = '';
      var target = window.location.href;
      var cause = self._isSeriesOrBodyRange();
      var effect = event.eventType;
      var element = trackingEvent.eventInfo.element;

      trackingOptions.name = trackingEvent.eventInfo.track;

      pEvent = self._populateClickEvent(event, trackingOptions.name, target, eventName, cause, effect);
      pEvent.eventInfo.eventPoints = eventPoints;
      pEvent.eventInfo.eventAction = eventAction;
      pEvent.eventInfo.element = element;
      var pEventOptions = self.bmwTrackOptionsBuilder.options()
          .name((trackingOptions.name || '')).build();
      self._parseDataFromEvent(pEvent, pEventOptions, event, true);
    },

    _isSeriesOrBodyRange: function () {
      return $('#pad1 li.active').data('id') === 1 ? 'Series' : 'Body type';
    },

    _getActiveNavItemName: function (event){
      return event.isSeriesOrBodyChanged ? $('#pad1 li.active a').text().trim() : event.activeSubNavItem.text().trim();
    },

    _getTrackingEvent: function () {
      return this.$modelMenu.data('trackingEvent');
    },

    _getTrackingOptions: function () {
      return this.$modelMenu.data('trackingOptions');
    }
  });

}(window, document, jQuery));
