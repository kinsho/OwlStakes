<?php

TOS_REQUIRE_ONCE('DAO/foundation/BaseDAO.php');

/**
  * Specialized DAO class for suicide pools page
  *
  * @author kinsho
  */
class SuicidePoolsDAO extends BaseDAO
{
	// -------- CLASS MEMBERS -------------

	const USER_POOL_LIMIT = 11; // The maximum number of suicide pools in which the user may take part for any given year

	const CREATE_POOL_KEY = 'createPool';
	const CREATE_POOL = 'INSERT INTO suicidePools VALUES(NULL, ?, NULL, NULL);';
	const CREATE_POOL_USER_RECORD_KEY = 'createPoolUserRecord';
	const CREATE_POOL_USER_RECORD = 'INSERT INTO suicidePoolUsers VALUES(?, ?, ?, ?, TRUE, TRUE, TRUE, NULL, NULL) ON DUPLICATE KEY UPDATE userStatus = ?';
	const UPDATE_POOL_USER_STATUS_KEY = 'updatePoolUserStatus';
	const UPDATE_POOL_USER_STATUS = 'UPDATE suicidePoolUsers SET userStatus = ? WHERE poolId = ? AND userId = ?';
	const UPDATE_POOL_MANAGEMENT_KEY = 'updatePoolManagement';
	const UPDATE_POOL_MANAGEMENT = 'UPDATE suicidePoolUsers SET isManaged = ? WHERE poolId = ? AND userId = ?';
	const UPDATE_USER_POOL_SETTINGS_KEY = 'updateUserPoolSettings';
	const UPDATE_USER_POOL_SETTINGS = 'UPDATE suicidePoolUsers SET letManagerMakePicks = ? AND sendEmailsAboutMajorChanges = ? AND sendWeeklyReminderEmails = ? WHERE poolId = ? AND userId';
	const FETCH_POOL_NAME_KEY = 'fetchPoolName';
	const FETCH_POOL_NAME = 'SELECT poolName FROM suicidePool WHERE id = ?';
	const FETCH_POOL_ID_KEY = 'fetchPoolID';
	const FETCH_POOL_ID = 'SELECT id FROM suicidePools WHERE poolName = ?';
	const FETCH_POOLS_BY_USER_KEY = 'fetchPoolsByUser';
	const FETCH_POOLS_BY_USER = 'SELECT * FROM suicidePoolUsers WHERE userId = ?';
	const FETCH_POOLS_WITH_NAMES_BY_USER_KEY = 'fetchPoolsWithNamesByUser';
	const FETCH_POOLS_WITH_NAMES_BY_USER = 'SELECT U.*, P.poolName FROM suicidePoolUsers U, suicidePools P WHERE U.userId = ? AND U.poolId = P.id';
	const DOES_USER_MANAGE_POOL_KEY = 'doesUserManagePool';
	const DOES_USER_MANAGE_POOL = 'SELECT * FROM suicidePoolUsers WHERE poolId = ? AND userId = ? AND isManager = TRUE';

	// --------- CONSTRUCTOR --------------

	public function __construct()
	{
		parent::__construct();

		$this->openConnection();
		$this->openDatabase();

		return $this;
	}

// -------------------   ACTION FUNCTIONS --------------------------

	/**
	  * Will add a new suicide pool into the database
	  *
	  * @param {NewSuicidePoolModel} $poolModel - a model containing all the information about the pool to be added
	  *
	  * @author kinsho
	  */
	public function addPool($poolModel)
	{
		// Prepare the SQL queries that will be used to record the new pool into the database
		// as well as record information about the user relative to the pool
		$this->prepareStatement(self::CREATE_POOL_KEY, self::CREATE_POOL);
		$this->prepareStatement(self::FETCH_POOL_ID_KEY, self::FETCH_POOL_ID);
		$this->prepareStatement(self::CREATE_POOL_USER_RECORD_KEY, self::CREATE_POOL_USER_RECORD);

		// Fetch the ID of the user from the session. It will be used in the queries made here
		$userID = $poolModel->getUserID();

		// Fetch the name of the pool as well from the pool model
		$poolName = $poolModel->getName();

		// Now execute the query to store the new pool into the database
		$this->loadAndExecutePreparedQuery(self::CREATE_POOL_KEY, array($poolName));

		// Fetch the ID of the new pool from the database
		$this->loadAndExecutePreparedQuery(self::FETCH_POOL_ID_KEY, array($poolName));
		$poolID = $this->fetchSingleValue('id');

		// Now execute the query to create the user record for the manager of the new pool
		$this->loadAndExecutePreparedQuery(self::CREATE_POOL_USER_RECORD_KEY, array($poolID, $userID, 'participant', intval(true), 'participant'));
	}

	/**
	  * Complicated function that will fetch all the suicide pools that a user belongs to
	  * and segregate the pools into different lists based on the user's status within each pool
	  *
	  * @param {String} $userID - the ID of the user whose involvement in suicide pools will be determined here
	  *					Keep in mind that if no ID is specified, the user in context will be assumed
	  *					as the user in focus here
	  * @returns {Array} - contains a set of four arrays that together comprise all the pools that a user is considered
	  *						actively in. Each sub-array is identified by exactly one of the specific pool statuses listed below:
	  *						- managed
	  *						- participant
	  *						- dead
	  *						- invited
	  *
	  * @author kinsho
	  */
	public function fetchPools($userID = '')
	{
		// Fetch the ID of the user from the session
		if ( !($userID) )
		{
			$userID = $_SESSION['userSession']['id'];
		}

		// Prepare the SQL query that will be used to fetch all of the pools that a user belongs to
		// along with the names of each of those pools
		$this->prepareStatement(self::FETCH_POOLS_WITH_NAMES_BY_USER_KEY, self::FETCH_POOLS_WITH_NAMES_BY_USER);

		// Execute the query
		$this->loadAndExecutePreparedQuery(self::FETCH_POOLS_WITH_NAMES_BY_USER_KEY, array($userID));

		// Fetch the result set
		$pools = $this->fetchResults('suicidePools');

		// Now before returning information about the pools, segregate the pools depending on
		// the user's status.
		$results = array();
		$results['invited'] = array();
		$results['managed'] = array();
		$results['participant'] = array();
		$results['dead'] = array();

		foreach ($pools as $pool)
		{
			$userStatus = $pool['userStatus'];

			if ($pool['isManager'])
			{
				$results['managed'][] = $pool;
			}
			else if ($userStatus !== 'rejected')
			{
				$results[$userStatus][] = $pool;
			}
		}

		return $results;
	}

	/**
	  * Function is responsible for saving all suicide pool invitations into the database
	  *
	  * @param $poolID - the ID of the pool which the user will be invited into
	  * @param $userID - the ID of the user to add to the pool
	  *
	  * @author kinsho
	  */
	public function inviteUser($poolID, $userID)
	{
		// Prepare the SQL query to create or update a record for the user for the specified pool
		$this->prepareStatement(self::CREATE_POOL_USER_RECORD_KEY, self::CREATE_POOL_USER_RECORD);

		// Now execute the query
		$this->loadAndExecutePreparedQuery(self::CREATE_POOL_USER_RECORD_KEY, array($poolID, $userID, 'invited', false, 'invited'));		
	}

	/**
	  * Function is responsible for changing a user's status to acknowledge that the user is now a
	  * participant within the specified pool
	  *
	  * @param $poolID - the ID of the pool into which the user will be now acknowledged as a participant
	  * @param $userID - the ID of the user
	  *
	  * @author kinsho
	  */
	public function markUserAsParticipant($poolID, $userID)
	{
		// Prepare the SQL query to update the user's status relative to the specified pool
		$this->prepareStatement(self::UPDATE_POOL_USER_STATUS_KEY, self::UPDATE_POOL_USER_STATUS);

		// Now execute the query
		$this->loadAndExecutePreparedQuery(self::UPDATE_POOL_USER_STATUS_KEY, array('participant', $poolID, $userID));
	}

	/**
	  * Function is responsible for changing a user's status to acknowledge that the user is now dead within the specified pool
	  *
	  * @param $poolID - the ID of the pool into which the user will be marked as a dead participant 
	  * @param $userID - the ID of the user
	  *
	  * @author kinsho
	  */
	public function markUserAsDead($poolID, $userID)
	{
		// Prepare the SQL query to update the user's status relative to the specified pool
		$this->prepareStatement(self::UPDATE_POOL_USER_STATUS_KEY, self::UPDATE_POOL_USER_STATUS);

		// Now execute the query
		$this->loadAndExecutePreparedQuery(self::UPDATE_POOL_USER_STATUS_KEY, array('dead', $poolID, $userID));
	}

	/**
	  * Function is responsible for transferring ownership of a pool from one user to another
	  *
	  * @param $poolID - the ID of the pool that will undergo a change in management 
	  * @param $newManager - the ID of the new manager
	  *
	  * @author kinsho
	  */
	public function changePoolManagement($poolID, $newManager)
	{
		// Prepare the SQL query that will change pool ownership
		$this->prepareStatement(self::UPDATE_POOL_MANAGEMENT_KEY, self::UPDATE_POOL_MANAGEMENT);

		// Fetch the ID of the soon-to-be ex-manager, which is properly assumed to be the user in context here
		$currentManager = $_SESSION['userSession']['id'];

		// Now execute the query twice, once to relieve the current manager of his duty and one to acknowledge the new manager of the pool
		$this->loadAndExecutePreparedQuery(self::UPDATE_POOL_MANAGEMENT_KEY, array(true, $poolID, $newManager));
		$this->loadAndExecutePreparedQuery(self::UPDATE_POOL_MANAGEMENT_KEY, array(false, $poolID, $currentManager));
	}

	/**
	  * Function is responsible for saving changes to the user-specific settings that a user
	  * has personally set for the specified pool.
	  *
	  * @param $poolID - the ID of the pool where the user's settings will be adjusted
	  * @param settings - an associative array of settings that need to be saved over the old settings stored within the database
	  *
	  * @author kinsho
	  */
	public function changeUserPoolSettings($poolID, $settings)
	{
		// Prepare the SQL query that will save the new settings
		$this->prepareStatement(self::UPDATE_USER_POOL_SETTINGS_KEY, self::UPDATE_USER_POOL_SETTINGS);		

		// Fetch the user ID that will be necessary to execute the query
		$userID = $_SESSION['userSession']['id'];

		// Now execute the query
		$this->loadAndExecutePreparedQuery( self::UPDATE_USER_POOL_SETTINGS_KEY, array($settings['letManagerMakePicks'], $settings['sendEmailsAboutMajorChanges'], $settings['sendWeeklyReminderEmails'], $poolID, $userID) );
	}

// -------------------   VALIDATION/INFORMATIONAL FUNCTIONS --------------------------

	/**
	  * Function returns a keyword indicating the status of the user within the suicide pool
	  * specified by the $poolID parameter
	  *
	  * @param $poolID - the ID of the pool within which to check the indicated user's status
	  * @param $username - the name of the user whose status will be checked within the specified pool
	  * @returns - a keyword to represent the user's status within the specified suicide pool
	  *			ONE OF THE FOLLOWING KEYWORDS WILL BE RETURNED WHEN THIS FUNCTION IS INVOKED
	  *			'uninvolved' - the user is not a part of this pool
	  *			'participant' - the user is a participant within the pool
	  *			'invited' - the user has been invited to the pool, but has yet to accept
	  *			'dead' - the user died within the pool
	  *			'rejected' - the user was invited into the pool, but he rejected the invitation
	  *
	  * @author kinsho
	  */
	public function checkUserStatusWithinPool($poolID, $userID)
	{
		// Fetch all the pools that a user belongs to
		$poolGroups = $this->fetchPools($userID);

		foreach ($poolGroups as $poolGroup)
		{
			foreach ($poolGroup as $pool)
			{
				if ($pool['poolId'] === $poolID)
				{
					return $pool['userStatus'];
				}
			}
		}

		return 'uninvolved';
	}

	/** 
	  * Will check to see if another suicide pool exists with the passed name
	  *
	  * @param {String} $poolName - the name to test here
	  *
	  * @returns {Boolean} indicates whether no other suicide pool has the name referenced by $poolName
	  */
	public function checkPoolName($poolName)
	{
		// Prepare the SQL query that will be used to check the name
		$this->prepareStatement(self::FETCH_POOL_ID_KEY, self::FETCH_POOL_ID);

		// Now execute the query
		$this->loadAndExecutePreparedQuery(self::FETCH_POOL_ID_KEY, array($poolName));

		// Return a boolean depending on whether the database returned any results
		return ( !($this->areThereResults()) );
	}

	/**
	  * Determines whether a suicide pool exists corresponding to the passed ID
	  *
	  * @param $poolID - the ID whose validity will be checked here
	  * @returns - a boolean indicating whether the pool exists
	  *
	  * @author kinsho
	  */
	public function doesPoolExist($poolID)
	{
		// Prepare the SQL query that will be used to check the veracity of the ID
		$this->prepareStatement(self::FETCH_POOL_NAME_KEY, self::FETCH_POOL_NAME);

		// Now execute the query
		$this->loadAndExecutePreparedQuery(self::FETCH_POOL_NAME_KEY, array($poolID));

		// Return a boolean depending on whether the database returned any results
		return ( !($this->areThereResults()) );	
	}

	/**
	  * Determines whether the user is allowed to manage the pool specified by the passed ID
	  *
	  * @param $poolID - the ID of the pool whose ownership will be examined
	  * @param $userID - the ID of the user whose ownership of the passed pool will be examined
	  *					Keep in mind that if no ID is specified, the user in context will be assumed
	  *					as the user in focus here
	  * @returns - a boolean indicating whether user is allowed to manage said pool
	  *
	  * @author kinsho
	  */
    public function doesUserManagePool($poolID, $userID = '')
	{
		// Prepare the SQL query that will be used to determine whether the user manages a pool
		$this->prepareStatement(self::DOES_USER_MANAGE_POOL_KEY, self::DOES_USER_MANAGE_POOL);

		// Fetch the user ID
		if ( !($userID) )
		{
			$userID = $_SESSION['userSesson']['id'];
		}

		// Now execute the query
		$this->loadAndExecutePreparedQuery(self::DOES_USER_MANAGE_POOL_KEY, array($poolID, $userID));

		// Return a boolean if any results were returned
		return ($this->areThereResults());
	}

	/**
	  * Determines whether the user is allowed to take part in a pool in any capacity
	  *	The criteria to determine eligibility within a pool is simply limited to whether the user has
	  * not signed up for too many other pools in the current year
	  *
	  * @param {String} $userID - the ID of the user whose history will be examined to determine eligibility
	  *
	  * @returns {Boolean} Indicates whether user is allowed to take part within a pool
	  *
	  * @author kinsho
	  */
	public function checkUserPoolLimit($userID)
	{
		// Prepare the SQL query that will be used to fetch all of the pools that a user belongs to
		$this->prepareStatement(self::FETCH_POOLS_BY_USER_KEY, self::FETCH_POOLS_BY_USER);

		// Execute the query
		$this->loadAndExecutePreparedQuery(self::FETCH_POOLS_BY_USER_KEY, array($userID));

		// Fetch the result set
		$pools = $this->fetchResults('suicidePools');

		// Determine whether the user is allowed to take part in more pools
		return (count($pools) <= self::USER_POOL_LIMIT);
	}

}
?>