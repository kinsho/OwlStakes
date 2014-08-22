/**
 * @module router
 */

define([], function()
{
	'use strict';

// ----------------- ENUM/CONSTANTS --------------------------
	var CONTROLLERS_DIRECTORY = 'controller/',
		PAGE_NOT_FOUND_CONTROLLER = '404';

// ----------------- ROUTES --------------------------
	var ROUTES =
		{
			'suicidePools' : 'pools',


			'404' : '404'
		};

// ----------------- MODULE DEFINITION --------------------------
	return {

		/**
		 * Function responsible for deducing a filepath (from the server folder) to the controller whose name is passed
		 *
		 * @param {String} controller - the name of the controller for which a relative path will be calculated
		 *
		 * @returns {String} - a relative filepath to the controller that can be consumed by requireJS to fetch files
		 */
		findRoute: function(controller)
		{
			return (ROUTES[controller] ? CONTROLLERS_DIRECTORY + ROUTES[controller] :
				CONTROLLERS_DIRECTORY + ROUTES[PAGE_NOT_FOUND_CONTROLLER]);
		}
	};
});