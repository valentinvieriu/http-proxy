define('ds2-enavigation-model', [
  'use!jquery'
], $(function () {

  var padNavigation = {
    resizeTimer: null,
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
      this.containers = $(selector);

      // initialy hide all model-car's
      $('.ds2-model-car').addClass('hide');

      this.attachEvents();
      this.containers.each(function (index, container) {
        padNavigation.initScrollBehavior($(container).find('ul').first());
        padNavigation.scrollToItem($(container).find('.active').first(), $(container).find('ul').first());

        if (index === 0) {
          padNavigation.updateContent($(container), 'init');
        }
      });

      padNavigation.adaptSameHeightCars();
    },
    attachEvents: function () {
      padNavigation.containers.each(function (index, container) {
        $(container).on('click', '.model-nav li', function (event) {
          event.preventDefault();
          padNavigation.scrollToItem($(this), $(this).closest('ul'));
          padNavigation.updateContent($(container), event.type);
        });
      });

      $(window).on('resize', function () {
        clearTimeout(padNavigation.resizeTimer);
        padNavigation.resizeTimer = setTimeout(function () {
          padNavigation.containers.each(function (index, container) {
            padNavigation.initScrollBehavior($(container));
            padNavigation.scrollToItem($(container).find('.active').first(), $(container).find('ul'));
            padNavigation.adaptSameHeightCars();
          });
        }, 250);
      });

      $('.model-nav-prev-button').on('click', function (event) {
        var currentLi = $(this).closest('.model-nav').find('li.active');
        var prevLi = currentLi.prev().not('.clone');

        if (prevLi.length) {
          padNavigation.scrollToItem(prevLi, prevLi.closest('ul'));
          padNavigation.updateContent($(this).closest('.model-nav-holder'), event.type);
        }
      });

      $('.model-nav-next-button').on('click', function (event) {
        var currentLi = $(this).closest('.model-nav').find('li.active');
        var nextLi = currentLi.next().not('.clone');

        if (nextLi.length) {
          padNavigation.scrollToItem(nextLi, nextLi.closest('ul'));
          padNavigation.updateContent($(this).closest('.model-nav-holder'), event.type);
        }
      });
    },
    initScrollBehavior: function (scrollContainer) {
      var clonedItems = [];

      if (scrollContainer.hasClass('infinite')) {
        padNavigation.addInfiniteItems(scrollContainer, true, true);
      }

      if ($(window).width() < 980) {
        var scrollTimer;
        scrollContainer.scroll(function () {
          if (false === $(this).hasClass('disable-scroll')) {
            var scrollContainerOffset = $(this).offset().left;
            var containerCenter = $(this).width() / 2;

            $(this).find('li').removeClass('active');

            var scrollLeft = 0;

            if (scrollTimer) {
              scrollTimer.clear();
            }
            scrollTimer = padNavigation.rtimeOut(function () {
              var minimum = 1000000;
              var minimumItem = null;
              scrollContainer.find('li').each(function () {
                var itemOffset = $(this).offset().left;
                var itemWidth = $(this).outerWidth();
                var itemCenter = (itemOffset + (itemWidth / 2)) - scrollContainerOffset;

                if (itemCenter >= 0) {
                  if (minimum > Math.abs(containerCenter - itemCenter)) {
                    minimum = Math.abs((containerCenter - itemCenter));
                    scrollLeft = (containerCenter - itemCenter);
                    minimumItem = $(this);
                  }
                  else {
                    return false;
                  }
                }
              });
              scrollContainer.addClass('disable-scroll');
              minimumItem.addClass('active');
              padNavigation.rtimeOut(function () {
                padNavigation.updateContent(scrollContainer.closest('.model-nav-holder'), 'swipe');

                var itemCenter = (minimumItem.offset().left + (minimumItem.outerWidth() / 2)) - scrollContainerOffset;
                scrollLeft = (containerCenter - itemCenter);

                scrollContainer.animate({scrollLeft: (scrollContainer.scrollLeft() + -scrollLeft)}, 50);

                padNavigation.rtimeOut(function () {
                  scrollContainer.removeClass('disable-scroll');
                }, 150);

                padNavigation.rtimeOut(function () {
                  padNavigation.padPosition(scrollContainer.closest('.model-nav-holder').find('.pad'), scrollContainer);
                }, 50);

                // check if new clones must be add (left or right end reached)
                if (scrollContainer.scrollLeft() === 0) {
                  padNavigation.rtimeOut(function () {
                    scrollContainer.addClass('disable-scroll');
                    // add the first clones left
                    padNavigation.addInfiniteItems(scrollContainer, true, false);

                    padNavigation.rtimeOut(function () {
                      padNavigation.scrollToItem(minimumItem, scrollContainer);
                    }, 100);
                  }, 50);
                }
                else if ((scrollContainer.scrollLeft() + scrollContainer.outerWidth()) >= scrollContainer[0].scrollWidth) {
                  padNavigation.rtimeOut(function () {
                    scrollContainer.addClass('disable-scroll');
                    // add the first clones right
                    padNavigation.addInfiniteItems(scrollContainer, false, true);

                    padNavigation.rtimeOut(function () {
                      padNavigation.scrollToItem(minimumItem, scrollContainer);
                    }, 100);
                  }, 50);
                }
              }, 200);
            }, 100);
          }
        });
      }
    },
    addInfiniteItems: function (scrollContainer, left, right) {
      var clonedItems = [];

      scrollContainer.find('li').not('.clone').each(function () {
        var clonedItem = $(this).clone();
        clonedItem.removeClass('active').addClass('clone');
        clonedItems.push(clonedItem);
      });

      // add the first clones left and right
      for (var i = 0; i < 30; i++) {
        if (left) {
          for (var k = clonedItems.length - 1; k >= 0; k--) {
            scrollContainer.prepend(clonedItems[k].clone());
            console.log('add');
          }
        }
        if (right) {
          for (var k = 0; k < clonedItems.length; k++) {
            scrollContainer.append(clonedItems[k].clone());
            console.log('add');
          }
        }
      }
    },
    padPosition: function (pad, scrollContainer) {
      if (scrollContainer.find('.active').first().offset()) {
        pad.css({
          'left': scrollContainer.find('.active').first().offset().left,
          'width': scrollContainer.find('.active').first().outerWidth()
        });
      }

    },
    scrollToItem: function (item, scrollContainer) {
      scrollContainer.addClass('disable-scroll');

      scrollContainer.find('li').removeClass('active');
      item.addClass('active');

      padNavigation.rtimeOut(function () {
        var scrollContainerOffset = scrollContainer.offset().left;
        var containerCenter = scrollContainer.width() / 2;
        var itemOffset = item.offset() ? item.offset().left : 0;

        var itemWidth = item.outerWidth();
        var itemCenter = (itemOffset + (itemWidth / 2)) - scrollContainerOffset;
        var scrollLeft = (containerCenter - itemCenter);

        scrollContainer.animate({scrollLeft: (scrollContainer.scrollLeft() + -scrollLeft)}, 150);
        padNavigation.rtimeOut(function () {
          scrollContainer.removeClass('disable-scroll');
          padNavigation.rtimeOut(function () {
            padNavigation.padPosition(scrollContainer.closest('.model-nav-holder').find('.pad'), scrollContainer);
            padNavigation.showHideNextPrevButtons(scrollContainer.closest('.model-nav-holder'));
          }, 25);
        }, 250);
      }, 100);
    },

    showHideCars: function ($activeNavItem, eventType, isSeriesOrBodyChanged) {
      var displayTime = 100,
          occurrenceTimeout = 100,
          hideClassTimeout = 250,
          carAnimationTimeout = 300;
      var series = $activeNavItem.data('series') || null;
      var bodyType = $activeNavItem.data('body-type') || null;

      $('.ds2-model-car').each(function () {
        var car = $(this);

        if (car.data('car-series') === series || car.data('car-body-type') === bodyType) {
          // car is filtered by series or body type
          padNavigation.rtimeOut(function () {
            if (car.hasClass('hide')) {
              padNavigation.rtimeOut(function () {
                car.removeClass('hide');
              }, hideClassTimeout);
              padNavigation.rtimeOut(function () {
                car.find('.ds2-model-card').removeClass('car-hidden').addClass('car-visible');
              }, carAnimationTimeout);
            }
          }, displayTime);
          displayTime += occurrenceTimeout;
        }
        else {
          // car is not filtered by series or body type
          if (false === car.hasClass('hide')) {
            padNavigation.rtimeOut(function () {
              car.addClass('hide');
            }, hideClassTimeout);
            padNavigation.rtimeOut(function () {
              car.find('.ds2-model-card').removeClass('car-visible').addClass('car-hidden');
            }, carAnimationTimeout);
          }
        }
      });

      $('#ds2-model-menu').trigger({
        type: 'navigationItemActiveChange',
        eventType: eventType,
        activeSubNavItem: $activeNavItem,
        isSeriesOrBodyChanged: isSeriesOrBodyChanged
      });
    },

    updateContent: function (container, eventType) {
      var $activeNavItem;
      // change on series/bodytype filter
      if (container.attr('id') === 'pad1') {
        var selectedContainerId = container.find('li.active').first().data('id');

        if (selectedContainerId === 1) {
          //series
          $('#pad2').show();
          $('#pad3').hide();
          $activeNavItem = $('#pad2 li.active').first();

          padNavigation.showHideCars($activeNavItem, eventType, true);
          padNavigation.scrollToItem($activeNavItem, $('#pad2 ul'));

          setTimeout(function () {
            padNavigation.padPosition($('#pad2 .pad'), $('#pad2 ul'));
          }, 20);
        }
        else if (selectedContainerId === 2) {
          // body types
          $('#pad3').show();
          $('#pad2').hide();
          $activeNavItem = $('#pad3 li.active').first();

          padNavigation.showHideCars($activeNavItem, eventType, true);
          padNavigation.scrollToItem($activeNavItem, $('#pad3 ul'));

          padNavigation.rtimeOut(function () {
            padNavigation.padPosition($('#pad3 .pad'), $('#pad3 ul'));
          }, 20);
        }
      }

      // changes on series
      if (container.attr('id') === 'pad2') {
        //series
        $activeNavItem = container.find('li.active').first();
        padNavigation.showHideCars($activeNavItem, eventType, false);
      }

      // changes on body types
      if (container.attr('id') === 'pad3') {
        //series
        $activeNavItem = container.find('li.active').first();
        padNavigation.showHideCars($activeNavItem, eventType, false);
      }
    },
    showHideNextPrevButtons: function (container) {
      var leftButton = container.find('.model-nav-prev-button');
      var rightButton = container.find('.model-nav-next-button');

      if ($('html').attr('dir') === 'rtl') {
        var tempButton = leftButton;
        leftButton = rightButton;
        rightButton = tempButton;
      }


      if (container.find('ul').scrollLeft() === 0) {
        leftButton.hide();
      }
      else {
        leftButton.show();
      }

      var lastLi = container.find('ul li').not('.clone').last();
      if ($('html').attr('dir') === 'rtl') {
        lastLi = container.find('ul li').not('.clone').first();
      }
      if (lastLi.length) {
        var offsetRight = lastLi.offset().left + lastLi.outerWidth() - lastLi.closest('ul').offset().left;

        if (container.find('ul').width() >= offsetRight) {
          rightButton.hide();
        }
        else {
          rightButton.show();
        }
      }
    },
    adaptSameHeightCars: function () {
      var maxHeight = 0;
      $('#ds2-model-navigation .ds2-model-car').not('.ds2-model-car--all').css('min-height', 'auto');
      $('#ds2-model-navigation .ds2-model-car').not('.ds2-model-car--all').each(function () {
        if (maxHeight < $(this).height()) {
          maxHeight = $(this).height();
        }
      });
      $('#ds2-model-navigation .ds2-model-car').not('.ds2-model-car--all').css('min-height', maxHeight);
    }
  };

  padNavigation.init('.model-nav-holder');
}));
