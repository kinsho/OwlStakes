(function ()
{

// ----------------- EXTERNAL MODULES --------------------------
	var http = require('http'),
		requireJS = require('requirejs'),
		Q = require('Q');

// ----------------- END --------------------------

	console.log('Test started');

	requireJS.config(
	{
		baseUrl: '../server',
		nodeRequire: require
	});

	http.createServer(function(request, response)
	{
		requireJS(['utility/cookieManager'], function(CM)
		{
			Q.spawn(function* ()
			{
				try
				{
					var session = new CM('');

					session.cookies =
					{
						user:
						{
							name: 'kinsho',
							age: 27
						}
					};

					console.log(session.sendOverCookies());
					response.writeHead(200);
					response.end('hello');
				}
				catch(error)
				{
					throw(error);
				}
			});
		});

	}).listen(3000);

}());