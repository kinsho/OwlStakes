define(['Handlebars'], function(handlebars)
{
	'use strict';

// ----------------- MODULE DEFINITION --------------------------
	return {

		/**
		 * Function fetches a template using a provided path and populates it using passed data. Any helper
		 * functions that are passed alongside the other parameters are registered into handlebars prior
		 * to the template being compiled.
		 *
		 * @param {JSON} data - the data to roll into the template
		 * @param {String} templatePath - the location of the template relative to the project root
		 * @param {Array[Function]} [helpers] - an associative array of helper functions to register into handlebars
		 * 		prior to the compilation of the template
		 *
		 * @author kinsho
		 */
		populateTemplate: function(data, templatePath, helpers)
		{
			helpers = helpers || [];
		}
	};
});