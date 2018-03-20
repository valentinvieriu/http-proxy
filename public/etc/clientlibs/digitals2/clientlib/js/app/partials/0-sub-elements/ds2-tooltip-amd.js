/**
 * sub: tooltip
 * author:  martin, patrick
 * refactoring: NC / Thu Jan 19, 2017
 */

define( 'ds2-tooltip', [
  'use!jquery', 
  'use!jquery-qtip',
  'use!iscroll',
  'use!velocity',
    'ds2-main'
], function( $ ) {
    
    var ds2Tooltip = function(element) {
        var self = this;
        self.options = {
            topOffset: 16,
            topOffsetMobileTablet: 28,
            bottomOffset: 0,
            bottomOffsetMobileTablet: 8
        };
        self.$element = $(element);
        self._body = $('body');
        //ATTENTION: BMWST-3197: on touch devices we need higher buttons and these need a different offset
        if ($('html').hasClass('touch')) {
            self.options.topOffset = self.options.topOffsetMobileTablet;
            self.options.bottomOffset = self.options.bottomOffsetMobileTablet;
        }
        self.options.dynamicTopOffset = parseInt(self.$element.css('line-height')) || self.options.topOffset;
        self.iscroll;
        self.lastPosition = '';
        self._checkForFullscreen();
        self._setDeviceValues();
        self._initTooltips();
        // on resize
        $(window.digitals2.main).on('ds2ResizeSmall ds2ResizeMedium ds2ResizeLarge', self, self._onResize);
    }

    Proto = ds2Tooltip.prototype;

    Proto._setDeviceValues = function() {
      var self = this;
      switch (window.digitals2.main.mediaQueryWatcherCheck()) {
        case 'ds2ResizeSmall':
          self.isMobile = true;
          self.isTablet = false;
          self.fullscreenMode = true;
          break;
        case 'ds2ResizeMedium':
          self.isTablet = true;
          self.isMobile = false;
          self.fullscreenMode = false;
          break;
        default:
          self.isMobile = false;
          self.isTablet = false;
          self.fullscreenMode = false;
          break;
      }
    }

    Proto._initTooltips = function() {
     
      var self = this,
          options = this.options,
          $element = this.$element;

      var dataTooltipId = $element.data('tooltip-id'),
          $tooltip = $('.ds2-tooltip-element[data-id="' + dataTooltipId + '"]'),
          $toolTipContainer = $(document),
          tooltipPosition = $element.data('position'),
          tooltipOpenByDefault = $tooltip.data('open-default'),
          tooltipShowReady = false,
          tooltipOpenOnClick = $element.data('open-onclick'),
          tooltipType = $('.ds2-icon', $element).data('tooltip-type'),
          showObject,
          hideObject,
          newMy,
          newAt,
          newOffsetY,
          newOffsetX = (tooltipPosition === 'top-center') ? 0 : 10, // define x offsets
          newViewport = (tooltipPosition === 'top-center') ? '' : $toolTipContainer, // don't use container for top-center
          tipOffset;
          if(!tooltipType) {
            tooltipType = $element.data('tooltipType');
          }
      self.tooltipId = dataTooltipId;
      // define offsets and positions
      switch (tooltipPosition) {
        case 'top-center':
          newMy = 'bottom center';
          newAt = 'top center';
          newOffsetY = options.bottomOffset;
          break;
        default:
          switch (tooltipType) {
            case 'spotlight':
              newMy = 'center left';
              newAt = 'center right';
              newOffsetY = options.bottomOffset;
              break;
            case 'needanalyzer-sharing-medium-down':
              newMy = 'bottom right';
              newAt = 'top right';
              newOffsetY = 14;
              newOffsetX = -15;
              tipOffset = 15;
              break;
            case 'needanalyzer-sharing-large':
              newMy = 'left top';
              newAt = 'right top';
              newOffsetY = 40;
              tipOffset = 35;
              break;
            default:
              newMy = 'left top';
              newAt = 'right top';
              newOffsetY = options.dynamicTopOffset;
              break;
          }
          break;
      };

      showObject = {
        solo: true,
        ready: tooltipShowReady // Show the tooltip when ready
      };

      hideObject = {
        event: 'unfocus',
        fixed: true,
        delay: 300
      };

      if (tooltipOpenByDefault) {
        tooltipShowReady = true;
        hideObject = {
          event: 'click'
        };
      };

      if (tooltipOpenOnClick || self.fullscreenMode) { // click event on all tooltips when mobile
        showObject = {
          solo: true,
          event: 'click',
          ready: tooltipShowReady // Show the tooltip when ready
        };
      };

      self.content = $tooltip;

      if (tooltipType != 'spotlight' && (!self.isTablet || !self.isMobile)) { // don't init when spotlight and <= tablet
        
        $element.qtip({ // Grab some elements to apply the tooltip to
          overwrite: true,
          content: {
            // text: $tooltip.wrapAll('<div>').parent().html() //tooltipContent
            text: $tooltip //tooltipContent
          },
          style: {
            tip: {
              corner: true,
              width: 20,
              height: 10,
              offset: tipOffset
            }
          },
          position: {
            viewport: newViewport,
            my: newMy,
            at: newAt,
            adjust: {
              y: newOffsetY,
              x: newOffsetX
            }
          },
          show: showObject,
          hide: hideObject,
          events: {
            show: function(event, api) {
              var qtip = $('.qtip');
              qtip.css('opacity', 0);
              qtip.velocity('stop').velocity({opacity: 1},{duration: 250, complete: function() {
                qtip.css('opacity', '');
              }});
            },
            move: function(event, api) {
              var position = api.position.my.x + '_' + api.position.my.y;
              if (self.lastPosition !== position) { //api.cache.posClass) {
                self.lastPosition = position; //api.cache.posClass;
                self._repositionTooltipCorner(position);//api.cache.posClass);
              }
            },
            hide: function(event, api) {
              $element.qtip('option', 'show.ready', false);
              $element.qtip('option', 'hide.fixed', true);
              $element.qtip('option', 'hide.delay', 300);
              self._body.removeClass('no-scroll');
            },
            visible: function(event, api) {
              self._checkForFullscreen();
              if (self.fullscreenMode) { // prevents body scrolling (double scrollbars) on full width tooltips
                self._body.addClass('no-scroll');
              }
              self._buildFullSize($tooltip, self.fullscreenMode); // build fullsize tooltip for mobile
            }
          }
        });
      }
      $('.ds2-tooltip-element--close a, .qtip-close', self.content)
        .unbind()
        .bind('click', $element, self._onCloseClick);
    }
    /*********************************************************
     *                  EVENT LISTENER                       *
     * *******************************************************/
    Proto._onCloseClick = function(event) {
      var tooltip = event.data,
          pId = $(tooltip).data('tooltip-id'),
          pTooltips = $("[data-tooltip-id='" + pId + "']");
      event.preventDefault();
      pTooltips.qtip('hide');
    }
    Proto._onResize = function(event) {
        var self = event.data,
            $element = self.$element,
            dataTooltipId = $element.data('tooltip-id'),
            tooltipType = $element.data('tooltip-type'),
            $tooltip = $('.ds2-tooltip-element[data-id="' + dataTooltipId + '"]');
        self._setDeviceValues();
        self._checkForFullscreen();
        if (tooltipType === 'spotlight' && (self.isTablet || self.isMobile)) {
            $element.qtip('hide');
        } else {
            self._buildFullSize($tooltip, self.fullscreenMode);
        }
        if (tooltipType === 'needanalyzer-sharing-large' && (self.isTablet || self.isMobile)) {
            $('.ds2-tooltip[data-tooltip-type="needanalyzer-sharing-large"]').qtip('hide');
        }
        if (tooltipType === 'needanalyzer-sharing-medium-down' && (!self.isTablet && !self.isMobile)) {
            $('.ds2-tooltip[data-tooltip-type="needanalyzer-sharing-medium-down"]').qtip('hide');
        }
        if (self.fullscreenMode && $tooltip.closest('.qtip').hasClass('qtip-focus')) { // prevents body scrolling (double scrollbars) on full width tooltips
            self._body.addClass('no-scroll');
        }
        else if ($tooltip.closest('.qtip').hasClass('qtip-focus')) {
            self._body.removeClass('no-scroll');
            $element.qtip('reposition');
        }
    }
    Proto._buildFullSize = function(tooltip, fullscreenMode) {
      var $tooltip = tooltip,
          $tooltipBody = $('.ds2-tooltip-element--body', $tooltip),
          $topElement = $('.ds2-tooltip-element--close', $tooltip),
          $bottomElement = $('.ds2-tooltip-element--footer', $tooltip),
          offsetTop = $('html').offset().top,
          offsetBottom = 31, // bottom offset when no buttons are shown
          viewportHeight = $(window).outerHeight(), // height of viewport
          topHeight = $topElement.length ? $topElement.outerHeight() : 0, // height of close button
          bottomHeight = $bottomElement.length ? $bottomElement.outerHeight() : offsetBottom, // height of footer/buttons
          resultHeight = viewportHeight - (topHeight + bottomHeight); // get the actual height
      $tooltip.each(function() {
        var closest = $tooltip.closest('.qtip-default');
        if (fullscreenMode) {
          $tooltipBody.height(resultHeight);
          closest.addClass('qtip-inFullscreenMode');
        } else {
          // reset height when resize back to desktop
          $tooltipBody.height('auto');
          closest.removeClass('qtip-inFullscreenMode');
        }
      });
    }
    Proto._repositionTooltipCorner = function(position_) {
      var self = this,
          options = self.options,
          $element = self.$element,
          tooltipType = $element.data('tooltip-type');
      setTimeout(function() {
        switch (position_) {
          case 'left_top':
            $element.qtip('option', 'style.tip.mimic', 'left center');
            $element.qtip('option', 'style.tip.offset', 40);
            if (tooltipType != 'spotlight') $element.qtip('option', 'position.adjust.y', options.topOffset);
            if (tooltipType != 'infoIcon') $element.qtip('option', 'position.adjust.y', options.dynamicTopOffset);
            break;
          case 'left_bottom':
            $element.qtip('option', 'style.tip.mimic', 'left center');
            $element.qtip('option', 'style.tip.offset', 40);
            $element.qtip('option', 'position.adjust.y', options.bottomOffset);
            break;
          case 'right_top':
            $element.qtip('option', 'style.tip.mimic', 'right center');
            if (tooltipType != 'needanalyzer-sharing') $element.qtip('option', 'style.tip.offset', 40);
            if (tooltipType != 'spotlight' && tooltipType != 'needanalyzer-sharing-large') $element.qtip('option', 'position.adjust.y', options.topOffset);
            if (tooltipType != 'infoIcon' && tooltipType != 'needanalyzer-sharing-large') $element.qtip('option', 'position.adjust.y', options.dynamicTopOffset);
            if (tooltipType == 'needanalyzer-sharing-large') {
              $element.qtip('option', 'style.tip.offset', 35);
              $element.qtip('option', 'position.adjust.y', 40);
            } 
            break;
          case 'right_bottom':
            $element.qtip('option', 'style.tip.mimic', 'bottom center');
            if (tooltipType == 'needanalyzer-sharing-medium-down') {
              $element.qtip('option', 'position.adjust.y', 14);
              $element.qtip('option', 'position.adjust.x', -15);
              $element.qtip('option', 'style.tip.offset', 15);
            } 
            // $element.qtip('option', 'style.tip.offset', 15);
            // $element.qtip('option', 'position.adjust.y', options.bottomOffset);
            break;
          case 'left_center':
          case 'right_center':
            $element.qtip('option', 'style.tip.mimic', false);
            $element.qtip('option', 'style.tip.offset', 0);
            break;
        }
      }, 1);
    }
    Proto._createIScroll = function(scrollbar) {
        
        var self = this;
        var ds2TooltipElementCopy = $('.ds2-tooltip-element--copy', self.content),
            ds2TooltipElementCopyCF = ds2TooltipElementCopy.children().first(),
            ds2TooltipElementBody   = $('.ds2-tooltip-element--body', self.content),
            ds2TooltipElementBodyCF = ds2TooltipElementBody.children().first();
        
        var options = self.options,
            $element = self.$element,
            pTotalHeight = 0,
            pBodyHeight = ds2TooltipElementBody.height(),
            pMarginTop = 0,
            pFirstElement = 0;
        ds2TooltipElementCopy.attr('id', 'scroll-tooltip-id-' + self.tooltipId);
        if ( ds2TooltipElementBody && ds2TooltipElementBodyCF && ds2TooltipElementBodyCF.is('img')) {
            pFirstElement = ds2TooltipElementBodyCF;
            pTotalHeight = pFirstElement.height();
        }      
      
        if ( ds2TooltipElementCopy && ds2TooltipElementCopyCF && ds2TooltipElementCopyCF.css('marginTop')) {
            pMarginTop = parseInt( ds2TooltipElementCopyCF.css('marginTop').replace('px', ''));
        }
        ds2TooltipElementCopyCF.children().each( function() {
            pMarginTop = pMarginTop + parseInt($(this).css('marginTop').replace('px', ''));
            pTotalHeight = pTotalHeight + $(this).height() + parseInt(pMarginTop);
        });
        if (self.fullscreenMode) {
            pBodyHeight = ds2TooltipElementBody.height();
            ds2TooltipElementCopy.css({height: 0, overflow: 'scroll'});
            pTotalHeight = ds2TooltipElementCopy.prop('scrollHeight');
            ds2TooltipElementCopy.css({height: '100%', overflow: 'hidden'});
        }
        if ( ds2TooltipElementCopy.length ) {
            if(pBodyHeight < pTotalHeight) {
                ds2TooltipElementBody.addClass('ds2-iscroll-container');
                ds2TooltipElementCopy.addClass('ds2-iscroll-content');
                self.iscroll =  new IScroll('#' + 'scroll-tooltip-id-' + self.tooltipId, {
                    mouseWheel: true,
                    click: true,
                    tap: true,
                    bounce: false,
                    momentum: true,
                    scrollbars: scrollbar,
                    probeType: 1,
                    interactiveScrollbars: true
                });
            }
            else {
                ds2TooltipElementBody.removeClass('ds2-iscroll-container');
                ds2TooltipElementCopy.removeClass('ds2-iscroll-content');
            }
        }
    }
    Proto._checkForFullscreen = function() {
      var self = this,
          $element = self.$element,
          tooltipType = $element.data('tooltip-type'),
          tooltipPosition = $element.data('position'),
          tooltipType = $element.data('tooltip-type'),
          dataTooltipId = $element.data('tooltip-id'),
          $tooltip = $('.ds2-tooltip-element[data-id="' + dataTooltipId + '"]'),
          documentwidth = $(document).width(),
          tooltipwidth = $tooltip.width() + 12 + 40, //tooltip width incl paddings and tip
          elementwidth = $element.width(),
          elementposition = $element.offset(),
          elementpositionfromleft = elementposition.left,
          elementpositionfromright = documentwidth - elementwidth - elementpositionfromleft,
          elementisleft = false,
          elementisright = false;
      tooltipwidth = (tooltipwidth > 410) ? 410 : tooltipwidth;
      if (tooltipPosition == 'top-center') {
        tooltipwidth = $tooltip.width() / 2;
        elementpositionfromleft = elementpositionfromleft + elementwidth / 2;
        elementpositionfromright = documentwidth - elementpositionfromleft;
        (elementpositionfromleft > elementpositionfromright) ? elementisright = true : elementisleft = true;
        tooltipwidth = (tooltipwidth > 205) ? 205 : tooltipwidth;
      }
      if ((tooltipType != 'spotlight') &&
        (tooltipPosition != 'top-center') &&
        (elementpositionfromleft <= tooltipwidth) &&
        (elementpositionfromright <= tooltipwidth)) {
        //change tooltip to fullscreen version
        self.fullscreenMode = true;
      }
      else if ((tooltipType != 'spotlight') &&
        (tooltipPosition == 'top-center') &&
        ((elementisleft && (elementpositionfromleft <= tooltipwidth)) ||
          (elementisright && (elementpositionfromright <= tooltipwidth))
        )) {
        //change tooltip to fullscreen version
        self.fullscreenMode = true;
      }
      else if (!self.isMobile) {
        //change tooltip back to left/right version
        self.fullscreenMode = false;
      }
      if (self.iscroll) {
        self.iscroll.destroy();
        self.iscroll = null;
      }
      setTimeout(function() {
        self._createIScroll(true);
      }, 50);
    }
    return ds2Tooltip;
});
