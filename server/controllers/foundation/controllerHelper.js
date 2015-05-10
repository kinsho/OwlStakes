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
		 * @param {String} [directory] - the modular name which can be used to pull resource files from
		 * 		the file system
		 *
		 * @return {String} - a fully populated string of HTML
		 *
		 * @author kinsho
		 */
		renderInitialView: Q.async(function* (content, directory)
		{
			var data = {};

//			data[HBARS_BASE_TEMPLATE_HTML] = yield fileManager.fetchFoundationalTemplates();

			// Foundational content that will be in play on every page
			data[HBARS_BASE_TEMPLATE_HTML] = '';
			data[HBARS_LEFT_HAND_TEMPLATE_HTML] = yield fileManager.fetchLeftHandMenuTemplates();
			data[HBARS_STYLESHEET_FILES] = yield fileManager.fetchAllFoundationalStylesheets();

			// Content specific to the page being loaded
			data[HBARS_CONTENT_HTML] = content;
console.log('Directory: ' + directory);
			if (directory)
			{
				data[HBARS_STYLESHEET_FILES].concat(yield fileManager.fetchStylesheets(directory));
			}

			return templateManager.populateTemplate(data, '', BASE_TEMPLATE_FILE);
		})
	};

// ----------------- END --------------------------
	return my;
});