<?php


/**
  * Class that will serve to store a collection of models that will need to be validated
  * with respect to one another
  *
  * @author kinsho
  */
abstract class ValidationCollection
{
	// ------ PROPERTIES -----------------

	protected $errors = array();
	protected $collection = array(); // the array that will store all the models
	protected $validators = array(); // list of validation functions to run on the collection
	protected $errorMessages = array(); // list of error messages

	// ------ CONSTRUCTOR ----------------

	public function __construct()
	{
		// Initiate the connection to the database
		$this->DAO = new PicksDAO();

		return $this;
	}

	// ------------------- GENERIC ACCESSOR/VALIDATOR FUNCTIONS -------------------

	public function retrieveErrors()
	{
		$results['errors'] = $this->errors;

		return $results;
	}

	public function getCollection()
	{
		return $this->collection;
	}

	// Function used to load models individually into the collection
	public function insertModel($model)
	{
		$this->collection[] = $model;
	}

	/**
	  * Function used to add a validation function and a corresponding error
	  * message to the collection. The validation function will be added to a queue
	  * of other validation functions that will be ran on the collection of models.
	  *
	  * NOTE: Every single validation function must be accompanied by an error message
	  * 	  that will need to be displayed if the collection fails to pass that validation
	  *		  function
	  *
	  * @param $validationFunc - the name of the validation function (it has to be static)
	  * @param $errorMessage - the error message to display should the collection fail to pass
	  *						   the validation function.
	  *
	  * @author kinsho
	  */
	public function addValidationFunction($validationFunc, $errorMessage)
	{
		$this->validators[] = $validationFunc;
		$this->errorMessages[] = $errorMessage;
	}

	// ------------------- UTILITY FUNCTIONS --------------------

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
		return !(empty($value));
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
		return array_filter($values, 'ValidationCollection::assessValueIsNotEmpty');
	}

	/**
	  *	Function used to return a bundle all the error messages stored within the
	  * collection of models
	  *
	  * @return an array containing all the error messages that were stored within the models
	  *
	  * @author kinsho
	  */
	public function gatherModelErrorMessages()
	{
		$errors = array();
		$results = array();
		$modelErrors;

		foreach ($this->collection as $model)
		{
			$modelErrors = $model->retrieveErrors();
			$errors = array_merge($errors, $modelErrors['errors']);
		}

		return array_values(array_unique($errors));
	}

	/**
	  * Will run all internally stored validation functions against the collection and return
	  * any error messages. Will also return any model-specific error messages should any of
	  * the models within the collections have failed their specific validation tests.
	  *
	  * @author kinsho
	  */
	public function validateCollection()
	{
		$errorMessages = array();

		$errorMessages = $this->gatherModelErrorMessages();

		// Only run any collection-specific validation functions if all the models have
		// individually cleared their own set of validation tests
		if ( empty($errorMessages) )
		{
			foreach ($this->validators as $index => $validationFunc)
			{
				if (!( call_user_func($validationFunc, $this->collection) ))
				{
					$errorMessages[] = $this->errorMessages[$index];
				}
			}
		}

		$this->errors = array_values( array_unique($this->removeAllEmptyStrings($errorMessages)) );
	}
}

?>