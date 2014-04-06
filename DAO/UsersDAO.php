<?php

REQUIRE_ONCE 'foundation/BaseDAO.php';

/**
  * Specialized DAO class to fetch information specific to users
  *
  * @author kinsho
  */
class UsersDAO extends BaseDAO
{
	// -------- CLASS MEMBERS -------------

	const FETCH_ID_FROM_USERNAME_OR_EMAIL_KEY = 'fetchIdFromUsernameOrEmail';
	const FETCH_ID_FROM_USERNAME_OR_EMAIL = 'SELECT id FROM users WHERE userName = ? OR emailAddress = ?';
	const FETCH_USERNAMES_USING_SEARCH_KEY = 'fetchUsernamesUsingSearch';
	const FETCH_USERNAMES_USING_SEARCH = 'SELECT userName FROM users WHERE userName LIKE CONCAT("%", ?, "%")';

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
	  * Determines whether a user with the passed user name or e-mail address exists within the database
	  *
	  * @param $userInfo - either the name or the e-mail address that will be used for the test here
	  * @returns - a boolean indicating whether a user with the username or e-mail address exists within the database
	  *
	  * @author kinsho
	  */
	public function doesUserExistWithGivenUsernameOrEmail($userInfo)
	{
		// Prepare the SQL query that will be used to search for the corresponding user ID
		$this->prepareStatement(self::FETCH_ID_FROM_USERNAME_OR_EMAIL_KEY, self::FETCH_ID_FROM_USERNAME_OR_EMAIL);

		// Now execute the query
		$this->loadAndExecutePreparedQuery(self::FETCH_ID_FROM_USERNAME_OR_EMAIL_KEY, array($userInfo, $userInfo));

		// Return a boolean depending on whether the database returned any results
		return $this->areThereResults();	
	}

	/**
	  *	Fetches the ID that corresponds to the user's information that passed into this function
	  *
	  * @param $userInfo - either the username or e-mail address that belongs to the user whose ID will be returned
	  * @return - the ID that belongs to the user
	  *
	  * @author kinsho
	  */
	public function fetchIDViaUsernameOrEmail($userInfo)
	{
		// Prepare the SQL query that will be used to search for the corresponding user ID
		$this->prepareStatement(self::FETCH_ID_FROM_USERNAME_OR_EMAIL_KEY, self::FETCH_ID_FROM_USERNAME_OR_EMAIL);

		// Now execute the query
		$this->loadAndExecutePreparedQuery(self::FETCH_ID_FROM_USERNAME_OR_EMAIL_KEY, array($userInfo, $userInfo));

		// Return the fetched user ID
		return ($this->areThereResults() ? $this->fetchSingleValue('id') : null);

	}

	/**
	  * Fetches a list of all usernames that match against a search term in some way
	  *
	  * @param $search {String} - the term that will be used to guide the search for usernames
	  * @return {Array} - a list of all usernames registered within the system
	  *
	  * @author kinsho
	  */
	public function fetchUsernames($search)
	{
		// Prepare the SQL query that will be used to fetch all user names that match the given search term
		$this->prepareStatement(self::FETCH_USERNAMES_USING_SEARCH_KEY, self::FETCH_USERNAMES_USING_SEARCH);

		// Now execute the query
		$this->loadAndExecutePreparedQuery(self::FETCH_USERNAMES_USING_SEARCH_KEY, array($search));

		// Fetch the usernames from the result set and return them
		$resultsArray = array();
		while ($record = $this->fetchNextRecord())
		{
			$resultsArray[] = $record['userName'];
		}

		return $resultsArray;
	}
}
?>