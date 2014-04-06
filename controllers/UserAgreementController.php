<?php

REQUIRE_ONCE 'foundation/BaseController.php';
REQUIRE_ONCE '/../DAO/RegistrationDAO.php';

/**
  * The controller class for the user agreement page
  *
  * @author kinsho
  */
class UserAgreementController extends BaseController
{
	const GENERIC_NAME = 'userAgreement';

	const ACCEPT_ACTION_SUCCESS_HEADER = 'Account Activated!';
	const ACCEPT_ACTION_SUCCESS_MESSAGE = 'Now go ahead and log in using the sign-in area on the left.';

	public static function initPage()
	{
		global $view;
		$regDAO = new RegistrationDAO();

		// Test to make sure the user did not access this page directly, but was redirected properly
		// Also prevent the server from executing any more code if the server cannot store cookies on the client.
		// Make sure to inform the user that cookie storage has to be enabled
		if (self::wasPageAccessedViaRedirection())
		{
			parent::blockIfNoCookiesAllowed();

			// Ensure that the user has not already signed off on the user agreement
			$confirmStatus = $regDAO->checkAccountActivationStatus($_SESSION['userId']);
			$view->alreadyAgreed = ($confirmStatus['active'] === 2 ? true : false);
		}

		parent::initPage();
	}

	public static function acceptAction()
	{
		$regDAO = new RegistrationDAO();
		$results = array();

		// Restart the session
		session_start();

		$regDAO->activateAccount($_SESSION['userId']);
		$results['successHeader'] = self::ACCEPT_ACTION_SUCCESS_HEADER;
		$results['successMessage'] = self::ACCEPT_ACTION_SUCCESS_MESSAGE;

		parent::sendHTTPResponse($results);
	}

	/** 
	  *	
	  * Function checks to see if the client accessed this page only by clicking on
	  * the account confirmation link
	  *
	  * @return a boolean value indicating whether the page was accessed through the confirmation link
	  *
	  * @author kinsho
	  */
	protected static function wasPageAccessedViaRedirection()
	{
		global $view;

		$view->accessedViaRedirection = ( (strpos($_SERVER['SCRIPT_URL'], 'confirmation') !== false) ? true : false );

		return $view->accessedViaRedirection;
	}
}
?>