define('ds2-need-analyzer-result-page-templates',
    [
        'use!jquery',
        'use!log',
        'ds2-na-config'
    ], function($, log, NAConfig){

        /*
         important legal feature - some text needs to be formatted exactly,
         so line breaks are inserted as edited in AEM
         */
        function insertLineBreaks(text){
            if(text && text.length){
                return text.replace(/_BR_/g,'<br/>');
            }
        }

        function getELabel(label) {
            return label === "A+" ? 'AA' : label; //normalize icon name
        }

        return {

            slideTemplate: function(data){

                var additional = {
                    brand: data.brand,
                    configID: data.configID,
                    modelRange: data.modelRange,
                    marketingModelRange: data.marketingModelRange,
                    modelCode: data.modelCode,
                    series: data.seriesNumber,
                    bodyType: data.bodyType,
                    fullData: data     //TODO this is a terrible hack and will be removed
                };

                var vspd = insertLineBreaks(data.vehicleSpecificPageDisclaimer);

                var slide = '<div class="ds2-na-recommendations-slider--slide" data-config-additional="'+ encodeURI(JSON.stringify(additional)) +'">'+ '<div class="ds2-na-recommendations-slider--additional-data ds2-cms-output">';

                if(data.marketingModelRange !== '0') {
                    slide += '<h1 class="ds2-na-recommendations-slider--title" data-slide-tpl="model">'+ data.marketingModelRange +'</h1>';
                }
                //special case: only show nothing in this line if neither price nor disclaimer available
                if(data.priceLine !== '0' || data.vehicleSpecificPriceDisclaimer !== '0' || data.marketSpecificDisclaimer2 !== '0') {
                    slide += '<div class="ds2-na-recommendations-slider--spec ds2-na-recommendations-slider--price" data-slide-tpl="price">';

                    if(data.priceLine !== '0') {
                        slide += '<span class="ds2-na-recommendations-slider--price-content">' + data.priceLine + '</span>';
                    }
                    //only show icon if one of the shown disclaimers has content
                    if(data.vehicleSpecificPriceDisclaimer !== '0' || data.marketSpecificDisclaimer2 !== '0') {
                        slide += '<span class="ds2-info-icon ds2-tooltip ds2-na-recommendations-slider--tooltip ds2-need-analyzer--icon-info ds2-icon--need_analyzer_result_info" data-tooltip-id="tooltip-needanalyzer-priceinfo-'+ data.configID +'" data-tooltip-type="" data-open-onclick="true"></span>';
                    }

                    slide += '</div>';
                }
                if(data.consumptionLine !== '0' || data.electricConsumptionLine !== '0' || data.co2EmissionLine !== '0' || data.capacity !== '0') {
                    slide += '<div class="ds2-na-recommendations-slider--consumption-wrapper">';

                    if(data.consumptionLine !== '0') {
                        slide += '<span class="ds2-na-recommendations-slider--spec" data-slide-tpl="consumption">'+ data.consumptionLine +'</span>';
                    }
                    if(data.electricConsumptionLine !== '0') {
                        slide += '<span class="ds2-na-recommendations-slider--spec" data-slide-tpl="electricConsumption">'+ data.electricConsumptionLine +'</span>';
                    }
                    if(data.co2EmissionLine !== '0') {
                        slide +=  '<div class="ds2-na-recommendations-slider--spec ds2-na-recommendations-slider--co2Emission" data-slide-tpl="co2Emission">' +
                            '<span class="ds2-na-recommendations-slider--co2Emission-content">' + data.co2EmissionLine + '</span>';

                        if(data.energyLabel !== '0') {
                            slide += this.efficiencyIconTemplate(data.energyLabel, data.configID);
                        }

                        slide += '</div>';
                    }
                    if(data.capacity !== '0') {
                        slide += '<span class="ds2-na-recommendations-slider--spec" data-slide-tpl="msv2">'+ data.capacity +'</span>';
                    }

                    slide += '</div>';
                }

                slide += '</div>';

                if(data.cosyLarge !== '0' || data.seriesNumber !== '0') {
                    slide += '<div class="ds2-na-recommendations-slider--car-image-wrapper">';

                    if(data.cosyLarge !== '0') {
                        slide += '<img class="ds2-na-recommendations-slider--car-image"'+ 'src="'+ data.cosyLarge +'"'+'/>';
                    }
                    if(data.seriesNumber !== '0') {
                        slide += '<span class="ds2-na-recommendations-slider--series-typo" data-slide-tpl="series">'+ data.seriesNumber +'</span>';
                    }

                    if(vspd !== '0' || $('.ds2-na-disclaimer').html()) {
                        slide +=  '<div class="ds2-disclaimer ds2-disclaimer--asterix ds2-na-recommendations-slider--disclaimer-wrapper">'+
                            //this.getDetailLayer(data) +
                            '<ul>';
                        if(vspd !== '0') {
                            slide += '<li class="ds2-na-recommendations-slider--disclaimer ds2-disclaimer--list-item" data-slide-tpl="vehicleSpecificPageDisclaimer">'+
                                vspd +
                                '</li>';
                        }
                        if($('.ds2-na-disclaimer').html()) {
                            slide += '<li class="ds2-na-recommendations-slider--disclaimer ds2-disclaimer--list-item ds2-na--generic-disclaimer" data-slide-tpl="genericDisclaimer"></li>';
                        }
                        slide +=     '</ul>' +
                            '</div>';
                    }
                    slide += '</div>';
                }
                slide += '</div>';

                return slide;
            },

            efficiencyIconTemplate: function(label, configID){
                return '<span class="ds2-tooltip ds2-na-recommendations-slider--tooltip ds2-tooltip--alpha ds2-icon--efficency ds2-icon--efficency-'+ getELabel(label) +'" data-tooltip-id="tooltip-needanalyzer-efficencyinfo-'+ configID +'" data-tooltip-type="" data-open-onclick="true"></span>';
            },

            /**
             * This method will return the container for details layer
             * @param detail - data for detail layer
             * @param configID - car's configID
             * @returns {string} - DOM object as string //TODO refactor to use plain DOM object, instead of string.
             */
            getDetailLayer: function(data) {
                var result = '';

                try {
                    //Link wrapper
                    result += '<div class="ds2-need-analyzer--detail-layer-link">' +
                        '<a class="ds2-link ds2-icon ds2-icon--arrow-big-r-white ds2-need-analyzer--info-text" data-reveal-id="ds2-na-result-detail-layer">View your configuration in detail</a>' +
                        '</div>';
                }
                catch (e) {
                    log('There is an error when trying to get link for detail layer. ds2-need-analyzer-result-templates.js', e);
                }

                return result;
            },

            //TODO:
            //landing page adjustments
            //edge case testing
            tooltipTemplate: function(data, priceInfo) {
                var vsprd = insertLineBreaks(data.vehicleSpecificPriceDisclaimer);
                var mspd1 = insertLineBreaks(data.marketSpecificDisclaimer1);
                var mspd2 = insertLineBreaks(data.marketSpecificDisclaimer2);

                var tooltipEl = document.createElement('div');
                tooltipEl.className = 'ds2-tooltip-element';

                var tooltipElHead = '<div class="ds2-tooltip-element--close">'+
                    '<a class="ds2-tooltip-element--close-link" href="#">'+
                    '<span class="ds2-icon ds2-icon--close-white  ds2-icon--bg "></span>'+
                    '</a>'+
                    '</div>'+
                    '<div class="ds2-tooltip-element--body">';
                var tooltipElBody = '';

                //distinction between tooltip overlays
                if(priceInfo) {
                    tooltipEl.dataset.id = 'tooltip-needanalyzer-priceinfo-'+ data.configID;

                    if(data.vehicleSpecificPriceDisclaimer !== '0') {
                        tooltipElBody += '<div class="ds2-cms-output">'+ vsprd +'</div>';
                    }
                    if(data.marketSpecificDisclaimer2 !== '0') {
                        tooltipElBody += '<div class="ds2-cms-output">'+ mspd2 +'</div>';
                    }
                }
                else {
                    tooltipEl.dataset.id  = 'tooltip-needanalyzer-'+ data.configID;

                    if(NAConfig.naAppOptions.energyEfficiencyHeadline !== '0') {
                        tooltipElBody += '<h1 class="ds2-na-recommendations--tooltip-headline ds2-font-l-na-custom">'+ NAConfig.naAppOptions.energyEfficiencyHeadline +'</h1>';
                    }
                    if(data.marketingModelRange !== '0') {
                        tooltipElBody += '<h5>'+ data.marketingModelRange +'</h5>';
                    }
                    if(data.energyLabel !== '0') {
                        tooltipEl.dataset.id  = 'tooltip-needanalyzer-efficencyinfo-'+ data.configID;
                        tooltipElBody += '<img src="/content/dam/bmw/common/images/needanalyzer/BMW_image_large_'+ getELabel(data.energyLabel) +'.png">';
                    }
                    if(data.marketSpecificDisclaimer1 !== '0') {
                        tooltipElBody += '<div class="ds2-cms-output">'+ mspd1 +'</div>';
                    }
                }

                var tooltipElFooter = '</div>';

                tooltipEl.innerHTML = tooltipElHead + tooltipElBody + tooltipElFooter;

                return tooltipEl;
            },

            _createElement: function(tagName, attributes) {
                var el = $(document.createElement(tagName));
                if (attributes) {
                    el.attr(attributes);
                }
                return el;
            },

            modalTemplate: function(carData) {

                var html;
                var vehicleName = carData.marketingModelRange || 'no vehicle name available';
                var vehicleImage = carData.cosyLarge || '';

                //$('.ds2-need-analyzer-support-layer--headline').text(vehicleName);
                $('.ds2-need-analyzer-priceLine strong').text(carData.priceLine);
                $('.ds2-need-analyzer-vehicle-pic').attr({
                    alt: vehicleName,
                    src: vehicleImage
                });

                //this._getAccordionElementTemplate(carData);
            },

            _getAccordionListItemElementTemplate: function(title) {
                var li = this._createElement("li", {
                    "class": "ds2-accordion--list-item ds2-tracking-js--accordion-expand ds2-accordion--head",
                    "style": "border: 0;"//TODO move to css
                });
                var h2 = this._createElement("h2", {
                    "class": "ds2-accordion--title ds2-tracking-js--accordion-expand",
                    "style": "text-transform:none;border-bottom: 1px solid #e6e6e6;padding: 10px 0;"//TODO move to css
                });
                h2.html(title || "");
                li.prepend(h2);

                return li;
            },

            _getAccordionElementTemplate: function(carData) {
                //TODO optimize detailsData and get it from other function
                //TODO add more objects based on missing labels/details
                var detailsData = {
                    model: [{
                        label: "Power Output:",
                        value: carData.horsePower || null
                    }, {
                        label: "Capacity:",
                        value: carData.capacity || null
                    }, {
                        label: "Fuel Type:",
                        value: carData.fuelType || null
                    }, {
                        label: "Transmission",
                        value: carData.transmission || null
                    }, {
                        label: "Consumption:",
                        value: carData.consumptionLine || null
                    }, {
                        label: "Electrical Range:",
                        value: carData.electricalRange || null
                    }, {
                        label: "Electric Consumption:",
                        value: carData.electricConsumptionLine || null
                    }, {
                        label: "CO2-Emission:",
                        value: carData.co2EmissionLine || null
                    }
                    ]
                };

                //Price summary data
                if (carData.priceSummary) {
                    detailsData.priceSummary = [
                        {
                            label: "Selected Options:",
                            value: null
                        }, {
                            label: "Price:",
                            value: carData.priceSummary.grossPrice || null
                        }, {
                            label: "Price Discount: ",
                            value: carData.priceSummary.grossDiscount || null
                        }, {
                            label: "Price Discount(%):",
                            value: carData.priceSummary.grossDiscountPercent || null
                        }, {
                            label: "NET Price:",
                            value: carData.priceSummary.netPrice || null
                        }, {
                            label: "NET Discount:",
                            value: carData.priceSummary.netDiscount || null
                        }, {
                            label: "NET Discount(%):",
                            value: carData.priceSummary.netDiscountPercent || null
                        }, {
                            label: "Total Taxes:",
                            value: carData.priceSummary.totalTaxes || null
                        }, {
                            key: 'taxes',
                            label: "Taxes",
                            value: carData.priceSummary.taxes || null//Taxes array should be like [{id: null, name: null, price: null}]
                        }
                    ]
                }

                //Model content
                var $modelAccordionLI = this._getAccordionListItemElementTemplate("Model");
                var $modelAccordionContent = this._createElement("div", {
                    "class": "ds2-accordion--content"
                });
                //Model sub heading
                var $modelSubHeading = this._createElement("h4").html(carData.marketingModelRange || "");//Car name
                $modelAccordionContent.append($modelSubHeading);
                //Model detail labels container
                var $modelDetailsLabelsContainer = this._createElement("div", {
                    "class": "columns small-6 medium-6 large-6",
                    "style": "text-align: left;"//TODO move to css
                });
                //Model detail values container
                var $modelDetailsValuesContainer = this._createElement("div", {
                    "class": "columns small-6 medium-6 large-6",
                    "style": "text-align: right;"//TODO move to css
                });
                //Populate model details data
                for (var i in detailsData.model) {
                    var mLabel = detailsData.model[i].label;
                    var mValue = detailsData.model[i].value;
                    if (mValue) {
                        $modelDetailsLabelsContainer.append(this._createElement("div").html(mLabel));
                        $modelDetailsValuesContainer.append(this._createElement("div").html(mValue));
                    }
                }
                $modelAccordionContent.append($modelDetailsLabelsContainer);
                $modelAccordionContent.append($modelDetailsValuesContainer);
                $modelAccordionLI.append($modelAccordionContent);

                //Check if price summary data is available
                var $priceSummaryAccordionLI;
                if (detailsData.priceSummary) {
                    //Price Summary
                    $priceSummaryAccordionLI = this._getAccordionListItemElementTemplate("Price Summary");
                    var $priceSummaryAccordionContent = this._createElement("div", {
                        "class": "ds2-accordion--content"
                    });
                    var $priceSummaryLabelsContainer = this._createElement("div", {
                        "class": "columns small-6 medium-6 large-6",
                        "style": "text-align: left;"
                    });
                    var $priceSummaryValuesContainer = this._createElement("div", {
                        "class": "columns small-6 medium-6 large-6",
                        "style": "text-align: right;"
                    });
                    //Populate price summary data
                    for (var p in detailsData.priceSummary) {
                        var pLabel = detailsData.priceSummary[p].label;
                        var pValue = detailsData.priceSummary[p].value;
                        if (detailsData.priceSummary[p].key && detailsData.priceSummary[p].key == "taxes") {
                            //Taxes value should be an array
                            if (pValue && pValue.length > 0) {
                                console.log(pValue);
                                for (var t in pValue) {
                                    var tax = pValue[t];
                                    console.log(tax);
                                    $priceSummaryLabelsContainer.append(this._createElement("small").html(tax.taxKey + "("+tax.taxPercentage+"%)"));
                                    $priceSummaryValuesContainer.append(this._createElement("small").html(tax.taxValue));
                                }
                            }
                        }
                        else {
                            if (pValue) {
                                $priceSummaryLabelsContainer.append(this._createElement("div").html(pLabel));
                                $priceSummaryValuesContainer.append(this._createElement("div").html(pValue));
                            }
                        }
                    }
                    $priceSummaryAccordionContent.append($priceSummaryLabelsContainer);
                    $priceSummaryAccordionContent.append($priceSummaryValuesContainer);
                    $priceSummaryAccordionLI.append($priceSummaryAccordionContent);
                }

                $('.ds2-need-analyzer-detail-info-list').empty().append(
                    $modelAccordionLI[0].outerHTML,
                    $priceSummaryAccordionLI[0].outerHTML
                );
            }
        };
    });
