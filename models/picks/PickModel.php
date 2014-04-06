<?php

/**
  * Class that will serve to store and validate all data from the main picks screen.
  *
  * @author kinsho
  */
class PickModel extends ValidationModel
{
	protected $errorMessages = array
	(
		'wagerImproper' => "If you aim to make a wager for any of the games above, you can only put positive whole
							numbers in the wager fields above. A zero or an empty wager field is interpreted as there 
							being no wager made for the game associated with that field.",
		'wagerTooMuch' => "You can not wager over a hundred points for any given week. Lessen one or more of your
						   wagers.",

		'dateOfGameInvalid' => "Something funky happened. It's possible that one of the games for which you tried to place
								a wager just now has just started. Try reloading the page and place your wagers again. We
								apologize for the inconvenience!"
	);

	protected $requiredFields = array
	(
	);

	// -------- CLASS MEMBERS -------------

	protected $gameId = '';
	protected $wager = '';

	protected $DAO;

	// --------- CONSTRUCTOR --------------

	public function __construct()
	{
		// Initiate the connection to the database
		$this->DAO = new PicksDAO();

		return $this;
	}

	// ------- ACCESSOR/VALIDATION FUNCTIONS --------------

	public function getGameId() 
	{
		return $this->gameId;
	}

	protected function setGameId($val)
	{
		$validators = array
		(
			$this->validateField($val, '', array($this, 'checkDateOfGame'), $this->errorMessages['dateOfGameInvalid'])
		);

		return $this->genericSetter($val, $validators, __FUNCTION__);
	}

	public function getWager() 
	{
		return $this->wager;
	}

	protected function setWager($val)
	{
		$validators = array
		(
			$this->validateField($val, '', 'ValidationModel::assessNonNegativeInteger', $this->errorMessages['wagerImproper'])
		);

		return $this->genericSetter($val, $validators, __FUNCTION__);
	}

	// ------- SPECIALIZED VALIDATION FUNCTIONS --------

	/**
	  * Determines whether the game has started already or isn't set to kick off any time
	  * within the current week.
	  *
	  * @param $gameId - the ID of the game that needs to have its date and kickoff time checked
	  * @returns a boolean indicating whether the game is set within the current week
	  *			 and has not started yet
	  *
	  * @author kinsho
	  */

    protected function checkDateOfGame($gameId)
	{
		return $this->DAO->validateKickoffTime($gameId);
	}
}
?>