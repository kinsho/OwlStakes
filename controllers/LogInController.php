<?php

TOS_REQUIRE_ONCE('controllers/foundation/BaseController.php');

TOS_REQUIRE_ONCE('models/login/LogInModel.php');
TOS_REQUIRE_ONCE('models/login/ForgotPasswordModel.php');

TOS_REQUIRE_ONCE('DAO/LogInDAO.php');

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
	const FORGOT_PASSWORD_EMAIL_SENT = 'An e-mail has been sent to the address that you typed. The e-mail contains your user name and
							instructions on how to reset your password. Go check your e-mail!';

	/**
	  * The action method that is triggered whenever a user attempts to log in to his account
	  *
	  * @author kinsho
	  */
	public static function logInAction()
	{
		// Prepare POST parameters array
		$params = parent::convertPOST();

		// Find out if the user has requested that the system remembers his log-in credentials for some time
		// Also ensure that the flag that relays that info is deleted from the parameters array before it is validated
		$rememberMe = $params['rememberMe'];
		unset($params['rememberMe']);

		// Ready the session
		parent::startSession();

		// Instantiate a LogIn Bean and validate the user name and the password that the user typed in
		// Validation would also handle the setting of the user's information within the session
		$logInBean = new LogInModel($params);

		// If the user requested the system to remember him, set up a cookie to enable this
		if ($rememberMe === 'true')
		{
			$logInDAO = new LogInDAO();
			$logInDAO->generateCookie($params['username']);
		}

		// Generate a response here and send the user name back to the client
		$results['username'] = $params['username'];
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

		// Fetch the user name of the current user from the session object for later use
		$username = $_SESSION[BaseController::SESSION_USER_LABEL]['userName'];

		// Then wipe the session from the face of this earth
		session_unset();
		session_destroy();
		session_write_close();
		session_regenerate_id(true);

		// Destroy all the cookies as well
		if ( isset($_COOKIES) )
		{
			foreach ($_COOKIES as $c_id => $c_value)
			{
				setcookie($c_id, NULL, time() - 3600, "/");
			}
		}

		$logInDAO = new LogInDAO();
		$logInDAO->killLogInCookie($username);

		// Send back a heads-up to the client for notification purposes
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