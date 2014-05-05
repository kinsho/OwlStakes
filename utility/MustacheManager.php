<?php

TOS_REQUIRE_ONCE('vendor/autoload.php');

/*
 * Class that will serve as the foundation for all other classes responsible for
 * generating and sending out e-mails to users
 *
 * @author kinsho
 */
abstract class Mailer
{
	const EMAIL_ERROR = "Well, something went terribly wrong when trying to send you an e-mail.
						 Please notify the site administrator about this at help@owlStakes.com along with the
						 following error message below:";

	const CHARACTER_PER_LINE_LIMIT = 75; // limit on the number of characters allowed per line

// ------------- CLASS MEMBERS --------------

	protected $mail; // Mail object that will be used to send e-mail
	protected $htmlTemplate; // Template that will be used to help generate every HTML e-mail
	protected $textTemplate; // Template that will be used to help generate every text e-mail
	protected $errorMessages = array();

// ------------ CONSTRUCTOR -----------------

	protected function __construct()
	{
		ConfigurationParser::initiateConfigurationsArray();

		// Initiate the mail object and prep it for use
		$this->mail = new PHPMailer;
		$this->mail->IsSMTP();		

		// Enable authentication
		$this->mail->SMTPAuth = true;

		// Secure the data being transferred back and forth
		$this->mail->SMTPSecure = ConfigurationParser::getSetting('emailConnectionType');

		// Set the host URL and the port to which to connect
		$this->mail->Host = ConfigurationParser::getSetting('emailHost');
		$this->mail->Port = ConfigurationParser::getSetting('emailPort');

		// Set the credentials that will be used to log in to the ESP
		$this->mail->Username = ConfigurationParser::getSetting('emailUser');
		$this->mail->Password = ConfigurationParser::getSetting('emailPassword');

		// Set limits on the number of characters allowed per line
		$this->mail->WordWrap = self::CHARACTER_PER_LINE_LIMIT;

		// Enable HTML E-mails
		$this->mail->IsHTML(true);

		// Initialize the template for use
		$this->htmlTemplate = file_get_contents($_SERVER['DOCUMENT_ROOT'].'/mailers/foundation/BaseHtmlEmailTemplate.html');
		$this->textTemplate = file_get_contents($_SERVER['DOCUMENT_ROOT'].'/mailers/foundation/BaseTextEmailTemplate.txt');
	}


// ------------- E-MAIL FUNCTIONS ---------------

	/**
	  *	Function used to declare recipients who will receive copies of the e-mail when they're
	  * finally sent through the ESP
	  *
	  * @param {String} $emailAddress - the e-mail address to add as a recipient
	  * @param {String} $fullName - the name of the person associated with that e-mail address
	  *
	  * @author kinsho
	  */
	protected function addEmailRecipient($emailAddress, $fullName)
	{
		$this->mail->AddAddress($emailAddress, $fullName);
	}

	/**
	  *	Function used to send the e-mail. If any errors are generated, the error is stored within
	  * the error messages array
	  *
	  * @param {String} $subject - the subject of the e-mail
	  * @param {String} $bodyHeader - the header above the body of the e-mail
	  * @param {String} $bodyHTML - the content of the body, in HTML format
	  * @param {String} $bodyText - the content of the body, in text format
	  * @param {String} $from - the e-mail address from which to claim the e-mail was sent
	  * @param {String} $fromHeader - the name associated with the address from which to send the e-mail
	  *
	  * @author kinsho
	  */
	protected function sendMail($subject, $bodyHeader, $bodyHTML, $bodyText, $from, $fromHeader)
	{
		$this->mail->Subject = $subject;
		$this->mail->Body = $this->generateHtmlEmail($bodyHeader, $bodyHTML);
		$this->mail->AltBody = $this->generateTextEmail($bodyText);

		$this->mail->From = $from;
		$this->mail->FromName = $fromHeader;

		try
		{
			$response = $this->mail->Send();

			if ( !($response) )
			{
				throw new Exception($this->mail->ErrorInfo);
			}
		}

		catch (Exception $e)
		{
			$this->returnUserFriendlyError($e, 'Error sending e-mail concerning ' . $subject);
		}
	}

	/**
	  *	Function used to generate an HTML e-mail using the base template and the passed content
	  *
	  * @param {String} $header - the header that will be placed above the body of the e-mail
	  * @param {String} $content - the content which needs to be inserted into the HTML template
	  *
	  * @returns {String} an HTML-formatted string that will form the e-mail that will be sent
	  *
	  * @author kinsho
	  */
	private function generateHtmlEmail($header, $content)
	{
		$email = $this->htmlTemplate;

		$email = str_replace('%title', $header, $email);
		$email = str_replace('%message', $content, $email);

		return $email;
	}

	/**
	  *	Function used to generate a text e-mail using the base template and passed content
	  *
	  * @param {String} $content - the content which needs to be inserted into the text template
	  *
	  * @return {String} - a text-based string that will form the e-mail that will be sent
	  *
	  * @author kinsho
	  */
	private function generateTextEmail($content)
	{
		$email = $this->textTemplate;

		$email = str_replace('%content', $content, $email);

		return $content;
	}

// ---------- ERROR-HANDLING FUNCTIONS -----------------

	/**
	  * In the event that sending an e-mail failed for whatever reason, the user needs to be
	  * alerted in vague fashion that an error has occurred within this module. The actual
	  * details/nature of the error itself will be sent separately within an e-mail to the
	  * administrator himself.
	  *
	  * @param {Exception} $ex - the actual exception that was thrown
	  * @param {String} [$header] - a message to headline the body of the e-mail
	  *
	  * @author kinsho
	  */
	protected function returnUserFriendlyError()
	{
		// Send word to the user that something went wrong
		http_response_code(400);
		echo json_encode(array("errors" => array(self::EMAIL_ERROR)));

		// Send word to the admin about the nature of the error
		$mailer = new ErrorMailer();
		$mailer->sendErrorMail($ex, $header);

		// Cease all further processing
		exit();
	}
}
?>