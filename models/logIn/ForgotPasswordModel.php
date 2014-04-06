<?php

REQUIRE_ONCE '/../foundation/ValidationModel.php'; 
REQUIRE_ONCE '/../../DAO/LogInDAO.php'; 

/**
  * Class that will store all data for log-in and password requests
  *
  * @author kinsho
  */
class ForgotPasswordModel extends ValidationModel
{
	protected $errorMessages = array
	(
		'emailEmpty' => "Please type in an e-mail address.",
		'emailImproper' => "This is not a valid e-mail address!",
		'noAccountExists' => "We have no record of that e-mail address in our systems. Please double-check that you typed it correctly.",
		'tooManyEmailsSent' => "We're not going to send out any more e-mails. We've already sent out three e-mails. You should be good to go, buddy.",
	);

	protected $requiredFields = array
	(
		'email'
	);

	// -------- CLASS MEMBERS -------------

	protected $email = '';

	protected $DAO;

	// --------- CONSTRUCTOR --------------

	public function __construct ()
	{
		// Initiate the connection to the database
		$this->DAO = new LogInDAO();

		return $this;
	}

	// ------- ACCESSOR/VALIDATION FUNCTIONS --------------

	public function getEmail() 
	{
		return $this->email;
	}

	protected function setEmail($val)
	{
		$validators = array
		(
			$this->validateField($val, '', 'ValidationModel::isValidEmail', $this->errorMessages['emailImproper']),
			$this->validateField($val, '', array($this, 'verifyEmailAddress'), $this->errorMessages['noAccountExists']),
			$this->validateField($val, '', array($this, 'testNumberOfRequestsMade'), $this->errorMessages['tooManyEmailsSent'])
		);

		return $this->genericSetter(trim($val), $validators, __FUNCTION__, false);
	}

	/**
	 * Verifies that the e-mail address exists in the database
	 *
	 * @param $email - the e-mail address to test
	 * @return a boolean indicating whether the e-mail address exists within the database
	 *
	 * @author kinsho
	 */
	protected function verifyEmailAddress($email)
	{
		if ( !($email) )
		{
			return true;
		}

		return $this->DAO->checkEmail($email);
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
	protected function testNumberOfRequestsMade($email)
	{
		if ( !($email) )
		{
			return true;
		}

		return $this->DAO->testNumberOfRequestsMade($email);
	}

}
?>