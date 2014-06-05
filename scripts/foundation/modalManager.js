define(['jquery', 'utility'], function($, utility)
{
// ----------------- MODULE DEFINITION --------------------------

	var my =
	{
		MODAL_OVERLAY_CLASS = 'modalOverlay',
		MODAL_OVERLAY_STRONGER_CLASS = 'strongerModalOverlay',

		/**
		  * Opens a modal that identified by the passed modal ID
		  *
		  * @param {String} modalID - the ID of the modal that will need to be opened
		  *
		  * @author kinsho
		  */
		openModal: function(modalID)
		{
			var $modal = $('#' + modalID),
				$overlay = $('.modalOverlay').is(':visible') ? $('.strongerModalOverlay') : $('.modalOverlay'),
				$visibleModal = $('.modal:visible'),
				fadeOverlayIn = function()
				{
					// If any modal is currently visible, fade it out a bit before displaying the new modal
					$visibleModal.addClass('halfFadeOut');

					$overlay.addClass('fadeIn');
					$modal.addClass('offsetUp');
					utility.setTransitionListeners($overlay[0], fadeInModalFunction);
				},
				fadeInModalFunction = function()
				{
					$modal.addClass('fadeIn').removeClass('offsetUp');

					// Remove all transition listeners that were set within the scope of the openModal function
					utility.removeTransitionListeners($overlay[0], fadeInModalFunction);
				};

			// Prepare the elements for display
			$overlay.show();
			$modal.show();

			// Now manage the overlay and fading animations necessary to gracefully display the modal
			window.setTimeout(fadeOverlayIn, 50);
		},

		/**
		  * Closes the modal that is identified by the passed modal ID
		  *
		  * @param {String} event - the event responsible for invoking this function, if a listener was responsible
		  *				   for triggering the invocation.
		  * @param {String} modalID - if provided, the ID of the modal that will need to be closed
		  *
		  * @author kinsho
		  */
		closeModal: function(event, modalID)
		{
			var modalID = modalID || $(event.currentTarget).closest('.modal').attr('id') || $(event.currentTarget).closest('.nestedModal').attr('id'),
				$modal = $('#' + modalID),
				$underlyingModal = $('.modal:visible').not('.nestedModal'),
				$overlay = $('.strongerModalOverlay').is(':visible') ? $('.strongerModalOverlay') : $('.modalOverlay'),
				hideModalElements = function()
				{
					$overlay.hide();
					$modal.hide();

					// Remove all transition listeners that were set within the scope of the closeModal function
					utilityFunctions.removeTransitionListeners($modal[0], fadeOverlayOut);
					utilityFunctions.removeTransitionListeners($overlay[0], hideModalElements);
				},
				fadeOverlayOut = function()
				{
					// If the user is returning to another modal, ensure that the modal is fully faded in alongside the overlay being removed
					$underlyingModal.removeClass('halfFadeOut');

					$overlay.removeClass('fadeIn');
					$modal.removeClass('offsetDown');
					utilityFunctions.setTransitionListeners($overlay[0], hideModalElements);
				};

			// Now manage the overlay and fading animations necessary to gracefully close the modal
			$modal.addClass('offsetDown').removeClass('fadeIn');
			utilityFunctions.setTransitionListeners($modal[0], fadeOverlayOut);
		},

		/**
		  * Exits the current modal and fades in the next modal (to get a wizard flow going)
		  *
		  * @param event - the event responsible for invoking this function, if a listener was responsible
		  *				   for triggering the invocation.
		  * @param modalID - if provided, the ID of the modal that will act as the next step of this 'wizard'
		  *
		  * @author kinsho
		  */
		nextModal: function(event, modalID)
		{
			var $eventTarget = $(event.currentTarget),
				modalID = modalID || $eventTarget.data('nextModal'),
				$currentModal = $eventTarget.closest('.modal')
				$nextModal = $('#' + modalID),
				fadeCurrentModalOut = function()
				{
					$currentModal.addClass('offsetLeft').removeClass('fadeIn');
					$nextModal.addClass('offsetRight');

					utilityFunctions.setTransitionListeners($nextModal[0], fadeNewModalIn);
				},
				fadeNewModalIn = function()
				{
					$nextModal.addClass('fadeIn').removeClass('offsetRight');
					$currentModal.hide();

					// Remove all transition listeners that were set within the scope of the nextModal function
					utilityFunctions.removeTransitionListeners($nextModal[0], fadeNewModalIn);
				};

				$nextModal.show();
				window.setTimeout(fadeCurrentModalOut, 50);
		},

		/**
		  * The generic handler that'll execute any generic action explicitly associated
		  * any navigation link
		  *
		  * @param event {Event} - the event object responsible for the invocation of this function
		  *
		  * @author kinsho
		  */
		handleAction: function(event)
		{
			var view = event.data.view,
				$navLink = $(event.currentTarget),
				action = $navLink.data('action');

			if (action)
			{
				if (action === 'close')
				{
					view.closeModal(event);
				}
			}
		},

		/**
		  * Sets up generic listeners on each and every modal within the HTML document
		  *
		  * @author kinsho
		  */
		initiateModalListeners: function()
		{
		},

		/**
		  * Creates an element that will be used to generate the overlay effect provided that a
		  * a modal DIV is present within the HTML on the screen
		  *
		  * @author kinsho
		  */
		initiateModalOverlay: function()
		{
		},

		/**
		  * Upon page load, function handles some important pre-processing on all modal elements,
		  * if they're present within the HTML.
		  *
		  * @author kinsho
		  */
		initiateModals: function()
		{
		}
	};

// ----------------- INITIALIZATION LOGIC --------------------------

	var bodyOverlay,
		strongerBodyOverlay,
		$modals = $('.modal, .nestedModal');

	$modals.each(function()
	{
		var $this = $(this);

		// All modal elements must be initially hidden from rendering
		$this.hide();

		// All modal elements located within the content of the body element must be moved outside
		// and instead reset as children of the body element
		$this.clone(true).appendTo('body');
		this.parentNode.removeChild(this);
	});

	// Creates the elements that will be used to generate the overlay effect provided that a
	// a modal DIV is present within the HTML on the screen
	if ($modals.length)
	{
		bodyOverlay = document.createElement('DIV');
		bodyOverlay.className = my.MODAL_OVERLAY_CLASS;

		strongerBodyOverlay = document.createElement('DIV');
		strongerBodyOverlay.className = my.MODAL_OVERLAY_STRONGER_CLASS;

		document.body.appendChild(bodyOverlay);
		document.body.appendChild(strongerBodyOverlay);

		$(bodyOverlay).hide();
		$(strongerBodyOverlay).hide();
	}

	// For all modals with close buttons, set up listeners to let users close the
	// modals by clicking on these close buttons
	$modals.each(function()
	{
		var $this = $(this);

		$this.find('.hasExitButton').on('click', my.closeModal);
	});

	// For all navigation links, set up a handler to handle generic actions that
	// are specified via a generic action data attribute
	$modals.find('.navButton').on('click', { view : my }, my.handleAction);

	return my;
});