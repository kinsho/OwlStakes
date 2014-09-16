/**
 * @module router
 */

define(['Q', 'utility/fileManager'], function(Q, fileManager)
{

// ----------------- ENUM/CONSTANTS --------------------------

	var ROUTE_JSON_DIRECTORY = 'config/',
		ROUTE_JSON_NAME = 'routes',

		CONTROLLERS_DIRECTORY = 'controllers/',
		PAGE_NOT_FOUND_CONTROLLER = '404',
		HOME_CONTROLLER = 'home',

		INIT_ACTION = 'init',
		ACTION_SUFFIX = 'Action',
		CONTROLLER_SUFFIX = 'Controller',

		RESOURCE_EXTENSIONS =
		[
			'.css',
			'.png',
			'.svg'
		],

		CONTENT_TYPE_HEADERS =
		{
			"html" : 'text/html',
			"css" : 'text/css'
		};

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
		 * Function responsible for determining whether the URL is asking for a resource, be it an image or a
		 * stylesheet
		 *
		 * @params {String} url - the URL to inspect
		 *
		 * @returns {boolean} - indicates whether the URL is asking for a media or style resource
		 *
		 * @author kinsho
		 */
		isResourceWanted: function (url)
		{
			var i;

			for (i = RESOURCE_EXTENSIONS.length - 1; i >= 0; i--)
			{
				if (url.endsWith(RESOURCE_EXTENSIONS[i]))
				{
					return true;
				}
			}

			return false;
		},

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
		findController: function(controllerName)
		{
			// If a path has not been defined, the server will route the request to the home page, by default
			if ( !(controllerName) )
			{
				return CONTROLLERS_DIRECTORY + HOME_CONTROLLER + CONTROLLER_SUFFIX;
			}

			// If a path has been defined however, the server will route the request to the controller indicated
			// within the URL, provided that a controller can be found that matches the one indicated within the URL.
			return (routes[controllerName] ? CONTROLLERS_DIRECTORY + routes[controllerName] + CONTROLLER_SUFFIX :
				CONTROLLERS_DIRECTORY + routes[PAGE_NOT_FOUND_CONTROLLER] + CONTROLLER_SUFFIX);
		},

		/**
		 * Function responsible for defining a full route toward a specific action within a controller or, if an
		 * action has not been explicitly specified by the request being served, a full route to that controller's
		 * initialization function will be provided instead
		 *
		 * @param {String} controllerName - the name of the controller towards which the flow of execution will
		 * 		be directed
		 * @param {String} [actionName] - the name of the action method to invoke within the controller
		 *
		 * @returns {String} - the full name of the action method to invoke within the target controller
		 *
		 * @author kinsho
		 */
		findAction: function(controllerName, actionName)
		{
			return ( (controllerName && actionName) ? actionName + ACTION_SUFFIX : INIT_ACTION + ACTION_SUFFIX);
		},

		/**
		 * Function responsible for determining the content-type header to put in the response before it is sent to
		 * the client
		 *
		 * @params {String} url - the URL to inspect in order to figure out the content-type header
		 *
		 * @returns {String} - the content-type header to place in the HTTP response
		 *
		 * @author kinsho
		 */
		deduceContentType: function(url)
		{
			var i;

			for (i = RESOURCE_EXTENSIONS.length - 1; i >= 0; i--)
			{
				if (url.endsWith(RESOURCE_EXTENSIONS[i]))
				{
					return true;
				}
			}

			return false;
		}
	};

// ----------------- END --------------------------
	return my;
});