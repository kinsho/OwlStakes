(function()
{

// ----------------- EXTERNAL MODULES --------------------------
	var _http_ = require('http'),
		_url_ = require('url'),
		_requireJS_ = require('requirejs'),
		routesCached = false;

// ----------------- REQUIRE JS CONFIGURATION --------------------------

	// Configure requireJS before launching the server or doing anything else
	_requireJS_.config(
	{
		baseUrl: 'server',
		nodeRequire: require
	});

// ----------------- GREETING LOGIC --------------------------

	// Define a server that will act as a gateway point for all incoming server requests
	_http_.createServer(function(request, response)
	{
		console.log('Connection made from URL: ' + request.url.trim());

		// From here on out, operate within the boundaries of requireJS
		_requireJS_(['config/configuration'], function(config)
		{
			// Make sure to flag the proper set of configuration properties to use here.
			config.setEnv(request.headers.host);

			_requireJS_(['Q', 'config/router', 'utility/cookieManager', 'utility/responseHandler'],
				function (Q, router, cookieManager, responseHandler)
			{
				Q.spawn(function* ()
				{
					try
					{

						var url = request.url.trim(),
							urlObj = _url_.parse(url, true),
							routeSigns = urlObj.pathname.split('/'),
							cookieParser = new cookieManager(),

							// If the URL indicates whether a style or image resource needs to be fetched, route to a controller
							// specifically designed to pull those type of resources
							isResourceWanted = router.isResourceWanted(url),
							action = ( isResourceWanted ? '' : routeSigns[2] ),

							// If a resource is being fetched, pass the URL to the resource controller as a parameter
							// Otherwise, extract the parameters from the URL
							params = (isResourceWanted ? url : urlObj.query),

							controller,
							responseData;


						// Translate the cookie into a form that can be readily accessed
						cookieParser.parseCookiesFromRequest(request.headers.cookie);

						// Ensure that the routes are cached before looking up the server route to the correct controller
						if (!(routesCached))
						{
							yield router.populateRoutes();
							routesCached = true;
						}
						controller = ( isResourceWanted ? router.findResourceController() : router.findController(routeSigns[1]));

						// Ready the parameters. If looking up a resource, set the URL as the parameter after stripping out any
						// leading slash that may be there
						url = (url.indexOf('/') === 0 || url.IndexOf("\\") === 0 ? url.substring(1, url.length) : url);
						params = (isResourceWanted ? url : urlObj.query);

						_requireJS_([controller], function (controller)
						{
							Q.spawn(function* ()
							{
								// Find the correct action method indicated within the URL, then pass that action method
								// all the relevant parameters needed to properly service the request by itself
								responseData = yield controller[ router.findAction(routeSigns[1], action) ](response, params, cookieParser);

								// Send the response back
								responseHandler.sendSuccessResponse(response, responseData, url, cookieParser);
							});
						});

					}
					catch (exception)
					{
						if (exception.is404Exception)
						{
							responseHandler.sendErrorResponse(response, exception.errors, url, cookieParser);
						}
						else if (exception.isCookieException)
						{
							responseHandler.sendBadCookieResponse(response, exception.errors, url);
						}
						else
						{
							responseHandler.sendInternalServerErrorResponse(response, url, cookieParser);
						}
					}
				});
			});
		});

	}).listen(3000);

// ----------------- END --------------------------

	console.log('Server started!');
	console.log('Listening on port 3000...');
}());