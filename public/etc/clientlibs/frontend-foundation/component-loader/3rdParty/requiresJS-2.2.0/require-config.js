(function() {

	/**
	 * Little script that allows you to call requirejs.config multiple times.
	 */

	/**
	 * Stores the actual config that gets passed into requirejs.config
	 * @type {Object}
	 */
	var actual_config = {};

	/**
	 * This deep extends an object.
	 *
	 * @param  {Object} o1 Root object
	 * @param  {Object} o2 Object to merge into
	 * @return {Object}    Merged objected
	 */
	var extend = function() {
		var args = Array.prototype.slice.call(arguments);
		var o1 = args.shift();
		var o2 = args.shift();

		while (args.length > 0) {
			o2 = extend(o2, args.shift());
		}

		for (var i in o2) {
			if (Object.prototype.hasOwnProperty.call(o2, i)) {
				if (
					typeof o2[i] === 'object' &&
					Object.prototype.hasOwnProperty.call(o1, i) &&
					typeof o1[i] === 'object'
				) {

					if (o1[i] instanceof Array && o2[i] instanceof Array) {

						for (var j in o2[i]) {
							if (
								Object.prototype.hasOwnProperty.call(o2[i], j)
							) {
								o1[i].push(o2[i][j]);
							}
						}
					} else {
						extend(o1[i], o2[i]);
					}
				} else {
					o1[i] = o2[i];
				}
			}
		}

		return o1;
	};

	var config_function = requirejs.config;

	requirejs.config = function(config) {
		actual_config = extend(actual_config, config);

		return config_function.call(requirejs, actual_config);
	};

})();