define('serviceInitializer', function() {
	'use strict';

	var CONST_SERVICES_MODULE_PATH_FRAGMENT = '/services/';

    var serviceModules = {};

    function instr(str, suffix) {
            return str.indexOf(suffix) !== -1;
    }

    /**
     * The init method goes through an array of all modules were defined as AMD module
     * all modules which are defined under a certain path will be initialized immediately
     */
    function init() {

        // To continue it has to be ensured that define is and the
        if(define === undefined || Object.prototype.toString.call(define.definedModuleIds) !== '[object Array]') {
            throw new Error("The function 'define' or the array 'define.definedModuleIds' are undefined.");
        }

        // Get the Array of all module IDs which were already defined
        var definedModuleIds = define.definedModuleIds;

        // Loop over the array
        for (var element = 0; element < definedModuleIds.length; element++) {

            var definedModuleId = definedModuleIds[element];

            // Require the modules which contain the module path
            if(instr(definedModuleId, CONST_SERVICES_MODULE_PATH_FRAGMENT))
            {
                require([definedModuleId], function(module) {
                    if(module === undefined)
                    {
                        module = null;
                    }
                    else if(typeof module.init === 'function')
                    {
                        module.init();
                    }

                    serviceModules[definedModuleId] = module;
                });
            }
        }
    }

	return {
		init: init,
		serviceModules: serviceModules
	}

});
