/**
 * @module leftHandMenu
 */

define(['jquery', 'foundation/constants', 'foundation/utility', 'foundation/formSubmit'], function($, constants, utility, formSubmit)
{
	'use strict';

// ----------------- ENUM/CONSTANTS -----------------------------
	var LEFT_HAND_CONTAINER = 'leftHandContainer',
		LEFT_HAND_MENU = 'leftHandMenu',
		LEFT_HAND_SECTION = 'leftHandSection',
		LOG_IN_MODULE = 'logInModule',
		LOG_IN_LINK = 'logInLink',

		FORGOT_PASSWORD_MODULE = 'forgotPasswordModule',
		FORGOT_PASSWORD_FORM = 'forgotPasswordForm',
		FORGOT_PASSWORD_LINK = 'forgotPasswordLink',
		FORGOT_PASSWORD_SUBMIT = 'forgotPasswordButton',

		SUB_MENU_ITEM_HEIGHT = 55,
		SELECTED_CLASS = 'selected',
		MODULE_EXIT_CLASS = 'exit',
		MODULE_ENTRANCE_CLASS = 'enter',

		FORGOT_PASSWORD_URL = '/logIn/forgotPassword',
		FORGOT_PASSWORD_SUCCESS_HEADER = 'E-mail Sent!',
		FORGOT_PASSWORD_SUCCESS_BODY = "An e-mail has been sent to <b>%e</b> containing your user name " +
			"and instructions on how to reset your password. Just follow the instructions and you'll be fine.";

// ----------------- PRIVATE FUNCTIONS -----------------------------
		/**
		  * Private function serves to manage the fading and shifting animations used to control the
		  * entrance and exit of the left-hand side forms
		  *
		  * @param {Event} event - the event responsible for triggering the invocation of this function
          * @param {HTMLElement} comingModuleElement - the module container that needs to be slid into the view
		  *
		  * @author kinsho
		  */
	var fadeControl = function(event, comingModuleElement)
		{
			var exitModuleElement = $(event.currentTarget).closest('.' + LEFT_HAND_SECTION)[0];

			exitModuleElement.classList.add(MODULE_EXIT_CLASS);

			// Prep the new module for its entrance

			// Fade in the new module once the old module has slid away from view
			utility.setEventListener(exitModuleElement, function()
			{
				// Get rid of the old module from the DOM layout
				exitModuleElement.classList.add(constants.styles.NO_DISPLAY);

				// Now have the browser render the new module before animating it
				comingModuleElement.classList.remove(constants.styles.NO_DISPLAY);

				comingModuleElement.classList.add(MODULE_ENTRANCE_CLASS);

				utility.setEventListener(comingModuleElement, function()
				{
					comingModuleElement.classList.remove(MODULE_ENTRANCE_CLASS, MODULE_EXIT_CLASS);
				}, 'animationend', 0, true);

			}, 'animationend', 100, true);
		};

// ----------------- MODULE DEFINITION --------------------------
		var my =
			{
				/**
				 * Function sends a server request to help a user regain access to the main platform
				 * should he forget his user name and/or password
				 *
				 * @param {Event} event - the event that triggered the invocation of this function
				 *
				 * @author kinsho
				 */
				forgotPasswordSubmit: function(event)
				{
					var data = formSubmit.collectData(document.getElementById(FORGOT_PASSWORD_FORM)),
						// If the e-mail is successfully sent, relay a message to the user containing
						// that same e-mail address
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

					// While I do not enjoy setting CSS through JavaScript, the only way to properly render a sliding
					// animation here is by manually calculating the expected height of all the relevant sub-menu items
					// put together and setting the height of the containing wrapper equal to the end result of that
					// calculation
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
						$subItemContainers = $(leftHandMenu).find('.subItems');

					// Iterate over each sub-menu container and set their heights to 0 manually to slide them out of view
					// Note the horrible use of CSS here to achieve the sliding effect I so desire
					$subItemContainers.each(function()
					{
						$(this).css('height', '0px');
					});
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
							URL = URL.slice(0, URL.lastIndexOf('/'));

							window.location = URL;
						}
					});
				},

			};

// ----------------- INITIALIZATION LOGIC --------------------------

		var leftHandMenu = document.getElementById(LEFT_HAND_MENU),
			menuItems = leftHandMenu.children,
			page = window.location.pathname.replace('/', ''),
			$leftHandSections = $('.' + LEFT_HAND_SECTION),
			menuItem,
			i;

		// Logic to mark the left-hand menu item that corresponds to the current page
		// Only mark a selected menu item if the left-hand menu is visible
		if (leftHandMenu.className.indexOf(constants.styles.NO_DISPLAY) < 0)
		{
			for (i = menuItems.length - 1; i >= 0; i -= 1)
			{
				menuItem = menuItems[i];

				// If the menu item is associated with the current page, set the selected icon
				// next to the menu item
				if ($(menuItem).data('title') === page)
				{
					menuItem.classList.add(SELECTED_CLASS);
				}
			}
		}
		// Logic to prepare all the left-hand sections for sliding transitions
		else
		{
			$leftHandSections.filter('.' + constants.styles.NO_DISPLAY).addClass(MODULE_EXIT_CLASS);
		}
// ----------------- LISTENERS --------------------------

		var $mainItems = $('.mainItem'),
			$subItems = $('.subItems'),
			$subItemMasters = $subItems.prev(),
			$leftHandContainer = $('#' + LEFT_HAND_CONTAINER),
			hideMenuItemsFunction = utility.debouncer(my.showHideSubMenuItems, 1, 50);

		// Listeners for the left-hand navigation menu
//		$mainItems.on('click', my.redirectUser);
//		$subItems.children('div').on('click', my.redirectUser);
//		$subItemMasters.on('mouseover', my.hideMenuItemsFunction);
//		$leftHandContainer.on('mouseout', my.hideMenuItemsFunction);

		// Listeners for the left-hand modules
//		$('#logInButton').on('click', my.logIn);
		utility.setEventListener(document.getElementById(FORGOT_PASSWORD_SUBMIT), my.forgotPasswordSubmit, 'click', 0, false);
		utility.setEventListener(document.getElementById(LOG_IN_LINK), fadeControl, 'click', 0, false, [document.getElementById(LOG_IN_MODULE)]);
		utility.setEventListener(document.getElementById(FORGOT_PASSWORD_LINK), fadeControl, 'click', 0, false, [document.getElementById(FORGOT_PASSWORD_MODULE)]);

// ----------------- END --------------------------
		return my;
});

/*
window.leftHandMenu =
{
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
*/