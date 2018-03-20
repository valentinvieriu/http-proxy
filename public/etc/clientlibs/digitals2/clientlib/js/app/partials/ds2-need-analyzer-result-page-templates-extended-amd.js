define('ds2-need-analyzer-result-page-templates-extended',
    [
        'use!jquery',
        'use!log',
        'ds2-na-config',
        'use!accounting'
    ], function($, log, NAConfig, Accounting){

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

        function getAdditionalDataLabels() {
            return {
                price: NAConfig.naAppOptions.priceLineLabel || '',
                netPrice: NAConfig.naAppOptions.netPriceLabel || '',
                optionsPrice: NAConfig.naAppOptions.optionsPriceLabel || '',
                totalTaxes: NAConfig.naAppOptions.totalTaxesLabel || '',
                grossPrice: NAConfig.naAppOptions.grossPriceLabel || '',
                grossDiscount: NAConfig.naAppOptions.grossDiscountLabel || '',
                grossDiscountPercent: NAConfig.naAppOptions.grossDiscountPercentLabel || '',
                netDiscount: NAConfig.naAppOptions.netDiscountLabel || '',
                netDiscountPercent: NAConfig.naAppOptions.netDiscountPercentLabel || '',
                consumption: NAConfig.naAppOptions.consumptionLineLabel || '',
                consumptionUnit: NAConfig.naAppOptions.consumptionLineUnit || '',
                elConsumption: NAConfig.naAppOptions.electricConsumptionLineLabel || '',
                elConsumptionUnit: NAConfig.naAppOptions.electricConsumptionLineUnit || '',
                co2Emission: NAConfig.naAppOptions.co2EmissionLineLabel || '',
                co2EmissionUnit: NAConfig.naAppOptions.co2EmissionLineUnit || '',
                capacity: NAConfig.naAppOptions.capacityLineLabel || '',
                capacityUnit: NAConfig.naAppOptions.capacityLineUnit || '',
                electricalReach: NAConfig.naAppOptions.electricalReachLabel || '',
                electricalReachUnit: NAConfig.naAppOptions.electricalReachUnit || '',
                fuelEquivalent: NAConfig.naAppOptions.fuelEquivalentLabel || '',
                fuelEquivalentUnit: NAConfig.naAppOptions.fuelEquivalentUnit || '',
                co2electricity2fuel: NAConfig.naAppOptions.co2electricity2fuelLabel || '',
                co2electricity2fuelUnit: NAConfig.naAppOptions.co2electricity2fuelUnit || '',
                horsePower: NAConfig.naAppOptions.horsePowerLabel || '',
                horsePowerUnit: NAConfig.naAppOptions.horsePowerUnit || '',
                electricalRange: NAConfig.naAppOptions.electricalRangeLabel || '',
                electricalRangeUnit: NAConfig.naAppOptions.electricalRangeUnit || '',
                fuelType: NAConfig.naAppOptions.fuelTypeLabel || '',
                transmission: NAConfig.naAppOptions.transmissionLabel || '',
                showroomLink: NAConfig.naAppOptions.showroomLinkLabel || ''
            }
        }

        function isVisibleLine(line) {
            return NAConfig.naAppOptions[line + "Checkbox"];
        }

        function formatPrice(price) {
            var symbol = NAConfig.currency.symbol,
                precision = 0,
                thousand = NAConfig.currency.separator,
                decimal,
                format = NAConfig.currency.format,
                pattern = NAConfig.currency.pattern,
                before,
                after,
                override = false;

            if(pattern){
                var array = pattern.split('###');

                if (array.length === 2){
                    before = array[0];
                    thousand = '';
                    after = array[1].split('##');
                    override = true;
                }
                else if (array.length === 3){
                    before = array[0];
                    thousand = array[1];
                    after = array[2].split('##');
                    override = true;
                }

                if(override === true){
                    if (after.length === 2){
                        decimal = after[0];
                        precision = 2;
                    }
                    format = before + '%v' + after[after.length-1];
                }
            }

            return Accounting.formatMoney(price, {
                symbol : symbol,
                precision : precision,
                thousand : thousand,
                decimal : decimal,
                format : format
            });
        }

        function getMarketSpecifcSpecs(input, data) {
            var key = NAConfig.naAppOptions[input],
                labels = getAdditionalDataLabels(),
                taxes = (data.priceSummary !== null && data.priceSummary.taxes !== null) ? data.priceSummary.taxes : null;

            var marketSpecificValues = {
                // Vehicle Registration Tax (RegTax)
                // label coming from tax dictionary
                // value coming from taxes array
                registrationTax: {
                    label: findTaxLabel('RegTax'),
                    value: taxes !== null ? findTaxValue(taxes, 'RegTax') : null
                },
                // Electrical reach
                // label and unit coming from aem dialog
                // value coming from ucp through MI
                electricalReach: {
                    label: labels.electricalReach  || '',
                    value: data.electricalReach || null,
                    unit: labels.electricalReachUnit || ''
                },
                // Fuel equivalent
                // label and unit coming from aem dialog
                // value coming from ucp through MI
                fuelEquivalent: {
                    label: labels.fuelEquivalent  || '',
                    value: data.fuelEquivalent || null,
                    unit: labels.fuelEquivalentUnit || ''
                },
                // CO2 electricity/fuel
                // label and unit coming from aem dialog
                // value coming from ucp through MI
                co2electricity2fuel: {
                    label: labels.co2electricity2fuel  || '',
                    value: data.co2electricityfuel || null,
                    unit: labels.co2electricity2fuelUnit || ''
                },
                // BIK
                // label coming from tax dictionary
                // @TODO check: value coming from ucp through MI
                bik: {
                    label: findTaxLabel('BIK'),
                    value: data.bik || null
                },
                // NoVa
                // label coming from tax dictionary
                nova: {
                    label: findTaxLabel('NoVa'),
                    value: taxes !== null ? findTaxValue(taxes, 'NOVA') : null
                },
                // Bijtelling
                // label coming from tax dictionary
                // value coming from ucp through MI
                bijtelling: {
                    label: findTaxLabel('Bijtelling'),
                    value: data.bijtelling || null,
                    unit: '%'
                }
            };
            var output = marketSpecificValues[key];

            //console.log(key, marketSpecificValues);

            if (!output.value || output.value === 0) {
                return '';
            }

            if (output.label && output.label !== '') {
                output.label += ': '
            }

            if (!output.unit || output.unit === 0) {
                output.unit = '';
            }

            return output.label + output.value  + ' ' + output.unit;
        }

        function findTaxValue(taxes, key){
            for (var i = 0; i < taxes.length; i++) {
                if (taxes[i]) {
                    var tax = taxes[i];
                    if (tax.taxKey === key) {
                        return formatPrice(tax.taxValue);
                    }
                }
            }
        }

        function findTaxLabel(key) {
            var taxName = key;
            var taxDictionary = NAConfig.taxes;

            if(taxDictionary && taxDictionary[key]) {
                taxName = taxDictionary[key];
            }

            return taxName;
        }

        return {

            slideTemplate: function(data){

                var additional,
                    labels = getAdditionalDataLabels(),//Labels and units for each line of the additional data.
                    slide,
                    brand = data.brand && data.brand === 'BI' ? ' ds2-branded-bmwi' : '';//Add branding class to slides showing BMWi cars - so that their headline styles match the BMWi CI.

                additional = {
                    brand: data.brand,
                    configID: data.configID,
                    modelRange: data.modelRange,
                    marketingModelRange: data.marketingModelRange,
                    modelCode: data.modelCode,
                    series: data.seriesNumber,
                    bodyType: data.bodyType,
                    fullData: data     //TODO this is a terrible hack and will be removed
                };

                slide = '<div class="ds2-na-recommendations-slider--slide' + brand + '" data-config-additional="'+ encodeURI(JSON.stringify(additional)) +'">';
                slide += '<div class="ds2-na-recommendations-slider--additional-data ds2-cms-output">';

                if(data.marketingModelRange) {
                    slide += '<h1 class="ds2-na-recommendations-slider--title" data-slide-tpl="model">'+ data.marketingModelRange +'</h1>';
                }
                //special case: only show nothing in this line if neither price nor disclaimer available
                //Price Line
                if (isVisibleLine('priceLine') ) {
                    if(data.priceLine || data.marketSpecificDisclaimer2) {
                        slide += '<div class="ds2-na-recommendations-slider--spec ds2-na-recommendations-slider--price" data-slide-tpl="price">';

                        if(data.priceLine) {
                            slide += '<span class="ds2-na-recommendations-slider--price-content">' + labels.price + ': ' + formatPrice(data.priceLine) + '</span>';
                        }
                        //only show icon if one of the shown disclaimers has content or pricelist is available
                        if(data.marketSpecificDisclaimer2 || data.priceSummary.totalTaxes || data.priceSummary.optionsPrice.netPrice) {
                            slide += '<span onclick="$(window).trigger(\'ds2-tooltip-icon-need-analyzer\', event)" class="ds2-info-icon ds2-tooltip ds2-na-recommendations-slider--tooltip ds2-need-analyzer--icon-info ds2-icon--need_analyzer_result_info" data-tooltip-id="tooltip-needanalyzer-priceinfo-'+ data.configID +'" data-tooltip-type="" data-open-onclick="true"></span>';
                        }

                        slide += '</div>';
                    }
                }
                //Consumption Line, Electric Consumption Line, Capacity Line
                if (isVisibleLine('consumptionLine') || isVisibleLine('electricConsumptionLine') || isVisibleLine('co2EmissionLine') || isVisibleLine('capacityLine') || isVisibleLine('energyLabel')) {
                    slide += '<div class="ds2-na-recommendations-slider--consumption-wrapper">';

                    if(isVisibleLine('consumptionLine') && data.consumptionLine) {
                        slide += '<span class="ds2-na-recommendations-slider--spec" data-slide-tpl="consumption">'+ labels.consumption + ': ' + data.consumptionLine + ' ' + labels.consumptionUnit +'</span>';
                    }

                    if(isVisibleLine('electricConsumptionLine') && data.electricConsumptionLine) {
                        slide += '<span class="ds2-na-recommendations-slider--spec" data-slide-tpl="electricConsumption">'+ labels.elConsumption + ': ' + data.electricConsumptionLine + ' ' + labels.elConsumptionUnit +'</span>';
                    }

                    if(isVisibleLine('co2EmissionLine') || isVisibleLine('energyLabel')) {

                        slide +=  '<div class="ds2-na-recommendations-slider--spec ds2-na-recommendations-slider--co2Emission" data-slide-tpl="co2Emission">';

                        if(isVisibleLine('co2EmissionLine') && data.co2EmissionLine) {
                            slide += '<span class="ds2-na-recommendations-slider--co2Emission-content">' + labels.co2Emission + ': ' + data.co2EmissionLine + ' ' + labels.co2EmissionUnit + '</span>';
                        }

                        if(isVisibleLine('energyLabel') && data.energyLabel) {
                            slide += this.efficiencyIconTemplate(data.energyLabel, data.configID);
                        }

                        slide += '</div>';
                    }

                    if(isVisibleLine('capacityLine') && data.capacity) {
                        slide += '<span class="ds2-na-recommendations-slider--spec" data-slide-tpl="msv2">'+ labels.capacity + ': ' + data.capacity + ' ' + labels.capacityUnit +'</span>';
                    }

                    slide += '</div>';
                }

                //Market Specific Values
                if (isVisibleLine('marketSpecificValue1') || isVisibleLine('marketSpecificValue2')) {
                    slide += '<div class="ds2-na-recommendations-slider--marketspecific-wrapper">';

                    if(isVisibleLine('marketSpecificValue1')) {
                        slide += '<span class="ds2-na-recommendations-slider--spec">' + getMarketSpecifcSpecs('marketSpecificValue1', data)+ '</span>';
                    }
                    if(isVisibleLine('marketSpecificValue2') && NAConfig.naAppOptions.marketSpecificValue1 !== NAConfig.naAppOptions.marketSpecificValue2) {
                        slide += '<span class="ds2-na-recommendations-slider--spec">' + getMarketSpecifcSpecs('marketSpecificValue2', data)+ '</span>';
                    }

                    slide += '</div>';
                }

                slide += '</div>';

                if(data.cosyLarge || data.seriesNumber) {
                    slide += '<div class="ds2-na-recommendations-slider--car-image-wrapper">';

                    if(data.cosyLarge) {
                        slide += '<img class="ds2-na-recommendations-slider--car-image"'+ 'src="'+ data.cosyLarge +'"'+'/>';
                    }
                    if(data.seriesNumber) {
                        slide += '<span class="ds2-na-recommendations-slider--series-typo" data-slide-tpl="series">'+ data.seriesNumber +'</span>';
                    }

                    if($('.ds2-na-disclaimer').html() || isVisibleLine('detailLayer') || isVisibleLine('showroomLink')) {
                        slide += '<div class="ds2-na-recommendations-slider--bottom-wrapper">';

                        if (isVisibleLine('detailLayer') || isVisibleLine('showroomLink')) {
                            slide += '<div class="ds2-need-analyzer--detail-layer-link">';

                            if(isVisibleLine('detailLayer')) {
                                slide += '<a class="ds2-link ds2-icon ds2-icon--arrow-big-r-white ds2-need-analyzer--info-text" ' +
                                    'data-reveal-id="ds2-na-result-detail-layer">View your configuration in detail</a>';
                            }

                            if (isVisibleLine('showroomLink') && data.modelRange && NAConfig.showroomLinks[data.modelRange] && data.marketingModelRange && labels.showroomLink) {
                                slide += '<a class="ds2-link ds2-icon ds2-icon--arrow-big-r-white ds2-need-analyzer--info-text" ' +
                                    // data.marketingModelRange was removed from link label
                                    // @TODO: check if editor should have the choice to display model name here with a placeholder in labeltext
                                    'href="' + NAConfig.showroomLinks[data.modelRange] + '">' + labels.showroomLink + '</a>';
                            }

                            slide += '</div>';
                        }

                        if ($('.ds2-na-disclaimer').html()) {
                            slide += '<div class="ds2-disclaimer ds2-disclaimer--asterix ds2-na-recommendations-slider--disclaimer-wrapper">' +
                                '<ul>';

                            //if(vspd !== '0') {
                            //    slide += '<li class="ds2-na-recommendations-slider--disclaimer ds2-disclaimer--list-item" data-slide-tpl="vehicleSpecificPageDisclaimer">'+
                            //        vspd +
                            //        '</li>';
                            //}

                            slide += '<li class="ds2-na-recommendations-slider--disclaimer ds2-disclaimer--list-item ds2-na--generic-disclaimer" data-slide-tpl="genericDisclaimer"></li>' +
                                '</ul>' +
                                '</div>';
                        }
                        slide += '</div>';
                    }
                    slide += '</div>';
                }
                slide += '</div>';

                return slide;
            },

            efficiencyIconTemplate: function(label, configID){
                var energyLabel = this._createElement("span", {
                    "class": "ds2-icon--efficency-" + getELabel(label)
                });
                switch(NAConfig.naAppOptions.energyLabelType) {
                    case "small":
                        energyLabel.addClass(' ds2-icon-eventless--efficency');
                        break;
                    case "smallClickable":
                        energyLabel.addClass(
                            ' ds2-icon--efficency' +
                            ' ds2-tooltip' +
                            ' ds2-na-recommendations-slider--tooltip' +
                            ' ds2-tooltip--alpha'
                        );
                        energyLabel.attr({
                            "data-tooltip-id": "tooltip-needanalyzer-efficencyinfo-"+ configID,
                            "data-tooltip-type": "",
                            "data-open-onclick": "true"
                        });
                        break;
                    case "smallAutoshown5sec":
                        energyLabel.addClass(
                            ' ds2-icon--efficency' +
                            ' ds2-icon--smallAutoshown5sec' +
                            ' ds2-tooltip' +
                            ' ds2-na-recommendations-slider--tooltip' +
                            ' ds2-tooltip--alpha'
                        );
                        energyLabel.attr({
                            "data-tooltip-id": "tooltip-needanalyzer-efficencyinfo-"+ configID,
                            "data-tooltip-type": "",
                            "data-open-onclick": "true"
                        });
                        break;
                    default:
                        break;
                }

                return energyLabel[0].outerHTML;
            },

            //TODO:
            //landing page adjustments
            //edge case testing
            tooltipTemplate: function(data, headline, priceInfo) {
                var mspd1bmw = insertLineBreaks(data.marketSpecificDisclaimer1Bmw);
                var mspd1bmwi = insertLineBreaks(data.marketSpecificDisclaimer1Bmwi);
                //var mspd2 = insertLineBreaks(data.marketSpecificDisclaimer2);

                var tooltipEl = document.createElement('div');
                tooltipEl.className = 'ds2-tooltip-element';

                var tooltipElHead = '<div class="ds2-tooltip-element--close">'+
                    '<a class="ds2-tooltip-element--close-link">'+
                    '<span class="ds2-icon ds2-icon--close-white  ds2-icon--bg "></span>'+
                    '</a>'+
                    '</div>'+
                    '<div class="ds2-tooltip-element--body">';
                var tooltipElBody = '';

                //distinction between tooltip overlays
                if(priceInfo) {
                    tooltipEl.dataset.id = 'tooltip-needanalyzer-priceinfo-'+ data.configID;
                    tooltipElBody = this.createPriceTooltipBody(data);
                }
                else {
                    tooltipEl.dataset.id  = 'tooltip-needanalyzer-'+ data.configID;

                    if(headline) {
                        tooltipElBody += '<h1 class="ds2-na-recommendations--tooltip-headline ds2-font-l-na-custom">'+ headline +'</h1>';
                    }
                    if(data.marketingModelRange) {
                        tooltipElBody += '<h5>'+ data.marketingModelRange +'</h5>';
                    }
                    if(data.energyLabel) {
                        tooltipEl.dataset.id  = 'tooltip-needanalyzer-efficencyinfo-'+ data.configID;
                        tooltipElBody += '<img src="/content/dam/bmw/common/images/needanalyzer/BMW_image_large_'+ getELabel(data.energyLabel) +'.png">';
                    }
                    if(data.marketSpecificDisclaimer1Bmw) {
                        tooltipElBody += '<div class="ds2-cms-output">'+ mspd1bmw +'</div>';
                    }
                    if(data.marketSpecificDisclaimer1Bmwi) {
                        tooltipElBody += '<div class="ds2-cms-output">'+ mspd1bmwi +'</div>';
                    }
                }

                var tooltipElFooter = '</div>';

                tooltipEl.innerHTML = tooltipElHead + tooltipElBody + tooltipElFooter;

                return tooltipEl;
            },

            createPriceTooltipSpan: function(content, highlight, alignRight) {
                var span = this._createElement("td", {
                    "class": "ds2-cms-output"
                }).html(content);

                var styles = {
                    width: '70%',
                    textAlign: alignRight ? 'right' : 'left',
                    padding: '5px 0',
                    color: '#666'
                };

                if (highlight) {
                    styles.color = '#262626';
                    styles.fontWeight = 'bold';
                }

                span.css(styles);

                return span;
            },

            createPriceTooltipBodyRow: function(data, key, highlight) {
                var labels = getAdditionalDataLabels();
                var label = labels[key];
                var value = data[key];

                if (key === 'netPrice'){
                    value = data.modelPrice.netPrice;
                }
                if (key === 'optionsPrice'){
                    value = data.optionsPrice.netPrice;
                }

                if (key === 'totalTaxes'){
                    var taxRows = [];
                    for (var i = 0; i < data.taxes.length; i++) {
                        if (data.taxes[i]) {
                            var tax = data.taxes[i];
                            var taxRow = this._createElement("tr", {
                                "class": "ds2-price-layer--row ds2-price-layer--taxes",
                                "style": "border-bottom: transparent;"
                            });
                            if (typeof tax.taxKey !== 'undefined' && typeof tax.taxValue !== 'undefined') {
                                taxRow.append(this.createPriceTooltipSpan(findTaxLabel(tax.taxKey), false));
                                taxRow.append(this.createPriceTooltipSpan(formatPrice(tax.taxValue), false, true));
                                taxRows.push(taxRow);
                            }
                        }
                    }
                    if (data.taxes.length >= 1){
                        return taxRows;
                    }
                }

                if (!label) {
                    return null;
                }

                var priceSummaryRow = this._createElement("tr", {
                    "class": "ds2-price-layer--row",
                    "style": "border-bottom: transparent;"
                });

                var formattedValue = formatPrice(value);

                priceSummaryRow.append(this.createPriceTooltipSpan(label, highlight));
                priceSummaryRow.append(this.createPriceTooltipSpan(formattedValue, highlight, true));

                return priceSummaryRow;
            },

            createPriceTooltipBodyRows: function(priceSummary, keys, container) {
                for (var i = 0; i < keys.length; i++) {

                    var key = keys[i];
                    var row = this.createPriceTooltipBodyRow(priceSummary, key, key === 'grossPrice');

                    if (!row) {
                        continue;
                    }

                    container.append(row);
                }
            },

            createPriceTooltipBody: function(data) {
                var vehicleDisclaimer = insertLineBreaks(data.vehicleSpecificPriceDisclaimer);
                var marketDisclaimer = insertLineBreaks(data.marketSpecificDisclaimer2);
                var body = '';

                if(data.marketingModelRange) {
                    body += '<h5>'+ data.marketingModelRange +'</h5>';
                }

                if (data.priceSummary) {
                    var priceSummaryContainer = this._createElement("table", {
                        "class": "ds2-price-layer--content"
                    });

                    var keys = [
                        "netPrice",
                        "optionsPrice",
                        "totalTaxes",
                        "grossPrice"
                    ];

                    this.createPriceTooltipBodyRows(data.priceSummary, keys, priceSummaryContainer);

                    body += priceSummaryContainer[0].outerHTML;
                }

                if(vehicleDisclaimer) {
                    body += '<p class="ds2-cms-output" style="color: #262626">'+ vehicleDisclaimer +'</p>';
                }
                if(marketDisclaimer) {
                    body += '<p class="ds2-cms-output" style="color: #262626">'+ marketDisclaimer +'</p>';
                }

                return body;
            },

            _createElement: function(tagName, attributes) {
                var el = $(document.createElement(tagName));
                if (attributes) {
                    el.attr(attributes);
                }
                return el;
            },

            modalTemplate: function(carData) {
                var $layer = $('#ds2-na-result-detail-layer'),
                    vehicleName = carData.marketingModelRange || 'no vehicle name available',
                    vehicleImage = carData.cosyLarge || '';

                $('.ds2-need-analyzer-support-layer--headline', $layer).text(vehicleName);
                $('.ds2-need-analyzer-priceLine strong', $layer).text(formatPrice(carData.priceLine));
                $('.ds2-need-analyzer-vehicle-pic', $layer).attr({
                    alt: vehicleName,
                    src: vehicleImage
                });

                this._getAccordionElementTemplate(carData);
            },

            _getAccordionListItemElementTemplate: function(title) {
                var li = this._createElement("li", {
                    "class": "ds2-accordion--list-item ds2-tracking-js--accordion-expand ds2-accordion--head",
                    "style": "border: 0;"//TODO move to css
                });
                var heading = this._createElement("h3", {
                    "class": "ds2-accordion--title ds2-tracking-js--accordion-expand",
                    "style": "text-transform:none;border-bottom: 1px solid #e6e6e6;padding: 10px 0 5px 0;"//TODO move to css
                });
                heading.html(title || "");
                li.prepend(heading);

                return li;
            },

            _getAccordionElementTemplate: function(carData) {
                //TODO optimize detailsData and get it from other function
                //TODO add more objects based on missing labels/details
                var labels = getAdditionalDataLabels();

                var detailsData = {
                    model: [{
                        label: labels.horsePower,
                        value: carData.horsePower ? (carData.horsePower + ' ' + labels.horsePowerUnit) : null
                    }, {
                        label: labels.capacity,
                        value: carData.capacity ? (carData.capacity + ' ' + labels.capacityUnit) : null
                    }, {
                        label: labels.fuelType,
                        value: carData.fuelType || null
                    }, {
                        label: labels.transmission,
                        value: carData.transmission || null
                    }, {
                        label: labels.consumption,
                        value: carData.consumptionLine ? (carData.consumptionLine + ' ' + labels.consumptionUnit) : null
                    }, {
                        label: labels.electricalRange,
                        value: carData.electricalRange ? (carData.electricalRange + ' ' + labels.electricalRan) : null
                    }, {
                        label: labels.elConsumption,
                        value: carData.electricConsumptionLine ? (carData.electricConsumptionLine + ' ' + labels.elConsumptionUnit) : null
                    }, {
                        label: labels.co2Emission,
                        value: carData.co2EmissionLine ? (carData.co2EmissionLine + ' ' + labels.co2EmissionUnit) : null
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
                            label: labels.grossPrice,
                            value: carData.priceSummary.grossPrice || null
                        }, {
                            label: labels.grossDiscount,
                            value: carData.priceSummary.grossDiscount || null
                        }, {
                            label: labels.grossDiscountPercent,
                            value: carData.priceSummary.grossDiscountPercent || null
                        }, {
                            label: labels.netPrice,
                            value: carData.priceSummary.netPrice || null
                        }, {
                            label: labels.netDiscount,
                            value: carData.priceSummary.netDiscount || null
                        }, {
                            label: labels.netDiscountPercent,
                            value: carData.priceSummary.netDiscountPercent || null
                        }, {
                            label: labels.totalTaxes,
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
                        if (detailsData.priceSummary[p].key && detailsData.priceSummary[p].key === "taxes") {
                            //Taxes value should be an array
                            if (pValue && pValue.length > 0) {
                                for (var t in pValue) {
                                    var tax = pValue[t];
                                    if (typeof tax.taxKey !== 'undefined') {
                                        tax.name = findTaxLabel(tax.taxKey);
                                        //if(tax.taxPercentage !== null){
                                        //    tax.name += ' (' + tax.taxPercentage + '%)';
                                        //}
                                        $priceSummaryLabelsContainer.append(this._createElement("div").html(tax.name));
                                        if (typeof tax.taxValue !== 'undefined') {
                                            $priceSummaryValuesContainer.append(this._createElement("div").html(formatPrice(tax.taxValue)));
                                        }
                                    }
                                }
                            }
                        }
                        else if (pValue) {
                            $priceSummaryLabelsContainer.append(this._createElement("div").html(pLabel));
                            $priceSummaryValuesContainer.append(this._createElement("div").html(formatPrice(pValue)));
                        }
                    }
                    $priceSummaryAccordionContent.append($priceSummaryLabelsContainer);
                    $priceSummaryAccordionContent.append($priceSummaryValuesContainer);
                    $priceSummaryAccordionLI.append($priceSummaryAccordionContent);
                }

                // @ TODO: diabled because of empty priceSummary in NL -> reenable with detail layer and check again
                /*$('.ds2-need-analyzer-detail-info-list').empty().append(
                    $modelAccordionLI[0].outerHTML,
                    $priceSummaryAccordionLI[0].outerHTML
                );*/
            }
        };
    });
