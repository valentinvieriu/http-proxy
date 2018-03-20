/**
* @title: Technical data
* @description: The purpose of this component is to show the technical characteristics of a car to the customer.
*/

define( 'ds2-technical-data', [
    'use!jquery',
    'ds2-image-lazyLoad',
    'ds2-image-height',
    'use!jquery-slick',
    'ds2-main'
], function($, ds2imagelazyLoad, ds2imageHeight) {

  // event cache
  var evt = {
    slickGoTo:                    'slickGoTo',
    technicalDataImpressionTrack: 'ds2-technical-data-impressionTrack'
  };

  // selector cache
  var sel = {
    dropdownJSItem:               '.ds2-dropdown-js--item',
    dropdownLink:                 '.ds2-dropdown--link',
    sliderMain:                   '.ds2-slider--main',
    technicalData:                '.ds2-technical-data'
  };

  var component = $(sel.technicalData),
      target;

  // set hash of first tab if page is loaded without a hash in the URL
  // (outside of the widget to load before foundation) //BMWST-4718
  if(component.length && window.location.hash == '') {
    target = $(sel.dropdownLink, component[0]);

    if(target.length) {
      window.location.hash = $(target[0]).attr("href").substr(1);
    }
  }

  var TechnicalData = function(element) {

    this.$element = $(element);
    new ds2imagelazyLoad(element);
    this._create();
  };

  var proto = TechnicalData.prototype;

  proto._create = function () {
    var self = this,
        $defaultDropdownItem = $(sel.dropdownJSItem + '.active', self.$element);

    window.digitals2.main.scrollToAnkers = false;


    // the slider needs to be initialized on tab change.
    // telling slick to go to the first image (of the new tab) gets this job done
      window.digitals2.main.$window.on('hashchange.fndtn.tab', function() {
          var $images = $(sel.sliderMain, self.$element);
          ds2imageHeight.setHeight($images);
          if ($images.hasClass('slick-initialized')) {
              $images.slick(evt.slickGoTo, 0, true);
          }
      });



    // track default tab which is selected in dropdown
    // BMWDGTLTP-2681 - Click Types used in previous taggingplans that can be removed
    // if ($defaultDropdownItem.length > 0) {
    //   self._triggerImpressionTracking($(sel.dropdownLink, $defaultDropdownItem), 'automatic', Date.now());
    // }


    // track user clicks on items in dropdown
    $(sel.dropdownLink, self.$element)
        .on('click', function() {
          var trackObj = {
            eventName: $(this).text().trim(),
            eventCause: 'active'
          };
          // BMWDGTLTP-2681 - Click Types used in previous taggingplans that can be removed
          //self.$element.trigger(evt.technicalDataImpressionTrack, trackObj);
        });
  }
  // BMWDGTLTP-2681 - Click Types used in previous taggingplans that can be removed
  // proto._triggerImpressionTracking = function(pThis, pCause, pTimestamp) {
  //   var self = this,
  //       triggerObject = {
  //         pName: $(pThis).text().trim(),
  //         pTimestamp: pTimestamp,
  //         pCause: pCause
  //       };
  //
  //   self.$element.trigger(evt.technicalDataImpressionTrack, triggerObject);
  // }

  return TechnicalData;
});
