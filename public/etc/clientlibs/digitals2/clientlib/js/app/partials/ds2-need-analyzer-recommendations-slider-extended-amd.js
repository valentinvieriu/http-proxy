
define('ds2-need-analyzer-recommendations-slider-extended',
    [
        'ds2-need-analyzer-result-page-templates-extended',
        'ds2-na-dispatcher',
        'use!log',
        'use!jquery',
        'ds2-tooltip',
        'use!jquery-slick'
    ], function(templates, dispatcher, log, $, tooltip){
        'use strict';

        function NARecommendationsSlider(component) {

            this.options = {};
            this.$component = $(component);
            this.initTrigger();
            log('> init > ds2-need-analyzer-recommendations-slider');
        }

        NARecommendationsSlider.prototype.initTrigger = function(){
            var self = this;
            var $element = this.$component;

            self.options.needAnalyzerResultPage = $('.ds2-need-analyzer--step-result');
            self.options.resultPageIsVisible = undefined;
            self.options.sliderWrapper = $('.ds2-na-recommendations-wrapper', $element);
            self.options.slider = $('.ds2-na-recommendations-slider', $element);
            self.options.slide = $('.ds2-na-recommendations-slider--slide', $element);
            self.options.carImage = $('.ds2-na-recommendations-slider--car-image', $element);

            //if last image loaded, set Height
            self.options.carImage.eq(self.options.carImage.length - 1).on('load', function () {
                // self._getSliderContentMaxHeight();
                self._setHeight();
                // button area adjustment triggered again after height inside result slider was adjusted
                dispatcher.post('buttonArea');
            });

            $(window).on('resize', Foundation.utils.throttle(function (e) {
                self._getSliderContentMaxHeight();
                self._setHeight();
            }, 250));
            //dispatcher not necessary if just height auto value needed, but if it turns out that proper value needs to be set, then needed
            //event listener if step result page will be become visible
            dispatcher.listen('setResultStepHeight', function () {
                self._setHeight();
            });
            self._initSlider();

            // Need to inform need analyzer that recommendations slider initialized as active view to update slides
            if (self.options.needAnalyzerResultPage.hasClass('active')) {
                dispatcher.post('na-recommendations-slider-initialized');
            }

            // Autoshow/hide the enrgy lable layer if 'smallAutoshown5sec' is selected in the AEM dialog of the result page.
            // Called on the first slide when the user loads the result page or jumps to it via step navigation.
            // See 'dispatcher.post('autoshowEnergyLayer')' in ds2-need-analyzer-input-processor-extended-amd.js.
            dispatcher.listen('autoshowEnergyLayer', function () {
                self._autoshowEnergyLayer();
            });
        };

        NARecommendationsSlider.prototype._initSlider = function () {
            var self = this;

            // Event Listener
            self.options.slider.on('beforeChange', function (event, slick, currentSlide, nextSlide) {
                updateRecommendationCounter(nextSlide + 1);
            });

            self.options.slider.on('afterChange', function (event, slick, currentSlide, nextSlide) {
                updateLinks(slick, currentSlide);

                // Autoshow/hide the enrgy lable layer if 'smallAutoshown5sec' is selected in the AEM dialog of the result page.
                // Triggered on each slide apart from the first one (see listener above).
                self._autoshowEnergyLayer();

                // Tracking:
                self.options.slider.trigger('tracking:needanalyzer:product:update', {matchType: 'Alternative Model'});
            });

            // Slider init
            this.options.slider.slick({
                speed: 500,
                currentSlide: 0,
                slidesToShow: 1,
                centerMode: true,
                rtl: (window.digitals2.main && window.digitals2.main.isRTL) ? window.digitals2.main.isRTL : false,
                touchThreshold: 3, //default 5: means: swipe 1/touchThreshold of slider with for sliding
                // infinite: true,
                // centerPadding: '7.5%',
                centerPadding: '0%',
                lazyLoad: 'progressive',
                prevArrow: '<button type="button" data-role="none" class="slick-prev ds2-na-recommendations-slider--button">' +
                '<span class="ds2-na-recommendations-slider--result_arrow ds2-na-recommendations-slider--result_arrow-l icon-need_analyzer_result_arrow_l"></span>' +
                '<span class="ds2-na-recommendations-slider--arrow-label ds2-font-s ds2-na-recommendations-slider--prev-car"></span>' +
                '</button>',

                nextArrow: '<button type="button" data-role="none" class="slick-next ds2-na-recommendations-slider--button">' +
                '<span class="ds2-na-recommendations-slider--result_arrow ds2-na-recommendations-slider--result_arrow-r icon-need_analyzer_result_arrow_r"></span>' +
                '<span class="ds2-na-recommendations-slider--arrow-label ds2-font-s ds2-na-recommendations-slider--next-car"></span>' +
                '</button>'
            });

            function updateRecommendationCounter(idx) {
                $('.ds2-na-recommendations-slider--current').html(idx || 1);
            }

            function updateArrowLabels(slick, rdata) {
                var p, n;

                if (slick.currentSlide === 0) {
                    p = slick.slideCount - 1;
                }
                else {
                    p = (slick.currentSlide - 1) % slick.slideCount;
                }

                n = (slick.currentSlide + 1) % slick.slideCount;

                $('.ds2-na-recommendations-slider--next-car').text($(slick.$slides[n]).find('h1').text());
                $('.ds2-na-recommendations-slider--prev-car').text($(slick.$slides[p]).find('h1').text());
            }

            function updateSlides(rdata) {
                self.options.slider.slick('removeSlide', true, true, true);
                for (var i = 0; i < rdata.length; ++i) {
                    self.options.slider.slick('slickAdd', rdata[i]);
                }
                $('.ds2-na-recommendations-slider--slides-count').html('/' + rdata.length);

                updateArrowLabels($('.ds2-na-recommendations-slider').get(0).slick, rdata);

                updateLinks($('.ds2-na-recommendations-slider').get(0).slick, 0);

                //check new content max lengths
                self._getSliderContentMaxHeight();
                //to assure height properly set when new slides
                self._setHeight();
                //set class for background typo length accordingly
                self.backgroundTypoLength();

                // must be reinit after all the data is pushed to the slider
                $('.ds2-tooltip').ds2Tooltip();
            }

            function updateHeadline(msg) {
                var headline = $('.ds2-na-recommendations-slider--counter-text');

                if (msg === 'No Answers') {
                    headline.html(headline.data('headline-no-answers'));
                } else if (msg === 'Less Answers') {
                    headline.html(headline.data('headline-less-answers'));
                } else if (msg === 'Perfect Match') {
                    headline.html(headline.data('headline-perfect-match'));
                }
            }

            function updateLinks(slick, currentSlide) {
                var json = decodeURI($(slick.$slides[currentSlide]).attr('data-config-additional'));
                var additionalData;
                try {
                    additionalData = JSON.parse(json);
                    log(additionalData)
                }
                catch(e){
                    //Do nothing, wait for next update
                }
                updateArrowLabels(slick);
                updateBuyLink(additionalData);
                updateShareLinks(additionalData);
                updateDisclaimer();
                updateDetailLayer(additionalData.fullData);
                updateTooltip(additionalData.fullData);
            }

            function updateDetailLayer(data){
                // var modalEl =
                templates.modalTemplate(data);
                // $('#ds2-na-result-detail-layer--info-content').html(modalEl);
            }

            function updateTooltip(data){

                var fragTooltipElements = document.createDocumentFragment();
                var tooltipContainer = document.getElementById('ds2-na-recommendations-slider-js--tooltip-container');
                $(tooltipContainer).empty();
                tooltipContainer.appendChild(fragTooltipElements);
                var tooltipEl = templates.tooltipTemplate(data, '', true);
                fragTooltipElements.appendChild(tooltipEl);
                var tooltipElInfoIcon = templates.tooltipTemplate(data, data.energyEfficiencyHeadline, false);
                fragTooltipElements.appendChild(tooltipElInfoIcon);
                tooltipContainer.appendChild(fragTooltipElements);
                //reprocess the tooltip

                $('.ds2-tooltip', self.options.slider).each(function(i,el){
                    var $el = $(el);
                    if ($el.data("qtip")) {
                        // the 'true' makes the difference
                        $el.qtip("destroy",true);
                        // extra cleanup
                        $el.removeData("hasqtip");
                        $el.removeAttr("data-hasqtip");
                    }
                    new tooltip($el);
                });


            }

            function updateDisclaimer() {
                var d = $('.ds2-na-disclaimer').html();
                var sel = $('.ds2-na--generic-disclaimer');

                if (d) {
                    d.replace(/_BR_/g, '<br/>');
                    sel.html(d);
                    sel.show();
                }
                else {
                    sel.hide();
                }
            }

            function updateShareLinks(data) {

                $('.ds2-na--share-links a').each(function (i, x) {
                    var t = $(x).data('url-pattern');
                    t = t.replace('{configId}', data.configID);
                    $(x).attr('href', t);
                });

                $('.na-share-model').text(data.marketingModelRange);
            }

            function updateBuyLink(data) {
                $('.ds2-need-analyzer--button-outbound').each(function () {
                    var url = '';

                    if ($(this).attr('data-url-external')) {
                        url = $(this).data('url');
                    }
                    else {
                        url = $(this).attr('data-url-internal');
                    }
                    var params = $(this).data('parameters');
                    url += addParams(params, data);

                    $(this).attr('href', url + '/');
                });

            }

            function addParams(params, data) {

                if (!params || params === '') {
                    return;
                }

                Object.keys(data).forEach(function (key) {
                    params = params.replace('${json.' + key + '}', encodeURIComponent(data[key]));
                });

                return params;
            }

            dispatcher.listen('na-result-update', updateSlides);
            dispatcher.listen('na-switch-headline', updateHeadline);
            dispatcher.listen('na-update-counter', updateRecommendationCounter);

            updateRecommendationCounter();

        };

        //BMWST-6969 / ALM ID 6589: calculate dynamic max height result slider elements
        NARecommendationsSlider.prototype._getSliderContentMaxHeight = function () {
            var self = this,
                $additionalContent = $('.ds2-na-recommendations-slider--additional-data'),
                $disclaimers = $('.ds2-na-recommendations-slider--disclaimer-wrapper');
            var i;

            self.options.allAdditionalContentHeights = [];
            self.options.allDisclaimerHeights = [];

            //to sort arrays according to size, highest value first
            function compareNumbers(a, b) {
                return b - a;
            }

            for (i = 0; i < $additionalContent.length; i++) {
                self.options.allAdditionalContentHeights.push($additionalContent.eq(i).height());
            }
            for (i = 0; i < $disclaimers.length; i++) {
                self.options.allDisclaimerHeights.push($disclaimers.eq(i).height());
            }

            self.options.allAdditionalContentHeights.sort(compareNumbers);
            self.options.allDisclaimerHeights.sort(compareNumbers);
        };

        NARecommendationsSlider.prototype._setHeight = function () {
            var self = this,
                increaseFactor = 1,
                percentageContentHeightOfViewportHeight;
            //ds2-na-recommendations-slider does not seem to need the min-height, since it cascades down from ds2-na-recommendations-wrapper
            var $container = $('.ds2-na-recommendations-wrapper, .ds2-na-recommendations-slider');
            // var $container = $('.ds2-na-recommendations-wrapper');
            var wh = $(window).height() - $('.ds2-navigation-main').height();
            var $sharePage = $('.ds2-need-analyzer-share-page');

            if(self.options.allAdditionalContentHeights){
                percentageContentHeightOfViewportHeight = (self.options.allAdditionalContentHeights[0] + self.options.allDisclaimerHeights[0]) * 100 / wh;
            }
            //BMWST-6969 / ALM ID 6589: to give content elements more space on need analyzer application, increase step height
            if (percentageContentHeightOfViewportHeight > 40) { //if the content takes more than x% of viewport, increase height
                increaseFactor += percentageContentHeightOfViewportHeight * 0.01 - 0.2; //increase factor calculated by testing responsiveness
            }
            wh = wh * increaseFactor;

            // for small devices set a max height, otherwise background image stretched way too much
            if ($(window).width() < 521 && wh > 850) {
                wh = 850;
            }
            //to save a min height
            if (wh < 750) {
                wh = 750;
            }

            $container.css('min-height', wh);

            //dispatcher not necessary if just height auto value needed, but if it turns out that proper value needs to be set, then needed
            if (this.options.needAnalyzerResultPage.hasClass('active')) {
                $('.ds2-need-analyzer').css('height', wh);
            }

            //share page does not have ds2-need-analyzer, so it is set to the next wrapping element
            if ($sharePage.length) {
                $('main.main').css('min-height', wh - 1);
            }
        };

        NARecommendationsSlider.prototype.backgroundTypoLength = function () {
            var $allTypos = $('.ds2-na-recommendations-slider--series-typo');

            for (var i = $allTypos.length - 1; i >= 0; i--) {
                var typoLength = $allTypos.eq(i).html().length;
                $allTypos.eq(i).addClass('ds2-na-recommendations-slider--series-typo-length-' + typoLength);
            }
        };

        // Method to autoshow/hide the enrgy lable layer if 'smallAutoshown5sec' is selected in the AEM dialog of the result page.
        NARecommendationsSlider.prototype._autoshowEnergyLayer = function () {
            var smallAutoshown5sec = $('.slick-current').find('.ds2-icon--smallAutoshown5sec');

            if (smallAutoshown5sec) {
                // Trigger click on energy label to open the energy layer.
                smallAutoshown5sec.trigger('click');

                // Close the energy layer after 5 seconds.
                setTimeout(function () {
                    $('[data-id="' + $(smallAutoshown5sec).data('tooltip-id') + '"] .ds2-tooltip-element--close-link').trigger('click');
                }, 5000);
            }
        };

        return NARecommendationsSlider;
    });
