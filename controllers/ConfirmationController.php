<?php

REQUIRE 'foundation/BaseController.php';
REQUIRE 'UserAgreementController.php';
REQUIRE_ONCE '/../DAO/RegistrationDAO.php';

/**
  * The controller class for the confirmation page
  *
  * @author kinsho
  */
class ConfirmationController extends BaseController
{
	public static function initPage()
	{
		global $view;
		$regDAO = new RegistrationDAO();

		if ( count($_GET) && array_key_exists('hash', $_GET) )
		{
			$userIdRecord = $regDAO->fetchUserFromHash($_GET['hash']);
			if ( !(empty($userIdRecord)) )
			{
				// Only temporarily activate the account if it has just been registered
				$confirmStatus = $regDAO->checkAccountActivationStatus($userIdRecord['userId']);
				if ($confirmStatus['active'] === 0)
				{
					$regDAO->temporarilyActivateAccount($userIdRecord['userId']);				
				}

				// Initialize a session in order to control access to the User Agreement page
				session_start();
				$_SESSION['userId'] = $userIdRecord['userId'];

				UserAgreementController::initPage();
				exit();
			}
		}

		parent::throw404();
		return false;
	}
}
?>