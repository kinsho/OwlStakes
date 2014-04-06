<?php

REQUIRE_ONCE 'foundation/BaseController.php';

REQUIRE_ONCE '/../models/login/LogInModel.php';
REQUIRE_ONCE '/../models/login/ForgotPasswordModel.php';

REQUIRE_ONCE '/../DAO/LogInDAO.php';

/**
  * The controller class for the log in module
  * Notice that this controller does not have any init page method. All interactions with this controller are done through AJAX
  *
  * @author kinsho
  */
class LogInController extends BaseController
{
	const LEFT_HAND_MENU_CONTENTS_FILENAME = '/views/foundation/leftHandMenuItems.phtml';

	const FORGOT_PASSWORD_EMAIL_SENT_HEADER = 'E-mail Sent!';
	const FORGOT_PASSWORD_EMAIL_SENT = 'An e-mail has been sent to the above address that contains your user name and
										will show you how to reset your password. Go check your e-mail!';

	/**
	  * The action method that is triggered whenever a user attempts to log in to his account
	  *
	  * @author kinsho
	  */
	public static function logInAction()
	{
		// Prepare POST parameters array
		$params = parent::convertPOST();

		// Find out if the user has requested the system remembers his log-in credentials for some time
		// Also ensure that the flag that relays that info is deleted from the parameters array before it is validated
		$rememberMe = $params['rememberMe'];
		unset($params['rememberMe']);

		// Ready the session
		parent::startSession();

		// Instantiate a LogIn Bean and validate all parameters
		$logInBean = new LogInModel();
		$logInBean->populateAndValidate($params);

		// Retrieve any response that may have to be displayed to the user
		$results = $logInBean->retrieveErrors();

		if ( empty($results['errors']) )
		{
			$logInDAO = new LogInDAO();

			if ($rememberMe)
			{
				$logInDAO->generateCookie($params['username']);
			}

			$results['username'] = $params['username'];
		}

		parent::sendPositiveHTTPResponse($results);
	}

	/**
	  * The action method triggered to log a user out of the platform
	  *
	  * @author kinsho
	  */
	public static function logOutAction()
	{
		// Ready the session
		parent::startSession();

		// Completely wipe the session from the face of this earth
		session_unset();
		session_destroy();
		session_write_close();
		setcookie(session_name(),'',0,'/');
		session_regenerate_id(true);

		parent::sendPositiveHTTPResponse();
	}

	public static function forgotPasswordAction()
	{
		// Prepare POST parameters array
		$params = parent::convertPOST();

		// Instantiate a LogIn Bean and validate all parameters
		$forgotPasswordBean = new ForgotPasswordModel();
		$forgotPasswordBean->populateAndValidate($params);		

		// Retrieve any response that may have to be displayed to the user
		$results = $forgotPasswordBean->retrieveErrors();

		if ( empty($results['errors']) )
		{
			$logInDAO = new LogInDAO();

			$logInDAO->createOrUpdateTempKey($forgotPasswordBean->getEmail());
			$results['successMessage'] = (self::FORGOT_PASSWORD_EMAIL_SENT);
			$results['successHeader'] = (self::FORGOT_PASSWORD_EMAIL_SENT_HEADER);
		}

		parent::sendPositiveHTTPResponse($results);
	}
}
?>