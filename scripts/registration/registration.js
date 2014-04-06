// ------------------ REGISTRATION OBJECT ------------------------

window.registration =
{
	/**
	 * Verify that the values in the 'Password' and 'Confirm Password' fields match
	 *
	 * @author kinsho
	 */
	verifyPasswordsMatch: function()
	{
		var password = document.getElementById('password'),
			confirmPassword = document.getElementById('confirmPassword');

		return ( !(password.value) || !(confirmPassword.value) ) ||
			   ( password.value === confirmPassword.value );
	},

	/**
	 * Adjusts the selectable values in the date drop-down field depending on the month currently selected
	 *
	 * @author kinsho
	 */
	adjustDateField: function()
	{
		var dateField = document.getElementById('date'),
			monthField = document.getElementById('month'),
			month = parseInt(monthField.options[monthField.selectedIndex].value),
			days,
			i;

		// Ensure that field stays enabled once a month has been selected
		dateField.disabled = '';

		if (month === 2)
		{
			days = 28;
		}
		else
		{
			days = ( ((month === 4) || (month === 6) || (month === 9) || (month === 11)) ? 30 : 31 );
		}

		// Change the default value on the date drop-down in order to convey to the user that a date can now be selected
		dateField.options[0].text = '--';

		if (days > dateField.options.length - 1)
		{
			for (var i = dateField.options.length; i <= days; i += 1)
			{
				dateField.options[i] = new Option(i, i);
			}
		}
		else if (days < dateField.options.length - 1)
		{
			// Ensures that the user has not selected a date that cannot possibly exist (e.g February 30th)
			if ( parseInt(dateField.options[dateField.selectedIndex].value) > days)
			{
				dateField.selectedIndex = 0;
			}
			dateField.options.length = days + 1;
		}
	},

	/**
	 * Submits form
	 *
	 * @author kinsho
	 */
	submitForm: function(event)
	{
		var data = formSubmit.collectData('registrationForm');

		utilityFunctions.ajax(
		{
			type: 'POST',
			url: '/registration/register',
			data: data,
			success: function(response)
			{
				response = $.parseJSON(response);
			}
		}, event);
	},

	/**
	  * Function responsible for initializing all listeners on the left-hand menu
	  *
	  * @author kinsho
	  */
	initListeners: function()
	{
		$('#month').on('change', this.adjustDateField);
		$('#submitButton').on('click', this.submitForm);
	},

	/**
	  * Initializer function
	  *
	  * @author kinsho
	  */
	initialize: function()
	{
		this.initListeners();
	}
};
//  ---------------------------------

$(document).ready(function()
{
	registration.initialize();
});