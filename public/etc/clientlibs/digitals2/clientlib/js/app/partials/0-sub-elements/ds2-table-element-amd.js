define( 'ds2-table-element', [
    'use!jquery',
    'ds2-main'
], function( $ ) {

    var TableElement = function( element ) {

        this.$element = $( element );

        this._create();
    };

    var proto = TableElement.prototype;

    proto._create = function() {
        var self        = this,
            $element    = self.$element,
            $imageTds   = $('td:has(img)', $element),
            $lastRowTds = $('tr:last-child td', $element),
            columnCount = 0;

        // Add data-hasonlyimage to TDs that contain nothing but an image to target them in CSS.
        $imageTds.filter(function() {
           return !$.trim($(self).text()).length;
        }).attr('data-hasonlyimage', true);

        /**
         * Check how many columns are in the table (account for possible colspan)
         * and only use Stacktable plugin if there are more than 2 columns.
         */
        $lastRowTds.each(function() {
          var colspanCount = $(self).attr('colspan');

          if (colspanCount) {
            columnCount += +colspanCount;
          } else {
            columnCount++;
          }
        });

        if (columnCount > 2) {
          $('table', $element).stacktable();
        }
    }

    return TableElement;

} );
