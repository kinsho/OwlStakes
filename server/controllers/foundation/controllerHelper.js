define(['Q', 'utility/fileManager', 'utility/templateManager'], function(Q, fileManager, templateManager)
{
// ----------------- ENUMS/CONSTANTS --------------------------

	var BASE_TEMPLATE_FILE = 'base',

		HBARS_STYLESHEET_FILES = 'cssFiles',
		HBARS_BASE_TEMPLATE_HTML = 'baseTemplateHTML',
		HBARS_LEFT_HAND_TEMPLATE_HTML = 'leftHandHTML',
		HBARS_CONTENT_HTML = 'contentViewHTML';

// ----------------- MODULE DEFINITION --------------------------
	var my =
	{
		/**
		 * Basic function responsible for populating the base template with relevant content and
		 * links to all required foundational files. Basically the last function to be called when any
		 * initial service request is to be fulfilled
		 *
		 * @param {String} content - the HTML content to inject into the base template
		 *
		 * @return {String} - a fully populated string of HTML
		 *
		 * @author kinsho
		 */
		renderInitialView: Q.async(function* (content)
		{
			var data = {};

//			data[HBARS_BASE_TEMPLATE_HTML] = yield fileManager.fetchFoundationalTemplates();
			data[HBARS_BASE_TEMPLATE_HTML] = '';
			data[HBARS_LEFT_HAND_TEMPLATE_HTML] = yield fileManager.fetchLeftHandMenuTemplates();
			data[HBARS_STYLESHEET_FILES] = yield fileManager.fetchAllFoundationalStylesheets();
			data[HBARS_CONTENT_HTML] = content;

			return templateManager.populateTemplate(data, '', BASE_TEMPLATE_FILE);
		})
	};

// ----------------- END --------------------------
	return my;
});