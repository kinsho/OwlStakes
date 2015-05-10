define(['Q', 'controllers/foundation/ControllerHelper', 'utility/fileManager', 'utility/templateManager'],
	function(Q, controllerHelper, fileManager, templateManager)
{
// ----------------- ENUMS/CONSTANTS --------------------------

	var PLAYOFFS_FOLDER = 'playoffs',

		MAIN_TEMPLATE = 'playoffs';

// ----------------- MODULE DEFINITION --------------------------
	var my =
	{
		/**
		 * Initializer function
		 *
		 * @author kinsho
		 */
		initAction: Q.async(function* ()
		{
			var populatedTemplate = templateManager.populateTemplate('test', PLAYOFFS_FOLDER, MAIN_TEMPLATE);

			return yield controllerHelper.renderInitialView(populatedTemplate, PLAYOFFS_FOLDER);
		})
	};

// ----------------- END --------------------------
	return my;
});