define(['Handlebars', 'path', 'co', 'utility/fileManager'], function(Handlebars, path, co, fileManager)
{
	'use strict';

// ----------------- MODULE DEFINITION --------------------------
	var my =
	{
		/**
		 * Function fetches a template using a provided path and populates it using passed data. Any helper
		 * functions that are passed alongside the other parameters are registered into handlebars prior
		 * to the template being compiled.
		 *
		 * @param {JSON} data - the data to roll into the template
		 * @param {String} templateDirectory - the directory in which the template is located
		 * @param {String} templateName - the name of the template
		 * @param {Array[Function]} [helpers] - an associative array of helper functions to register into handlebars
		 * 		prior to the compilation of the template
		 *
		 * @author kinsho
		 */
		populateTemplate: co(function* (data, templateDirectory, templateName, helpers)
		{
			var keys,
				template,
				i;

			helpers = helpers || {};
			keys = Object.keys(helpers);

			// Register any helpers that may have been passed into the function
			for (i = keys.length - 1; i >= 0; i -= 1)
			{
				Handlebars.registerHelper(keys[i], helpers[i]);
			}

			// Check to see if the template has already been precompiled and cached. If not, fetch the template,
			// compile it, and cache it.
			template = Handlebars.templates[templateDirectory];
			if (!template)
			{
				template = yield fileManager.fetchTemplate(templateDirectory, templateName);
				template = Handlebars.compile(template);
				Handlebars.template[templateDirectory] = template;
			}

			// Feed the data into the template and return the resulting HTML
			return template(data);
		})
	};

// ----------------- END --------------------------
	return my;
});