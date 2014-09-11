/**
 * @module router
 */

define(['Q', 'utility/fileManager'], function(Q, fileManager)
{

// ----------------- ENUM/CONSTANTS --------------------------

	var ROUTE_JSON_DIRECTORY = 'config/',
		ROUTE_JSON_NAME = 'routes',

		CONTROLLERS_DIRECTORY = 'controller/',
		PAGE_NOT_FOUND_CONTROLLER = '404';

// ----------------- PRIVATE VARIABLES -----------------------------

	var routes = {}; // the cache of all route data, in JSON format

// ----------------- MODULE DEFINITION --------------------------
	var my =
	{
		/**
		 * Function responsible for fetching and caching all routing data into this module
		 *
		 * @author kinsho
		 */
		populateRoutes: Q.async(function* ()
		{
			routes = yield fileManager.fetchJSON(ROUTE_JSON_DIRECTORY, ROUTE_JSON_NAME);
			routes = JSON.parse(routes);
		}),

		/**
		 * Function responsible for deducing a filepath (from the server folder) to the controller whose name is passed
		 *
		 * @param {String} controller - the name of the controller for which a relative path will be calculated
		 *
		 * @returns {String} - a relative filepath to the controller that can then be consumed by requireJS to fetch
		 * 		the controller file and actually begin some real server-side processing
		 *
		 * @author kinsho
		 */
		findRoute: function(controllerName)
		{
			return (routes[controllerName] ? CONTROLLERS_DIRECTORY + routes[controllerName] :
				CONTROLLERS_DIRECTORY + routes[PAGE_NOT_FOUND_CONTROLLER]);
		}
	};

// ----------------- END --------------------------
	return my;
});