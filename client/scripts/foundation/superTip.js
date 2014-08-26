/**
 * Class designed to generate and manage fancy tooltips
 *
 * @author kinsho
 */
define([], function()
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
	 *
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
		 * @author quirksmode.org
		 * @author kinsho
		 */
		placeBox = function(el, superTip)
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

			superTip.style.left = curleft + 'px';
			superTip.style.top = curtop + 'px';
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
			// Function explicitly defined here so that it could later be removed after one execution
			var runEventOnce = function()
			{
				el.removeEventListener('transitionend', runEventOnce);
				superTip.classList.add(SUPER_TIP_FADE_IN_CLASS);
			};

			if ((superTip.getAttribute(ACTIVE_DATA_ATTRIBUTE)) && (superTip.innerHTML.trim()))
			{
				superTip.setAttribute(ACTIVE_DATA_ATTRIBUTE, 'true');

				// Always determine the coordinates at render time, if the tip is not currently rendered
				placeBox(el, superTip);

				// Remember that text can only be shown once the tooltip is fully rendered
				// Thus, a transitionend listener will be set up to detect the end of the rendering of the tooltip
				superTip.classList.add(SUPER_TIP_RENDER_CLASS);
				el.addEventListener('transitionend', runEventOnce);
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
		setUpListeners = function(el, superTip)
		{
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

// ----------------- MODULE DEFINITION --------------------------

	var my =
	{
		/**
		 * Method responsible for constructing the superTips
		 *
		 * @param {HTMLElement} el - the element to associate with a new supertip
		 * @param {String} [text] - the text to display within the supertip
		 *
		 * @author kinsho
		 */
		superTip: function(el, text)
		{
			var superTip;

			text = text || '';

			if ( !(el.getAttribute(SUPER_TIP_DATA_ATTRIBUTE)) )
			{
				superTip = createTip(el, text);
				setUpListeners(el, superTip);
			}
		},

		/**
		 * Function unravels the tooltip gracefully and ensures that it's not fired again by taking out the text
		 * contained within. Think of this function as a very hard reset
		 *
		 * @param el - the element that will generate the supertip once hovered over
		 *
		 * @author kinsho
		 */
		resetSuperTip: function(el)
		{
			var superTip = superTips[el.getAttribute(SUPER_TIP_DATA_ATTRIBUTE)].superTip;

			superTip.setAttribute(HOVER_DATA_ATTRIBUTE, '');
			superTip.setAttribute(FOCUS_DATA_ATTRIBUTE, '');
			superTip.setAttribute(ACTIVE_DATA_ATTRIBUTE, '');
			superTip.classList.remove(SUPER_TIP_RENDER_CLASS, SUPER_TIP_FADE_IN_CLASS);

			my.changeSuperTipText(null, '', superTip);
		},

		/**
		 * Replaces old text within supertip with new text. Note that either the element or supertip can be
		 * provided to this function. If both are provided, the superTip modified will be the passed
		 * superTip, even if that superTip is not associated with the passed host element.
		 *
		 * @param {HTMLElement} [el] - the element that will generate the supertip once hovered over
		 * @param {String} [text] - the new text to place within the supertip. If no text is supplied,
		 *		whatever text has already been placed within the supertip will be wiped out
		 * @param {HTMLElement} superTip - the supertip to modify
		 *
		 * @author kinsho
		 */
		changeSuperTipText: function(el, text, superTip)
		{
			el = el || {};
			superTip = superTip || superTips[el.getAttribute(SUPER_TIP_DATA_ATTRIBUTE)].superTip;
			text = text || '';

			superTip.innerHTML(text);
		}
	};

// ----------------- LISTENERS -----------------------------

	/**
	 * Every time the window is resized, any visible superTips may need to be repositioned, considering
	 * that these superTips were initially positioned according to elements that were laid out against
	 * an old set of viewport dimensions
	 *
	 * @author kinsho
	 */
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