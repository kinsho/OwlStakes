define([], function()
{
// ----------------- ENUMS/CONSTANTS -----------------------------

	return function(cookieString)
	{

// ----------------- PRIVATE VARIABLES -----------------------------

		var self = this;

// ----------------- MODULE DEFINITION --------------------------

		self.cookies = {}; // The object responsible for holding all the cookie data

		/**
		 * Method responsible for returning all the cookies in a format that can be readily stored by the browser
		 *
		 * @returns {String} - a String expression containing all cookie data
		 *
		 * @author kinsho
		 */
		self.sendOverCookies = function()
		{
			/**
			 * Method responsible for converting any object into a cookie
			 *
			 * @param {Object} propSet - the object to convert
			 * @param {String} keyPrefix - a value to prepend to every property key injected into the cookie
			 *
			 * @returns {String} - a String expression representing a cookie containing all the data encapsulated
			 * 		within the passed object
			 *
			 * @author kinsho
			 */
			var transformationFunc = function(propSet, keyPrefix)
				{
					var transformedCookies = '',
						keys,
						prop,
						i;

					keys = Object.keys(self.cookies);

					for (i = keys.length - 1; i >= 0; i--)
					{
						prop = propSet[keys[i]];

						// If a property have already been defined within the cookie, separate the next property
						// to be added by using a '+' sign
						transformedCookies += (transformedCookies ? transformedCookies + '+' : transformedCookies);

						// If an object is discovered in a property, that object must be parsed via
						if (prop instanceof Object)
						{
							transformedCookies += transformationFunc(prop, keyPrefix ? keyPrefix + '.' + keys[i] : keys[i]);
						}
						else
						{
							transformedCookies += (keyPrefix ? keyPrefix + '.' + keys[i] + '=' + propSet[keys[i]] :
								keys[i] + '=' + propSet[keys[i]]);
						}
						transformedCookies += ';';
					}

					return transformedCookies;
				};

			return transformationFunc(self.cookies, '');
		};

		/**
		 * Function responsible for loading values into the cookies object from a cookie string sent by a client
		 * machine
		 *
		 * @param {String} cookieString - the client cookie to translate into an actionable object
		 *
		 * @author kinsho
		 */
		self.parseCookiesFromRequest = function(cookieString)
		{
			var properties = cookieString.split(';'),
				property,
				i,
			/**
			 * Sub-function responsible for either setting a new value or modifying an existing value within the cookies object
			 *
			 * @param {String} label - the path to use in deciding where to place the value in the cookies object
			 * @param {String} value - the new value to be set into the cookie
			 *
			 * @author kinsho
			 */
				populator = function(label, value)
				{
					var subLabels = label.split('.'),
						position,
						i;

					// Use the label as a guide to find out where to place the value within the cookies object
					position = self.cookies;
					for (i = 0; i < subLabels.length - 1; i++)
					{
						if ( !(position[subLabels[i]]) )
						{
							position[subLabels[i]] = {};
						}
						position = position[subLabels[i]];
					}

					// Associate the last part of the label with the value
					position[subLabels[i]] = value;
				};

			for (i = 0; i < properties.length; i++)
			{
				property = properties[i].split('=');
				populator(property[0], property[1]);
			}
		};


		/**
		 * Method responsible for blanking out any extant cookie data from the cookies object
		 *
		 * @author kinsho
		 */
		self.killCookies = function()
		{
			self.cookies = {};
		};

		// If a string containing cookies has been provided, feel free to populate the cookies object.
		if (cookieString)
		{
			self.parseCookiesFromRequest(cookieString, true);
		}
// ----------------- END --------------------------
	};
});