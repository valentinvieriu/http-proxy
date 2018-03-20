/**
 * @partial: navigation-main
 * @author: nadine // TODO: find out any contacts. Who is this?
 *          Based on some research activities, probably:
 *           - full name: Nadine Reifenstahl
 *           - current team: none, a freelancer (past: Hi-Res)
 *           - e-mail: nadine@nr-inspire.de
 *
 * @description: // TODO: Please describe me ASAP,
 *                  but only when you know more about the context
 *                  and where / in which use-cases I am present!
 */
define('ds2-navigation-content-bar', ['use!jquery',
    'use!velocity',
    'use!iscroll',
    'ds2-main'], function($, velocity){
  var ds2NavigationContentBar = function(element){
    this.options = {
      asOverlay: false,
      contentBarStickyButtonClass: 'ds2-navigation-content-bar--buttons',
      contentBarClass: 'ds2-navigation-content-bar--button',
      flyoutContainerClass: 'ds2-navigation-content-bar--flyout-container',
      flyoutContentClass: 'ds2-navigation-content-bar--flyout',
      animationTime: 300
    };
    this.$element = $(element);
    this.isMobile = false;
    this.isTablet = false;
    this.wheelCounter = 0; // TODO: not used anywhere, probably legacy variable?
    this._create();
  };
  Object.assign(ds2NavigationContentBar.prototype, {
    _create: function() {
      var self = this,
          options = this.options,
          $element = this.$element;
      self._setDeviceValues();
      self._createFlyout();
      self._setContentBarSubnavHeight();
      // on resize
      $(window.digitals2.main).on('ds2ResizeSmall ds2ResizeMedium ds2ResizeLarge ds2ResizeLargeNavi ds2ResizeMediumNavi ds2ResizeSmallNavi', self, self._onResize);
      self._createIScroll(true);
      $element.sticky(
        {
          className: 'ds2-is-sticky-wrapper',
          wrapperClassName: 'ds2-sticky-wrapper',
          topSpacing: 0
        }
      );
      $element.bind('sticky-start', self, self._onStickyStart);
      $element.bind('sticky-end', self, self._onStickyEnd);
      $('.' + options.contentBarClass, $element).bind('click', self, self._onContentBarClick);
      $('.' + options.contentBarClass + ' a', $element).bind('click', self, self._onContentBarLinkClick);
      $(window).bind('scroll touchmove', self, self._onScroll);
      $(document).bind('salesbar:click', function(pEvent) {
        self._closeAll();
      });
      $(document).bind('click', function(pEvent) {
        var pTarget = $(pEvent.target),
            pTargetElementIsLi = pTarget.is('li'),
            pTargetIsInBar = pTarget.closest('.ds2-navigation-content-bar--content').length > 0;
        if (!pTargetElementIsLi && !pTargetIsInBar) {
          self._closeAll();
        }
      });
      //To set position:relative initially BMWST-2728
      $element.sticky('update');
    },
    _createIScroll: function(mousewheel) {
       var self = this,
          options = this.options,
          $element = this.$element;
      $('.ds2-navigation-content-bar--flyout-container-box', $element).addClass('ds2-iscroll-container');
      $('.ds2-navigation-content-bar--flyout-container', $element).addClass('ds2-iscroll-content');
      self.iscroll = new IScroll('.ds2-navigation-content-bar--flyout-container', {
        mouseWheel: mousewheel,
        scrollbars: false,
        click: true,
        tap: true,
        bounce: false,
        momentum: false,
        probeType: 1
      });
      if (mousewheel) {
        self._addIScrollEvents();
      }
    },
    _addIScrollEvents: function() {
      var self = this,
          options = this.options,
          $element = this.$element;
      self.iscroll
        .on('scrollEnd', function() {
          self._onScrollEnd();
        });
      self.iscroll
        .on('scrollStart', function() {
          self._onScrollStart();
        });
    },
    _setDeviceValues: function() {
      var self = this;
      switch (window.digitals2.main.mediaQueryWatcherCheck()) {
        case 'ds2ResizeSmall':
          self.isMobile = true;
          if (self.isSticky) {
            $('.ds2-show-for-all').addClass('ds2-arrow-padding');
          }
          break;
        case 'ds2ResizeMedium':
          self.isTablet = true;
          if (self.isSticky) {
            $('.ds2-show-for-all').addClass('ds2-arrow-padding');
          }
          break;
        default:
          self.isMobile = false;
          self.isTablet = false;
          break;
      }
    },
    _setContentBarSubnavHeight: function() {
     var self = this,
        options = this.options,
        $element = this.$element,
        pHeight = undefined,
        $contentBar = $('.ds2-navigation-content-bar--container', $element),
        endHeight = $(window).height() - $contentBar.height() - 40,
        activeHeight = $('.' + options.flyoutContainerClass, $element).height();
      if (!self.isSticky) {
        endHeight -= $('.ds2-navigation-main').height();
      }
      $('.ds2-navigation-content-bar--flyout-container').css({'display': 'block'});
      pHeight = $('.ds2-navigation-content-bar--flyout').height();
      $('.ds2-navigation-content-bar--flyout-container').css({'display': ''});
      if (pHeight != undefined && pHeight < endHeight)
        endHeight = pHeight;
      $('.' + options.flyoutContainerClass, $element)
        .css({
          height: endHeight
        });
    },
    _onScrollStart: function() {
      var self = this,
          options = this.options,
          $element = this.$element;
    },
    _onScrollEnd: function() {
      var self = this,
          options = this.options,
          $element = this.$element;
      if (self.iscroll.y <= self.iscroll.maxScrollY) {
      }
    },
    _animateContentIn: function($content, finishFunction) {
      var self = this,
          options = this.options,
          $element = this.$element;
      $content.css({
        height: ''
      });
      var endHeight = $content.height();
      $content.css({
        height: 0,
        overflow: 'hidden'
      });
      $content
        .velocity('stop')
        .velocity({
          height: endHeight
        }, options.animationTime, function() {
          if (finishFunction) {
            finishFunction();
          }
          $content.css({
            height: '',
            overflow: ''
          });
        });
    },
    _animateContentOut: function($content, finishFunction) {
      var self = this,
          options = this.options,
          $element = this.$element;
      $content.css({
        overflow: 'hidden'
      });
      $content
        .velocity('stop')
        .velocity({
          height: 0
        }, options.animationTime, function() {
          if (finishFunction) {
            finishFunction();
          }
          self.iscroll.refresh();
          $content.css({
            height: '',
            overflow: ''
          });
        });
    },
    _setStickyHeight: function() {
      var self = this,
          options = this.options,
          $element = this.$element;
      if (!$('.ds2-navigation-content-bar').hasClass('ds2-salesbar-only')) {
        $('.ds2-sticky-wrapper').css({
          height: $element.outerHeight()
        });
      }
    },
    _setContentBarHeight: function(event) {
      var self = this,
          options = self.options;
          contentBarHeight = 0;
           if (self.isMobile || self.isTablet) {
            contentBarHeight = 45;
          } else {
            contentBarHeight = 50;
          }
          if ( $('.ds2-navigation-content-bar').hasClass('ds2-salesbar-only') && $('.ds2-sticky-wrapper').hasClass('ds2-is-sticky-wrapper') ) {
            $('.ds2-salesbar-only').velocity('stop').velocity({height: contentBarHeight + 'px'}, options.animationTime);
          }
    },
    _closeContentBar: function() {
      var self = this,
          options = this.options,
          $element = this.$element,
          $flyoutContainer = $('.' + options.flyoutContainerClass, $element),
          $flyoutContent = $('.' + options.flyoutContentClass, $element);
      // hide Flyout
      $flyoutContainer.removeClass('ds2-flyout-open');
      var finishFunction = function() {
        $flyoutContainer.removeClass('ds2-flyout-show');
      };
      if ($('.ds2-navigation-content-bar--button').hasClass('ds2-show-last')) {
        $('.' + options.contentBarStickyButtonClass, $element).addClass('ds2-show-buttons');
        if (self.isTablet || self.isMobile) {
          $('.ds2-show-for-all').addClass('ds2-arrow-padding');
        }
      }
      self._animateContentOut($flyoutContent, finishFunction);
    },
    _openContentBar: function() {
      var self = this,
          options = this.options,
          $element = this.$element,
          $flyoutContainer = $('.' + options.flyoutContainerClass, $element),
          $flyoutContent = $('.' + options.flyoutContentClass, $element);
      // show flyout
      var finishFunction = function() {
        self.iscroll.refresh();
      };
      $flyoutContainer.removeClass('ds2-flyout-show').addClass('ds2-flyout-open ds2-flyout-show');
      if (self.isTablet || self.isMobile) {
        $('.' + options.contentBarStickyButtonClass, $element).removeClass('ds2-show-buttons');
      }
      $('.ds2-show-for-all').removeClass('ds2-arrow-padding');
      self._animateContentIn($flyoutContent, finishFunction);
    },
    _closeAll: function() {
      var self = this,
          options = self.options,
          $element = self.element,
          $flyoutContainer = $('.' + options.flyoutContainerClass, $element),
          $contentBar = $('.' + options.contentBarClass, $element);
      if ($flyoutContainer.hasClass('ds2-flyout-open')) {
        $contentBar.removeClass('ds2-content-bar-open');
        self._closeContentBar();
      }
    },
    /*********************************************************
     *                  EVENT LISTENER                       *
     * *******************************************************/
    _onResize: function(event) {
      var self = event.data,
          options = self.options,
          $element = self.element,
          changed = true,
          mousewheel = true;
      self._setDeviceValues();
      self._setContentBarSubnavHeight();
      self._setStickyHeight();
      self.iscroll.destroy();
      self._createIScroll(mousewheel);
      self._setContentBarHeight();
    },
    _onScroll: function(event) {
      var self = event.data;
      //self._closeAll();
    },
    _onStickyStart: function(event) {
      var self = event.data,
          options = self.options,
          $element = self.element;
          contentBarHeight = 0;
      self.isSticky = true;
      if (self.isMobile || self.isTablet) {
        contentBarHeight = 45;
      } else {
        contentBarHeight = 50;
      }
      if ($('.ds2-navigation-content-bar').hasClass('ds2-salesbar-only')) {
        $('.ds2-salesbar-only').velocity('stop').velocity({height: contentBarHeight + 'px'}, options.animationTime, function() {
          $('.ds2-navigation-content-bar--bar').css('display', 'block');
          $('.ds2-navigation-content-bar--buttons').css('display', 'block');
          $('.ds2-navigation-salesbar').trigger('ds2-navigation-salesbar--equalizeButtons');
        });
      }
      $('.' + options.contentBarStickyButtonClass, $element).addClass('ds2-show-buttons');
      $('.' + options.contentBarClass, $element).addClass('ds2-show-last');
      if (self.isTablet || self.isMobile) {
        $('.ds2-show-for-all').addClass('ds2-arrow-padding');
      }
      if (!$('.ds2-navigation-content-bar').hasClass('ds2-salesbar-only')) {
        $('.ds2-navigation-salesbar').trigger('ds2-navigation-salesbar--equalizeButtons');
      }
    },
    _onStickyEnd: function(event) {
      var self = event.data,
          options = self.options,
          $element = self.element;
      if ($('.ds2-navigation-content-bar').hasClass('ds2-salesbar-only')) {
        $('.ds2-navigation-content-bar--bar').css('display', 'none');
        $('.ds2-navigation-content-bar--buttons').css('display', 'none');
        $('.ds2-salesbar-only').velocity('stop').velocity({height: '0px'}, options.animationTime);
      }
      self.isSticky = false;
      $('.' + options.contentBarStickyButtonClass, $element).removeClass('ds2-show-buttons');
      $('.' + options.contentBarClass, $element).removeClass('ds2-show-last');
      $('.ds2-show-for-all').removeClass('ds2-arrow-padding');
      self._setStickyHeight();
    },
    _onContentBarClick: function(event) {
      var self = event.data,
          options = self.options,
          $element = self.element,
          $flyoutContainer = $('.' + options.flyoutContainerClass, $element),
          $flyoutContent = $('.' + options.flyoutContentClass, $element),
          hasHref = $(event.currentTarget).attr('href');
      if (hasHref && $(event.currentTarget).attr('href').length >= 1) {
        // go to link
      } else {
        event.preventDefault();
        event.stopPropagation();
        $(document).trigger('contentbar:click');
        if ($flyoutContainer.hasClass('ds2-flyout-open')) {
          $(event.currentTarget).removeClass('ds2-content-bar-open');
          self._closeContentBar();
        } else {
          $(event.currentTarget).addClass('ds2-content-bar-open');
          self._openContentBar();
        }
      }
    },
    _onContentBarLinkClick: function(event) {
      event.preventDefault();
      var self = event.data,
          options = self.options;
    },
    _onSublevelClickRef: function(event) {
        event.preventDefault();
        event.stopPropagation();
        var self = this,
            $currentTarget = $(event.currentTarget),
            $parent = $currentTarget.parent(),
            $sublevel = $('ul', $parent),
            currentHref = $currentTarget.attr('href'),
            finishFunction = undefined;
        if ($parent.hasClass('ds2-show-sublevel')) {
          finishFunction = function() {
            $parent.removeClass('ds2-show-sublevel');
          };
          self._setContentBarSubnavHeight();
          setTimeout(function() {
            self.iscroll.refresh();
          }, 0);
          self._animateContentOut($sublevel, finishFunction);
        }else {
          finishFunction = function() {
            setTimeout(function() {
              self.iscroll.refresh();
            }, 0);
          };
          $parent.addClass('ds2-show-sublevel');
          self._setContentBarSubnavHeight();
          setTimeout(function() {
            self.iscroll.refresh();
          }, 0);
          self._animateContentIn($sublevel, finishFunction);
       }
       if (!$currentTarget.hasClass('ds2-active-page')) {
        self._linkCheck(currentHref, $parent);
       }
     },
     _linkCheck: function(linkToFire, parent) {
       // this is a very dirty solution ,let's talk for a more stable logic
       if (!parent.hasClass('ds2-has-sublevel'))
       {
         if (linkToFire && linkToFire.length > 1) {
           window.location.href = linkToFire;
         }
       }
     },
    /*********************************************************
     *                 EVENT LISTENER END                    *
     * *******************************************************/
    /*********************************************************
     *                          FLYOUT                       *
     * *******************************************************/
    _createFlyout: function() {
      var self = this,
          options = this.options,
          $element = this.$element,
          $firstContentBar = $('.ds2-show-for-all', $('.' + options.contentBarClass, $element)).first(),
          $lastContentBar = $('.ds2-show-for-all', $('.' + options.contentBarClass, $element)).last(),
          activeMainLinkId = $('a', $lastContentBar).attr('data-main-link-id'),
          mainLinkId = $('a', $firstContentBar).attr('data-main-link-id'),
          pEvents = 'click',
          html_;

      $('.ds2-navigation-main--level-1 li', $('.ds2-navigation-main nav')).each(function(i, elm) {
          if ($(elm).attr('data-main-id') === mainLinkId) {
            // quick and dirty
            html_ = $($.parseHTML('<ul></ul>'));
            // get all li --> find the one having a sublevel
            $('> ul > li', $(elm)).each(function(j, subelm) {
              var clone_ = $(subelm).clone();
              var subclass_ = '';
              if ($('ul', clone_).length > 0) {
                subclass_ += 'ds2-has-sublevel';
                $('> a', clone_).addClass('ds2-icon ds2-icon--arrow-big-r-white');
              }
              if (clone_.attr('data-main-id') === activeMainLinkId) {
                subclass_ += ' ds2-is-active';

              }
              html_.append($($.parseHTML('<li class="' + subclass_ + '" data-main-link-id="' + $(subelm).attr('data-main-id') + '"></li>')).append(clone_.children()[0]));
            });
          }
      });

      $('.ds2-navigation-content-bar--content', $element).append(html_);
      if (/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream) {
        pEvents = 'touchend'; // fix for: BMWST-6803
      }
      $('.ds2-navigation-content-bar--content a', $element).on(pEvents, function(pEvent) {
        self._onSublevelClickRef(pEvent);
      });

      $('.ds2-navigation-content-bar--content a', $element).on('click', function(event) {
        event.preventDefault();
        event.stopPropagation();
        $(window).trigger('ds2-manual-click:ds2-navigation-content-bar', [$(this), event]);
      });
    }
  });
  return ds2NavigationContentBar;
});
