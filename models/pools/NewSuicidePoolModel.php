<?php

/**
  * Class that will serve to store all information needed to create new suicide pools
  *
  * @author kinsho
  */
class NewSuicidePoolModel extends ValidationModel
{
	protected $errorMessages = array
	(
		'nameImproper' => "Please take out any non-alphabetical or non-numerical characters in the name of the suicide pool.
									  No dashes, apostrophes, or any other special characters. Only letters, numbers, and spaces.",
		'nameAlreadyExists' => 'We already have another pool with the same name you typed in! Please type in another name.',
		'nameEmpty' => 'A name has to be typed first before any new suicide pool can be created!',

		'tooManyPools' => "Sorry, but we don't allow anybody to take part in more than ten pools in any given season. You can
							create a new pool only if you drop out of any one of the pools in which you are currently registered.",

		'userIDEmpty' => "Well, this is absolutely bizarre. Something went horribly wrong. Try this out again"
	);

	protected $requiredFields = array
	(
		'name',
		'userID'
	);

	// -------- CLASS MEMBERS -------------

	protected $name = '';
	protected $userID = '';

	protected $DAO;

	// --------- CONSTRUCTOR --------------

	public function __construct()
	{
		// Initiate the connection to the database
		$this->DAO = new SuicidePoolsDAO();

		return $this;
	}

	// ------- ACCESSOR/VALIDATION FUNCTIONS --------------

	public function getName() 
	{
		return $this->name;
	}

	protected function setName($val)
	{
		$validators = array
		(
			$this->validateField($val, '', 'ValidationModel::assessAlnumWithSpaces', $this->errorMessages['nameImproper']),
			$this->validateField($val, '', array($this, 'checkPoolName'), $this->errorMessages['nameAlreadyExists']),
		);

		return $this->genericSetter($val, $validators, __FUNCTION__);
	}

	public function getUserID()
	{
		return $this->userID;
	}

	protected function setUserID($val)
	{
		$validators = array
		(
			$this->validateField($val, '', array($this, 'checkUserPoolLimit'), $this->errorMessages['tooManyPools']),
		);

		return $this->genericSetter($val, $validators, __FUNCTION__);	
	}

	// ------- SPECIALIZED VALIDATION FUNCTIONS --------

	/**
	  * Determines whether the name for this new suicide pool was already set for another pool
	  * that was created
	  *
	  * @param $name - the name to test here
	  * @returns - a boolean indicating whether the pool name is already in use
	  *
	  * @author kinsho
	  */
    protected function checkPoolName($name)
	{
		if (!($name))
		{
			return true;
		}

		return $this->DAO->checkPoolName($name);
	}

	/**
	  * Determines whether the user is allowed to manage this suicide pool
	  *
	  * @param $user - the ID of the user whose pool history for the current year will be examined
	  * @returns - a boolean indicating whether the user can manage the pool
	  *
	  * @author kinsho
	  */
	protected function checkUserPoolLimit($userID)
	{
		return $this->DAO->checkUserPoolLimit($userID);
	}
}
?>