<?php

REQUIRE_ONCE 'BaseController.php';

/**
  * The controller class for the page that'll inform the user that he has to be logged in to access certain parts of the site
  *
  * @author kinsho
  */
class NotLoggedInController extends BaseController
{
	const VIEW_FILE = 'notLoggedIn';

	public static function initPage()
	{
		parent::initPage();
		exit();
	}
}
?>