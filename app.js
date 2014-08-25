(function()
{
	'use strict';

// ----------------- EXTERNAL MODULES --------------------------
	var _http_ = require('http'),
		_url_ = require('url'),
		_requireJS_ = require('requirejs'),
		_socketIO_ = require('socket.io')(_http_);

// ----------------- ENUM/CONSTANTS --------------------------
	var HOME_CONTROLLER = 'home',
		INIT_ACTION = 'init';

	// Configure requireJS before launching the server or doing anything else
	_requireJS_.config(
	{
		baseUrl: 'server',
		nodeRequire: require
	});

	// Define a server that will act as a gateway point for all incoming server requests
	_http_.createServer(function(request, response)
	{
		// From here on out, operate within the boundaries of requireJS
		_requireJS_(['config/configuration', 'config/router'], function(config, router)
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

			// Make sure to flag the proper set of configuration properties to use here
			config.setEnv(request.url.trim());
/*
			_requireJS_([router.findRoute(controllerName)], function(controller)
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