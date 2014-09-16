define(['Q', 'controllers/foundation/controllerHelper'], function(Q, controllerHelper)
{
// ----------------- ENUMS/CONSTANTS --------------------------

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
			return yield controllerHelper.renderInitialView('Hello');
		})
	};

// ----------------- END --------------------------
	return my;
});