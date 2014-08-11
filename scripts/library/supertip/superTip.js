/**
  *	Class designed to generate and manage fancy tooltips
  *
  * @author kinsho
  */
define(['jquery'], function($)
{
	"use strict";

// ----------------- ENUM/CONSTANTS -----------------------------

	var SUPER_TIP_CLASS = 'superTip',
		SUPER_TIP_RENDER_CLASS = 'superTipRender',
		SUPER_TIP_FADE_IN_CLASS = 'superTipFadeIn',

		SUPER_TIP_DATA_ATTRIBUTE = 'data-super-tip',
		HOVER_DATA_ATTRIBUTE = 'data-hover',
		FOCUS_DATA_ATTRIBUTE = 'data-focus',
		ACTIVE_DATA_ATTRIBUTE = 'data-active';

// ----------------- PRIVATE VARIABLES	 -----------------------------

	var superTips = [],
		nextAvailableID = 1;

// ----------------- PRIVATE FUNCTIONS -----------------------------

	/**
	 * Method responsible for instantiating and styling the supertip.
	 *
	 * @param {HTMLElement} el - the element that will generate the supertip once hovered over
	 * @param {String} text - the text that will be displayed within the supertip
	 * @returns {HTMLElement} the newly created supertip element
	 *
	 * @author kinsho
	 */
	var createTip = function(el, text)
		{
			var superTip = document.createElement('div');

			// Preset most of the necessary properties for the super tool tip
			superTip.classList.add(SUPER_TIP_CLASS);
			superTip.innerHTML = text;

			// Keep track of the supertip within local data storage and on the target element itself
			el.setAttribute(SUPER_TIP_DATA_ATTRIBUTE, nextAvailableID);
			superTips[nextAvailableID] =
			{
				superTip: superTip,
				hostElement: el
			};

			// Increment the ID tracker for the next supertip to be generated
			nextAvailableID += 1;

			// Append the supertip to the document body
			document.body.appendChild(superTip);

			return superTip;
		},

		/**
		 * Method responsible for positioning the supertip
		 *
		 * @param {HTMLElement} el - the element associated with the passed supertip
		 * @param {HTMLElement} superTip - the passed supertip
		 *
		 * @author kinsho
		 */
		placeBox = function(el, superTip)
		{
			var coords = findLocationOfElement(el);

			superTip.style.left = coords.left + 'px';
			superTip.style.top = coords.top + 'px';
		},

		/**
		 * Finds the absolute position of an element on a page
		 *
		 * @param {HTMLElement} el - the element whose absolute position will be deducted
		 *
		 * @author quirksmode.org
		 * @author kinsho
		 */
		findLocationOfElement = function(el)
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

					// Make sure to account for the fact that browsers may store the matrix values within different property labes
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

					obj = obj.offsetParent;
				}
				while (obj);
			}

			return { left : curleft, top : curtop };
		},

		/**
		 * Method allows one to set an event listener that will only execute once before removing itself
		 * from its host element
		 *
		 * @param {HTMLElement} element - the element to which to attach the listener
		 * @param {String} type - the type of listener to attach to the event
		 * @param {Function} listenerFunction - the listener function
		 *
		 * @author kinsho
		 */
		setOneAndDoneListener = function(element, type, listenerFunction)
		{
			// Function will remove the listener from its host element as soon as the listener is invoked
			var runEventOnce = function()
				{
					element.removeEventListener(type, runEventOnce);
					listenerFunction();
				};

			element.addEventListener(type, runEventOnce);
		},

		/**
		 * Method responsible for phasing the supertip into view
		 *
		 * @param {HTMLElement} el - the element associated with the supertip to display
		 * @param {HTMLElement} superTip - the supertip to make visible
		 *
		 * @author kinsho
		 */
		showSuperTip = function(el, superTip)
		{
			if ((superTip.getAttribute(ACTIVE_DATA_ATTRIBUTE)) && (superTip.innerHTML.trim()))
			{
				superTip.setAttribute(ACTIVE_DATA_ATTRIBUTE, 'true');

				// Always determine the coordinates at render time, if the tip is not currently rendered
				placeBox(el, superTip);

				// Remember that text can only be shown once the tooltip is fully rendered.
				superTip.classList.add(SUPER_TIP_RENDER_CLASS);
				setOneAndDoneListener(el, 'transitionend', function()
				{
					superTip.classList.add(SUPER_TIP_FADE_IN_CLASS);
				});
			}
		},

		/**
		 * Method responsible for hiding the supertip from view
		 *
		 * @param {HTMLElement} superTip - the supertip to hide
		 *
		 * @author kinsho
		 */
		hideSuperTip = function(superTip)
		{
			if ( !(superTip.getAttribute(ACTIVE_DATA_ATTRIBUTE)) )
			{
				superTip.setAttribute(ACTIVE_DATA_ATTRIBUTE, '');
				superTip.classList.remove(SUPER_TIP_RENDER_CLASS, SUPER_TIP_FADE_IN_CLASS);
			}
		},

		/**
		 * Method responsible for setting up the focus and mouse listeners that will regulate the visibility
		 * of the supertip associated with the passed element
		 *
		 * @param {HTMLElement} el - the element that will have listeners placed upon it
		 * @param {HTMLElement} superTip - the superTip that will be acted upon by listeners
		 *
		 * @author kinsho
		 */
		setUpListeners = function(el)
		{
			var superTip = superTips[el.getAttribute(SUPER_TIP_DATA_ATTRIBUTE)],
				i;

			el.addEventListener('mouseover', function()
			{
				superTip.setAttribute(HOVER_DATA_ATTRIBUTE, 'true');
				showSuperTip(el, superTip);
			});

			el.addEventListener('mouseout', function()
			{
				superTip.setAttribute(HOVER_DATA_ATTRIBUTE, '');
				hideSuperTip(superTip);
			});

			el.addEventListener('focus', function()
			{
				superTip.setAttribute(FOCUS_DATA_ATTRIBUTE, 'true');
				showSuperTip(el, superTip);
			});

			el.addEventListener('blur', function()
			{
				superTip.setAttribute(FOCUS_DATA_ATTRIBUTE, '');
				hideSuperTip(superTip);
			});

			if ((console) && (console.info))
			{
				console.info('Installed supertip listeners on ' + el.getAttribute(SUPER_TIP_DATA_ATTRIBUTE));
			}
		};

// ----------------- LISTENERS -----------------------------

	window.addEventListener('resize', function()
	{
		var superTipRecord,
			superTip,
			element;

		for (superTipRecord in superTips)
		{
			superTip = superTipRecord.superTip;
			element = superTipRecord.element;

			if (superTip.getAttribute(ACTIVE_DATA_ATTRIBUTE))
			{
				placeBox(element, superTip);
			}
		}
	});

});


	// ------------- PUBLIC METHODS -------------------

	return {

		/**
		  * Method responsible for constructing the super tool tips
		  *
		  * @param el - the element that'll generate the supertip once hovered over
		  * @param text(optional) - the text that'll be displayed within the supertip
		  *
		  * @author kinsho
		  */
		superTip: function(el, text)
		{
			var divTip;

			text = text || '';

			try
			{
				if ( !(el) || !(evaluateElement(el)) || !(evaluateString(text)) )
				{
					throw 'A supertip could not be properly instantiated. Please ensure that you are passing in the parameters properly.';
				}
				else if ( !(el.id) )
				{
					throw 'All elements that will be tagged with a supertip must have an ID. At least one of these elements is missing an ID.';
				}

				if ( !(findAssociatedTip(el)) )
				{
					divTip = createTip(el, text);
					setUpListeners(el);
					this.activateSuperTip(el, divTip);
				}
			}
			catch(ex)
			{
				alert(ex);
			}
		},

		/**
		  * Activates a supertip so that it can be displayed on screen
		  *
		  * @param el - the element that'll generate the supertip once hovered over
		  * @param divTip(optional) - the supertip itself
		  *
		  * @author kinsho
		  */
		activateSuperTip: function(el, divTip)
		{
			var $tip = divTip ? $(divTip) : findAssociatedTip(el);

			if ($tip)
			{
				$tip.data('active', 'true');
			}
		},

		/**
		  * Deactivates a supertip so that it cannot be displayed on screen even if mouse is hovering over its hosts element
		  *
		  * @param el - the element that's supposed generate the supertip once hovered over
		  * @param divTip(optional) - the supertip itself
		  *
		  * @author kinsho
		  */
		deactivateSuperTip: function(el, divTip)
		{
			var $tip = divTip ? $(divTip) : findAssociatedTip(el);

			if ($tip)
			{
				$tip.data('active', '');
			}
		},

		/**
		  * Function de-renders the tooltip gracefully and ensures that it's not fired again by
		  * taking out the text contained within.
		  *
		  * @param el - the element that'll generate the supertip once hovered over
		  *
		  * @author kinsho
		  */
		resetSuperTip: function(el)
		{
			var $tip = findAssociatedTip(el);

			$tip.data('hover', '');
			$tip.data('focus', '');
			$tip.removeClass(FONTCLASS);
			$tip.hide(TIP_RENDER_TIME);

			this.changeSuperTipText(null, '', $tip[0]);
		},

		/**
		  * Replaces old text within supertip with new text
		  *
		  * @param el - the element that'll generate the supertip once hovered over
		  * @param text(optional) - the new text that'll be placed within the supertip. If no text is supplied,
		  *				whatever text has already been placed within the supertip will be wiped out
		  * @param divTip(optional) - the supertip itself
		  *
		  * @author kinsho
		  */
		changeSuperTipText: function(el, text, divTip)
		{
			var $tip = divTip ? $(divTip) : findAssociatedTip(el);

			text = text || '';

			try
			{
				$tip.html(text);

				if (text)
				{
					calculateWidth($tip[0], text);
				}
			}
			catch(ex)
			{
				alert('Cannot modify text associated with ' + (el.id || el.name) + ' ---> Error message: ' + ex);
			}
		}
	};
}());