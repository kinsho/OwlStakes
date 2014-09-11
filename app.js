(function()
{

// ----------------- EXTERNAL MODULES --------------------------
	var _http_ = require('http'),
		_url_ = require('url'),
		_requireJS_ = require('requirejs'),
		routeCached = false;

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
		_requireJS_(['Q', 'config/configuration', 'config/router', 'utility/renderEngine'], function (Q, config, router, renderEngine)
		{
			Q.spawn(function* ()
			{
				var urlObj = _url_.parse(request.url.trim(), true),
					routeSigns = urlObj.pathname.split('/'),
					responseData,
					controllerName,
					actionName;

				// If a path has not been defined, the server will route the request to the home page, by default
				// If a path has been defined however, the server will route the request to the controller indicated within the URL
				if (urlObj.pathname !== '/')
				{
					controllerName = routeSigns[1];
					actionName = routeSigns[2];
				}

				// Make sure to flag the proper set of configuration properties to use here.
				config.setEnv(request.headers.host);

				// Ensure that the routes are cached before looking up the server route to the controller
				if (!(routeCached))
				{
					router.populateRoutes();
					routeCached = true;
				}
				/*
				 _requireJS_([router.findRoute(controllerName)], function(controller)
				 {
				 controller[actionName](params);
				 });
				 */

				responseData = yield renderEngine.renderView();

				response.writeHead(200);
				response.end(responseData);
			});
		});
	}).listen(3000);

// ----------------- END --------------------------

	console.log('Server started!');
	console.log('Listening on port 3000...');
}());