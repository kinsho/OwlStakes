define([], function()
{
	var value = 0,
		throwError = function()
		{
			try
			{
				throw('Threw first error');
			}
			catch(error)
			{
				console.error(error + '\\n');
				throw('Thrown to parent as well...');
			}
		};

	return {
		getValue: function()
		{
			try
			{
				throwError();
				value += 4;
				return value;
			}
			catch(error)
			{
				console.error(error + '\\n');
				throw('Thrown to the top as well...');
			}
		}
	};
});