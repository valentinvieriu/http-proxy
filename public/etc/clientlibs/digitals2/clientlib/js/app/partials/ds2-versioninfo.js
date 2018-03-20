define('ds2-versioninfo', ['use!jquery'], function ($) {
    'use strict';

    var TARGET_SELECTOR = '.ds2-navigation-main--id-module';
    
    var targetElement = undefined;
    var overlayElement = undefined;
    var overlay = undefined;

    // constants
    var ds2versioninfo = function (element) {
        this.element = $(element);
        this._create();
    };

    Object.assign(ds2versioninfo.prototype, {
        // State

        _create: function () {
            var self = this;
            var targetElement = $(document).find(TARGET_SELECTOR);
            targetElement.click(function(event) {
            	self.onTargetClicked(event);
            });
        },

	    onTargetClicked: function(event) {
			if (event.altKey && event.shiftKey) {
				event.preventDefault();
				event.stopPropagation();
		        var layer = this.element.find('.ds2-layer');
		        layer.foundation('reveal', 'open');
			}
	    }
});
    return ds2versioninfo;
});