(function(window, document, $, undefined) {
  $.widget('digitals2.ds2TrackingMagazineText', $.digitals2.ds2TrackingBase, {

    _listnersInit: function() {
      var self = this;

      $('.ds2-article-text--textbox a', self.element).on('click', function(mouseEvent) {
          mouseEvent.preventDefault();

          var trackOptions = self.bmwTrackOptionsBuilder.options().build();
          var href = $(this).attr('href') || '';
          var title = $(this).text();
          var target = mouseEvent.target;
          var cause = "";
          var active = {active:true};

          trackOptions.content = active;

          if(target.hostname === location.hostname) {
            trackOptions.name = 'page_link';
          } else {
            trackOptions.name = 'external_link';
          }

          dataTracking = self._parseDataFromEvent(self._populateClickEvent(mouseEvent, trackOptions.name, href, title, cause),
                                                  trackOptions, mouseEvent, true);

          self._setWindowLocation(href, dataTracking.useTimer);
      });

      this._super();
    }
  });

}(window, document, jQuery));
