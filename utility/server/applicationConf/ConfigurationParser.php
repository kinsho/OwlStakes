<?php

/*
 * Class responsible for parsing apart the configuration settings and applying the correct
 * ones depending on the server environment
 *
 * @author kinsho
 */
class ConfigurationParser
{
	const INI_FILE_NAME = 'application.ini';
	const INI_FILE_LOCATION = APP_ROOT;

	// -------- CLASS MEMBERS -------------

	protected static $iniSettings = array(); // Array that will contain all the application-specific settings

	// ------- UTILITY FUNCTIONS ----------

	/**
	  * Function initiates the iniSettings array, if it hasn't already been initiated
	  *
	  * @author kinsho
	  */
	public static function initiateConfigurationsArray()
	{
		if ( empty(self::$iniSettings) )
		{
			$fileSettings = parse_ini_file((self::INI_FILE_LOCATION . self::INI_FILE_NAME), true);
			$remoteAddress = $_SERVER['REMOTE_ADDR'];

			// Make sure to pick the correct set of application settings depending on the server environment
			if ($remoteAddress = '127.0.0.1')
			{
				self::$iniSettings = $fileSettings['local'];
			}
			else
			{
				self::$iniSettings = $fileSettings['prod'];		
			}
		}
	}

	// --------- ACCESSOR FUNCTION -----------

	/**
	  * Function can retrieve any value within the INI settings file
	  *
	  * @param $fieldName - the name of the field whose value needs to be retrieved
	  * @return the configuration value associated with the passed field name
	  *
	  * @author kinsho
	  */
	public static function getSetting($fieldName)
	{
		if ( !(empty(self::$iniSettings)) )
		{
			return array_key_exists($fieldName, self::$iniSettings) ? self::$iniSettings[$fieldName] : '';
		}
		else
		{
			return 'ERROR: iniSettings has not been instantiated';
		}
	}
}
?>