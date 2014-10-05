(function ()
{

// ----------------- EXTERNAL MODULES --------------------------
	var http = require('http'),
		requireJS = require('requirejs');

// ----------------- END --------------------------

	console.log('Test started');

	requireJS.config(
	{
		baseUrl: '..',
		nodeRequire: require
	});

	http.createServer(function(request, response)
	{
		requireJS([], function()
		{
			console.log(request.headers.cookie);
			response.writeHead(200,
			{
				'Set-Cookie' : 'test=5'
			});
			response.end('Check now');
		});

	}).listen(3000);

}());