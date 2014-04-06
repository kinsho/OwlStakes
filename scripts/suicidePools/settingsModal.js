// ------------------ SUICIDE POOL SETTINGS MODAL ------------------------

window.settingsModal =
{
	MODAL_NAME: 'poolSettingsModal',
	PICKS_NOTICE_MODAL_NAME: 'picksNoticeModal',

	/**
	  * Function is responsible for generating a modal to let a manager modify settings for the pool
	  *
	  * @param event {event} - the event object that triggered the invocation of this function
	  *
	  * @author kinsho
	  */
	openModal: function(event)
	{
		modalManager.openModal(event.data.view.MODAL_NAME);
	},

	/**
	  * Function is responsible for revealing the notice that gets played 
	  *
	  * @param event {event} - the event object that triggered the invocation of this function
	  *
	  * @author kinsho
	  */
	throwUpPickNoticeModal: function(event)
	{
		var modalObject = event.data.view,
			modalID = modalObject.PICKS_NOTICE_MODAL_NAME,
			$noticeModal = $('#modalID');

		// For any single page visit, this modal needs to only be seen once. Thus, the flag here checks
		// whether the modal has been seen within the current visit. If not, display it.
		if ( !($noticeModal.data('visited')) )
		{
			$noticeModal.data('visited', true);
			window[modalID].openModal();
		}
	},

	/**
	  * Function responsible for initializing all listeners on the modal
	  *
	  * @author kinsho
	  */
	initListeners: function()
	{
		var numOfPicksToggle = document.getElementById('numberOfPicksToggleSwitch');

		// Convert the set of radio buttons associated with specifying how many picks a member must make
		// into a toggle switch
		rQuery.toggleSwitch(numOfPicksToggle);

		// Set up a listener to throw up the notice modal that should be shown only once when a user clicks
		// on any one of the options to specify the number of picks that have to be made per week
		$('#' + this.MODAL_NAME).find('span').on('click', { view: this }, this.throwUpPickNoticeModal);
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
	settingsModal.initialize();
});