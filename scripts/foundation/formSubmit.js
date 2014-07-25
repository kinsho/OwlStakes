-define(['jquery', 'foundation/constants', 'foundation/utility'], function($, constants, utility)
{
// ----------------- ENUM/CONSTANTS --------------------------
	var SHIFT_TRANSITION =
		{
			LEFT: 'shiftServerContainerLeft',
			SLIGHTLY_RIGHT: 'shiftServerContainerSlightlyRight',
			RIGHT: 'shiftServerContainerRight'
		},

		OFFSET_FROM_BOTTOM =
		{
			10: 'offsetUp10',
			20: 'offsetUp20',
			30: 'offsetUp30',
			40: 'offsetUp40'
		},

		SERVER_CONTAINER =
		{
			HEADER_CLASS: 'header',
			BODY_CLASS: 'message',
			CONTAINER: 'serverMessageContainer'
		},

		NATURES =
		{
			POSITIVE: 0,
			NEGATIVE: 1,
			NEUTRAL: 2
		},

		SUCCESS_HEADER_TEXT = 'Success!',
		SUCCESS_BODY_TEXT = 'Done! Happy?',
		ERRORS_HEADER_TEXT = 'We may have a problem here...';

// ----------------- PRIVATE FUNCTIONS --------------------------
		/**
		  * Private function that formats all the error messages that were relayed from the server
		  * into one string
		  *
		  * @param {Array} errors - all the error messages that need to be formatted
		  *
		  * @return {String} - a string that is to be directly inserted into the body of the server
		  *		relay container
		  *
		  * @author kinsho
		  */
		var formatErrors = function(errors)
			{
				var listElement,
					listItem;

				// If only one error needs to be displayed, no need to do anything other than to return
				// that one error message
				if (errors.length === 1)
				{
					return errors[0];
				}

				// Create the main list container that'll hold all the individual error messages together
				listElement = document.createElement('ul');

				// Insert each error message into the container
				for (i = 0; i < errors.length; i += 1)
				{
					listItem = document.createElement('li');
					listItem.innerHTML = errors[i];
					listElement.appendChild(listItem);
				}

				// Return the list element itself. The logic that invoked this will be responsible for placing this element
				// within the DOM
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
					isButton = $targetElement.is('input[type=button]'),
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

		/**
		  * Function bundles all input/select values from a passed scope into a key-value object
		  *
		  * @param {$} $form - the form from which data will be gathered
		  *
		  * @return {Object} - a simple object container for all user inputs
		  *
		  * @author kinsho
		  */
		collectData: function($form)
		{
			var $formInput = $form.find('input, select').not('[type=button]').not(':disabled'),
				dataObj = {};

			$formInput.each(function()
			{
				if (this.type === 'checkbox')
				{
					dataObj[this.name] = this.checked;
				}
				else
				{
					dataObj[this.name] = this.value;
				}
			});

			return dataObj;
		},

		/**
		  * Think of this function as a way to prevent users from triggering all modal-related
		  * AJAX calls multiple times while an AJAX call is in the midst of being serviced. The function
		  * also provides a generic way to handle all server-relayed error messages that were generated
		  * while the user was interacting with a modal
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
				originalCompleteFunction = settings.complete || function(){},
				originalSuccessFunction = settings.success || function(){},

				// Define an error wrapper that'll invoke a specialized error modal to display any error messages
				// returned from the server
				errorHandlerWrapper = function(response, status, errorText)
				{
					var responseData = $.parseJSON(response.responseText),
						errors = responseData.errors;

					// Show the error modal after populating its body with the error message returned from the server
					document.getElementById(my.ERROR_MODAL_CONTENT).innerHTML = formatErrors(errors);
					modalManager.openModal(my.ERROR_MODAL);

					// Call the 'error' function that was originally defined within the settings object, provided that one was defined
					originalErrorFunction(response, status, errorText);
				},
				successHandlerWrapper = function(data, status, response)
				{
					// Open the success modal after populating its body with the message returned from the server
					document.getElementById(my.SUCCESS_MODAL_HEADER).innerHTML = (settings.successHeader || my.SUCCESS_MODAL_HEADER_TEXT);
					document.getElementById(my.SUCCESS_MODAL_BODY).innerHTML = (settings.successBody || my.SUCCESS_MODAL_BODY_TEXT);
					modalManager.openModal(my.SUCCESS_MODAL);

					// Call the 'success' function that was originally defined within the settings object, provided that one was defined
					originalSuccessFunction(data, status, response);
				};

			// Only fire off the AJAX request if the 'linkButton' is already not disabled. A disabled 'linkButton'
			// indicates that the client is already in the midst of handling an AJAX request
			if ( !($(button).data('disabled')) )
			{
				// Disable the linkButton, regardless of whether it's an actual button or a modal navigation link
				disableEnableSubmitButton(button);

				wrapperSettings.customSuccessHandler = settings.customSuccessHandler || successHandlerWrapper;
				wrapperSettings.customErrorHandler = settings.customErrorHandler || errorHandlerWrapper;

				this.ajax(wrapperSettings, event);
			}
		},

		/**
		  * Function serves to handle AJAX requests and provides generic means with which to handle
		  * certain types of responses.
		  * 
		  * @param {Object} settings - the settings which to apply to the AJAX call. All parameters and the
		  *		destination URL should be present within this object
		  * @param {Event} event - the event that ultimately led to this function being invoked
		  *
		  * @author kinsho
		  */
		ajax: function(settings, event)
		{
			var view = this,
				wrapperSettings = utility.cloneObject(settings),
				activeElement = event ? event.currentTarget : {},
				isActiveElementButton = ((activeElement.tagName === 'INPUT') && (activeElement.type === 'button')),
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
				with an input button, the button should be disabled while this AJAX request is being
				serviced, thus necessitating the need for a function like the one below. We do not
				want multiple AJAX requests to be sent for the same action.
			 */
			disableEnableSubmitButton();

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
				// Enable the submit button if a button was responsible for the invocation of this
				// method in the first place
				disableEnableSubmitButton();

				complete(response, status);
			};

			wrapperSettings.success = function(data, status, response)
			{
				// If a custom success handler has been specified, invoke it and ignore all generic handler code.
				if (customSuccessHandler)
				{
					customSuccessHandler(data);
				}
				// Only execute the generic success handling code if the 'doNotNotify' flag was not set
				else if ( !(settings.doNotNotify) )
				{
					// Put up a message indicating the server request was successful
					my.displayContainer(successHeader || SUCCESS_HEADER_TEXT, successBody || SUCCESS_BODY_TEXT, NATURES.POSITIVE);

					// Invoke the original success function that was passed into the function, if one exists
					success(data, status, response);
				}
			};

			wrapperSettings.error = function(response, status, errorText)
			{
				var responseData = $.parseJSON(response.responseText),
					recaptchaReloadButton = document.getElementById('recaptcha_reload'),
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
						// Put up a message indicating the server request failed and describe why
						my.displayContainer(ERRORS_HEADER_TEXT, errors, NATURES.NEGATIVE);

						// Invoke the original error function that was passed into the function, if one exists
						error(response, status, errorText);
					}
				}

				// In case the request involved a reCAPTCHA test that the user failed to pass, make sure that the reCAPTCHA test
				// client is reloaded with a new word
				if (!(responseData.recaptchaTestPassed))
				{
					$(recaptchaReloadButton).trigger('click');
				}
			};

			// Hide all error messages and success indicators from view before initiating the AJAX connection
			$.ajax(wrapperSettings);
		},

		/**
		  * Function displays all messages relayed from the server within a designated
		  * container meant to hold all response
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
			var view = this,
				container = document.getElementById(SERVER_MESSAGE_CONTAINER),
				$container = $(container),
				$header = $container.children('.' + SERVER_CONTAINER.HEADER_CLASS),
				$body = $successContainer.children('.' + SERVER_CONTAINER.BODY_CLASS);

			$container.addClass(constants.styles.BLOCK_DISPLAY);

			// Set the background color of the container to help indicate the nature of the server response
			if (nature === this.NATURES.POSITIVE)
			{
				$container.addClass(constants.styles.POSITIVE_BACKGROUND_THEME);
			}
			else if (nature === this.NATURES.NEGATIVE)
			{
				$container.addClass(constants.styles.NEGATIVE_BACKGROUND_THEME);
			}
			else
			{
				$container.addClass(constants.styles.NEUTRAL_BACKGROUND_THEME);
			}

			// Set the text within the container
			$header.html(headerText);
			if (nature === this.NATURES.NEGATIVE)
			{
				$body.html(formatErrors(bodyText));
			}
			else
			{
				$body.html(bodyText);
			}

			// Adjust the location of the relay container depending on its height
			heightRatio = (container.offsetHeight/window.innerHeight);
			if (heightRatio < 0.09)
			{
				$container.addClass(OFFSET_FROM_BOTTOM[10]);
			}
			else if (heightRatio < 0.19)
			{
				$container.addClass(OFFSET_FROM_BOTTOM[20]);
			}
			else if (heightRatio < 0.29)
			{
				$container.addClass(OFFSET_FROM_BOTTOM[30]);
			}
			else
			{
				$container.addClass(OFFSET_FROM_BOTTOM[40]);
			}

			// Slide the container into view with a fancy left shift animation followed by a slight
			// right shift animation
			$container.addClass(SHIFT_TRANSITION.LEFT);
			utility.setTransitionListeners(container, 0, true, function()
			{
				$container.addClass(SHIFT_TRANSITION.SLIGHTLY_RIGHT);
			});
		},

		/**
		  * Function hides the relay container from view
		  *
		  * @author kinsho
		  */
		hideContainer: function()
		{
			var	view = this,
				$container = $('#' + this.SERVER_MESSAGE_CONTAINER.CONTAINER);

			// First, slide the container off the screen towards the right, then remove all its
			// custom and transition styling
			$container.addClass(this.SHIFT_TRANSITION_RIGHT);
			utility.setTransitionListeners(container, 0, true, function()
			{
				$container.removeClass(constants.POSITIVE_BACKGROUND_THEME +
					constants.NEGATIVE_BACKGROUND_THEME +
					constants.NEUTRAL_BACKGROUND_THEME +
					constants.BLOCK_DISPLAY +
					view.SHIFT_TRANSITION.LEFT +
					view.SHIFT_TRANSITION.SLIGHTLY_RIGHT +
					view.SHIFT_TRANSITION.RIGHT);
			});
		}

	};

// ----------------- END --------------------------
	return my;
});