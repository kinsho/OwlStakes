(function()
{
	'use strict';

	var _http_ = require('http'),
		_url_ = require('url');

	// Define a server that will act as a gateway point for all incoming server requests
	_http_.createServer(function(request, response)
	{
		console.log('Initiated request to server!');
		console.log(_url_.parse(request.url, true));

		response.writeHead(200);
		response.end('Yo Earth');

	}).listen(3000);

	console.log('Server started');
}());