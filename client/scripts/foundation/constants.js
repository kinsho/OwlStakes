/**
 * @module constants
 */

define([], function()
{
// ----------------- MODULE DEFINITION --------------------------
	return {
		styles:
		{
			BLOCK_DISPLAY: 'displayBlock',
			NO_DISPLAY: 'noDisplay',
			NO_VISIBILITY: 'hidden',
			POSITIVE_BACKGROUND_THEME: 'positiveBackgroundTheme',
			NEGATIVE_BACKGROUND_THEME: 'negativeBackgroundTheme',
			NEUTRAL_BACKGROUND_THEME: 'neutralBackgroundTheme',
			SHIFT_TRANSITION_LEFT: 'shiftTransitionLeft',
			SHIFT_TRANSITION_SLIGHT_LEFT: 'shiftTransitionSlightLeft',
			SHIFT_TRANSITION_RIGHT: 'shiftTransitionRight',
			SHIFT_TRANSITION_SLIGHT_RIGHT: 'shiftTransitionSlightRight',
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
});