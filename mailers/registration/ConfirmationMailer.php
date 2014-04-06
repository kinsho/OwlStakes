<?php

REQUIRE_ONCE '/../foundation/Mailer.php';

/*
 * Class responsible for generating and sending out account confirmation e-mails
 *
 * @author kinsho
 */
class ConfirmationMailer extends Mailer
{
	const FROM_CONFIRM = 'confirm@owlStakes.com';
	const FROM_CONFIRM_NAME = 'Owl Stakes Confirmation';

	const SUBJECT_CONFIRM = 'Owl Stakes Confirmation Link';
	const BODY_HEADER = "Let's confirm your account!";

	const CONFIRMATION_URL = 'confirmation?hash=';

	// ----------------- CLASS MEMBERS ----------------

	protected $bodyHtmlTemplate; // The HTML-formatted content that will serve as the body of the e-mail
	protected $bodyTextTemplate; // The text-formatted content that will serve as the body of the e-mail

	// ------------------- CONSTRUCTOR -------------------
	
	public function __construct()
	{
		// Initialize the templates
		$this->bodyHtmlTemplate = file_get_contents($_SERVER['DOCUMENT_ROOT'].'/mailers/registration/ConfirmationHtmlEmailTemplate.html');
		$this->bodyTextTemplate = file_get_contents($_SERVER['DOCUMENT_ROOT'].'/mailers/registration/ConfirmationTextEmailTemplate.txt');

		parent::__construct();
	}

	// ------------------- CLASS FUNCTIONS -------------------

	/**
	  *	Functions prepares and sends an account confirmation e-mail to a recipient designated by the $email parameter
	  *
	  * @param {String} $email - the e-mail address of the recipient of the e-mail
	  * @param {String} $hash - the confirmation hash that will be included within the URL sent to the recipient
	  * @param {String} $firstName - the first name listed on the new account, if one was provided during account creation.
	  * @param {String} $lastName - the last name listed on the new account, if one was provided during account creation.
	  *
	  * @author kinsho
	  */
	public function sendConfirmMail($email, $hash, $firstName = '', $lastName = '')
	{
		// The dev, QA, and production environments each have their own unique server address. Pull the correct one
		// here so that a fully-formed confirmation URL can be generated.
		ConfigurationParser::initiateConfigurationsArray();
		$serverAddress = ConfigurationParser::getSetting('serverAddress');

		$this->addEmailRecipient($email, $firstName.' '.$lastName);

		$this->bodyHtmlTemplate = str_replace('%link', $serverAddress.self::CONFIRMATION_URL.$hash, $this->bodyHtmlTemplate);
		$this->bodyTextTemplate = str_replace('%link', $serverAddress.self::CONFIRMATION_URL.$hash, $this->bodyTextTemplate);

		$this->sendMail(self::SUBJECT_CONFIRM, self::BODY_HEADER, $this->bodyHtmlTemplate, $this->bodyTextTemplate, self::FROM_CONFIRM, self::FROM_CONFIRM_NAME);
	}
}
?>
