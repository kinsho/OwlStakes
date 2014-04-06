<?php

REQUIRE_ONCE 'foundation/BaseDAO.php';

REQUIRE 'PicksDAO.php';

/**
  * Specialized DAO class for suicide picks page
  *
  * @author kinsho
  */
class SuicidePicksDAO extends PicksDAO
{
	// -------- CLASS MEMBERS -------------

	const CREATE_UPDATE_PICK_KEY = 'savePicks';
	const CREATE_UPDATE_PICK = 'INSERT INTO suicidePicks VALUES(?, ?, ?, ?, null, null) ON DUPLICATE KEY UPDATE teamPicked = ?;';
	const FETCH_PICK_KEY = 'fetchPicks';
	const FETCH_PICK = 'SELECT teamPicked FROM suicidePicks WHERE suicidePoolId = ? AND userId = ? AND week = ?';
	const DOES_TEAM_EXIST_KEY = 'doesTeamExist';
	const DOES_TEAM_EXIST = 'SELECT * FROM teams WHERE id = ?';
	const IS_USER_ALIVE_KEY = 'isUserAlive';
	const IS_USER_ALIVE = 'SELECT participants, participantStatues FROM suicidePools WHERE id = ?';
	const FETCH_PICKS_FOR_WEEK_KEY = 'fetchPicksForWeek';
	const FETCH_PICKS_FOR_WEEK = 'SELECT teamPicked FROM suicidePicks WHERE suicidePoolId = ? AND week = ?';

	// --------- CONSTRUCTOR --------------

	public function __construct()
	{
		parent::__construct();

		$this->openConnection();
		$this->openDatabase();		

		return $this;
	}

	// ------- FUNCTIONS -----------

	/**
	  * Will save the pick that a user has made into the database. If a record already exists
	  * for the current week, the record will be updated with the new pick. Otherwise, a new record
	  * will be created.
	  *
	  * @param $pickModel - a model containing all the information about the pick to be saved
	  *
	  * @author kinsho
	  */
	public function savePick($pickModel)
	{
		// If the server has not deduced the current week, do so and fetch it
		if ( !(parent::$currentWeek) )
		{
			$this->deduceCurrentWeek();
		}

		// Prepare the SQL query that will be used to either update a suicide pick record or create a new one
		$this->prepareStatement(self::CREATE_UPDATE_PICK_KEY, self::CREATE_UPDATE_PICK);

		// Fetch the ID of the user from the session. It will be used in the query made here
		$userID = $_SESSION['userSession']['id'];
		// Fetch the game ID and the suicide pool ID from the pick model, for we'll need it for the query
		$teamID = $pickModel->getTeamId();
		$suicidePoolID = $pickModel->getSuicidePoolId();
	
	// Now execute the query
		$this->loadAndExecutePreparedQuery(self::CREATE_UPDATE_PICK_KEY, array($userID, $teamID, parent::$currentWeek, $teamID));
	}

	/**
	  * Will fetch all the wagers that a user has made for any given week
	  *
	  * @param $week - the week from which to fetch the suicide pick that the user has made
	  * @returns - the ID of the team that the user has picked for the passed week
	  *
	  * @author kinsho
	  */
	public function fetchPick($week)
	{
		if ( !(parent::$currentWeek) && !($week) )
		{
			$this->deduceCurrentWeek();
		}
		$week = $week ? $week : parent::$currentWeek;

		// Fetch the ID of the user from the session. It will be used in the query here
		$userID = $_SESSION['userSession']['id'];

		// Prepare the SQL query that will be used to fetch a suicide pick
		$this->prepareStatement(self::FETCH_PICK_KEY, self::FETCH_PICK);

		// Now execute the query
		$this->loadAndExecutePreparedQuery(self::FETCH_PICK_KEY, array($userID, $week));

		// Parse the results and return the team ID
		$teamID = $this->fetchSingleValue('teamPicked');

		return $teamID;
	}

	/**
	  *	Validation function used to indicate whether the first game of the week has already started
	  *
	  * @returns - a boolean indicating whether one of the games within the week has already kicked off
	  *
	  * @author kinsho
	  */
	public function checkIfWeekStarted()
	{
		if ( !(self::$currentWeek) && !($week) )
		{
			$this->deduceCurrentWeek();
		}

		// Prepare the SQL query that will be used to fetch all the current week's games that have already begun
		$this->prepareStatement(parent::FETCH_CURRENT_GAMES_KICKED_OFF_KEY, parent::FETCH_CURRENT_GAMES_KICKED_OFF);

		// Execute the query
		$this->loadAndExecutePreparedQuery(parent::FETCH_CURRENT_GAMES_KICKED_OFF_KEY, array(parent::$currentWeek));

		// Extract all the game IDs for the current week
		$games = $this->fetchResults();

		// If at least one game has already begun within the current week, the week has started
		return (count($games) > 0);
	}

	/**
	  *	Validation function used to indicate whether the passed ID corresponds to an actual team within the database
	  *
	  * @param $teamID - the ID whose legitimacy will be tested
	  * @returns - a boolean indicating whether the passed team ID does point to a legit team in the database
	  *
	  * @author kinsho
	  */
	public function checkIfTeamExists($teamID)
	{
		// Prepare the SQL query that will be used to determine whether the passed ID is a legit ID
		$this->prepareStatement(self::DOES_TEAM_EXIST_KEY, self::DOES_TEAM_EXIST);

		// Execute the query
		$this->loadAndExecutePreparedQuery(self::DOES_TEAM_EXIST_KEY, array($teamID));

		// If the database returns any data, then a record exists within the database corresponding to the passed ID
		return $this->areThereResults();
	}

	/**
	  * Determines whether the user is still alive within the suicide pool indicated by the passed ID
	  *
	  * @param $suicidePoolID - the ID of the suicide pool in which the user's status will be checked
	  * @returns - a boolean indicating whether the user is still alive within the suicide pool
	  *
	  * @author kinsho
	  */
	public function checkIfUserIsStillAlive($suicidePoolID)
	{
		// Fetch the ID of the user from the session.
		$userID = $_SESSION['userSession']['id'];

		// Prepare the SQL query that will be used to determine the user's status within any suicide pool
		$this->prepareStatement(self::IS_USER_ALIVE_KEY, self::IS_USER_ALIVE);

		// Execute the query
		$this->loadAndExecutePreparedQuery(self::IS_USER_ALIVE_KEY, array($suicidePoolID));

		// Fetch and parse the result record
		$record = $this->fetchNextRecord();
		$participants = explode(',', $record['participants'];
		$participantStatuses = explode(',', $record['participantStatuses'];

		// Use the record to find the status
		$userStatus = $participantsStatuses[array_search($userID, $participants)];

		return ($userStatus > 0);
	}
}
?>