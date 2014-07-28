define(['jquery', 'foundation/utility', 'foundation/constants'], function($, utility, constants)
{

// ----------------- ENUM/CONSTANTS --------------------------
	var OFFSET_CLASS =
		{
			UP: 'up',
			DOWN: 'down',
			LEFT: 'left',
			RIGHT: 'right'
		},

		MODAL_OVERLAY_CLASS = 'modalOverlay',
		MODAL_OVERLAY_STRONGER_CLASS = 'strongerModalOverlay',

		HALF_FADE_OUT_CLASS = 'halfFadeout',
		FADE_IN_CLASS = 'fadeIn',

		HAS_EXIT_BUTTON_CLASS = 'hasExitButton',
		NAV_BUTTON_CLASS = 'navButton';

// ----------------- MODULE DEFINITION --------------------------
	var my =
		{
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
					$overlay = $('.' + MODAL_OVERLAY_CLASS).is(':visible') ? $('.' + MODAL_OVERLAY_STRONGER_CLASS) : $('.' + MODAL_OVERLAY_CLASS),
					$visibleModal = $('.' + constants.modal.MODAL + ':visible'),
					fadeOverlayIn = function()
					{
						// If any modal is currently visible, fade it out a bit before displaying the new modal
						$visibleModal.addClass(HALF_FADE_OUT_CLASS);

						$overlay.addClass(FADE_IN_CLASS);
						$modal.addClass(OFFSET_CLASS.UP);
						utility.setTransitionListeners($overlay[0], 0, true, fadeInModalFunction);
					},
					fadeInModalFunction = function()
					{
						$modal.addClass(FADE_IN_CLASS).removeClass(OFFSET_CLASS.UP);
					};

				// Prepare the elements for display
				$overlay.show();
				$modal.show();

				// Now manage the overlay and fading animations necessary to gracefully display the modal
				// The timeout below is used to ensure the element are rendered within the flow of the DOM before being animated upon
				window.setTimeout(fadeOverlayIn, 50);
			},

			/**
			  * Closes the modal that is identified by the passed modal ID
			  *
			  * @param {Event} event - the event responsible for invoking this function, provided only if a listener was responsible
			  *		for triggering the invocation.
			  * @param {String} modalID - if provided, the ID of the modal that will need to be closed
			  *
			  * @author kinsho
			  */
			closeModal: function(event, modalID)
			{
				// Find the modal to close using either the event
				var modalID = modalID ||
						$(event.currentTarget).closest('.' + constants.modal.MODAL).attr('id') ||
						$(event.currentTarget).closest('.' + constants.modal.NESTED_MODAL).attr('id'),
					$modal = $('#' + modalID),
					$underlyingModal = $('.' + constants.modal.MODAL + ':visible').not('.' + constants.modal.NESTED_MODAL),
					$overlay = $('.' + MODAL_OVERLAY_STRONGER_CLASS).is(':visible') ? $('.' + MODAL_OVERLAY_STRONGER_CLASS) : $('.' + MODAL_OVERLAY_CLASS),
					hideModalElements = function()
					{
						$overlay.hide();
						$modal.hide();
					},
					fadeOverlayOut = function()
					{
						// If the user is returning to another modal, ensure that the modal is fully faded in as the stronger overlay is faded out
						$underlyingModal.removeClass(HALF_FADE_OUT_CLASS);

						$overlay.removeClass(FADE_IN_CLASS);
						$modal.removeClass(OFFSET_CLASS.DOWN);
						utilityFunctions.setTransitionListeners($overlay[0], 0, true, hideModalElements);
					};

				// Now manage the overlay and fading animations necessary to gracefully close the modal
				$modal.addClass(OFFSET_CLASS.DOWN).removeClass(FADE_IN_CLASS);
				utilityFunctions.setTransitionListeners($modal[0], 0, true, fadeOverlayOut);
			},

			/**
			  * Exits the current modal and fades in the next modal (in order to get a wizard flow going)
			  *
			  * @param event - the event responsible for invoking this function, if a listener was responsible
			  *		for triggering the invocation.
			  * @param modalID - if provided, the ID of the modal that will act as the next step of this 'wizard'
			  *
			  * @author kinsho
			  */
			nextModal: function(event, modalID)
			{
				var $eventTarget = $(event.currentTarget),
					modalID = modalID || $eventTarget.data('nextModal'),
					$currentModal = $eventTarget.closest('.' + constants.modal.MODAL)
					$nextModal = $('#' + modalID),
					fadeCurrentModalOut = function()
					{
						$currentModal.addClass(OFFSET_CLASS.LEFT).removeClass(FADE_IN_CLASS);
						$nextModal.addClass(OFFSET_CLASS.RIGHT);

						utilityFunctions.setTransitionListeners($nextModal[0], 0, true, fadeNewModalIn);
					},
					fadeNewModalIn = function()
					{
						$nextModal.addClass(FADE_IN_CLASS).removeClass(OFFSET_CLASS.RIGHT);
						$currentModal.hide();
					};

					$nextModal.show();
					// The timeout below is used to ensure the element are rendered within the flow of the DOM before being animated upon
					window.setTimeout(fadeCurrentModalOut, 50);
			},

			/**
			  * The generic handler that'll execute any generic action explicitly associated with any navigation link
			  *
			  * @param {Event} event - the event object responsible for the invocation of this function
			  *
			  * @author kinsho
			  */
			handleAction: function(event)
			{
				var $navLink = $(event.currentTarget),
					action = $navLink.data('action');

				if (action)
				{
					if (action === 'close')
					{
						my.closeModal(event);
					}
				}
			}

		};

// ----------------- INITIALIZATION LOGIC --------------------------

	var bodyOverlay,
		strongerBodyOverlay,
		$modals = $('.' + constants.modal.MODAL, '.' + constants.modal.NESTED_MODAL);

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
		bodyOverlay.className = MODAL_OVERLAY_CLASS;

		strongerBodyOverlay = document.createElement('DIV');
		strongerBodyOverlay.className = MODAL_OVERLAY_STRONGER_CLASS;

		document.body.appendChild(bodyOverlay);
		document.body.appendChild(strongerBodyOverlay);

		$(bodyOverlay).hide();
		$(strongerBodyOverlay).hide();
	}

// ----------------- LISTENER SET-UP --------------------------

	// For all modals with close buttons, set up listeners to let users close the modals by clicking
	// on these close buttons
	$modals.each(function()
	{
		var $this = $(this);

		$this.find('.' + HAS_EXIT_BUTTON_CLASS).on('click', my.closeModal);
	});

	// For all navigation links, set up a handler to handle generic actions that are specified via a
	// generic action data attribute
	$modals.find('.' + NAV_BUTTON_CLASS).on('click', my.handleAction);

// ----------------- END --------------------------
	return my;
});