(function ()
{

// ----------------- EXTERNAL MODULES --------------------------
	var crypto = require('crypto');

// ----------------- END --------------------------

	console.log('Test started');

	var cipher = crypto.createCipher('aes-256-cbc', 'Rickin Shah'),
		decipher = crypto.createDecipher('aes-256-cbc', 'Rickin Shah'),
		cipherText;

	cipherText = cipher.update('Rickin Shah', 'utf8', 'base64');

	cipherText += cipher.final('base64');
	console.log(cipherText);

	console.log('Now deciphering....');

	console.log(decipher.update(cipherText, 'base64', 'utf8'));
	console.log(decipher.final('utf8'));

	console.log('2D1AchdmfGgerQ3rgzYahA=='.length);
	console.log(cipherText.length);
	console.log('2DlAchdmfGgerQ3rgzYahA==' === cipherText);
}());