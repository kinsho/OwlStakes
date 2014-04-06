<?php

	REQUIRE 'foundation/BaseController.php';
	REQUIRE '/../DAO/PicksDAO.php';
	REQUIRE '/../models/foundation/ValidationModel.php'; 
	REQUIRE '/../models/foundation/ValidationCollection.php'; 
	REQUIRE '/../models/picks/PickModel.php'; 
	REQUIRE '/../models/picks/PicksCollection.php'; 


/**
  * The controller class for the stats page
  *
  * @author kinsho
  */

	class PicksController extends BaseController
	{
		const GENERIC_NAME = 'picks';

		const SAVE_ACTION_SUCCESS_HEADER = "Done!";
		const SAVE_ACTION_NOTHING_SAVED_HEADER = "Well, that was pointless...";
		const SAVE_ACTION_SUCCESS_MESSAGE = "We've recorded your wagers in our books.";
		const SAVE_ACTION_NOTHING_SAVED_MESSAGE = "What's the point of clicking that button if all the wager fields above are disabled?";

		protected static $DAO;

		public static function initPage()
		{
			parent::blockIfNotLoggedIn();

			// Fetch the data that will need to be displayed upon page load
			self::getGames();
			self::getWagers();
			self::getCurrentWeek();

			parent::initPage();
		}

		public static function saveAction()
		{
			$results = array();

			// Start the session in case we need to save
			parent::startSession();

			// Prepare POST parameters array that will be processed into an array of PickModel beans
			$params = self::convertPOST();

			// Send back a smart-ass response if no wagers were actually posted over to the server
			if ( !(count($params)) )
			{
				$results['successHeader'] = self::SAVE_ACTION_NOTHING_SAVED_HEADER;
				$results['successMessage'] = self::SAVE_ACTION_NOTHING_SAVED_MESSAGE;

				parent::sendHTTPResponse($results);
			}

			$picksCollection = new PicksCollection(); // formal collection object to store a collection of Pick models

			// Create a Pick Bean for to validate and store data for each pick
			foreach ($params as $record)
			{
				$pickBean = new PickModel();
				$pickBean->populateAndValidate($record);

				$picksCollection->insertModel($pickBean);
			}

			// Run collection-specific validation functions on the set of picks
			$picksCollection->initiateValidationFunctions();
			$picksCollection->validateCollection();

			// Retrieve any errors that may have been generated during collection validation
			$results = $picksCollection->retrieveErrors();

			// If no errors were found with the data that was passed to the server, save the wagers into the database
			if (empty($results['errors']))
			{
				self::saveWagers($picksCollection->getCollection());

				$results['successHeader'] = self::SAVE_ACTION_SUCCESS_HEADER;
				$results['successMessage'] = self::SAVE_ACTION_SUCCESS_MESSAGE;
			}

			// Send out an HTTP response back to the client
			parent::sendHTTPResponse($results);
		}

		/*
		 * Lovely action function meant to send data back to the client for another week's
		 * worth of picks
		 *
		 * @author kinsho
		 */
		public static function changeWeekAction()
		{
			// Begin timing the execution of this function
			$start = microtime(true);

			// Prepare POST parameters array
			$params = parent::convertPOST();

			// Start the session, as we'll need it to fetch wagers
			parent::startSession();

			$response = array();

			// Retrieve the data that needs to be sent back to the client to refresh the page
			$response['games'] = self::getGames($params['week']);
			$response['wagers'] = self::getWagers($params['week']);

			// In case the server is ready to generate a response quicker than expected, delay
			// the conveyance of the response until any client-side animation is sure to have
			// fully played out
			$timeTaken = microtime(true) - $start;
			if ($timeTaken < 500000)
			{
				usleep(500000 - $timeTaken);
			}

			// Send out an HTTP response back to the client
			parent::sendHTTPResponse($response);
		}

		/*
		 * Function is an API handler designed to fetch all of the games within any given week and
		 * locks the game if they have already started and/or ended
		 *
		 * @param week - the week from which to fetch games
		 * @return an array containing data regarding all regular season games for a specific week
		 *
		 * @author kinsho
		 */
		private static function getGames($week = '')
		{
			global $view;
			self::$DAO = new PicksDAO();

			$currentDate = new DateTime('now', new DateTimeZone('EST'));

			$games = self::$DAO->fetchGames($week);
			$gamesLocked = 0;

			// If certain games have already started, lock those games. If more than three games in any given week
			// have started, lock all the remaining games
			foreach ($games as $index => $game)
			{
				$kickoffTime = new DateTime($game['systemKickoffTime'], new DateTimeZone('EST'));
				if ( ($currentDate > $kickoffTime) || ($gamesLocked > 3) )
				{
					$games[$index]['locked'] = true;
					$gamesLocked++;
				}
			}

			// Store this information within the view so that we can fully render the HTML on the server using the data
			$view->games = $games;

			return $games;
		}

		/*
		 * Function is an API handler designed to fetch the index of the current week in the
		 * context of the NFL regular season
		 *
		 * @return an integer representing the current week
		 *
		 * @author kinsho
		 */		
		private static function getCurrentWeek()
		{
			global $view;
			self::$DAO = new PicksDAO();

			$week = self::$DAO->deduceCurrentWeek();

			// Store the current week so that it's accessible from the view
			$view->currentWeek = $week;

			return $week;
		}

		/*
		 * Function is an API handler designed to fetch all of the wagers that a user has made on
		 * any given week
		 *
		 * @param $week - the week from which the user's wagers
		 * @return an array containing all of the user's wagers for a specific week
		 *
		 * @author kinsho
		 */
		private static function getWagers($week = '')
		{
			global $view;
			self::$DAO = new PicksDAO();

			$wagers = self::$DAO->fetchWagers($week);
			$view->wagers = $wagers;

			return $wagers;
		}

		/*
		 * Function is an API handler designed to save the wagers that a user has
		 * made for the current week
		 *
		 * @param $picksCollection - the collection of wagers that will need to be saved into 
		 *        	the database 
		 *
		 * @author kinsho
		 */
		private static function saveWagers($picksCollection)
		{
			self::$DAO = new PicksDAO();

			// Ensure that the user's session has been initialized before fetching any data from the session object
			parent::startSession();

			self::$DAO->saveWagers($picksCollection);
		}

		/*
		 * Specialized function responsible for transferring all the wager data into an array
		 * of arrays that can then be easily converted to Pick Models and stored in a Pick collection.
		 *
		 * @return an array of arrays representing all the wagers that a user has made for the current week
		 *
		 * @author kinsho
		 */
		protected static function convertPOST()
		{
			$params = array();

			// Fetch picks
			foreach($_POST as $key => $value)
			{
				$record = array();

				$record['gameId'] = $key;
				$record['wager'] = $value;

				$params[] = $record;
			}

			return $params;
		}
	}
?>