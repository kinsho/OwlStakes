var serverRelays =
{
	CONTAINER_FADE_DELAY: 600, // given in milliseconds
	HEADER_SLIDE_DURATION: 500, // given in milliseconds
	BODY_SLIDE_DURATION: 750, // given in milliseconds

	/**
	  * Function displays all error messages that were sent from the server
	  *
	  * @param headerText - the text that will need to go into the header container
	  * @param bodyText - the text that will go into the body of the success container
	  *
	  * @author kinsho
	  */
	displaySuccessContainer: function(headerText, bodyText)
	{
		var view = this,
			$successContainer = $('#successContainer'),
			$successHeader = $successContainer.find('div.title'),
			$successBody = $successContainer.find('div.successMessage'),
			$deferred = $.Deferred();

		// Fade the error container into view
		// A slight delay is purposely set between preparing the container for visibility
		// and fading in the container in order to ensure that neither style changes
		// interfere with one another
		$successContainer.css('display', 'block');
		window.setTimeout(function()
		{
			$successContainer.removeClass('fadeOut');
		}, 100);

//		$errorContainer.removeClass('fadeOut');

		// The timeout is used to ensure no more code is executed until the container has
		// faded into view
		window.setTimeout(function() {

			// Put the passed text in the header. If no text was passed, put down a generic message
			$successHeader.html((headerText !== undefined) ? headerText : 'Success!');

			// Now slide the container header downward
			$successHeader.slideDown(view.HEADER_SLIDE_DURATION, function()
			{
				$successBody.html(bodyText);

				// Now slide the list of errors into view
				$successBody.slideDown(view.BODY_SLIDE_DURATION, function()
				{
					$deferred.resolve();
				});
			});

		}, view.SUCCESS_CONTAINER_FADE_DELAY);

		return $deferred.promise();
	},

	/**
	  * Function completely hides the error container from view
	  *
	  * @author kinsho
	  */
	hideSuccessContainer: function()
	{
		var view = this,
			$successContainer = $('#successContainer'),
			$successHeader = $successContainer.find('div.title'),
			$successBody = $successContainer.find('div.successMessage'),
			$deferred = $.Deferred();

		if ($successBody.is(':visible'))
		{
			$successBody.slideUp(view.BODY_SLIDE_DURATION, function()
			{
				$successHeader.slideUp(view.HEADER_SLIDE_DURATION, function()
				{
					$successContainer.addClass('fadeOut');
					window.setTimeout(function()
					{
						$successContainer.css('display', 'none');
						$deferred.resolve();
					}, view.CONTAINER_FADE_DELAY);
				});
			});

			return $deferred.promise();
		}
		else
		{
			// Return a resolved deferred object if the error container is already hidden
			$deferred.resolve();
			return $deferred.promise();		
		}
	},

	/**
	  * Function positions the success container relative to the passed element
	  *
	  * @param $element - the element that will be used to help position the success container
	  *
	  * @author kinsho
	  */
	placeSuccessContainer: function($element)
	{
		var successContainer = document.getElementById('successContainer');

		if ($element && $element.css('position') !== 'absolute')
		{
			$element.after(successContainer);
		}
		else if ( !($element) )
		{
			$('body').appendChild(successContainer);
		}
	},

	/**
	  * Function formats all the error messages that were relayed from the server into one string
	  *
	  * @param errors - an array containing all the error messages that need to be formatted
	  *
	  * @author kinsho
	  */
	formatErrors: function(errors)
	{
		var listElement,
			listItem;

		// If only one error needs to be displayed, no need to do anything other than to return that one error message
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
	  * Function displays all error messages that were sent from the server
	  *
	  * @param errors - an array containing all the error messages that need to be displayed
	  *
	  * @author kinsho
	  */
	displayErrorContainer: function(errors)
	{
		var view = this,
			$errorContainer = $('#errorContainer'),
			$errorHeader = $errorContainer.find('div.title'),
			$errorList = $errorContainer.find('div.list'),
			$deferred = $.Deferred(),
			screenWidth = document.getElementsByTagName('HTML')[0].offsetWidth,
			parentDivWidth = $errorContainer.parents()[0].offsetWidth,
			listItem,
			i;

		$errorContainer.css('display', 'block');

		// Fade the error container into view
		// A slight delay is purposely set between preparing the container for visibility
		// and fading in the container in order to ensure that neither style changes
		// interfere with one another
		window.setTimeout(function()
		{
			$errorContainer.removeClass('fadeOut');
		}, 100);

		// The timeout is used to ensure no more code is executed until the container has
		// faded into view
		window.setTimeout(function()
		{
			// Now slide the container header downward
			$errorHeader.slideDown(view.HEADER_SLIDE_DURATION, function()
			{
				$errorList.append(view.formatErrors(errors));

				// Now slide the list of errors into view
				$errorList.slideDown(view.BODY_SLIDE_DURATION, function()
				{
					$deferred.resolve();
				});
			});

		}, view.CONTAINER_FADE_DELAY);

		$deferred.resolve();
		return $deferred.promise();
	},

	/**
	  * Function completely hides the error container from view
	  *
	  * @author kinsho
	  */
	hideErrorContainer: function()
	{
		var view = this,
			$errorContainer = $('#errorContainer'),
			$errorHeader = $errorContainer.find('div.title'),
			$errorList = $errorContainer.find('div.list'),
			$deferred = $.Deferred();

		if ($errorHeader.is(':visible'))
		{
			$errorHeader.slideUp(view.HEADER_SLIDE_DURATION, function()
			{
				$errorContainer.addClass('fadeOut');
				window.setTimeout(function()
				{
					$errorContainer.css('display', 'none');
					$deferred.resolve();
				}, view.CONTAINER_FADE_DELAY);
			});

			return $deferred.promise();
		}
		else
		{
			// Return a resolved deferred object if the error container is already hidden
			$deferred.resolve();
			return $deferred.promise();		
		}
	},

	/**
	  * Function hides the body of the error container from view. Note that this function
	  * is used to hide all error messages from view when a new AJAX call is made.
	  *
	  * @author kinsho
	  */
	hideErrorList: function()
	{
		var view = this,
			$errorContainer = $('#errorContainer'),
			$errorHeader = $errorContainer.find('div.title'),
			$errorList = $errorContainer.find('div.list'),
			$deferred = $.Deferred();

		if ($errorList.is(':visible'))
		{
			$errorList.slideUp(view.LIST_SLIDE_DURATION, function()
			{
				// Empty out any old error messages
				$errorList.find('ul').html('');

				$deferred.resolve();
			});

			return $deferred.promise();
		}
		else
		{
			// Return a resolved deferred object if the error container is already hidden
			$deferred.resolve();
			return $deferred.promise();		
		}
	},

	/**
	  * Function positions the error container relative to the passed element
	  *
	  * @param $element - the element that will be used to help position the success container
	  *
	  * @author kinsho
	  */
	placeErrorContainer: function($element)
	{
		var errorContainer = document.getElementById('errorContainer'),
			parentDivWidth = $(errorContainer).parents()[0].offsetWidth,
			screenWidth = document.getElementsByTagName('HTML')[0].offsetWidth,
			errorIcon;

		if ($element && $element.css('position') !== 'absolute')
		{
			$element.before(errorContainer);
		}
		else if ( !($element) )
		{
			$('body').appendChild(errorContainer);
		}
	},	
};