define([], function()
{

// ----------------- ENUM/CONSTANTS --------------------------
	var TEST_CHARACTERS =
		{
			LOWERCASE : 'abcdefghijklmnopqrstuvwxyz',
			UPPERCASE : 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
			NUMBERS : '0123456789',
			SYMBOLS : '.@_- '
		};

// ----------------- MODULE DEFINITION --------------------------
	var my =
	{
		/**
		  * Function verifies whether field inputs are strictly alphanumeric in composition
		  *
		  * @param {String} str - string to be evaluated
		  *
		  * @returns {boolean} - indicates whether string is strictly alphanumeric
		  *
		  * @author kinsho
		  */ 
		isAlphaNumeric: function(str)
		{
			var iter;

			str = str || '';

			// Test the value here
			for (iter = str.length - 1; iter >= 0; iter--)
			{
				if ( !( (TEST_CHARACTERS.LOWERCASE.indexOf(str.charAt(iter)) >= 0) ||
						(TEST_CHARACTERS.UPPERCASE.indexOf(str.charAt(iter)) >= 0) ||
						(TEST_CHARACTERS.NUMBERS.indexOf(str.charAt(iter)) >= 0) ) )
				{
					return false;
				}
			}

			return true;
		},

		/**
		  * Function verifies whether field inputs are strictly alphanumeric (with an exception made
		  * for spaces) in composition
		  *
		  * @param {String} str - string to be evaluated
		  *
		  * @returns {boolean} - indicates whether string is strictly alphanumeric (except for any spaces
		  * 	the string might have)
		  *
		  * @author kinsho
		  */ 
		isAlphaNumericWithSpaces: function(str)
		{
			str = str || '';

			// Strip out spaces and test whether the remaining values are alphanumeric
			return this.isAlphaNumeric(str.split(' ').join(''));
		},

		/**
		  * Function verifies whether field inputs are strictly alphanumeric (with an exception made for spaces,
		  * periods, and apostrophes) in composition
		  *
		  * @param {String} str - string to be evaluated
		  *
		  * @returns {boolean} - indicates whether string is strictly alphanumeric (except for any spaces or
		  * 		punctuation the string might have)
		  *
		  * @author kinsho
		  */
		isAlphaNumericWithSpacesAndPunctuation: function(str)
		{
			str = str || '';

			// Strip out specific punctuation and test whether the remaining values are alphanumeric
			return this.isAlphaNumericWithSpaces(str.split('.').join('').split("'").join(''));
		},

		/**
		  * Function verifies whether field inputs are strictly alphanumeric (with an exception made for dashes,
		  * periods, and apostrophes) in composition
		  *
		  * @param {String} str - string to be evaluated
		  *
		  * @return {boolean} indicates whether string is strictly alphanumeric (except for any dashes or punctuation the
		  *		string might have)
		  *
		  * @author kinsho
		  */
		isAlphaNumericWithDashesAndPunctuation: function(str)
		{
			str = str || '';

			// Strip out dashes and specific punctuation, then test whether the remaining values are alphanumeric
			return this.isAlphaNumeric(str.split('.').join('').split("'").join('').split('-').join('').split('_').join(''));
		},

		/**
		  * Function verifies whether field inputs are strictly alphabetical in composition 
		  *
		  * @param {String} str - string to be evaluated
		  *
		  * @return {boolean} - indicates whether string is strictly alphabetical
		  *
		  * @author kinsho
		  */
		isAlphabetical: function(str)
		{
			var iter;

			str = str || '';

			// Test the value here
			for (iter = str.length - 1; iter >= 0; iter--)
			{
				if ( !( (TEST_CHARACTERS.LOWERCASE.indexOf(str.charAt(iter)) >= 0) ||
						(TEST_CHARACTERS.UPPERCASE.indexOf(str.charAt(iter)) >= 0) ) )
				{
					return false;
				}
			}

			return true;
		},

		/**
		  * Function verifies whether field inputs are strictly alphabetical (with an exception made for spaces) in
		  * composition
		  *
		  * @param {String} str - string to be evaluated
		  *
		  * @returns {boolean} - indicates whether string is strictly alphabetical (except for any spaces the string
		  *		might have)
		  *
		  * @author kinsho
		  */ 
		isAlphabeticalWithSpaces: function(str)
		{
			str = str || '';

			// Strip out spaces and test whether the remaining values are alphabetical
			return ( (str.split(' ').length > str.length) || // Test to ensure that the string does not solely consist of spaces
				     this.isAlphabetical(str.split(' ').join('')) );
		},

		/**
		  * Function verifies whether field inputs are strictly alphabetical (with an exception made for spaces,
		  * periods, and apostrophes) in composition
		  *
		  * @param {String} str - string to be evaluated
		  *
		  * @returns {boolean} - indicates whether string is strictly alphabetical (except for any spaces or common
		  *		punctuation the string might have)
		  *
		  * @author kinsho
		  */
		isAlphabeticalWithSpacesAndPunctuation: function(str)
		{
			str = str || '';

			// Strip out any common punctuation and test whether the remaining values are alphabetical
			return this.isAlphabeticalWithSpaces(str.split('.').join('').split("'").join(''));
		},

		/**
		  * Function verifies whether field inputs are strictly numeric in composition 
		  *
		  * @param {String} str - string to be evaluated
		  *
		  * @returns {boolean} - indicates whether string is strictly numeric in composition
		  *
		  * @author kinsho
		  */ 
		isNumerical: function(str)
		{
			var iter;

			str = str || '';

			// Test the value here
			for (iter = str.length - 1; iter >= 0; iter--)
			{
				if ( TEST_CHARACTERS.NUMBERS.indexOf(str.charAt(iter)) < 0 )
				{
					return false;
				}
			}

			return true;
		},

		/**
		 * Function verifies whether field inputs are acceptable - acceptability here denotes that the characters
		 * within the string are alphanumeric in composition, allowing for exceptions according to a predefined
		 * list of acceptable symbols
		 *
		 * @param {String} str - string to be evaluated
		 *
		 * @returns {boolean} - indicates whether string is considered acceptable
		 *
		 * @author kinsho
		 */
		isAcceptable: function(str)
		{
			var iter;

			str = str || '';

			// Test the value here
			for (iter = str.length - 1; iter >= 0; iter--)
			{
				if ( !( (this.testConstants.LOWERCASE.indexOf(str.charAt(iter)) >= 0) ||
						(this.testConstants.UPPERCASE.indexOf(str.charAt(iter)) >= 0) ||
						(this.testConstants.NUMBERS.indexOf(str.charAt(iter)) >= 0) ||
						(this.testConstants.SYMBOLS.indexOf(str.charAt(iter)) >= 0)) )
				{
					return false;
				}
			}

			return true;
		},

		/**
		  * Function verifies whether string is a properly formatted e-mail address 
		  * 
		  * @param {String} str - string to be evaluated
		  *
		  * @return {boolean} - indicates whether string qualifies as an e-mail address
		  *
		  * @author kinsho
		  */
		isEmail: function(str)
		{
			// If no string was passed into the function, pass the test
			if (!(str))
			{
				return true;
			}

			return ( (str.length >= 7) && // check that string is at least as long as the shortest possible e-mail address (a@a.com)
					 (str.indexOf('@') >= 1) && // check that @ symbol is included and is not the first character in the string
					 (str.split('@').length === 2) && // check that the string has only one instance of the @ symbol
					 (str.indexOf('.', str.indexOf('@')) >= str.indexOf('@') + 1) && // check that at least one . symbol is positioned somewhere (not immediately) after the @ symbol
					 (str.substring(str.indexOf('@'), str.length).indexOf('..') < 0) && // check that not two periods are put next to one another following the @ symbol
					 (str.lastIndexOf('.') < str.length - 1) && // check that a domain exists
					 (this.isAlphaNumeric(str.substring(str.lastIndexOf('.') + 1, str.length)) ) ); // check that the domain seems plausible
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
		},

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