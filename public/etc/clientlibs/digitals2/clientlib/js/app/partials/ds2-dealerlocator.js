define('ds2-dealerlocator', ['use!jquery', 'use!angular', 'require', 'postal.provider'], function ($, angular, require, postal) {
    'use strict';

    // constants
    var ds2dealerlocator = function (element) {
        this.element = $(element);
        this._create();
    };

    Object.assign(ds2dealerlocator.prototype, {
        // State

        _create: function () {
            var self = this;
            var view = this.element.find('.dealerLocatorView');
            var businessDealerlocatorPath = view.attr('data-business-dealerlocator-path');
            var businessDealerlocatorPathWithoutJS = businessDealerlocatorPath.substr(0, businessDealerlocatorPath.indexOf(".js"));
            
            var defineFn = window.define;
            window.define = undefined;
            
            var ngAnimateUrl = this.element.find('[data-nganimateurl]').data('nganimateurl');
        	require([ngAnimateUrl, businessDealerlocatorPath], function() {
        		var viewElem = view[0];
        		var tmpView = document.getElementById('dlo-app');
                var viewContainer = viewElem.parentNode;
                // in case of the dlo not being visible at the first place (e.g. in a multistep form
                // the map does not initialize properly, we have to postpone the bootstrap until
                // the dlo is actually visible
                function checkVisibility() {
                    var visible = $(viewContainer).is(':visible');
                    // console.log('dlo timeout:', viewContainer, visible);
                    if (visible) {
                        // NOTE: this is a workaround to run two angular apps nested in the same page
                        // the bootstrapping can not be done inside another angular app
                        // due to this we bootstrap outside the requests app and the move the dlo app back
                        view.remove();
                        tmpView.appendChild(viewElem);
                        angular.module('integration', []).value('postal', postal);
                        angular.bootstrap(viewElem, ['integration', 'dealerLocator']);
                        tmpView.removeChild(viewElem);
                        viewContainer.appendChild(viewElem);
                    } else {
                        setTimeout(checkVisibility, 200);
                    }
                }
        		// check, if we are in integrated mode
        		if (tmpView !== null) {
	        		checkVisibility();
        		} else {
	        		angular.module('integration', []).value('postal', postal);
	        		angular.bootstrap(viewElem, ['integration', 'dealerLocator']);
        		}
        		window.define = defineFn;
        	});
        }
    });
    return ds2dealerlocator;
});