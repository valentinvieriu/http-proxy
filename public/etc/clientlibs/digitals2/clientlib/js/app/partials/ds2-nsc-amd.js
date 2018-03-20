/**
 * partial: NSC
 * author:
 *
 * this file is referenced in /app/templates/pages/
 */

define( 'ds2-nsc', [
    'use!jquery',
    'use!log',
    'ds2-main'
], function( $, log ) {
    var NSC = function( element ) {
      var self = this,
          $element = $(element);
      self.$element = $element;
      self.$title = $('.ds2-dropdown-js--title', $element);
      self.$dropdownContainer = $('.ds2-dropdown-js--container', $element);
      self.$submitButton = $('.ds2-nsc--js-button', $element);
      // prevent from appending muliple times
      if (!$element.hasClass('ds2-nsc--initialized')) {
        // Append the dropdown options
        self._appendItems();
        self.$element.addClass('ds2-nsc--initialized');
      } else {
        self.$element.trigger('ds2-nsc-reveal-modal-open');
      }
    };
    // Store prototype
    var proto = NSC.prototype;
    /**
     * Get the dropdown's data from a JSON
     * and append the options to it
     */
    proto._appendItems = function() {
        var self = this,
            $element = self.$element,
            $jsonDataUrl;

        if ($element.data('linksUrl') !== undefined) {
          $jsonDataUrl = self._generateJsonPath( $element.data('linksUrl') );
        }

        if ($jsonDataUrl) {
          var content = $.getJSON( $jsonDataUrl, function(data) {
            var $ul = $(".ds2-dropdown-js--container", self.$element),
                geoCountryCode = $(document.body).data('geoCountryCode');

            // Build the <li> options
            $.each(data['nsclinks'], function(key, val) {
              var $li = $('<li />');
              $li.addClass("ds2-dropdown-js--item");
              // Set the current geoCountryCode as an active element
              if (geoCountryCode && geoCountryCode === val.id) {
                $li.addClass("active");
                self._dropdownChangeTitle(val.label);
              }
              // Add the <li> option content
              $li[0].innerHTML = '<a class="ds2-dropdown--link ds2-dropdown-js--link" href="#nsc" role="tab" data-nsc-link="' + val.link + '">' + val.label +'</a>';
              // Append the <li> option to the ul object
              $ul.append($li);
            });
            // Bind click event on the new link items
            self._dropdownClick();
            self._submitButtonClick();

            $element.trigger('json-loaded');
          });
          // Show a console message on request fail
          content.fail(function() {
            $element.trigger('json-loaded');
            log('nsc getJSON error');
          });
        }
    };
    /**
     * Generate a path to the JSON object based on the current date and time
     * @param  {string} originalPath
     * @return {string}
     */
    proto._generateJsonPath = function(originalPath) {
        var dataPathSliced = originalPath.slice(0, originalPath.length - 5);
        var d1 = new Date();
        var year = d1.getUTCFullYear();
        var month = ('0' + (d1.getUTCMonth() + 1)).slice(-2);
        var dayInMonth = ('0' + d1.getUTCDate()).slice(-2);
        var hour = ('0' + d1.getUTCHours()).slice(-2);
        return dataPathSliced + '.' + year + month + dayInMonth + '-' + hour +'.json';
        // NOTE: use the following string if you want to access the component-nsc-links-temp.json
        // return '/en' + originalPath;
    },
    /**
     * Update the dropdown on link item click
     */
    proto._dropdownClick = function() {
      var self = this,
          $element = self.$element,
          $itemLink = $('.ds2-dropdown-js--link', $element);

      $itemLink.on('click', function() {
        // Update the dropdown title
        self._dropdownChangeTitle( $(this).text() );
        // Close the dropdown
        Foundation.libs.dropdown.close(self.$dropdownContainer);
      });
    };
    /**
     * Change the title of the dropdown button to the clicked link title
     */
    proto._dropdownChangeTitle = function(title) {
      this.$title.addClass('ds2-dropdown--title-item');
      this.$title.text(title);
    };
    /**
     * Open the link of the selected link item
     * on submit button click
     */
    proto._submitButtonClick = function() {
        var $element = this.$element;
        this.$submitButton.off('click.nsc');
        this.$submitButton.on('click.nsc', function() {
            var $activeLink = $('.ds2-dropdown-js--item.active .ds2-dropdown-js--link', $element);
            var $activeLinkData = $activeLink.data('nscLink');
            if ($activeLinkData) {
                window.open($activeLinkData, '_blank');
            }
        });
    };
    return NSC;
});
