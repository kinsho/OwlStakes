define(['co', 'fileManager', 'templateManager'], function(co, fileManager, templateManager)
{
	'use strict';
// ----------------- ENUMS/CONSTANTS --------------------------

		var FOUNDATION_DIRECTORY = '/foundation',
			BASE_FILE = '/base',

			HBARS_STYLESHEET_FILES = 'cssFiles',
			HBARS_VIEW_HTML = 'foundationViewHTML',
			HBARS_CONTENT_HTML = 'contentViewHTML';

// ----------------- MODULE DEFINITION --------------------------
	var my =
	{
		/**
		 * Basic function responsible for populating the base template with the relevant content
		 * and links to external files. The last function to be called
		 *
		 * @author kinsho
		 */
		renderView: co(function* ()
		{
			var data = {};

			data[HBARS_VIEW_HTML] = yield fileManager.fetchAllFoundationalViewHTML();
			data[HBARS_STYLESHEET_FILES] = yield fileManager.fetchAllFoundationalStylesheets();
			data[HBARS_CONTENT_HTML] = '';

			return templateManager.populateTemplate(data, FOUNDATION_DIRECTORY, BASE_FILE);
		})
	};

// ----------------- END --------------------------
	return my;
});