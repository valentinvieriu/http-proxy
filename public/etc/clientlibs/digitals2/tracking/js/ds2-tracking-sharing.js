(function(window, document, $, undefined) {
  $.widget('digitals2.ds2TrackingSharing', $.digitals2.ds2TrackingBase, {

    _listnersInit: function() {

      var self = this;
      var element = this.element;
      var clipboardElement = $(".ds2-sharing--clipboard",element);

      if(clipboardElement){
        clipboardElement.on('click', function(mouseEvent) {

          var dataClipboardHolder = $(".ds2-sharing--copy",element);
          var clipboardTrackingOptions = dataClipboardHolder.data('tracking-options');
          var clipboardTrackingEvent =  dataClipboardHolder.data('tracking-event');

          self._trackSharing(clipboardTrackingEvent);
        });
      }

      //BMWST-4693 - Firefox ignores blur and mouseout seems to be the only event detectable in an iFrame
      $(window).on('mouseout', function(event){
        var src = document.activeElement.src;
        var dataTrackingEvent;
        var dataTrackingOptions;
        var dataTrackingEventElement = $(document.activeElement).closest('.ds2-sharing--element');
        var is_iframe = event.target.tagName.toLowerCase() === 'iframe' ? true : false;

        if(src && dataTrackingEventElement && is_iframe){

          if (dataTrackingEventElement.data('tracking-options')){
            dataTrackingOptions = dataTrackingEventElement.data('tracking-options');
          }
          dataTrackingEvent = dataTrackingEventElement.data('tracking-event');

          self._trackSharing(dataTrackingEvent);

          //removes the focus otherwise tracking was called too many times
          document.activeElement.blur();
        }
      });

    },

    _trackSharing: function(dataTrackingEvent){
      var self = this;
      var eventName = $('title').html();
      if(dataTrackingEvent){
        self._callExpandEvent(
            self.eventBuilder.newEvent()
                .from(dataTrackingEvent)
                .eventName(eventName)
                .eventAction(self.TC.SHARE)
                // for clipboard the target is the page itself
                .target(window.location.href)
                .primaryCategoryIsEngagement()
                .build(),
            self.bmwTrackOptionsBuilder.options()
                .type(self.TC.CLICK)
                .name(self.TC.SHARE)
                .build());
      }
    }
  });

}(window, document, jQuery));
