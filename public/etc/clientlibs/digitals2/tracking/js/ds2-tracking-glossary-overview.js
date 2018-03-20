(function(window, document, $, undefined) {
  $.widget('digitals2.ds2TrackingGlossaryOverview', $.digitals2.ds2TrackingBase, {

    _create: function() {
      var ret = this._super();
      this.options.$element = this.element;
      this.options.prevTime = undefined;
      this.options.minTime = 2000;
      return ret;
    },

    _collectArrayElements: function() {
      var activeFilters;
      var activeElements;
      var filteredLinks;

      activeFilters = $('.ds2-glossary-overview--filter-container', this.element)
          .find('.ds2-icon--checkbox-checked');

      var labelsChecked = [];
      activeFilters.each(function() {
        labelsChecked.push($(this).attr('for'));
      });

      activeElements = $('.ds2-glossary-overview--item-container', this.element)
          .find('.ds2-glossary-overview--items:not(.ds2-inactive)');

      filteredLinks = [];
      activeElements.each(function() {
        filteredLinks.push({
          categories: _.intersection($(this).attr('class').split(' '),
              labelsChecked),
          text: $(this).find('.ds2-tracking-js--event').text().trim()
        });
      });

      return filteredLinks;
    },

    _listnersInit: function() {
      var self = this;

      $('.ds2-tracking-js--event', this.element).on('click', function(pEvent) {

        var numElements = self.select('.ds2-glossary-overview--item-container', self.element)
            .find('.ds2-glossary-overview--items:not(.ds2-inactive)').length;
        var trackingEvent = $(this).data('tracking-event');
        if (!trackingEvent) {
          log('you need to have a data tracking event on the this element');
        }

        self._callExpandEvent(
            self.eventBuilder.newEvent()
                .from(trackingEvent || {})
                .onsiteSearch('Glossary')
                .onsiteSearchTerm($(this).text().trim())
                .onsiteSearchResults(numElements)
                .onsiteSearchResultsType('Articles')
                .onsiteSearchResultsFilters(self._collectArrayElements())
                .primaryCategoryIsInteraction()
                .build(),
            self.bmwTrackOptionsBuilder.options()
                .name(self.TC.INTERNAL_CLICK)
                .build());
      });

      $('.ds2-glossary-overview--fastlane', this.element)
          .find('a')
          .on('click', function(e) {

            var newTime = new Date().getTime();
            var diffTime = newTime - self.options.prevTime;
            self.options.prevTime = newTime;

            // fire the function if at least 2 seconds have been elapsed

            if ((diffTime > self.options.minTime) || isNaN(diffTime)) {

              var pOptions = {}; // fs??? wtf
              self._callExpandEvent(
                  self.eventBuilder.newEvent()
                      .onsiteSearch('Glossary')
                      .onsiteSearchTerm('')
                      .onsiteSearchResults(trackObj)
                      .onsiteSearchResultsType('Articles')
                      .onsiteSearchResultsFilters(self
                          ._collectArrayElements().push({
                            text: this.text
                          }))
                      .build(),
                  pOptions); // fs??? wtf
            }
          });

      $(this.element)
          .on('ds2-glossary-overview-tracking', function(event, trackObj) {
            //setTimeout(self._checkDelay, self.options.time);

            var newTime = new Date().getTime();
            var diffTime = newTime - self.options.prevTime;
            self.options.prevTime = newTime;

            // fire the function if at least 2 seconds have been elapsed

            if ((diffTime > self.options.minTime) || isNaN(diffTime)) {
              var searchFilter = self._collectArrayElements();

              var pOptions = {}; // fs??? wtf
              self._callExpandEvent(
                  self.eventBuilder.newEvent()
                      .onsiteSearch('Glossary')
                      .onsiteSearchTerm('')
                      .onsiteSearchResults(trackObj)
                      .onsiteSearchResultsFilters(searchFilter)
                      .onsiteSearchResultsType('Articles')
                      .build(),
                  pOptions); // fs??? wtf

              //Update Tracking Component Layer
              var pIndex = $(this).data('tracking-index'),
                  pObject = {
                    attributes: {
                      onsiteSearchResults: trackObj,
                      onsiteSearchResultsFilter: searchFilter,
                      onsiteSearchResultsType: 'Articles'
                    }
                  };

              self.api.updateComponentTracking(pIndex, pObject, self.api.getCurrentPageIndex());
            }
          });
    }
  });

}(window, document, jQuery));
