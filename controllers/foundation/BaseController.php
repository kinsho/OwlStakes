<?php

// The TestGenerator class that can be used to generate test data very quickly
TOS_REQUIRE_ONCE('utility/TestGenerator.php');

// The class used to fetch all the server configuration settings
TOS_REQUIRE_ONCE('utility/ConfigurationParser.php');

// Fetch all packages that were installed via Composer
TOS_REQUIRE_ONCE('vendor/autoload.php');

// The class used to test for a cookie containing the current user's credentials
TOS_REQUIRE_ONCE('DAO/LogInDAO.php');

// Generic controllers that may be invoked to gracefully stop a particular user request
TOS_REQUIRE_ONCE('controllers/foundation/LostController.php');
TOS_REQUIRE_ONCE('controllers/foundation/NoCookiesController.php');
TOS_REQUIRE_ONCE('controllers/foundation/NotLoggedInController.php');

/**
  * The generic controller class from which all other controllers will be built upon.
  * Class provides some basic processing functions that can be used across all controllers.
  *
  * @author kinsho
  */

	class BaseController
	{
		const FOUNDATION_DIRECTORY = 'foundation';
		const LIBRARY_DIRECTORY = 'library';
		const DO_NOT_INCLUDE = '.dni';

		const VIEW_DIRECTORY = '/views/';
		const VIEW_FILE_EXTENSION = '.phtml';

		const STYLE_DIRECTORY = 'styles/CSS/';
		const STYLE_FILE_EXTENSION = '.css';

		const SCRIPTS_DIRECTORY = '/scripts/';
		const SCRIPTS_FILE_EXTENSION = '.js';
		const REQUIRE_JS_MAIN_FILE_NAME = '/main.js';

		const SESSION_USER_LABEL = 'userSession';
		const LOG_IN_COOKIE_LABEL = 'TOSCS';

		// ----------- FUNCTIONS ------------

		/*
		 * Generic initialization function that automatically takes care of all file-retrieval processing
		 * provided that certain constants are present in the child controller that invokes this method.
		 *
		 * @author kinsho
		 */
		protected static function initPage()
		{
			global $view;

			// Fetch the name of the class that invoked this function
			$childControllerName = get_called_class();

			// Pull all the library script files
			self::setScriptsFromDirectory( self::LIBRARY_DIRECTORY );

			// Pull all the library stylesheets
			self::setStylesheetsFromDirectory( self::LIBRARY_DIRECTORY );

			// If a generic name has been specified, use that name to pull all the required files.
			// Otherwise, if certain other properties within the controller have been defined, use those properties instead to fetch all required files.
			if ( defined($childControllerName.'::GENERIC_NAME') )
			{
				$view->pageName = constant($childControllerName.'::GENERIC_NAME');
				$view->requireJsMainFile = self::SCRIPTS_DIRECTORY . constant($childControllerName.'::GENERIC_NAME') . self::REQUIRE_JS_MAIN_FILE_NAME;

				self::setStylesheet( constant($childControllerName.'::GENERIC_NAME') );
				self::setScriptsFromDirectory( constant($childControllerName.'::GENERIC_NAME') );
				self::setViewsFromDirectory( constant($childControllerName.'::GENERIC_NAME') );
			}
			else
			{
				// Prepare a link to a stylesheet if one has been specified
				if ( defined($childControllerName.'::STYLE_FILE_NAME') )
				{
					self::setStylesheet( constant($childControllerName.'::STYLE_FILE_NAME') );
				}

				// Define a reference to the main controller file to link any scripts associated with the child controller
				if ( defined($childControllerName.'::SCRIPT_DIRECTORY') )
				{
					$view->requireJsMainFile = self::SCRIPTS_DIRECTORY . constant($childControllerName.'::SCRIPT_DIRECTORY') . self::REQUIRE_JS_MAIN_FILE_NAME;
				}

				// Render one view file associated with the child controller if one has been specified
				if ( defined($childControllerName.'::VIEW_FILE') )
				{
					self::setView( constant($childControllerName.'::VIEW_FILE') );
				}

				// Render all view files associated with the child controller if a directory has been specified
				if ( defined($childControllerName.'::VIEW_DIRECTORY') )
				{
					self::setViewsFromDirectory( constant($childControllerName.'::VIEW_DIRECTORY') );
				}
			}

			// Pull all the foundation script files
			self::setScriptsFromDirectory( self::FOUNDATION_DIRECTORY );

			// Pull all the foundation stylesheets
			self::setStylesheetsFromDirectory( self::FOUNDATION_DIRECTORY );

			// Render all the foundation view files
			self::setViewsFromDirectory( self::FOUNDATION_DIRECTORY, true );

			// Render the base view file that will pull all these other files together
			require('base.phtml');
		}

		/*
		 * Generic function responsible for sending a 400 HTTP response back to the client
		 *
		 * @param $data - data which needs to be sent back to the client
		 *
		 * @author kinsho
		 */
		public static function sendPositiveHTTPResponse($data = array())
		{
			echo json_encode($data);
			exit();
		}

		/*
		 * Generic function responsible for fetching the contents of a file from the file system.
		 * The purpose of the function is to provide an abstract way to fetch file contents by their
		 * file name, regardless of whether they have the .dni extension
		 *
		 * @param $filename - the local path to the file that needs to be fetched
		 * @param $fetchAsHTML - a flag indicating whether all the data from the file should be returned as pure HTML
		 * @return a string containing all the HTML contained within the file specified from the parameter
		 *
		 * @author kinsho
		 */
		public static function fetchFile($filename, $fetchAsHTML = true)
		{
			$filename = $_SERVER['DOCUMENT_ROOT'] . $filename;

			if ( !(file_exists($filename)) )
			{
				$filename = substr_replace($filename, (self::DO_NOT_INCLUDE . '.'), strrpos($filename, '.'), 1);
			}

			// Clear the cache first before attempting to read the file
			clearstatcache();
			if ($fetchAsHTML)
			{
				$fileHTML = file_exists($filename) ? file_get_contents($filename) : '';

				return $fileHTML;
			}
			else if (file_exists($filename))
			{
				include($filename);
			}
		}

		/*
		 * Generic function responsible for attaching bootstrapped data
		 *
		 * @param $data - data which needs to be bootstrapped
		 * @param $name - reference to be used to reference the data on the browser side 
		 *
		 * @author kinsho
		 */
		public static function bootstrapData($data, $name)
		{
			echo '<script>';
			echo 'if ( !(Bootstrapped) )';
			echo '{';
			echo 'var Bootstrapped = {};';			
			echo '}';
			echo 'Bootstrapped.'.$name.' = '.json_encode($data);
			echo '</script>';
		}

		/*
		 * Generic function responsible for starting the session if none has been started yet
		 *
		 * @author kinsho
		 */
		public static function startSession()
		{
			if (session_status() === PHP_SESSION_NONE)
			{
				session_start();
			}
		}

		/*
		 * Generic function responsible transferring data within the POST array over
		 * to an array specifically formatted to be readily consumed
		 *
		 * @return an array containing all the POST parameters, each denoted by the
		 * 		names associated with them when they were transferred to the server
		 *
		 * @author kinsho
		 */
		protected static function convertPOST()
		{
			$params = array();
			$specialKeywords = array
			(
				'recaptcha_challenge_field' => 'recaptchaChallenge',
				'recaptcha_response_field' => 'recaptchaResponse'
			);

			// Fetch POST values
			foreach($_POST as $name => $value)
			{
				if ( array_key_exists($name, $specialKeywords) )
				{
					$params[$specialKeywords[$name]] = $value;
				}
				else
				{
					$params[$name] = $value;
				}
			}

			return $params;
		}

		/*
		 * Utility function responsible for invoking the controller that will generate a 404 page
		 *
		 * @author kinsho
		 */
		protected static function throw404()
		{
			LostController::initPage();
		}

		/*
		 * Utility function responsible for checking to see if the client has a cookie for this site stored
		 * If not, stop everything and invoke a controller to display an error message to the user that 
		 * cookie storage must be allowed
		 *
		 * @author kinsho
		 */
		protected static function blockIfNoCookiesAllowed()
		{
			if (session_status() === PHP_SESSION_NONE)
			{
				NoCookiesController::initPage();
			}
		}

		/*
		 * Utility function responsible for checking to see if the client has a log-in cookie for this site stored.
		 * If not, stop everything and invoke a controller to display an error message to the user that 
		 * he or she must be logged in first
		 *
		 * @author kinsho
		 */
		protected static function blockIfNotLoggedIn()
		{
			self::startSession();

			// Log the user into the system if he has a proper cookie that was passed to the server and a session
			// object has not yet been instantiated containing the user's data
			if ( !(isset($_SESSION[self::SESSION_USER_LABEL])) && (isset($_COOKIE[self::LOG_IN_COOKIE_LABEL])) )
			{
				$logInDAO = new LogInDAO();
				$logInDAO->checkAndLoadCookie();
			}

			if ( !(array_key_exists('userSession', $_SESSION)) )
			{
				NotLoggedInController::initPage();				
			}
		}

		/*
		 * Generic function responsible for fetching one view file
		 *
		 * @param {String} $view - name of the view file that needs to be fetched
		 *
		 * @author kinsho
		 */
		private static function setView($clientView)
		{
			// Always pull up the $view global object so that we can store the references to the view file within it
			global $view;

			// Define the slots within the $view object that will hold all the view file references
			if ( !isset($view->contentViews) )
			{
				$view->foundationViews = array();
				$view->contentViews = array();
			}

			$view->contentViews[] = (self::VIEW_DIRECTORY.
									$clientView.self::VIEW_FILE_EXTENSION);
		}

		/*
		 * Generic function responsible for fetching all view files from a particular directory
		 *
		 * @param {String} $directory - name of the directory that contains all the view files to be fetched
		 *
		 * @author kinsho
		 */
		private static function setViewsFromDirectory($directory)
		{
			// Always pull up the $view global object so that we can store the references to the view files within it
			global $view;

			// Define the slots within the $view object that will hold all the view file references
			if ( !isset($view->contentViews) )
			{
				$view->foundationViews = array();
				$view->contentViews = array();
			}

			foreach(glob($_SERVER['DOCUMENT_ROOT'].
						 self::VIEW_DIRECTORY.
						 $directory.
						 '/*.phtml') as $html)
			{
				// As long as the file has not been specifically marked as not to be included, store an
				// reference within the view file
				if ( (strpos($html, self::DO_NOT_INCLUDE.self::VIEW_FILE_EXTENSION)) === false )
				{
					if ($directory === self::FOUNDATION_DIRECTORY)
					{
						$view->foundationViews[] = str_replace($_SERVER['DOCUMENT_ROOT'], '', $html);
					}
					else
					{
						$view->contentViews[] = str_replace($_SERVER['DOCUMENT_ROOT'], '', $html);
					}
				}
			}
		}

		/*
		 * Generic function responsible for fetching one stylesheet
		 *
		 * @param $stylesheet - name of the stylesheet that needs to be fetched
		 *
		 * @author kinsho
		 */
		private static function setStylesheet($stylesheet)
		{
			// Always reference the $view global object so that the link to the CSS file can be stored within it
			global $view;

			if ( !isset($view->css) )
			{
				$view->css = array();
			}

			$view->css[] = (self::STYLE_DIRECTORY.
						  $stylesheet.self::STYLE_FILE_EXTENSION);
		}

		/*
		 * Generic function responsible for fetching all stylesheets under a directory
		 *
		 * @param $directory - directory that contains all the stylesheets which will need to be pulled
		 *
		 * @author kinsho
		 */
		private static function setStylesheetsFromDirectory($directory)
		{
			// Always reference the $view global object so that the link to all the CSS files can be stored within it
			global $view;

			if ( !isset($view->css) )
			{
				$view->css = array();
			}

			foreach(glob(APP_ROOT.
						 self::STYLE_DIRECTORY.
						 $directory.
						 '/*') as $stylesheet)
			{
				if (is_dir($stylesheet))
				{
					self::setStylesheetsFromDirectory($directory.
													  substr($stylesheet, strrpos($stylesheet, '/')) );
				}
				else if ( self::endsWith(self::STYLE_FILE_EXTENSION, $stylesheet) )
				{
					$view->css[] = str_replace(APP_ROOT, '', $stylesheet);
				}
			}
		}

		/*
		 * Generic function responsible for fetching any script that corresponds to the child controller
		 *
		 * @param $script - name of the script that needs to be fetched
		 * @param $directory - name of the script sub-directory that contains the script to load
		 *
		 * @author kinsho
		 */
		private static function setScript($script, $directory)
		{
			// Always reference the $view global object so that path to the script can be stored within it
			global $view;

			if ( !isset($view->scripts) )
			{
				$view->scripts = array();
			}

			$view->scripts[] = self::SCRIPTS_DIRECTORY.
							   $directory.
							   '/'.
							   $script.self::SCRIPTS_FILE_EXTENSION;
		}

		/*
		 * Generic function responsible for fetching all scripts from the specified directory
		 *
		 * @param $directory - name of the scripts sub-directory from which to fetch script files
		 *
		 * @author kinsho
		 */
		private static function setScriptsFromDirectory($directory)
		{
			// Always reference the $view global object so that the paths to all the required scripts can be stored within it
			global $view;

			if ( !isset($view->scripts) )
			{
				$view->scripts = array();
			}
			foreach(glob($_SERVER['DOCUMENT_ROOT'].
						 self::SCRIPTS_DIRECTORY.
						 $directory.
						 '/*') as $script)
			{
				if (is_dir($script))
				{
					self::setScriptsFromDirectory($directory.
												  substr($script, strrpos($script, '/')) );
				}
				else if ( self::endsWith(self::SCRIPTS_FILE_EXTENSION, $script) )
				{
					$view->scripts[] = str_replace(APP_ROOT, '', $script);;
				}
			}
		}

		/*
		 * Utility function checking to see if a string ends with a predefined needle
		 *
		 * @param $needle - substring that will serve as the test here
		 * @param $haystack - string that will be tested 
		 *
		 * @author kinsho
		 */
		private static function endsWith($needle, $haystack)
		{
			return (substr($haystack, -1 * strlen($needle)) === $needle);
		}

	}

?>