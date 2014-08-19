(function()
{
	'use strict';

// ----------------- EXTERNAL MODULES --------------------------
	var _http_ = require('http'),
		_url_ = require('url'),
		__requireJS__ = require('requirejs');

// ----------------- ENUM/CONSTANTS --------------------------
	var HOME_CONTROLLER = 'home',
		INIT_ACTION = 'init';

	// Configure requireJS before launching the server or doing anything else
	__requireJS__.config(
	{
		baseUrl: 'server',
		nodeRequire: require
	});

	// Define a server that will act as a gateway point for all incoming server requests
	_http_.createServer(function(request, response)
	{
		// From here on out, operate within the boundaries of requireJS
		__requireJS__(['config/router'], function(router)
		{
			var urlObj = _url_.parse(request.url.trim(), true),
				routeSigns = urlObj.pathname.split('/'),
				controllerName = HOME_CONTROLLER, // default controller
				actionName = INIT_ACTION,
				params = urlObj.query;

			// If a path has not been defined, the server will route the request to the home page, by default
			// If a path has been defined however, the server will route the request to the controller indicated within the URL
			if (urlObj.pathname !== '/')
			{
				controllerName = routeSigns[1];
				actionName = routeSigns[2] || INIT_ACTION;
			}

/*
			__requireJS__([router.findRoute(controllerName)], function(controller)
			{
				controller[actionName](params);
			});
*/
			response.writeHead(200);
			response.end((router.findRoute(controllerName)));
		});
	}).listen(3000);

	console.log('Server started!');
}());