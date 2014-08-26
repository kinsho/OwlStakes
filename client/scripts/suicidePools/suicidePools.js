// ------------------ SUICIDE POOLS MAIN OBJECT ------------------------

window.suicidePools =
{
	CREATOR_MODAL: 'creatorModal',
	MEMBER_MANAGER_MODAL: 'memberManagerModal',
	SETTINGS_MODAL: 'settingsModal',

	/**
	  * Function responsible for initializing all listeners on the main suicide pools page
	  *
	  * @author kinsho
	  */
	initListeners: function()
	{
		document.getElementById('createPoolButton').onclick = window[this.CREATOR_MODAL].openModal;

		$('.peopleManagerLink').on('click', { view: window[this.MEMBER_MANAGER_MODAL] }, window[this.MEMBER_MANAGER_MODAL].openModal);
		$('.settingsLink.manager').on('click', { view: window[this.SETTINGS_MODAL] }, window[this.SETTINGS_MODAL].openModal);
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
	window.suicidePools.initialize();
});