// TO DO avoid repetation, namespace the events , put try catches blocks

(function(window, document, $, undefined) {
  $.widget('digitals2.ds2TrackingGallery', $.digitals2.ds2TrackingBase, {
    _isCurrentSlideVideo: function(currentSlide, context) {
      if ($('.slick-active', context).find('.ds2-video-player').length) {
        return 'video-' + currentSlide;
      } else {
        return 'image-' + currentSlide;
      }
    },

    _listnersInit: function() {
      var self = this;
      var round = 1;


      $(window).off('video-start').on('video-start', function(e, trackObj) {
          var trackingOptions = self.bmwTrackOptionsBuilder.options()
              .name(self.TC.START_VIDEO)
              .build();
          self._callExpandEvent(
              trackObj,
              trackingOptions
          );
      });
      $(window).off('video-open').on('video-open', function(e, trackObj) {
            var trackingOptions = self.bmwTrackOptionsBuilder.options()
                .name(self.TC.OPEN_VIDEO)
                .build();
            self._callExpandEvent(
                trackObj,
                trackingOptions
            );
      });
      // $(window).off('open-image').on('open-image', function(e, trackObj) {
      //     var trackingOptions = self.bmwTrackOptionsBuilder.options()
      //         .name(self.TC.OPEN_IMAGE)
      //         .build();
      //     self._callExpandEvent(
      //         trackObj,
      //         trackingOptions
      //     );
      // });
      // $(window).on('start-yt-video', function(e, ytEvent) {
      //   console.log('start YT video');
      // });
      $('.ds2-slider--main', this.element)
          .on('ds2slider-play-video', function(event, trackObj) {
            var trackingOptions = self.bmwTrackOptionsBuilder.options()
              .name(self.TC.START_VIDEO)
              .build();
            self._callExpandEvent(
              trackObj,
              trackingOptions
            );
          })
          .on('download-image', function(event, trackObj) {
            self._callExpandEvent(
                self.eventBuilder.newEvent()
                    .eventName(trackObj.eventName)
                    .eventAction(trackObj.eventAction)
                    .eventPoints(trackObj.eventPoints)
                    .primaryCategory(self.TC.ENGAGEMENT)
                    .mmdr(trackObj.mmdr)
                    .target(trackObj.target)
                    .build(),
                self.bmwTrackOptionsBuilder.options()
                    .name(self.TC.DOWNLOAD)
                    .build());
          });

      $('.ds2-video-player', this.element)
          .on('ds2-video-player-track-absolute-progress', function(event, eventObj) {
            eventObj.eventAction = 'Progress';
            self._trackVideoEvent(this, eventObj);
          })
          .on('ds2-video-player-track-relative-progress', function(event, eventObj) {
            eventObj.eventAction = 'Milestone';
            self._trackVideoEvent(this, eventObj);
          });

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

        pMappedObj = self._mapFilter(pMappedEvent, $element.data('tracking-options').content);
        eventPoints = $element.closest('.ds2-slider').find('.ds2-slider--gallery').data('slide-index') + 1;
      }

      self._callExpandEvent(
        self.eventBuilder.newEvent()
          .eventName(eventName)
          .eventAction(eventObj.eventAction)
          .eventPoints('image-' + eventPoints)
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
