window.leftHandMenu =
{
	SUB_MENU_DURATION: 500, // the duration of the sliding animations used to show/hide the second-tier menus

	/**
	  * Function serves to mark the currently selected item on the left-hand menu
	  *
	  * @author kinsho
	  */
	markSelected: function()
	{
		var selectedClass = 'selected',
			selectedSpan = document.createElement('span'),
			page = window.location.pathname.replace('/', ''),
			menuItems = document.getElementById('leftHandMenu').children,
			$menuItem,
			verticalOffset,
			i;

		if (document.getElementById('leftHandMenu').className.indexOf('noDisplay') < 0)
		{
			selectedSpan.className = selectedClass;

			for (i = menuItems.length - 1; i >= 0; i -= 1)
			{
				$menuItem = $(menuItems[i]);

				if ($menuItem.data('title') === page)
				{
					$menuItem.addClass(selectedClass);
					$menuItem.prepend(selectedSpan);
				}
			}
		}
	},

	/**
	  * Function serves to show/hide the sub-menu items associated with the menu item(s) depending on the location of the mouse pointer
	  *
	  * @param event - the mouseover event that triggered this event
	  *
	  * @author kinsho
	  */
	showHideSubMenuItems: function(event)
	{
		var $subItemContainers = $(event.currentTarget).find('.subItems'),
			$subItemContainer = $(event.currentTarget).next('.subItems'),
			$allSubItems = $subItemContainers.find('span'),
			$subItems = $subItemContainer.find('span'),
			$deferred = $.Deferred();

		// If statement determines whether the second-tier menus need to be exposed or concealed
		if ( event.originalEvent &&
			 event.originalEvent.clientX >= document.getElementById('leftHandContainer').offsetWidth &&
			 $allSubItems.length )
		{
			$allSubItems.addClass('fadeOut');
			$subItemContainers.slideUp(event.data.view.SUB_MENU_DURATION, function()
			{
				$deferred.resolve();
			});
		}
		else if ($subItemContainer.length)
		{
			$subItemContainer.slideDown(event.data.view.SUB_MENU_DURATION, function()
			{
				window.setTimeout(function()
				{
					$subItems.removeClass('fadeOut');
					$deferred.resolve();
				}, 75);
			});
		}
		else
		{
			$deferred.resolve();
		}

		return $deferred.promise();
	},

	/**
	  * Function serves to manage the fading and shifting animations used to control the
	  * entrance and exit of the left-hand side forms
	  *
	  * @param $moduleElement - the module container that needs to be animated upon
	  * @param isFadingOut - a flag to indicate whether the module needs to be faded outward or inward
	  *
	  * @author kinsho
	  */
	fadeControl: function($moduleElement, isFadingOut)
	{
		if (isFadingOut)
		{
			$moduleElement.addClass('fadeOut');
			$moduleElement.addClass('moduleGoLeft');
		}
		else
		{
			$moduleElement.removeClass('fadeOut');
			$moduleElement.removeClass('moduleGoLeft');		
		}
	},

	/**
	  * Function responsible for generating a form that will aid the user in logging in to
	  * his account if the user has forgotten his user name and/or password
	  *
	  * @param event - the event responsible for invoking this function
	  *
	  * @author kinsho
	  */
	generateForgotPasswordForm: function(event)
	{
		var view = event.data.view,
			logInModule = document.getElementById('logIn'),
			$logInModule = $(logInModule),
			$forgotPasswordModule = $('#forgotPassword'),
			$logInInputs = $logInModule.find('input'),
			delayedFunction = function()
			{
				// Fade in the forgot password form and hide the log-in form from the DOM tree
				$forgotPasswordModule.removeClass('noDisplay');
				$logInModule.addClass('noDisplay');

				// Using a timeout to ensure that the element is fully inserted back into the
				// DOM tree before executing any animations upon that element
				window.setTimeout(function()
				{
					view.fadeControl($forgotPasswordModule, false);
				}, 250);

				// Don't forget to remove the transition listener once it's finished executing
				utilityFunctions.removeTransitionListeners(logInModule, delayedFunction);
			};

		// Hide any tooltips that may be visible
		$logInInputs.trigger('mouseout');
		$logInInputs.trigger('blur');

		// Fade out the log-in form and fade in the forget password form
		view.fadeControl($logInModule, true);

		utilityFunctions.setTransitionListeners(logInModule, delayedFunction);
	},

	/**
	  * Function responsible for generating a form that the user can use to log in to
	  * the main web site
	  * NOTE: The function is only to be used when navigating from the 'Forgot Password' form
	  * back to the log-in form
	  *
	  * @param event - the event responsible for invoking this function
	  *
	  * @author kinsho
	  */
	generateLogInForm: function(event)
	{
		var view = event.data.view,
			forgotPasswordModule = document.getElementById('forgotPassword'),
			$forgotPasswordModule = $(forgotPasswordModule),
			$logInModule = $('#logIn'),
			$forgotPasswordInputs = $forgotPasswordModule.find('input'),
			delayedFunction = function()
			{
				// Fade in the log-in form and hide the forgot password form from the DOM tree
				$logInModule.removeClass('noDisplay');
				$forgotPasswordModule.addClass('noDisplay');

				// Using a timeout to ensure that the element is fully inserted back into the
				// DOM tree before executing any animations upon that element
				window.setTimeout(function()
				{
					view.fadeControl($logInModule, false);
				}, 250);

				// Don't forget to remove the transition listener once it's finished executing
				utilityFunctions.removeTransitionListeners(forgotPasswordModule, delayedFunction);
			};

		// Hide any tooltips that may be visible
		$forgotPasswordInputs.trigger('mouseout');
		$forgotPasswordInputs.trigger('blur');

		// Fade out the forgot password form and fade in the log-in form
		view.fadeControl($forgotPasswordModule, true);

		utilityFunctions.setTransitionListeners(forgotPasswordModule, delayedFunction);
	},

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

	/**
	  * Function serves to aid a user that forgot his user name or password
	  *
	  * @author kinsho
	  */
	forgotPasswordSubmit: function(event)
	{
		var view = event.data.view,
			data = formSubmit.collectData('forgotPasswordForm'),
			$forgotPasswordEmailField = $('#forgotPasswordForm').find('input[name=email]');

		formSubmit.ajax(
		{
			type: 'POST',
			url: '/logIn/forgotPassword',
			data: data,
			beforeSend: function()
			{
				superToolTip.resetSuperTip($forgotPasswordEmailField[0], '');
				$forgotPasswordEmailField.removeClass(formValidation.failedValidationClass);
			},
/*
			customSuccessHandler: function(data)
			{
				// Parse out the JSON data
				var responseData = $.parseJSON(data),
					$successDialog = $('#forgotPasswordSuccessDialog');

				$successDialog.html(responseData.emailSent).dialog();
			},
*/
			customErrorHandler: function(response)
			{
				var responseData = $.parseJSON(response.responseText),
					errors = responseData.errors,
					i;

				superToolTip.changeSuperTipText($forgotPasswordEmailField[0], errors[0]);
				$forgotPasswordEmailField.addClass(formValidation.failedValidationClass);
				$forgotPasswordEmailField.trigger('mouseover');
			}
		}, event);
	},

	/**
	  * Generic function responsible for redirecting the user to a new page depending on
	  * which left-hand menu option was clicked
	  *
	  * @param event - the left-hand menu item that was clicked
	  *
	  * @author kinsho
	  */
	redirectUser: function(event)
	{
		var $this = $(event.currentTarget),
			view = event.data.view,
			title = $this.data('title'),
			specialHandler = $this.data('specialHandler'),
			URL;

		if (title)
		{
			URL = window.location.href;

			// Take out any references to controllers within the URL
			// The aim is to redirect the user back towards the home page
			URL = URL.slice(0, URL.lastIndexOf('/'))

			URL += '/' + title;

			window.location = URL;
		}
		else if (specialHandler)
		{
			view[specialHandler](event);
		}
	},

	/**
	  * Specialized function designed to be invoked at any time to set up all necessary
	  * event listeners on the left-hand menu once it is fully generated
	  *
	  * @author kinsho
	  */
	initMenuListeners: function()
	{
		var $mainItems = $('.mainItem'),
			$subItems = $('.subItems'),
			$subItemMasters = $subItems.prev(),
			$leftHandContainer = $('#leftHandContainer'),
			hideMenuItemsFunction = utilityFunctions.debouncer(this.showHideSubMenuItems, 1, 50);

		$mainItems.on('click', { view: this }, this.redirectUser);
		$subItems.children('div').on('click', { view: this }, this.redirectUser);
		$subItemMasters.on('mouseover', { view: this }, hideMenuItemsFunction);
		$leftHandContainer.on('mouseout', { view: this }, hideMenuItemsFunction);

		// Upon initiation, slide all the sub-menus up immediately and prepare them for eventual exposure
		$subItems.slideUp(0);
		$subItems.find('span').addClass('fadeOut');
	},

	/**
	  * Function responsible for initializing all listeners on the registration page
	  *
	  * @author kinsho
	  */
	initListeners: function()
	{
		$('#logInButton').on('click', { view: this }, this.logIn);
		$('#forgotPasswordButton').on('click', { view: this }, this.forgotPasswordSubmit);
		$('#forgotPasswordLink').on('click', { view: this }, this.generateForgotPasswordForm);
		$('#logInLink').on('click', { view: this }, this.generateLogInForm);

		this.initMenuListeners();
	},

	/**
	  * Initializer function
	  *
	  * @author kinsho
	  */
	initialize: function()
	{
		var doesLogInFormExist = ($('#logInForm').length),
			$logInUserNameField = $('#logInForm').find('input[name=username]'),
			$logInPasswordField = $('#logInForm').find('input[name=password]'),
			$forgotPasswordEmailAddressField = $('#forgotPasswordForm').find('input[name=email]'),
			$forgotPasswordModule = $('#forgotPassword');

		this.initListeners();

		// Initialize supertips on login form if it is visible
		if (doesLogInFormExist)
		{
			superToolTip.superTip($logInUserNameField[0], '');
			superToolTip.superTip($logInPasswordField[0], '');
			superToolTip.superTip($forgotPasswordEmailAddressField[0]);

			this.fadeControl($forgotPasswordModule, true);
		}
	}
};

//  ---------------------------------

$(document).ready(function()
{
	leftHandMenu.initialize();
});