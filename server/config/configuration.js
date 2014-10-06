/**
 * @module configuration
 */

define([], function()
{
// ----------------- MODULE DEFINITION --------------------------
	var my =
	{
		// Configuration value used to mark the environment in which the platform is serving requests
		// Value will be set when a request is received and the 'setEnv' function defined below is called
		active: '',

		local:
		{
			// Server configuration
			SERVER_URL: 'http://localhost:3000',

			// Database configuration
			DATABASE_HOST: 'localhost',
			DATABASE_PORT: 3306,
			DATABASE_NAME: 'owlStakes',
			DATABASE_USER: 'root',
			DATABASE_PASSWORD: 'root',

			// E-mail Server Configuration
			EMAIL_HOST: 'smtp.gmail.com',
			EMAIL_PORT: 465,
			EMAIL_CONNECTION_TYPE: 'ssl',
			EMAIL_USER: 'kinsho',
			EMAIL_PASSWORD: 'whnbubpubnmhnpne',

			// Administrator Information
			ADMINISTRATOR_EMAIL_ADDRESS: 'kinsho@gmail.com',

			// Encryption Information
			hash:
			{
				HASH_ALGORITHM: 'aes-256-cbc',
				HASH_KEY: '2DlAchdmfGgerQ3rgzYahA==',
				HASH_INPUT_ENCODING: 'utf8',
				HASH_OUTPUT_ENCODING: 'base64'
			}
		},

		qa:
		{
			// Server configuration
			SERVER_URL: '',

			// Encryption Information
			hash:
			{
				HASH_ALGORITHM: 'aes-256-cbc',
				HASH_KEY: '2DlAchdmfGgerQ3rgzYahA==',
				HASH_INPUT_ENCODING: 'utf8',
				HASH_OUTPUT_ENCODING: 'base64'
			}
		},

		prod:
		{
			// Server configuration
			SERVER_URL: 'http://www.owlstakes.com',

			// Encryption Information
			hash:
			{
				HASH_ALGORITHM: 'aes-256-cbc',
				HASH_KEY: '2DlAchdmfGgerQ3rgzYahA==',
				HASH_INPUT_ENCODING: 'utf8',
				HASH_OUTPUT_ENCODING: 'base64'
			}
		},

		/**
		 * Function responsible for deducing the environment in which the server is handling requests
		 * Environment will be deduced using the server URL that's provided from the HTTP request
		 *
		 * @param {String} url - the URL that needs to be analyzed
		 *
		 * @author kinsho
		 */
		setEnv: function(url)
		{
			var keys = Object.keys(my),
				i;

			// Iterate through hard-coded server URLs under each configuration set to determine the environment
			// in play here
			for (i = keys.length - 1; i >= 0; i -= 1)
			{
				// Only interested in the configuration objects here
				if (typeof my[keys[i]] === 'object')
				{
					if (my[keys[i]].SERVER_URL.indexOf( url ) >= 0)
					{
						my.active = keys[i];
						break;
					}
				}
			}
		},

		/**
		 * Function responsible for fetching the parameters necessary to generate hashes for any data
		 *
		 * @returns {Object} - an object containing all the information needed to generate a hash using Node's
		 * 		built-in Crypto module
		 *
		 * @author kinsho
		 */
		fetchHashInfo: function()
		{
			return my[my.active].hash;
		}
	};

// ----------------- END --------------------------
	return my;
});