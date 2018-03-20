(function(window, document, $, undefined) {
  $.widget('digitals2.ds2TrackingHotspot', $.digitals2.ds2TrackingBase, {

    _listnersInit: function() {
      var self = this;

      $('.ds2-video-player:not(.ds2-layer div)', this.element)
        .on('ds2-video-player-play', function(event, trackObj) {
          self._callExpandEvent(trackObj,
              self.bmwTrackOptionsBuilder.options()
                  .name(self.TC.START_VIDEO)
                  .build());
        })
        .on('ds2-video-player-track-absolute-progress', function(event, eventObj) {
          eventObj.eventAction = 'Progress';
          self._trackVideoEvent(this, eventObj);
        })
        .on('ds2-video-player-track-relative-progress', function(event, eventObj) {
          eventObj.eventAction = 'Milestone';
          self._trackVideoEvent(this, eventObj);
        })
      ;
      
      $(self.element)
        .on('tracking:hotspot:click', function(event, trackObj) {
          self._callExpandEvent(
            self.eventBuilder.newEvent()
            .eventName(trackObj.name)
            .eventAction('Open hotspot layer')
            .target('')
            .cause('click')
            .effect('')
            .primaryCategoryIsInteraction()
            .build(),
            self.bmwTrackOptionsBuilder.options()
              .name('open_hotspot_layer')
              .build()
          );
        })
      ;

      $('.ds2-link', self.element)
        .on('click', function(mouseEvent) {
          mouseEvent.preventDefault();

          var trackOptions = self.bmwTrackOptionsBuilder.options().build();
          var eventName = $(this).text();
          var href = $(this).attr('href') || '';
          var active = {active:true};
          var eventPoints = ''; // not applicable
          var parentMobile = $(this).closest('.ds2-accordion--list-item');
          var parentDesktop = $(this).closest('.ds2-hotspot-element--content');
          var title;

          if (parentMobile.length > 0) { // mobile
            title = parentMobile.find('.ds2-accordion--title').text();
            title = $.trim(title.replace(/(\r\n|\n|\r)/gm, ''));
          } else if (parentDesktop.length > 0) { // desktop and tablet
            title = parentDesktop.find('h3').first().text();
          }

          trackOptions.content = active;
          trackOptions.name = 'page_link';

          var pEvent = self._populateClickEvent(mouseEvent, trackOptions.name, href, eventName, title);
          pEvent.eventInfo.eventPoints = eventPoints;
          dataTracking = self._parseDataFromEvent(pEvent, trackOptions, mouseEvent, true);

          self._setWindowLocation(href, dataTracking.useTimer);
        })
      ;

      self._super();
    },

    _trackVideoEvent: function(scope, eventObj) {
      var self = this,
          $element = $(scope),
          pMappedEvent,
          pMappedObj = {},
          eventName;

      eventName = $element.data('tracking-options').name;

      if ( $element.data('tracking-options') && $element.data('tracking-options').name ) {
        // special pMappedEvent for milestone and progress events
        if(eventObj.eventAction === 'Progress') {
          pMappedEvent = self._loopProp(self.options.mappingObj, 'record_video_progress_seconds');
        } else if(eventObj.eventAction === 'Milestone') {
          pMappedEvent = self._loopProp(self.options.mappingObj, 'record_video_progress_percent');
        } else {
          pMappedEvent = self._loopProp(self.options.mappingObj, eventName);
        }

      }

    pMappedObj = self._mapFilter(pMappedEvent, $element.data('tracking-options').content);

      self._callExpandEvent(
        self.eventBuilder.newEvent()
          .eventName(eventName)
          .eventAction(eventObj.eventAction)
          .target(eventObj.target)
          .effect(eventObj.milestone)
          .primaryCategoryIsEngagement()
          .videoLength(eventObj.duration)
          .build(),
          pMappedObj
      );
    }
  });

}(window, document, jQuery));
