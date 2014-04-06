// ------------------ PICKS OBJECT ------------------------

window.picks =
{
	/**
	  * Function responsible for initiating a server-side call to save all the
	  * picks into the database
	  *
	  * @author kinsho
	  */
	save: function(event)
	{
		var data = formSubmit.collectData('picksForm');

		utilityFunctions.ajax(
		{
			type: 'POST',
			url: '/picks/save',
			data: data
		}, event);
	},

	/**
	  * Function responsible for initiating a server-side call to fetch all the data
	  * pertaining to a certain week. Function will then modify the page to convey the
	  * new data.
	  *
	  * @author kinsho
	  */
	changeWeek: function(event)
	{
		var view = event.data.view,
			data = formSubmit.collectData('weekSelectorSpan'),
			$button = $(event.currentTarget);

		utilityFunctions.ajax(
		{
			type: 'POST',
			url: '/picks/changeWeek',
			data: data,
			beforeSend: function()
			{
				$('#gameMultipliersSection').addClass('fadeOut');
				$('#picksListing').addClass('fadeOut');
			},
			complete: function()
			{
				// Delay the fading in of the picks container until all script execution has ceased
				window.setTimeout(function()
				{
					$('#picksListing').removeClass('fadeOut');
					$('#gameMultipliersSection').removeClass('fadeOut');
				}, 100);
			},
			customSuccessHandler: function(response)
			{
				var response = $.parseJSON(response),
					games = response.games,
					wagers = response.wagers,
					$gameRows = $('div.gameRow'),
					winnerClass = 'emphasizeWinner', // class responsible for bolding the winner of each game
					index,
					i;

				// Enable the button again to allow the user to change the week again if he wishes to
				$button.attr('disabled', false);

				// In case more rows are needed to store data for games, generate the
				// additional rows needed by copying existing rows
				for (i = $gameRows.length - games.length; i > 0; i -= 1)
				{
					$gameRows.last().before($gameRows[0]);
				}
				// In case less rows are needed to store data for games, remove the excess
				// number of rows
				for (i = games.length - $gameRows.length; i > 0; i -= 1)
				{
					$gameRows.last().prev().detach();
				}

				// Now repopulate the data within each row using the information returned by the server
				index = 0;
				$('div.gameRow').each(function()
				{
					var $this = $(this),
						$spans = $this.find('span'),
						$underdogSlot = $spans.filter('.twoOverNine').eq(0),
						$favoriteSlot = $spans.filter('.twoOverNine').eq(1),
						$kickoffTimeSlot = $spans.filter('.oneOverNine').eq(1),
						$spreadSlot = $spans.filter('.oneOverNine').eq(2),
						$wagerTextFieldSlot = $this.find('input[type=text]'),
						$bonusMultiplierSlot = $this.find('span.bonusMultiplier'),
						game = games[index],
						wager = wagers[game['id']],
						isNoWagersGame = (game['homeTeam'] === 0), // Conditional test to determine whether the game represents a 'no upsets' wager
						isUnderdogHomeTeam = (game['homeTeam'] === game['underdog']),
						isCurrentWeek = ($('#weekSelector').val() === $('#currentWeek').val()),
						underdog = (isUnderdogHomeTeam ? game['homeTeam'] : game['awayTeam']),
						favorite = (isUnderdogHomeTeam ? game['awayTeam'] : game['homeTeam']),
						dateTimeSplit = game['kickoffTime'].split('-'), // Split the date and time of the game up into separate strings
						spread = game['spread'],
						didUnderdogWin = game['didUnderdogWin'],
						payoutColumnHeader = $('#payoutColumnLabel'),
						pointMultiplier;

					// Reset the background colors on each row using the index to keep track
					if (index % 2 === 0)
					{
						$this.removeClass('odd');
					}
					else
					{
						$this.addClass('odd');
					}

					// Determine the bonus multiplier that will be applied to each game if the upset pans out
					if (!(spread))
					{
						pointMultiplier = 5;
					}
					else if (spread <= 3.5)
					{
						pointMultiplier = 1;					
					}
					else if (spread <= 7)
					{
						pointMultiplier = 1.25;
					}
					else if (spread <= 10.5)
					{
						pointMultiplier = 1.5;
					}
					else if (spread <= 14)
					{
						pointMultiplier = 1.8;
					}
					else
					{
						pointMultiplier = 2.5;
					}

					if (!isNoWagersGame)
					{						
						$underdogSlot.find('span').html(underdog);
						$favoriteSlot.find('span').html(favorite);

						// Bold the winner of the game
						$favoriteSlot.find('span').removeClass(winnerClass);						
						$underdogSlot.find('span').removeClass(winnerClass);
						if (didUnderdogWin === 1)
						{
							$underdogSlot.find('span').addClass(winnerClass);
							$favoriteSlot.find('span').removeClass(winnerClass);
						}
						else if (didUnderdogWin === 0)
						{
							$favoriteSlot.find('span').addClass(winnerClass);						
							$underdogSlot.find('span').removeClass(winnerClass);
						}

						// Put the 'home' indicator next to the team playing at home
						if (underdog === game['homeTeam'])
						{
							$underdogSlot.addClass('homeBefore');
							$favoriteSlot.removeClass('homeAfter');
						}
						else
						{
							$underdogSlot.removeClass('homeBefore');
							$favoriteSlot.addClass('homeAfter');						
						}

						$kickoffTimeSlot.html(dateTimeSplit[0] + '<br />' + dateTimeSplit[1]);
						$spreadSlot.html(spread);
					}

					// Update the data stored around each input field to reflect the games currently in context
					$wagerTextFieldSlot.val(wager || 0);
					$wagerTextFieldSlot.data('underdogWon', didUnderdogWin);
					$bonusMultiplierSlot.html(pointMultiplier);

					// Disable the input field only if the game has already started or ended
					$wagerTextFieldSlot.attr('disabled', !( (isCurrentWeek) && ($wagerTextFieldSlot.find('span.lockedFont').length) ) );

					// Fix the label on the last column depending on whether the current week is in context
					payoutColumnHeader.html(isCurrentWeek ? 'Potential Payout' : 'Realized Payout');

					index += 1;
				});

				// Calculate the realized points for all past wagers for that week
				$('fieldset').find('input[type=text]').trigger('change');

				// Update the games multiplier illustration for the newly displayed week
				view.updateGameMultipliersBonus();

				// Update the points accrued tab to illustrate how many points were accumulated for the week in context
				view.calculatePointsAccrued();
			}
		}, event);
	},

	/**
	  * Function responsible for making sure that the user has not allocated more than
	  * 100 points across all the games for any given week
	  *
	  * @author kinsho
	  */
	checkPointTotals: function()
	{
		var $gameWagerFields = $('fieldset').find('input[type=text]');

		return function()
		{
			var pointTotal = 0,
				parsedFieldValue;

			$gameWagerFields.each(function()
			{
				parsedFieldValue = window.parseInt(this.value, 10);

				pointTotal += (parsedFieldValue ? parsedFieldValue : 0);
			});

			return pointTotal <= 100;
		};
	}(),

	/**
	  * Function responsible for calculating and displaying the potential points that can be accrued
	  * using the value within the input field that invoked this function
	  *
	  * @param event - the event from the input field that triggered this function call
	  *
	  * @author kinsho
	  */
	calculatePotentialPoints: function(event)
	{
		var $wagerField = $(event.currentTarget),
			$wagerFieldCell = $wagerField.closest('.oneOverNine'),
			didUnderdogWin = $wagerField.data('underdogWon'),
			$potentialPointsDisplay = $wagerFieldCell.next(),
			isNoUpsetWagerField = $wagerField.closest('div').find('#noPickHint').length,
			spread = (isNoUpsetWagerField ?  -1 : window.parseFloat($wagerFieldCell.prev().html())),
			wager = window.parseInt($wagerField.val(), 10),
			potentialPoints = wager,
			positiveFont = 'bigPositiveFont',
			negativeFont = 'bigNegativeFont',
			neutralFont = 'bigNeutralFont';

		// Fix the style of the font on the display cell here depending on whether the
		// game ended and how it ended
		if (didUnderdogWin === 1)
		{
			$potentialPointsDisplay.addClass(positiveFont);
			$potentialPointsDisplay.removeClass(negativeFont);
			$potentialPointsDisplay.removeClass(neutralFont);
		}
		else if ( (didUnderdogWin === 0) && (potentialPoints > 0) )
		{
			$potentialPointsDisplay.removeClass(positiveFont);
			$potentialPointsDisplay.addClass(negativeFont);
			$potentialPointsDisplay.removeClass(neutralFont);
			potentialPoints = 0;
		}
		else
		{
			$potentialPointsDisplay.removeClass(positiveFont);
			$potentialPointsDisplay.removeClass(negativeFont);		
			$potentialPointsDisplay.addClass(neutralFont);
		}

		// Alter the potential/realized points depending on the spread
		if (spread < 0)
		{
			potentialPoints *= 5;
		}
		else if (spread <= 3.5)
		{
			potentialPoints *= 1;
		}
		else if (spread <= 7)
		{
			potentialPoints *= 1.25;
		}
		else if (spread <= 10.5)
		{
			potentialPoints *= 1.5;
		}
		else if (spread <= 14)
		{
			potentialPoints *= 1.8;
		}
		else
		{
			potentialPoints *= 2.5;
		}

		// Update the cell to display the correct number of potential/realized points
		$potentialPointsDisplay.html((potentialPoints > 0) ? potentialPoints.toFixed(1) : 0);
	},

	/**
	  * Function serves to calculate the amount of points that the user can still allocate 
	  * for the week. Upon finishing calculations, the function will then update the relevant
	  * display counter indicating to the user how many points are still available to allocate
	  *
	  * @author kinsho
	  */
	calculatePointsAvailable: function()
	{
		var $gameWagerFields = $('fieldset').find('input[type=text]'),
			$pointsAvailableDisplay = $('#pointsAvailable'),
			parsedFieldValue = 0,
			pointTotal = 0;

		
		$gameWagerFields.each(function()
		{
			parsedFieldValue = window.parseInt(this.value, 10);

			pointTotal += ((parsedFieldValue && parsedFieldValue > 0) ? parsedFieldValue : 0);
		});

		$pointsAvailableDisplay.html(100 - pointTotal);
	},

	/**
	  * Function serves to calculate and update the display counters used to deduct the game
	  * multiplier bonus
	  *
	  * @author kinsho
	  */
	updateGameMultipliersBonus: function()
	{
		var $gameWagerFields = $('fieldset').find('input[type=text]')
			$upsetsCorrectlyPredictedField = $('#upsetsPredictedCounter'),
			$upsetsIncorrectlyPredictedField = $('#upsetsIncorrectlyPredictedCounter'),
			$gameBonusMultiplierField = $('#bigGameMultiplier').find('span'),
			$noGoImage = $gameBonusMultiplierField.siblings('img'),
			gameBonusMultiplier = 0,
			correctCounter = 0,
			incorrectCounter = 0;

		// Find out how many games the users predicted correctly and incorrectly
		$gameWagerFields.each(function()
		{
			var $this = $(this),
				whoWon = $this.data('underdogWon'),
				wagerMade = (window.parseInt(this.value, 10) > 0);

			if ((whoWon === 1) && (wagerMade))
			{
				correctCounter += 1;
			}
			else if ((whoWon === 0) && (wagerMade))
			{
				incorrectCounter += 1;
			}
		});

		// Calculate the game bonus multiplier
		gameBonusMultiplier = correctCounter - (incorrectCounter / 2);

		// Populate the relevant fields within the game bonus multiplier illustration for the
		// current week
		$upsetsCorrectlyPredictedField.html(correctCounter);
		$upsetsIncorrectlyPredictedField.html(incorrectCounter);
		$gameBonusMultiplierField.html(gameBonusMultiplier);

		// Hide the 'no go' sign if the game bonus is greater than or equal to one
		// or if the week in context is the current week and the current week has not ended yet
		$gameWagerFields.slice(0, -1); // Remove the 'no upsets' wager for now
		if ( (gameBonusMultiplier >= 1) || !($gameWagerFields.last().attr('disabled')) )
		{
			$noGoImage.addClass('hidden');
		}
		else
		{
			$noGoImage.removeClass('hidden');
		}
	},

	/**
	  * Function serves to calculate how many points the user has accumulated so far
	  * for the week through his or her successful wagers. It will then display
	  * that total in the informational tab above the picks table
	  *
	  * @author kinsho
	  */
	calculatePointsAccrued: function()
	{
		var $gameWagerFields = $('fieldset').find('input[type=text]'),
			$pointsAccruedField = $('#pointsAccrued'),
			pointTotal = 0,
			correctCounter = 0,
			incorrectCounter = 0,
			gameBonusMultiplier;

		// Find out how many games the users predicted correctly and incorrectly
		$gameWagerFields.each(function()
		{
			var $this = $(this),
				whoWon = $this.data('underdogWon'),
				wagerMade = (window.parseInt(this.value, 10) > 0),
				pointsEarned;

			if ((whoWon === 1) && (wagerMade))
			{
				correctCounter += 1;

				// Look at the cell to the right to figure out the number of points
				// to add to the running total
				pointsEarned = $this.closest('span.oneOverNine').next().html();
				pointTotal += window.parseFloat(pointsEarned);
			}
			else if ((whoWon === 0) && (wagerMade))
			{
				incorrectCounter += 1;
			}
		});

		gameBonusMultiplier = correctCounter - (incorrectCounter / 2);
		pointTotal = (gameBonusMultiplier >= 1 ? pointTotal * gameBonusMultiplier : pointTotal);

		$pointsAccruedField.html(pointTotal);
	},

	/**
	  * Function serves to correct certain CSS properties on the document if
	  * the user is browsing through Internet Explorer
	  *
	  * @author kinsho
	  */
	  fixInternetExplorerStylingIssues: function()
	  {
		if ( (window.navigator.appName == 'Microsoft Internet Explorer') ||
			 (window.navigator.userAgent.indexOf('Trident') >= 0) )
		{
			$('.lockedFont').css('top', '-12px');
		}
	  },

	/**
	  * Function responsible for initializing all listeners on the picks page
	  *
	  * @author kinsho
	  */
	initListeners: function()
	{
		document.getElementById('submitButton').onclick = this.save;
		$('#changeWeekButton').on('click', { view: this }, this.changeWeek);
		$('fieldset').find('input[type=text]').on('change', this.calculatePotentialPoints);
		$('fieldset').find('input[type=text]').on('change', this.calculatePointsAvailable);
	},

	/**
	  * Initializer function
	  *
	  * @author kinsho
	  */
	initialize: function()
	{
		this.initListeners();
		this.fixInternetExplorerStylingIssues();
		this.updateGameMultipliersBonus();

		// Calculate potential points for all preset wagers
		$('fieldset').find('input[type=text]').trigger('change');

		// Only calculate the points accrued once all the potential points have been calculated
		this.calculatePointsAccrued();
	}

};

// -------------------------------------------------------------

$(document).ready(function()
{
	picks.initialize();
});