// ------------------ PICKS NOTICE MODAL ------------------------

window.picksNoticeModal =
{
	MODAL_NAME: 'picksNoticeModal',

	/**
	  * Function is responsible for displaying the notice modal
	  *
	  * @author kinsho
	  */
	openModal: function()
	{
		modalManager.openModal(this.MODAL_NAME);
	},

	/**
	  * Function responsible for initializing all listeners on the modal
	  *
	  * @author kinsho
	  */
	initListeners: function()
	{
	},

	/**
	  * Initializer function
	  *
	  * @author kinsho
	  */
	initialize: function()
	{
	}

};

// -------------------------------------------------------------

$(document).ready(function()
{
	noticeModal.initialize();
});