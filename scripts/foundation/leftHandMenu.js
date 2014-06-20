define(['jquery', 'constants', 'utility', 'formSubmit'], function($, constants, utility, formSubmit)
{
// ----------------- ENUM/CONSTANTS -----------------------------
	var LEFT_HAND_CONTAINER = 'leftHandContainer',
		LEFT_HAND_MENU = 'leftHandMenu',
		LOG_IN_MODULE = 'logInModule',
		FORGOT_PASSWORD_MODULE = 'forgotPasswordModule',
		FORGOT_PASSWORD_FORM = 'forgotPasswordForm',

		SUB_MENU_ITEM_HEIGHT = 55,
		SELECTED_CLASS = 'selected',
		SECTION_SHIFT_LEFT_CLASS = 'sectionGoLeft',

		FORGOT_PASSWORD_URL = '/logIn/forgotPassword',
		FORGOT_PASSWORD_SUCCESS_HEADER = 'E-mail Sent!'.
		FORGOT_PASSWORD_SUCCESS_BODY = "An e-mail has been sent to <b>%e</b> containing your user name and instructions on how to " +
			"reset your password. Just follow the instructions and you'll be fine."

// ----------------- PRIVATE FUNCTIONS -----------------------------
		/**
		  * Private function serves to manage the fading and shifting animations used to control the
		  * entrance and exit of the left-hand side forms
		  *
		  * @param {$} $moduleElement - the module container that needs to be animated upon
		  * @param {Boolean} [isFadingOut] - a flag to indicate whether the module needs to be faded outward or inward
		  *
		  * @author kinsho
		  */
	var fadeControl = function($moduleElement, isFadingOut)
		{
			if (isFadingOut)
			{
				$moduleElement.addClass(SECTION_SHIFT_LEFT_CLASS);
			}
			else
			{
				$moduleElement.removeClass(SECTION_SHIFT_LEFT_CLASS);
			}
		};

// ----------------- MODULE DEFINITION --------------------------
		var my =
			{
				/**
				  * Function serves to display all the sub-menu items associated with the menu item to which the
				  * cursor is currently pointing
				  *
				  * @param {Event} event - the mouseover event that triggered this event
				  *
				  * @author kinsho
				  */
				showSubMenuItems: function(event)
				{
					var $subItemContainer = $(event.currentTarget).next('.subItems'),
						$subItems = $subItemContainer.find('span'),
						containerHeight = $subItems.length * SUB_MENU_ITEM_HEIGHT; // Used to deduce the height of the container when it will be fully revealed

					// While I do not enjoy setting CSS through JavaScript, the only way to properly render a sliding animation here is by
					// manually calculating the expected height of all the relevant sub-menu items put together and setting the height of the
					// containing wrapper equal to the end result of that calculation
					$subItemContainer.css('height', containerHeight + 'px');
				},

				/**
				  * Function serves to hide all sub-items that are currently visible
				  *
				  * @author kinsho
				  */
				hideSubMenuItems: function()
				{
					var leftHandMenu = document.getElementById(LEFT_HAND_MENU),
						$subItemContainers = $(leftHadMenu).find('.subItems');

					// Iterate over each sub-menu container and set their heights to 0 manually to slide them out of view
					// Note the horrible use of CSS here to achieve the sliding effect I so desire
					$subItemContainers.each(function()
					{
						$(this).css('height', '0px');
					});
				},

				/**
				  * Function responsible for presenting the form that will aid the user in logging in to his account
				  * if the user has forgotten his user name and/or password
				  *
				  * @param {Event} event - the event responsible for invoking this function
				  *
				  * @author kinsho
				  */
				shiftInForgotPasswordForm: function(event)
				{
					var view = event.data.view,
						logInModule = document.getElementById(LOG_IN_MODULE),
						$logInModule = $(logInModule),
						$forgotPasswordModule = $(document.getElementById(FORGOT_PASSWORD_MODULE)),
						delayedFunction = function()
						{
							// Insert the forgot password module back into the DOM and take out the log-in module instead
							$forgotPasswordModule.removeClass(constants.styles.NO_DISPLAY);
							$logInModule.addClass(constants.styles.NO_DISPLAY);

							// Using a timeout to ensure that the forgot password module is fully inserted back into
							// the DOM before any further animations
							window.setTimeout(function()
							{
								view.fadeControl($forgotPasswordModule, false);
							}, 150);
						};

					// Fade out the log-in module
					view.fadeControl($logInModule, true);

					utility.setTransitionListeners(logInModule, 0, true, delayedFunction);
				},

				/**
				  * Function responsible for presenting the form that the user can use to log in to the main web site
				  *
				  * @param {Event} event - the event responsible for invoking this function
				  *
				  * @author kinsho
				  */
				shiftInLogInForm: function(event)
				{
					var view = event.data.view,
						forgotPasswordModule = document.getElementById(FORGOT_PASSWORD_MODULE),
						$forgotPasswordModule = $(forgotPasswordModule),
						$logInModule = $(document.getElementById(LOG_IN_MODULE)),
						delayedFunction = function()
						{
							// Insert the log-in module back into the DOM and take out the forgot password module instead
							$forgotPasswordModule.addClass(constants.styles.NO_DISPLAY);
							$logInModule.removeClass(constants.styles.NO_DISPLAY);

							// Using a timeout to ensure that the log-in module is fully inserted back into
							// the DOM before any further animations
							window.setTimeout(function()
							{
								view.fadeControl(logInModule, false);
							}, 150);
						};

					// Fade out the forgot password module
					view.fadeControl($forgotPasswordModule, true);

					utilityFunctions.setTransitionListeners(forgotPasswordModule, 0, true, delayedFunction);
				},

				/**
				  * Function serves to submit a server request to help a user regain access to the main platform
				  * should he forget his user name and/or password
				  *
				  * @param {Event} event - the event that triggered the invocation of this function
				  *
				  * @author kinsho
				  */
				forgotPasswordSubmit: function(event)
				{
					var view = event.data.view,
						data = formSubmit.collectData(FORGOT_PASSWORD_FORM),
						// If the e-mail is successfully sent, relay a message to the user containing that same e-mail address
						successBody = FORGOT_PASSWORD_SUCCESS_BODY.replace('%e', data.email);

					formSubmit.ajax(
					{
						type: 'POST',
						url: FORGOT_PASSWORD_URL,
						data: data,
						successHeader: FORGOT_PASSWORD_SUCCESS_HEADER,
						successBody: successBody
					}, event);
				},

				/**
				  * Generic function responsible for redirecting the user to a new page depending on the left-
				  * hand menu item that was clicked
				  *
				  * @param {Event} event - the event responsible for invoking this method
				  *
				  * @author kinsho
				  */
				redirectUser: function(event)
				{
					var $targetElement = $(event.currentTarget),
						title = $targetElement.data('title'),
						URL;

					if (title)
					{
						URL = window.location.href;

						// Replace the mention of the current controller within the URL with the name of the new
						// controller associated with the clicked menu item
						URL = URL.slice(0, URL.lastIndexOf('/'));
						URL += '/' + title;

						// Redirect the user to the now-modified URL
						window.location = URL;
					}
				},

				/**
				  * Function serves to log the user out of the platform
				  *
				  * @author kinsho
				  */
				logOut: function()
				{
					formSubmit.ajax(
					{
						type: 'POST',
						url: '/logIn/logOut',
						customSuccessHandler: function()
						{
							var URL = window.location.href;

							// Take out any references to controllers within the URL
							// The aim is to redirect the user back towards the home page
							URL = URL.slice(0, URL.lastIndexOf('/'))

							window.location = URL;
						}
					});
				},

			};

// ----------------- INITIALIZATION LOGIC --------------------------

		var leftHandMenu = document.getElementById(LEFT_HAND_MENU),
			menuItems = leftHandMenu.children,
			page = window.location.pathname.replace('/', ''),
			$menuItem,
			i;

		// Logic to mark the left-hand menu item that corresponds to the current page
		// Only mark a selected menu item if the left-hand menu is visible
		if (leftHandMenu.className.indexOf(constants.styles.NO_DISPLAY) < 0)
		{
			for (i = menuItems.length - 1; i >= 0; i -= 1)
			{
				$menuItem = $(menuItems[i]);

				// If the menu item is associated with the current page, set the selected icon
				// next to the menu item
				if ($menuItem.data('title') === page)
				{
					$menuItem.addClass(SELECTED_CLASS);
				}
			}
		}

// ----------------- LISTENER SET-UP --------------------------

		var $mainItems = $('.mainItem'),
			$subItems = $('.subItems'),
			$subItemMasters = $subItems.prev(),
			$leftHandContainer = $('#' + LEFT_HAND_CONTAINER),
			hideMenuItemsFunction = utility.debouncer(my.showHideSubMenuItems, 1, 50);

		// Listeners for the left-hand navigation menu
		$mainItems.on('click', my.redirectUser);
		$subItems.children('div').on('click', my.redirectUser);
		$subItemMasters.on('mouseover', my.hideMenuItemsFunction);
		$leftHandContainer.on('mouseout', my.hideMenuItemsFunction);

		// Listeners for the other left-hand modules
		$('#logInButton').on('click', my.logIn);
		$('#forgotPasswordButton').on('click', my.forgotPasswordSubmit);
		$('#forgotPasswordLink').on('click', my.shiftInForgotPasswordForm);
		$('#logInLink').on('click', my.shiftInLogInForm);

// ----------------- END --------------------------
		return my;
});

window.leftHandMenu =
{
	/**
	  * Function serves to log the user on to the platform
	  *
	  * @author kinsho
	  */
	logIn: function(event)
	{
		var view = event.data.view,
			data = formSubmit.collectData('logInForm'),
			$logInUserNameField = $('#logInForm').find('input[name=username]'),
			$logInPasswordField = $('#logInForm').find('input[name=password]');

		formSubmit.ajax(
		{
			type: 'POST',
			url: '/logIn/logIn',
			data: data,
			beforeSend: function()
			{
				superToolTip.resetSuperTip($logInUserNameField[0], '');
				superToolTip.resetSuperTip($logInPasswordField[0], '');
				$logInUserNameField.removeClass(formValidation.failedValidationClass);
				$logInPasswordField.removeClass(formValidation.failedValidationClass);
			},
			customSuccessHandler: function(data)
			{
				// Parse out the JSON data
				var responseData = $.parseJSON(data),
					logInModule = document.getElementById('logIn'),
					$leftHandMenuContainer = $('#leftHandMenu'),
					executedAlready = false;

				// Fade the log-in module away towards the left
				view.fadeControl($(logInModule), true);

				utilityFunctions.setTransitionListeners(logInModule, function()
				{
					if ( !(executedAlready) )
					{
						// Execute this block of code only once, even if the transition listener is invoked more than once
						executedAlready = true;

						// Hide the menu before appending menu items
						$leftHandMenuContainer.addClass('hidden');
						$leftHandMenuContainer.removeClass('noDisplay');

						// Setting a timeout here to make sure that the browser has enough time to append all the menu items before
						// performing animations on them
						window.setTimeout(function()
						{
							// Set the user's personal handle within the menu
							$leftHandMenuContainer.find('.usernameDisplay').find('span:first').html(responseData.username);

							// Set the listeners needed to access the second-tier menus
							view.initMenuListeners();

							// Loops through each menu item to set each animation on an individual basis
							$leftHandMenuContainer.find('div').each(function()
							{
								var $this = $(this),
									$span = $this.find('span');

								// If statement ensures to any DIVs except fr the mainItem Divs
								if ($this.hasClass('mainItem'))
								{
									utilityFunctions.setTransitionListeners(this, function(event)
									{
										var $this = $(event.currentTarget),
											$span = $this.find('span'),
											isEventBubblingUp = (event.target.nodeName === 'SPAN');

										// Make sure this listener function is only executed specifically for the element on which it is set
										if (!isEventBubblingUp)
										{
											if ($this.hasClass('zeroOverOne'))
											{
												$this.removeClass('hidden zeroOverOne');
											}
											else if ($span.hasClass('fadeOut'))
											{
												$this.removeClass('removeMinWidth');
												$span.removeClass('fadeOut');
											}
										}
									});

									$this.addClass('zeroOverOne removeMinWidth hidden');
									$span.addClass('fadeOut');
								}
							});

							// Show the menu now
							$leftHandMenuContainer.removeClass('hidden');
						}, 500);
					}
				});
			},
			customErrorHandler: function(response)
			{
				var responseData = $.parseJSON(response.responseText),
					errors = responseData.errors,
					i;

				for (i = errors.length - 1; i >= 0; i -= 1)
				{
					// If the user name and password combination fails to match any known combination
					// within the database, set up a supertip indicating such on the user name field
					if ((errors[i].indexOf('user') >= 0) && (errors[i].indexOf('password') >= 0))
					{
						superToolTip.changeSuperTipText($logInPasswordField[0], errors[i]);
						$logInUserNameField.addClass(formValidation.failedValidationClass);
						$logInPasswordField.addClass(formValidation.failedValidationClass);
						$logInPasswordField.trigger('mouseover');
					}
					// If any of the error messages refer to either the user name or password fields,
					// mark those fields invalid and set up a supertip with the respective error message
					else if (errors[i].indexOf('user') >= 0)
					{
						superToolTip.changeSuperTipText($logInUserNameField[0], errors[i]);
						$logInUserNameField.addClass(formValidation.failedValidationClass);
						$logInUserNameField.trigger('mouseover');
					}
					else
					{
						superToolTip.changeSuperTipText($logInPasswordField[0], errors[i]);
						$logInPasswordField.addClass(formValidation.failedValidationClass);
						$logInPasswordField.trigger('mouseover');
					}
				}
			}
		}, event);
	},

};