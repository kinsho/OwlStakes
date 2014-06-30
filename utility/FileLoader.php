<?php
$TOS_INCLUDED_FILES = array(); // a global array to keep track of pulled files

/**
  * A globally accessible function to replace PHP's native (and computational expensive)
  * REQUIRE_ONCE functionality.
  *
  * @author kinsho
  */
function TOS_REQUIRE_ONCE($fileName)
{
	global $TOS_INCLUDED_FILES;

	// Only pull the file if it has not been pulled out before
	if( !(in_array($fileName, $TOS_INCLUDED_FILES)) )
	{
		try
		{
			if (file_exists(APP_ROOT . $fileName))
			{
				$TOS_INCLUDED_FILES[] = $fileName;
				REQUIRE (APP_ROOT . $fileName);
			}
			else
			{
				throw new Exception('Unable to find ' . APP_ROOT . $fileName);
			}
		}
		catch (Exception $ex)
		{
			echo $ex->getMessage() . '<br /><br />';
			echo ( implode('<br />', (explode('#', $ex->getTraceAsString())) ) );
			exit();
		}
	}
}
?>