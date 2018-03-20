define('ds2-needanalyzer-share-page',
  [
    'use!jquery',
    'ds2-cookie-controller',
    'ds2-main'
  ], function ($) {
    $.widget('digitals2.ds2NeedAnalyzerSharePage', {

      _create: function () {

        this._getCarData(window.location.pathname.split('.')[2]);

      },

      _populateElements: function (data) {
        log('_populateElements, data ', data);
        var contentObject = {
          priceLine: data.priceLine,
          consumptionLine: data.consumptionLine,
          co2EmissionLine: data.co2EmissionLine,
          marketSpecificValue1: data.electricConsumptionLine,
          marketSpecificValue2: data.capacity,
          seriesNumber: data.seriesNumber,
          vehicleSpecificPageDisclaimer: insertLineBreaks(data.vehicleSpecificPageDisclaimer),
          vehicleSpecificPriceDisclaimer: insertLineBreaks(data.vehicleSpecificPriceDisclaimer),
          marketSpecificDisclaimer1: insertLineBreaks(data.marketSpecificDisclaimer1),
          marketSpecificDisclaimer2: insertLineBreaks(data.marketSpecificDisclaimer2)
        };
        //energyLabel & car image addressed separately since this is not substituting content but changed class and img src names
        var energyLabel = data.energyLabel,
          carImage = data.cosyLarge;

        function setCarImg() {
          $('.ds2-na-recommendations-slider--car-image').attr('src', carImage);
        }

        function setEnergyLabel() {
          energyLabel === "A+" ? 'AA' : energyLabel;

          $('.ds2-js-na-energyLabel').addClass('ds2-icon--efficency-' + energyLabel);
          $('.ds2-js-na-energy-img').attr('src', '/content/dam/bmw/common/images/needanalyzer/BMW_image_large_' + energyLabel + '.png');
        }

        function backgroundTypoLength() {
          var $typo = $('.ds2-na-recommendations-slider--series-typo');
          var typoLength = contentObject.seriesNumber.length;

          $typo.addClass('ds2-na-recommendations-slider--series-typo-length-' + typoLength);
        }

        function insertLineBreaks(input) {
          var output;
          output = input ? input.replace(/_BR_/g, '<br/>') : '';
          return output;
        }

        function fillContentFromJson() {
          $.each(contentObject, function (key, value) {
            var className = '.ds2-js-na-' + key;

            //write content of json only in field on landing page, if value not '0', else leave it empty and hide
            if (value !== '0') {
              $(className).html(value);
            } else {
              $(className).addClass('hide');
            }
          });

          //case: if all content (i.e. vehicleSpecificPriceDisclaimer + marketSpecificDisclaimer2) info i would be empty, so hide
          if (contentObject.vehicleSpecificPriceDisclaimer === '0' && contentObject.marketSpecificDisclaimer2 === '0') {
            $('.ds2-need-analyzer-share-page .ds2-icon--need_analyzer_result_info').remove();
          }
        }

        //only set img src if there is one in JSON file, otherwise keep small image as fallback
        if (carImage.length > 0) {
          setCarImg();
        }
        setEnergyLabel();
        backgroundTypoLength();
        fillContentFromJson();

        this.element.trigger('tracking:needanalyzer:sharepage:update', data);
      },

      _getCarData: function (configId) {
        var self = this;
        var carData = null;
        // in case the jquery attr issue reappears
        // var jsonSrc = document.getElementById('na-data').getAttribute('src');
        $.get($('#na-data').attr('src'), function (data) {

          if (data.vehicles) {
            for (var i = 0; i < data.vehicles.length; ++i) {
              if (data.vehicles[i].configID === configId) {
                carData = data.vehicles[i];
                break;
              }
            }
            if (carData) {
              self._populateElements(carData);
            } else {
              //error - configID not in JSON
            }
          } else {
            //error - broken JSON
          }
        }).fail(function () {
          //error ajax 404 etc.
        });
      }

    });

    function ds2NeedAnalyzerSharePage(element) {
      this.element = $(element);
      this.init();
    };

    ds2NeedAnalyzerSharePage.prototype.init = function () {
      this.element.ds2NeedAnalyzerSharePage();
    };

    return ds2NeedAnalyzerSharePage;

  });
