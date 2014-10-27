define([], function()
{

// ----------------- ENUM/CONSTANTS --------------------------

// ----------------- MODULE DEFINITION --------------------------
	var my =
	{

		/**
		 * Function verifies whether value is at least three characters in length
		 *
		 * @param {String} str - input to be evaluated
		 *
		 * @returns {boolean} - indicates whether the value is at least three characters in lengths
		 *
		 * @author kinsho
		 */
		isAtLeast3Characters: function(str)
		{
			str = str || '';

			// Test the length of the string here
			return (str.length >= 3);
		},

		/**
		 * Function verifies whether value is no longer than twenty characters in length
		 *
		 * @param {String} str - input to be evaluated
		 *
		 * @returns {boolean} - indicates whether the value is less than twenty characters in length
		 *
		 * @author kinsho
		 */
		isLessThan20Characters: function(str)
		{
			str = str || '';

			// Test the length of the string here
			return (str.length <= 20);
		},

		/**
		 * Function verifies whether value is no longer than a hundred characters in length
		 *
		 * @param {String} str - input to be evaluated
		 *
		 * @returns {boolean} - indicates whether the value is less than 100 characters in length
		 *
		 * @author kinsho
		 */
		isLessThan100Characters: function(str)
		{
			str = str || '';

			// Test the length of the string here
			return (str.length <= 100);
		},
	};

// ----------------- END --------------------------
	return my;
});