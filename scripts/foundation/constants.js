define([], function()
{
// ----------------- MODULE DEFINITION --------------------------
	var my =
	{
		styles:
		{
			BLOCK_DISPLAY: 'displayBlock',
			NO_DISPLAY: 'noDisplay',
			NO_VISIBILITY: 'hidden',
			POSITIVE_BACKGROUND_THEME: 'positiveBackgroundTheme',
			NEGATIVE_BACKGROUND_THEME: 'negativeBackgroundTheme',
			NEUTRAL_BACKGROUND_THEME: 'neutralBackgroundTheme',
			CENTER: 'center',
			DISABLED: 'disabled'
		},

		modal:
		{
			MODAL: 'modal',
			NESTED_MODAL: 'nestedModal'
		},

		tooltipMessages:
		{
			VERIFY_PASSWORDS_MATCH: 'Both values within the password fields must match!',
			CHECK_POINT_TOTALS: 'You allocated more than 100 points across all the games this week. ' +
				'You must take away some of the points that you wagered.'
		}
	};

// ----------------- END --------------------------
	return my;
});