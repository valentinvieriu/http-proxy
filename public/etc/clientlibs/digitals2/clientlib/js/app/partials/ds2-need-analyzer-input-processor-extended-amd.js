define('ds2-need-analyzer-input-processor-extended',
    [
        'use!jquery',
        'use!log',
        'ds2-na-dispatcher',
        'ds2-need-analyzer-result-page-templates-extended',
        'ds2-need-analyzer-algorithm-extended',
        'ds2-need-analyzer-input-processor-rangeslider-extended',
        'ds2-na-config'
    ], function ($, log, dispatcher, templates, NAAlgorithm, NARangeSlider, NAOptions) {     //TODO rewrite to a singleton
        'use strict';

        var isFallback = false,
            budgetSet = false,
            noCarWithinBudget = false,
            questionInputs = [],
            cars = [],
            slides = [],
            user = {},
            resultSlidesCount = 3,
            rangeSlider = new NARangeSlider(),
            settings = {
                questionFourMaxSelections: 4
            };

        var validateQuestion = (function () {
            var state = {
                "4": []
            };

            return {

                "1": function (inputs) {
                    var c = false;
                    var d = false;
                    var res = '';
                    var wildcard;

                    for (var i = 0; i < inputs.selections.length; ++i) {
                        if (inputs.selections[i].checked) {
                            c = true;
                            user[$(inputs.selections[i]).attr('data-question-key')] = '1';
                        }
                        else {
                            user[$(inputs.selections[i]).attr('data-question-key')] = '0';
                        }
                    }
                    if (inputs.wildcards.length > 0) {
                        wildcard = inputs.wildcards[0].checked ? '1' : '0';

                        if (inputs.wildcards[0].checked) {
                            d = true;
                        }

                        user[$(inputs.wildcards[0]).attr('data-question-key')] = wildcard;
                    }

                    calcDrivingEnv(user);
                    return inputs.completed = (c || d);
                },

                "2": function (inputs) {
                    var c = false;
                    var d = false;
                    var res = 0;
                    var wildcard = {};
                    var i;

                    for (i = 0; i < inputs.selections.length; ++i) {
                        if (inputs.selections[i].checked) {
                            c = true;
                            res = $(inputs.selections[i]).val();
                        }
                    }

                    for (i = 0; i < inputs.wildcards.length; ++i) {
                        wildcard[$(inputs.wildcards[i]).attr('data-question-key')] = inputs.wildcards[i].checked ? 1 : 0;
                        if (inputs.wildcards[i].checked) {
                            d = true;
                        }
                    }

                    setPassengers(parseInt(res), wildcard, user);

                    return inputs.completed = (c || d);
                },

                "3": function (inputs) {
                    var c = false;
                    var d = false;
                    var res = 0;
                    var wildcard = {};
                    var i;

                    for (i = 0; i < inputs.selections.length; ++i) {
                        if (inputs.selections[i].checked) {
                            c = true;
                            res = $(inputs.selections[i]).val();
                        }
                    }

                    for (i = 0; i < inputs.wildcards.length; ++i) {
                        wildcard[$(inputs.wildcards[i]).attr('data-question-key')] = inputs.wildcards[i].checked ? 1 : 0;
                        if (inputs.wildcards[i].checked) {
                            d = true;
                        }
                    }

                    setLuggage(parseInt(res), wildcard, user);

                    return inputs.completed = (c || d);
                },

                "4": function (inputs) {
                    //up to 4 selection checkboxes selected, then ring-queue behaviour
                    var i;
                    var res = {};
                    var check = false;
                    var idx;
                    var key;
                    for (i = 0; i < inputs.selections.length; ++i) {

                        check = inputs.selections[i].checked;

                        idx = state[4].indexOf(i);
                        if (check) {
                            if (idx < 0) {
                                if (state[4].length < settings.questionFourMaxSelections) {
                                    state[4].push(i);
                                }
                                else {
                                    $(inputs.selections[state[4].pop()]).prop('checked', false);
                                    state[4].push(i);
                                }
                            }
                        }
                        else {
                            if (idx > -1) {
                                state[4].splice(idx, 1);
                            }
                        }
                    }

                    for (i = 0; i < inputs.selections.length; ++i) {
                        key = $(inputs.selections[i]).attr('data-question-key');
                        user.vector[key] = $(inputs.selections[i]).prop('checked') === true ? 1.5 : 0.5;
                    }

                    return inputs.completed = state[4].length >= 1;
                },

                "5": function (inputs) {
                    var $step = $('.ds2-need-analyzer--step-question-5'),
                        $stepCompleted = $step.hasClass('ds2-need-analyzer--step-completed'),
                        $stepReset = $step.hasClass('reset'),
                        userRange = $('.ds2-na-input--rangeslider-range', $step),
                        userBudget = parseInt(userRange.val()),
                        minBudget = parseInt(userRange.attr('min'));

                    budgetSet = userRange && userBudget > minBudget;

                    if (userRange && userBudget >= minBudget){
                        rangeSlider.setOutputFromRangeInput(5, userBudget);
                    }

                    if (userBudget > minBudget && !$stepCompleted) {
                        $step.addClass("ds2-need-analyzer--step-completed");
                    }
                    else if (userBudget === minBudget && $stepCompleted && !$stepReset){
                        $step.removeClass("ds2-need-analyzer--step-completed");
                    }

                    return inputs.completed = budgetSet;
                }

            };
        })();

        function setLuggage(inputs, wildcard, userData) {

            switch (inputs) {

                case 1: //1-2 bags
                    userData.luggage = 0;
                    break;
                case 3: //+5 bags
                    userData.luggage = 2;
                    break;
                default:
                    userData.luggage = 1;
            }

            userData.vector.luggage = userData.luggage;
            userData.vector.longItems = wildcard.longItems;
            userData.vector.bulkyItems = wildcard.bulkyItems;
            userData.vector.wildcardQ3 = wildcard.dog;
            delete userData.vector.dog;
        }

        /*
         write question 2 user input
         */
        function setPassengers(inputs, wildcard, userData) {

            switch (inputs) {

                case 0: // no answer
                    userData.numberOfSeats = 1;
                    break;
                case 1: // 2 seats
                    userData.numberOfSeats = 0;
                    break;
                case 2: // 4 seats
                    userData.numberOfSeats = 2 / 3;
                    break;
                case 3: // 5 seats
                    userData.numberOfSeats = 4 / 3;
                    break;
                default: // 7 seats
                    userData.numberOfSeats = 2;
            }

            userData.vector.numberOfSeats = userData.numberOfSeats;
            userData.vector.children = wildcard.children;
            userData.vector.baby = wildcard.baby;
            userData.vector.wildcardQ2 = wildcard.wildcardQ2;

        }

        /*
         convert driving environment properties to a direction on the unit circle
         */
        function calcDrivingEnv(obj) {

            var input = obj['city'] + obj['countryRoad'] + obj['motorway'];
            var wildcard = parseInt(obj.wildcardQ1);
            var sqrt3md2 = Math.pow(3, 0.5) / 2;

            switch (input) {
                case '100':
                    obj.vector.drivingEnvX = -0.5;
                    obj.vector.drivingEnvY = sqrt3md2;
                    break;
                case '010':
                    obj.vector.drivingEnvX = -0.5;
                    obj.vector.drivingEnvY = -sqrt3md2;
                    break;
                case '001':
                    obj.vector.drivingEnvX = 1;
                    obj.vector.drivingEnvY = 0;
                    break;
                case '110':
                    obj.vector.drivingEnvX = -1;//-sqrt3md2;
                    obj.vector.drivingEnvY = 0;//-0.5;
                    break;
                case '101':
                    obj.vector.drivingEnvX = 0.5;
                    obj.vector.drivingEnvY = sqrt3md2;
                    break;
                case '011':
                    obj.vector.drivingEnvX = 0.5;//0;
                    obj.vector.drivingEnvY = -sqrt3md2;//-1;
                    break;
                default:
                    obj.vector.drivingEnvX = 0;
                    obj.vector.drivingEnvY = 0;
            }
            obj.vector.wildcardQ1 = wildcard;
        }

        var NAApp = {
            init: function() {
                var cc = window.cookiecontroller,
                    apiUrl = $('#na-data').attr('src');

                function startNeedAnalyzer() {
                    var options = {},
                        author = $('.ds2-need-analyzer-extended').hasClass('ds2-need-analyzer-author');

                    // Collect configuration bits and merge them into a single object.
                    $('.na-app-config').each(function () {
                        $.extend(true, options, JSON.parse($(this).html()));
                    });

                    settings = NAOptions.naAppOptions;
                    log('na-app-options', NAOptions);

                    if (apiUrl === undefined || !apiUrl.length) {
                        dispatcher.post('error', 'No API URL was set in the Author');
                        log('No API URL was set in the Author - The Need Analyzer will not work without it!');
                    } else {
                        getJson();

                        // Make sure the loading animation and the overlay that prevents user input are hidden in author mode.
                        if (author) {
                            enableUserInput();
                        }
                    }
                }

                // Get the car data json file from the AWS server.
                function getJson() {

                    $.when($.get(apiUrl)).then(function(json, textStatus, xhr) {

                        // In case the data loading takes some time and the server returns a 202 status,
                        // (i.e. the json wasn't returned) wait 5 seconds an try again until the server responds with 200.
                        if (xhr.status === 202) {
                            setTimeout(function () {
                                getJson();
                            }, 5000);

                        } else if (json && json.vehicles) {
                            var data = (typeof json === 'string') ? JSON.parse(json) : json;

                            if (data.vehicles.length > 0) {
                                getResultSet(data.vehicles, NAOptions);
                            } else {
                                dispatcher.post('error', 'Error, no json data');
                            }

                            // Hide the overlay that prevents user input and the loading animation.
                            enableUserInput();

                        } else {
                            dispatcher.post('error', 'Error loading data');
                            enableUserInput();
                        }
                    }).fail(function() {
                        dispatcher.post('error', 'Error loading data');
                        enableUserInput();
                    });
                }

                // Hide the overlay that prevents user input and the loading animation.
                function enableUserInput() {
                    $('.ds2-need-analyzer-extended').addClass('ds2-img-loaded');
                    $('.ds2-need-analyzer--main').addClass('ds2-need-analyzer--data-loaded');
                }

                /* cookie consent check and start */
                if (!cc.api.isInitialized()) {
                    cc.api.registerOnInitialized(startNeedAnalyzer);
                } else if (cc.api.isRegulationAccepted()) {
                    startNeedAnalyzer();
                } else {
                    cc.api.registerOnConsentChange(startNeedAnalyzer);
                }
            }
        };

        function getResultSet(vehicleData) {
            var numQuestions = $('.ds2-need-analyzer--list-steps li').length - 1;
            var i;
            var idx;
            var sel;

            rangeSlider.initRange(vehicleData);

            for (i = 0; i < numQuestions; ++i) {
                idx = i + 1;
                questionInputs[i] = {completed: false};

                sel = $('[data-question="' + idx + '"] input');
                sel.on('change', {question: idx}, checkUserInput);
                questionInputs[i].selections = sel;
                questionInputs[i].parentSlide = $(sel).closest('.ds2-need-analyzer--step').attr('data-url');

                sel = $('[data-question-wildcard="' + idx + '"] input');
                sel.on('change', {question: idx}, checkUserInput);
                questionInputs[i].wildcards = sel;

                sel = $('[data-question-range="' + idx + '"] input[type=range]:first');
                sel.on('change', {question: idx}, checkUserInput);
                questionInputs[i].ranges = sel;
                if (sel.length > 0) {
                    questionInputs[i].parentSlide = $(sel).closest('.ds2-need-analyzer--step').attr('data-url');
                }
            }

            initUserData(questionInputs, user);

            for (i = 0; i < vehicleData.length; ++i) {
                cars.push(vehicleData[i]);
                generateCarVector(cars[i], user.vector);
            }

            sel = deserialize();

            if (sel.changed === true) {
                checkUserInput({data: {question: 1}});

                if (sel.fromTeaser === true) {
                    dispatcher.post('go-to-q2');
                }
                else if (sel.fromCookie === true) {
                    dispatcher.post('go-to-result');
                    $('.ds2-na-recommendations-slider').trigger('tracking:needanalyzer:product:update', {matchType: 'Perfect Match Model'});
                }
            }
            else {
                updateSlider(processResults(fallback(vehicleData)));
            }

            dispatcher.listen('clearUserData', clearUserData);
            //this listener catches after initialisation, if no input notification should be shown or hidden
            dispatcher.listen('checkNoInputNotification', checkNoInputNotification);

            // Recommendations slider is loaded after need analyzer, so we need to inform it somehow about results when
            // recommendations initialized as active view, i.e. after browser refresh
            dispatcher.listen('na-recommendations-slider-initialized', function () {
                if (slides.length > 0) {
                    updateSlider(slides);
                }
            });

            if ($('.ds2-need-analyzer--step-result').hasClass('active')) {
                checkNoInputNotification('checkShow');
            }
        }

        /*
         check if no input notification should be visible or not, triggered by ds2-need-analyzer.js
         */
        function checkNoInputNotification(command) {
            var noInputNotification = $('.ds2-na--no-input-notification-wrapper');
            if (command === 'checkShow' && (isFallback || noCarWithinBudget)) {
                noInputNotification.delay(1250).slideDown(function () {
                    //callback function to make sure
                    dispatcher.post('buttonArea');
                    // Autoshow/hide the enrgy lable layer if 'smallAutoshown5sec' is selected in the AEM dialog of the result page.
                    // See 'dispatcher.listener('autoshowEnergyLayer')' in ds2-need-analyzer-recommendations-slider-extended-amd.js.
                    dispatcher.post('autoshowEnergyLayer');
                });
                //to make sure the Browser
            } else if (command === 'hide') {
                noInputNotification.slideUp(250);
            } else if (!isFallback) {
                // Autoshow/hide the enrgy lable layer if 'smallAutoshown5sec' is selected in the AEM dialog of the result page.
                // Called when the user loads the result page or jumps to it via step navigation (needs to be delayed to take sliding time into account).
                // See 'dispatcher.listener('autoshowEnergyLayer')' in ds2-need-analyzer-recommendations-slider-extended-amd.js.
                setTimeout(function () {
                    dispatcher.post('autoshowEnergyLayer');
                }, 1000);
            }
        }

        function checkUserInput(event){

            var i,
                answerHistory,
                parentStep = $(event.currentTarget).closest('.ds2-need-analyzer--step'),
                parentSlide = parentStep.attr('data-url'),
                c = 0;

            if(!parentStep.hasClass('reset')){

                for (i = 0; i < questionInputs.length; ++i) {
                    validateQuestion[i + 1](questionInputs[i]);

                    if (questionInputs[i].completed === true) {
                        c++;
                    }
                }
                if (c === 0) {
                    dispatcher.post('na-switch-headline', 'No Answers');
                    isFallback = true;
                }
                else if (c <= 2) {
                    dispatcher.post('na-switch-headline', 'Less Answers');
                    isFallback = false;
                }
                else {
                    dispatcher.post('na-switch-headline', 'Perfect Match');
                    isFallback = false;
                }


                /* Answer History for current slide*/
                $(questionInputs).each(function () {
                    if (this.parentSlide === parentSlide) {
                        answerHistory = this;
                    }
                });

                dispatcher.setHistoryObj('question-history', answerHistory);
                /* End answer history */

                //update counter after every recalculation so that counter is always on 1
                dispatcher.post('na-update-counter');

                if ((!budgetSet && c >= 1) || (budgetSet && c > 1)) {
                    for (i = 0; i < questionInputs.length; i++) {
                        if (questionInputs[i].completed) {
                            updateSlider(processResults(NAAlgorithm.calculate(cars, user.vector, {
                                resultSlidesCount: resultSlidesCount
                            })));
                        }
                    }
                } else if (budgetSet && c === 1) {
                    updateSlider(processResults(cars, true));
                } else {
                    updateSlider(processResults(fallback(cars)));
                }

                serialize();
            }
        }

        function normalizeDrvEnv(car) {

            var drvenv = car.drivingEnvironment.length ? car.drivingEnvironment : 'City'; //TODO a default should be provided by BE
            car['city'] = /City/.test(drvenv) ? '1' : '0';
            car['motorway'] = /Motorway/.test(drvenv) ? '1' : '0';
            car['countryRoad'] = /Country/.test(drvenv) ? '1' : '0';
            return car;
        }

        /* create and populate the car vector from json data */
        function generateCarVector(carData, vec) {
            carData.vector = {};
            for (var p in vec) {
                carData.vector[p] = vec.p;
                carData.vector[p] = 0.0;
            }
            normalizeDrvEnv(carData);
            calcDrivingEnv(carData);

            //passengers
            carData.vector['numberOfSeats'] = parseFloat(carData['numberOfSeats']);
            carData.vector['baby'] = parseFloat(carData['baby']);
            carData.vector['children'] = parseFloat(carData['children']);
            //luggage
            carData.vector['luggage'] = parseFloat(carData['luggage']);
            carData.vector['bulkyItems'] = parseFloat(carData['bulkyItems']);
            carData.vector['longItems'] = parseFloat(carData['longItems']);
            //values
            carData.vector['practicality'] = parseFloat(carData['practicality']);
            carData.vector['elegance'] = parseFloat(carData['elegance']);
            carData.vector['luxury'] = parseFloat(carData['luxury']);
            carData.vector['sportiness'] = parseFloat(carData['sportiness']);
            carData.vector['uniqueness'] = parseFloat(carData['uniqueness']);
            carData.vector['efficiency'] = parseFloat(carData['efficiency']);
            carData.vector['space'] = parseFloat(carData['space']);
            carData.vector['highPerformance'] = parseFloat(carData['highPerformance']);
            //wildcards
            carData.vector['wildcardQ1'] = parseFloat(carData['wildcardQ1']) || 0;
            carData.vector['wildcardQ2'] = parseFloat(carData['wildcardQ2']) || 0;
            carData.vector['wildcardQ3'] = parseFloat(carData['wildcardQ3']) || 0;
        }

        /*
         write current input to cookie
         */
        function serialize() {

            var userData = {};
            $('.ds2-need-analyzer--input input').each(function () {
                if (
                    ($(this).attr('type') === 'radio' && $(this).prop('checked') === true) ||
                    ($(this).attr('type') === 'range')
                ) {
                    userData[$(this).attr('data-question-key')] = $(this).val();
                } else if ($(this).attr('type') === 'checkbox') {
                    userData[$(this).attr('data-question-key')] = $(this).prop('checked');
                }
            });

            if (window.cookiecontroller.api.isCookieAllowed('cc_na_application')) {
                window.cookiecontroller.api.setCookie('cc_na_application', JSON.stringify(userData));
            }
        }

        function initUserData(inputs, user) { //TODO combine with validation, perhaps?

            var i;
            var question;
            var key;

            user.vector = {};

            for (var k = 0; k < inputs.length; ++k) {
                question = inputs[k];

                for (i = 0; i < question.selections.length; ++i) {
                    key = $(question.selections[i]).attr('data-question-key');
                    user[key] = 0.0;
                    user.vector[key] = 0.0;
                }
                if (question.wildcards.length) {
                    for (i = 0; i < question.wildcards.length; ++i) {
                        key = $(question.wildcards[i]).attr('data-question-key');
                        user[key] = 0.0;
                        user.vector[key] = 0.0;
                    }
                }
            }
            /* those properties are not needed anymore and are removed */
            delete user.vector['city'];
            delete user.vector['countryRoad'];
            delete user.vector['motorway'];
        }

        /*
         clear cookie and reset all inputs
         */
        function clearUserData() {
            //delete cookie
            window.cookiecontroller.api.deleteCookie('cc_na_application');
            //empty input fields
            $('.ds2-need-analyzer--input input').each(function () {
                if ($(this).attr('type') === 'radio' || $(this).attr('type') === 'checkbox') {
                    $(this).prop('checked', false);
                }
                else if ($(this).attr('type') === 'range') {
                    $(this).val('0').change();
                }
            });
            // empty cutom styling of range slider tracks
            $('.ds2-na-input--rangeslider-custom-trackelement').each(function () {
                $(this).attr('style', '');
            });
            //timeout used to avoid showing the user that data reset before slidden over to first step, since animation time is 750ms, set to slightly bigger value
            setTimeout(function () {
                //update slider with fallback result set
                updateSlider(processResults(fallback(cars)));
                //reset no input notification to no input given
                dispatcher.post('na-switch-headline', 'No Answers');
                isFallback = true;
            }, 800);
        }

        function deserialize(){
            var userData = JSON.parse(window.cookiecontroller.api.getCookie('cc_na_application'));
            var changed = false;
            var fromTeaser = false;
            var fromCookie = false;
            var urlparams;

            if (!userData) {
                userData = {};
            }
            else {
                fromCookie = Object.keys(userData).map(function (key) {
                    return userData[key];
                }).reduce(function (x, y) {
                    return x || y;
                });
            }

            if (/#\/\?/.test(window.location.hash)) {
                urlparams = window.location.hash
                    .replace(/#\/\?/, '')
                    .split('&')
                    .map(function (el) {
                        return el.split('=')[1] === 'true';
                    });

                userData.city = urlparams[0];
                userData.countryRoad = urlparams[1];
                userData.motorway = urlparams[2];
                userData.wildcardQ1 = urlparams[3];

                fromTeaser = true;
            }

            $('.ds2-need-analyzer--input input').each(function () {
                var $elem = $(this),
                    type = $elem.attr('type'),
                    key = $elem.attr('data-question-key');

                if (type === 'radio' && $elem.val() === userData[key]) {
                    $elem.prop('checked', true);
                    changed = true;
                }
                else if (type === 'checkbox') {
                    $elem.prop('checked', userData[key]);
                    changed = true;
                }
                else if (type === 'range' && userData[key] && $elem.attr('min') && parseInt(userData[key]) > parseInt($elem.attr('min'))) {
                    $elem.val(userData[key]).change();
                    fromCookie = true;
                    changed = true;
                }
            });

            return {
                changed: changed,
                fromTeaser: fromTeaser,
                fromCookie: fromCookie
            };
        }

        function updateSlider(slides) {
            dispatcher.post('na-result-update', slides);
        }

        // Function to select fallback cars form the maintenance interface.
        function fallback(cars) {
            var i,
                fallbackCars = [],
                uniqueSeriesNumbers = [];

            // If no car is matching the needs of the user or no selection has been made,
            // display a maximum of 10 fallback cars specified by the editor in the maintenance interface.
            for (i = 0; i < cars.length && fallbackCars.length < 10; i++) {
                if (JSON.parse(cars[i].availableForFallback)) {
                    fallbackCars.push(cars[i]);
                }
            }

            // If no fallback cars have been specified, select a maximum of 10 form the list of cars in the maintenance interface.
            // Only one car per series number is displayed.
            if (fallbackCars.length === 0) {
                for (i = 0; i < cars.length && uniqueSeriesNumbers.length < 10; i++) {
                    if (uniqueSeriesNumbers.indexOf(cars[i].seriesNumber) === -1) {
                        fallbackCars.push(cars[i]);
                        uniqueSeriesNumbers.push(cars[i].seriesNumber);
                    }
                }
            }

            return fallbackCars;
        }

        // Function to include each car to be shown on the result page in a slide Template.
        function processResults(cars, onlyBudgetAnswered) {
            var i,
                car,
                carPrice,
                userBudget,
                filteredCar,
                filteredCars = [],
                budgetOnly = onlyBudgetAnswered === undefined ? false : onlyBudgetAnswered;

            slides = [];

            // Check if question 5 (budget) was answered.
            if (budgetSet) {

                // Loop through all available cars (provided by the microservice).
                for (i = 0; i < cars.length; i++) {
                    car = cars[i];
                    if (car) {
                        carPrice = parseInt(car.priceLine);
                        userBudget = parseInt($('.ds2-need-analyzer--step-question-5').find('input[type=range]:first').val());

                        // Filter the available cars by budget.
                        filteredCar = filterByBudget(car, carPrice, userBudget, budgetOnly);

                        // If the car is within the budget push to new array.
                        if (filteredCar) {
                            filteredCars.push(filteredCar);
                        }
                    }
                }

                // Check if the filteredCars array isn't empty.
                if (filteredCars.length > 0) {

                    // Check if only the budget question was answered.
                    if (budgetOnly) {

                        // Sort filteredCars descending by price.
                        filteredCars.sort(function (a, b) {

                            var priceA = parseInt(a.priceLine),
                                priceB = parseInt(b.priceLine);

                            if (priceB > priceA) {
                                return 1;
                            } else if (priceB < priceA) {
                                return -1;
                            } else {
                                return 0;
                            }
                        });
                    }

                    // Push a fixed number of templates for the cars closest to the budget into the slides array.
                    for (i = 0; i < filteredCars.length && i < resultSlidesCount; i++) {
                        slides.push($(templates.slideTemplate(filteredCars[i])));
                    }
                } else {
                    // Show a message that no car is matching.
                    dispatcher.post('na-switch-headline', 'No Answers');
                }
            }

            // Set noCarWithinBudget to true or false.
            noCarWithinBudget = budgetSet && slides.length === 0;

            // Check if question 5 (budget) was answered but no car is within the budget or if it wasn't answered at all.
            if (noCarWithinBudget || !budgetSet) {
                for (i = 0; i < cars.length; i++) {
                    car = cars[i];
                    if (car) {
                        slides.push($(templates.slideTemplate(car)));
                    }
                }
            }

            return slides;
        }

        // Filter the car by budget (applicable if question 5 was answered).
        function filterByBudget(car, carPrice, budget, budgetOnly) {

            // A buffer of 10% is added to the user budget if the budget question wasn't the only answered question.
            var budgetBuffer = 1.1,
                userBudget = budgetOnly ? budget : (budget * budgetBuffer),
                filteredCar;

            // Check if the car is within the user budget (+10%).
            if (carPrice <= userBudget) {
                filteredCar = car;
            }

            return filteredCar;
        }

        //TODO this takes care of initialization, user input and cookies
        return NAApp;
    });
