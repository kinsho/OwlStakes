// ------------------ STATS OBJECT ------------------------

window.stats =
{
	TABLE_SLIDING_DELAY: 1250, // Duration of any table sliding animation
	TABLE_FADE_DELAY: 500, // Duration of any table fading animation

	/**
	  * Function generates the points distribution graph using a utility function
	  * within the visual effects library
	  *
	  * @author kinsho
	  */
	generatePointDistributionGraph: function()
	{
		var data = [],
			yAxisLabel = 'contestants',
			i;

		for (i = Bootstrapped.pointDistributionData.length - 1; i >= 0; i -= 1)
		{
			data.push
			({
				x : Bootstrapped.pointDistributionData[i].totalPoints,
				y : Bootstrapped.pointDistributionData[i].contestants
			});
		}
		visualEffects.createDistributionGraph(data, yAxisLabel);
	},

	/**
	  * Function is responsble for collapsing and expanding the weekly stats table
	  *
	  * @param e - event object representing a click on a collapsible arrow icon
	  *
	  * @author kinsho
	  */
	showHideWeekSection: function(e)
	{
		var view = stats,
			$deferred = $.Deferred(),
			$arrowImage = $(e.currentTarget),
			$weekSections = $arrowImage.closest('table').
				nextAll('.overallPredictions:first, .topPredictors:first'),
			duration = view.TABLE_SLIDING_DELAY,
			activeSection;

		// The iterative function below finds the currently active sub-section that should
		// be either expanded or collapsed
		$weekSections.each(function()
		{
			if ($(this).data('is-active'))
			{
				activeSection = this;
				return false;
			}
		});

		// Logic responsible for rotating the collapsible arrow icon and expanding
		// or collapsing the neighboring table body
		if ($arrowImage.hasClass('rotateAround'))
		{
			$arrowImage.removeClass('rotateAround');
			visualEffects.slideTableUp(activeSection, duration, function()
			{
				$deferred.resolve();
			});
		}
		else
		{
			// First, before expanding any sections, clean up any leftover animation logic
			$weekSections.not(activeSection).addClass('fadeOut');
			$weekSections.filter(activeSection).removeClass('fadeOut');

			$arrowImage.addClass('rotateAround');		
			visualEffects.slideTableDown(activeSection, duration, function()
			{
				$deferred.resolve();
			});
		}

		return $deferred.promise();
	},

	/**
	  * Function is responsible for displaying and hiding the weekly sub-sections
	  * depending on the user input
	  *
	  * @param e - event object representing a click on the toggle switch to indicate
	  *            which which sub-section needs to be shown
	  *
	  * @author kinsho
	  */
	shiftWeekSection: function(event)
	{
		var view = event.data.view,
			$clickedToggleSwitch = $(event.currentTarget),
			$arrowImage = $clickedToggleSwitch.closest('tr').find('img.clickable'),
			sectionToShow = $clickedToggleSwitch.data('associated-section'),
			$associatedSections = $clickedToggleSwitch.closest('table').
				nextAll('.overallPredictions:first, .topPredictors:first'),
			$currentSection = $associatedSections.not('.' + sectionToShow),
			$selectedSection = $associatedSections.filter('.' + sectionToShow);

		// If the section that needs to be displayed is already displayed, there is no need
		// to run any more logic
		if ($selectedSection.is(':visible'))
		{
			return false;
		}

		$currentSection.data('is-active', '');
		$selectedSection.data('is-active', 'true');

		if ($arrowImage.hasClass('rotateAround'))
		{
			$currentSection.addClass('fadeOut');

			// Delay the next animation until the prior fading animation has ended
			window.setTimeout(function()
			{
				// Prep the section to be displayed for visibility. Make sure to
				// fully hide the other section in the process
				$selectedSection.show();
				$currentSection.hide();

				// Fade in the section to be displayed
				$selectedSection.removeClass('fadeOut');

			}, view.TABLE_FADE_DELAY);
		}
		else
		{
			// Trigger the animation responsible for expanding the section
			$arrowImage.trigger('click');
		}
	},

	/**
	  * Function responsible for adjusting the heights on each set of weekly subsections
	  * so that each pair of subsection heights match up with one another
	  *
	  * @author kinsho
	  */
	adjustHeights: function()
	{
		var $overallPredictionsSections = $('.overallPredictions'),
			$topPredictorsSections = $('.topPredictors'),
			$biggerSection,
			$smallerSection,
			$smallerSectionRows,
			i;

		for (i = $overallPredictionsSections.length - 1; i >= 0; i -= 1)
		{
			// Identify and record references to the bigger and smaller subsection
			if ($overallPredictionsSections[i].offsetHeight > $topPredictorsSections[i].offsetHeight)
			{
				$biggerSection = $overallPredictionsSections.eq(i);
				$smallerSection = $topPredictorsSections.eq(i);
			}
			else
			{
				$biggerSection = $topPredictorsSections.eq(i);
				$smallerSection = $overallPredictionsSections.eq(i);			
			}

			// Ignore the header row when pulling all the records in the smaller section
			$smallerSectionRows = $smallerSection.find('tr').not(':first');

			// Adjust the heights of the records within the smaller section by using the combined
			// height of the records within the bigger section to make some calculations
			$smallerSectionRows.css('height',
				( $biggerSection[0].offsetHeight - $biggerSection.find('.headerRow')[0].offsetHeight ) / 
				$smallerSectionRows.length + 'px' );
		}
	},

	/**
	  * Function responsible for initializing all listeners on the stats page
	  *
	  * @author kinsho
	  */
	initListeners: function()
	{
		// Expanding/collapsing the weekly data stats
		$('.detachedHead').find('img.clickable')
			.click(utilityFunctions.debouncer(this.showHideWeekSection, 1));

		$('.rightToggleSwitch').on('click', { view: this }, this.shiftWeekSection);
		$('.leftToggleSwitch').on('click', { view: this }, this.shiftWeekSection);
	},

	/**
	  * Initializer function
	  *
	  * @author kinsho
	  */
	initialize: function()
	{
		this.initListeners();
		this.adjustHeights();

		// Ensure that all weekly data tables are initially collapsed except for the latest data table
		$('.detachedBody').hide();
		$('.detachedHead:first').find('img.clickable').trigger('click');
	}

};

// -------------------------------------------------------------

$(document).ready(function()
{
	stats.initialize();
	stats.generatePointDistributionGraph();
});
