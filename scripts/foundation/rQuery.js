window.rQuery =
{
	INFO_ICON: '../images/infoIcon.png',
	HINT_ICON: '../images/hintIcon.png',
	NO_VISIBILITY_CLASS: 'hidden', 
	TOGGLE_SELECTED_CLASS: 'toggleSelect',
	AUTOCOMPLETE_GENERIC_SUGGESTION_BOX_CLASS: 'genericAutocompleteSuggestionBox',
	AUTOCOMPLETE_MODAL_GENERIC_SUGGESTION_BOX_CLASS: 'genericModalAutocompleteSuggestionBox',
	AUTOCOMPLETE_NO_SUGGESTIONS_FOUND: ' --- No Matches Found --- ',
	HIGHLIGHT_CLASS: 'highlight',
	MODAL_ABSOLUTE_POSITIONING_OFFSET: 8, // If absolutely positioning an element within a modal, account for the modal's border width

	/**
	  * Function serves to properly format all infoRows on the page to include the
	  * information icon and set up the necessary floating
	  *
	  * @author kinsho
	  */
	infoRows: function()
	{
		var view = this,
			$infoRows = $('.infoRow');

		$infoRows.each(function()
		{
			var $this = $(this),
				imageElement = document.createElement('img'),
				spanElement = document.createElement('span'),
				parentDivElement = document.createElement('div');

			imageElement.src = view.INFO_ICON;
			imageElement.alt = '[Info]';
			imageElement.title = 'Important Information';
			spanElement.className = 'infoRowContent';
			parentDivElement.className = 'oneOverOne center';

			$this.wrapInner(spanElement);
			$this.children().before(imageElement);

			if ($this.hasClass('center'))
			{
				$this.wrap(parentDivElement);
			}
		});
	},

	/**
	  * Function serves to properly format all hintTips on the page.
	  * All hint tip strings that were rendered on page load are replaced with hint icons
	  * that will then be linked to a supertip with the corresponding string
	  *
	  * @author kinsho
	  */
	hintTips: function()
	{
		var view = this,
			$hintTips = $('.hintTip');

		$hintTips.each(function()
		{
			var $this = $(this),
				imageElement = document.createElement('img'),
				text = $this.html();

			imageElement.src = view.HINT_ICON;
			imageElement.alt = '[Hint]';

			// Transfer the ID on the host span element over to the newly generated image element
			imageElement.id = this.id;
			this.removeAttribute('id');

			$this.html('');
			$this.append(imageElement);
			// Initiate the tooltip for this hint using the string that was initially stored within the hint tip span on page load
			superToolTip.superTip(imageElement, text);
		});
	},

	/**
	  * Function serves to properly generate all supertips specifically for hover icons
	  *
	  * @author kinsho
	  */
	hoverTips: function()
	{
		var $hoverTips = $('[data-hovertip]');

		$hoverTips.each(function()
		{
			var $this = $(this),
				text = $this.data('hovertip');

			// Initiate the tooltip for this hint using the HTML that was initially stored within the hint tip on page load
			superToolTip.superTip(this, text);
		});
	},

	/**
	  * Function serves to reformat all the select dropdown elements on the page into
	  * Select2 dropdowns
	  *
	  * @author kinsho
	  */
	select2: function()
	{
		var $selectElements = $('select');

		$selectElements.each(function()
		{
			var $this = $(this);

			$this.select2({
				width: '200px'
			});
			console.info('Converted ' + (this.id || this.name || 'select dropdown') + ' to Select2');
		});
	},

	/**
	  * Function serves to initiate autocomplete functionality on fields that have been marked
	  * in a specific way
	  *
	  * @param element {HTMLNode} - the text field element that'll be incorporated with autocomplete functionality
	  * @param sourceURL {String} - the URL that will be invoked in order to fetch new suggestions to inject into the
	  * 	the suggestion box
	  * @param [minLength] {Number} - if provided, the minimum length of characters that wil need to be typed before
	  *		the client initiates a server-side request to fetch matches
	  * @param [suggestionBoxClass] {String} - if supplied, the styling to apply to the suggestion box
	  * @param [customInjectionFunction] {Function} - if provided, all the generic logic to inject suggestions into the
	  *		the suggestion box will be ignored and this function will be invoked instead
	  *
	  * @author kinsho
	  */
	autocomplete: function(element, sourceURL, minLength, suggestionBoxClass, customInjectionFunction)
	{
		var view = this, // reference to the rQuery object
			minLength = minLength || 1,
			suggestionDiv = document.createElement('div'),
			$suggestionDiv = $(suggestionDiv),

			/*
			 * Sub-function meant to be invoked every time data is fetched from the back end. The function
			 * calculates and renders exactly the number of specialized rows needed within the suggestion
			 * box in order to display all the data returned from the server
			 *
			 * @param {Array} data - the dataset that'll be needed here to compute the number of rows
			 *					that'll need to be rendered in order to contain all the data
			 *
			 * @author kinsho
			 */
			renderNumberOfRowsNeeded = function(data)
			{
				var numOfRowsNeeded = data.length || 1, // In the event that no data is there, we have to render one row to indicate that no matches were found
					numOfRowsPresent = $suggestionDiv.find('div').length,
					i,
					rowElement,
					hostElementCoords;

				// If the number of rows needed exceeds the number of rows already present within the suggestion box,
				// add rows to make up the different
				if (numOfRowsNeeded > numOfRowsPresent)
				{
					for (i = numOfRowsNeeded - numOfRowsPresent; i > 0; i -= 1)
					{
						rowElement = document.createElement('DIV');
						suggestionDiv.appendChild(rowElement);

						// Ensure that each new row has a listener set up to detect clicks that indicate selection
						rowElement.addEventListener('click', selectOption);
					}
				}
				// Else if the number of rows needed is less than the number of rows already present within the
				// suggestion box, remove rows until you have exactly the number of rows needed
				else if (numOfRowsPresent > numOfRowsNeeded)
				{
					for (i = numOfRowsPresent - numOfRowsNeeded; i > 0; i -= 1)
					{
						suggestionDiv.removeChild(suggestionDiv.lastChild)
					}			
				}
			},

			/*
			 * Sub-function that'll populate the parent element with the suggestion that the
			 * user has selected
			 *
			 * @param {Event} event - the event that triggered the invocation of this function
			 *
			 * @author kinsho
			 */
			selectOption = function(event)
			{
				var targetElement = document.getElementById(element.id), // Reset the pointer to the host element
					selectedRow = event.currentTarget;

				// As long as the suggestion is not disabled, set the suggestion as the value of the host element
				if (selectedRow.className.indexOf('disabled') < 0)
				{
					targetElement.value = selectedRow.innerHTML.trim();
				}
				$suggestionDiv.addClass(view.NO_VISIBILITY_CLASS);
			},

			/*
			 * Sub-function that'll reset the position of the suggestion box if the
			 * window has been resized somehow
			 *
			 * @author kinsho
			 */
			resetPosition = function()
			{
				var targetElement = document.getElementById(element.id), // Reset the pointer to the host element
					hostElementCoords = utilityFunctions.findLocationOfElement(targetElement),
					isElementWithinModal = $(targetElement).closest('.modal, .nestedModal').length > 0;

				// Place the suggestion box relative to the host element
				// Set up an additional offset to account for the additional spacing from modals
				suggestionDiv.style.left = hostElementCoords.left + (isElementWithinModal ? view.MODAL_ABSOLUTE_POSITIONING_OFFSET : 0);
				suggestionDiv.style.top = hostElementCoords.top + targetElement.offsetHeight + (isElementWithinModal ? view.MODAL_ABSOLUTE_POSITIONING_OFFSET : 0);
			};


		// If no class has been passed to style the suggestion area, use one of two generic templates
		// depending on the circumstances
		if ( !(suggestionBoxClass) )
		{
			suggestionBoxClass = $(element).closest('.modal, .nestedModal').length ? 
								this.AUTOCOMPLETE_MODAL_GENERIC_SUGGESTION_BOX_CLASS :
								this.AUTOCOMPLETE_GENERIC_SUGGESTION_BOX_CLASS;
		}

		// Append the appropriate classes to the suggestion box and load it into the DOM
		suggestionDiv.className = suggestionBoxClass + ' ' + this.NO_VISIBILITY_CLASS;
		document.body.appendChild(suggestionDiv);

		 /*
		  * The generic function that'll serve to fetch and process all suggestion data for the element field
		  * in context once a value has been provided that meets the minimum length requirement
		  *
		  * @param event {Event} - the event object
		  *
		  * @author kinsho
		  */
		$(element).on('keyup', function(event)
		{
			var element = event.currentTarget,
				value = element.value || '',
				$firstRow;

			// Only display the suggestion area once the requisite number of
			// characters have been typed into the input field
			if (value.length >= minLength)
			{
				$.ajax(
				{
					url: sourceURL + '?term=' + value,
					type: 'GET',
					success: function(response)
					{
						var response = $.parseJSON(response);

						renderNumberOfRowsNeeded(response);

						// If suggestions have been returned display them. Otherwise, indicate that no matches have been found
						if (response.length)
						{
							$suggestionDiv.children('div').each(function(index)
							{
								this.innerHTML = response[index];

								// In the event that this is the first row to be displayed, ensure that the row does not contain any prior
								// styling that may have been added when a past search returned no matches
								if (index === 0)
								{
									$(this).removeClass('disabled');
								}
							});
						}
						else
						{
							$firstRow = $suggestionDiv.children('div:first');

							$firstRow.addClass('disabled');
							$firstRow.html(view.AUTOCOMPLETE_NO_SUGGESTIONS_FOUND);
						}

						// Reset the position of the suggestion box
						resetPosition();

						$suggestionDiv.removeClass(view.NO_VISIBILITY_CLASS);
						$suggestionDiv.css('width', element.offsetWidth);
					}
				});
			}
			else
			{
				$suggestionDiv.addClass(view.NO_VISIBILITY_CLASS);
			}
		});

		 /*
		  * The generic function that'll serve to hide the suggestion box from view once the
		  * user navigates away from the host parent element
		  *
		  * @author kinsho
		  */
		$(element).on('blur', function()
		{
			// Bit of a hack here to ensure that any click listener attached to
			// a suggestion is triggered prior to this function being triggered
			window.setTimeout(function()
			{
				$suggestionDiv.addClass(view.NO_VISIBILITY_CLASS);
			}, 200);
		});
	},

	/**
	  * Function serves to convert all marked sets of radio buttons into toggle switches
	  *
	  * @param element {HTMLNode} - the marked DIV that'll have its two radio buttons converted to toggle switches
	  *
	  * @author kinsho
	  */
	toggleSwitch: function(element)
	{
		var view = this, // reference to the rQuery object
			$element = $(element),
			$radios = $element.find('input'),
			$labels = $element.find('label'),
			generatedSpan,
			$spans,

			/*
			 * Sub-function that'll register whatever option the user has selected
			 *
			 * @param event {event} - the event object that led to the invocation of this function
			 *
			 * @author kinsho
			 */
			selectOption = function(event)
			{
				var $option = $(event.currentTarget),
					$toggleSwitchContainer = $option.closest('.toggleSwitch'),
					$radio = $toggleSwitchContainer.find('#' + $option.data('radio'));

				// Check off the radio button associated with the option
				$radio.prop('checked', true);

				// Unselect any other option that's currently selected
				$toggleSwitchContainer.find('span').removeClass(view.TOGGLE_SELECTED_CLASS)
				// Mark the relevant option here as selected
				$option.addClass(view.TOGGLE_SELECTED_CLASS);
			};

		// Generate the switches for each radio choice. Populate each switch with the
		// label text associated with each radio button
		$radios.each(function()
		{
			var $this = $(this)
				inputID = this.id,
				associatedLabel = $labels.filter('[for=' + inputID + ']').html();

			generatedSpan = document.createElement('SPAN');
			generatedSpan.innerHTML = associatedLabel;
			generatedSpan.setAttribute('data-radio', inputID);
			
			element.appendChild(generatedSpan);
		});

		// Don't forget to set up listeners on each span option to indicate that the user has selected something
		$element.find('span').on('click', selectOption);
	},

	/**
	  * Function serves to update the styled spans so as to properly whether any of the radio buttons
	  * have been selected behind the scenes (via JavaScript)
	  *
	  * @param toggleSwitch {HTMLNode} - the toggle switch container
	  *
	  * @author kinsho
	  */
	toggleSwitchUpdate: function(toggleSwitch)
	{
		var view = this, // reference to the rQuery object
			$toggleSwitch = $(toggleSwitch),
			selectedRadioID = $toggleSwitch.find('input:checked').attr('id') || '',
			$toggleSwitchOptions = $toggleSwitch.find('span');

		// Find the option that relates to radio that was selected
		$toggleSwitchOptions.each(function()
		{
			var $this = $(this);

			if ($this.data('radio') === selectedRadioID)
			{
				$this.addClass(view.TOGGLE_SELECTED_CLASS);
			}
			else
			{
				$this.removeClass(view.TOGGLE_SELECTED_CLASS);			
			}
		});
	}
};