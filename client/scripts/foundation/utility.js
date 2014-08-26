/**
 * @module utility
 */

define([], function()
{
	"use strict";
// ----------------- MODULE DEFINITION --------------------------

	return {
		/**
		  * Function serves to throttle the number of times a handler function executes at once regardless
		  * of how often it is invoked.
		  *
		  * NOTE: All handler functions will need to make use of jQuery deferred in order to inform the debouncer
		  *		logic of when the handler finishes execution.
		  *
		  * @param {Function} handlerFunction - the function to be throttled
		  * @param {Number} throttlerFrequency - the max number of times the function can execute at once
		  *
		  * @returns {Function} a wrapper which will control access to the debounced function
		  *
		  * @author kinsho
		  */
		debouncer: function(handlerFunction, throttlerFrequency)
		{
			var totalNumberOfTickets = 0,
				ticketToService = 1, // Will be used to service requests according to the order in which they arrived
				debouncedFunction = function(event, ticketNumber)
				{
					// Determines the order of this request in the queue of requests
					ticketNumber = ticketNumber || ++totalNumberOfTickets;

					if ( (throttlerFrequency) && (ticketNumber === ticketToService) )
					{
						ticketToService += 1;
						throttlerFrequency -= 1;
						// Relying on jQuery Deferred here to determine when the function finishes executing
						handlerFunction(event).done(function()
						{
							throttlerFrequency += 1;
						});
					}
					else
					{
						// Invoke this same function again in a tenth of a second to check to
						// see if it is allowed to invoke the handler function then
						window.setTimeout(debouncedFunction, 100, [event, ticketNumber]);
					}
				};

			return debouncedFunction;
		},

		/**
		  * Function returns a clone of the passed object
		  *
		  * @param {Object} obj - the object to be cloned
		  *
		  * @returns {Object} comprised of all the unique key/value pairs found within the passed object
		  *
		  * @author kinsho
		  */
		cloneObject: function(obj)
		{
			var clone = {},
				prop;

			// For each unique key, create a duplicate of the key/value pair within the object to be returned
			for (prop in obj)
			{
				clone[prop] = obj[prop];
			}

			return clone;
		},

		/**
		  * Function serves to unset the passed transition listener from the passed element, accounting for certain
		  * limitations present among some of the major browsers
		  *
		  * @param {HTMLElement} element - the element from which the transition listener needs to be removed
		  * @param {Function} listenerFunction - the listener function that needs to be removed from the element
		  *
		  * @author kinsho
		  */
		removeEventListener: function(element, listenerFunction, type)
		{
			var transitions = ['transitionend', 'otransitionend', 'webkitTransitionEnd'],
				animations = ['animationend', 'oanimationend', 'webkitAnimationEnd', 'MSAnimationEnd'],
				i;

			if (type === 'transitionend')
			{
				for (i = transitions.length - 1; i >= 0; i -= 1)
				{
					element.removeEventListener(transitions[i], listenerFunction);
				}
			}
			else if (type === 'animationend')
			{
				// Set the logic to fire the listener upon the end of any animation made by that element
				for (i = animations.length - 1; i >= 0; i -= 1)
				{
					element.removeEventListener(animations[i], listenerFunction);
				}
			}
			else
			{
				element.removeEventListener(type, listenerFunction);
			}
		},

		/**
		  * Function serves to unset the passed transition listener from the passed element, accounting for certain
		  * limitations present among some of the major browsers
		  *
		  * @param {HTMLElement} element - the element upon which to set the listener
		  * @param {Function} listenerFunction - the function that needs to be attached to the element as a listener
		  * @param {String} type - the type of listener that will be set upon the element
		  * @param {Number} timeoutDelay - in case a nonzero value is provided, then the listener will be triggered as a
		  * 	timeout function that will be invoked only after the specified delay
		  * @param {Boolean} removeAfterOneUse - a flag to indicate whether the listener should be removed after
		  *		it has been triggered just once
		  * @param {Array} [params] - the parameters that will be supplied directly to the listener when it is finally
		  *		invoked
		  *
		  * @author kinsho
		  */
		setEventListener: function(element, listenerFunction, type, timeoutDelay, removeAfterOneUse, params)
		{
			var my = this,
				transitions = ['transitionend', 'otransitionend', 'webkitTransitionEnd'],
				animations = ['animationend', 'oanimationend', 'webkitAnimationEnd', 'MSAnimationEnd'],

				// If the listener has to be removed after it has been invoked just once, set up a wrapper function
				// that removes the listener after directly invoking it
				listenerWrapper = (removeAfterOneUse) ? function()
				{
					listenerFunction.apply(null, arguments);
					my.removeEventListener(element, timeoutFunction, type);
				} : listenerFunction,

				// Used to account for any parameters that may need to be passed to the listener function
				paramsFunction = (params) ? function(event)
				{
					var processedParams = [event]; // the fully array of parameters to feed the listener

					// Prep the parameters array
					params = params || [];

					listenerWrapper.apply(null, processedParams.concat(params));
				} : listenerWrapper,

				// Used to account for any time delays that need to be enforced prior to the invocation
				// of the actual listener
				timeoutFunction = (timeoutDelay) ? function(event)
				{
					window.setTimeout(function()
					{
						paramsFunction(event);
					}, timeoutDelay || 0);
				} : paramsFunction,

				i;

			// In the event that a listener is being set up to check for the end of a transition, ensure that
			// two additional listeners are also set up to ensure cross-browser functionality
			if (type === 'transitionend')
			{
				// Set the logic to fire the listener upon the end of any transition made by that element
				for (i = transitions.length - 1; i >= 0; i -= 1)
				{
					element.addEventListener(transitions[i], timeoutFunction, false);
				}
			}
			else if (type === 'animationend')
			{
				// Set the logic to fire the listener upon the end of any animation made by that element
				for (i = animations.length - 1; i >= 0; i -= 1)
				{
					element.addEventListener(animations[i], timeoutFunction, false);
				}
			}
			else
			{
				element.addEventListener(type, timeoutFunction, false);
			}
		},

		/**
		  * Finds the absolute position of an element on a page
		  *
		  * @param {HTMLElement} el - the element to examine here
		  *
		  * @returns {Object} contains both the x and y coordinates that correspond directly to the passed element
		  *
		  * @author quirksmode.org
		  * @author kinsho
		  */
		findLocationOfElement: function(el)
		{
			var curleft = 0,
				curtop = 0,
				obj = el,
				transformMatrixObject = {},
				transformMatrix = '',
				transformMatrixValues = [],
				numberOfMatrixValues;

			// Find the target element's coordinates by tracing through the coordinates of all the ancestors of that element
			if (obj.offsetParent)
			{
				do
				{
					// If the object has been formally translated via CSS, deduce the extent of the translation
					// and factor that into the coordinate calculations. This has to be done manually.
					transformMatrixObject = window.getComputedStyle(obj);

					// Make sure to account for the fact that browsers may store the matrix values within different property labels
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

					obj = obj.offsetParent();
				}
				while (obj);
			}

			return { left : curleft, top : curtop };
		}
	};
});