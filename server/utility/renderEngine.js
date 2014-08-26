define(['co', 'fileManager', 'templateManager'], function(co, fileManager, templateManager)
{
	'use strict';
// ----------------- ENUMS/CONSTANTS --------------------------

		var FOUNDATION_DIRECTORY = '/foundation',
			BASE_FILE = '/base',

			HBARS_STYLESHEET_FILES = 'cssFiles',
			HBARS_VIEW_FILES = 'htmlFiles';

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

			data[HBARS_VIEW_FILES] = yield fileManager.fetchAllFoundationalViews();
			data[HBARS_STYLESHEET_FILES] = yield fileManager.fetchAllFoundationalStylesheets();

			return templateManager.populateTemplate(data, FOUNDATION_DIRECTORY, BASE_FILE);
		})
	};

// ----------------- END --------------------------
	return my;
});