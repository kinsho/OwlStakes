/**
 * @module formSubmit
 */

define(['jquery', 'json', 'foundation/constants', 'foundation/utility', 'foundation/modalManager'], function($, JSON, constants, utility, modalManager)
{
	'use strict';

// ----------------- ENUM/CONSTANTS --------------------------
	var OFFSET_FROM_BOTTOM =
		{
			10: 'offsetUp10',
			20: 'offsetUp20',
			30: 'offsetUp30',
			40: 'offsetUp40'
		},

		NATURES =
		{
			POSITIVE: 1,
			NEGATIVE: -1,
			NEUTRAL: 0
		},

		SUCCESS_HEADER_TEXT = 'Success!',
		SUCCESS_BODY_TEXT = 'Done! Happy?',
		ERRORS_HEADER_TEXT = 'We may have a problem here...',

		CONTAINER_EXIT_CLASS = 'exit',
		CONTAINER_ENTRANCE_CLASS = 'enter',
		CONTAINER_EXIT_BUTTON_CLASS = 'exitButton';

// ----------------- PRIVATE FUNCTIONS --------------------------
	/**
	  * Private function that formats all the error messages that were relayed from the server
	  * into an HTML list that can then be inserted into the DOM
	  *
	  * @param {Array} errors - all the error messages that need to be formatted
	  *
	  * @return {String | HTMLElement} usually a list element containing all the errors that are to
	  *		be displayed. In cases where only one error message needs to be listed, that one message itself
	  *		will be returned as a string.
	  *
	  * @author kinsho
	  */
	var formatErrors = function(errors)
		{
			var listElement,
				listItem,
				i;

			// If only one error needs to be displayed, no need to do anything other than to return
			// that one error message
			if (errors.length === 1)
			{
				return errors[0];
			}

			// Create the main list container that will hold all the individual error messages together
			listElement = document.createElement('ul');

			// Insert each error message into the container
			for (i = 0; i < errors.length; i += 1)
			{
				listItem = document.createElement('li');
				listItem.innerHTML = errors[i];
				listElement.appendChild(listItem);
			}

			// Return the list element itself. The logic that invoked this will be responsible for placing
			// this element within the DOM
			return listItem;
		},

		/**
		  * Function meant to provide a generic way of disabling/enabling buttons whenever an AJAX request has
		  * initiated/completed.
		  * Note that the function is meant to ensure that duplicate AJAX requests do not get fired from the user
		  * repeatedly clicking on the the button or link that led to the firing of the AJAX request
		  *
		  *	@param {HTMLElement} targetElement - the clicked element that led to the triggering of the AJAX request
		  *
		  * @author kinsho
		  */
		disableEnableSubmitButton = function(targetElement)
		{
			var $targetElement = $(targetElement),
				isButton = $targetElement.is('[type=button]'),
				isLinkDisabled = $targetElement.data('disabled');

			if (isButton)
			{
				targetElement.disabled = !(targetElement.disabled);
			}
			else
			{
				$targetElement.data('disabled', !(isLinkDisabled));
			}
		};

// ----------------- MODULE DEFINITION --------------------------
	var my =
	{
		// Keep these DOM element references public in case they're needed within custom handler functions
		ERROR_MODAL: 'errorModal',
		ERROR_MODAL_BODY: 'errorModalContent',
		SUCCESS_MODAL: 'successModal',
		SUCCESS_MODAL_HEADER: 'successModalHeader',
		SUCCESS_MODAL_BODY: 'successModalContent',
		SERVER_MESSAGE_CONTAINER: 'serverMessageContainer',
		SERVER_MESSAGE_CONTAINER_HEADER: 'serverMessageContainerHeader',
		SERVER_MESSAGE_CONTAINER_BODY: 'serverMessageContainerBody',

		/**
		  * Function bundles all input/select values from the passed form scope into a key-value object
		  *
		  * @param {HTMLElement} form - the form from which data will be gathered
		  *
		  * @return {Object} a simple object container for all user inputs
		  *
		  * @author kinsho
		  */
		collectData: function(form)
		{
			var $formInput = $(form).find('input, select').not('[type=button]').not(':disabled'),
				dataObj = {};

			$formInput.each(function()
			{
				dataObj[this.name] = (this.type === 'checkbox') ? this.checked : this.value;
			});

			return dataObj;
		},

		/**
		  * Think of this function as a way to prevent users from triggering all modal-related
		  * AJAX calls multiple times while an AJAX call is in the midst of being serviced. The function
		  * also provides a generic way to handle all server-relayed error messages that were generated
		  * while the user was interacting with a modal. Additionally, this method can be invoked
		  * outside the scope of a modal should there be a need to display server errors via a modal.
		  *
		  * @param {Object} settings - the settings that will need to be applied for the AJAX call that
		  *		will be made soon
		  * @param {Event} event - the event that triggered this call
		  *
		  * @author kinsho
		  */
		modalAjax: function(settings, event)
		{
			var wrapperSettings = utility.cloneObject(settings),
				button = event.currentTarget,
				originalErrorFunction = settings.error || function(){},
				originalSuccessFunction = settings.success || function(){},

				// Define an error wrapper that will invoke a specialized error modal to display any error messages
				// returned from the server
				errorHandlerWrapper = function(response, status, errorText)
				{
					var responseData = JSON.parse(response.responseText),
						errors = responseData.errors;

					// Show the error modal after populating its body with the error message returned from the server
					document.getElementById(my.ERROR_MODAL_CONTENT).innerHTML = formatErrors(errors);
					modalManager.openModal(my.ERROR_MODAL);

					// Call the error function that was originally defined within the settings object, provided that
					// one was defined
					originalErrorFunction(response, status, errorText);
				},
				successHandlerWrapper = function(data, status, response)
				{
					// Open the success modal after populating its body with the message returned from the server
					document.getElementById(my.SUCCESS_MODAL_HEADER).innerHTML = (settings.successHeader ||
						SUCCESS_HEADER_TEXT);
					document.getElementById(my.SUCCESS_MODAL_BODY).innerHTML = (settings.successBody ||
						SUCCESS_BODY_TEXT);
					modalManager.openModal(my.SUCCESS_MODAL);

					// Call the success function that was originally defined within the settings object, provided
					// that one was defined
					originalSuccessFunction(data, status, response);
				};

			// Only fire off the AJAX request if the 'linkButton' is already not disabled. A disabled 'linkButton'
			// indicates that the client is already in the midst of handling an AJAX request
			if ( !($(button).data('disabled')) )
			{
				wrapperSettings.customSuccessHandler = settings.customSuccessHandler || successHandlerWrapper;
				wrapperSettings.customErrorHandler = settings.customErrorHandler || errorHandlerWrapper;

				my.ajax(wrapperSettings, event);
			}
		},

		/**
		  * Function serves to handle AJAX requests and provides generic means with which to handle certain types
		  * of responses.
		  *
		  * @param {Object} settings - the settings which to apply to the AJAX call. All parameters and the back-end
		  * 	URL should be present within this object
		  * @param {Event} event - the event that ultimately led to this function being invoked
		  *
		  * @author kinsho
		  */
		ajax: function(settings, event)
		{
			var wrapperSettings = utility.cloneObject(settings),
				beforeSend = settings.beforeSend || function() {},
				success = settings.success || function() {},
				error = settings.error || function() {},
				complete = settings.complete || function() {},
				customErrorHandler = settings.customErrorHandler || undefined,
				customSuccessHandler = settings.customSuccessHandler || undefined,
				successHeader = settings.successHeader || undefined,
				successBody = settings.successBody || undefined;

			/*
				If the event that ultimately led to this function being invoked is directly associated
				with an input button or link, the button should be disabled while this AJAX request is
				being serviced, thus necessitating the need for a function like the one below. We do not
				want multiple AJAX requests to be sent for the same action.
			 */
			disableEnableSubmitButton(event.currentTarget);

			/*
				All the functional callbacks within the AJAX settings object must be wrapped by predefined
				functions that take care of certain actions that have to be performed for all non-specialized
				AJAX requests
			 */
			wrapperSettings.beforeSend = function(request, settings)
			{
				// Hide any outstanding server message container before sending a new AJAX request
				my.hideContainer();

				return beforeSend(request, settings);
			};

			wrapperSettings.complete = function(response, status)
			{
				// If a button or link was responsible for the invocation of this method in the first place,
				// ensure that the user is able to click on it again to send another AJAX request
				disableEnableSubmitButton(event.currentTarget);

				complete(response, status);
			};

			wrapperSettings.success = function(data, status, response)
			{
				// If a custom success handler has been specified, invoke it and ignore all generic handler code.
				if (customSuccessHandler)
				{
					customSuccessHandler(data, status, response);
				}
				// Only execute the generic success handling code if the 'doNotNotify' flag was not set
				else if ( !(settings.doNotNotify) )
				{
					// Put up a message indicating the server request was successful
					my.displayContainer(successHeader || SUCCESS_HEADER_TEXT, successBody || SUCCESS_BODY_TEXT,
						NATURES.POSITIVE);

					if (settings.autoHideContainer)
					{
						window.setTimeout(function()
						{
							my.hideContainer();
						}, 8000);
					}

					// Invoke the original success function that was passed into the function, if one was provided
					success(data, status, response);
				}
			};

			wrapperSettings.error = function(response, status, errorText)
			{
				var responseData = JSON.parse(response.responseText),
					errors = responseData.errors;

				if (errors)
				{
					// If a custom error handler has been specified, invoke it. Otherwise, use the generic handler
					if (customErrorHandler)
					{
						customErrorHandler(response, status, errorText);
					}
					else
					{
						// Put up a message informing the user why the server request failed
						my.displayContainer(ERRORS_HEADER_TEXT, errors, NATURES.NEGATIVE);

						// Invoke the original error function that was passed into the function, if one was provided
						error(response, status, errorText);
					}
				}
			};

			$.ajax(wrapperSettings);
		},

		/**
		  * Function provides a generic means to convey all messages relayed from the server
		  *
		  * @param {String} headerText - the text that will serve as the header of the container
		  * @param {String} bodyText - the text that will go into the body of the container
		  * @param {String} nature - the nature of the request from the server, indicating
		  *		whether the server response was positive, negative, or neutral.
		  *
		  * @author kinsho
		  */
		displayContainer: function(headerText, bodyText, nature)
		{
			var container = document.getElementById(my.SERVER_MESSAGE_CONTAINER),
				header = document.getElementById(my.SERVER_MESSAGE_CONTAINER_HEADER),
				body = document.getElementById(my.SERVER_MESSAGE_CONTAINER_BODY),
				heightRatio;

			// Set the background color of the container to help indicate the nature of the server response
			if (nature === NATURES.POSITIVE)
			{
				container.classList.add(constants.styles.POSITIVE_BACKGROUND_THEME);
			}
			else if (nature === NATURES.NEGATIVE)
			{
				container.classList.add(constants.styles.NEGATIVE_BACKGROUND_THEME);
			}
			else
			{
				container.classList.add(constants.styles.NEUTRAL_BACKGROUND_THEME);
			}

			// Set text within the container
			header.innerHTML = headerText;
			if (nature === NATURES.NEGATIVE)
			{
				body.innerHTML = formatErrors(bodyText);
			}
			else
			{
				body.innerHTML = bodyText;
			}

			// Adjust the location of the relay container depending on its height
			heightRatio = (container.offsetHeight/window.innerHeight);
			if (heightRatio < 0.09)
			{
				container.classList.add(OFFSET_FROM_BOTTOM[10]);
			}
			else if (heightRatio < 0.19)
			{
				container.classList.add(OFFSET_FROM_BOTTOM[20]);
			}
			else if (heightRatio < 0.29)
			{
				container.classList.add(OFFSET_FROM_BOTTOM[30]);
			}
			else
			{
				container.classList.add(OFFSET_FROM_BOTTOM[40]);
			}

			// Slide the container into view with a fancy left shift animation followed by a slight pull back to
			// the right
			container.classList.add(CONTAINER_ENTRANCE_CLASS);
		},

		/**
		  * Function hides the server message container from view
		  *
		  * @author kinsho
		  */
		hideContainer: function()
		{
			var container = document.getElementById(my.SERVER_MESSAGE_CONTAINER);

			// First, slide the container off the screen towards the right, then remove all its
			// custom and transition styling
			container.classList.add(CONTAINER_EXIT_CLASS);
			utility.setEventListener(container, function()
			{
				container.classList.remove(constants.styles.POSITIVE_BACKGROUND_THEME,
					constants.styles.NEGATIVE_BACKGROUND_THEME,
					constants.styles.NEUTRAL_BACKGROUND_THEME,
					CONTAINER_ENTRANCE_CLASS,
					CONTAINER_EXIT_CLASS);
			}, 'animationend', 0, true);
		},

		/**
		 * Function allows the user to move the container to the right manually using the mouse
		 *
		 * @param {Event} event - the event responsible for triggering the invocation of this function
		 *
		 * @author kinsho
		 */
		/** TODO: Figure out whether to allow the user to drag the container
		moveContainer: function(event)
		{
			var mouseStartPosition = event.clientX,
				currentMousePosition = event.clientX,
				container = document.getElementById(my.SERVER_MESSAGE_CONTAINER),
				positionDifferential,

				moveFunction = function(event)
				{
					currentMousePosition = event.clientX;

					positionDifferential = currentMousePosition - mouseStartPosition;

					// Put a leftward limitation on the number of pixels that the container is allowed to move left
					positionDifferential = Math.max(-30, positionDifferential);

					// Apply a translation to the container depending on the position coefficient calculated above
					container.style.marginLeft = positionDifferential;
				},
				stopFunction = function(event)
				{
					currentMousePosition = event.clientX;

					// Remove the mousemove event as we only want the event to fire when the user
					// is moving the container
					utility.removeEventListener(container, moveFunction, 'mousemove');
				};

			// Set up the mousemove and the mouseup listeners to track the movement of the container as well
			// as when the user has finally decided to stop moving the container
			utility.setEventListener(container, moveFunction, 'mousemove', 0, false);
			utility.setEventListener(container, stopFunction, 'mouseup', 0, true);
		}
		*/
	};

// ----------------- LISTENERS --------------------------

	// Set up the listener to close the server message container when its exit icon is clicked on
	utility.setEventListener(document.getElementById(my.SERVER_MESSAGE_CONTAINER).querySelector('.' + CONTAINER_EXIT_BUTTON_CLASS),
		my.hideContainer, 'click', 0, false);

	// Set up the listener to allow the user to drag the server message container off screen
	// utility.setEventListener(document.getElementById(my.SERVER_MESSAGE_CONTAINER), my.moveContainer, 'mousedown', 0, false);

// ----------------- TESTING --------------------------

window.displayContainer = my.displayContainer;
window.hideContainer = my.hideContainer;

// ----------------- END --------------------------


	return my;
});