define([], function()
{
// ----------------- ENUMS/CONSTANTS --------------------------

// ----------------- MODULE DEFINITION -----------------------------

	var my =
	{
		/**
		 * Exception class to use should data supplied by the client fail validation testing
		 *
		 * @param {Array[String]} errors - the list of error messages to relay to the client
		 *
		 * @author kinsho
		 */
		validationException: function(errors)
		{
			this.errors = errors;
			this.is404Exception = true;
		}
	};

// ----------------- END -----------------------------

	return my;
});