/**
* @description: The purpose of this component is to find different items by topic (by checking some checkboxes)
*               or by alphabetical order.
*/

define( 'ds2-glossary-overview', [
    'use!jquery',
    'ds2-main'
], function( $ ) {

  var glossaryOverview = '.ds2-glossary-overview';

  var evt = {
    scrollTouchmove:                   'scroll touchmove',
    glossaryOverviewTracking:          'ds2-glossary-overview-tracking'
  };

  var sel = {
    glossaryOverviewCounter:           glossaryOverview + '--counter',
    glossaryOverviewFastlane:          glossaryOverview + '--fastlane',
    glossaryOverviewFastlaneButton:    glossaryOverview + '--fastlane-button',
    glossaryOverviewFilterButton:      glossaryOverview + '--filter-button',
    glossaryOverviewFilterContainer:   glossaryOverview + '--filter-container',
    glossaryOverviewHeadlineContainer: glossaryOverview + '--headline-container',
    glossaryOverviewItemContainer:     glossaryOverview + '--item-container',
    glossaryOverviewItems:             glossaryOverview + '--items',
    glossaryOverviewJSCounter:         glossaryOverview + '-js--counter',
    iconCheckboxChecked:               '.ds2-icon--checkbox-checked',
    iconCloseWhite:                    '.ds2-icon--close-white',
    labelCheckbox:                     '.ds2-label--checkbox',
    mainWrapper:                       '.ds2-main-wrapper',
    modelsJSLabelGroup:                '.ds2-models-js--label-group',
    navigationContentBar:              '.ds2-navigation-content-bar',
    pageWrapper:                       '.ds2-page--wrapper'
  };

  var cls = {
    iconCheckbox:                      'ds2-icon--checkbox',
    iconCheckboxChecked:               'ds2-icon--checkbox-checked',
    inactive:                          'ds2-inactive',
    active:                            'ds2-active'
  };


  var GlossaryOverview = function(element) {

    this.options = {
      isChecked: []
    };

    this.$element = $(element);

    this._create();
  };

  var proto = GlossaryOverview.prototype;

  proto._create = function() {
    var self = this,
        options = this.options;

    self.isMobile = false;
    self.isTablet = false;

    self._setDeviceValues();
    window.digitals2.main._equalheight();


    // events triggered on checkbox, fast lane and/or close icon button clicks
    // animation added for the mobile phone cases
    $(sel.modelsJSLabelGroup).off().on('click', function(e) {
      var clickedLabel = $(this).find('label'),

      clickedId = $(this).find('label').attr('for');
      self._filter(clickedLabel, clickedId);
    });

    $(sel.glossaryOverviewFastlaneButton).off().on('click', function(e) {
      self._fastlaneButtonClick();
    });

    $(sel.glossaryOverviewFilterButton).off().on('click', function(e) {
      self._filterButtonClick();
    });

    $(sel.iconCloseWhite).off().on('click', function(e) {
      self._filterButtonClick();
    });

    $(document).on('models:click', function(pEvent) {
      var offset = $(glossaryOverview).offset();
      if (self.isMobile == true) {
        var filterTop = offset.top + navHeight - 40;
        $(sel.glossaryOverviewFastlane).velocity({top: filterTop},{duration: 300});
      }
    });

    $(window.digitals2.main).on('ds2ResizeSmall ds2ResizeMedium ds2ResizeLarge ds2ResizeLargeNavi ds2ResizeMediumNavi ds2ResizeSmallNavi', self, self._onResize);
    $(window).on(evt.scrollTouchmove, self, self._onScroll);

    var itemsLength = $(sel.glossaryOverviewItemContainer).find(sel.glossaryOverviewItems);
    $(sel.glossaryOverviewCounter).text(itemsLength.length);

    // BWMST-3554
    // apply custom scrolling for ds2-glossary-overview--fastlane anchors
    var fastlaneAnchor = options.fastLane + ' a',
        href = '',
        contentBarHeight = 0,
        target = '';

    $(fastlaneAnchor).on('click', function(e) {
      e.preventDefault();

      href = $(this).attr('href');
      if ($(sel.navigationContentBar).length) {
        if (!self.isMobile && !self.isTablet)
          contentBarHeight = -50;
        else {
          contentBarHeight = -45;
        }
      }

      target = href.split('#').pop();

      $('#' + target).velocity('scroll', {
        duration: 500,
        offset: contentBarHeight,
        easing: 'ease-in-out'
      });
    });
  },

  // check the type of the device the site is running
  proto._setDeviceValues = function() {
    var self = this,
        options = this.options;

    switch (window.digitals2.main.mediaQueryWatcherCheck()) {
      case 'ds2ResizeSmall':
        self.isMobile = true;
        self.isTablet = false;
        window.digitals2.main._equalheight();
        break;

      case 'ds2ResizeMedium':
        self.isTablet = true;
        self.isMobile = false;
        window.digitals2.main._equalheight();
        self._removeFixedFastlane();
        break;

      default:
        self.isMobile = false;
        self.isTablet = false;
        window.digitals2.main._equalheight();
        self._removeFixedFastlane();
        break;
    }
  },

  // remove the fast lane on smaller devices (smart phones and tablets)
  proto._removeFixedFastlane = function() {
    var contentBar = 'ds2-no-content-bar';

    if ($(sel.mainWrapper).find(sel.navigationContentBar).length > 0) {
      contentBar = 'ds2-content-bar';
    }

    $(sel.glossaryOverviewFastlane).removeClass(contentBar).css('top', 'auto');
  },

  proto._onScroll = function(event) {
    var self = event.data,
        scroll = $(window).scrollTop(),
        fastlaneHeight = parseInt($(sel.glossaryOverviewFastlane).css('height')),
        $glossaryOverview = $(glossaryOverview),
        $glossaryOverviewFastlane = $(sel.glossaryOverviewFastlane),
        offset = $glossaryOverview.offset(),
        goHeight = $glossaryOverview.height(),
        bottom = offset.top + goHeight - fastlaneHeight,
        contentBar = 'ds2-no-content-bar',
        contentBarHeight = $(sel.navigationContentBar).height(),
        itemsHeight = $(sel.glossaryOverviewItemContainer).height(),
        margin = 5;

    if ($(sel.pageWrapper).find(sel.navigationContentBar).length > 0) {
      contentBar = 'ds2-content-bar';
    }

    if (self.isMobile) {
      if (scroll > offset.top - margin && itemsHeight > fastlaneHeight) {
        $glossaryOverviewFastlane.addClass(contentBar).css('top', contentBarHeight + 10 + 'px');
      } else if (itemsHeight < fastlaneHeight) {
        $glossaryOverviewFastlane.css('top', offset.top).removeClass(contentBar);
      } else {
        $glossaryOverviewFastlane.removeClass(contentBar).css('top', offset.top);
      }

      if (scroll > bottom - margin && itemsHeight > fastlaneHeight) {
        $glossaryOverviewFastlane.css('top', bottom).removeClass(contentBar);
      }
    }
  },

  // filter the checked items
  proto._filter = function(clickedLabel, clickedId) {
     var self = this,
         options = this.options;

     // uncheck
     if (clickedLabel.hasClass(cls.iconCheckboxChecked)) {

     clickedLabel.removeClass(cls.iconCheckboxChecked);
     clickedLabel.addClass(cls.iconCheckbox);

     // remove the unchecked (click ID) from stored
     options.isChecked.splice(options.isChecked.indexOf(clickedId), 1);

     // check if any checkbox is checked
     if (options.isChecked.length > 0) {
       // find all elements matching the checkbox case
       var elementsToRemove = $('.' + clickedId, sel.glossaryOverviewItemContainer);
       // filter out all elements that match other currently checked checkboxes cases (elements to keep)
       var elementsToKeep = '.' + options.isChecked.join(', .');
       var filtered = elementsToRemove.filter(function(i, e) {
         // if the element is not one of the elements to keep add it to the filtered variable
         return !$(e).is(elementsToKeep);
       });
       // hide the leftovers
       $(filtered).addClass(cls.inactive);
     // if no checkbox is checked, return to unfiltered view
     } else {
       $(glossaryOverview + ' hr').addClass(cls.active);
       $(sel.glossaryOverviewItemContainer + ' h2').removeClass(cls.inactive);
       $(sel.glossaryOverviewItems).removeClass(cls.inactive);
     }

     if (!self.isMobile) {
       window.digitals2.main._equalheight();
     }

     if($(sel.iconCheckboxChecked).length > 0) {
       self._setToMaxHeight();
     }

   // check
   } else if (clickedLabel.hasClass(cls.iconCheckbox)) {

     if (!$(sel.labelCheckbox).hasClass(cls.iconCheckboxChecked)) {
       $(sel.glossaryOverviewItems).addClass(cls.inactive);
     }

     clickedLabel.removeClass(cls.iconCheckbox);
     clickedLabel.addClass(cls.iconCheckboxChecked);
     $(glossaryOverview + ' hr').removeClass(cls.active);
     $(sel.glossaryOverviewItemContainer + ' h2').addClass(cls.inactive);

     var filterItems = $(sel.glossaryOverviewItemContainer).find('.' + clickedId);

     filterItems.removeClass(cls.inactive);

     // store click ID to know which is checked (relevant for unchecking)
     options.isChecked.push(clickedId);

     if (!self.isMobile) {
       window.digitals2.main._equalheight();
     }

     self._setToMaxHeight();

   } else {
     if (!self.isMobile) {
       window.digitals2.main._equalheight();
     }
   }

   self._itemsCount();
  },

  proto._setToMaxHeight = function() {
    var self = this,
        options = this.options;

    // Get an array of all element heights
    var elementHeights = $(sel.glossaryOverviewItems).map(function() {
      return $(this).height();
    }).get();

    // Math.max takes a variable number of arguments
    // `apply` is equivalent to passing each height as an argument
    var maxHeight = Math.max.apply(null, elementHeights);

    // Set each height to the max height
    $(sel.glossaryOverviewItems).height(maxHeight);
  },

  proto._itemsCount = function() {
    var self = this;

    var itemsLength = $(sel.glossaryOverviewItemContainer).find('.ds2-glossary-overview--items:not(.ds2-inactive)');

    $(sel.glossaryOverviewJSCounter).text(itemsLength.length);
    $(sel.glossaryOverviewCounter).text(itemsLength.length);

    self.$element.trigger(evt.glossaryOverviewTracking, {length: itemsLength.length});
  },

  proto._fastlaneButtonClick = function() {
    var self = this;

    self._itemsCount();
    $(sel.glossaryOverviewHeadlineContainer).css('display', 'none');
    $(sel.glossaryOverviewFilterContainer).css('display', 'block');
    $(sel.glossaryOverviewFastlane).css('display', 'none');
    $(sel.glossaryOverviewItemContainer).css('display', 'none');
  },

  proto._filterButtonClick = function() {
    var fastlaneHeight;

    if ($(sel.glossaryOverviewItemContainer).height() < $(sel.glossaryOverviewFastlane).height()) {
      fastlaneHeight = $(sel.glossaryOverviewFastlane).height();
      $(sel.glossaryOverviewItemContainer).height(fastlaneHeight);
    }

    $(sel.glossaryOverviewItemContainer).css('height', '');
    $(sel.glossaryOverviewHeadlineContainer).css('display', '');
    $(sel.glossaryOverviewFilterContainer).css('display', '');
    $(sel.glossaryOverviewFastlane).css('display', '');
    $(sel.glossaryOverviewItemContainer).css('display', '');
  },

  // manage the content on resize
  proto._onResize = function(event) {
    var self = event.data,
      offset = $('.ds2-glossary-overview').offset(),
      marginTop = 5;

    if (!self.isMobile) {
      self._filterButtonClick();
    }

    window.digitals2.main._equalheight();
    self._setDeviceValues();

    if (self.isMobile == true) {
      var $fastLane = $('.ds2-glossary-overview--fastlane');

      $fastLane.css('top', offset.top + marginTop);
      $('.ds2-glossary-overview--item-container').css('min-height', $fastLane.height()+'px');
    }
    if (self.options.isChecked.length > 0) {
      self._setToMaxHeight();
    }
  }

  return GlossaryOverview;
});
