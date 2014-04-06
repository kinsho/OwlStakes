/**
  *	Class designed to generate and manage fancy tooltips
  *
  * @author kinsho
  */

window.superToolTip = (function()
{

	// ------------- CONSTANTS -----------------------

	var CSSCLASS = 'superToolTip',
	    FONTCLASS = 'superToolTipFont',
		TIP_RENDER_TIME = 200, // the amount of time needed to fully render the tooltip
		HEIGHT_OFFSET = 2, // the amount by which to additionally offset the tooltip vertically relative to its host

	// ------------- PRIVATE METHODS -------------------

		/**
		  * Method responsible for instantiating and styling the supertip.
		  *
		  * @param el - the element that'll generate the supertip once hovered over
		  * @param text - the text that'll be displayed within the supertip
		  * @return the newly created supertip element
		  * @author kinsho
		  */
		createTip = function(el, text)
		{
			var div = document.createElement('div');

			// Preset most of the necessary properties for the super tool tip
			div.className = CSSCLASS;
			div.innerHTML = text;
			calculateWidth(div, text);
			div.setAttribute('data-element', el.id);

			// Append the supertip to the document body
			document.body.appendChild(div);

			return div;
		},

		/**
		  * Method responsible for positioning the supertip
		  *
		  * @param el - the element that'll generate the supertip once hovered over
		  * @param div - the supertip itself
		  *
		  * @author kinsho
		  */
		placeBox = function(el, div)
		{
			var coords = findLocationOfElement(el);

			div.style.left = coords.left + 'px';
			div.style.top = $(div).is(':visible') ? coords.top - div.offsetHeight - HEIGHT_OFFSET + 'px': coords.top - retrieveTipHeight(div) - HEIGHT_OFFSET + 'px';
		},

		/**
		 * Finds the absolute position of an element on a page
		 *
		 * @param el - the element in question
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
				}
				while (obj = obj.offsetParent);
			}

			return { left : curleft, top : curtop };
		},

		/**
		  * Method responsible for setting up the onmouseover and onmouseout listeners
		  *
		  * @param el - the element that'll generate the supertip once hovered over
		  *
		  * @author kinsho
		  * @todo Both listeners below should then be replaced with the mouseenter and mouseleave event listeners once 
		  *       both are fully compatible across all major browsers.
		  * @todo The text within the tooltip should fade into/out of the view
		  */
		setUpListeners = function(el)
		{
			this.$superTips = $('.superToolTip');
			
			el.onmouseover = function() 
			{		
				var $tip = findAssociatedTip(el);
				
				$tip.data('hover', 'true');
				
				if ( ($tip) && ($tip.data('active')) && ($tip.html()) )
				{
					// Always determine the coordinates at render time, if the tip is not currently rendered
					if ( !($tip.data('focus')) )
					{
						placeBox(el, $tip[0]);
					}

					// Remember that text can only be shown once the tooltip is fully rendered.
					$tip.show(TIP_RENDER_TIME, function()
					{
						$tip.addClass(FONTCLASS);
					});
				}
			};
			
			el.onmouseout = function()
			{		
				var $tip = findAssociatedTip(el);

				$tip.data('hover', '');

				if ( !($tip.data('focus')) )
				{
					$tip.removeClass(FONTCLASS);
					$tip.hide(TIP_RENDER_TIME);
				}
			};

			el.onfocus = function()
			{
				var $tip = findAssociatedTip(el);

				$tip.data('focus', 'true');

				if ( ($tip) && ($tip.data('active')) && ($tip.html()) )
				{
					// Always determine the coordinates at render time, if the tip is not currently rendered
					if ( !($tip.data('hover')) )
					{
						placeBox(el, $tip[0]);
					}

					// Remember that text can only be shown once the tooltip is fully rendered.
					$tip.show(TIP_RENDER_TIME, function()
					{
						$tip.addClass(FONTCLASS);
					});
				}	
			};
			
			el.onblur = function()
			{
				var $tip = findAssociatedTip(el);

				$tip.data('focus', '');

				if ( !($tip.data('hover')) )
				{
					$tip.removeClass(FONTCLASS);
					$tip.hide(TIP_RENDER_TIME);
				}
			};

			if ((console) && (console.info))
			{
				console.info('Installed supertip listeners on ' + el.id);
			}
		},

		/**
		  * Test whether an object is a DOM Node via duck typing/DOM2 typing
		  *
		  * @author StackOverflow user
		  */
		evaluateElement = function(obj)
		{
			try
			{
				// Using W3 DOM2 (works for FF, Opera and Chrome)
				return obj instanceof HTMLElement;
			}
			catch(e)
			{
				/*
				 * Browsers not supporting W3 DOM2 don't have HTMLElement and
				 * an exception is thrown and we end up here. Testing some
				 * properties that all elements have. (works on IE7)
				 */

				return ( (typeof obj === "object") && (obj.nodeType) && (obj.hasAttributes) );
			}
		},

		/**
		  * Test whether an object is a String via duck typing
		  *
		  * @author kinsho
		  */
		evaluateString = function(obj)
		{
			return ( (obj !== undefined) && (obj.split) && (obj.indexOf) && (obj.charAt) );
		},

		/**
		  * The width of the supertip is explicitly calculated according to the length of the text
		  * enclosed within it.
		  *
		  * @param div - the supertip that needs to have its width set
		  * @param text - the text enclosed within the supertip
		  *
		  * @author kinsho
		  */
		calculateWidth = function(div, text)
		{
			div.style.width = (text.length > 25) ? '160px' : text.length * 6 + 'px';
		},

		/**
		  * The height of the supertip is left to the browser given that the browser is best capable of
		  * calculating the height necessary to gracefully enclose the text. To pull this off, the supertip
		  * needs to be rendered by the browser sneakily (for it has to be kept hidden from user view). After it 
		  * is rendered, the height will be used to displace the tip so that it does not overlap with its host
		  * element.
		  *
		  * @param div - the supertip that needs to have its height measured
		  *	@return - the height of the passed supertip
		  *
		  * @author kinsho
		  */
		retrieveTipHeight = function(div, isVisible)
		{
			var tipHeight = 0;

			// The element must be re-rendered so that the height of the tooltip is properly adjusted to the text inside
			div.style.visibility = 'hidden';
			div.style.display = 'block';

			tipHeight = div.offsetHeight;

			div.style.display = 'none';
			div.style.visibility = 'visible';

			return tipHeight;
		},

		/**
		  * Helper method used to find the supertip associated with an element, if one exists.
		  *
		  * @param el - the element for which this function will find its corresponding supertip
		  * @return the supertip associated with the passed element. If no supertip exists, then 'undefined' is returned.
		  *
		  * @author kinsho
		  */
		findAssociatedTip = function(el)
		{
			var element = el.id,
				$superTip = undefined;

			if ( !(this.$superTips) )
			{
				return undefined;
			}

			this.$superTips.each(function()
			{
				var $tip = $(this);
				if ($tip.data('element') === element)
				{
					$superTip = $tip;
					return false;
				}
			});

			return $superTip;
		};

	// ------------- RESIZE EVENT LISTENER ------------

	/**
	  * Listener designed to reposition any visible supertips following a resizing of the window
	  *
	  * @author kinsho
	  */
	$(window).on('resize', { view: this }, function()
	{
		if (this.$superTips)
		{
			this.$superTips.each(function()
			{
				var $tip = $(this);

				if ($tip.is(':visible'))
				{
					placeBox(document.getElementById($tip.data('element')), this);
				}
			});
		}
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