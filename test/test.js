(function ()
{

// ----------------- EXTERNAL MODULES --------------------------
	var http = require('http'),
		requireJS = require('requirejs');

// ----------------- END --------------------------

	console.log('Test started');

	requireJS.config(
	{
		baseUrl: '',
		nodeRequire: require
	});

	http.createServer(function(request, response)
	{
		requireJS(['requireTest'], function(test)
		{
			try
			{
				response.writeHead(200);
				response.end(test.getValue());
			}
			catch(error)
			{
				response.writeHead(404);
				console.error(error + '\\n');
				console.error('Oh well');
				response.end('Whoopsie');
			}
		});

	}).listen(3000);

}());