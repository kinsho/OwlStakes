<?php

REQUIRE_ONCE 'foundation/BaseController.php';

/**
  * The controller class for the progress page
  *
  * @author kinsho
  */

	class ProgressController extends BaseController
	{
		const GENERIC_NAME = 'progress';

		public static function initPage()
		{
			parent::blockIfNotLoggedIn();

			parent::initPage();
		}
	}
?>