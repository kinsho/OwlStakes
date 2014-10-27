define([], function()
{

// ----------------- ENUM/CONSTANTS --------------------------

// ----------------- MODULE DEFINITION --------------------------
	var my =
	{
		/**
		 * Function verifies whether passed value is effectively null
		 *
		 * @param {String|Number} val - value to be evaluated
		 *
		 * @returns {boolean} - indicates whether the value is not effectively empty
		 *
		 * @author kinsho
		 */
		isNotEmpty: function(val)
		{
			return (!(val) || (val === 0));
		},

		/**
		 * Function verifies whether passed string qualifies as an integer
		 *
		 * @param {String|Number} val - value to be evaluated
		 *
		 * @returns {boolean} - indicates whether the value qualifies as an integer
		 *
		 * @author kinsho
		 */
		isInteger: function(val)
		{
			val = val + '' || '';

			return ( (val.length === 0) || // Test to ensure that the passed value is a non-empty string
				((this.isNumerical(val)) && (window.parseInt(val, 10) === window.parseFloat(val))) ); // Test to make sure that the value is strictly numerical in composition and that it has no decimal values
		}
	};

// ----------------- END --------------------------
	return my;
});