define(['models/foundation/modelHelper', '/shared/validation/validationHelper'], function(modelHelper, validationHelper)
{
// ----------------- ENUM/CONSTANTS -----------------------------

	var USERNAME_NOT_ALPHANUMERIC = 'Your username can only contain alphabetical characters and numbers. Nothing else.',
		USERNAME_TOO_LONG = 'Your username cannot be longer than 20 characters. Please shorten it.';

// ----------------- PRIVATE VARIABLES -----------------------------

// ----------------- DATA MODEL -----------------------------

	var my =
	{
		errors: [],
		fields: ['username', 'password', 'firstName', 'lastName', 'birthday']
	};

	// Username
	modelHelper.defineProperty(my, 'username',
	[
		validationHelper.isLessThan20Characters,
		validationHelper.isAlphaNumeric
	],
	[
		USERNAME_TOO_LONG,
		USERNAME_NOT_ALPHANUMERIC
	]);

	// Password
	modelHelper.defineProperty(my, 'password', null, function(value)
	{
		this.password = value;
	});

	// First Name
	modelHelper.defineProperty(my, 'firstName', null, function(value)
	{
		this.firstName = value;
	});

	// Last Name
	modelHelper.defineProperty(my, 'lastName', null, function(value)
	{
		this.lastName = value;
	});

	// Birthday
	modelHelper.defineProperty(my, 'birthday', null, function(value)
	{
		this.birthday = value;
	});

// ----------------- END -----------------------------

	return my;
});