<?php

TOS_REQUIRE_ONCE('controllers/foundation/BaseController.php');

TOS_REQUIRE_ONCE('models/pools/ExistingSuicidePoolModel.php');
TOS_REQUIRE_ONCE('models/pools/NewSuicidePoolModel.php');

TOS_REQUIRE_ONCE('DAO/SuicidePoolsDAO.php');
TOS_REQUIRE_ONCE('DAO/UsersDAO.php');

TOS_REQUIRE_ONCE('utility/MustacheManager.php');

/**
  * The controller class for the suicide pool page
  *
  * @author kinsho
  */
class SuicidePoolsController extends BaseController
{
	const GENERIC_NAME = 'suicidePools';
	const MEMBERS_TABLE_MUSTACHE_TEMPLATE = 'membersTable.mustache';
	const POOL_LISTINGS_MUSTACHE_TEMPLATE = 'suicidePoolsListings.mustache';
	const EMPTY_POOL_LISTINGS_MUSTACHE_TEMPLATE = 'emptySuicidePoolsListings.mustache';

	protected static $DAO;

	/**
	  * The action method that is triggered whenever a user attempts to log in to his account
	  *
	  * @author kinsho
	  */
	public static function initPage()
	{
		parent::blockIfNotLoggedIn();

		// Fetch all the data that will be necessary to display on page, then massage the data
		// so that it can later be displayed on screen using Mustache
		self::preprocessPoolsTemplate(self::getPools());

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
		$newPoolBean = new NewSuicidePoolModel($params);

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

	/**
	  * Action function responsible for fetching all the members that are participating or have been
	  * invited to the suicide pool in context
	  *
	  * @author kinsho
	  */
	public static function getMembersAction()
	{
		// Start the session in case we need to save
		parent::startSession();

		// Prepare POST parameters array
		$params = self::convertPOST();

		// Instantiate a NewSuicidePool Bean and validate all parameters
		$existingPoolBean = new ExistingSuicidePoolModel($params);

		// Now fetch the list of members from the database
		$poolsDAO = new SuicidePoolsDAO();
		$list = $poolsDAO->fetchAllUsersInPool($existingPoolBean);

		// Generate the HTML to display all the members within the pool
		$mustacheManager = new MustacheManager();
		$list = $mustacheManager->alternateRowColors($list);
		$html = $mustacheManager->renderTemplate($list, self::GENERIC_NAME . '/' . self::MEMBERS_TABLE_MUSTACHE_TEMPLATE);

		// Send the generated HTML back to the client
		parent::sendPositiveHTTPResponse($html);
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
	  *		assume that the current user is the user in focus here
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

	/**
	  * Function that's responsible for preparing the suicide pools dataset for viewing purposes
	  *
	  * @param $pools {Array} - the list of suicide pools to prepare for eventual display
	  *
	  * @author kinsho
	  */
	private static function preprocessPoolsTemplate($pools)
	{
		global $view;

		// Set up a comparison function that'll be used to sort the list of pools by user status
		$compFunc = function($poolA, $poolB)
		{
			if ($poolA['userStatus'] === $poolB['userStatus'])
			{
				return 0;
			}

			return ($poolA['userStatus'] > $poolB['userStatus'] ? 1 : -1);
		};

		$massagedDataSet = [];
		
		// Sort the list of pools beforehand by a user's status within the pool
		usort($pools, $compFunc);

		// Preprocess the pools array to contain several properties to guide the visualization logic
		// that'll be responsible for generating the HTML
		foreach ($pools as $index => $pool)
		{
			// Set the status flag appropriately depending on the user's status within the pool
			if ($pool['userStatus'] === 'participant')
			{
				$pool['isAlive'] = true;
			}
			else if ($pool['userStatus'] === 'invited')
			{
				$pool['isInvited'] = true;
			}
			else if ($pool['userStatus'] === 'dead')
			{
				$pool['isDead'] = true;
			}

			// Move the pool to the front of the dataset if the user manages the pool
			// Otherwise, add the element towards the back of the array
			if ($pool['isManager'])
			{
				array_unshift($massagedDataSet, $pool); 
			}
			else
			{
				$massagedDataSet[] = $pool;
			}
		}

		// Introduce logic to alternate the row colors when the data is displayed
		$massagedDataSet = MustacheManager::alternateRowColors($massagedDataSet);

		// Render the HTML
		$view->poolListingsHTML = MustacheManager::renderTemplate($massagedDataSet, self::GENERIC_NAME . '/' . self::POOL_LISTINGS_MUSTACHE_TEMPLATE, self::GENERIC_NAME . '/' . self::EMPTY_POOL_LISTINGS_MUSTACHE_TEMPLATE);
	}
}
?>