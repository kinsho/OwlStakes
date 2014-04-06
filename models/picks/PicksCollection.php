<?php

/**
  * Class that will serve to store and validate all data on the registration form.
  *
  * @author kinsho
  */
class PicksCollection extends ValidationCollection
{
	protected $errorMessages = array
	(
		'wagerTooMuch' => "You can not wager over a hundred points for any given week.
						   Lessen one or more of your wagers.",

		'weekLocked' => "More than three games scheduled for this week have already begun.
						 You cannot place any more wagers for the rest of the games this week at this point."
	);

	protected $requiredFields = array
	();

	// -------- CLASS MEMBERS -------------

	protected $DAO;

	// --------- CONSTRUCTOR --------------
	
	public function __construct()
	{
		parent::__construct();

		$DAO = new PicksDAO();
	}

	// -------- UTILITY FUNCTIONS ----------------------

	/**
	  * Preps all the validation functions for invocation. Also readies the error messages
	  * that may need to be displayed should the collection fail to pass any of the validation
	  * functions
	  *
	  * @author kinsho
	  */
	public function initiateValidationFunctions()
	{
		$this->addValidationFunction('PicksCollection::assessTotalPointsAllocated', $this->errorMessages['wagerTooMuch']);
		$this->addValidationFunction('PicksCollection::assessWhetherWeekIsLocked', $this->errorMessages['weekLocked']);
	}

	// ------- SPECIALIZED VALIDATION FUNCTIONS --------

	/**
	  * Determines whether not more than a hundred points were allocated across
	  * a user's picks for a week
	  *
	  * @param $picks - the array of Pick models that will have their wagers summed to
	  *					determine whether the user has allocated more than a hundred points
	  * @returns a boolean indicating more than a hundred points were spread out across the picks
	  *
	  * @author kinsho
	  */
    protected static function assessTotalPointsAllocated($picks)
	{
		$totalPoints = 0;
		$wager;

		foreach ($picks as $pick)
		{
			$wager = $pick->getWager();
			$totalPoints += ($wager ? $wager : 0);
		}

		return $totalPoints <= 100;
	}

	/**
	  * Determines whether users are still allowed to place wagers on the current week
	  *
	  * @returns - a boolean indicating whether the user can still place wagers on the current week's spate of games
	  *
	  * @author kinsho
	  */
    protected static function assessWhetherWeekIsLocked()
	{
		return $this->DAO->checkWhetherWeekIsLocked();
	}
}



?>