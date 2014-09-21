define(['Q', 'utility/fileManager'], function(Q, fileManager)
{

// ----------------- ENUM/CONSTANTS --------------------------

// ----------------- MODULE DEFINITION --------------------------
	var my =
	{
		/**
		 * Initializer function responsible for fetching the contents of a resource
		 *
		 * @author kinsho
		 */
		initAction: Q.async(function* (url)
		{
			return yield fileManager.fetchFile(url);
		})
	};

// ----------------- END --------------------------
	return my;
});