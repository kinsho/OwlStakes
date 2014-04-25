<?php

/*
 * Pull the ReCAPTCHA library file in case a ReCAPTCHA element was included within
 * the form that needs to be validated
 */
REQUIRE_ONCE APP_ROOT . '/utility/server/reCAPTCHA/recaptchalib.php';

/**
  * Class that will serve to store HTTP request parameters and their associated validation
  * data. Objects that belong to this class in some familial capacity will then be processed
  * by the main validation method defined below.
  *
  * @author kinsho
  */
abstract class ValidationModel
{

// ------------------- CONSTANTS ----------------

	// Generic error messages
	const ERROR_ALNUM = 'Your <b>%s</b> can only be comprised of alphanumerical characters. (A-Z, 0-9)';
	const ERROR_ALPHA = 'Your <b>%s</b> can only be comprised of alphabetical characters. (A-Z)';
	const ERROR_DIGIT = 'Your <b>%s</b> can only be comprised of numerical characters.(0-9)';
	const ERROR_CAPTCHA = 'Please re-enter the security keywords again. You might have mistyped the first time around.';
	const ERROR_CAPTCHA_MISSING = 'You must type in the keywords that you see within the security image. We do this to make sure that automated
								   scripts or bots cannot overload our database with fake accounts.';
	const ERROR_GENERIC = 'The <b>%s</b> field has not been filled out correctly.';

// ------------------- PROPERTIES -----------------

	protected $errors = array();
	protected $recaptchaChallenge = '';
	protected $recaptchaResponse = '';
	protected $recaptchaTestPassed = true;

	protected $requiredFields = array(); // the properties within that bean that have to be set in order for the entire bean to be considered valid

// ------------------- CONSTRUCTOR -----------------

	/**
	  * The generic constructor meant to be invoked by every model class. Provided as a convenient way
	  * to begin the validation process if an array of HTTP request parameters are passed in when
	  * a model is constructed.
	  *
	  * @param {Array} $params - All the values that will need to be assessed and stored in this object
	  * @param {Boolean} $allowForGenericErrorHandling - a flag indicating whether the generic handler should
	  *				be responsible for relaying to the user all the errors that were discovered during validation.
	  *
	  * @return {ValidationModel} - a new instance of a descendant of this class
	  *
	  * @author kinsho
	  */
	public function __construct($params = array(), $allowForGenericErrorHandling = false)
	{
		// If parameters have been passed into this instantiation function, populate this model
		// with the parameters and then validate said parameters
		if ( count($params) )
		{
			$this->populateAndValidate($params, $allowForGenericErrorHandling);
		}
		return $this;
	}

// ------------------- CLASS ACCESSOR FUNCTIONS -------------------

	public function retrieveErrors()
	{
		return $this->errors;
	}

	public function wasRecaptchaTestPassed()
	{
		return $this->recaptchaTestPassed;	
	}

// ------------------ GENERIC FIELD ACCESSOR FUNCTIONS -----------------

	protected function getRecaptchaChallenge()
	{
		return $this->recaptchaChallenge;
	}

	protected function setRecaptchaChallenge($val)
	{
		$validators = array();

		return $this->genericSetter($val, $validators, __FUNCTION__);
	}

	protected function getRecaptchaResponse()
	{
		return $this->recaptchaResponse;
	}

	protected function setRecaptchaResponse($val)
	{
		$validators = array
		(
			$this->validateField($val, '', 'ValidationModel::assessValueIsNotEmpty', self::ERROR_CAPTCHA_MISSING),
			$this->validateField($val, '', 'ValidationModel::assessCaptchaValue', self::ERROR_CAPTCHA, array($this->recaptchaChallenge))
		);

		// If the user passes the ReCAPTCHA test, mark the flag indicating so
		if ( count($this->removeAllEmptyStrings($validators)) )
		{
			$this->recaptchaTestPassed = false;
		}

		return $this->genericSetter($val, $validators, __FUNCTION__);
	}


// ------------------ VALIDATION MANAGER FUNCTIONS --------------------

	/**
	  * Will process an array of validation objects to determine whether the values stored in those objects
	  * pass the validation standards set within the object.
	  *
	  * @param $fieldValue - the input value that needs to be assessed
	  * @param $fieldName - the name of the value
	  * @param $validationFunc - the function that will be used to assess the input value
	  * @param $errorMessage - the error message to display to the user in case validation fails
	  * @param $otherParams - an optional input array specifying additional parameters to pass into the
	  *						  validation function to help properly assess the input value
	  * @return an error message that will be sent over to the client to be displayed. In the event that the
	  *         	input value passes the validation test, an empty string is returned to denote that it
	  *				successfully passed.
	  *
	  * @author kinsho
	  */
	public function validateField($fieldValue, $fieldName, $validationFunc, $errorMessage, $otherParams = array())
	{
		$results = array();
		$genericMessagePrefix = 'self::ERROR_';
		$params;

		// Include any additional parameters that the validation function may need to properly assess the field value.
		$params = $otherParams;
		if ( !(empty($params)) )
		{
			array_unshift($params, $fieldValue);
		}
		else
		{
			$params = array($fieldValue);
		}

		if (!( call_user_func_array($validationFunc, $params) ))
		{
			// If the field value fails validation, return a customized error message if it's available. Otherwise, return a generic message.
			if ($errorMessage)
			{
				return $errorMessage;
			}
			else
			{
				$errorType = $this->constantizeString(array_pop(explode('::', $validationFunc)));
				return ( defined($genericMessagePrefix . $errorType) ?
					str_replace( '%s', $fieldName, constant($genericMessagePrefix . $errorType) ) :
					str_replace( '%s', $fieldName, constant($genericMessagePrefix . 'GENERIC') ) );
			}
		}

		return '';
	}

	/**
	  * Populates the properties of the bean with the passed data and validates each field using
	  * the validation logic stored within each of the bean's setters.
	  *
	  * @param $values - the array containing all the values that will need to be assessed
	  * @param $allowForGenericErrorHandling - a flag indicating whether the generic handler should be responsible
	  *				for relaying to the user all the errors that were discovered during validation.
	  * @return all the error messages that will be displayed (if any)
	  *
	  * @author kinsho
	  */
	public function populateAndValidate($data = array(), $allowForGenericErrorHandling = false)
	{
		foreach ($data as $key => $value)
		{
			$method = 'set' . ucfirst($key);
			$this->errors = array_merge($this->errors, $this->$method($value));
		}
		$this->errors = $this->removeAllEmptyStrings( array_merge($this->errors, $this->verifyModelValidity($data)) );

		$this->errors = array_values(array_unique($this->errors));

		if ($allowForGenericErrorHandling)
		{
			$this->genericErrorHandler();
		}
	}

	/*
	 * Given that all of the data validation should be handled by specially designed beans in a very specific manner,
	 * this function introduces a generic handler capable of determining whether any errors were found during validation.
	 * If so, the function delivers a response back to the user indicating the nature of the errors and ceases any
	 * further server-side code execution
	 *
	 * @author kinsho
	 */
	private function genericErrorHandler()
	{
		if ( !(empty($this->errors)) )
		{
			http_response_code(400);
			echo json_encode(array("errors" => $this->errors));
			exit();
		}
	}

// -------------- GENERIC VALIDATION FUNCTIONS --------------

	/**
	  * Determines whether the passed value is comprised only of alphabetical 
	  * characters and spaces.
	  * 
	  * @param $value - the value that will be assessed 
	  * @return a boolean indicating whether the value passes its assessment 
	  *
	  * @author kinsho
	  */
	protected static function assessAlphaWithSpaces($value)
	{
		return ( ValidationModel::assessValueIsNotEmpty($value) ? ctype_alpha(str_replace(' ', '', $value)) : true );
	}

	/**
	  * Determines whether the passed value is comprised only of alphabetical 
	  * characters, spaces, and certain punctuation.
	  * 
	  * @param $value - the value that will be assessed 
	  * @return a boolean indicating whether the value passes its assessment 
	  *
	  * @author kinsho
	  */
	protected static function assessAlphaWithSpacesAndPunctuation($value)
	{
		return ( ValidationModel::assessValueIsNotEmpty($value) ? ctype_alpha(str_replace(array(' ', '.', "'"), '', $value)) : true );
	}

	/**
	  * Determines whether the passed value is comprised only of alphabetical 
	  * characters, numbers, and spaces.
	  * 
	  * @param $value - the value that will be assessed 
	  * @return a boolean indicating whether the value passes its assessment 
	  *
	  * @author kinsho
	  */
	protected static function assessAlnumWithSpaces($value)
	{
		return ( ValidationModel::assessValueIsNotEmpty($value) ? ctype_alnum(str_replace(' ', '', $value)) : true );
	}

	/**
	  * Determines whether the passed value is comprised only of alphabetical 
	  * characters, numbers, spaces, and certain punctuation.
	  * 
	  * @param $value - the value that will be assessed 
	  * @return a boolean indicating whether the value passes its assessment 
	  *
	  * @author kinsho
	  */
	protected static function assessAlnumWithSpacesAndPunctuation($value)
	{
		return ( ValidationModel::assessValueIsNotEmpty($value) ? ctype_alnum(str_replace(array(' ', '.', "'"), '', $value)) : true );
	}

	/**
	  * Determines whether the passed value is a non-negative integer
	  * 
	  * @param $value - the value that will be assessed 
	  * @return a boolean indicating whether the value passes its assessment 
	  *
	  * @author kinsho
	  */
	protected static function assessNonNegativeInteger($value)
	{
		return ( ValidationModel::assessValueIsNotEmpty($value) ? (ctype_digit($value) && (intval($value) >= 0)) : true );
	}

	/**
	  * Determines whether the passed value is anything but an 'empty' value.
	  *
	  * @param $value - the value that will be assessed 
	  * @returns a boolean indicating whether the value is anything but falsey
	  *
	  * @author kinsho
	  */
	protected static function assessValueIsNotEmpty($value)
	{
		return ( ($value !== '') && (isset($value)) );
	}

	/**
	  * Validates whether CAPTCHA input matches the pictured text.
	  *
	  * @param $challenge - the test that the user needs to pass
	  * @param $value - the value that will be assessed
	  * @returns a boolean indicating whether the value passes the CAPTCHA test
	  *
	  * @author kinsho
	  */
	protected static function assessCaptchaValue($value, $challenge)
	{
		if ( !(ValidationModel::assessValueIsNotEmpty($value)) )
		{
			return true;
		}

		$resp = recaptcha_check_answer($challenge, $value, $_SERVER['REMOTE_ADDR']);

		return $resp->is_valid;
	}

	/**
	  * Determines whether the passed e-mail address is a valid e-mail address
	  * 
	  * @param $email - the e-mail address to be assessed
	  * @returns a boolean indicating whether e-mail address is indeed valid 
	  *
	  * @author kinsho
	  */
	protected static function isValidEmail($email)
	{
		return (empty($email) || filter_var($email, FILTER_VALIDATE_EMAIL));
	}

// ---------------------- UTILITY FUNCTIONS -----------------------

	/**
	  * Function used to turn a camel-case string into a constant-formatted string
	  *
	  * @param $str - the string that will be converted into a constant-formatted string
	  * @return a constant-formatted string that was generated from the passed string
	  *
	  * @author kinsho
	  */
	private function constantizeString($str)
	{
		$uppercaseLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
		$result = '';

		for ($i = 0; i < strlen($str); $i++)
		{
			if (strpos($uppercaseLetters, $str[$i]) === false)
			{
				$result .= strtoupper($str[$i]);
			}
			else
			{
				$result .= ('_'.$str[$i]);
			}
		}

		return $result;
	}

	/**
	  * Will remove all empty values from an array.
	  *
	  * @param $values - the array which will need to be filtered
	  * @return the array with all of its empty values filtered out
	  *
	  * @author kinsho
	  */
	protected function removeAllEmptyStrings($values = array())
	{
		return array_filter($values, 'ValidationModel::assessValueIsNotEmpty');
	}

	/**
	  * Will validate the passed value with any validation functions passed into
	  * the function. If the passed value passes validation, it'll be set into the
	  * appropriate property using the name of the function that invokes this function.
	  *
	  * @param $val - the value to be assessed and possibly set into the bean.
	  * @param $validators - an array of functions that will be used to validate the value.
	  * @param $methodName - the name of the method that invokes this method. Will be used
	  * 					 to deduce the name of the correct property within which to set the value.
	  * @param $convertToNumber - a flag indicating whether the value should be converted
								  into a number before being set into the bean.
	  * @return an array of zero or more error messages that will be displayed to the user
	  *			should the value fails validation.
	  *
	  * @author kinsho
	  */
	protected function genericSetter($val, $validators, $methodName, $convertToNumber = false)
	{
		$property = lcfirst( str_replace('set', '', $methodName) );

		// Filters out all empty and false values from the array
		$testResults = $this->removeAllEmptyStrings($validators);

		// If the value has passed all of its validation tests, set the value to its associated property.
		$this->$property = ( !(count($testResults)) ?  ($convertToNumber ? intval($val) : trim($val)) : $this->$property );

		return $testResults;
	}

	/*
	 * Validates whether the user has populated all the properties on this bean
	 * that are defined as required fields.
	 *
	 * @returns a list of the error messages to be displayed (if any)
	 */
	protected function verifyModelValidity($postParams)
	{
		$validators = array();

		foreach($this->requiredFields as $fieldName)
		{
			$validators[] = $this->validateField($postParams[$fieldName], '', 'ValidationModel::assessValueIsNotEmpty', $this->errorMessages[$fieldName.'Empty']);
		}

		return $validators;
	}
}
?>