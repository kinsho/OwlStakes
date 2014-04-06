<?php

REQUIRE_ONCE '/../foundation/ValidationModel.php'; 
REQUIRE_ONCE '/../../DAO/LogInDAO.php'; 

/**
  * Class that will store all data for log-in and password requests
  *
  * @author kinsho
  */
class LogInModel extends ValidationModel
{
	protected $errorMessages = array
	(
		'usernameEmpty' => "Please type in a user name.",

		'passwordEmpty' => "Please type in a password.",

		'accessDenied' => "We do not recognize that user name/password combination. Try again, perhaps?"
	);

	protected $requiredFields = array
	(
		'username',
		'password'
	);

	// -------- CLASS MEMBERS -------------

	protected $username = '';
	protected $password = '';
	protected $rememberMe = false;

	protected $DAO;

	// --------- CONSTRUCTOR --------------

	public function __construct ()
	{
		// Initiate the connection to the database
		$this->DAO = new LogInDAO();

		return $this;
	}

	// ------- ACCESSOR/VALIDATION FUNCTIONS --------------

	public function getUserName() 
	{
		return $this->username;
	}

	protected function setUsername($val)
	{
		$validators = array();

		return $this->genericSetter(trim($val), $validators, __FUNCTION__, false);
	}

	public function getPassword() 
	{
		return $this->lastName;
	}

	protected function setPassword($val)
	{
		$validators = array
		(
			$this->validateField(trim($val), '', array($this, 'verifyCredentials'), $this->errorMessages['accessDenied'], array($this->username)),
		);

		return $this->genericSetter(hash('MD5', trim($val)), $validators, __FUNCTION__, false);
	}

	/**
	 * Verifies that the username and password combination exists in the database
	 *
	 * @param $username - the username to test
	 * @param $password - the password to test
	 * @return a boolean indicating whether the combination exists
	 *
	 * @author kinsho
	 */
	protected function verifyCredentials($password, $username)
	{
		if ( !($username) || !($password) )
		{
			return true;
		}

		return $this->DAO->checkCredentials($username, hash('MD5', $password));
	}
}
?>