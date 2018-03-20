define('ds2-need-analyzer-input-processor-rangeslider-extended',
    [
        'use!jquery',
        'ds2-na-config',
        'use!accounting'
    ], function ($, NAConfig, Accounting) {
        'use strict';

        function NARangeSlider() {
            this.options = {};
            this.q5 = {
                $element: $('.ds2-need-analyzer--step-question-5')
            };
            this.setCurrency();
        }

        NARangeSlider.prototype.initRange = function(data){
            var self = this,
                q5 = this.q5,
                step = 0,
                min = 0,
                max = 0;

            if(q5.$element.length) {
                // search for q5 elements and put them in q5.$element context
                q5.$output = $('.ds2-na-input--rangeslider-numberoutput', q5.$element);
                q5.$input = $('.ds2-na-input--rangeslider-numberinput', q5.$element);
                q5.$track = $('.ds2-na-input--rangeslider-custom-trackelement', q5.$element);
                q5.$rangeSlider = $('.ds2-na-input--rangeslider-range', q5.$element);
                q5.$minOutput = $('.ds2-na-input--rangeslider-min', q5.$element);
                q5.$maxOutput = $('.ds2-na-input--rangeslider-max', q5.$element);
                q5.$reset = $('.ds2-na-input--rangeslider-reset', q5.$element);
                step = parseInt(q5.$rangeSlider.attr('step'));

                this.fixScrollToInputOnAndroid();


                /**
                 * set up / calc (min/max/steps) / print out and save
                 */

                // use default value of 1000 if step was empty or zero
                if (step === 0) {
                    step = 1000;
                }

                // get min and max values from input data
                for (var i = 0, price = 0;  i < data.length; ++i) {
                    price = parseInt(data[i].priceLine);
                    min = price < min || min === 0 ? price : min;
                    max = price > max ? price : max;
                }

                // round min and max values based on steps
                min = (Math.floor(min / step)) * step;
                max = (Math.ceil(max / step)) * step;

                // give min/max and step values to rangeslider inputs
                q5.$rangeSlider.attr('min', min).attr('max', max).attr('step', step);
                q5.$input.attr('min', min).attr('max', max).attr('step', step);

                // print out min and max values under rangeslider in correct currency
                q5.$minOutput.text(this.getCurrency(parseInt(min) + parseInt(step), true));
                q5.$maxOutput.text(this.getCurrency(max, true));

                // use before and after for displaying currency instead of currency formater function to improve performance while typeinputs
                q5.$output.attr('data-before', self.options.pricebefore).attr('data-after', self.options.priceafter);

                // save min/max and step values for later
                q5.valueMin = min;
                q5.valueMax = max;
                q5.valueStep = step;


                /**
                 * reset button
                 */

                // reset button sets value back and use change to check and validate inputs
                q5.$reset.on('click', function (e) {
                    e.preventDefault();
                    q5.$element.addClass('reset');
                    // v1 for IE and edge
                    if ($('.ds2-need-analyzer-extended').hasClass('ds2-need-analyzer-IE')) {
                        q5.$rangeSlider.val(min);
                        setTimeout(function () {
                            q5.$element.removeClass('reset');
                            q5.$rangeSlider.change();
                        }, 500);
                    }
                    // v2 for modern browsers
                    else {
                        q5.$rangeSlider.animate({value: min}, 500, function () {
                            q5.$element.removeClass('reset');
                            q5.$rangeSlider.change();
                        });
                    }

                    self.setCustomTrack(5, min);
                    q5.$element.toggleClass("ds2-need-analyzer--step-completed", false);

                });


                /**
                 * output currency and custom track while dragging range slider
                 * on input is more exact while dragging the slider thumb but also more heavy on performance side @TODO check for issues
                 */

                q5.$rangeSlider.on('input', function() {
                    self.setOutputFromRangeInput(5);
                });


                /**
                 * addtional input method via input field type number
                 */

                // soft update form while typing
                q5.$input.on('input', function () {
                    self.setOutputFromNumberInput(5, false);
                });
                // hard update form after typing (enter / removing focus)
                q5.$input.on('change, focusout', function () {
                    self.setOutputFromNumberInput(5, true);
                    q5.$output.removeClass('ds2-na-input--rangeslider-fakecaret');
                });
                // clear input on focus so the user can input a fresh number
                q5.$input.on('focus', function (e) {
                    q5.valueTemp = $(e.target).val();
                    q5.$input.val('');
                    self.setOutputFromNumberInput(5, false, '');
                    q5.$output.addClass('ds2-na-input--rangeslider-fakecaret');
                });
                // keep caret and the end - prevent userinput in the middle of inputfield by clicking
                q5.$input.on('click, touchend', function (e) {
                    q5.valueTemp = q5.$input.val();
                    q5.$input.val('').val(q5.valueTemp);
                });
                // prevent additional userinputs from keyboard
                q5.$input.bind('keydown', function (e) {
                    // prevent: "<-", "->" // keep caret and the end
                    if ([37, 39].includes(e.keyCode)) {
                        e.preventDefault();
                    }
                    // prevent: "e", "=", ",", "-", "." // keep input numeric only
                    else if ([69, 187, 188, 189, 190].includes(e.keyCode)) {
                        e.preventDefault();
                    }
                });
            }
        };

        NARangeSlider.prototype.setCurrency = function(){
            var symbol = NAConfig.currency.symbol,
                precision = 0,
                thousand = NAConfig.currency.separator,
                format = NAConfig.currency.format,
                split = format.split('%v'),
                pattern = NAConfig.currency.pattern,
                before = split[0].replace('%s', symbol),
                after = split[1].replace('%s', symbol),
                override = false;

            // only if custom currency pattern split the pattern to get needed infos
            // in question 5 case we ignore decimals in contrast to result page template
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
                    after = after[after.length-1];
                    format = before + '%v' + after;
                }
            }

            // save everything in options for calling getCurrency later
            this.options.symbol = symbol;
            this.options.precision = precision;
            this.options.thousand = thousand;
            this.options.format = format;
            this.options.pricebefore = before !== '' ? before : ' ';
            this.options.priceafter = after !== '' ? after : ' ';
        };

        NARangeSlider.prototype.getCurrency = function(price, displayCurrency){
            return Accounting.formatMoney(price, {
                symbol : this.options.symbol,
                precision : this.options.precision,
                thousand : this.options.thousand,
                format : displayCurrency ? this.options.format : '%v'
            });
        };

        NARangeSlider.prototype.setCustomTrack = function(question, value){
            var input = value ? value : $('.ds2-need-analyzer--step-question-'+question).find('input[type=range]:first').val();

            if (question === 5 && this.q5.$track) {
                // move custom track to range percentage
                this.q5.$track.css({transform: 'translateX('+ (input - this.q5.valueMin) / (this.q5.valueMax - this.q5.valueMin) * 100 + '%)'});
            }
        };

        NARangeSlider.prototype.fixScrollToInputOnAndroid = function(){
            // https://stackoverflow.com/a/37885237
            if(/Android [4-6]/.test(navigator.appVersion)) {
                window.addEventListener("resize", function () {
                    if (document.activeElement.tagName === "INPUT" || document.activeElement.tagName === "TEXTAREA") {
                        window.setTimeout(function () {
                            document.activeElement.scrollIntoViewIfNeeded();
                        }, 50);
                    }
                })
            }
        };

        NARangeSlider.prototype.setOutputFromRangeInput = function(question, value){
            var input = value ? value : $('.ds2-need-analyzer--step-question-'+question).find('input[type=range]:first').val();

            if (question === 5 && this.q5.$output && this.q5.$input) {
                // use range input for currency output, number input helper and custom track
                this.q5.$output.text(this.getCurrency(input), false);
                this.q5.$input.val(input);
                this.setCustomTrack(question, input);
            }
        };

        NARangeSlider.prototype.setOutputFromNumberInput = function(question, change, value){
            var input = value ? value : $('.ds2-need-analyzer--step-question-'+question).find('input[type=number]:first').val(),
                output = '&nbsp;',
                min = this.q5.valueMin,
                max = this.q5.valueMax,
                step = this.q5.valueStep;

            if (question === 5 && this.q5.$output && this.q5.$rangeSlider) {

                /** input restrictions */
                // forbid starting 0 input and inputs longer than max value
                if((input === '0') || (input.length > max.toString().length)){
                    // remove last character if rule matches
                    input = input.substring(0, input.length - 1);
                    this.q5.$input.val(input);
                }

                /** prepare input for output field */
                // use maxvalue for output if input is higher than range
                if(input > max){
                    input = max;
                }
                // format price if not empty
                if(input !== '') {
                    output = this.getCurrency(input, false);
                }

                /** write into output field */
                // if no input was made and saved saved tempvalue before input is used for output
                if(input === '' && change === true) {
                    this.q5.$output.html(this.q5.valueTemp);
                }
                // use calculated output while typing or on change if not empty
                else {
                    this.q5.$output.html(output);
                }

                /** set up / calculate (min/max/steps) / print out and save */
                // use minimal value for output in range slider if user input from type number is not in range
                if(input < min + step && input !== '') {
                    input = min + step;
                }
                // change value in from number inout in range slider input
                if(input !== ''){
                    this.q5.$rangeSlider.val(input);
                }
                // if change triggered from text input number trigger change in range slider (set the final value)
                if(change === true) {
                    this.q5.$rangeSlider.change();
                }
                // if no change but still input from number update custom track instead
                else if(input !== '') {
                    this.setCustomTrack(question);
                }
            }
        };


        return NARangeSlider;
    });
