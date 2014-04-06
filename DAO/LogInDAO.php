<?php

REQUIRE_ONCE 'foundation/BaseDAO.php';

/**
  * Specialized DAO class for registration page
  *
  * @author kinsho
  */
class LogInDAO extends BaseDAO
{
	// -------- CLASS MEMBERS -------------

	const CHECK_CREDENTIALS_KEY = 'checkCredentials';
	const CHECK_CREDENTIALS = 'SELECT * FROM users U WHERE U.userName = ? AND U.password = ?';
	const CHECK_EMAIL_KEY = 'checkEmail';
	const CHECK_EMAIL = 'SELECT * FROM users U WHERE U.emailAddress = ?';
	const FETCH_USERNAME_FROM_EMAIL_ADDRESS_KEY = 'fetchUsernameFromEmailAddress';
	const FETCH_USERNAME_FROM_EMAIL_ADDRESS = 'SELECT U.userName FROM users U WHERE U.emailAddress = ?';
	const CHECK_FOR_TEMP_PASSWORD_KEY = 'checkForTempPassword';
	const CHECK_FOR_TEMP_PASSWORD = 'SELECT FP.tempPassword, FP.numOfRequests, FP.updatedOn FROM forgottenPasswords FP WHERE FP.username = ?';
	const UPDATE_TEMP_PASSWORD_KEY = 'updateTempPassword';
	const UPDATE_TEMP_PASSWORD = 'UPDATE forgottenPasswords FP SET FP.tempPassword = ?, FP.numOfRequests = ? WHERE FP.username = ?';
	const CREATE_TEMP_PASSWORD_KEY = 'createTempPassword';
	const CREATE_TEMP_PASSWORD = 'INSERT INTO forgottenPasswords VALUES (?, ?, 1, null, null)';
	const CREATE_UPDATE_LOG_IN_COOKIE_KEY = 'createUpdateLogInCookie';
	const CREATE_UPDATE_LOG_IN_COOKIE = 'INSERT INTO logInCookies VALUES (?, ?, ?, null, null) ON DUPLICATE KEY UPDATE tokenId = ?;';
	const FIND_LOG_IN_COOKIE_KEY = 'findLogInCookie';
	const FIND_LOG_IN_COOKIE = 'SELECT tokenId FROM logInCookies WHERE username = ? AND seriesId = ?;';

	protected $currentWeek = array(); // Indicates the current week of the NFL regular season schedule. Stored as an array to facilitate statement execution
	protected $teamNames = array(); // All the team names and their corresponding IDs, stored within the array as keys

	// --------- CONSTRUCTOR --------------

	public function __construct()
	{
		parent::__construct();

		$this->openConnection();
		$this->openDatabase();

		$this->prepareStatement(self::CHECK_EMAIL_KEY, self::CHECK_EMAIL);
		$this->prepareStatement(self::CHECK_FOR_TEMP_PASSWORD_KEY, self::CHECK_FOR_TEMP_PASSWORD);
		$this->prepareStatement(self::UPDATE_TEMP_PASSWORD_KEY, self::UPDATE_TEMP_PASSWORD);
		$this->prepareStatement(self::CREATE_TEMP_PASSWORD_KEY, self::CREATE_TEMP_PASSWORD);
		$this->prepareStatement(self::FETCH_USERNAME_FROM_EMAIL_ADDRESS_KEY, self::FETCH_USERNAME_FROM_EMAIL_ADDRESS);

		return $this;
	}

	// ------- FUNCTIONS -----------

	/**
	  * Will verify the credentials that a person uses to log in to the platform
	  *
	  * @param $username - the username to check
	  * @param $password - the password associated with the user name
	  * @return a boolean indicating whether the username exists and the password
	  * 		corresponds to that user name
	  *
	  * @author kinsho
	  */
	public function checkCredentials($username = '', $password = '')
	{
		// Prepare the SQL query that will be used within this function
		$this->prepareStatement(self::CHECK_CREDENTIALS_KEY, self::CHECK_CREDENTIALS);

		$this->loadAndExecutePreparedQuery(self::CHECK_CREDENTIALS_KEY, array($username, $password));

		if ($this->areThereResults())
		{
			// Set the user record into the session object for future referencing
			$_SESSION['userSession'] = $this->fetchNextRecord();

			return true;
		}

		return false;
	}

	/**
	  * Will verify the e-mail address that a person will need to supply in order to
	  * reset their user name/password combination in the event that he forgets either one
	  *
	  * @param $email - the email to check
	  * @return a boolean indicating whether the email address exists
	  *
	  * @author kinsho
	  */
	public function checkEmail($email = '')
	{
		$this->loadAndExecutePreparedQuery(self::CHECK_EMAIL_KEY, array($email));

		return $this->areThereResults();
	}

	/**
	  * Will verify the e-mail address that a person will need to supply in order to
	  * reset their user name/password combination in the event that he forgets either one
	  *
	  * @param $email - the email to check
	  * @return a boolean indicating whether the email address exists
	  *
	  * @author kinsho
	  */
	public function checkForTemporaryPassword($username = '')
	{
		$this->loadAndExecutePreparedQuery(self::CHECK_EMAIL_KEY, array($email));

		return $this->areThereResults();
	}

	/**
	  * Fetch the user name given the passed e-mail address
	  *
	  * @param $email - the email to use with which to fetch the e-mail
	  * @return the user name associated with the passed e-mail address
	  *
	  * @author kinsho
	  */
	public function fetchUserNameFromEmail($email = '')
	{
		$this->loadAndExecutePreparedQuery(self::FETCH_USERNAME_FROM_EMAIL_ADDRESS_KEY, array($email));

		return ($this->areThereResults() ? $this->fetchNextRecord()['userName'] : '');
	}

	/**
	 * Verifies that no more than three temporary password e-mails have been sent out
	 * to the passed e-mail address as of the current moment
	 *
	 * @param $email - the e-mail address to test
	 * @return a boolean indicating whether more then three e-mails have been sent to the
	 * 		 	passed e-mail address
	 *
	 * @author kinsho
	 */
	public function testNumberOfRequestsMade($email = '')
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

			return ( ($numOfRequests <= 3) || ($daysPassed > 0) );
		}

		return true;
	}

	/**
	  * Inserts a new temporary password into the database for the user if none exists. If a temporary
	  * password does exist, update the record with a new password
	  *
	  * @param $email - the email to use with which to fetch the e-mail
	  * @return the user name associated with the passed e-mail address
	  *
	  * @author kinsho
	  */
	public function createOrUpdateTempKey($email = '')
	{
		$username = $this->fetchUserNameFromEmail($email);

		$this->loadAndExecutePreparedQuery(self::CHECK_FOR_TEMP_PASSWORD_KEY, array($username));

		$tempPassword = hash('MD5', rand());

		if ($this->areThereResults())
		{
			$numOfRequests = $this->fetchNextRecord()['numOfRequests'];
			$incrementedNumOfRequests = (intval($numOfRequests) > 3 ? 1 : intval($numOfRequests) + 1);

			$this->loadAndExecutePreparedQuery( self::UPDATE_TEMP_PASSWORD_KEY, array($tempPassword, $incrementedNumOfRequests, $username) );
		}
		else
		{
			$this->loadAndExecutePreparedQuery(self::CREATE_TEMP_PASSWORD_KEY, array($username, $tempPassword));		
		}
	}

	/**
	  * Generates a cookie and stores all information related to the newly generated cookie within the database, for security reasons
	  *
	  * @param $username - the user name for which to generate a cookie
	  *
	  * @author kinsho
	  */
	public function generateCookie($username)
	{
		// Prepare the SQL query that will be used in this function
		$this->prepareStatement(self::CREATE_UPDATE_LOG_IN_COOKIE_KEY, self::CREATE_UPDATE_LOG_IN_COOKIE);

		// Generate the random numbers to secure the cookie
		$seriesId = hash('MD5', rand());
		$tokenId = hash('MD5', rand());

		// Store the cookie information into the server for future validation purposes
		$this->loadAndExecutePreparedQuery( self::CREATE_UPDATE_LOG_IN_COOKIE_KEY, array($username, $seriesId, $tokenId, $tokenId) );

		// Generate the actual cookie to send back to the user
		setcookie('OwlStakesA', $username.'|'.$seriesId.'|'.$tokenId, time() + (60 * 60 * 24 * 120), '/', '', true);
	}
}
?>