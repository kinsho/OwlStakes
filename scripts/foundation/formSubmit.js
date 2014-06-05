define(['foundation/'])

formSubmit =
{
	/**
	  * Function bundles all input/select values from a passed scope into a key-value object 
	  * 
	  * @param formId - the ID for the form from which data will be gathered
	  * @return an object containing all user inputs
	  *
	  * @author kinsho
	  */
	collectData: function(formId)
	{
		var $form = $('#' + formId),
			$formInput = $form.find('input, select').not('[type=button]').not(':disabled'),
			dataStr = {};

		$formInput.each(function()
		{
			if (this.type === 'checkbox')
			{
				dataStr[this.name] = this.checked;
			}
			else
			{
				dataStr[this.name] = this.value;
			}
		});

		return dataStr;
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

			formSubmit.ajax(settings, event);
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
		var wrapperSettings = utilityFunctions.cloneObject(settings),
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
	}
};