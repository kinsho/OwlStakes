<?php

/**
  * Class that will serve to store and validate all information related to existing suicide pools
  *
  * @author kinsho
  */
class ExistingSuicidePoolModel extends ValidationModel
{
	protected $errorMessages = array
	(
		'weirdStuff' => "Odd...something went wrong here. Try again.",

		'cannotManagePool' => "You're not allowed to manage this pool. Stop messing with the code.",

		'nameImproper' => "Please take out any non-alphabetical or non-numerical characters in the name of the suicide pool.
							No dashes, apostrophes, or any other special characters. Only letters, numbers, and spaces.",
		'nameAlreadyExists' => 'We already have another pool with the same name you typed in! Please type in another user name.',

		'userNotInvolvedInPool' => "The user is not involved in the pool in any way. How did you manage to try and delete a user
									that's not part of the pool?",

		'userDoesNotExist' => "We don't know of a user with that particular name. Check the name and try again.",
		'userAlreadyInvited' => "The user has already been invited to the pool! He still has yet to accept the invitation though...",
		'userAlreadyInPool' => "The user is already a part of the pool!"
	);

	protected $requiredFields = array
	(
		'id'
	);

	// -------- CLASS MEMBERS -------------

	protected $id = '';
	protected $name = '';
	protected $deletedUser = '';
	protected $addedUser = '';
	protected $letManagerMakePicksFlag = true;
	protected $sendEmailsAboutMajorChangeFlag = true;
	protected $sendWeeklyReminderEmailFlag = true;

	protected $poolsDAO;
	protected $usersDAO;

	// --------- CONSTRUCTOR --------------

	public function __construct()
	{
		// Initiate the various connections to the database
		$this->poolsDAO = new SuicidePoolsDAO();
		$this->usersDAO = new UsersDAO();

		return $this;
	}

	// ------- ACCESSOR/VALIDATION FUNCTIONS --------------

	public function getId()
	{
		return $this->id;
	}

	protected function setId($val)
	{
		$validators = array
		(
			$this->validateField($val, '', array($this, 'doesPoolExist'), $this->errorMessages['weirdStuff']),
			$this->validateField($val, '', array($this, 'checkWhetherUserManagesPool'), $this->errorMessages['cannotManagePool']),
		);

		return $this->genericSetter($val, $validators, __FUNCTION__);	
	}

	public function getName() 
	{
		return $this->name;
	}

	protected function setName($val)
	{
		$validators = array
		(
			$this->validateField($val, '', 'ValidationModel::assessAlnumWithSpaces', $this->errorMessages['suicidePoolNameImproper']),
			$this->validateField($val, '', array($this, 'checkWhetherNameIsAlreadyUsed'), $this->errorMessages['poolNameAlreadyExists'])
		);

		return $this->genericSetter($val, $validators, __FUNCTION__);
	}

	public function getDeletedUser()
	{
		return $this->deletedUser;
	}

	public function setDeletedUser()
	{
		$validators = array
		(
			$this->validateField($val, '', array($this, 'checkWhetherUserExists'), $this->errorMessages['userDoesNotExist']),
			$this->validateField( $val, '', array($this, 'checkWhetherUserIsCurrentlyInvolvedInPool'), $this->errorMessages['userNotInvolvedInPool'], array($this->getId()) )
		);

		return $this->genericSetter($val, $validators, __FUNCTION__);
	}

	public function getAddedUser()
	{
		return $this->addedUser;
	}

	public function setAddedUser()
	{
		$validators = array
		(
			$this->validateField($val, '', array($this, 'checkWhetherUserExists'), $this->errorMessages['userDoesNotExist']),
			$this->validateField( $val, '', array($this, 'checkWhetherUserIsCurrentlyInvited'), $this->errorMessages['userAlreadyInvited'], array($this->getId(), false) ),
			$this->validateField( $val, '', array($this, 'checkWhetherUserIsCurrentlyInPool'), $this->errorMessages['userAlreadyInPool'], array($this->getId(), false) )
		);

		return $this->genericSetter($val, $validators, __FUNCTION__);
	}

	public function getLetManagerMakePicksFlag()
	{
		return $this->letManagerMakePicksFlag;
	}

	public function setLetManagerMakePicksFlag()
	{
		$validators = array();

		return $this->genericSetter($val, $validators, __FUNCTION__);
	}

	public function getSendEmailsAboutMajorChangeFlag()
	{
		return $this->sendEmailsAboutMajorChangeFlag;
	}

	public function setSendEmailsAboutMajorChangeFlag()
	{
		$validators = array();

		return $this->genericSetter($val, $validators, __FUNCTION__);
	}

	public function getSendWeeklyReminderEmailFlag()
	{
		return $this->sendWeeklyReminderEmailFlag;
	}

	public function setSendWeeklyReminderEmailFlag()
	{
		$validators = array();

		return $this->genericSetter($val, $validators, __FUNCTION__);
	}

	// ------- SPECIALIZED VALIDATION FUNCTIONS --------

	/**
	  * Determines whether a suicide pool exists corresponding to the passed ID
	  *
	  * @param $poolID - the ID whose validity will be checked here
	  * @returns - a boolean indicating whether the pool exists
	  *
	  * @author kinsho
	  */
	protected function doesPoolExist($poolID)
	{
		return $this->poolsDAO->doesPoolExist($poolID);
	}

	/**
	  * Determines whether the user is allowed to manage the pool specified by the passed ID
	  *
	  * @param $poolID - the ID of the pool whose ownership will be examined
	  * @returns - a boolean indicating whether user is allowed to manage said pool
	  *
	  * @author kinsho
	  */
    protected function checkWhetherUserManagesPool($poolID)
	{
		return $this->poolsDAO->doesUserManagePool($poolID);
	}

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

		return $this->poolsDAO->checkPoolName($name);
	}

	/**
	  * Determines whether a user exists with the passed user name
	  *
	  * @param $username - the name to test here
	  * @returns - a boolean indicating whether a user with the username or e-mail address exists within the database
	  *
	  * @author kinsho
	  */
	protected function checkWhetherUserExists($username)
	{
		return $this->usersDAO->doesUserExistWithGivenUsernameOrEmail($username);
	}

	/**
	  * Determines whether the user has been invited into the pool, but has yet to accept the invitation
	  *
	  * @param $username - the name of the user whose status will be checked
	  * @param $poolId - the ID of the pool within which to check the user's status
	  * @param $doesPositiveResultPassValidation - a flag determining whether a positive result qualifies as passing this validation test
	  * @returns - a boolean indicating whether the user has currently still in 'invited' status for the specified pool
	  *
	  * @author kinsho
	  */
	protected function checkWhetherUserIsCurrentlyInvited($username, $poolId, $doesPositiveResultPassValidation)
	{
		// Fetch the user ID associated with the passed username
		$userID = $this->usersDAO->fetchIDViaUsernameOrEmail();

		// Fetch the status from the database and return a boolean indicating whether the user has been invited
		// to join the pool, but has yet to accept the invitation
		$status = $this->poolsDAO->checkUserAcceptanceStatus($poolId, $userID);

		// Return a boolean depending on the value of the $doesPositiveResultPassValidation flag and whether
		// the user is currently invited into the pool and has yet to accept the invitation
		$result = ($status === 'invited');
		return ($doesPositiveResultPassValidation ? $result : !($result));
	}

	/**
	  * Determines whether the user is currently considered a participant in the pool
	  *
	  * @param $username - the name of the user whose status will be checked
	  * @param $poolId - the ID of the pool within which to check the user's status
	  * @param $doesPositiveResultPassValidation - a flag determining whether a positive result qualifies as passing this validation test
	  * @returns - a boolean indicating whether the user is currently participating in the pool
	  *
	  * @author kinsho
	  */
	protected function checkWhetherUserIsCurrentlyInPool($username, $poolId, $doesPositiveResultPassValidation)
	{
		// Fetch the user ID associated with the passed username
		$userID = $this->usersDAO->fetchIDViaUsernameOrEmail();

		// Fetch the status from the database and return a boolean indicating whether the user is
		// currently a member of the pool
		$status = $this->poolsDAO->checkUserAcceptanceStatus($poolId, $userID);

		// Return a boolean depending on the value of the $doesPositiveResultPassValidation flag and whether
		// the user is currently a part of the pool
		$result = ( ($status === 'participant') || ($status === 'dead') );
		return ($doesPositiveResultPassValidation ? $result : !($result));
	}

	/**
	  * Determines whether the user is currently a participant or an invitee to the pool
	  *
	  * @param $username - the name of the user whose status will be checked
	  * @param $poolId - the ID of the pool within which to check the user's status
	  * @returns - a boolean indicating whether the user is currently a part of the pool or has been invited and has yet to accept the invitation
	  *
	  * @author kinsho
	  */
	protected function checkWhetherUserIsCurrentlyInvolvedInPool($username, $poolId)
	{
		// Fetch the user ID associated with the passed username
		$userID = $this->usersDAO->fetchIDViaUsernameOrEmail();

		// Fetch the status from the database and return a boolean indicating whether the user is
		// currently a member of the pool
		$status = $this->poolsDAO->checkUserAcceptanceStatus($poolId, $userID);

		// Return a boolean depending on whether the user is currently involved with the pool in some way
		$result = ( ($status === 'participant') || ($status === 'dead') || ($status === 'invited') );
		return $result;
	}
}
?>