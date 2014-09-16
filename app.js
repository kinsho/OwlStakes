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
		console.log('Connection made!');

		// From here on out, operate within the boundaries of requireJS
		_requireJS_(['Q', 'config/configuration', 'config/router'], function (Q, config, router)
		{
			Q.spawn(function* ()
			{
				var urlObj = _url_.parse(request.url.trim(), true),
					routeSigns = urlObj.pathname.split('/'),

					// If the URL indicates whether a style or image resource needs to be fetched, route to a controller
					// specifically designed to pull those type of resources
					isResourceWanted = router.isResourceWanted(request.url.trim()),
					controller = ( isResourceWanted ? router.findResourceController() : router.findController(routeSigns[1]) ),
					action = ( isResourceWanted ? '' : routeSigns[2] ),

					responseData;

				// Make sure to flag the proper set of configuration properties to use here.
				config.setEnv(request.headers.host);

				// Ensure that the routes are cached before looking up the server route to the controller
				if (!(routesCached))
				{
					yield router.populateRoutes();
					routesCached = true;
				}

				_requireJS_([controller], function (controller)
				{
					Q.spawn(function* ()
					{
						// By mandate of architecture, all action methods must be generator functions
						// Really, it's difficult to even envision a circumstance where yielding function execution
						// is not even necessary
						responseData = yield controller[ router.findAction(routeSigns[1], action) ]();

						response.writeHead(200,
						{
							"Content-Length" : responseData.length,
							"Content-Type" : "text/html"
						});

						response.end(responseData);
					});
				});

			});
		});
	}).listen(3000);

// ----------------- END --------------------------

	console.log('Server started!');
	console.log('Listening on port 3000...');
}());