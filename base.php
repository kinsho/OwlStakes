<?php

/**
  * The file that will serve to redirect ~ALL~ HTTP requests to the appropriate controller
  * Logic also serves to to instantiate basic variables and methods that will be used across
  * different sorts of PHP files within the application
  *
  * @author kinsho
  */

// Load the store that contains all globally-accessible constants
REQUIRE($_SERVER['DOCUMENT_ROOT'] . "/utility/AppConstants.php");

// The all-important file loader, and the last time this application will ever contain
// references to PHP's native Require functionality
REQUIRE($_SERVER['DOCUMENT_ROOT'] . "/utility/FileLoader.php");

// Load the generic template to be used for generating objects that can accept new
// property definitions on the fly
TOS_REQUIRE_ONCE('utility/DynamicObject.php');

// Load the autoloader that'll be used to access all external PHP libraries
TOS_REQUIRE_ONCE('serverLibraries/autoload.php');

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