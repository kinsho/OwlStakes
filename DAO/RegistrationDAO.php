<?php

REQUIRE 'foundation/BaseDAO.php';

/**
  * Specialized DAO class for registration page
  *
  * @author kinsho
  */
class RegistrationDAO extends BaseDAO
{
	// -------- CLASS MEMBERS -------------

	const SEARCH_USER_NAME_KEY = 'searchUserName';
	const SEARCH_USER_NAME = 'SELECT U.id FROM users U WHERE U.username = ?';
	const INSERT_CONFIRMATION_HASH_KEY = 'insertConfirmationHash';
	const INSERT_CONFIRMATION_HASH = 'INSERT INTO confirms VALUES((SELECT U.id FROM users U WHERE U.username = ?), ?, null, null)';
	const CREATE_NEW_USER_KEY = 'createNewUser';
	const CREATE_NEW_USER = 'INSERT INTO users VALUES(null, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, null, null, 0)';
	const CHECK_CONFIRMATION_HASH_KEY = 'checkConfirmationHash';
	const CHECK_CONFIRMATION_HASH = 'SELECT C.userId FROM confirms C WHERE C.confirmHash = ?';
	const CHECK_ACCOUNT_ACTIVE_CODE_KEY = 'checkAccountActiveCode';
	const CHECK_ACCOUNT_ACTIVE_CODE = 'SELECT U.active FROM users U WHERE U.id = ?';
	const TEMPORARILY_ACTIVATE_USER_KEY = 'temporarilyActivateUser';
	const TEMPORARILY_ACTIVATE_USER = 'UPDATE users U SET U.active = 1 WHERE U.id = ?';
	const ACTIVATE_USER_KEY = 'activateUser';
	const ACTIVATE_USER = 'UPDATE users U SET U.active = 2 WHERE U.id = ?';

	// --------- CONSTRUCTOR --------------

	public function __construct ()
	{
		$this->openConnection();
		$this->openDatabase();

		// Prepare all the MySQL queries for future execution
		$this->prepareStatement(self::SEARCH_USER_NAME_KEY, self::SEARCH_USER_NAME);
		$this->prepareStatement(self::INSERT_CONFIRMATION_HASH_KEY, self::INSERT_CONFIRMATION_HASH);
		$this->prepareStatement(self::CREATE_NEW_USER_KEY, self::CREATE_NEW_USER);
		$this->prepareStatement(self::CHECK_CONFIRMATION_HASH_KEY, self::CHECK_CONFIRMATION_HASH);
		$this->prepareStatement(self::CHECK_ACCOUNT_ACTIVE_CODE_KEY, self::CHECK_ACCOUNT_ACTIVE_CODE);
		$this->prepareStatement(self::TEMPORARILY_ACTIVATE_USER_KEY, self::TEMPORARILY_ACTIVATE_USER);
		$this->prepareStatement(self::ACTIVATE_USER_KEY, self::ACTIVATE_USER);

		return $this;
	}

	// ------- FUNCTIONS -----------

	/**
	  * Will insert a new user's data into the database
	  * 
	  * @param $regBean - a Registration model bean that contains all of that user's data
	  *
	  * @author kinsho
	  */
	public function createNewUser($regBean)
	{
		$data = array();

		$data[] = $regBean->getFirstName() ? $regBean->getFirstName() : '';
		$data[] = $regBean->getLastName() ? $regBean->getLastName() : '';
		$data[] = $regBean->getAddress();
		$data[] = $regBean->getCity();
		$data[] = $regBean->getState();
		$data[] = $regBean->getBirthMonth();
		$data[] = $regBean->getBirthDate();
		$data[] = $regBean->getBirthYear();
		$data[] = $regBean->getUsername();
		$data[] = $regBean->getPassword();
		$data[] = $regBean->getEmail();

		$this->loadAndExecutePreparedQuery(self::CREATE_NEW_USER_KEY, $data);
	}

	/**
	  * Will verify whether the passed user name already exists within the database
	  * 
	  * @param $username - the username that will be tested here
	  * @return a boolean indicating whether the username does NOT exist within the database
	  *
	  * @author kinsho
	  */
	public function verifyUserName($username)
	{
		$this->loadAndExecutePreparedQuery(self::SEARCH_USER_NAME_KEY, array($username));

		return !($this->areThereResults());
	}

	/**
	  * Will prepare and insert a confirmation hash into the database
	  * 
	  * @param $username - the username that will be fed into the hash function here
	  * @param $password - the password that will be fed into the hash function here
	  * @return the hash generated using the username and password
	  *
	  * @author kinsho
	  */
	public function setConfirmationHash($username, $password)
	{
		// Prepare the hash
		$seed = rand(1, 1000).$username.rand(1, 1000).$password;
		$hash = hash('SHA256', $seed);

		// Insert the hash into the database
		$this->loadAndExecutePreparedQuery(self::INSERT_CONFIRMATION_HASH_KEY, array($username, $hash));

		return $hash;
	}

	/**
	  * Function is responsible for fetching the user ID of the account associated
	  * with the passed hash
	  * 
	  * @param $hash - the hash provided by the user himself that was used to confirm his
	  *				   e-mail address.
	  * @return the user ID of the account associated with the passed hash
	  *
	  * @author kinsho
	  */
	public function fetchUserFromHash($hash)
	{
		$this->loadAndExecutePreparedQuery(self::CHECK_CONFIRMATION_HASH_KEY, array($hash));

		return ( $this->fetchNextRecord(array('userId')) );
	}

	/**
	  * Function is responsible for checking how far an account has been activated
	  * 
	  * @param $userId - the ID of the user whose account activation status has to be checked
	  * @return the activation code on the user's account
	  *
	  * @author kinsho
	  */
	public function checkAccountActivationStatus($userId)
	{
		$this->loadAndExecutePreparedQuery(self::CHECK_ACCOUNT_ACTIVE_CODE_KEY, array($userId));
	
		return ( $this->fetchNextRecord(array('active')) );
	}

	/**
	  * Function is responsible for ~fully~ activating user accounts
	  * 
	  * @param $userId - the ID of the user that needs to have his account activated
	  *
	  * @author kinsho
	  */
	public function temporarilyActivateAccount($userId)
	{
		$this->loadAndExecutePreparedQuery(self::TEMPORARILY_ACTIVATE_USER_KEY, array($userId));
	}

	/**
	  * Function is responsible for ~fully~ activating user accounts
	  * 
	  * @param $userId - the ID of the user that needs to have his account activated
	  *
	  * @author kinsho
	  */
	public function activateAccount($userId)
	{
		$this->loadAndExecutePreparedQuery(self::ACTIVATE_USER_KEY, array($userId));
	}
}
?>