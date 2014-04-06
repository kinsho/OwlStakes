<?php

REQUIRE_ONCE 'foundation/BaseController.php';
REQUIRE_ONCE '/../models/foundation/ValidationModel.php'; 

REQUIRE_ONCE '/../models/pools/ExistingSuicidePoolModel.php';
REQUIRE_ONCE '/../models/pools/NewSuicidePoolModel.php';

REQUIRE_ONCE '/../DAO/SuicidePoolsDAO.php';
REQUIRE_ONCE '/../DAO/UsersDAO.php';

/**
  * The controller class for the suicide pool page
  *
  * @author kinsho
  */
class SuicidePoolsController extends BaseController
{
	const GENERIC_NAME = 'suicidePools';

	protected static $DAO;

	/**
	  * The action method that is triggered whenever a user attempts to log in to his account
	  *
	  * @author kinsho
	  */
	public static function initPage()
	{
		parent::blockIfNotLoggedIn();

		// Fetch all the data that will be necessary to display on page
		self::getPools();

		parent::initPage();
	}

// ------------- ACTION FUNCTIONS --------------------
	/**
	  * Action function responsible for invoking all the logic necessary to create a new suicide pool
	  *
	  * @author kinsho
	  */
	public static function createPoolAction()
	{
		// Start the session in case we need to save
		parent::startSession();

		// Prepare POST parameters array
		$params = self::convertPOST();

		// Instantiate a NewSuicidePool Bean and validate all parameters
		$newPoolBean = new NewSuicidePoolModel();
		$newPoolBean->populateAndValidate($params, true); // Second parameter ensures that error handling is handled generically

		$poolsDAO = new SuicidePoolsDAO();

		$poolsDAO->addPool($newPoolBean);

		parent::sendPositiveHTTPResponse();
	}

	/**
	  * Action function responsible for fetching all the usernames that have been registered with the web site
	  *
	  * @author kinsho
	  */
	public static function getNamesAction()
	{
		$usersDAO = new UsersDAO();

		// Keep in mind that the parameter to reference here was passed as part of
		// a GET request, not a POST request
		$usernames = $usersDAO->fetchUsernames($_GET['term']);

		parent::sendPositiveHTTPResponse($usernames);
	}

// ------------- UTILITY FUNCTIONS --------------------

	/**
	  * Specialized function to store all POST data into an array and push specialized session data into that same array as well
	  *
	  * @return - an array containing all the parameters that will eventually be validated and used to modify data within the database
	  *
	  * @author kinsho
	  */
	protected static function convertPOST()
	{
		$params = parent::convertPOST();

		$params['userID'] = $_SESSION['userSession']['id'];

		return $params;
	}

	/**
	  * Generic function responsible for fetching a list of all pools to which the current/passed user manages, participates,
	  * or has been invited.
	  *
	  * @param $userID - the ID of the user whom to search for. If no user has been specified,
	  *                  assume that the current user is the user in focus here
	  * @return - an array containing all the pools that a user belongs to, segregated by that user's role within each pool
	  *
	  * @author kinsho
	  */
	private static function getPools($userID = '')
	{
		global $view;
		self::$DAO = new SuicidePoolsDAO();

		$view->pools = self::$DAO->fetchPools();

		return $view->pools;
	}
}
?>