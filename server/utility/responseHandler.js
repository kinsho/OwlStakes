define(['config/router'], function(router)
{

// ----------------- ENUM/CONSTANTS --------------------------

	var INTERNAL_SERVER_ERROR_MESSAGE = "Something's up with our server here. We apologize for any inconvenience here," +
		"but rest assured, the administrator has been notified and somebody will address this issue soon. Until" +
		"then, please come back to this site later. Once again, we apologize for having to do this.";

// ----------------- MODULE DEFINITION --------------------------

	var my =
	{
		/**
		 * Function responsible for relaying a successful HTTP response back to the client
		 *
		 * @param {HTTPResponse} response - the HTTP response object
		 * @param {String} responseData - the actual payload to send back to the client
		 * @param {String} url - the URL used to initiate the request to the server
		 * @param {cookieManager} cookies - a container specifically generated for the cookies to send
		 * 		back to the client
		 *
		 * @author kinsho
		 */
		sendSuccessResponse: function(response, responseData, url, cookies)
		{
			// Write out the important headers before launching the response back to the client
			response.writeHead(200,
			{
				"Content-Type" : router.deduceContentType(url),
				"Set-Cookie" : cookies.sendOverCookies()
			});

			console.log('Response ready to be returned from URL: ' + url);

			// Send a response back and close out this service call once and for all
			response.end(responseData);
		},

		/**
		 * Function responsible for relaying back to the client an HTTP response indicating that
		 * a user error has occurred that has to be addressed
		 *
		 * @param {HTTPResponse} response - the HTTP response object
		 * @param {String} errors - the bundle of error messages to send back to the client
		 * @param {String} url - the URL used to initiate the request to the server
		 * @param {cookieManager} cookies - a container specifically generated for the cookies to send
		 * 		back to the client
		 *
		 * @author kinsho
		 */
		sendErrorResponse: function(response, errors, url, cookies)
		{
			response.writeHead(404,
			{
				"Set-Cookie" : cookies.sendOverCookies()
			});

			// Write out the important headers before launching the response back to the client
			console.log('Errors were generated when trying to service the following URL: ' + url);

			// Send a response back and close out this service call once and for all
			response.end(JSON.stringify(errors));
		},

		/**
		 * Function responsible for relaying back to the client an HTTP response indicating that
		 * the server has run into some sort of issue that makes it impossible to properly service
		 * the HTTP request.
		 *
		 * @param {HTTPResponse} response - the HTTP response object
		 * @param {String} url - the URL used to initiate the request to the server
		 * @param {cookieManager} cookies - a container specifically generated for the cookies to send
		 * 		back to the client
		 *
		 * @author kinsho
		 */
		sendInternalServerErrorResponse: function(response, url, cookies)
		{
			response.writeHead(500,
			{
				"Set-Cookie" : cookies.sendOverCookies()
			});

			// Write out the important headers before launching the response back to the client
			console.log('Errors were generated when trying to service the following URL: ' + url);

			// Send an e-mail to the admin to notify him that something went horribly wrong here...
			// @TODO write logic to send e-mails

			// Send a response back and close out this service call once and for all
			response.end(JSON.stringify(
			{
				error: INTERNAL_SERVER_ERROR_MESSAGE
			}));
		}
	};

// ----------------- END --------------------------
	return my;
});