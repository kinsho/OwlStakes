window.utilityFunctions =
{
	/**
	  * Function serves to throttle the number of times a handler function executes at once regardless
	  * of how often it is invoked.
	  *
	  * NOTE: All handler functions will need to make use of jQuery deferred in order to tell this
	  * 	  debouncer function when the handler finishes execution
	  *
	  * @param handlerFunction - the function to be throttled
	  * @param throttlerFrequency - the max number of times the function can execute at once
	  * @return a function wrapper which will control access to the debounced function
	  *
	  * @author kinsho
	  */
	debouncer: function(handlerFunction, throttlerFrequency)
	{
		var $deferred = $.Deferred(),
			totalNumberOfTickets = 0,
			ticketToService = 1, // Will be used to service requests according to the order in which they arrived
			debouncedFunction = function(event, ticketNumber)
			{
				var argsArray,
					i;

				// Determines the order of this request in the queue of requests
				ticketNumber = ticketNumber || ++totalNumberOfTickets;

				if ( (throttlerFrequency) && (ticketNumber == ticketToService) )
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
					argsArray = [];

					// Invoke this same function again in a tenth of a second to check to
					// see if it is allowed to invoke the handler function then
					window.setTimeout(debouncedFunction, 100, event, ticketNumber);
				}
			};

		return debouncedFunction;
	},

	/**
	  * Function returns a clone of the passed object
	  *
	  * @param obj - the object to be cloned
	  * @return an obj that is only comprised of all the unique key/value pairs
	  *			within the passed object
	  *
	  * @author kinsho
	  */
	cloneObject: function(obj)
	{
		var clone = {},
			prop;

		for (prop in obj)
		{
			clone[prop] = obj[prop];
		}

		return clone;
	},

	/**
	  * Function serves to set the passed transition listener on the passed element
	  * 
	  * @param {HTMLElement} element - the element with which to set the transition listener upon
	  * @param {Function} listenerFunction - the listener function that needs to be attached to the element
	  * @param {Number} timeoutDelay - in case a timeout delay is specified, then the listener will be triggered as a timeout function
	  *							that will be invoked only after the specified delay
	  *
	  * @author kinsho
	  */
	setTransitionListeners: function(element, listenerFunction, timeoutDelay)
	{
		var transitions = ['transitionend', 'otransitionend', 'webkitTransitionEnd'],
			i;

		for (i = transitions.length - 1; i >= 0; i -= 1)
		{
			if (timeoutDelay)
			{
				element.addEventListener(transitions[i], function(event)
				{
					window.setTimeout(function()
					{
						listenerFunction(event);
					}, timeoutDelay);
				}, false);
			}
			else
			{
				element.addEventListener(transitions[i], listenerFunction, false);
			}
		}
	},

	/**
	  * Function serves to remove the passed transition listener from the passed element
	  * 
	  * @param element - the element from which the transition listener needs to be removed
	  * @param listenerFunction - the listener function that needs to be removed from the element
	  *
	  * @author kinsho
	  */
	removeTransitionListeners: function(element, listenerFunction)
	{
		var transitions = ['transitionend', 'otransitionend', 'webkitTransitionEnd'],
			i;

		for (i = transitions.length - 1; i >= 0; i -= 1)
		{
			element.removeEventListener(transitions[i], listenerFunction, false);
		}	
	},

	/**
	 * Finds the absolute position of an element on a page
	 *
	 * @param el - the element in question
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
			}
			while (obj = obj.offsetParent);
		}

		return { left : curleft, top : curtop };
	}
};