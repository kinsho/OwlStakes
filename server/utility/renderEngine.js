define(['Q', 'utility/fileManager', 'utility/templateManager'], function(Q, fileManager, templateManager)
{
// ----------------- ENUMS/CONSTANTS --------------------------

	var BASE_TEMPLATE_FILE = 'base',

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
		renderView: Q.async(function* ()
		{
			var data = {};

			data[HBARS_VIEW_HTML] = yield fileManager.fetchAllFoundationalViewHTML();
			data[HBARS_STYLESHEET_FILES] = yield fileManager.fetchAllFoundationalStylesheets();
			data[HBARS_CONTENT_HTML] = '<h1>Testing, Holmes!</h1>';

			return templateManager.populateTemplate(data, '', BASE_TEMPLATE_FILE);
		})
	};

// ----------------- END --------------------------
	return my;
});