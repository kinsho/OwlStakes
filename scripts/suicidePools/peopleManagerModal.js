// ------------------ SUICIDE POOL MEMBER MANAGER MODAL ------------------------

window.memberManagerModal =
{
	SEARCH_USER_FILTER_URL: '/suicidePools/getNames',
	MODAL_NAME: 'managePeopleModal',

	/**
	  * Function is responsible for generating a modal to let the user create a new suicide pool
	  *
	  * @param event {event} - the event object that triggered the invocation of this function
	  *
	  * @author kinsho
	  */
	openModal: function(event)
	{
		modalManager.openModal(event.data.view.MODAL_NAME);

		formSubmit.ajax(
		{
			url: 'suicidePools/getMembers',
			success: function(response)
			{
				var response = $.parseJSON(response),
					membersTableContainer = document.getElementById('managePeopleMembersTable');

				membersTableContainer.innerHTML = response.html;
			}
		}, event);
	},

	/**
	  * Function serves to initialize listeners on elements that may have been generated
	  * dynamically well after page load
	  *
	  * @author kinsho
	  */
	addListeners: function()
	{
		var $memberRows = $('#managePeopleMembersTable').find('tr');
	},

	/**
	  * Function responsible for initializing all listeners on the modal
	  *
	  * @author kinsho
	  */
	initListeners: function()
	{
		var searchUserField = document.getElementById('searchUserField');

		// Set up a autocomplete search filter on the field used to search for user names
		rQuery.autocomplete(searchUserField, this.SEARCH_USER_FILTER_URL, 3);
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

// -------------------------------------------------------------

$(document).ready(function()
{
	memberManagerModal.initialize();
});