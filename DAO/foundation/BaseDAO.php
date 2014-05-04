<?php

REQUIRE_ONCE '/../../utility/server/applicationConf/ConfigurationParser.php';

REQUIRE_ONCE '/../../mailers/foundation/ErrorMailer.php';

/**
  * Class that will form the foundation for every specialized DAO class
  *
  * @author kinsho
  */
class BaseDAO
{
	const STRING_PARAM = 's';
	const INTEGER_PARAM = 'i';
	const DOUBLE_PARAM = 'd';

	const DATABASE_ERROR_MESSAGE = "We're sorry, but we had an issue connecting to our database. The administrator
									has been notified of this, and may reach out to you sooner or later depending on the
									nature of the situation here. Once again, we apologize for this. Please try again or
									wait patiently.";

	// -------- CLASS MEMBERS -------------
	protected static $server;
	protected static $user;
	protected static $password;
	protected static $database;
	protected static $port;
	protected static $connection;
	protected static $stmts = array(); // An array of SQL statements that can be executed with dynamic parameters
	protected static $queryResults;
	protected static $transactionFlag = false; // A flag to keep this module aware of whether it is currently processing queries within a transaction

	// --------- CONSTRUCTOR --------------

	public function __construct ()
	{
		// Pull the configuration data that will be used to initiate connections to the database
		ConfigurationParser::initiateConfigurationsArray();

		self::$server = ConfigurationParser::getSetting('databaseHost');
		self::$port = ConfigurationParser::getSetting('databasePort');
		self::$database = ConfigurationParser::getSetting('databaseName');
		self::$user = ConfigurationParser::getSetting('databaseUser');
		self::$password = ConfigurationParser::getSetting('databasePassword');
	}

	// ------- ACCESSOR FUNCTIONS ---------

	public function getDatabaseUser() { return self::$user; }

	public function getDatabasePassword() { return self::$password; }

	public function getDatabaseServer() { return self::$server; }

	private function getDatabase() { return self::$database; }

	public function getQueryResults() { return self::$queryResults; }

	// ------- FUNCTIONS -----------

	/**
	  * Will open a connection using the username, password, and server name already stored within the object.
	  * 
	  * @author kinsho
	  */
	public function openConnection($server = null, $port = null, $user = null, $password = null, $database = null)
	{
		if ( !(isset(self::$connection)) )
		{
			if ($server)
			{
				self::$server = $server;
			}
			if ($port)
			{
				self::$port = $port;
			}
			if ($user)
			{
				self::$user = $user;
			}
			if ($password)
			{
				self::$password = $password;
			}
			if ($database)
			{
				self::$database = $database;
			}

			try
			{
				self::$connection = new mysqli(self::$server, self::$user, self::$password, self::$database, self::$port);
			}
			catch (Exception $e)
			{
				$this->returnUserFriendlyError($e, 'Fatal exception when opening connection to '.self::$server);
			}
		}
	}

	/**
	  * Will close the open connection associated with this object.
	  * 
	  * @author kinsho
	  */
	public function closeConnection()
	{
		try
		{
			self::$connection->close();
		}
		catch (Exception $e)
		{
			$this->returnUserFriendlyError($e, 'Fatal exception when closing connection to '.self::$server);
		}
	}

	/**
	  * Will link to a database provided that a connection is already open.
	  * 
	  * @param (optional) $db - the name of the database which the server will eventually link to
	  * @throws Exception
	  * @author kinsho
	  */			
	public function openDatabase($db = null)
	{
		$isNewDatabase = (isset($db) && $db !== self::$database);

		if ($db)
		{
			self::$database = $db;
		}
		
		try
		{
			if ($isNewDatabase)
			{
				self::$connection->select_db(self::$database);
			}
		}
		catch (Exception $e)
		{
			$this->returnUserFriendlyError($e, 'Fatal exception when trying to connect to the following database('.self::$database.')');
		}
	}

	/**
	  * Will handle all the preparation necessary to initiate database-side transactions
	  *
	  * @author kinsho
	  */
	public function initiateTransaction()
	{
		// Roll back any active transactions
		self::$connection->rollback();
		
		// Tell MySQL to stop autocommitting queries upon execution
		self::$autocommit(false);

		// Now keep track of the fact that we're currently in the midst of executing a transaction
		self::$transactionFlag = true;
	}

	/**
	  * Provided that a transaction is currently open, this function will commit all the queries
	  * that were executed in the scope of the transaction right before it closes the
	  * the transaction.
	  *
	  * @author kinsho
	  */
	public function commitAndCloseTransaction()
	{
		if (self::$transactionFlag)
		{
			try
			{
				// Commit all the transaction-scope queries
				$success = self::$connection->commit();
				
				if ( !($success) )
				{
					throw new Exception('Failed to commit transaction');
				}

				// Revert the storage engine back into autocommit mode
				self::$autocommit(true);

				// Tell the DAO that no transaction is currently open
				self::$transactionFlag = false;
			}
			catch (Exception $e)
			{
				$this->returnUserFriendlyError($e, 'Fatal exception when trying to commit a transaction');
			}
		}
	}

	/**
	  * Will generate a prepared SQL statement that will be readily used to access the database
	  * The SQL statement is generated using the query passed into the function
	  *
	  * @param $key - the key to use in order to identify the prepared statement for later retrieval
	  * @param $query - the query which will be sent to the DBMS to be prepared
	  * @param $numOfParameters - in special cases, the prepared statement has to be dynamically tailored
	  *        		depending on the number of parameters that needs to be passed into the query
	  *
	  * @author kinsho
	  */	
	public function prepareStatement($key, $query, $numOfParameters = 1)
	{
		// Prepare the statement only if a statement has not already been prepared under the passed key
		if ( !(isset(self::$stmts[$key])) )
		{
			/*
			 * With due limitations, the query can be modified provided certain markers exist to allow for
			 * for its modification. The number of arguments may alter depending on circumstances
			 */
			if (strpos($query, '%IN%') > 0)
			{
				$paramsString = '?';
				while(--$numOfParameters > 0)
				{
					$paramsString .= ', ?';
				}

				$query = str_replace('%IN%', $paramsString, $query);
			}
			try
			{
				$stmt = self::$connection->prepare($query);
				self::$stmts[$key] = $stmt;

				if ( !($stmt) )
				{
					throw new Exception(self::$connection->error);
				}
			}
			catch (Exception $e)
			{
				$this->returnUserFriendlyError($e, 'Fatal exception when preparing the following query (' . $query . ')');
			}
		}
	}

	/**	
	  * Will populate fields within any prepared statement stored in this object.
	  * Will subsequently execute the query and store the results of the query.
	  *
	  * @param $key - the key associated with the prepared statement that needs to be executed
	  * @param $params - the parameters with which to populate the prepared statement to be executed
	  *
	  * @author kinsho
	  */
	public function loadAndExecutePreparedQuery($key, $params = array())
	{
		$types = '';
		$stmt = self::$stmts[$key];

		try
		{
			// Figure out the type of each parameter and build a string that contains all the types for all the parameters listed
			foreach ($params as $value)
			{
				$types .= constant('SELF::'.(strtoupper(gettype($value))).'_PARAM');
			}

			if ( !(empty($params)) )
			{
				// Need to create a reference to the types string as the call_user_func_array function
				// only accepts references to parameter values
				array_splice($params, 0, 0, $types);

				// Bind parameters to the prepared statements
				call_user_func_array(array($stmt, 'bind_param'), $this->generateReferenceArray($params));
			}

			// If prior result sets have been stored, ensure that the memory allocated to them is freed before executing the query
			if ( isset(self::$queryResults) && is_object(self::$queryResults) )
			{
				self::$queryResults->free_result();
			}

			// Execute statement
			$success = $stmt->execute();

			// If the query was not successful, throw an exception
			if ( !($success) )
			{
				// If the query was part of a transaction, roll back the entire transaction before doing any further error processing
				if (self::$transactionFlag)
				{
					self::$connection->rollback();
				}

				throw new Exception($stmt->error);
			}

			// Store the returned data and close the statement
			self::$queryResults = $stmt->get_result();
		}
		catch (Exception $e)
		{
// 			die(var_dump($e->getMessage()));
			$this->returnUserFriendlyError($e, 'Fatal exception when executing the query associated with ' . $key . 'with the following paramters ---> ' . var_export($params, true));
		}
	}

	/**	
	  * Pass along the currently stored result set without any processing
	  *
	  * @return - an indexed array containing all the records within the currently stored result set
	  *
	  * @author kinsho
	  */
	public function fetchResults()
	{
		return self::$queryResults->fetch_all(MYSQLI_ASSOC);
	}

	/**	
	  * Retrieve up to all the fields stored within the current record being referenced
	  *
	  * @param $fields - an array of fields indicating which data to return from the record
	  * @return - an array of data from the current referenced record. If the $fields parameter 
	  *			  is empty, return all data within the record
	  *
	  * @author kinsho
	  */
	public function fetchNextRecord($fields = array())
	{
		$record = self::$queryResults->fetch_assoc();
		$resultArray = array();

		if (empty($fields))
		{
			return $record;
		}

		if ($record)
		{
			foreach($record as $key => $value)
			{
				if (in_array($key, $fields))
				{
					$resultArray[$key] = $value;
				}
			}
		}

		return $resultArray;
	}

	/*
	 * In special cases where one AND ONLY ONE value is needed from the result set returned from the
	 * database, this function returns the value itself without encapsulating it within an array
	 *
	 * @param $fieldName - the name of the field that stores the value that needs to be fetched
	 * @returns the value of that field
	 *
	 * @author kinsho
	 */
	public function fetchSingleValue($fieldName)
	{
		return $this->fetchNextRecord(array($fieldName))[$fieldName];
	}

	/**	
	  * Test to see if the most recently executed query returned any records to the server
	  *
	  * @return - a boolean indicating whether any records were returned by the most recent query
	  *
	  * @author kinsho
	  */
	public function areThereResults()
	{
		return ( (self::$queryResults) && (self::$queryResults->num_rows) );
	}

	/**	
	  * Will generate an array that contains references to the values within the passed array
	  *
	  * NOTE: This function is meant to be used in conjunction with call_user_func_array, as
	  *		  call_user_func_array only accepts references within its parameters array
	  *
	  * @param $arr - the array that needs to have its values referenced
	  * @return - an array containing references to the values in the passed array
	  *
	  * @author kinsho
	  */
	protected function generateReferenceArray($arr)
	{
		$refArray = array();

		foreach ($arr as $index => $value)
		{
			$refArray[$index] = &$arr[$index];
		}

		return $refArray;
	}

	/**	
	  * Will convert any SQL-friendly datetime string to a more user-readable format
	  *
	  * @param $dateTime - the datetime string that needs to be converted
	  * @return - a string that expresses the passed date string in a more friendly format
	  *
	  * @author kinsho
	  */
	protected function convertDateTime($dateTime, $format = 'M d (l)-h:i A')
	{
		$dateTimeObject = new DateTime($dateTime, new DateTimeZone('EST'));
		return $dateTimeObject->format($format);
	}

	/**
	  * In the event that database access failed for whatever reason, the user needs to be
	  * alerted in vague fashion that an error has occurred within the back-end. The actual
	  * details/nature of the error itself will be sent separately within an e-mail to the
	  * administrator himself.
	  *
	  * @param {Exception} $ex - the actual exception that was thrown
	  * @param {String} [$header] - a message to headline the body of the e-mail
	  *
	  * @author kinsho
	  */
	protected function returnUserFriendlyError($ex, $header = '')
	{
		// Send word to the user that something went wrong
		http_response_code(400);
		echo json_encode(array("errors" => array(self::DATABASE_ERROR_MESSAGE)));

		// Send word to the admin about the nature of the error
		$mailer = new ErrorMailer();
		$mailer->sendErrorMail($ex, $header);

		// Cease all further processing
		exit();
	}
}
?>