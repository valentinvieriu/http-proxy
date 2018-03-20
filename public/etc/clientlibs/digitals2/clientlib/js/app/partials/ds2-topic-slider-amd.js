define(
  'ds2-topic-slider',
  [
    'use!jquery',
    'ds2-image-lazyLoad-TopicSlider',
    //'imageLoader',
    'use!log',
    'use!jquery-slick',
    'use!velocity',
    'use!jquery-ui',
    'ds2-main'
  ],
  //TODO: imageLoader deactivated as this caused mobile images not to get displayed on page load (see TODOs further down).
  // function ($, imageLoader) {
  function ($, ds2imagelazyLoadTopicSlider, log, slick, velocity, $_ui, main) {

    'use strict';

    function constructor(component) {
      // set global available component
      // prefix with $ to mark as jQuery object
      var $component = $(component);
      // create empty object as namespace
      var self = {};

      self.options = {};

      self.options.navCause = null;
      self.options.slideCount = self.options.currentSlide = 1;

      self.options.AUTOMATIC = 'automatic';
      self.options.DEFAULT = 'default';
      self.options.CLICK = 'click';
      self.options.ICON = 'icon';
      self.options.SWIPE = 'swipe';
      self.options.IMAGE = 'Image';
      self.options.TOGGLE = 'Toggle Bar';
      self.options.ARROW = 'Arrow';
      self.options.OTHER = 'Other';


      // init lazy loading
      self.lazy = new ds2imagelazyLoadTopicSlider(component);


      _create();

      function _create() {
        _getDomElements();
        _getNextPrevButtons();
        _initSliderOptions();

        _initSlider();
        _initToggle();
        _initImagesAndHeights();
      }

      function _getDomElements() {
        self.$positionBar = $component.find('.ds2-slider--position-bar');
        self.$positionBarOuter = $component.find('.ds2-slider--position-bar-outer');
        self.$slider = $component.find('.ds2-slider--main');
        self.$sliderSlides = $component.find('.ds2-slider--slide');
        self.$toggleButtons = $component.find('.ds2-slider-toggle-button');

        self.$nextArrow = $component.find('.slick-next');
        self.$prevArrow = $component.find('.slick-prev');
      }

      function _initSlider() {
        var trackingEventRun = {};

        if (self.$sliderSlides.length > 1) {
          self.slickSlider = self.$slider.slick(self.slider.options);
          self.slickSlider.slick('setPosition');
          self.options.slideCount = self.slickSlider[0].slick.slideCount;

          _initPositionBar();
          _initClickableHalfs();

          self.slickSlider.on('swipe', function () {
            trackingEventRun.lastEventAction = self.options.IMAGE;
          });

          self.slickSlider.on('click', 'button', function () {
            trackingEventRun.lastEventAction = self.options.ARROW;
          });

          self.slickSlider.on('beforeChange', function (event, slick, currentSlide, nextSlide) {

            // lazy loading of the images on slider change

            var $self = $(slick.$slides[nextSlide]).find('[data-toggle-content="0"]');
            var $imgtoLoad = $self.find('img');

            // add images on the instance of lazy plugin
            self.lazy.instance.addItems($imgtoLoad);
            // trigger the load of the images
            self.lazy.instance.loadAll();

          });

          self.slickSlider.on('afterChange', function (event, slick, currentSlide) {
            self.options.currentSlide = currentSlide + 1;
            _initPositionBar();

            $component.trigger('stopAllVideos');

            //var trackObj = _createTrackingObj(trackingEventRun.lastEventAction);
            var trackObj = _createTrackingObj('');
            $component.trigger('ds2-topic-slider-interaction', trackObj);

            // reset navCause after trackObj has been built
            self.options.navCause = null;
          });

          $(window.digitals2.main).on('ds2ResizeLarge ds2ResizeMedium ds2ResizeSmall', function (event) {
            _initPositionBar();
            _initClickableHalfs();
          });

          if ($('.ds2-video-player', $component).length) {
            $('.ds2-video-player', $component)
              .on('ds2-video-player-play', function (event, trackObj) {
                trackObj.eventInfo.effect = "";
                trackObj.eventInfo.element = "";
                trackObj.eventInfo.eventPoints = self.options.currentSlide;
                trackObj.eventInfo.cause = $('.ds2-slider--slide.slick-active', $component).first().find('h1').first().text().trim();

                $component.trigger('ds2slider-play-video', trackObj);
              });
            _addSwipeEvents();
          }
        }
      }

      function _initSliderOptions() {
        self.slider = self.slider || {};
        self.slider.options = {
          adaptiveHeight: false,
          arrows: true,
          arrowsMedium: true,
          autoplay: self.$slider.hasClass('ds2-autoplay'),
          autoplaySpeed: 5000,
          centerMode: false,
          centerModeMedium: false,
          centerModeSmall: false,
          centerPadding: 0,
          centerPaddingSmall: 0,
          draggable: !self.interactionInAuthorDisabled,
          focusOnSelect: false,
          infinite: true,
          interactionInAuthorDisabled: self.$slider.hasClass('ds2-slider--swipe-disabled'),
          nextArrow: self.nextArrowHtml,
          pauseOnHover: true,
          prevArrow: self.prevArrowHtml,
          rtl: window.digitals2.main.isRTL,
          slidesToScroll: 1,
          slidesToShow: 1,
          speed: 500,
          swipe: !self.interactionInAuthorDisabled,
          zIndex: 120,
          lazyLoad: false
        };

        _showNavButtons();
      }

      function _initToggle() {
        $component.find('.ds2-slider-toggle-content[data-toggle-content="1"]')
          .css("position", "absolute")
          .velocity('stop')
          .velocity('fadeOut', {duration: 0});
        $component.find('.ds2-slider-toggle-content[data-toggle-content="0"]')
          .css("position", "relative")
          .velocity('stop')
          .velocity('fadeIn', {duration: 0});

        // used to trigger the load of the images on the design just on first click
        var revealD = true;

        // add click event
        self.$toggleButtons.on('click', function (event) {
          var $btn = $(this);
          var slideIndex = $btn.closest('.ds2-slider--slide').data('slide-no');
          var index = $btn.data('toggle-to');


          _toggleContent(slideIndex, index, revealD);

          if (index) {
            revealD = false;
          }

        });
      }

      function _initPositionBar() {
        if (self.options.slideCount > 1) {
          self.positionBarWidth = $('.slick-list', self.$slider).width() / self.options.slideCount;
          self.positionBarSpace = (self.options.currentSlide - 1) * self.positionBarWidth;
          if (window.digitals2.main.isRTL) self.positionBarSpace *= -1;
          self.$positionBar.css({
            'width': self.positionBarWidth + 'px',
            'transform': 'translateX(' + self.positionBarSpace + 'px)'
          });
        } else { // if no slides, remove position bar if exists
          if (self.$positionBarOuter) self.$positionBarOuter.remove();
        }
      }

      function _getNextPrevButtons() {
        if (self.$prevArrow[0] && self.$nextArrow[0]) {
          self.prevArrowHtml = self.$prevArrow[0].outerHTML;
          self.nextArrowHtml = self.$nextArrow[0].outerHTML;
        }
        self.$prevArrow.remove();
        self.$nextArrow.remove();
      }

      function _showNavButtons() {
        self.$slider.hover(function () {
          self.$slider.find('.slick-prev, .slick-next').css('opacity', 1);
        }, function () {
          self.$slider.find('.slick-prev, .slick-next').css('opacity', 0);
        });
      }

      function _initClickableHalfs() {
        if (!self.interactionInAuthorDisabled) {
          self.$slider.find('.ds2-slider--slide').on('click', function (e) {
            if ($(e.target).is('.ds2-slider-toggle-button') || $(e.target).is('.ds2-button--responsive-line')) {
              return;
            }
            if ($(e.target).closest('.ds2-video-player--play').length > 0 || $(e.target).closest('.ds2-video-player--player').length > 0) {
              return;
            }

            var $img = $('img', this);
            var x = e.pageX - $img.offset().left;
            var where = $img.width() / 2;

            var direction = x > where ? 'slickNext' : 'slickPrev';
            self.slickSlider.slick(direction);
          });
        }
      }

      function _toggleContent(slideIndex, index, revealD) {
        var trackObj;
        var triggerElement = self.options.TOGGLE;
        // because slick clones the slides
        // we need to toggle the content also
        // on the cloned slides

        // get the slides where we need to toggle
        // the content by slideIndex
        var $slidesToChange = $component.find('.ds2-slider--slide[data-slide-no="' + slideIndex + '"]');
        $slidesToChange.each(function () {
          var $slide = $(this);

          var $slideButtons = $slide.find('.ds2-slider-toggle-button');
          $slideButtons.toggleClass('active', false);
          $slideButtons.eq(index).toggleClass('active', true);

          var $allToggleContents = $slide.find('.ds2-slider-toggle-content').not("[data-toggle-content='" + index + "']");
          var $toggleContentToShow = $slide.find("[data-toggle-content='" + index + "']");
          // hide all toggle contents
          $allToggleContents
            .css("position", "absolute")
            .velocity('stop')
            .velocity('fadeOut', {duration: 750});
          $toggleContentToShow
            .css("position", "relative")
            .velocity('stop')
            .velocity('fadeIn', {duration: 750});

          if (revealD) {

            var $imgToLoad = $toggleContentToShow.find('img[data-ds2-lazy-load]');

            // add images on the instance of lazy plugin
            self.lazy.instance.addItems($imgToLoad);
            // trigger the load of the images
            self.lazy.instance.loadAll();

          }
        });

        trackObj = _createTrackingObj(triggerElement, index);

        $component.trigger('ds2-topic-slider-interaction', trackObj);
      }

      function _initImagesAndHeights() {
        // load images lazy wit the imageLoader
        // TODO: Deactivated as this caused mobile images not to get displayed on page load.
        // TODO: The imageLoader function did overwrite the custom function _loadImages() further down.
        // TODO: Check for better solution to handle lazy loading for Topic Slider.
        //imageLoader.initImages($component);

        // remove no-height classes
        // (these are used to prevent the slider from taking
        // more height then 1 slide before initialized)
        var $noHeights = $component.find('.ds2-slider--slide--no-height');
        if ($noHeights.length > 0) {
          $noHeights.toggleClass('ds2-slider--slide--no-height', false);
        }
      }

      function _addSwipeEvents() {
        var dist = 0, startX = 0;
        log('_addSwipeEvents');

        // swipe over video container on mobile (is position absolute so slider is not working anymore)
        $component.find('.ds2-slider--video-container').on('touchstart', function (event) {
          var touchobj = event.originalEvent.changedTouches[0];
          dist = 0;
          startX = touchobj.pageX;
        });

        $component.find('.ds2-slider--video-container').on('touchend', function (event) {
          var touchobj = event.originalEvent.changedTouches[0];
          dist = touchobj.pageX - startX;

          if (dist > 20) {
            log('show prev');
            self.slickSlider.slick('slickPrev');
          } else if (dist < -20) {
            log('show next');
            self.slickSlider.slick('slickNext');
          }
        });
      }

      function _createTrackingObj(triggerElement, index) {
        var currentInnerSlide = index || 0;
        var trackObj = {};
        var $activeSlide = $('.ds2-slider--slide.slick-active', $component).first();
        var pImage = $activeSlide.find('img');
        var pHeadline = $activeSlide
          .find("[data-toggle-content='" + currentInnerSlide + "'] h1")
          .first()
          .text()
          .trim();

        if (!isNaN(index)) {
          trackObj.currentSlide = self.options.currentSlide + "-" + (index + 1);
        } else {
          trackObj.currentSlide = self.options.currentSlide;
        }

        trackObj.effect = '';
        trackObj.target = '';
        trackObj.element = self.options.IMAGE;

        if (triggerElement) {
          trackObj.element = triggerElement;
        }

        if (pHeadline) {
          trackObj.target = pHeadline;
        }

        if (pImage.data('tracking-event') &&
          pImage.data('tracking-event').eventInfo &&
          pImage.data('tracking-event').eventInfo.eventName
        ) {
          trackObj.eventName = pImage.data('tracking-event').eventInfo.eventName;
        } else {
          trackObj.eventName = undefined;
        }

        trackObj.timeStamp = Date.now();

        // var deviceIndex = window.digitals2.responsivePlus.responsivePlusDeviceGet();
        // if (deviceIndex === 0) {
        //   trackObj.cause = self.options.CLICK;
        // } else {
        //   trackObj.cause = self.options.SWIPE;
        // }
        trackObj.cause = self.options.CLICK;
        if (navigator !== undefined) {
          if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|BB|PlayBook|IEMobile|Windows Phone|Kindle|Silk|Opera Mini/i.test(navigator.userAgent)) {
            trackObj.cause = self.options.SWIPE;
          }
        }
        return trackObj;
      }

    }

    var _loadImages = function (component) {
      var $component = $(component),
        $placeholders;
      $placeholders = $component.find('.ds2-image-loader--defer-image');
      $placeholders.each(function () {
        var $self = $(this);
        var $img = $self.find('img');
        var attrSrc = $img.attr('src');
        var dataImg = $img && $img[0] && $img[0].dataset && $img[0].dataset.img || null;

        // toggle classes when image loaded
        $img.one('load', function () {
          $self.toggleClass('is-loading', false);
          $self.toggleClass('is-loaded', true);

          // remove preloader
          $component.find('.ds2-image-loader--preloader-wrapper').velocity({opacity: 0}, {
            duration: 400, complete: function () {
              $(this).css({'display': 'none'});
            }
          });
          $component.find('.ds2-image-loader--preloader-content').velocity({opacity: 1}, {duration: 400});
        });

        // change img src
        // TODO: Deactivated as this caused mobile images not to get displayed on page load.
        // TODO: Check for a potential better solution to handle image loading (see comments on imageLoader further up).
        // if ((dataImg && !attrSrc) || (attrSrc !== dataImg)) {
        //     $img.attr('src', dataImg);
        // }
      });
    };

    var _addEvent = function (component) {
      // list to interchange event from foundation
      $(window).on('resize.fndtn.interchange', function () {
        setTimeout(function () {
          _loadImages(component);
        }, 10);
      });
    };

    var initImages = function (component) {
      _addEvent(component);
      _loadImages(component);
    };

    function init(component) {
      initImages(component);
      return constructor(component);
    }

    return {
      init: init
    };
  }
);
