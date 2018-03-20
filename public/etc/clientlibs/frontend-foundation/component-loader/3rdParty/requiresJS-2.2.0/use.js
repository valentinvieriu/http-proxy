/*
	AMD Use Plugin
	Copyright 2016, Sascha Brinkmann (https://github.com/sbrinkmann)
	Apache 2.0 Licensed
*/
(function(global) {

	define('use', ['module'], function(module) {

		var Use = {};

		Use.load = function(name, req, load, config) {
			// Dojo provides access to the config object through the req function.
			if (!config)
			{
				config = require.rawConfig;
			}

			if(name.indexOf('use!') === 0)
			{
			    name = name.substr(4);
			}

			var module = config.use && config.use[name];

			if (module === undefined)
			{
				// Is the requested module not configured, but there is a vatiable on the window
				// object which matched to the name, it will be mapped to the requested module
				if (global[name] !== undefined)
				{
					return load(global[name]);
				}
				else
				{
					throw new TypeError("The module '" + name + "' isn't registered in a global context.");
				}
			}
			else
			{
				var moduleDependencies = module.deps || [];
				if (module.constructor === Array)
				{
					moduleDependencies = module;
				}

				var moduleAttach = module.attach || module.exports || module.init || name;

				// Is the module configured with an 'attach' variable and
				// this variable matches with variable registered on the window object
				// this variable will be mapped to the requested module
				if (typeof moduleAttach === 'string' && global[moduleAttach] !== undefined && moduleDependencies.length == 0)
				{
					return load(global[moduleAttach]);
				}

				// Is the module configured with a function on the 'attach' variable
				// and there are no dependencies to be resolved, the function will be
				// executed and the return value mapped to the requested module
				if (typeof moduleAttach === 'function' && moduleDependencies.length == 0)
				{
					return load(moduleAttach.apply(global));
				}

				// Read the current module configuration for any dependencies that are
				// required to run this particular non-AMD module.
				req(moduleDependencies, function() {
					var depArgs = arguments;

					if (typeof moduleAttach === 'string' && global[moduleAttach] !== undefined)
					{
						return load(global[moduleAttach]);
					}

					if (typeof moduleAttach === 'function')
					{
						return load(moduleAttach.apply(global, depArgs));
					}

					// Check if for the module an alternative path is configure
					// then take the mapped path instead of the given one
					//var requireModule = config.paths[name] || name;
					var requireModule = name;

					// Utilize the `js!` plugin within Curl to load the source file.  It's
					// not recommended that this is used, but it's built in and accessible.
					if (global.curl)
					{
						requireModule = "js!" + requireModule;
					}

					req([requireModule], function() {

						// If doing a build don't care about loading
						if (config.isBuild)
						{
							return load();
						}

						// Return the correct attached object
						if (typeof moduleAttach === "function")
						{
							return load(moduleAttach.apply(global, depArgs));
						}

						// Use global for now (maybe this?)
						return load(global[moduleAttach]);
					});

				});
			}
		};

		return Use;
	});

})(this);