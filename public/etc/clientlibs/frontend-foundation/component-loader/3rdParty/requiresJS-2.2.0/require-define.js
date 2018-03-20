(function() {

    var nextDefineId = [];

    var definedModuleIds = [];

    var defineFunction = window.define;

    var getNextDefineId = function getNextDefineId() {
        var defineId = null

        if (nextDefineId.length > 0) {
            defineId = nextDefineId.pop();
        }

        return defineId;
    }

    var registerModuleId = function registerModuleId(moduleId) {

        // Check if the module id is already registered. If this is the case
        // an exception is thrown.
        for (var element = 0; element < definedModuleIds.length; element++) {

            var definedModuleId = definedModuleIds[element];

            if(moduleId === definedModuleId)
            {
                throw "Module ID '"+ moduleId +"' is already defined."
            }
        }

        definedModuleIds.push(moduleId);

    }

    window.defineNextId = function(defineId) {
        nextDefineId.push(defineId);
    }

    window.define = function(id, dependencies, factory) {

        //Execute when no ID is provided
        if (Object.prototype.toString.call(id) === '[object Array]' || (id).constructor.name === 'Array') {
            // Shift parameters, when there is no ID is defined
            factory = dependencies;
            dependencies = id;

            var defineId = getNextDefineId();
            if (defineId != null) {
                registerModuleId(defineId);
                defineFunction(defineId, dependencies, factory);
            } else {
                throw "No define ID is given.";
            }

        } else if (Object.prototype.toString.call(id) === '[object Function]' || (id).constructor.name === 'Function') {
            // Shift parameters, when there is no ID is defined
            factory = id;

            var defineId = getNextDefineId();
            if (defineId != null) {
                registerModuleId(defineId);
                defineFunction(defineId, factory);
            } else {
                throw "No define ID is given.";
            }
        } else {
            registerModuleId(id);
            defineFunction(id, dependencies, factory);
        }
    }

    window.define.nextId = window.defineNextId;

    window.define.amd = defineFunction.amd;

    window.define.definedModuleIds = definedModuleIds;

})();