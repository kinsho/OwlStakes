<?php

REQUIRE '/../foundation/ValidationModel.php'; 
REQUIRE '/../../DAO/RegistrationDAO.php'; 

/**
  * Class that will serve to store and validate all data on the registration form.
  *
  * @author kinsho
  */
class RegistrationModel extends ValidationModel
{
	protected $errorMessages = array
	(
		'firstNameImproper' => 'Please take out any non-alphabetical characters in your first name. We realize 
						your name might contain non-traditional characters (like apostrophes, for example,) but
						our system does not allow us to tolerate any non-traditional characters in your name.
						Use spaces instead!',
		'firstNameEmpty' => "You must put in your first name so that we can verify your identity if you win.",

		'lastNameImproper' => 'Please take out any non-alphabetical characters in your last name. We realize 
						your name might contain non-traditional characters (like dashes, for example) but 
						our system does not allow us to tolerate any non-traditional characters in your name. 
						Use spaces instead!',
		'lastNameEmpty' => "You must put in your last name so that we can verify your identity if you win.",

		'addressImproper' => 'We detected a few strange symbols in your address. Your address should only consist 
					 of letters, numbers, apostrophes, and periods.',
		'addressEmpty' => "You must put in your full address so that we can verify that you live within the United States.",
					 
		'cityImproper' => 'Please take out any non-alphabetical characters in your city name. We do accept apostrophes and 
				  spaces, but no other non-traditional character.',
		'cityEmpty' => "You must put in your full address so that we can verify that you live within the United States.",

		'stateEmpty' => "You must put in your full address so that we can verify that you live within the United States.",

		'usernameImproper' => 'Please make sure that your user name only consists of alphabetical characters, numerical 
					  characters, and spaces.',
		'usernameEmpty' => 'You must create a user name to participate in this contest.',
		'usernameAlreadyExists' => 'We already have somebody else that took the user name you typed in! Please type in
							another user name.',

		'birthMonthEmpty' => 'You must put in your full birth date so that we can determine whether you are eligible to sign up for this contest.',
		'birthDateEmpty' => 'You must put in your full birth date so that we can determine whether you are eligible to sign up for this contest.',
		'birthYearEmpty' => 'You must put in your full birth date so that we can determine whether you are eligible to sign up for this contest.',
		'notOldEnough' => 'We apologize, but you are not old enough to participate in this contest. Please come back next year and try to register again!',

		'passwordImproper' => 'Please make sure that your password only consists of alphabetical characters, numbers, and spaces.',
		'passwordEmpty' => 'You have to create a password for your user name.  Please make sure that you put the same password in the two password fields above.',
		'passwordsNoMatch' => "Please make sure that whatever you typed in the two password fields above match. 
							Right now, they do not match.",

		'confirmPasswordEmpty' => 'You have to create a password for your user name.  Please make sure that you put the same password in the two password fields above.',

		'emailEmpty' => 'You have to put in an e-mail address that we can use to contact you.',
		'emailImproper' => 'Your e-mail address that you put in above is too strange for our liking. Please 
								  make sure that your e-mail meets the following standards: <br />
								  <ul>
									  <li>A proper domain is specified <i>(e.g. yahoo.com, aol.com, gmail.com, etc)</i></li>
									  <li>The @ symbol is used once and only once</li>
									  <li>Your e-mail name precedes the domain <i>(e.g. yourEmailName@domain.com)</u></li>
								  </ul>'
	);

	protected $requiredFields = array
	(
		'address',
		'city',
		'state',
		'birthMonth',
		'birthDate',
		'birthYear',
		'username',
		'password',
		'confirmPassword',
		'email'
	);

	// -------- CLASS MEMBERS -------------

	protected $firstName = '';
	protected $lastName = '';
	protected $address = '';
	protected $city = '';
	protected $state = '';
	protected $birthMonth = '';
	protected $birthDate = '';
	protected $birthYear = '';
	protected $username = '';
	protected $password = '';
	protected $confirmPassword = '';
	protected $email = '';
	
	protected $DAO;

	// --------- CONSTRUCTOR --------------

	
	public function __construct ()
	{
		// Initiate the connection to the database
		$this->DAO = new RegistrationDAO();

		return $this;
	}

	// ------- ACCESSOR/VALIDATION FUNCTIONS --------------

	public function getFirstName() 
	{
		return $this->firstName;
	}

	protected function setFirstName($val)
	{
		$validators = array
		(
			$this->validateField($val, '', 'ValidationModel::assessAlphaWithSpaces', $this->errorMessages['firstNameImproper'])
		);

		return $this->genericSetter($val, $validators, __FUNCTION__, false);
	}

	public function getLastName() 
	{
		return $this->lastName;
	}

	protected function setLastName($val)
	{
		$validators = array
		(
			$this->validateField($val, '', 'ValidationModel::assessAlphaWithSpaces', $this->errorMessages['lastNameImproper'])
		);

		return $this->genericSetter($val, $validators, __FUNCTION__, false);
	}

	public function getAddress() 
	{
		return $this->address;
	}

	protected function setAddress($val)
	{
		$validators = array
		(
			$this->validateField($val, '', 'ValidationModel::assessAlnumWithSpacesAndPunctuation', $this->errorMessages['addressImproper'])
		);

		return $this->genericSetter($val, $validators, __FUNCTION__, false);
	}

	public function getCity()
	{
		return $this->city;
	}

	protected function setCity($val)
	{
		$validators = array
		(
			$this->validateField($val, '', 'ValidationModel::assessAlphaWithSpacesAndPunctuation', $this->errorMessages['cityImproper'])
		);

		return $this->genericSetter($val, $validators, __FUNCTION__, false);
	}

	public function getState() 
	{
		return $this->state;
	}

	protected function setState($val)
	{
		$validators = array();

		return $this->genericSetter($val, $validators, __FUNCTION__, false);
	}

	public function getBirthMonth() 
	{
		return $this->birthMonth;
	}

	protected function setBirthMonth($val)
	{
		$validators = array();

		return $this->genericSetter($val, $validators, __FUNCTION__, true);
	}

	public function getBirthDate() 
	{
		return $this->birthDate;
	}

	protected function setBirthDate($val)
	{
		$validators = array();

		return $this->genericSetter($val, $validators, __FUNCTION__, true);
	}

	public function getBirthYear() 
	{
		return $this->birthYear;
	}

	protected function setBirthYear($val)
	{
		$validators = array
		(
			$this->validateField($val, '', 'RegistrationModel::isOldEnough', $this->errorMessages['notOldEnough'], array($this->birthMonth, $this->birthDate))
		);

		return $this->genericSetter($val, $validators, __FUNCTION__, true);
	}

	public function getUsername() 
	{
		return $this->username;
	}

	protected function setUsername($val)
	{
		$validators = array
		(
			$this->validateField($val, '', 'ValidationModel::assessAlnumWithSpaces', $this->errorMessages['usernameImproper']),
			$this->validateField($val, '', array($this, 'doesUserNameAlreadyExist'), $this->errorMessages['usernameAlreadyExists']),
		);

		return $this->genericSetter($val, $validators, __FUNCTION__, false);
	}

	public function getPassword() 
	{
		return $this->password;
	}

	protected function setPassword($val)
	{
		$validators = array
		(
			$this->validateField(trim($val), '', 'ValidationModel::assessAlnumWithSpaces', $this->errorMessages['passwordImproper'])
		);

		return $this->genericSetter(hash('MD5', trim($val)), $validators, __FUNCTION__, false);
	}

	public function getConfirmPassword() 
	{
		return $this->confirmPassword;
	}

	protected function setConfirmPassword($val)
	{
		$validators = array
		(
			$this->validateField($val, '', 'RegistrationModel::doPasswordsMatch', $this->errorMessages['passwordsNoMatch'], array($this->password))
		);

		return $this->genericSetter(hash('MD5', $val), $validators, __FUNCTION__, false);
	}

	public function getEmail() 
	{
		return $this->email;
	}

	protected function setEmail($val)
	{
		$validators = array
		(
			$this->validateField($val, '', 'ValidationModel::isValidEmail', $this->errorMessages['emailImproper'])
		);

		return $this->genericSetter($val, $validators, __FUNCTION__, false);
	}

	// ------- SPECIALIZED VALIDATION FUNCTIONS --------

	/**
	  * Determines whether the two password fields have matching values.
	  * 
	  * @param $password - the value in the password field
	  * @param $confirmPassword - the value in the password confirmation field  
	  * @returns a boolean indicating whether the two passwords match 
	  *
	  * @author kinsho
	  */

    protected static function doPasswordsMatch($password, $confirmPassword)
	{
		return $password === $confirmPassword;
	}

	/**
	  * Determines whether the user is old enough to participate in the contest
	  * using the birth date that was posted to the server
	  *
	  * @param $year - the user's birth year
	  * @param $month - the user's birth month
	  * @param $date - the user's birth date
	  *
	  * @returns a boolean indicating whether e-mail address is indeed valid 
	  *
	  * @author kinsho
	  */
	protected static function isOldEnough($year, $month, $date)
	{
		if ( !($year) || !($month) || !($date) )
		{
			return true;
		}

		$timeZone = new dateTimeZone('UTC');
		$currentTime = new DateTime('now', $timeZone);
		$birthDate = new DateTime($year.'-'.$month.'-'.$date, $timeZone);
		$userAge = $currentTime->diff($birthDate, true)->format('%y');

		return (intval($userAge) >= 18);
	}

	protected function doesUserNameAlreadyExist($username)
	{
		if ( !($username) )
		{
			return true;
		}

		return $this->DAO->verifyUserName($username);
	}

}



?>