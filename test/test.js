(function ()
{

// ----------------- EXTERNAL MODULES --------------------------
	var requireJS = require('requirejs');

// ----------------- END --------------------------

	console.log('Test started');

	requireJS.config(
	{
		baseUrl: '../server',
		nodeRequire: require
	});

	requireJS(['config/configuration'], function(config)
	{
		config.active = "local";

		requireJS(['utility/cookieManager'], function(CM)
		{
			var session = new CM(''),
				translation;

/*
			session.cookies =
			{
				user:
				{
					name: 'kinsho',
					age: 27,
					residency:
					{
						city: 'North Plainfield',
						state: 'NJ'
					}
				}
			};
*/

			translation = session.sendOverCookies();
			session.killCookies();

			console.log(translation);
			console.log('BEFORE');
			console.log(session.cookies);

			session.parseCookiesFromRequest(translation);

			console.log('AFTER');
			console.log(session.cookies);
		});
	});

}());