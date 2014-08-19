define(['jquery', 'superTip', 'foundation/constants', 'main'], function($, superTip, constants, main)
{
	'use strict';

// ----------------- ENUM/CONSTANTS --------------------------
	var TEST_CHARACTERS =
		{
			LOWERCASE : 'abcdefghijklmnopqrstuvwxyz',
			UPPERCASE : 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
			NUMBERS : '0123456789',
			SYMBOLS : '.@_- '
		},
		MESSAGES =
		{
			IS_ALPHABETICAL: 'Only <b>alphabetical letters</b> are allowed here. Please take out any non-alphabetical characters from whatever you typed here.',
			IS_ALPHABETICAL_WITH_SPACES : 'Only <b>alphabetical letters and spaces</b> are allowed here. ' +
				'Please take out any non-alphabetical and non-space characters from whatever you typed here.',
			IS_ALPHABETICAL_WITH_SPACES_AND_PUNCTUATION: 'Only <b>alphabetical letters, spaces, apostrophes, and periods</b> are allowed here. ' +
				'Please take out any non-alphabetical and other unacceptable characters from whatever you typed here.',
			IS_NUMERICAL : 'Only <b>numbers</b> are allowed here. Please take out any non-numerical characters from whatever you typed here.',
			IS_ALPHANUMERIC : 'Only <b>alphabetical letters and numbers</b> are allowed here. ' + 
				'Please take out any non-numerical and non-alphabetical characters from whatever you typed here.',
			IS_ALPHANUMERIC_WITH_SPACES : 'Only <b>alphabetical letters, numbers, and spaces</b> are allowed here. ' +
				'Please take out any non-alphabetical, non-numerical, and non-space characters from whatever you typed here.',
			IS_ALPHANUMERIC_WITH_SPACES_AND_PUNCTUATION : 'Only <b>alphabetical letters, numbers, spaces, apostrophes, and periods</b> are allowed here. ' +
				'Please take out any non-alphabetical, non-numerical, and other unacceptable characters from whatever you typed here.',
			IS_ALPHANUMERIC_WITH_DASHES_AND_PUNCTUATION : 'Only <b>alphabetical letters, numbers, dashes, underscores, periods, and apostrophes</b> are allowed here. ' +
				'Please take out any non-alphabetical, non-numerical, and other unacceptable characters from whatever you typed here.',
			IS_EMAIL : 'The e-mail address you typed here failed to meet the basic format expected of an e-mail address. Please correct this.',
			IS_ACCEPTABLE : 'You typed something that we consider illegal! ' +
				'Please keep in mind that whatever you type here can only be comprised of letters, numbers, and the following acceptable characters (' +
				TEST_CHARACTERS.SYMBOLS + '). Please correct whatever you typed here so that it meets our standards.',
			IS_INTEGER : 'You can only put positive whole numbers here. No decimal values, alphabetical characters, or any other symbols allowed!',
			IS_LESS_THAN_100_CHARACTERS : 'Only 100 characters are allowed here! You must shorten whatever you typed.'
		},

		FAILED_VALIDATION_CLASS = 'invalid';

// ----------------- MODULE DEFINITION --------------------------
	var my =
	{
		/**
		  * Function verifies whether field inputs are strictly alphanumeric in composition
		  *
		  * @param {String} str - string to be evaluated
		  *
		  * @returns {boolean} indicates whether string is strictly alphanumeric
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
		  * @returns {boolean} indicates whether string is strictly alphanumeric (except for any spaces
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
		  * @returns {boolean} indicates whether string is strictly alphanumeric (except for any spaces or punctuation
		  *		the string might have)
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
		  * Function verifies whether field inputs are strictly alphanumeric (with an exception made for dashes, periods,
		  * and apostrophes) in composition
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
		  * @return {boolean} indicates whether string is strictly alphabetical
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
		  * @returns {boolean} indicates whether string is strictly alphabetical (except for any spaces the string
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
		  * @returns {boolean} indicates whether string is strictly alphabetical (except for any spaces or common
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
		  * @returns {boolean} indicates whether string is strictly numeric in composition
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
		 * @returns {boolean} indicates whether string is considered acceptable
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
		  * @return {boolean} indicates whether string qualifies as an e-mail address
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
		  * @returns {boolean} indicates whether the value qualifies as an integer
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
		  * Function verifies whether value is no longer than a hundred characters in length
		  * 
		  * @param {String} str - input to be evaluated
		  *
		  * @returns {boolean} indicates whether the value is less than 100 characters in length
		  *
		  * @author kinsho
		  */
		isLessThan100Characters: function(str)
		{
			str = str || '';

			// Test the length of the string here
			return (str.length <= 100);
		},

		/**
		  * Generates a properly formatted error message depending on the context
		  *
		  * @param {HTMLElement} element - the element associated with the superTip that needs to
		  *		have its text changed
		  * @param {String} error - label corresponding to the error message that needs to be displayed
		  *
		  * @author kinsho
		  */
		setErrorText: function(element, error)
		{
			// Format the passed error label so that we can use it as a reference label
			var errorMessageConstant = error.constantize();

			// If a generic message exists that correlates to the nature of the error, use that. Otherwise, assume that
			// a specialized error message has been defined and stored within the 'constants' module and look there
			superTip.changeSuperTipText(element, MESSAGES[errorMessageConstant] || constants.tooltipMessages[errorMessageConstant]);
		},

		/**
		  * Verify that the value within the specified element adhere to all the standards that are explicitly
		  * noted within specially marked data attributes
		  *
		  * @param {Event} event - the event associated with the element that needs to have its value(s) validated
		  *
		  * @returns {boolean} indicated whether the value(s) within the target element successfully passed all of
		  *		its validation tests
		  *
		  * @author kinsho
		  */
		validateField: function()
		{
			/* 
			 * The flag here is used in a closure context in order to prevent this function from possibly being 
			 * invoked over and over again when co-validating any fields that are explicitly associated with the
			 * field that triggered the original invocation of this function
			 */
			var preventRecursionFlag = false;

			return function(event)
			{
				var element = event.currentTarget,
					validators = element.getAttribute('data-validators').split(' '),
					associatedFields = element.getAttribute('data-associated-fields') ? element.getAttribute('data-associated-fields').split(' ') : [],
					i;

				// Prevent this block of code from executing more than once when invoking this function for
				// any other fields that need to be validated alongside the current field
				if ( !(preventRecursionFlag) )
				{
					preventRecursionFlag = true; 

					// For any fields whose validation in part depends on the field currently in context,
					// trigger the change event for those fields in order to put them through their respective
					// validation tests
					for (i = associatedFields.length - 1; i >= 0; i -= 1)
					{
						document.getElementById(associatedFields[i]);
					}

					preventRecursionFlag = false;
				}

				for (i = validators.length - 1; i >= 0; i -= 1)
				{
					if ( ( my[validators[i]] && !((my[validators[i]])(element.value)) ) ||
						 ( main[validators[i]] && !((main[validators[i]])(element.value)) ))
					{
						// Mark the target element with error indicators and cease execution of any further validation logic
						element.classList.add(FAILED_VALIDATION_CLASS);
						element.setAttribute('data-validation-error', 'true');
						my.setErrorText(element, validators[i]);

						return false;
					}
				}

				// Reset any error indicators on the target element
				element.classList.remove(FAILED_VALIDATION_CLASS);
				element.setAttribute('data-validation-error', '');
				superTip.resetSuperTip(element); // Unset any error message that may have been placed there earlier

				return true;
			};
		}()
	};

// ----------------- LISTENER SET-UP --------------------------

	// Set up change listeners on every form element that will need to have its respective input undergo validation
	document.body.querySelector('input[data-validators], select[data-validators]').(function()
	{
		var $this = $(this);

		// Initialize supertips
		superTip.superTip(this, '');

		// Set up validation listeners on certain input fields
		$this.on('change', my.validateField);
	});

// ----------------- END --------------------------
	return my;
});