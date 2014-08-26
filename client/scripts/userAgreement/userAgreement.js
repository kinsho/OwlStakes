// ------------------ REGISTRATION OBJECT ------------------------

window.userAgreement =
{
	/**
	 * Sends a request to the server to activate the account
	 *
	 * @author kinsho
	 */
	acceptAgreement: function(event)
	{
		formSubmit.ajax(
		{
			type: 'POST',
			url: '/userAgreement/accept',
			success: function()
			{
				var button = document.getElementById('acceptButton');

				/*
				 * Remove the supertip on the button and thank the user for accepting the agreement
				 * Also make sure to disable the button to prevent a second request to the server
				 */
				superToolTip.resetSuperTip(button);
				button.disabled = true;
				button.value = 'Thank You!';
			},
		}, event);
	},

	/**
	  * Function responsible for initializing all listeners on the user agreement page
	  *
	  * @author kinsho
	  */
	initListeners: function()
	{
		$('#acceptButton').on('click', this.acceptAgreement);
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
	userAgreement.initialize();
});