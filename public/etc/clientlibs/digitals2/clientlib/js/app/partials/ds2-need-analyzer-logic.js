/**
 * Created by ivan.taranin on 02/08/16.
 * ivan.taranin@infiniteloops.de
 */
define('ds2-needanalyser-logic',['use!jquery',
        'ds2-cookie-controller',
        'ds2-needanalyser-resulttemplate',
        'ds2-na-dispatcher']
    , function ($,cookiecontroller, templates, dispatcher) {
        window.digitals2 = window.digitals2 || {};

        window.digitals2.ds2NeedAnalyzerLogic = (function () {

        var cookiecontroller = window.digitals2.cookieController;
        var templates = window.digitals2.ds2NeedAnalyzerResultTemplates();
        var dispatcher = window.digitals2.ds2NeedAnalyzerDispatcher;
        var questionInputs = []; //shortcut reference
        var cars = [];
        var modelRanges;
        var user = {};
        var resultSlidesCount = 3; //was included in settings before but then overwritten, if every editable, then back into settings and provided by BE the same was as the other values
        //the following settings object contains default data that will be overwritten by BE provided data in settings = options.naAppOptions; (filled by script tags with class na-app-config)
        var settings = {
            fallbackCars: 3,
            questionFourMaxSelections: 4
        };
        //boolean to check if
        var isFallback = false;
        /*
         process and write user inputs
         */
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
            };
        })();

        /*
         write question 3 user input
         */
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

        /* initialize a structure to hold cars by modelrange */
        function setupModelRangeBuckets(cars) {
            var mrset = {};
            for (var i = 0; i < cars.length; ++i) {
                if (!mrset[cars[i].modelRange]) {
                    mrset[cars[i].modelRange] = [];
                }
            }
            return mrset;
        }

        /* sort cars within a modelrange by their score */
        function sortModelRanges() {
            var keys = Object.keys(modelRanges);
            for (var i = 0; i < keys.length; ++i) {
                if (modelRanges[keys[i]].length) {
                    modelRanges[keys[i]].sort(compare).reverse;
                }
            }
        }

        /*
         generate a result set
         */
        function reduceModelRanges(sampleSize) {

            var results = [];
            var keys = Object.keys(modelRanges);

            sortModelRanges();

            for (var i = 0; i < keys.length; ++i) {
                if (modelRanges[keys[i]].length) {
                    results.push(modelRanges[keys[i]][0]);
                }
            }

            results = results.sort(compare);

            log('user vector: ', user.vector);
            for (i = 0; i < results.length; i++) { //TODO remove
                log(results[i].marketingModelRange + " - distance: " + (results[i].distance), 'car vector: ', results[i].vector);
            }
            return results.slice(0, sampleSize);
        }

        /*
         comparator function used to sort cars according to their distance to the user
         */
        function compare(x, y) { //ascending order
            return (x.distance > y.distance) ? 1 : (x.distance < y.distance) ? -1 : 0;
        }


        /*
         euclidean vector distance
         */
        function distance(carv, userv) {

            var result = 0;
            var keys = Object.keys(userv);

            for (var i = 0; i < keys.length; ++i) {
                if (keys[i] !== 'wildcardQ1') {
                    //BMWST-6903: fixing the issue, when the aem editor did not add a wildcard - so far it was handled as undefined and broke the calculation, not it is handled as not clicked by user
                    if (userv[keys[i]] === undefined) {
                        userv[keys[i]] = 0;
                    }
                    result += Math.pow(carv[keys[i]] - userv[keys[i]], 2.0);

                    //alternate approach, would differ more from excel result but to be considered to ignore what excel user put into car vector for specific wildcard - in case aem editor should have the power to ignore a wildcard entirely for calculation
                    //if (userv[keys[i]] === undefined) { result += Math.pow(carv[keys[i]] - userv[keys[i]], 2.0); }
                }
            }
            return Math.sqrt(result);
        }

        /*
         term to exclude cars that are not suited for extreme conditions.
         applies in the case, the user selects the Q1 wildcard
         */
        function extra(cv, uv) {
            if (uv.wildcardQ1 === 1 && cv.wildcardQ1 === 0) {
                return 50;
            }
            return 0;
        }

        /*
         term to exclude cars with less seats than what the user requests.
         applies only in the case, the user selects 7 seats
         */
        function extra2(cv, uv) {
            if (uv.numberOfSeats === 2 && cv.numberOfSeats !== 2) {
                return 50;
            }
            return 0;
        }

        /*
         calculation of the score for every car
         */
        function calculate() {
            var dist;
            for (var i = 0; i < cars.length; i++) {
                dist = distance(cars[i].vector, user.vector);
                cars[i].distance = dist + extra(cars[i].vector, user.vector) + extra2(cars[i].vector, user.vector) + (dist * 0.0000001); //extra terms to exclude certain groups
                modelRanges[cars[i].modelRange].push(cars[i]); // presort by modelRange
            }

            return reduceModelRanges(resultSlidesCount); // sort modelRanges and pull the best scoring cars
        }

        /*
         creates the structure, that holds user's input
         */
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
             generate slides for the result page
             (see ds2-need-analyzer-recommendations-slider.js and ds2-need-analyzer-result-templates.js for details)
             */

            function processResults(cars) {
                var slides = [];
                var car;

                for (var i = 0; i < cars.length; ++i) {
                    car = cars[i];
                    if (car) {
                        slides.push($(templates.slideTemplate(car)));
                    }
                }

            return slides;
        }


        /* create fallback output if the user hasn't answered anything yet */
        function fallback(cars) {
            var slides = [];
            var i;
            for (i = 0; i < cars.length; ++i) {
                if (parseInt(cars[i].availableForFallback) === 1) {
                    slides.push(cars[i]);
                    if (i === settings.fallbackCars) {
                        break;
                    }
                }
            }

            if (!slides.length) {
                for (i = 0; i < settings.fallbackCars; ++i) {
                    slides.push(cars[i]);
                }
            }

            if (slides.length > settings.fallbackCars) {
                slides = slides.slice(0, settings.fallbackCars);
            }

            return slides;
        }

        /* pass the generated slides to the slider */
        function updateSlider(slides) {
            dispatcher.post('na-result-update', slides);
        }

        /*
         translate json data to the same form as user input to be able to use the same code for both pieces of data
         */
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
                if ($(this).attr('type') === 'radio' && $(this).prop('checked') === true) {
                    userData[$(this).attr('data-question-key')] = $(this).val();
                }
                else if ($(this).attr('type') === 'checkbox') {
                    userData[$(this).attr('data-question-key')] = $(this).prop('checked');
                }
            });

            if (window.cookiecontroller.api.isCookieAllowed('cc_na_application')) {
                window.cookiecontroller.api.setCookie('cc_na_application', JSON.stringify(userData));
            }
        }

        /*
         restore state, from cookie, or teaser url parameters and trigger calculation if necessary
         */
        function deserialize() {

            // var userData = JSON.parse(window.localStorage.getItem('na-userData'));
            var userData = JSON.parse(window.cookiecontroller.api.getCookie('cc_na_application'));
            var changed = false;
            var fromTeaser = false;
            var fromCookie = false;
            var fromExternal = false;
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
                        return el.split('=')[1] == 'true';
                    });

                userData.city = urlparams[0];
                userData.countryRoad = urlparams[1];
                userData.motorway = urlparams[2];
                userData.wildcardQ1 = urlparams[3];

                fromTeaser = true;
            }

            $('.ds2-need-analyzer--input input').each(function () {
                if ($(this).attr('type') === 'radio' && $(this).val() === userData[$(this).attr('data-question-key')]) {
                    $(this).prop('checked', true);
                    changed = true;
                }
                else if ($(this).attr('type') === 'checkbox') {
                    $(this).prop('checked', userData[$(this).attr('data-question-key')]);
                    changed = true;
                }
            });

            return {
                changed: changed,
                fromTeaser: fromTeaser,
                fromCookie: fromCookie
            };
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

            /*
             check if no input notification should be visible or not, triggered by ds2-need-analyzer.js
             */
            //TODO this has to be elsewhere
            function checkNoInputNotification(command) {
                var noInputNotification = $('.ds2-na--no-input-notification-wrapper');
                if (command === 'checkShow' && isFallback) { //&& set boolean here to see if notification allowed or not
                    noInputNotification.delay(1250).slideDown(function () {
                        //callback function to make sure
                        dispatcher.post('buttonArea');
                    });
                    //to make sure the Browser
                } else if (command === 'hide') {
                    noInputNotification.slideUp(250);
                }
            }

        return {
            /*
             setup data structures and initial conditions, such as cookie data, or answers transfer from the teaser.
             > modelRanges - a structure to pre-sort results according to modelRange property (from json)
             > userData - a structure that holds user input
             > questionInputs - a structure, that holds references to the inputs within the question slides
             > cars - an array of objects, each representing a car (taken as is from json)
             */
            init: function (na_data, options) {
                //setup listeners, fetch data and establish communications
                var numQuestions = $('.ds2-need-analyzer--list-steps li').length - 1;
                var i;
                var idx;
                var _this = this;
                var sel;

                settings = options.naAppOptions;

                for (i = 0; i < numQuestions; ++i) {

                    idx = i + 1;
                    questionInputs[i] = {completed: false};

                    sel = $('[data-question="' + idx + '"] input');
                    sel.on('change', {question: idx}, _this.checkUserInput);
                    questionInputs[i].selections = sel;

                    questionInputs[i].parentSlide = $(sel).closest('.ds2-need-analyzer--step').attr('data-url');

                    sel = $('[data-question-wildcard="' + idx + '"] input');
                    sel.on('change', {question: idx}, _this.checkUserInput);
                    questionInputs[i].wildcards = sel;
                }

                initUserData(questionInputs, user);

                modelRanges = setupModelRangeBuckets(na_data);

                for (i = 0; i < na_data.length; ++i) {
                    cars.push(na_data[i]);
                    generateCarVector(cars[i], user.vector);
                }

                sel = deserialize();
                if (sel.changed === true) {
                    _this.checkUserInput({data: {question: 1}});

                    if (sel.fromTeaser === true) {
                        dispatcher.post('go-to-q2');
                    }
                    else if (sel.fromCookie === true) {
                        dispatcher.post('go-to-result');
                        $('.ds2-na-recommendations-slider').trigger('tracking:needanalyzer:product:update', {matchType: 'Perfect Match Model'});
                    }
                }
                else {
                    updateSlider(processResults(fallback(cars)));
                }

                    dispatcher.listen('clearUserData', clearUserData);
                    //this listener catches after initialisation, if no input notification should be shown or hidden
                    dispatcher.listen('checkNoInputNotification', checkNoInputNotification);

                if ($('.ds2-need-analyzer--step-result').hasClass('active')) {
                    checkNoInputNotification('checkShow');
                }
            },
            /*
             determine if user input is sufficient to calculate suggestions and perform
             calculation and view update
             */
            checkUserInput: function (event) {
                /* determine if user input is sufficient to calculate suggestions */
                var i;
                var answerHistory;
                var parentSlide = $(event.currentTarget).closest('.ds2-need-analyzer--step').attr('data-url');
                var c = 0;

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

                    for (i = 0; i < questionInputs.length; ++i) {
                        if (questionInputs[i].completed === true) {
                            updateSlider(processResults(calculate()));
                            serialize();
                            return;
                        }
                    }

                serialize();
                updateSlider(processResults(fallback(cars)));
            },

                /* signal to display the error overlay, see ds2-need-analyzer.js */
                error: function (message) {
                    dispatcher.post('error', message);
                }
            };
        })();

    /*
     entry point into the logic module.
     checks availability of the data, get configuration and init app-logic
     */
    if ($('.ds2-need-analyzer').length) { //TODO fix that
        var cc = window.cookiecontroller;

        function startNeedAnalyzer() {

            var options = {};
            /*
             collect configuration bits and merge them into a single object
             (refer to page-need-analyzer.hbs)
             */
            $('.na-app-config').each(function () {
                $.extend(true, options, JSON.parse($(this).html()));
            });
            log('na-app-options', options)
            /*
             the following clause exists to enable working in the local node environment
             (refer to need-analyzer-example-data.json and page-need-analyzer.hbs)
             */
            if (window.na_data) {

                if (na_data.vehicles) {
                    digitals2.ds2NeedAnalyzerLogic.init(na_data.vehicles, options);
                } else {
                    digitals2.ds2NeedAnalyzerLogic.error();
                }

            }
            else {
                /* from here on - production environment relevant code */
                var jsonSource = $('#na-data');
                if (jsonSource.length === 0) {
                    digitals2.ds2NeedAnalyzerLogic.error('No JSON file found'); // no json
                } else {
                    $.get(jsonSource.attr('src'), function (data) {

                        if (data.vehicles) {
                            digitals2.ds2NeedAnalyzerLogic.init(data.vehicles, options);
                        } else {
                            digitals2.ds2NeedAnalyzerLogic.error('JSON file has wrong structure'); // wrong json structure
                        }
                    }).fail(function (jqXHR, textStatus) {
                        digitals2.ds2NeedAnalyzerLogic.error('jQuery fail Error - textStatus: ' + textStatus); // jquery fai
                    });
                }
            }
        }

        /* cookie consent check and start */
        if (!cc.api.isInitialized()) {
            cc.api.registerOnInitialized(startNeedAnalyzer);
        }
        else if (cc.api.isRegulationAccepted()) {
            startNeedAnalyzer();
        }
        else {
            cc.api.registerOnConsentChange(startNeedAnalyzer);
        }
    }
});
