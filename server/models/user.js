define(['models/foundation/modelHelper', '/shared/validation/stringValidator', '/shared/validation/lengthValidator', '/shared/validation/typeValidator'],
	function(modelHelper, stringValidator, lengthValidator, typeValidator)
{
// ----------------- ENUM/CONSTANTS -----------------------------

	var STATE_CODES =
		{
			AL: 'Alabama',
			AK: 'Alaska',
			AZ: 'Arizona',
			AR: 'Arkansas',
			CA: 'California',
			CO: 'Colorado',
			CT: 'Connecticut',
			DE: 'Delaware',
			DC: 'District of Columbia',
			FL: 'Florida',
			GA: 'Georgia',
			HI: 'Hawaii',
			ID: 'Idaho',
			IL: 'Illinois',
			IN: 'Indiana',
			IA: 'Iowa',
			KS: 'Kansas',
			KY: 'Kentucky',
			LA: 'Louisiana',
			ME: 'Maine',
			MD: 'Maryland',
			MA: 'Massachusetts',
			MI: 'Michigan',
			MN: 'Minnesota',
			MS: 'Mississippi',
			MO: 'Missouri',
			MT: 'Montana',
			NE: 'Nebraska',
			NV: 'Nevada',
			NH: 'New Hampshire',
			NJ: 'New Jersey',
			NM: 'New Mexico',
			NY: 'New York',
			NC: 'North Carolina',
			ND: 'North Dakota',
			OH: 'Ohio',
			OK: 'Oklahoma',
			OR: 'Oregon',
			PA: 'Pennsylvania',
			RI: 'Rhode Island',
			SC: 'South Carolina',
			SD: 'South Dakota',
			TN: 'Tennessee',
			TX: 'Texas',
			UT: 'Utah',
			VT: 'Vermont',
			VA: 'Virginia',
			WA: 'Washington',
			WV: 'West Virginia',
			WI: 'Wisconsin',
			WY: 'Wyoming',
			AS: 'American Samoa',
			GU: 'Guam',
			PR: 'Puerto Rico',
			VI: 'U.S. Virgin Islands',
			Other: 'Other'
		},

		USERNAME_NOT_ALPHANUMERIC = 'Your username can only contain alphabetical characters and numbers. Nothing else.',
		USERNAME_TOO_LONG = 'Your username cannot be longer than 20 characters. Please shorten it.',
		USERNAME_EMPTY = 'You need to put in a user name.',

		PASSWORD_TOO_SHORT = 'Your password has to contain at least three characters. Please lengthen it.',
		PASSWORD_EMPTY = 'You need to put in a password.',

		FIRST_NAME_NOT_PROPER = 'We only accept first names to consist of letters and certain punctuation like periods ' +
			'and dashes. If your first name contains characters like exclamation points, please omit them for now.',

		LAST_NAME_NOT_PROPER = 'We only accept last names to consist of letters and certain punctuation like dashes ' +
			'and periods. If your last name contains unusual punctuation, please omit them.',

		AGE_EMPTY = 'You must indicate how old you are. We use this info for demographic purposes.',

		STATE_EMPTY = 'You must select the state where you currently live. We use this info for demographic purposes.';

// ----------------- PRIVATE VARIABLES/FUNCTIONS -----------------------------

	var isValidState = function(value)
		{
			value = value || '';

			return !!(STATE_CODES[value]);
		};

// ----------------- DATA MODEL -----------------------------

	var my =
		{
			errors: [],
			fields: ['username', 'password', 'firstName', 'lastName', 'birthday']
		};

	// Username
	modelHelper.defineProperty(my, 'username',
	[
		typeValidator.isNotEmpty,
		lengthValidator.isLessThan20Characters,
		stringValidator.isAlphaNumeric
	],
	[
		USERNAME_EMPTY,
		USERNAME_TOO_LONG,
		USERNAME_NOT_ALPHANUMERIC
	]);

	// Password
	modelHelper.defineProperty(my, 'password',
	[
		typeValidator.isNotEmpty,
		lengthValidator.isAtLeast3Characters
	],
	[
		PASSWORD_EMPTY,
		PASSWORD_TOO_SHORT
	]);

	// First Name
	modelHelper.defineProperty(my, 'firstName',
	[
		stringValidator.isAlphabeticalWithSpacesAndPunctuation
	],
	[
		FIRST_NAME_NOT_PROPER
	]);

	// Last Name
	modelHelper.defineProperty(my, 'lastName',
	[
		stringValidator.isAlphabeticalWithSpacesAndPunctuation
	],
	[
		LAST_NAME_NOT_PROPER
	]);

	// Age
	modelHelper.defineProperty(my, 'age',
	[
		typeValidator.isNotEmpty,
		typeValidator.isInteger
	],
	[
		AGE_EMPTY,
		modelHelper.WEIRD_ISSUE
	]);

	// State
	modelHelper.defineProperty(my, 'state',
	[
		typeValidator.isNotEmpty,
		isValidState
	],
	[
		STATE_EMPTY,
		modelHelper.WEIRD_ISSUE
	]);
// ----------------- END -----------------------------

	return my;
});