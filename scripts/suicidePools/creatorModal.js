// ------------------ SUICIDE POOLS CREATOR MODAL - STEP 1 ------------------------

(function()
{
	var modalName = 'createNewPoolModal'; // the name of the modal

	window.creatorModal =
	{
		noticeModal: window.noticeModal,

		/**
		  * Function is responsible for initiating a server-side call to create a new suicide pool
		  *
		  * @param event - the event responsible for invoking this function
		  *
		  * @author kinsho
		  */
		createModal: function(event)
		{
			var data = formSubmit.collectData('createNewPoolForm');

			utilityFunctions.modalAjax(
			{
				type: 'POST',
				url: '/suicidePools/createPool',
				data: data,
				customSuccessHandler: function()
				{
					modalManager.nextModal(event);
				}
			}, event);
		},

		/**
		  * Function is responsible for generating a modal to let the user create a new suicide pool
		  *
		  * @author kinsho
		  */
		openModal: function()
		{
			modalManager.openModal(modalName);
		},

		/**
		  * Function responsible for initializing all listeners on the modal
		  *
		  * @author kinsho
		  */
		initListeners: function()
		{
			$('#createNewPoolModal').find('a.navButton').on('click', this.createModal);
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

}());

// -------------------------------------------------------------

$(document).ready(function()
{
	creatorModal.initialize();
});