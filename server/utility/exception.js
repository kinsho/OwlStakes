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
			this.isCookieException = false;
		},

		/**
		 * Exception class to use should a client cookie be determined as corrupted
		 *
		 * @param {Array[String]} errors - the exception caught when trying to decode and translate the cookie
		 *
		 * @author kinsho
		 */
		cookiesException: function(error)
		{
			this.errors = error;
			this.is404Exception = false;
			this.isCookieException = true;
		}
	};

// ----------------- END -----------------------------

	return my;
});