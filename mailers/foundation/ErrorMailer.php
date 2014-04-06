<?php

REQUIRE_ONCE '/../foundation/Mailer.php';

/*
 * Class responsible for generating and sending out system failure e-mails to the administrator of the site
 *
 * @author kinsho
 */
class ErrorMailer extends Mailer
{
	const FROM_ERROR = 'error@owlStakes.com';
	const FROM_ERROR_NAME = 'Error Owl';

	const SUBJECT_ERROR = 'Error Caught - %header';

	// ----------------- CLASS MEMBERS ----------------

	protected $bodyHtmlTemplate; // The HTML-formatted content that will serve as the body of the e-mail
	protected $bodyTextTemplate; // The text-formatted content that will serve as the body of the e-mail

	// ------------------- CONSTRUCTOR -------------------
	
	public function __construct()
	{
		$this->bodyHtmlTemplate = file_get_contents($_SERVER['DOCUMENT_ROOT'].'/mailers/foundation/ErrorHtmlEmailTemplate.html');
		$this->bodyTextTemplate = file_get_contents($_SERVER['DOCUMENT_ROOT'].'/mailers/foundation/ErrorTextEmailTemplate.txt');

		parent::__construct();
	}

	// ------------------- CLASS FUNCTIONS -------------------

	/**
	  *	Functions prepares an e-mail containing details about some unexpected system failure. E-mail will
	  * then be sent to the administrator
	  *
	  * @param {Exception} - the exception that mandated the sending of this e-mail
	  * @param {String} $header - the header that will act as a headline for the error, if one was provided
	  * 		Note that if a header was not provided, the parameter defaults to ND (No Description)
	  *
	  * @author kinsho
	  */
	public function sendErrorMail($ex, $header = 'ND')
	{
		// In the event that the header parameter is defined with an empty string, reset the value back to ND
		if (!($header))
		{
			$header = 'ND';
		}

		// Retrieve the admin's e-mail address from the configuration file
		ConfigurationParser::initiateConfigurationsArray();
		$adminEmailAddress = ConfigurationParser::getSetting('administratorEmailAddress');

		$this->addEmailRecipient($adminEmailAddress, '');
		
		// Form the subject of the e-mail using the header parameter
		$subject = str_replace('%header', $header, self::SUBJECT_ERROR);

		// Fetch the error message and stack trace from the exception object
		$errorMessage = $ex->getMessage();
		$stackTrace = $ex->getTraceAsString();
		// Format the stack trace so that it renders better in HTML
		$stackTraceHTML = implode('<br />', explode('#', $stackTrace));

		// Place those fetched values into the e-mail templates
		$this->bodyHtmlTemplate = str_replace('%message', $errorMessage, $this->bodyHtmlTemplate);
		$this->bodyTextTemplate = str_replace('%message', $errorMessage, $this->bodyTextTemplate);
		$this->bodyHtmlTemplate = str_replace('%trace', $stackTraceHTML, $this->bodyHtmlTemplate);
		$this->bodyTextTemplate = str_replace('%trace', $stackTrace, $this->bodyTextTemplate);

		$this->sendMail($subject, $header, $this->bodyHtmlTemplate, $this->bodyTextTemplate, self::FROM_ERROR, self::FROM_ERROR_NAME);
	}
}
?>
