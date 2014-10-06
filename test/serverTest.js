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
		requireJS(['crypto'], function(crpyto)
		{
			var encoder = crpyto.createCipher('sha1', 'Rickin Shah');

			console.log(request.headers.cookie);
			response.writeHead(200,
			{
				'Set-Cookie' : 'test=5'
			});
			response.end(encoder.update('Rickin Shah', 'hex'));
		});

	}).listen(3000);

}());