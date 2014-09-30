define([], function()
{

// ----------------- PRIVATE VARIABLES -----------------------------

	var cookies = {};

// ----------------- MODULE DEFINITION --------------------------
	var my =
	{
		getCookies: function ()
		{
			return JSON.stringify(cookies);
		}
	};

// ----------------- END --------------------------
	return my;
});