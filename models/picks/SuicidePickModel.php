<?php

/**
  * Class that will serve to store and validate all picks on the suicide picks screen.
  *
  * @author kinsho
  */
class SuicidePickModel extends ValidationModel
{
	protected $errorMessages = array
	(
		'tooLateForPicks' => "It's too late to make or change a pick now. The first game of the week has started!",

		'funkyBehavior' => "Something really funky happened. We apologize for the inconvenience, but try reloading the page and
							place your wagers again. We apologize for the inconvenience!",

		'userIsDead' => "Sorry to tell you this, but you're dead, buddy. You're done in this pool."
	);

	protected $requiredFields = array
	(
	);

	// -------- CLASS MEMBERS -------------

	protected $teamId = '';
	protected $suicidePoolId = '';

	protected $DAO;

	// --------- CONSTRUCTOR --------------

	public function __construct()
	{
		// Initiate the connection to the database
		$this->DAO = new SuicidePicksDAO();

		return $this;
	}

	// ------- ACCESSOR/VALIDATION FUNCTIONS --------------

	public function getTeamId() 
	{
		return $this->teamId;
	}

	protected function setTeamId($val)
	{
		$validators = array
		(
			$this->validateField($val, '', array($this, 'checkWhetherWeekStarted'), $this->errorMessages['tooLateForPicks']),
			$this->validateField($val, '', array($this, 'checkWhetherTeamExists'), $this->errorMessages['funkyBehavior']),
		);

		return $this->genericSetter($val, $validators, __FUNCTION__);
	}

	public function getSuicidePoolId()
	{
		return $this->suicidePoolId;	
	}

	protected function setSuicidePoolId($val)
	{
		$validators = array
		(
			$this->validateField($val, '', array($this, 'checkWhetherUserIsStillAlive'), $this->errorMessages['userIsDead']),
		);

		return $this->genericSetter($val, $validators, __FUNCTION__);
	}

	// ------- SPECIALIZED VALIDATION FUNCTIONS --------

	/**
	  * Determines whether the regular season week has already begun
	  *
	  * @returns - a boolean indicating whether the first game of the week has started
	  *
	  * @author kinsho
	  */
    protected function checkWhetherWeekStarted()
	{
		return $this->DAO->checkIfWeekStarted();
	}

	/**
	  * Determines whether the team ID actually corresponds to a real team within the database
	  *
	  * @param $teamID - the team ID that will need to be tested
	  * @returns - a boolean indicating whether the team ID is a legit ID
	  *
	  * @author kinsho
	  */
    protected function checkWhetherTeamExists($teamID)
	{
		return $this->DAO->checkIfTeamExists($teamID);
	}

	/**
	  * Determines whether the user is still alive within the suicide pool indicated by the passed ID
	  *
	  * @param $suicidePoolID - the ID of the suicide pool in which the user's status will be checked
	  * @returns - a boolean indicating whether the user is still alive within the suicide pool
	  *
	  * @author kinsho
	  */
    protected function checkWhetherUserIsStillAlive($suicidePoolID)
	{
		return $this->DAO->checkIfUserIsStillAlive($suicidePoolID);
	}

}
?>