/**
 * partial: hotspot
 * author: sebastian, thomas
 */

define('ds2-hotspot-extended', [
    'use!jquery',
    'use!jquery-qtip',
    'use!iscroll',
    'use!jquery-slick',
    'ds2-main'],
  function ($) {
    'use strict';

    var ds2HotspotExtended = function (element) {
      this.$component = $(element);
      this.evt = {
        expandEnded: 'expandCopyContainerEnded',
        sliderCurrentSlide: 'slickCurrentSlide',
        sliderGoTo: 'slickGoTo',
        sliderNext: 'slickNext',
        sliderPrev: 'slickPrev',
        videoStopAll: 'stopAllVideos',
        viewportLarge: 'ds2ResizeLarge',
        viewportMedium: 'ds2ResizeMedium',
        viewportSmall: 'ds2ResizeSmall'
      };
      this.options = {
        hotspotDot: '.ds2-hse--keyvisual-hotspot-dot',
        hotspotLayer: '.ds2-hse-layer',
        hotspotLayerWrapper: '.ds2-hse-layer--wrapper',
        hotspotLayerContent: '.ds2-hse-layer--content',
        hotspotLayerSlider: '.ds2-hse-layer--slider',
        hotspotLayerKeyvisual: '.ds2-hse-layer--keyvisual',
        hotspotLayerClose: '.ds2-hse-layer--close a',
        hotspotDimLayer: '.ds2-hse-dim-layer',
        hotspotKeyvisualContainer: '.ds2-hse--keyvisual-image-container',
        hotspotKeyvisualHotspots: '.ds2-hse--keyvisual-hotspots',
        hotspotOverviewSlider: '.ds2-hse-overview--slider',
        hotspotSliderDots: '.ds2-hse-slider-dots',
        expandCopyItems: '.ds2-expand--body-copy-container',
        videoItems: '.ds2-video-player',

        hotspotLayerIndicatorClass: 'ds2-hse-layer-visible',
        hotspotLayerOpenClass: 'ds2-hse--layer-open',
        hotspotTooltipClass: 'ds2-tooltip-element--hse',

        qtipContent: '.qtip-content',

        iscrollOptions: {
          bounce: false,
          click: false,
          interactiveScrollbars: true,
          momentum: true,
          mouseWheel: true,
          preventDefault: false,
          probeType: 1,
          scrollbars: true,
          tap: true
        },

        slickLayerSliderOptions: {
          adaptiveHeight: false,
          autoplay: false,
          dots: true,
          dotsClass: 'ds2-hse-slider-dots',
          draggable: false,
          infinite: true,
          nextArrow: '<button type="button" data-role="none" class="ds2-hse-slider-next slick-next"><span class="ds2-icon ds2-icon--arrow-big-r-white ds2-icon--l ds2-icon--bg"></span></button>',
          prevArrow: '<button type="button" data-role="none" class="ds2-hse-slider-prev slick-prev"><span class="ds2-icon ds2-icon--arrow-big-l-white ds2-icon--l ds2-icon--bg"></span></button>',
          responsive: [
            {
              breakpoint: 981,
              settings: {
                adaptiveHeight: true
              }
            }
          ]
        },

        slickOverviewSliderOptions: {
          arrows: false,
          centerMode: true,
          centerPadding: '20%',
          draggable: true,
          infinite: true,
          initialSlide: 1,
          slidesToShow: 3,
          responsive: [
            {
              breakpoint: 480,
              settings: {
                centerPadding: '30%',
                slidesToShow: 1
              }
            }
          ]
        }
      };

      this.init();
    };

    /**
     * Init the component and attach the required event listeners
     */
    ds2HotspotExtended.prototype.init = function () {
      var self = this,
        options = self.options;

      self.viewport = window.digitals2.main.mediaQueryWatcherCheck();

      self.$hotspotLayerWrapper = self.$component.find(options.hotspotLayerWrapper);
      self.$hotspotLayers = self.$hotspotLayerWrapper.find(options.hotspotLayer);
      self.$hotspotDimLayer = self.$component.find(options.hotspotDimLayer);
      self.$hotspotTooltips = self.$component.find(options.hotspotDot + ' .ds2-icon--hotspot');
      self.$expandCopy = self.$component.find(self.options.expandCopyItems);

      // check if page is RTL and set config option for both sliders
      self.options.slickLayerSliderOptions.rtl = window.digitals2.main.isRTL;
      self.options.slickOverviewSliderOptions.rtl = window.digitals2.main.isRTL;

      // set breakpoint for responsive
      self.options.slickLayerSliderOptions.responsive.breakpoint = Foundation.media_queries['large'].match(/\d+/)[0];

      if (self.$hotspotLayers.length > 3) {
        self.$component.addClass('ds2-hse--using-overview-slider');
      } else if (self.$hotspotLayers.length === 1) {
        self.$component.addClass('ds2-hse--single-hotspot');
      }

      self._initHotspots();
      self.$layerSlider = self._initLayerSlider();
      self.$overviewSlider = self._initOverviewSlider();

      $(window.digitals2.main).on('ds2ResizeSmall ds2ResizeMedium ds2ResizeLarge', self, function (e) {
        self._onResize(e.type);
      });

      // recalculate adaptiv height after copy expanded for the current slide
      self.$expandCopy.on(self.evt.expandEnded, function (e) {
        if (self.viewport === self.evt.viewportSmall) {
          self.$hotspotLayerWrapper.find('.slick-list').css('height', self.$hotspotLayerWrapper.find('.slick-active').height());
        }
      });

      // current state of the tracking event object
      self.pEventState = self._getTrackingEvent();
    };

    /**
     * Configures the behavior of all hotspots items
     * Initialisation of all qtip
     * @private
     */
    ds2HotspotExtended.prototype._initHotspots = function () {
      var self = this;

      $.fn.qtip.zindex = 100;

      self.$hotspotTooltips.each(function () {
        var $hotspot = $(this);

        $hotspot.qtip({
          overwrite: false,
          content: {
            text: ''
          },
          position: {
            my: 'right center',
            at: 'left center',
            target: $hotspot,
            viewport: self.$component,
            container: self.$component.find(self.options.hotspotKeyvisualHotspots),
            adjust: {screen: true, resize: true}
          },
          style: {
            classes: self.options.hotspotTooltipClass,
            tip: {
              corner: true,
              height: 10,
              width: 10,
              offset: 0
            }
          },
          show: {
            solo: true,
            target: $(this),
            event: 'click mouseover click.correspondingClick'
          },
          hide: {
            event: 'mouseleave',
            fixed: true,
            delay: 50,
            target: $(self.options.qtipContent + ' label')
          },
          events: {
            show: function (event, api) {
              var hotspotId = $hotspot.data('hotspot-target');
              var hotspotTrackingData = self._getHotspotTrackingData(self.$hotspotLayers.filter('[data-id="' + hotspotId + '"]'));
              var $label = self.$component.find('[for="' + hotspotId + '"]');
              $label.appendTo($(this).find(self.options.qtipContent));

              // track tooltip open event
              if (!!!event.originalEvent.namespace) { //not corresponding/artificial click event
                self._updatePEventState('ds2-hse--tooltip-open', hotspotTrackingData);
              }
            }
          }
        });
      });

      /**
       * init hotspot trigger
       */
      self.$component.find(self.options.hotspotDot + '--input').on('click', function (e) {
        var $targetLayer = self.$hotspotLayers.filter('[data-id="' + e.currentTarget.id + '"]');
        var targetLayerIndex = $targetLayer.index();
        var hotspotTrackingData = self._getHotspotTrackingData($targetLayer);

        if ($.type(targetLayerIndex) === "number") {
          targetLayerIndex -= 1; // ignore cloned slides

          // show hotspot layer
          self._showLayerSlider();
          self.$layerSlider.slick(self.evt.sliderGoTo, targetLayerIndex, true);

          self._updatePEventState('ds2-hse--layer-open', hotspotTrackingData);
        }
      });
    };

    /**
     * initialization of the layerslider
     * @returns {slick object | {} }
     * @private
     */
    ds2HotspotExtended.prototype._initLayerSlider = function () {
      var self = this,
        $slider = self.$hotspotLayerWrapper.find(self.options.hotspotLayerSlider);

      $slider.on('init', function (elem) {
        self._initIScroll();
      });

      // used for tracking
      $slider.on('click', 'button.slick-next, button.slick-prev', function () {
        self.pEventState.eventInfo.element = 'Arrow';
      });
      $slider.on('swipe', function () {
        self.pEventState.eventInfo.element = 'Other';
      });

      $slider.on('afterChange', function (e, slick, currentSlide) {
        self._videoplayerControl(self.evt.videoStopAll);

        if (self.viewport !== self.evt.viewportLarge) {
          self._refreshIScroll();
        }

        // used for tracking
        var $activeSlide = slick.$slides.filter('.slick-active');
        var hotspotTrackingData = self._getHotspotTrackingData($activeSlide);
        self._updatePEventState('ds2-hse--layer-open', hotspotTrackingData);
      });

      // Prevent playing a video when swiping over a slide that contains a videocontainer
      if (self.$component.find(self.options.videoItems).length) {
        self._addSwipeEvents();
      }
      // hide layer on close button click
      self.$component.find(self.options.hotspotLayerClose).on('click', function (e) {
        self._hideLayerSlider();
      });

      // listen on ESC key code and hide layer slider on keyup
      $(document).keyup(function (e) {
        if (e.keyCode === 27) self._hideLayerSlider();
      });

      // listen for click on dim layer and hide layer slider on click
      self.$hotspotDimLayer.on('click', self._hideLayerSlider.bind(self));

      // initialize the slick object
      $slider.slick(self.options.slickLayerSliderOptions);
      return $slider;
    };

    /**
     * initialization of the additional overview slider
     * @returns {slick object | {} }
     * @private
     */
    ds2HotspotExtended.prototype._initOverviewSlider = function () {
      var self = this,
        $slider = self.$component.find(self.options.hotspotOverviewSlider);

      // clone all hotspot keyvisual elements and use only img inside (remove video markup)
      self.$hotspotLayers.find('.ds2-hse-layer--keyvisual').each(function (index) {
        var $keyvisual = $(this).clone().empty();
        $(this).find('img:first').clone().appendTo($keyvisual);
        $keyvisual.attr('data-tooltip-index', index);
        $keyvisual.appendTo($slider);
      });

      $slider.on('click', '.slick-slide', function (e) {
        var $currentSlide = $(e.currentTarget);
        var tooltipIndex = $currentSlide.data('tooltip-index');
        var slickIndex = $currentSlide.data('slick-index');
        var $currentTooltip = $(self.$hotspotTooltips[tooltipIndex]);

        $slider.find('.hotspot-active').removeClass('hotspot-active');
        $currentSlide.addClass('hotspot-active');

        if (self.$component.hasClass('ds2-hse--using-overview-slider') && (self.viewport !== self.evt.viewportLarge)) {
          self.$hotspotTooltips.hide();
        }

        // show the corresponding hotspot and label
        $currentTooltip.show();
        if ($currentSlide.closest('.ds2-hse-overview--slider').length && !self.$component.hasClass('ds2-hse--layer-open')) {
          $currentTooltip.trigger('click');
        } else {
          $currentTooltip.trigger('click.correspondingClick');
        }

        if ($slider.slick(self.evt.sliderCurrentSlide) !== slickIndex) {
          $slider.slick(self.evt.sliderGoTo, slickIndex);
        }

        if (self.$component.hasClass(self.options.hotspotLayerOpenClass)) {
          self.$layerSlider.slick(self.evt.sliderGoTo, slickIndex);
        }
      });

      $slider.on('init', function () {
        if (self.$component.hasClass('ds2-hse--using-overview-slider') && (self.viewport !== self.evt.viewportLarge)) {
          setTimeout(function () {
            $slider.find('.slick-slide:not(".slick-cloned"):first').trigger('click');
          }, 666);
        }
      });

      // make sure current hotspot is selected within overview slider
      $slider.on('afterChange', function (event, slick, currentSlide) {
        $slider.find('.slick-slide[data-slick-index="' + currentSlide + '"]').trigger('click');
      });

      // sync slider
      self.$layerSlider.slick('slickSetOption', 'asNavFor', $slider, true);

      $slider = $slider.slick(self.options.slickOverviewSliderOptions);
      return $slider;
    };

    /**
     * Resize the main slider with all content elements and iscroll instances within the slides
     * @private
     */
    ds2HotspotExtended.prototype._resizeSlider = function () {
      var self = this;

      self._setLayerContentHeight();
      self.$layerSlider.slick('resize');

      // position the prev and next button of the slider
      self.$component.find('.ds2-hse-slider-prev, .ds2-hse-slider-next')
        .css('top', self.$component.find(self.options.hotspotLayerKeyvisual).height());

      if (self.viewport !== self.evt.viewportLarge) {
        setTimeout(function () {
          // position the pagination at the bottom of the keyvisual image
          self.$layerSlider.find(self.options.hotspotSliderDots)
            .css('top', self.$component.find(self.options.hotspotLayerKeyvisual)[0].getBoundingClientRect().bottom);
        }, 100);
      }

      self._refreshIScroll();
    };

    ds2HotspotExtended.prototype._setLayerContentHeight = function () {
      var self = this;

      // get dimensions
      var wrapperHeight = self.$component.find(self.options.hotspotLayerWrapper).height(),
        imageHeight = self.$component.find(self.options.hotspotLayerKeyvisual).height(),
        contentMargin = parseInt(self.$component.find(self.options.hotspotLayerContent).css('marginTop'))
          + parseInt(self.$component.find(self.options.hotspotLayerContent).css('marginBottom')),
        sumContentHeight = (wrapperHeight - imageHeight - contentMargin);

      // set dimensions
      if (self.viewport === self.evt.viewportLarge) {
        self.$component.find(self.options.hotspotLayer).each(function () {
          $(this).find(self.options.hotspotLayerContent).css({'max-height': sumContentHeight});
        });
      } else {
        self.$component.find(self.options.hotspotLayer).each(function () {
          $(this).find(self.options.hotspotLayerContent).css({'max-height': ''});
        });
      }
    };

    /**
     * Show the main layer slider
     * @private
     */
    ds2HotspotExtended.prototype._showLayerSlider = function (labelId) {
      var self = this,
        labelText;

      $('body').addClass(self.options.hotspotLayerIndicatorClass);
      self._resizeSlider();

      // Show the layer
      self.$component.addClass(self.options.hotspotLayerOpenClass);
    };

    /**
     * Hide the main layer slider
     * @private
     */
    ds2HotspotExtended.prototype._hideLayerSlider = function () {
      var self = this;

      self._videoplayerControl(self.evt.videoStopAll);

      // Hide the layer
      $('body').removeClass(self.options.hotspotLayerIndicatorClass);
      self.$component.removeClass(self.options.hotspotLayerOpenClass);
    };

    /**
     * Prevents playing a video when swiping over a slide that contains a videocontainer
     * @private
     */
    ds2HotspotExtended.prototype._addSwipeEvents = function () {
      var self = this,
        $videoItems = self.$component.find(self.options.videoItems),
        dist, startX;

      $videoItems.on('touchstart', function (event) {
        var touchobj = event.originalEvent.changedTouches[0];
        dist = 0;
        startX = touchobj.pageX;
      });

      $videoItems.on('touchend', function (event) {
        var touchobj = event.originalEvent.changedTouches[0];
        dist = touchobj.pageX - startX;

        if (dist > 20) {
          self.$layerSlider.slick(self.evt.sliderPrev);
        } else if (dist < -20) {
          self.$layerSlider.slick(self.evt.sliderNext);
        }
      });
    };

    /**
     * Controls certain video elements
     * @param controlCommand
     * @private
     */
    ds2HotspotExtended.prototype._videoplayerControl = function (controlCommand) {
      var self = this;
      switch (controlCommand) {
        case self.evt.videoStopAll:
          self.$component.trigger('stopAllVideos');
          break;
        default:
      }
    };

    /**
     * iScroll initialization for every content element depending on the viewport
     * @private
     */
    ds2HotspotExtended.prototype._initIScroll = function () {
      var self = this;

      // reset all iscroll instances
      if (self.iscroll) {
        $.each(self.iscroll, function (i, obj) {
          obj.destroy();
        });
        self.iscroll = null;
      }

      // initialization
      self.iscroll = [];

      switch (window.digitals2.main.mediaQueryWatcherCheck()) {
        case self.evt.viewportLarge:
          var $hotspotLayerContent = self.$component.find(self.options.hotspotLayerContent);
          $hotspotLayerContent.each(function (i) {
            self.iscroll.push(new IScroll($hotspotLayerContent[i], self.options.iscrollOptions));
          });
          break;
        case self.evt.viewportMedium:
          self.iscroll.push(new IScroll(self.$hotspotLayerWrapper[0], self.options.iscrollOptions));
          break;
        default:
        // no iScroll content
      }
    };

    ds2HotspotExtended.prototype._refreshIScroll = function () {
      var self = this;

      if (self.iscroll !== undefined && self.iscroll !== null) {
        $.each(self.iscroll, function (i, obj) {
          obj.refresh();
        });
      }
    };

    /**
     * Treatment when changing the window size
     * @param viewport [ds2ResizeSmall ds2ResizeMedium ds2ResizeLarge]
     * @private
     */
    ds2HotspotExtended.prototype._onResize = function (viewport) {
      var self = this;

      if (viewport !== self.viewport) {
        self._initIScroll();
      }
      self.viewport = viewport;

      if (viewport === 'ds2ResizeLarge') {
        self.$hotspotTooltips.show();
      } else {
        self.$hotspotTooltips.hide();
        if (self.$overviewSlider.find('.slick-slide.hotspot-active').length) {
          self.$overviewSlider.find('.slick-slide.hotspot-active').trigger('click');
        }
      }

      // make sure tooltips are visible if less then 4 layers/hotspots exist
      if (self.$hotspotLayers.length < 4) {
        self.$hotspotTooltips.show();
      }

      // prevent small screens (mobile/tablet) from hidding the tooltip
      var tooltipHideEvent = viewport === 'ds2ResizeLarge' ? 'mouseleave' : '';
      self.$hotspotTooltips.each(function () {
        $(this).qtip('api').set('hide.event', tooltipHideEvent);
      });

      self._resizeSlider();
    };

    /**
     * Creates an tracking event object
     * @returns {{eventInfo: {eventName: string, eventAction: string, eventPoints: string, timeStamp: string, target: string, cause: string, effect: string}, category: {primaryCategory: string, mmdr: string, eventType: string}, attributes: {relatedPageName: string, relatedPageCategory: string, relatedComponent: {componentInfo: string, category: string, attributes: string}}}}
     * @private
     */
    ds2HotspotExtended.prototype._getTrackingEvent = function () {
      var self = this;

      return {
        eventInfo: {
          eventName: '',
          eventAction: '',
          eventPoints: '',
          timeStamp: Date.now().toString(),
          target: '',
          cause: '',
          effect: '',
          element: ''
        },
        category: {
          mmdr: '',
          eventType: ''
        },
        attributes: {
          videoLength: '',
          relatedComponent: {
            componentInfo: '',
            category: '',
            attributes: ''
          }
        }
      };
    };

    /**
     * Retrieves the tracking data from current hotspot
     * @param $currentHotspotLayer - jQuery element with the current hotspot slide
     * @returns {{label, hotspotHeadline, slideNum: *}}
     * @private
     */
    ds2HotspotExtended.prototype._getHotspotTrackingData = function ($currentHotspotLayer) {
      var $currentHseComponent = this.$component;
      var index = $currentHotspotLayer.index();

      return {
        eventName: $currentHseComponent.find('label[for="' + $currentHotspotLayer.data("id") + '"]').text(),
        hotspotHeadline: $currentHotspotLayer.find('.ds2-cms-output > h3').text(),
        slideNum: index || index + 1,
        tooltipElement: ($currentHseComponent.hasClass('ds2-hse--using-overview-slider') && (this.viewport !== this.evt.viewportLarge)) ? 'Image' : 'Hotspot'
      };
    };

    /**
     * Updates the tracking event object
     * @param {string} event - is 'ds2-hse--layer-open' or 'ds2-hse--tooltip-open'
     * @param {string} eventName - e.g. label text
     * @param {string} hotspotHeadline - headline of current open slide
     * @param {string} slideNum - 1-based slide index
     * @private
     */
    ds2HotspotExtended.prototype._updatePEventState = function (event, hotspotTrackingData) {
      var self = this;

      if (event === 'ds2-hse--layer-open') {
        self.pEventState.eventInfo.eventAction = 'Open layer';
        self.pEventState.eventInfo.element = 'Text Link'
      } else if (event === 'ds2-hse--tooltip-open') {
        self.pEventState.eventInfo.eventAction = 'Open tooltip';
        self.pEventState.eventInfo.element = hotspotTrackingData.tooltipElement;
      }
      self.pEventState.eventInfo.eventName = hotspotTrackingData.eventName;

      self.pEventState.compTracking = {
        attributes: {
          hotspotHeadline: hotspotTrackingData.hotspotHeadline,
          hotspotPosition: hotspotTrackingData.slideNum
        }
      };

      self.$component.trigger(event, self.pEventState);
    };


    return ds2HotspotExtended;
  });
