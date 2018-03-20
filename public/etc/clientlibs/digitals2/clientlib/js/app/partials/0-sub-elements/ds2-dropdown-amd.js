/**
 * @title: Dropdown
 * @description: The purpose of this sub-component is to facilitate the dropdown for any component that uses it.
 */

define('ds2-dropdown', [
  'use!jquery',
  'ds2-main'
], function ($) {

  var dropDownJS = '.ds2-dropdown-js';

  // selector cache
  var sel = {
    dropDownJSArea: dropDownJS + '--area',
    dropDownJSContainer: dropDownJS + '--container',
    dropDownJSItem: dropDownJS + '--item',
    dropDownJSTitle: dropDownJS + '--title',
    dropDownJSNofilter: dropDownJS + '--nofilter',
    dropDownLink: '.ds2-dropdown--link'
  };

  var Dropdown = function (element) {

    this.$element = $(element);

    this._create();
  };

  var proto = Dropdown.prototype;

  proto._create = function () {
    var self = this,
      $element = self.$element,
      $title = $(sel.dropDownJSTitle, $element),
      $items = $(sel.dropDownJSItem, $element),
      $activeItem = $(sel.dropDownJSItem + '.active', $element),
      $dropdownContainer = $(sel.dropDownJSContainer, $element);

    // set the title of the dropdown button to the currently active item
    if ($activeItem.length) {
      $title.text($activeItem.text());
    }

    $items.on('click', function (evt) {
      evt.preventDefault();
      evt.stopPropagation();

      var scrollTop = document.body.scrollTop;
      var hash = $(evt.currentTarget).find(sel.dropDownLink).attr("href");
      if (hash !== undefined && hash != '') {
        window.location.hash = hash;
      }

      // change the title of the dropdown button to the clicked link title
      var itemTitle = $(this).text();
      $title.text(itemTitle);

      $(evt.currentTarget).parent().find("li").removeClass("active");
      $(evt.currentTarget).addClass("active");

      // close the dropdown
      Foundation.libs.dropdown.close($dropdownContainer, $(evt.currentTarget));

      // needs timeout, not working otherwise (for me it works also without timeout)
      setTimeout(function () {
        document.body.scrollTop = scrollTop;
      }, 1);
    });

    // fix to have a working dropdown behavior in a reveal modal (layer)
    // should be fixed in a newer version of foundation dropdown js
    $dropdownContainer.on('closed', function () {
      return false;
    });

    if (!$element.hasClass(sel.dropDownJSNofilter.substring(1))) {
        // check if links will be loaded via ajax
        if ($element.parents('.ds2-nsc').data('linksUrl') !== undefined) {
          $element.parents('.ds2-nsc').on('json-loaded', setupFilterInput);
        } else {
          setupFilterInput();
        }
    }

    function setupFilterInput() {
      $items = $(sel.dropDownJSItem, $element);
      if ($items.length > 5) {
        self.$items = $items;
        self.$dropdownContainer = $dropdownContainer;
        self._initFilterInput();
      }
    }

    // calculate container size when dropdown is opened
    $dropdownContainer.on('opened.fndtn.dropdown', function () {
      self._setDropdownContainerSize();

      // only focus filter input on desktop and greater
      if (window.matchMedia(Foundation.media_queries.large).matches) {
        if ($element.hasClass('ds2-filter-input--active') && self.$filterInput !== undefined) {
          self.$filterInput.focus();
        }
      }
    });

    // re-calculate container size when window width changes
    window.digitals2.main.$window.on('resize.fndtn.dropdown', Foundation.utils.throttle(function () {
      self._setDropdownContainerSize();
    }, 50));
  };

  // calculate the width for the dropdown container
  proto._setDropdownContainerSize = function () {
    var self = this,
      $element = self.$element,
      buttonAreaWidth = $(sel.dropDownJSArea, $element).innerWidth(),
      dropdownPosition = $(sel.dropDownJSArea, $element).offset(),
      dropdownPositionTop = dropdownPosition.top - $(window).scrollTop(),
      windowHeight = $(window).height(),
      dropdownMaxHeight = windowHeight - dropdownPositionTop - 80;

    $(sel.dropDownJSContainer, $element).width(buttonAreaWidth).css('max-height', dropdownMaxHeight + 'px');
  };

  proto._initFilterInput = function () {
    var self = this,
      $element = self.$element;
    $element.addClass('ds2-filter-input--active');
    self.$filterInput = self._appendFilterInput();

    self.$filterInput.on('click', function (e) {
      // e.preventDefault();
      e.stopPropagation();
    });

    self.$dropdownContainer.on('closed.fndtn.dropdown', function () {
      self.$filterInput.val('');
      self.$items.show();
    });

    self.$filterInput.keyup(function (e) {
      var filterString = e.currentTarget.value;
      var $filteredList;

      // first show all items
      self.$items.show();

      if (filterString.length > 0) {
        // filterString = filterString.toLowerCase();
        $filteredList = self.$items.filter(function (index) {
          var $curItem = self.$items.eq(index);
          $curItem = $curItem.children('.ds2-dropdown--link').text().trim();
          // RegExp: search from beginning, case insensitive
          var re = new RegExp("^" + filterString, "i");
          var result = re.test($curItem);
          return !result;
        });
        $filteredList.hide();
      }
    });
  };

  proto._appendFilterInput = function () {
    var self = this,
      $element = self.$element;

    var $input = $('<input type="text" class="ds2-dropdown-filter"/>');

    var $filterwrapper = $('<span/>', {
      'class': 'ds2-dropdown-filter-wrapper'
    }).append($input);

    $element.children('ul.ds2-dropdown-js--container').after($filterwrapper);
    return $input;
  };

  return Dropdown;
});
