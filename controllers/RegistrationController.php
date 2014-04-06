<?php

REQUIRE 'foundation/BaseController.php';

REQUIRE '/../models/registration/RegistrationModel.php';
REQUIRE '/../mailers/confirmationMailer.php';

/**
  * The controller class for the stats page
  *
  * @author kinsho
  */
class RegistrationController extends BaseController
{
	const GENERIC_NAME = 'registration';

	const REGISTER_ACTION_SUCCESS_HEADER = "You're almost done!";
	const REGISTER_ACTION_SUCCESS_MESSAGE = "We've sent an e-mail to the e-mail address you listed above in order to confirm your e-mail address.
										     Please go to %s, open up that e-mail, and click on the link within to activate your account.
											 If you do not see the e-mail in your inbox, check your spam folder. If it's not even in your spam folder,
											 have a beer and check your inbox/spam folder again after ten minutes.";


	protected static $ESPs = array
	(
		'@gmail.com' => 'http://www.gmail.com',
		'@outlook.com' => 'http://www.outlook.com',
		'@hotmail.com' => 'http://www.hotmail.com',
		'@yahoo.com' => 'http://www.yahoo.com'
	);

	protected static $userFriendlyEmailServiceNames = array
	(
		'@gmail.com' => 'Gmail',
		'@outlook.com' => 'Outlook Mail',
		'@hotmail.com' => 'Live Mail',
		'@yahoo.com' => 'Yahoo! Mail'
	);

	public static function initPage()
	{
		parent::initPage();
	}

	/**
	  * The action method that is triggered whenever a new account is ready to be
	  * validated and saved into the database
	  *
	  * @author kinsho
	  */
	public static function registerAction()
	{
		// Prepare POST parameters array
		$params = parent::convertPOST();

		// Initiate the connection to the database
		$registrationDAO = new RegistrationDAO();

		// Instantiate a Registration Bean and validate all parameters
		$regBean = new RegistrationModel();
		$regBean->populateAndValidate($params);

		// Retrieve any response that may have to be displayed to the user
		$results = $regBean->retrieveErrors();

		// Instantiate a Confirmation Mailer which is going to be used to send an account confirmation e-mail to the user
		$mailer = new ConfirmationMailer();

		if ( empty($results['errors']) )
		{
			// Store all the user's data into the database
			$registrationDAO->createNewUser($regBean);

			// Store a confirmation hash in the database and put that hash into an e-mail that will soon be sent
			$hash = $registrationDAO->setConfirmationHash( $regBean->getUsername(), $regBean->getPassword() );

			// Send a confirmation e-mail to verify the e-mail address
			$mailer->sendConfirmMail($regBean->getEmail(), $hash, $regBean->getFirstName(), $regBean->getLastName());

			$results = $mailer->retrieveErrorMessages();

			if ( empty($results['errors']) )
			{
				$results['successHeader'] = self::REGISTER_ACTION_SUCCESS_HEADER;
				$results['successMessage'] = str_replace('%s', self::linkToESP($regBean->getEmail()), self::REGISTER_ACTION_SUCCESS_MESSAGE);
			}
		}

		parent::sendHTTPResponse($results);
	}

	/**
	  * In case registration of a new account is successful, this function sets up a
	  * link to the new user's e-mail service provider that will be placed within the
	  * success message that is relayed to the client.
	  *
	  * @param $emailAddress - the e-mail address that will be checked in order to determine
	  *						   the ESP
	  * @return a string containing the URL to the ESP landing page or a generic message informing
	  * 		the user to go to his ESP
	  *
	  * @author kinsho
	  */
	private static function linkToESP($emailAddress)
	{
		foreach (self::$ESPs as $searchTerm => $link)
		{
			if (strpos($emailAddress, $searchTerm) !== false)
			{
				return '<a href='.$link.'>'.self::$userFriendlyEmailServiceNames[$searchTerm].'</a>';
			}
		}

		return 'your e-mail service provider';
	}
}
?>