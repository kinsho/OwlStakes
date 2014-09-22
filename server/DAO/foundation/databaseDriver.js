define(['Q', 'cassandra-driver'], function(Q, cassie)
{
// ----------------- ENUMS/CONSTANTS --------------------------

	var CONTACT_POINT_NAMES = 'OwlStakes',

		QUERY_OPTIONS =
		{
			prepare: true,
			consistency: cassie.types.consistencies.quorum,
			fetchSize: 5000
		};

// ----------------- PRIVATE VARIABLES --------------------------

	var client, // The client that will be used to conduct queries against the database
		execute; // The transformed version of the method that will be used to connect to the database

// ----------------- I/O FUNCTION TRANSFORMATIONS --------------------------

	/**
	 * Function is needed here considering that the database driver functions cannot be transformed into generator-
	 * friendly functions until the client is fully defined and instantiated
	 *
	 * @author kinsho
	 */
	var transformDriverFunctions = function()
	{
		execute = Q.denodeify(client.execute);
	};

// ----------------- MODULE DEFINITION --------------------------
	var my =
	{

	};

// ----------------- INITIALIZATION LOGIC --------------------------

	// Initialize the Cassandra client
	client = new cassie.Client(
	{
		contactPoints: [CONTACT_POINT_NAMES]
	});

	transformDriverFunctions();

// ----------------- END --------------------------
	return my;
});