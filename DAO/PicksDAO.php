<?php

REQUIRE 'foundation/BaseDAO.php';

/**
  * Specialized DAO class for registration page
  *
  * @author kinsho
  */
class PicksDAO extends BaseDAO
{
	// -------- CLASS MEMBERS -------------

	const FETCH_TEAM_NAMES_KEY = 'fetchTeamNames';
	const FETCH_TEAM_NAMES = 'SELECT id, market, name FROM teams';
	const FETCH_CURRENT_GAMES_KEY = 'fetchCurrentGames';
	const FETCH_CURRENT_GAMES = 'SELECT * FROM games WHERE week = ? AND spread IS NOT NULL ORDER BY kickoffTime';
	const FETCH_CURRENT_GAMES_KICKED_OFF_KEY = 'fetchCurrentGameKickedOff';
	const FETCH_CURRENT_GAMES_KICKED_OFF = 'SELECT id FROM games WHERE week = ? AND spread IS NOT NULL AND kickoffTime > NOW()';
	const FETCH_CURRENT_NO_UPSET_GAME_KEY = 'fetchCurrentNoUpsetGame';
	const FETCH_CURRENT_NO_UPSET_GAME = 'SELECT * FROM games WHERE week = ? AND spread IS NULL';
	const FETCH_CLOSEST_WEEK_KEY = 'fetchClosestWeek';
	const FETCH_CLOSEST_WEEK = 'SELECT week FROM weeks WHERE closeDate > NOW() ORDER BY closeDate LIMIT 1';
	const FETCH_KICKOFF_TIME_KEY = 'fetchKickoffTimes';
	const FETCH_KICKOFF_TIME = 'SELECT kickoffTime FROM games WHERE id = ?';
	const CREATE_UPDATE_WAGER_KEY = 'savePicks';
	const CREATE_UPDATE_WAGER = 'INSERT INTO wagers VALUES(?, ?, ?, ?, null, null) ON DUPLICATE KEY UPDATE wager = ?;';
	const FETCH_WAGERS_KEY = 'fetchPicks';
	const FETCH_WAGERS = 'SELECT gameId, wager FROM wagers WHERE userId = ? AND week = ?';

	protected static $currentWeek; // Indicates the current week of the NFL regular season schedule
	protected static $teamNames = array(); // All the team names and their corresponding IDs, stored within the array as keys

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
	  * Will fetch a list that contains all the games for the passed week
	  *
	  * @param $week - the week from which to fetch all the regular season games
	  * @return a list containing all the games for the passed week
	  *
	  * @author kinsho
	  */
	public function fetchGames($week)
	{
		if ( !(self::$currentWeek) && !($week) )
		{
			$this->deduceCurrentWeek();
		}
		if ( empty(self::$teamNames) )
		{
			$this->retrieveTeamNames();
		}

		$week = $week ? $week : self::$currentWeek;

		// Prepare all the SQL queries that will be used in this function
		$this->prepareStatement(self::FETCH_CURRENT_GAMES_KEY, self::FETCH_CURRENT_GAMES);
		$this->prepareStatement(self::FETCH_CURRENT_NO_UPSET_GAME_KEY, self::FETCH_CURRENT_NO_UPSET_GAME);

		$this->loadAndExecutePreparedQuery(self::FETCH_CURRENT_GAMES_KEY, array($week));
		$games = $this->fetchResults();

		// Fetch the record corresponding to the 'no upset' wager for the current week
		// Push that record into the end of the results array that was fetched from the last database inquiry
		$this->loadAndExecutePreparedQuery(self::FETCH_CURRENT_NO_UPSET_GAME_KEY, array($week));
		array_push($games, $this->fetchResults()[0]);

		// Convert certain data within the dataset to user-friendly values, but do retain the kickoff time 
		// format as it was supplied from the database
		foreach ($games as $index => $game)
		{
			$games[$index]['systemKickoffTime'] = $game['kickoffTime'];
		}

		// Convert some of the game-specific data into more human-readable formats
		$games = $this->convertIDsToTeamNames($games, array('homeTeam', 'awayTeam', 'underdog') );
		$games = $this->convertKickoffTimes($games, array('kickoffTime') );

		return $games;
	}

	/**
	  * Will fetch the kickoff date/time for the regular season game corresponding to the passed ID in order
	  * to validate that the kickoff time has not already passed.
	  *
	  * @param $gameID - the game ID for which to fetch/validate the corresponding kickoff date/time
	  * @returns a boolean indicating whether the kickoff time for the passed game has already passed
	  *
	  * @author kinsho
	  */
	public function validateKickoffTime($gameID)
	{
		$kickoffTime = $this->fetchKickoffTime($gameID);

		// Now determine whether the kickoff time has already passed
		$currentTime = new DateTime('now', new DateTimeZone('EST'));
		$kickoffTime = new DateTime($kickoffTime, new DateTimeZone('EST'));
		return $kickoffTime > $currentTime;
	}

	/**
	  * Will determine whether the games within the current week can still be wagered upon
	  *
	  * @returns - a boolean indicating whether games within the current week are still eligible
	  *
	  * @author kinsho
	  */
	public function checkWhetherWeekIsLocked()
	{
		if ( !(self::$currentWeek) && !($week) )
		{
			$this->deduceCurrentWeek();
		}

		// Prepare the SQL query that will be used to fetch all the current week's games that have already begun
		$this->prepareStatement(self::FETCH_CURRENT_GAMES_KICKED_OFF_KEY, self::FETCH_CURRENT_GAMES_KICKED_OFF);

		// Execute the query
		$this->loadAndExecutePreparedQuery(self::FETCH_CURRENT_GAMES_KICKED_OFF_KEY, array(self::$currentWeek));

		// Extract all the game IDs for the current week
		$games = $this->fetchResults();

		// The week is consider closed off to any wagers if more than three games have already started
		return (count($games) > 3);
	}

	/**
	  * Will save the wagers that a user has made into the database. If a record for the wager
	  * exists, the record will be updated with the new wager. Otherwise, a new record will be
	  * created.
	  *
	  * @param $pickCollection - an array containing pick models that represent the wagers that a user has
	  *				 made for the current week. Each key in the array represents the ID of the
	  *				 game that relates to the corresponding wager.
	  *
	  * @author kinsho
	  */
	public function saveWagers($picksCollection = array())
	{
		// Fetch the ID of the user from the session. It will be used in the queries made against the wagers table
		$userID = $_SESSION['userSession']['id'];

		// If the server has not deduced the current week, do so and fetch it
		if ( !(self::$currentWeek) )
		{
			$this->deduceCurrentWeek();
		}

		// Prepare the SQL query that will be used to either update a wager record or create a new one
		$this->prepareStatement(self::CREATE_UPDATE_WAGER_KEY, self::CREATE_UPDATE_WAGER);

		foreach ($picksCollection as $pickModel)
		{
			// Fetch the game ID from the pick model. It will be used in the queries made against the wagers table
			$gameID = $pickModel->getGameId();
			$wager = $pickModel->getWager();

			if (intval($wager) > 0)
			{
				$this->loadAndExecutePreparedQuery(self::CREATE_UPDATE_WAGER_KEY, array($userID, $gameID, $wager, self::$currentWeek, $wager));
			}
		}
	}

	/**
	  * Will fetch all the wagers that a user has made for any given week
	  *
	  * @param $week - the week from which to fetch all the wagers that user has made
	  * @returns an array containing all of the wagers the user has made for the passed week,
	  *		with the game IDs corresponding to each wager being used as the array's keys
	  *
	  * @author kinsho
	  */
	public function fetchWagers($week)
	{
		if ( !(self::$currentWeek) && !($week) )
		{
			$this->deduceCurrentWeek();
		}
		$week = $week ? $week : self::$currentWeek;

		// Fetch the ID of the user from the session. It will be used in the queries made against the wagers table
		$userID = $_SESSION['userSession']['id'];

		// Prepare the SQL query that will be used to fetch the wagers
		$this->prepareStatement(self::FETCH_WAGERS_KEY, self::FETCH_WAGERS);

		// Now execute the query
		$this->loadAndExecutePreparedQuery(self::FETCH_WAGERS_KEY, array($userID, $week));

		// Parse the results and return an array with the wagers as values and the corresponding game IDs as the keys
		$wagers = $this->fetchResults();

		$results = array();
		foreach($wagers as $wager)
		{
			$results[$wager['gameId']] = $wager['wager'];
		}

		return $results;
	}

	/**
	  * Will calculate which week is coming up on the regular season schedule 
	  *
	  * @returns an array containing the current week in the regular season schedule
	  *
	  * @author kinsho
	  */
	public function deduceCurrentWeek()
	{
		if ( !(isset(self::$currentWeek)) )
		{
			// Prepare the SQL query that will be used in this function
			$this->prepareStatement(self::FETCH_CLOSEST_WEEK_KEY, self::FETCH_CLOSEST_WEEK);

			// Now execute the query
			$this->loadAndExecutePreparedQuery(self::FETCH_CLOSEST_WEEK_KEY);

			// Ensure that the class itself stores this information for easy access later
			self::$currentWeek = ($this->areThereResults() ? $this->fetchSingleValue('week') : 17);
		}

		return self::$currentWeek;
	}

	/**
	  * Fetches all the team names and their corresponding IDs
	  *
	  * @returns an array containing all team names indexed by their database ID
	  *
	  * @author kinsho
	  */
	private function retrieveTeamNames()
	{
		// Prepare the SQL query that will be used in this function
		$this->prepareStatement(self::FETCH_TEAM_NAMES_KEY, self::FETCH_TEAM_NAMES);

		// Now execute the query
		$this->loadAndExecutePreparedQuery(self::FETCH_TEAM_NAMES_KEY);
		$teams = $this->fetchResults();

		$resultsArray = array();
		foreach ($teams as $team)
		{
			$resultsArray[$team['id']] = $team['market'].' '.$team['name'];
		}

		// Ensure that the class itself stores this information for easy access later
		self::$teamNames = $resultsArray;

		return $resultsArray;
	}

	/**
	  * Will fetch the kickoff date/time for the regular season game corresponding to the passed ID
	  *
	  * @param $gameID - the game ID for which to fetch the corresponding kickoff date/time
	  * @returns a string representing the kickoff time corresponding to the game ID that was passed
	  *
	  * @author kinsho
	  */
	private function fetchKickoffTime($gameID)
	{
		// Prepare the SQL query that will be used in this function
		$this->prepareStatement(self::FETCH_KICKOFF_TIME_KEY, self::FETCH_KICKOFF_TIME);

		// Now execute the query
		$this->loadAndExecutePreparedQuery(self::FETCH_KICKOFF_TIME_KEY, array($gameID));

		// If the game could not be found within the database, something went horribly wrong...
		if ( !($this->areThereResults()) )
		{
			return false;
		}

		return $this->fetchSingleValue('kickoffTime');
	}

	/**
	  * Converts all team IDs within the dataset over to their respective team names
	  *
	  * @param $dataset - an array of records that will have all its team IDs converted to actual names
	  * @param $fields - an array of column names that contain the team IDs that need to be converted
	  * @returns an array containing all team names indexed by their ID
	  *
	  * @author kinsho
	  */
	private function convertIDsToTeamNames($dataset, $fields = array())
	{
		foreach ($dataset as $key => $record)
		{
			foreach ($fields as $field)
			{
				if ($record[$field])
				{
					$dataset[$key][$field] = self::$teamNames[$record[$field]];
				}
			}
		}

		return $dataset;
	}

	/**
	  * Converts all dateTime fields within the dataset over to a more user-friendly format
	  *
	  * @param $dataset - an array of records that will have all its dateTime fields converted
	  * @param $fields - an array of column names that contain the dateTimes to be converted
	  * @returns an array containing all kickoff times converted to a user-friendly format
	  *
	  * @author kinsho
	  */
	private function convertKickoffTimes($dataset, $fields = array())
	{
		foreach ($dataset as $key => $record)
		{
			foreach ($fields as $field)
			{
				if ($record[$field])
				{
					$dataset[$key][$field] = $this->convertDateTime($record[$field]);
				}
			}
		}

		return $dataset;
	}
}
?>