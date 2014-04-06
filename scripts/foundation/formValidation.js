formValidation = (function()
{
	var symbols = '.@_- ';

	return {

		testConstants:
		{
			LOWERCASE : 'abcdefghijklmnopqrstuvwxyz',
			UPPERCASE : 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
			NUMBERS : '0123456789',
			SYMBOLS : symbols
		},

		msgConstants:
		{
			IS_ALPHABETICAL : 'Only <b>alphabetical letters</b> are allowed here. Please take out any non-alphabetical characters from whatever you typed here.',
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
						 symbols + '). Please correct whatever you typed here so that it meets our standards.',
			IS_INTEGER : 'You can only put positive whole numbers here. No decimal values, alphabetical characters, or any other symbols allowed!',
			IS_LESS_THAN_100_CHARACTERS : 'Only 100 characters are allowed here! You must shorten whatever you typed.'
		},

		failedValidationClass: 'invalid',

		/**
		  * Function verifies whether field inputs are strictly alphanumeric in composition
		  *
		  * @param str - string to be evaluated
		  * @return boolean indicating whether string is strictly alphanumeric
		  *
		  * @author kinsho
		  */ 
		isAlphaNumeric: function(str)
		{
			var iter;

			str += '';

			for (iter = str.length - 1; iter >= 0; iter--)
			{
				if ( !( (this.testConstants.LOWERCASE.indexOf(str.charAt(iter)) >= 0) ||
						(this.testConstants.UPPERCASE.indexOf(str.charAt(iter)) >= 0) ||
						(this.testConstants.NUMBERS.indexOf(str.charAt(iter)) >= 0) ) )
				{
					return false;
				}
			}

			return true;
		},

		/**
		  * Function verifies whether field inputs are strictly alphanumeric (with an exception made for spaces) in composition
		  *
		  * @param str - string to be evaluated
		  * @return boolean indicating whether string is strictly alphanumeric (except for any spaces the string might have)
		  *
		  * @author kinsho
		  */ 
		isAlphaNumericWithSpaces: function(str)
		{
			str += '';

			return this.isAlphaNumeric(str.split(' ').join(''));
		},

		/**
		  * Function verifies whether field inputs are strictly alphanumeric (with an exception made for spaces, periods,
		  * and apostrophes) in composition
		  *
		  * @param str - string to be evaluated
		  * @return boolean indicating whether string is strictly alphanumeric (except for any spaces or punctuation the string might have)
		  *
		  * @author kinsho
		  */
		isAlphaNumericWithSpacesAndPunctuation: function(str)
		{
			str += '';

			return this.isAlphaNumericWithSpaces(str.split('.').join('').split("'").join(''));
		},

		/**
		  * Function verifies whether field inputs are strictly alphanumeric (with an exception made for dashes, periods,
		  * and apostrophes) in composition
		  *
		  * @param str - string to be evaluated
		  * @return boolean indicating whether string is strictly alphanumeric (except for any dashes or punctuation the string might have)
		  *
		  * @author kinsho
		  */
		isAlphaNumericWithDashesAndPunctuation: function(str)
		{
			str += '';

			return this.isAlphaNumeric(str.split('.').join('').split("'").join('').split('-').join('').split('_').join(''));
		},

		/**
		  * Function verifies whether field inputs are strictly alphabetical in composition 
		  *
		  * @param str - string to be evaluated
		  * @return boolean indicating whether string is strictly alphabetical
		  *
		  * @author kinsho
		  */
		isAlphabetical: function(str)
		{
			var iter;
			str += '';

			for (iter = str.length - 1; iter >= 0; iter--)
			{
				if ( !( (this.testConstants.LOWERCASE.indexOf(str.charAt(iter)) >= 0) ||
						(this.testConstants.UPPERCASE.indexOf(str.charAt(iter)) >= 0) ) )
				{
					return false;
				}
			}

			return true;
		},

		/**
		  * Function verifies whether field inputs are strictly alphabetical (with an exception made for spaces) in composition
		  *
		  * @param str - string to be evaluated
		  * @return boolean indicating whether string is strictly alphabetical (except for any spaces the string might have)
		  *
		  * @author kinsho
		  */ 
		isAlphabeticalWithSpaces: function(str)
		{
			str += '';

			return ( (str.split(' ').length > str.length) || // Test to ensure that the string does not solely consist of spaces
				     this.isAlphabetical(str.split(' ').join('')) );
		},

		/**
		  * Function verifies whether field inputs are strictly alphabetical (with an exception made for spaces, periods,
		  * and apostrophes) in composition
		  *
		  * @param str - string to be evaluated
		  * @return boolean indicating whether string is strictly alphabetical (except for any spaces or punctuation the string might have)
		  *
		  * @author kinsho
		  */
		isAlphabeticalWithSpacesAndPunctuation: function(str)
		{
			str += '';

			return this.isAlphabeticalWithSpaces(str.split('.').join('').split("'").join(''));	
		},

		/**
		  * Function verifies whether field inputs are strictly numeric in composition 
		  *
		  * @param str - string to be evaluated
		  * @return boolean indicating whether string is numeric
		  *
		  * @author kinsho
		  */ 
		isNumerical: function(str)
		{
			var iter;
			str += '';

			for (iter = str.length - 1; iter >= 0; iter--)
			{
				if ( !(this.testConstants.NUMBERS.indexOf(str.charAt(iter)) >= 0) )
				{
					return false;
				}
			}

			return true;
		},

		/**
		  * Function verifies whether field inputs are acceptable according to the site's standards
		  *
		  * @param str - string to be evaluated
		  * @return boolean indicating whether string is acceptable
		  *
		  * @author kinsho
		  */ 
		isAcceptable: function(str)
		{
			var iter;
			str += '';

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
		  * @param str - string to be evaluated
		  * @return boolean indicating whether string is acceptable
		  *
		  * @author kinsho
		  */
		isEmail: function(str)
		{
			if (!(str))
			{
				return true;
			}
			str += '';

			return ( (str.length >= 7) && // check that string is at least as long as the shortest possible e-mail address (a@a.com)
					 (str.indexOf('@') >= 1) && // check that @ symbol is included and is not the first character in the string
					 (str.split('@').length == 2) && // check that the string only has one instance of the @ symbol
					 (str.indexOf('.', str.indexOf('@')) >= str.indexOf('@') + 1) && // check that at least one . symbol is positioned somewhere (not immediately) after the @ symbol
					 (str.substring(str.indexOf('@'), str.length).indexOf('..') < 0) && // check that not two periods are put next to one another following the @ symbol
					 (str.lastIndexOf('.') < str.length - 1) && // check that a domain exists
					 (this.isAlphaNumeric(str.substring(str.lastIndexOf('.') + 1, str.length)) ) ); // check that the domain seems plausible
		},

		/**
		  * Function verifies whether value is an integer
		  * 
		  * @param val - value to be evaluated
		  * @return boolean indicating whether the value is an integer
		  *
		  * @author kinsho
		  */
		isInteger: function(val)
		{
			return ( (val.length === 0) ||
					 ((this.isNumerical(val)) && (window.parseInt(val, 10) === window.parseFloat(val))) );
		},

		/**
		  * Function verifies whether value illegally exceeds 100 characters in length
		  * 
		  * @param val - value to be evaluated
		  * @return boolean indicating whether the value is less than 100 characters in length
		  *
		  * @author kinsho
		  */
		isLessThan100Characters: function(str)
		{
			str += '';

			return (str.length <= 100);
		},

		/**
		  * Generates a properly formatted error message depending on the context
		  *
		  * @param element - the element associated with the super tooltip that needs to have its text changed
		  * @param error - string indicating type of error message that needs to be displayed
		  *
		  * @author kinsho
		  */
		setErrorText: function(element, error, pageObjectName)
		{
			var errorMessageConstant = error.constantize();

			// If a generic message exists that correlates to the nature of the error, use that. Otherwise, assume that a specialized error message
			// has been defined and stored within the tooltipMessages object and look there
			superToolTip.changeSuperTipText(element, this.msgConstants[errorMessageConstant] || tooltipMessages[pageObjectName][errorMessageConstant]);
		},

		/**
		  * Verify that the values within the specified element adhere to any number of the standards
		  * either specified above or defined within the page itself
		  *
		  * @param event - the event associated with the element that needs to have its value(s) validated
		  * @return boolean indicating whether value in field successfully passes validation
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
				var view = event.data.view,
					pageObjectName = event.data.pageObjectName,
					pageView = window[pageObjectName],
					$element = $(event.currentTarget),
					validators = $element.data('validators').split(' '),
					associatedFields = $element.data('associated-fields') ? $element.data('associated-fields').split(' ') : [],
					i;

				if ( !(preventRecursionFlag) )
				{
					// prevent this block of code from executing when invoking this function for any other fields
					// that need to be validated alongside the current field
					preventRecursionFlag = true; 

					// For any fields whose validation in part depends on the field currently in context,
					// trigger the change event for those fields
					for (i = associatedFields.length - 1; i >= 0; i -= 1)
					{
						$('#' + associatedFields[i]).trigger('change');
					}

					preventRecursionFlag = false;
				}

				for (i = validators.length - 1; i >= 0; i -= 1)
				{
					if ( ( view[validators[i]] && !((view[validators[i]])($element.val())) ) ||
						 ( pageView[validators[i]] && !((pageView[validators[i]])($element.val())) ))
					{
						$element.addClass(view.failedValidationClass);
						$element.data('validation-error', 'true');
						view.setErrorText($element[0], validators[i], pageObjectName)

						return false;
					}
				}

				$element.removeClass(view.failedValidationClass);
				$element.data('validation-error', '');
				superToolTip.resetSuperTip($element[0]);

				return true;
			};
		}(),

		/**
		  * Attach superTips and validation listeners to all form elements with a
		  * formValidation data attribute
		  *
		  * @author kinsho
		  */
		initValidators: function()
		{
			var view = this,
				pageObjectName = document.getElementById('pageObjectName').value;

			$('input[data-validators], select[data-validators]').each(function()
			{
				var $this = $(this);

				// Initialize supertips
				superToolTip.superTip(this, '');

				// Set up validation listeners on certain input fields
				$this.on('change',
				{
					view: view,
					pageObjectName: pageObjectName // the name of the page, which will prove useful for fetching specialized tooltip messages
				}, view.validateField);
			});
		}
	};
}());