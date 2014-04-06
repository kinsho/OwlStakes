<?php

REQUIRE_ONCE 'BaseController.php';

/**
  * The controller class for the page that'll inform the user that cookies have to be enabled for this site
  *
  * @author kinsho
  */
class NoCookiesController extends BaseController
{
	const VIEW_FILE = 'noCookies';

	public static function initPage()
	{
		parent::initPage();
		exit();
	}
}
?>