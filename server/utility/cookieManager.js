define(['crypto', 'config/configuration', 'utility/exception'], function(crypto, config, exception)
{
// ----------------- ENUM/CONSTANTS -----------------------------

	var COOKIE_LABEL = 'TOS';

// ----------------- PRIVATE VARIABLES -----------------------------

	var hash = config.fetchHashInfo();

// ----------------- MODULE DEFINITION --------------------------

	return function(cookieString)
	{
		var self = this;

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
			var rawData,
				encrypter = crypto.createCipher(hash.HASH_ALGORITHM, hash.HASH_KEY),
				encryptedData,

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
				transformationFunc = function(propSet, keyPrefix)
				{
					var transformedCookies = '',
						keys,
						prop,
						i;

					keys = Object.keys(propSet);


					for (i = keys.length - 1; i >= 0; i--)
					{
						prop = propSet[keys[i]];

						// If an object is discovered in a property, that object must be parsed via
						if (prop instanceof Object)
						{
							transformedCookies += transformationFunc(prop, keyPrefix ? keyPrefix + '.' + keys[i] : keys[i]);
						}
						else
						{
							transformedCookies += (keyPrefix ? keyPrefix + '.' + keys[i] + '=' + propSet[keys[i]] :
								keys[i] + '=' + propSet[keys[i]]);

							transformedCookies += ';';
						}
					}

					return transformedCookies;
				};

			// Put the raw data together
			rawData = transformationFunc(self.cookies, '');

			// Ensure that the raw data is encrypted before sending it over the wire to the client
			encryptedData = encrypter.update(rawData, hash.HASH_INPUT_ENCODING, hash.HASH_OUTPUT_ENCODING);
			return COOKIE_LABEL + '=' + (encryptedData + encrypter.final(hash.HASH_OUTPUT_ENCODING));
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
			var strippedCookieString = '',
				decrypter = crypto.createDecipher(hash.HASH_ALGORITHM, hash.HASH_KEY),
				cookies,
				decryptedCookie,
				properties,
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

			try
			{

				// First, if it exists, separate the cookie from other third-party cookies
				cookies = (cookieString) ? cookieString.split(';') : [];

				for (i = cookies.length - 1; i >= 0; i--)
				{
					strippedCookieString = (cookies[i].indexOf(COOKIE_LABEL + '=') >= 0) ? cookies[i].trim() : '';
					break;
				}

				// Strip out the label before parsing any meaningful data
				strippedCookieString = strippedCookieString.replace(COOKIE_LABEL + '=', '');

				// Then decrypt the data first before any further processing
				if (strippedCookieString)
				{
					decryptedCookie = decrypter.update(strippedCookieString, hash.HASH_OUTPUT_ENCODING, hash.HASH_INPUT_ENCODING);
					decryptedCookie += decrypter.final(hash.HASH_INPUT_ENCODING);

					// Now translate all the properties listed in the cookie into an actionable object
					properties = decryptedCookie.split(';');
					for (i = 0; i < properties.length; i++)
					{
						// Ensure that the logic is only working with non-empty strings
						if (properties[i].trim())
						{
							property = properties[i].split('=');
							populator(property[0], property[1]);
						}
					}
				}
			}
			catch(error)
			{
				throw new exception.cookiesException(error);
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