<?php

REQUIRE_ONCE 'foundation/BaseDAO.php';

/**
  * Specialized DAO class for registration page
  *
  * @author kinsho
  */
class LogInDAO extends BaseDAO
{

// ------------------- CONSTANTS -----------------

	const FETCH_USER_KEY = 'fetchUser';
	const FETCH_USER = 'SELECT * FROM users U WHERE U.userName = ?';

	const CHECK_CREDENTIALS_KEY = 'checkCredentials';
	const CHECK_CREDENTIALS = 'SELECT * FROM users U WHERE U.userName = ? AND U.password = ?';

	const CHECK_EMAIL_KEY = 'checkEmail';
	const CHECK_EMAIL = 'SELECT * FROM users U WHERE U.emailAddress = ?';

	const FETCH_USERNAME_FROM_EMAIL_ADDRESS_KEY = 'fetchUsernameFromEmailAddress';
	const FETCH_USERNAME_FROM_EMAIL_ADDRESS = 'SELECT U.userName FROM users U WHERE U.emailAddress = ?';

	const CHECK_FOR_TEMP_PASSWORD_KEY = 'checkForTempPassword';
	const CHECK_FOR_TEMP_PASSWORD = 'SELECT FP.tempPassword, FP.numOfRequests, FP.updatedOn FROM forgottenPasswords FP WHERE FP.username = ?';

	const CREATE_UPDATE_TEMP_PASSWORD_KEY = 'createUpdateTempPassword';
	const CREATE_UPDATE_TEMP_PASSWORD = 'INSERT INTO forgottenPasswords VALUES (?, ?, 1, null, null) ON DUPLICATE KEY UPDATE tempPassword = ?, numOfRequests = ?';

	const CREATE_UPDATE_LOG_IN_COOKIE_KEY = 'createUpdateLogInCookie';
	const CREATE_UPDATE_LOG_IN_COOKIE = 'INSERT INTO logInCookies VALUES (?, ?, null, null) ON DUPLICATE KEY UPDATE id = ?;';

	const FIND_LOG_IN_COOKIE_KEY = 'findLogInCookie';
	const FIND_LOG_IN_COOKIE = 'SELECT LIC.id FROM logInCookies LIC WHERE LIC.username = ?;';

	const WIPE_LOG_IN_COOKIE_KEY = 'dropLogInCookie';
	const WIPE_LOG_IN_COOKIE = 'DELETE FROM logInCookies WHERE username = ?';

	const LOG_IN_COOKIE_LABEL = 'TOSCS';
	const LOG_IN_COOKIE_LIFETIME = 5184000; // Two months, in seconds

	const SESSION_USER_LABEL = 'userSession';

// ------------------- CONSTRUCTOR -----------------

	public function __construct()
	{
		parent::__construct();

		// Open up the connection to the database
		$this->openConnection();
		$this->openDatabase();

		return $this;
	}

// ------------------- DATABASE FUNCTIONS -----------------

	/**
	  * Will verify the credentials that a person uses to log in to the platform
	  *
	  * @param {String} $username - the username to check
	  * @param {String} $password - the password associated with the user name
	  * @return {Boolean} - indicating whether the username exists and the password
	  * 	corresponds to that user name
	  *
	  * @author kinsho
	  */
	public function checkCredentials($username, $password)
	{
		// Prepare the SQL query that will be used within this function
		$this->prepareStatement(self::CHECK_CREDENTIALS_KEY, self::CHECK_CREDENTIALS);

		// Execute the query to check the username and password combination
		$this->loadAndExecutePreparedQuery(self::CHECK_CREDENTIALS_KEY, array($username, $password));

		if ($this->areThereResults())
		{
			// Set the user record into the session object for future referencing
			$_SESSION[self::SESSION_USER_LABEL] = $this->fetchNextRecord();

			return true;
		}

		return false;
	}

	/**
	  * Will verify the e-mail address that a user has supplied in order to reset
	  * their user name/password combination in the event that he forgets his password
	  *
	  * @param {String} $email - the email address to check
	  * @return {Boolean} - indicating whether the email address exists
	  *
	  * @author kinsho
	  */
	public function checkEmail($email)
	{
		// Prepare the SQL query that will be used within this function
		$this->prepareStatement(self::CHECK_EMAIL_KEY, self::CHECK_EMAIL);

		// Now execute the query
		$this->loadAndExecutePreparedQuery(self::CHECK_EMAIL_KEY, array($email));

		return $this->areThereResults();
	}

	/**
	  * Inserts a new temporary password into the database for the user if none exists. If a temporary
	  * password does exist, update the record with a new password
	  *
	  * @param {String} $email - the email which will be used to fetch a username
	  *
	  * @author kinsho
	  */
	public function createOrUpdateTempKey($email)
	{
		// Fetch the username using the passed e-mail address
		$username = $this->fetchUserNameFromEmail($email);

		// Generate a new temporary password to insert into the database
		$tempPassword = hash('MD5', rand());

		// Prepare the statement to create a record for a new temporary password. If a record already exists, update
		// the existing record with the newly generated password
		$this->prepareStatement(self::CREATE_UPDATE_TEMP_PASSWORD_KEY, self::CREATE_UPDATE_TEMP_PASSWORD);

		// Now execute the statement
		$this->loadAndExecutePreparedQuery( self::CREATE_UPDATE_TEMP_PASSWORD_KEY, array($username, $tempPassword, $tempPassword, $incrementedNumOfRequests) );
	}

	/**
	  * Verifies that no more than three temporary password e-mails have been sent out
	  * to the passed e-mail address over the past 24 hours
	  *
	  * @param {String} $email - the e-mail address to test
	  * @return {Boolean} - indicating whether more than three e-mails have been sent to the
	  * 		 	passed e-mail address over the past 24 hours
	  *
	  * @author kinsho
	  */
	public function testNumberOfRequestsMade($email)
	{
		$username = $this->fetchUserNameFromEmail($email);

		$this->loadAndExecutePreparedQuery(self::CHECK_FOR_TEMP_PASSWORD_KEY, array($username));

		if ($this->areThereResults())
		{
			// Fetch the number of requests that have already been made and the time the record was last updated
			$record = $this->fetchNextRecord();
			$numOfRequests = $record['numOfRequests'];
			$lastUpdated = $record['updatedOn'];

			// Calculate how long ago the last update was made to the fetched record
			$currentTime = new DateTime('now', new DateTimeZone('EST'));
			$lastUpdated = new DateTime($lastUpdated, new DateTimeZone('EST'));
			$timeDifference = $currentTime->diff($lastUpdated);
			$daysPassed = intval($timeDifference->format('%a'));

			// Test whether less than 4 requests have been made in the past day
			return ( ($numOfRequests <= 3) || ($daysPassed > 0) );
		}

		// No temporary password has been created yet, so we can safely return true here
		return true;
	}

	/**
	  * Generates a cookie and stores all information related to the newly generated cookie within the database, for security reasons
	  *
	  * @param {String} $username - the user name for which to generate a cookie
	  * @param {Number} [$timeToLive] - the lifespan to assign to the cookie, if specified.
	  *
	  * @author kinsho
	  */
	public function generateCookie($username, $timeToLive = null)
	{
		// If a specific lifespan for the cookie has not been passed into the function,
		// give the cookie the maximum possible lifespan that can be assigned 
		if ( !(isset($timeToLive)) )
		{
			$timeToLive = time() + self::LOG_IN_COOKIE_LIFETIME;
		}

		// Prepare the SQL query to create (or update) the log-in cookie
		$this->prepareStatement(self::CREATE_UPDATE_LOG_IN_COOKIE_KEY, self::CREATE_UPDATE_LOG_IN_COOKIE);

		// Generate the random identifier necessary to secure the cookie
		$cookieId = hash('MD5', rand());

		// Store the cookie information into the server for future validation purposes
		$this->loadAndExecutePreparedQuery( self::CREATE_UPDATE_LOG_IN_COOKIE_KEY, array($cookieId, $username, $cookieId) );

		/* 
		 * Generate the actual cookie to send back to the user. Keep in mind that the cookie itself will contain
		 * three disparate values separated by a |. The following values are delineated below in the order they appear
		 * within the cookie
		 * - user name,
		 * - the cookie ID,
		 * - the expiration date of the cookie
		 */
		setcookie(self::LOG_IN_COOKIE_LABEL, $username.'|'.$cookieId.'|'.$timeToLive, $timeToLive, '/', '', false);
	}

	/**
	  * Checks if a valid log-in cookie exists for the current session. If so, it loads user data associated with
	  * the cookie into the session object
	  *
	  * @author kinsho
	  */
	public function checkAndLoadCookie()
	{
		// Only go forth with the cookie check here if a user object has not been defined within the current session object
		if ( !(isset($_SESSION[self::SESSION_USER_LABEL])) && (isset($_COOKIE[self::LOG_IN_COOKIE_LABEL])) )
		{
			// Fetch the cookie and extract the user name, the cookie ID, and the expiration date from the cookie
			$cookie = explode('|', $_COOKIE[self::LOG_IN_COOKIE_LABEL]);
			$cookieUsername = $cookie[0];
			$cookieID = $cookie[1];
			$cookieExpirationDate = $cookie[2];

			// Prepare the statement to check the cookie's integrity
			$this->prepareStatement(self::FIND_LOG_IN_COOKIE_KEY, self::FIND_LOG_IN_COOKIE);

			// Now execute the statement
			$this->loadAndExecutePreparedQuery(self::FIND_LOG_IN_COOKIE_KEY, array($cookieUsername));

			if ($this->areThereResults())
			{
				$record = $this->fetchNextRecord();

				// Check the record from the database against the cookie from the client. If the two
				// fail to match, we're dealing with a cookie that has been corrupted or potentially hijacked.
				if ($record['id'] !== $cookieID)
				{
					// For security purposes, wipe the record of the cookie from the database so as to force
					// the user to generate a new cookie
					$this->killLogInCookie($cookieUsername);
				}
				else
				{
					// Now that we know the cookie's integrity is intact, load the user's data into the session object
					$this->prepareStatement(self::FETCH_USER_KEY, self::FETCH_USER);
					$this->loadAndExecutePreparedQuery(self::FETCH_USER_KEY, array($cookieUsername));
					$_SESSION[self::SESSION_USER_LABEL] = $this->fetchNextRecord();

					// Regenerate a new cookie as a security measure against cookie hijacking
					$this->generateCookie($cookieUsername, $cookieExpirationDate);
				}
			}
		}
	}

	/**
	  * Removes the database record that corresponds to the log-in cookie possessed by user indicated by
	  * the passed username
	  *
	  * @param {String} $username - the name of the user whose log-in cookie will have its database record wiped 
	  *
	  * @author kinsho
	  */
	public function killLogInCookie($username)
	{
		// Prepare the query to wipe the record of the log-in cookie out of the database
		$this->prepareStatement(self::WIPE_LOG_IN_COOKIE_KEY, self::WIPE_LOG_IN_COOKIE);

		// Now execute the query
		$this->loadAndExecutePreparedQuery(self::WIPE_LOG_IN_COOKIE_KEY, array($username));

		// Ensure that the user's copy of the cookie is completely wiped as well
		unset($_COOKIE[self::LOG_IN_COOKIE_LABEL]);
		setcookie(self::LOG_IN_COOKIE_LABEL, null, time() - 3600, '/');
	}

	/**
	  * Fetch the user name associated with the passed e-mail address
	  *
	  * @param {String} $email - the email address with which to fetch the user name
	  * @return {String} - the user name associated with the passed e-mail address
	  *
	  * @author kinsho
	  */
	private function fetchUserNameFromEmail($email)
	{
		// Prepare the statement to fetch the username from a given e-mail address
		$this->prepareStatement(self::FETCH_USERNAME_FROM_EMAIL_ADDRESS_KEY, self::FETCH_USERNAME_FROM_EMAIL_ADDRESS);

		// Now execute the query
		$this->loadAndExecutePreparedQuery(self::FETCH_USERNAME_FROM_EMAIL_ADDRESS_KEY, array($email));

		// Return the user name if one was returned
		return ($this->areThereResults() ? $this->fetchSingleValue('userName') : '');
	}
}
?>