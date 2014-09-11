(function ()
{

// ----------------- EXTERNAL MODULES --------------------------
	var Q = require('Q'),
		fs = require('fs');

// ----------------- END --------------------------

	console.log('Test started');

	var fsReadFile = Q.denodeify(fs.readFile);
		firstFunc = Q.async(function* ()
		{
			try
			{
				console.log('Trying to read file...');
				var fileData = yield fsReadFile('/Users/ushahri/OwlStakes/client/views/foundation/base.handlebars');
				console.log('File read!');
				return fileData;
			}
			catch(e)
			{
				console.log('FILE ERROR');
				console.error(e);
			}
		}),
		secondFunc = Q.async(function* ()
		{
			try
			{
				var files = [];
				console.log('Trying to read second file...');
				files.push(yield fsReadFile('.bowerrc', 'utf-8'));
				console.log('File read!');
				console.log('Trying to read third file...');
				files.push(yield fsReadFile('.jshintignore', 'utf-8'));
				console.log('File read!');
				return files;
			}
			catch(e)
			{
				console.log('FILE ERROR');
				console.error(e);
			}
		}),
		thirdFunc = Q.async(function* ()
		{
			try
			{
				return yield fsReadFile('package.json');
			}
			catch(e)
			{
				console.error(e);
			}
		});

	Q.spawn(function* ()
	{
		var data = yield firstFunc();
		console.log('Result: ' + data.length + ' characters read from app.js');
		console.log('Result: ' + data);
		var files = yield secondFunc();
		console.log('Second result: ' + files.length + ' files read');
		files.push(yield thirdFunc());
		console.log('Third result: ' + files[2]);
	});
}());