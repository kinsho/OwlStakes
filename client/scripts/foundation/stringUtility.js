/**
  * String library that provides utility functions that can be used to transform strings
  *
  * @author kinsho
  */
String.prototype.constantize = function()
{
	var uppercaseLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
		lowercaseLetters = 'abcdefghijklmnopqrstuvwxyz',
		numbers = '0123456789',
		isLetter = function(val)
		{
			return ( (uppercaseLetters.indexOf(val) >= 0) || (lowercaseLetters.indexOf(val) >= 0) );
		},
		isNumber = function(val)
		{
			return (numbers.indexOf(val) >= 0);
		},
		result = '',
		character = '',
		i;

	for (i = 0; i < this.length; i += 1)
	{
		character = this[i];

		if (isLetter(character))
		{
			if (uppercaseLetters.indexOf(character) < 0)
			{
				result += character.toUpperCase();
			}
			else
			{
				result += '_' + character;
			}
		}
		else
		{
			if ( i && isLetter(this[i - 1]) )
			{
				result += '_' + character;
			}
			else
			{
				result += character;
			}
		}
	}

	return result;
};