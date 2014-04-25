<?php

/**
  * The file that will serve to redirect ~ALL~ HTTP requests to the appropriate controller
  * Logic also serves to to instantiate basic variables and methods that will be used across
  * different sorts of PHP files within the application
  *
  * @author kinsho
  */


// Before anything is to be done, set up a function to replace PHP's computationally expensive REQUIRE_ONCE
// statement

$TOS_INCLUDED_FILES = array(); // an array to keep track of pulled files

// Define a global constant that'll store the path to the application root
define( "APP_ROOT", ($_SERVER['DOCUMENT_ROOT'] . '/') );

/**
  * A custom function to replace PHP's
  * native (and computational expensive) REQUIRE_ONCE statement.
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

        $TOS_INCLUDED_FILES[] = $fileName;
    }
}

TOS_REQUIRE_ONCE('DynamicObject.php');

// Create a view object that will contain data that can be passed from the server to the client
// in order to assist in rendering the page.
$view = new DynamicObject();

// Create a global object that can be used to store URI-related and path-related values
$BASE_global = new DynamicObject();

// Instantiate the generic object with filepath-related constants
$BASE_global->controllerDirectory = 'controllers/';
$BASE_global->controllerSuffix = 'Controller';
$BASE_global->controllerFileType = '.php';
$BASE_global->actionSuffix = 'Action';

// Parse specific keywords from the URI
$BASE_global->requestURI = explode('/', $_SERVER['REQUEST_URI']);
$BASE_global->controller = empty($BASE_global->requestURI[1]) ? 'home' : $BASE_global->requestURI[1];
$BASE_global->action = count($BASE_global->requestURI) > 2 ? $BASE_global->requestURI[2] : '';

// Separate any included parameters from the URI components
if ( strpos($BASE_global->controller, '?') !== false )
{
    $BASE_global->controller = strstr($BASE_global->controller, '?', true);
}
if ( strpos($BASE_global->action, '?') !== false )
{
    $BASE_global->action = strstr($BASE_global->action, '?', true);
}

// Format the keywords that were parsed from the URI so that they can be properly processed
$BASE_global->controller = ucfirst($BASE_global->controller).$BASE_global->controllerSuffix;

try
{
    // Use the formatted URI values to invoke the corresponding controller and action methods
    TOS_REQUIRE_ONCE ($BASE_global->controllerDirectory . $BASE_global->controller . $BASE_global->controllerFileType);

    // Keep in mind that the action method that is invoked is always assumed to be a static method
    $BASE_global->controllerClass = new ReflectionClass($BASE_global->controller);

    if (!($BASE_global->action))
    {
        $BASE_global->controllerClass->getMethod('initPage')->invoke(null);
    }
    else
    {
        $BASE_global->controllerClass->getMethod( $BASE_global->action.$BASE_global->actionSuffix )->invoke(null);
    }
}
catch(Exception $ex)
{
    echo 'Something went terribly wrong when trying to redirect to the proper controller...';
}
?>