define('ds2-all-model-overview',  [
    'use!jquery',
    'use!jquery-sleck'
],     $(function () {
    var modelPageContainer;

    var $w = $(window);
    $.fn.visible = function (partial, hidden, direction, container) {

        if (this.length < 1) {
            return;
        }

        // Set direction default to 'both'.
        direction = direction || 'both';

        var $t = this.length > 1 ? this.eq(0) : this,
            isContained = typeof container !== 'undefined' && container !== null,
            $c = isContained ? $(container) : $w,
            wPosition = isContained ? $c.position() : 0,
            t = $t.get(0),
            vpWidth = $c.outerWidth(),
            vpHeight = $c.outerHeight(),
            clientSize = hidden === true ? t.offsetWidth * t.offsetHeight : true;

        if (typeof t.getBoundingClientRect === 'function') {

            // Use this native browser method, if available.
            var rec = t.getBoundingClientRect(),
                tViz = isContained ?
                    rec.top - wPosition.top >= 0 && rec.top < vpHeight + wPosition.top :
                    rec.top >= 0 && rec.top < vpHeight,
                bViz = isContained ?
                    rec.bottom - wPosition.top > 0 && rec.bottom <= vpHeight + wPosition.top :
                    rec.bottom > 0 && rec.bottom <= vpHeight,
                lViz = isContained ?
                    rec.left - wPosition.left >= 0 && rec.left < vpWidth + wPosition.left :
                    rec.left >= 0 && rec.left < vpWidth,
                rViz = isContained ?
                    rec.right - wPosition.left > 0 && rec.right < vpWidth + wPosition.left :
                    rec.right > 0 && rec.right <= vpWidth,
                vVisible = partial ? tViz || bViz : tViz && bViz,
                hVisible = partial ? lViz || rViz : lViz && rViz,
                vVisible = (rec.top < 0 && rec.bottom > vpHeight) ? true : vVisible,
                hVisible = (rec.left < 0 && rec.right > vpWidth) ? true : hVisible;

            if (direction === 'both') {
                return clientSize && vVisible && hVisible;
            }
            else if (direction === 'vertical') {
                return clientSize && vVisible;
            }
            else if (direction === 'horizontal') {
                return clientSize && hVisible;
            }
        }
        else {

            var viewTop = isContained ? 0 : wPosition,
                viewBottom = viewTop + vpHeight,
                viewLeft = $c.scrollLeft(),
                viewRight = viewLeft + vpWidth,
                position = $t.position(),
                _top = position.top,
                _bottom = _top + $t.height(),
                _left = position.left,
                _right = _left + $t.width(),
                compareTop = partial === true ? _bottom : _top,
                compareBottom = partial === true ? _top : _bottom,
                compareLeft = partial === true ? _right : _left,
                compareRight = partial === true ? _left : _right;

            if (direction === 'both') {
                return !!clientSize && ((compareBottom <= viewBottom) && (compareTop >= viewTop)) && ((compareRight <= viewRight) && (compareLeft >= viewLeft));
            }
            else if (direction === 'vertical') {
                return !!clientSize && ((compareBottom <= viewBottom) && (compareTop >= viewTop));
            }
            else if (direction === 'horizontal') {
                return !!clientSize && ((compareRight <= viewRight) && (compareLeft >= viewLeft));
            }
        }
    };

    var modelPage = {
            resizeTimer: null,
            allowedFilterTypes: [
              'body-type',
              'bodyTypeCode',
              'consumptionOverall',
              'co2Overall',
              'co2EquivalentOverall',
              'fromPrice',
              'transmission',
              'driveType',
              'code',
              'enginePower',
              'fromPrice',
              'transmissionType',
              'fuelType',
              'efficiencyCategory',
              'acceleration' ,
              'novaPercentage'
            ],
            rtimeOut: function (callback, delay) {
                var dateNow = Date.now,
                    requestAnimation = window.requestAnimationFrame,
                    start = dateNow(),
                    stop,
                    timeoutFunc = function () {
                        dateNow() - start < delay ? stop || requestAnimation(timeoutFunc) : callback()
                    };
                requestAnimation(timeoutFunc);
                return {
                    clear: function () {
                        stop = 1
                    }
                }
            },
            init: function (selector) {
                modelPageContainer = $(selector);
                this.initSlick();
                this.initFilter();
                this.initNrOfVehiclesFound();
                this.initSeeResultsButton();
                this.initMoreInfosButtons();
                this.initResizeBehaviour();
                this.adaptSameHeightCars();
                this.toggleTooltipBox();
                this.defineRangeSliders();
                this.showMoreFilterButton()
            },
            initResizeBehaviour: function () {
                $(window).on('resize', function () {
                    clearTimeout(modelPage.resizeTimer);
                    $('#ds2-model-cars').addClass('loading');
                    modelPage.resizeTimer = modelPage.rtimeOut(function () {
                        $('.car-clone').remove();
                        modelPageContainer.find('.cars').each(function () {
                            if ($(window).width() > 980) {
                                $(this).sleck('slickGoTo', 0, true).sleck('slickSetOption', 'draggable', false, false);
                            }
                            else {
                                $(this).find('.ds2-model-car').removeClass('buttons-visible');
                                $(this).sleck('slickGoTo', 0, true).sleck('slickSetOption', 'draggable', true, false);
                            }
                        });

                        modelPage.adaptSameHeightCars();
                        $('#ds2-model-cars').removeClass('loading');
                    }, 150);
                });
            },
            adaptSameHeightCars: function () {
                if ($(window).width() > 980) {
                    modelPageContainer.find('.cars').each(function () {
                        var maxHeight = 0;
                        $(this).find('.ds2-model-car').each(function () {
                            if (maxHeight < $(this).height()) {
                                maxHeight = $(this).height();
                                ;
                            }
                        });
                        $(this).find('.ds2-model-car').css('min-height', maxHeight);
                    });
                }
                else {
                    $(this).find('.ds2-model-car').css('min-height', 'auto');
                }
            },
            toggleTooltipBox: function () {
              var $openTooltip = $('.filter--filter-group-header-tooltip .ds2-info-icon'),
                  $closeTooltip = $('.filter--filter-group-header-tooltip-close');

              $openTooltip.on('click', function() {
                $(this).next().show();
              });

              $closeTooltip.on('click', function() {
                $(this).parent().hide();
              });
            },
            initSlick: function () {
                // the z-index must be adapted according to the order of the
                // car-series
                var carSeries = modelPageContainer.find('.car-series,.ds2-need-analyzer-v2');
                var zIndex = carSeries.size();
                carSeries.each(function () {
                    $(this).css({'z-index': zIndex});
                    zIndex--;
                });

                // add slick
                modelPageContainer.find('.cars').each(function () {
                    $(this);
                    var slickSettings = {
                        mobileFirst: true,
                        infinite: false,
                        slidesToShow: 1.3,
                        focusOnSelect: true,
                        swipe: false,
                        draggable: false,
                        responsive: [
                            {
                                breakpoint: 1,
                                settings: {
                                    swipe: true,
                                    draggable: true
                                }
                            },
                            {
                                breakpoint: 520,
                                settings: {
                                    swipe: true,
                                    draggable: true,
                                    slidesToShow: 2.3
                                }
                            },
                            {
                                breakpoint: 980,
                                settings: 'unslick'
                            }]
                    };
                    $(this).sleck(slickSettings);
                    $(this).on('swipe', function (event, slick, direction) {
                        modelPage.initMoreInfosButtons();
                    });
                });
            },
            initFilter: function () {
                modelPageContainer.find('.filter--open-filter-button').on('click', function () {
                    $(this).closest('#ds2-model-filter').toggleClass('filter--visible');
                    if ($(this).closest('#ds2-model-filter').hasClass('filter--visible')) {
                        $('body').addClass('ds2-model-filter--expanded');
                        $(this).closest('#ds2-model-filter').find('.filter--filter-item').each(function () {
                            if ($(this).hasClass('active')) {
                                $(this).data('prev-selected', true);
                            }
                            else {
                                $(this).data('prev-selected', false);
                            }
                        });
                    }
                    else {
                        $('body').removeClass('ds2-model-filter--expanded');
                    }
                });
                modelPageContainer.find('.filter--modal-close').on('click', function () {
                    $(this).closest('#ds2-model-filter').removeClass('filter--visible');
                    var needsRefiltering = false;
                    $(this).closest('#ds2-model-filter').find('.filter--filter-item').each(function () {
                        if ($(this).data('prev-selected') && false === $(this).hasClass('active')) {
                            needsRefiltering = true;
                            $(this).addClass('active');
                        }
                        else if (false === $(this).data('prev-selected') && $(this).hasClass('active')) {
                            needsRefiltering = true;
                            $(this).removeClass('active');
                        }
                    });
                    if (needsRefiltering) {
                        modelPage.performFilter();
                    }
                    $('body').removeClass('ds2-model-filter--expanded');
                });
                modelPageContainer.find('.filter--see-results').on('click', function () {
                    $(this).closest('#ds2-model-filter').removeClass('filter--visible');
                    $('body').removeClass('ds2-model-filter--expanded');
                });

                modelPageContainer.find('.filter--filter-item').on('click', function () {
                  if(!$(this).hasClass('slider-range')) {
                    $(this).toggleClass('active');
                    modelPage.performFilter();
                  }
                });

                modelPageContainer.on('click', '.filter--selected-filter-item', function () {
                    modelPageContainer.find('.filter--filter-item[data-filter-type="' + $(this).data('filter-type') + '"][data-filter-value="' + $(this).data('filter-value') + '"]').each(function () {
                        $(this).removeClass('active');

                        if ($(this).is(":checkbox")) {
                          $(this).prop("checked", false);
                        }
                    });
                    modelPage.performFilter();
                });

                modelPageContainer.find('.filter--reset-filter').on('click', function () {
                    var activeFilters = modelPageContainer.find('.filter--filter-item');

                    activeFilters.removeClass('active');

                    if (activeFilters.is(":checkbox")) {
                      activeFilters.prop("checked", false);
                    }
                    modelPage.performFilter();
                });
            },
            initNrOfVehiclesFound: function () {
                var nrOfVehiclesFound = modelPageContainer.find('.cars .ds2-model-car').not('.car-hidden').not('.car-clone').size();

                modelPageContainer.find('.filter--nr-of-vehicles').each(function () {
                    var textPrototype = '';
                    if (nrOfVehiclesFound === 0) {
                        textPrototype = $(this).data('prototype-text-empty');
                    }
                    else if (nrOfVehiclesFound === 1) {
                        textPrototype = $(this).data('prototype-text-single');
                    }
                    else {
                        textPrototype = $(this).data('prototype-text');
                    }

                    $(this).html(textPrototype.replace('##NUMBER##', nrOfVehiclesFound));
                });
            },
            initSeeResultsButton: function () {
                var nrOfVehiclesFound = modelPageContainer.find('.ds2-model-car').not('.car-hidden').not('.car-clone').size();

                modelPageContainer.find('.filter--see-results').each(function () {
                    var prototype = $(this).data('prototype');

                    $(this).html(prototype.replace('##NUMBER##', nrOfVehiclesFound));
                });
            },
            initMoreInfosButtons: function () {
                modelPageContainer.find('.ds2-model-car').removeClass('buttons-visible');

                modelPageContainer.on('mouseover', '.ds2-model-car', function () {
                        if (false === $(this).hasClass('car-clone')) {
                            // clone car on desktop to make overlay effect
                            if ($(window).width() > 980) {
                                modelPage.cloneCar($(this));
                            }
                        }
                    }
                );
                modelPageContainer.on('mouseleave', '.car-clone', function () {
                    $('.car-clone').remove();
                });


                modelPageContainer.on('click touch', '.ds2-model-car', function (e) {
                        e.stopPropagation();
                        // only on non desktop
                        if ($(window).width() <= 980) {
                            modelPageContainer.find('.ds2-model-car').removeClass('buttons-visible');
                            if (false === $(this).hasClass('buttons-visible')) {
                                $(this).addClass('buttons-visible');

                                if (false === $(this).find('.ds2-model-card--image').visible(false, false, 'vertical')) {
                                    var currentScroll = $(window).scrollTop();
                                    currentScroll += 300;
                                    $('html, body').animate({'scrollTop': currentScroll}, 200);
                                }
                                else if (false === $(this).find('.ds2-model-card--buttons').visible(false, false, 'vertical')) {
                                    var currentScroll = $(window).scrollTop();
                                    currentScroll += 170;
                                    $('html, body').animate({'scrollTop': currentScroll}, 200);
                                }
                            }
                        }
                    }
                );

                modelPageContainer.on('click', '.close-button', function (e) {
                    e.preventDefault();
                    e.stopPropagation();

                    $(this).closest('.ds2-model-car').removeClass('buttons-visible');
                    if ($(this).closest('.ds2-model-car').hasClass('car-clone')) {
                        $(this).closest('.ds2-model-car').remove();
                    }
                });
            },

            defineRangeSliders: function () {
              $( ".slider-range" ).each(function() {
                modelPage.initRangeSlider($(this));
              });
            },

            initRangeSlider: function ($element) {
                $element.each(function() {
                  var rangeSettingsData = $(this).parent();

                  if (rangeSettingsData) {
                    var rangeSettings = {
                      isDouble: rangeSettingsData.data('rangeIsdouble'),
                      minVal: rangeSettingsData.data('rangeMin'),
                      maxVal: rangeSettingsData.data('rangeMax'),
                      minDefaultVal: rangeSettingsData.data('rangeMin'),
                      maxDefaultVal: rangeSettingsData.data('rangeMax'),
                      step: rangeSettingsData.data('rangeStep')
                    };

                    if(!rangeSettings.isDouble) {
                      $(this).slider({
                        range: "min",
                        min: 1,
                        max: rangeSettings.maxVal,
                        value: rangeSettings.maxDefaultVal,
                        step: rangeSettings.step,
                        change: function(){
                          $(this).addClass('active');
                          modelPage.performFilter();
                        },
                        slide: function ( event, ui ) {
                          $(this).parent().find( ".amount" ).html( ui.value );
                          $(this).attr('data-filter-value', ui.value);
                          $(this).attr('name', ui.value);
                          $(this).find('.ui-slider-handle.ui-state-hover').html('<span></span>');
                          $(this).find('.ui-slider-handle.ui-state-hover span').attr('title', ui.value);
                        }.bind(this)
                      });

                      $(this).parent().find( ".amount" ).html( + $(this).slider( "values", 1 ) );
                    } else {
                      $(this).slider({
                        range: true,
                        min: rangeSettings.minVal,
                        max: rangeSettings.maxVal,
                        values: [ rangeSettings.minDefaultVal, rangeSettings.maxDefaultVal ],
                        step: rangeSettings.step,
                        change: function( event, ui ){
                          if (ui.values[ 0 ] === rangeSettings.minVal && ui.values[ 1 ] === rangeSettings.maxVal) {
                            $(this).removeClass('active')
                          } else {
                            $(this).addClass('active');
                          }
                          $(this).attr('name', "$" + ui.values[ 0 ] + " - $" + ui.values[ 1 ]);
                          modelPage.performFilter();
                        },
                        slide: function( event, ui ) {
                          $(this).parent().find( ".amount" ).html( "$" + ui.values[ 0 ] + " - $" + ui.values[ 1 ] );
                          $(this).find('.ui-slider-handle.ui-state-hover').html('<span></span>');
                          $(this).find('.ui-slider-handle.ui-state-hover span').attr('title', ui.value);
                          $(this).attr('data-filter-value-min', ui.values[0]);
                          $(this).attr('data-filter-value-max', ui.values[1]);
                        }.bind(this)
                      });

                      $(this).parent().find( ".amount" ).html( "$" + $(this).slider( "values", 0 ) +
                        " - $" + $(this).slider( "values", 1 ) );
                    }
                  }
                });
            },
            showMoreFilterButton: function() {
              $('.filter--show-more-filters').on('click', function () {
                $(this).toggleClass('filter--show-more filter--show-less');
                $('.filter--filter-collapsed-section').slideToggle( "slow" );
              });
            },
            cloneCar:
                function (car) {
                    $('.car-clone').remove();

                    var carClone = car.clone();
                    carClone.addClass('buttons-visible');
                    carClone.addClass('car-clone');
                    carClone.css({
                        'position': 'absolute',
                        'top': car.offset().top - car.closest('.cars').offset().top,
                        'left': car.offset().left - car.closest('.cars').offset().left - 15,
                        'width': car.width() + 30,
                        'z-index': 10000000
                    });

                    carClone.insertAfter(car);
                    carClone.find('.ds2-tooltip').on('click', function () {
                        car.find('.ds2-tooltip').trigger('click');
                    });

                    modelPage.rtimeOut(function () {
                        carClone.addClass('car-clone--shadow');
                    }, 1);
                    modelPage.rtimeOut(function () {
                        carClone.find('.button--build-and-price').addClass('faded-in');
                    }, 100);
                    modelPage.rtimeOut(function () {
                        carClone.find('.ds2-linklist').addClass('faded-in');
                    }, 140);
                }
            ,
            performFilter: function () {
                $('#ds2-model-cars').addClass('loading');
                modelPageContainer.find('.cars').sleck('unslick');
                modelPageContainer.find('.hidden-cars-container .car-hidden').each(function () {
                    $(this).closest('.hidden-cars-container').prev('.cars').find('.slick-track').append($(this));
                });


                var filterValues = [];
                var filtered = false;
                var filterVal;
                var filterValMin;
                var filterValMax;

                // init filter values
                modelPageContainer.find('.filter--filter-item.active').each(function () {
                    if (filterValues[$(this).data('filter-type')] === undefined) {
                        filterValues[$(this).data('filter-type')] = [];
                    }

                  if($(this).hasClass('slider-range')) {
                    filterValMin = parseFloat($(this).attr('data-filter-value-min'));
                    filterValMax = parseFloat($(this).attr('data-filter-value-max'));

                    filterValues[$(this).data('filter-type')].push({
                      'valueMin': filterValMin,
                      'valueMax': filterValMax,
                      'name': $(this).attr('name')
                    });
                  } else {
                    filterVal = $(this).data('filter-value');

                    filterValues[$(this).data('filter-type')].push({
                      'value': filterVal,
                      'name': $(this).attr('name')
                    });
                  }

                    filtered = true;
                });

                if (filtered) {
                    modelPageContainer.addClass('filtered');
                    modelPageContainer.find('.filter--no-filters-selected-text').hide();
                    modelPageContainer.find('.ds2-model-car').each(function () {
                        var car = $(this);
                        var foundFilter = false;
                        var pdhJsonData = car.data('aggregated-pdh-json');
                        for (var filterType in filterValues) {

                          if (modelPage.allowedFilterTypes.indexOf(filterType) !== -1) {
                            var i = 0;
                                if(!$(this).parents('.pdh-filter-version').length) {
                                  // Filtering withour PDH Data
                                  for (i = 0; i < filterValues[filterType].length; i++) {
                                    if (filterValues[filterType][i].value.indexOf(car.data(filterType)) !== -1) {
                                      foundFilter = true;
                                      break;
                                    }
                                  }
                                } else {
                                  // filtering for PDH Data version
                                  for (i = 0; i < filterValues[filterType].length; i++) {
                                    if (pdhJsonData[filterType].min) {
                                      if (pdhJsonData &&
                                        pdhJsonData[filterType].min >= filterValues[filterType][i].valueMin &&
                                        pdhJsonData[filterType].max <= filterValues[filterType][i].valueMax ) {
                                        foundFilter = true;
                                        break;
                                      }
                                    } else {
                                      if (pdhJsonData && pdhJsonData[filterType].indexOf(filterValues[filterType][i].value) > -1) {
                                        foundFilter = true;
                                        break;
                                      }
                                    }
                                  }
                                }

                                if (false === foundFilter) {
                                    if (false === car.hasClass('car-hidden')) {
                                        car.addClass('car-hidden');
                                      modelPage.rtimeOut(function () {
                                            car.hide();
                                            // car.remove();
                                        }, 150);
                                    }
                                }
                                else {
                                    if (car.hasClass('car-hidden')) {
                                        car.removeClass('car-hidden');
                                      modelPage.rtimeOut(function () {
                                            car.show();
                                        }, 150);
                                    }
                                }
                            }
                        }
                    });
                }
                else {
                    modelPageContainer.removeClass('filtered');
                    modelPageContainer.find('.filter--no-filters-selected-text').show();
                    modelPageContainer.find('.ds2-model-car').removeClass('car-hidden').show();
                }

                $(modelPageContainer).find('.car-series').each(function () {
                    if ($(this).find('.ds2-model-car').not('.car-hidden').length === 0) {
                        $(this).addClass('car-series-hidden');
                    }
                    else {
                      $(this).removeClass('car-series-hidden');
                    }
                });

                modelPage.initNrOfVehiclesFound();
                modelPage.initSeeResultsButton();
                modelPage.initSelectedFilters(filterValues);
                modelPage.initMoreInfosButtons();

                modelPage.rtimeOut(function () {
                    modelPageContainer.find('.ds2-model-car.car-hidden').each(function () {
                        $(this).closest('.cars').next('.hidden-cars-container').append($(this));
                    });
                    modelPageContainer.find('.cars').sleck('reinit');
                    modelPage.adaptSameHeightCars();
                    $('#ds2-model-cars').removeClass('loading');
                }, 150);

            }
            ,
            initSelectedFilters: function (filterValues) {
                modelPageContainer.find('.filter--selected-filters').each(function () {
                    // remove all selected filter values
                    $(this).html('');
                    // get prototype
                    var prototype = $(this).data('prototype');

                    for (var filterType in filterValues) {
                        if (modelPage.allowedFilterTypes.indexOf(filterType) !== -1) {
                            var i = 0;
                            for (i = 0; i < filterValues[filterType].length; i++) {
                                // replace the prototype markups and add to selected filters
                                var newSelectedFilter = prototype.replace('##FILTER_TYPE##', filterType);
                                newSelectedFilter = newSelectedFilter.replace('##FILTER_VALUE##', filterValues[filterType][i].value);
                                newSelectedFilter = newSelectedFilter.replace('##NAME##', filterValues[filterType][i].name);

                                $(this).append(newSelectedFilter);
                            }
                        }
                    }
                });
            }
        };
    modelPage.init('#ds2-model-page');
}));




