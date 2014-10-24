define(['models/foundation/modelHelper', '/shared/validation/validationHelper'], function(modelHelper, validationHelper)
{
// ----------------- ENUM/CONSTANTS -----------------------------

	var USERNAME_NOT_ALPHANUMERIC = 'Your username can only contain alphabetical characters and numbers. Nothing else.',
		USERNAME_TOO_LONG = 'Your username cannot be longer than 20 characters. Please shorten it.',

		PASSWORD_TOO_SHORT = 'Your password has to contain at least three characters. Please lengthen it.';

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
	modelHelper.defineProperty(my, 'password',
	[
		validationHelper.isAtLeast3Characters
	],
	[
		PASSWORD_TOO_SHORT
	]);

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