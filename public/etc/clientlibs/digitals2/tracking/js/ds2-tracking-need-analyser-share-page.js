(function (window, document, $, undefined) {
  $.widget('digitals2.ds2TrackingNeedAnalyzerSharePage', $.digitals2.ds2TrackingBase, {

    _create: function () {
      var ret = this._super();

      return ret;
    },

    _listnersInit: function () {
      var self = this;

      $(self.element).on('tracking:needanalyzer:sharepage:update', function (event, trackObj) {
        self._updateProductTrackingData(trackObj);
        self._updatePageTrackingData();
      });
    },

    _updateProductTrackingData: function (trackObj) {
      var self = this;
      var optionsName = 'need_analyzer_product';
      var options = window.digitals2.tracking.bmwTrackOptionsBuilder.options();

      var pObject = { // product tracking object
        productInfo: {
          productName: trackObj.marketingModelRange
        },
        attributes: {
          mmdr: trackObj.modelRange,
          serie: trackObj.seriesNumber,
          bodyType: trackObj.bodyType,
          modelCode: trackObj.modelCode,
          yearOfLaunch: '',
          matchType: '',
          position: ''
        }
      };

      options.name(optionsName);

      self.api.initProductTracking(pObject, self.api.getCurrentPageIndex());
      window.digitals2.tracking.dispatcher.bmwTrack(options.build());
    },

    _updatePageTrackingData: function () {
      var optionsName = 'need_analyzer_step';
      var options = this.bmwTrackOptionsBuilder.options();
      var pageObj = {
        'page': {
          'attributes': {
            'entryType': 'Share'
          }
        }
      };

      $.extend(true, this.api.getPageObject(digitals2.tracking.api.getCurrentPageIndex()), pageObj);
      options.name(optionsName);

      window.digitals2.tracking.dispatcher.bmwTrack(options.build());
    }
  });

}(window, document, jQuery));
