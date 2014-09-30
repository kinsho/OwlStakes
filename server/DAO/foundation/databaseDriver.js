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
		execute, // The transformed version of the method that will be used to execute a single query against the database
		batch, // The transformed version of the method that will be used to execute multiple queries at once
		queryBunch = [];

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
		batch = Q.denodeify(client.batch);
	};

// ----------------- MODULE DEFINITION --------------------------
	var my =
	{
		/**
		 * Bellcow function responsible for executing a single query against the Cassandra database
		 * Note that all data returned from executed queries are stored inside the module
		 *
		 * @param {String} query - the query to execute, with question marks in place of values that can be
		 * 		dynamically populated
		 * @param {Array} params - the parameters to insert into the query
		 *
		 * @returns {ResultSet} - the set of records which satisfy the query
		 *
		 * @author kinsho
		 */
		execute: Q.async(function* (query, params)
		{
			try
			{
				return yield execute(query, params, QUERY_OPTIONS);
			}
			catch(error)
			{
				console.error('ERROR ---> databaseDriver.execute');
				throw(error);
			}
		}),

		/**
		 * Function responsible for executing a single query and applying a filter to the results as data
		 * is streaming into the server from the database
		 *
		 * @param {String} query - the query to execute, with question marks in place of values that can be
		 * 		dynamically populated
		 * @param {Array} params - the parameters to insert into the query
		 * @param {Function} filter - the filter function that will be used to massage each row of data being
		 *		returned from the database
		 *
		 * @returns {ResultSet} - the set of processed records which satisfy the query
		 *
		 * @author kinsho
		 */
		executeWithFilter: Q.async(function* (query, params, filter)
		{
			var filteredRow,
				results = [];

			try
			{
				results = [];
				yield execute(query, params, QUERY_OPTIONS, function(n, row)
				{
					filteredRow = filter(n, row);
					// The filtered row can be neglected if the filtering function returns a false boolean
					if (filteredRow !== false)
					{
						results.push(filter(n, row));
					}
				});

				return results;
			}
			catch(error)
			{
				console.error('ERROR ---> databaseDriver.execute');
				throw(error);
			}
		}),

		/**
		 * Function responsible for executing multiple queries against the Cassandra database at once
		 * Note that these queries should not return any data
		 *
		 * @returns {ResultSet} - the set of records which satisfy the query
		 *
		 * @author kinsho
		 */
		batch: Q.async(function* ()
		{
			try
			{
				return yield batch(queryBunch, QUERY_OPTIONS);
			}
			catch(error)
			{
				console.error('ERROR ---> databaseDriver.batch');
				throw(error);
			}
		}),

		/**
		 * Function responsible for loading a new query into a set of queries that will be executed all at once
		 *
		 * @param {String} query - the query to store, with question marks in place of values that can be
		 * 		dynamically populated
		 * @param {Array} [params] - the parameters to insert into that query
		 *
		 * @author kinsho
		 */
		loadQuery: function(query, params)
		{
			queryBunch.push(query, params || []);
		}
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