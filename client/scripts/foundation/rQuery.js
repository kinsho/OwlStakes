define(['jquery', 'superToolTip', 'utility', 'constants'], function($, superToolTip, utility, constants)
{
// ----------------- ENUM/CONSTANTS --------------------------
	var INFO_ROW_CLASS = 'infoRow',
		INFO_ICON = '../images/infoIcon.png',
		INFO_IMG_ALT = '[Info]',
		INFO_IMG_TITLE = 'Important Information',
		INFO_CONTENT_CLASS = 'infoRowContent',
		HINT_ICON = '../images/hintIcon.png',
		HINT_IMG_ALT = '[Hint]',
		HINT_TIP_CLASS = 'hintTip',
		HOVER_TIP_CLASS = 'hoverTip',
		TOGGLE_SWITCH_CLASS = 'toggleSwitch',
		TOGGLE_SELECTED_CLASS = 'toggleSelected',
		AUTOCOMPLETE_GENERIC_SUGGESTION_BOX_CLASS = 'genericAutocompleteSuggestionBox',
		AUTOCOMPLETE_MODAL_GENERIC_SUGGESTION_BOX_CLASS = 'genericModalAutocompleteSuggestionBox',
		AUTOCOMPLETE_NO_SUGGESTIONS_FOUND = ' --- No Matches Found --- ',
		MODAL_ABSOLUTE_POSITIONING_OFFSET = 8; // If absolutely positioning an element within a modal, account for the modal's border width

// ----------------- MODULE DEFINITION --------------------------
	var my =
		{
			/**
			  * Function serves to properly style an element designated as an infoRow
			  *
			  * @param {HTMLElement} element - the element that will be converted into a stylized infoRow
			  *
			  * @author kinsho
			  */
			generateInfoRow: function(element)
			{
				// Create the elements necessary to generate a stylized infoRow
				var $element = $(element),
					imageElement = document.createElement('img'),
					spanElement = document.createElement('span'),
					parentDivElement = document.createElement('div');

				// Populate various attributes within the newly generated elements
				imageElement.src = INFO_ICON;
				imageElement.alt = INFO_IMG_ALT;
				imageElement.title = INFO_IMG_TITLE;
				spanElement.className = INFO_CONTENT_CLASS;

				// Set the newly constructed elements into the DOM
				$element.wrapInner(spanElement);
				$element.children().before(imageElement);
				$element.wrap(parentDivElement);
			},

			/**
			  * Function serves to properly render hintTips on the page. More specifically, the passed element
			  * will be replaced with a hint icon that itself will house a superTip that contains the hint text
			  * that will be displayed when the user hovers over the icon
			  *
			  * @param {HTMLElement} element - the element that will be converted into a fully functioning hintTip
			  *		Please note that the element MUST have an ID. Otherwise, a superTip cannot be generated
			  *
			  * @author kinsho
			  */
			generateHintTip: function(element)
			{
				var $element = $(element),
					imageElement = document.createElement('img'),
					text = $element.html();

				// Create the IMG element to pull the hint tip icon
				imageElement.src = HINT_ICON;
				imageElement.alt = HINT_IMG_ALT;

				// Transfer the ID on the host span element over to the newly generated image element. Ensure that the ID attribute
				// on the host span element is removed to prevent duplicate IDs
				imageElement.id = this.id;
				element.removeAttribute('id');

				$element.html('');
				$element.append(imageElement);
				// Initiate the tooltip for this hint using the string that was initially stored within the hint tip span on page load
				superToolTip.superTip(imageElement, text);
			},

			/**
			  * Function serves to properly generate a superTip for the passed element
			  *
			  * @param {HTMLElement} element - the element that will soon have its own superTip
			  *
			  * @author kinsho
			  */
			generateHoverTip: function(element)
			{
				var $element = $(element),
					text = $element.data('hoverTip');

				// Initiate the tooltip for this hint using the HTML that was initially stored within the hint tip on page load
				superToolTip.superTip(element, text);
			},

			/**
			  * Function serves to reformat all the select dropdown elements on the page into Select2 dropdowns
			  *
			  * @param {HTMLElement} element - the select dropdown to convert over to a Select2 field
			  * @param {Object} [settings] - the collection of settings with which to apply to the select element
			  *		during conversion
			  *
			  * @author kinsho
			  */
			select2: function(element, settings)
			{
				// Revert to default settings if none were provided
				var settings = settings || { width: '200px' };

				// Convert the select field over to a Select2 field
				$(element).select2(settings);

				// Log the conversion for informational purposes
				console.info('Converted ' + (element.id || element.name || 'a select field') + ' to Select2');
			},

			/**
			  * Function serves to initiate autocomplete functionality on fields that have been specially marked
			  * to allow for such functionality
			  *
			  * @param element {HTMLNode} - the text field element that'll be augmented with autocomplete functionality
			  * @param sourceURL {String} - the URL that will be invoked in order to fetch new suggestions to inject into the
			  * 	the suggestion box
			  * @param [minLength] {Number} - if provided, the minimum length of characters that will need to be typed before
			  *		the client initiates a server-side request to fetch matches
			  * @param [suggestionBoxClass] {String} - if supplied, the styling to apply to the suggestion box
			  * @param [customInjectionFunction] {Function} - if provided, all the generic logic to inject suggestions into the
			  *		the suggestion box will be ignored and this function will be invoked instead
			  *
			  * @author kinsho
			  */
			autocomplete: function(element, sourceURL, minLength, suggestionBoxClass, customInjectionFunction)
			{
				var minLength = minLength || 1,
					suggestionDiv = document.createElement('div'),
					$suggestionDiv = $(suggestionDiv),

					/**
					  * Sub-function meant to be invoked every time data is fetched from the back end. The function
					  * calculates and renders exactly the number of specialized rows needed within the suggestion
					  * box in order to display all the data returned from the server
					  *
					  * @param {Array} data - the dataset that'll be needed here to compute the number of rows
					  *		that'll need to be rendered in order to house all the data
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

						// If the number of rows needed exceeds the number of rows already present within the suggestion box, add rows to make up
						// the difference
						if (numOfRowsNeeded > numOfRowsPresent)
						{
							for (i = numOfRowsNeeded - numOfRowsPresent; i > 0; i -= 1)
							{
								rowElement = document.createElement('div');
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

					/**
					  * Sub-function that'll populate the parent text field with the suggestion that the user has selected
					  *
					  * @param {Event} event - the event that triggered the invocation of this function
					  *
					  * @author kinsho
					  */
					selectOption = function(event)
					{
						var targetElement = document.getElementById(element.id), // Pointer to the host element
							selectedRow = event.currentTarget;

						// As long as the suggestion is not disabled, put the suggestion in the text field
						if (selectedRow.className.indexOf('disabled') < 0)
						{
							targetElement.value = selectedRow.innerHTML.trim();
						}
						$suggestionDiv.addClass(constants.styles.NO_VISIBILITY);
					},

					/**
					  * Sub-function that'll reset the position of the suggestion box if the window has been resized somehow
					  *
					  * @author kinsho
					  */
					resetPosition = function()
					{
						var targetElement = document.getElementById(element.id), // Pointer to the host element
							hostElementCoords = utility.findLocationOfElement(targetElement),
							isElementWithinModal = $(targetElement).closest('.' + constants.modal.MODAL, '.' + constants.modal.NESTED_MODAL).length > 0;

						// Place the suggestion box relative to the host element
						// Set up an additional offset to account for border spacing from the modals
						suggestionDiv.style.left = hostElementCoords.left + (isElementWithinModal ? MODAL_ABSOLUTE_POSITIONING_OFFSET : 0);
						suggestionDiv.style.top = hostElementCoords.top + targetElement.offsetHeight + (isElementWithinModal ? MODAL_ABSOLUTE_POSITIONING_OFFSET : 0);
					};


				// If no class has been passed to style the suggestion area, use one of two generic templates
				// depending on the circumstances
				if ( !(suggestionBoxClass) )
				{
					suggestionBoxClass = $(element).closest('.' + constants.modal.MODAL, '.' + constants.modal.NESTED_MODAL).length ? 
										AUTOCOMPLETE_MODAL_GENERIC_SUGGESTION_BOX_CLASS :
										AUTOCOMPLETE_GENERIC_SUGGESTION_BOX_CLASS;
				}

				// Append the appropriate classes to the suggestion box and load it into the DOM
				suggestionDiv.className = suggestionBoxClass + ' ' + constants.styles.NO_VISIBILITY;
				document.body.appendChild(suggestionDiv);

				 /**
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

					// Only display the suggestion area once the requisite number of characters have been typed
					// into the input field
					if (value.length >= minLength)
					{
						$.ajax(
						{
							url: sourceURL + '?term=' + value,
							type: 'GET',
							success: function(response)
							{
								var response = $.parseJSON(response);

								// Fix the number of rows present within the suggestions area depending on the number of results that
								// were returned from the back-end
								renderNumberOfRowsNeeded(response);

								// If suggestions have been returned, display them. Otherwise, indicate that no matches have been found
								if (response.length)
								{
									$suggestionDiv.children('div').each(function(index)
									{
										this.innerHTML = response[index];

										// In the event that this is the first row to be displayed, ensure that the row does not contain any prior
										// styling that may have been added when a past search returned no matches
										if (index === 0)
										{
											$(this).removeClass(constants.styles.DISABLED);
										}
									});
								}
								else
								{
									$firstRow = $suggestionDiv.children('div:first');

									$firstRow.addClass(constants.styles.DISABLED);
									$firstRow.html(AUTOCOMPLETE_NO_SUGGESTIONS_FOUND);
								}

								// Reset the position of the suggestion box
								resetPosition();

								// Now adjust the width of the suggestions area using the width of the host element, then show the suggestions area
								$suggestionDiv.css('width', element.offsetWidth);
								$suggestionDiv.removeClass(constants.styles.NO_VISIBILITY);
							}
						});
					}
					else
					{
						$suggestionDiv.addClass(constants.styles.NO_VISIBILITY);
					}
				});

				 /**
				   * The generic function that'll serve to hide the suggestion box from view once the user navigates 
				   * away from the host parent element
				   *
				   * @author kinsho
				   */
				$(element).on('blur', function()
				{
					// The timeout used here is a bit of a hack to ensure that any click listener attached to a suggestion
					// is triggered prior to this function being triggered
					window.setTimeout(function()
					{
						$suggestionDiv.addClass(constants.styles.NO_VISIBILITY);
					}, 200);
				});
			},

			/**
			  * Function serves to convert specifically marked sets of radio buttons into toggle switches
			  *
			  * @param {HTMLElement} element - the marked DIV that'll have its two radio buttons converted to toggle switches
			  *
			  * @author kinsho
			  */
			toggleSwitch: function(element)
			{
				var $element = $(element),
					$radios = $element.find('input'),
					$labels = $element.find('label'),
					generatedSpan,
					$spans,

					/**
					  * Sub-function that'll register whatever option the user has selected
					  *
					  * @param {Event} event - the event that triggered the invocation of this function
					  *
					  * @author kinsho
					  */
					selectOption = function(event)
					{
						var $option = $(event.currentTarget),
							$toggleSwitchContainer = $option.closest('.' + TOGGLE_SWITCH_CLASS),
							$radio = $toggleSwitchContainer.find('#' + $option.data('radio'));

						// Check off the radio button associated with the option
						$radio.prop('checked', true);

						// Unselect any other option that's currently selected
						$toggleSwitchContainer.find('span').removeClass(TOGGLE_SELECTED_CLASS)
						// Mark the relevant option here as selected
						$option.addClass(TOGGLE_SELECTED_CLASS);
					};

				// Generate the switches for each radio choice. Populate each switch with the
				// label text associated with each radio button
				$radios.each(function()
				{
					var $this = $(this),
						inputID = this.id,
						associatedLabel = $labels.filter('[for=' + inputID + ']').html();

					generatedSpan = document.createElement('span');
					generatedSpan.innerHTML = associatedLabel;
					generatedSpan.setAttribute('data-radio', inputID);
					
					element.appendChild(generatedSpan);
				});

				// Don't forget to set up listeners on each span option to indicate that the user has selected something
				$element.find('span').on('click', selectOption);
			},

			/**
			  * Function serves to update the styled spans so as to properly indicate whether any of the radio buttons
			  * have been selected behind the scenes (via JavaScript)
			  *
			  * @param {HTMLElement} toggleSwitch - the toggle switch container
			  *
			  * @author kinsho
			  */
			toggleSwitchUpdate: function(toggleSwitch)
			{
				var $toggleSwitch = $(toggleSwitch),
					selectedRadioID = $toggleSwitch.find('input:checked').attr('id') || '',
					$toggleSwitchOptions = $toggleSwitch.find('span');

				// Find the option that relates to radio that was selected
				$toggleSwitchOptions.each(function()
				{
					var $this = $(this);

					if ($this.data('radio') === selectedRadioID)
					{
						$this.addClass(TOGGLE_SELECTED_CLASS);
					}
					else
					{
						$this.removeClass(TOGGLE_SELECTED_CLASS);			
					}
				});
			}
		};

// ----------------- INITIALIZATION LOGIC --------------------------

		var $infoRows = $('.' + INFO_ROW_CLASS),
			$hintTips = $('.' + HINT_TIP_CLASS),
			$hoverTips = $('.' + HOVER_TIP_CLASS);

		// As a convenience, specific specially marked elements will be converted either to infoRows, hintTips, or hoverTips,
		// depending on the nature of the marking
		$infoRows.each(function()
		{
			my.generateInfoRow(this);
		});

		$hintTips.each(function()
		{
			my.generateHintTip(this);
		});

		$hoverTips.each(function()
		{
			my.generateHoverTip(this);
		});

// ----------------- END --------------------------
	return my;
});