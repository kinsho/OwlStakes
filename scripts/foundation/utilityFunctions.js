window.utilityFunctions =
{
	/**
	  * Function serves to throttle the number of times a handler function executes at once regardless
	  * of how often it is invoked.
	  *
	  * NOTE: All handler functions will need to make use of jQuery deferred in order to tell this
	  * 	  debouncer function when the handler finishes execution
	  *
	  * @param handlerFunction - the function to be throttled
	  * @param throttlerFrequency - the max number of times the function can execute at once
	  * @return a function wrapper which will control access to the debounced function
	  *
	  * @author kinsho
	  */
	debouncer: function(handlerFunction, throttlerFrequency)
	{
		var $deferred = $.Deferred(),
			totalNumberOfTickets = 0,
			ticketToService = 1, // Will be used to service requests according to the order in which they arrived
			debouncedFunction = function(event, ticketNumber)
			{
				var argsArray,
					i;

				// Determines the order of this request in the queue of requests
				ticketNumber = ticketNumber || ++totalNumberOfTickets;

				if ( (throttlerFrequency) && (ticketNumber == ticketToService) )
				{
					ticketToService += 1;
					throttlerFrequency -= 1;
					// Relying on jQuery Deferred here to determine when the function finishes executing
					handlerFunction(event).done(function()
					{
						throttlerFrequency += 1;
					});
				}
				else
				{
					argsArray = [];

					// Invoke this same function again in a tenth of a second to check to
					// see if it is allowed to invoke the handler function then
					window.setTimeout(debouncedFunction, 100, event, ticketNumber);
				}
			};

		return debouncedFunction;
	},

	/**
	  * Function returns a clone of the passed object
	  *
	  * @param obj - the object to be cloned
	  * @return an obj that is only comprised of all the unique key/value pairs
	  *			within the passed object
	  *
	  * @author kinsho
	  */
	cloneObject: function(obj)
	{
		var clone = {},
			prop;

		for (prop in obj)
		{
			clone[prop] = obj[prop];
		}

		return clone;
	},

	/**
	  * Think of this function as a way to prevent users from triggering all modal-related
	  * AJAX calls multiple times while an AJAX call is in the midst of being serviced.
	  *
	  * @param event - the event that triggered this call
	  *
	  * @author kinsho
	  */
	modalAjax: function(settings, event)
	{
		var $linkButton = $(event.currentTarget),
			originalErrorFunction = settings.error || function(){},
			originalCompleteFunction = settings.complete || function(){},
			completeWrapper = function(response, status)
			{
				// Ensure the 'linkButton' is clickable upon completion of the AJAX request
				$linkButton.data('disabled', '');

				// Call the 'complete' function that was originally defined within the settings object, provided that one was defined
				originalCompleteFunction(response, status);
			},
			// Define an error wrapper that'll invoke a specialized error modal to display any error messages returned from the server
			customErrorHandlerWrapper = function(response, status, errorText)
			{
				var responseData = $.parseJSON(response.responseText),
					errors = responseData.errors;

				if (errors)
				{
					document.getElementById('errorModalContent').innerHTML = serverRelays.formatErrors(errors);
				}

				modalManager.openModal('errorModal');

				// Call the 'error' function that was originally defined within the settings object, provided that one was defined
				originalErrorFunction(response, status, errorText);
			};

		if ( !($linkButton.data('disabled')) )
		{
			$linkButton.data('disabled', 'true');

			settings.customErrorHandler = settings.customErrorHandler || customErrorHandlerWrapper;
			settings.complete = completeWrapper;

			utilityFunctions.ajax(settings, event);
		}
	},

	/**
	  * Function serves to initiate an AJAX request and process any responses in a generic manner,
	  * unless otherwise specified
	  * 
	  * @param settings - the settings that contain the datat to be sent to
	  *		   		the server as well as the configuration parameters
	  *				that will moderate the AJAX connection
	  * @param event - the event that ultimately led to this function being invoked
	  *
	  * @author kinsho
	  */
	ajax: function(settings, event)
	{
		var wrapperSettings = this.cloneObject(settings),
			activeElement = event ? event.currentTarget : {},
			isInput = (activeElement.tagName === 'INPUT'),
			isButtonType = (activeElement.type === 'button'),
			isActiveElementButton = (isInput && isButtonType),
			beforeSend = settings.beforeSend || function(){},
			success = settings.success || function() {},
			error = settings.error || function() {},
			customErrorHandler = settings.customErrorHandler || undefined,
			customSuccessHandler = settings.customSuccessHandler || undefined,
			complete = settings.complete || function() {},

			/*
			 * If the event that ultimately led to this function being invoked is
			 * directly associated with an input button, the button should be disabled
			 * while this AJAX request is being serviced, thus necessitating the need
			 * for a function like the one below. We do not want multiple AJAX requests
			 * to be sent for the same action.
			 */
			disableEnableSubmitButton = function()
			{
				if (isActiveElementButton)
				{
					activeElement.disabled = !(activeElement.disabled);
				}
			};

		disableEnableSubmitButton();

		/*
		 * All the functional callbacks within the AJAX settings object must be
		 * wrapped by predefined functions that take care of certain actions that
		 * have to be performed for all non-specialized AJAX requests
		 */
		wrapperSettings.beforeSend = function(request, settings)
		{
			return beforeSend(request, settings);
		};

		wrapperSettings.complete = function(response, status)
		{
			complete(response, status);
		};

		wrapperSettings.success = function(data, status, response)
		{
			var responseData = $.parseJSON(data);

			// If a custom success handler has been specified, invoke it and ignore all generic handler code.
			if (customSuccessHandler)
			{
				customSuccessHandler(data);
			}
			else
			{
				// Hide any error container and put up a success container
				serverRelays.placeSuccessContainer($(activeElement));
				serverRelays.hideErrorContainer().done(function()
				{
					serverRelays.displaySuccessContainer(responseData.successHeader, responseData.successMessage).done(function()
					{
						disableEnableSubmitButton();
						success(data, status, response);
					});
				});
			}
		};

		wrapperSettings.error = function(response, status, errorText)
		{
			var responseData = $.parseJSON(response.responseText),
				recaptchaReloadButton = document.getElementById('recaptcha_reload');

			if (responseData.errors)
			{
				// If a custom error handler has been specified, invoke it. Otherwise, use the generic handler
				if (customErrorHandler)
				{
					customErrorHandler(response, status, errorText);
					disableEnableSubmitButton();
				}
				else
				{
					// Hide any success container and put up an error container
					serverRelays.placeErrorContainer($(activeElement));
					serverRelays.hideSuccessContainer().done(function()
					{
						serverRelays.displayErrorContainer(responseData.errors).done(function()
						{
							disableEnableSubmitButton();
							error(response, status, errorText);
						});
					});
				}
			}

			// In case the request involved a reCAPTCHA test that the user failed to pass, make sure that the reCAPTCHA test
			// client is reloaded with a new word
			if (!(responseData.recaptchaTestPassed))
			{
				$(recaptchaReloadButton).trigger('click');
			}

			// If no custom error handling logic has been set, then initiate a call back to the user-defined error function, if it exists
			if ( !(customErrorHandler) )
			{
				error(response, status, errorText);
			}
		};

		// Hide all error messages and success indicators from view before initiating the AJAX connection
		serverRelays.hideErrorList().done(function()
		{
			serverRelays.hideSuccessContainer().done(function()
			{
				$.ajax(wrapperSettings);
			});
		});
	},

	/**
	  * Function serves to set transition listeners on the passed element
	  * 
	  * @param element - the element with which to set the transition listener upon
	  * @param listenerFunction - the listener function that needs to be attached to the element
	  * @param timeoutDelay - in case a timeout delay is specified, then the listener will be triggered as a timeout function
	  *							that will be invoked only after the specified delay
	  *
	  * @author kinsho
	  */
	setTransitionListeners: function(element, listenerFunction, timeoutDelay)
	{
		var transitions = ['transitionend', 'otransitionend', 'webkitTransitionEnd'],
			i;

		for (i = transitions.length - 1; i >= 0; i -= 1)
		{
			if (timeoutDelay)
			{

				element.addEventListener(transitions[i], function(event)
				{
					window.setTimeout(function()
					{
						listenerFunction(event);
					}, timeoutDelay);
				}, false);

			}
			else
			{
				element.addEventListener(transitions[i], listenerFunction, false);
			}
		}
	},

	/**
	  * Function serves to remove the passed transition listener from the passed element
	  * 
	  * @param element - the element from which the transition listener needs to be removed
	  * @param listenerFunction - the listener function that needs to be removed from the element
	  *
	  * @author kinsho
	  */
	removeTransitionListeners: function(element, listenerFunction)
	{
		var transitions = ['transitionend', 'otransitionend', 'webkitTransitionEnd'],
			i;

		for (i = transitions.length - 1; i >= 0; i -= 1)
		{
			element.removeEventListener(transitions[i], listenerFunction, false);
		}	
	},

	/**
	 * Finds the absolute position of an element on a page
	 *
	 * @param el - the element in question
	 *
	 * @author quirksmode.org
	 * @author kinsho
	 */
	findLocationOfElement: function(el)
	{
		var curleft = 0,
			curtop = 0,
			obj = el,
			transformMatrixObject = {},
			transformMatrix = '',
			transformMatrixValues = [],
			numberOfMatrixValues;

		if (obj.offsetParent)
		{
			do
			{
				// If the object has been formally translated via CSS, deduce the extent of the translation
				// and factor that into the coordinate calculations. This has to be done manually.
				transformMatrixObject = window.getComputedStyle(obj);

				// Make sure to account for the fact that browsers may store the matrix values within different property labels
				transformMatrix = transformMatrixObject.getPropertyValue('transform') ||
								  transformMatrixObject.getPropertyValue('-moz-transform') ||
								  transformMatrixObject.getPropertyValue('-webkit-transform') ||
								  transformMatrixObject.getPropertyValue('-ms-transform') ||
								  transformMatrixObject.getPropertyValue('-o-transform');

				if (transformMatrix && (transformMatrix.indexOf('matrix') >= 0) )
				{
					transformMatrixValues = transformMatrix.split(',');
					numberOfMatrixValues = transformMatrixValues.length;

					// The relevant matrix values in the event of a translation are always the last two values
					curleft += ( obj.offsetLeft + window.parseFloat(transformMatrixValues[numberOfMatrixValues - 2]) );
					curtop += ( obj.offsetTop + window.parseFloat(transformMatrixValues[numberOfMatrixValues - 1]) );
				}
				else
				{
					curleft += obj.offsetLeft;
					curtop += obj.offsetTop;
				}
			}
			while (obj = obj.offsetParent);
		}

		return { left : curleft, top : curtop };
	}
};