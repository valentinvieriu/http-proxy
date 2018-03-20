/**
 * partial: smartbanner
 * author: hila
 */

define('ds2-smartbanner', [
	'use!jquery'
	], function($) {

    var Ds2smartbanner = function(element) {
        _create();
    };

    function _create() {
    	$('.smartbanner-button').on('click', function(e) {
            e.preventDefault();
    		var $element = $(this);
        	_clickHandler(e, $element);
        });
    }

    function _clickHandler(e, $element) {
    	$(window).trigger('smartbanner-tracking', [$element, e]);
    }

    return Ds2smartbanner;

});