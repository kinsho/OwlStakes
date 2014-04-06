// ------------------ PROGRESS UTILITY OBJECT ------------------------

window.progressUtility =
{
	PERCENTAGE_CLASS: 'percentage',
	PROGRESS_BAR_OUTLINE_CLASS: 'barOutline',
	PROGRESS_BAR_CLASS: 'bar',
	DIFFICULTY_FIVE_PLUS_CLASS: 'difficultyFivePlus',
	COLLAPSIBLE_ICON_URL: '/../../images/smallCollapsibleArrow.png',

	/**
	  * Function responsible for converting all hard-coded percentage amounts
	  * into progress bars
	  *
	  * @param element {HTMLNode} - element that needs to be converted into a progress bar
	  * @param percentage {Float} - the percentage that will be used to render the progress bar
	  *
	  * @author kinsho
	  */
	convertPercentageToBar: function(element, percentage)
	{
		var barSpan,
			percentageSpan,
			barLength;

		// Take out the percentage here. We'll reset it once we generate a
		// progress bar
		element.innerHTML = '';

		// Create the additional elements that will be needed to fully render
		// the progress bar
		barSpan = document.createElement('span');
		barSpan.className = this.PROGRESS_BAR_CLASS;
		percentageSpan = document.createElement('span');
		percentageSpan.className = this.PERCENTAGE_CLASS;

		// Now create the progress bar
		element.className = this.PROGRESS_BAR_OUTLINE_CLASS;
		element.appendChild(barSpan);
		element.appendChild(percentageSpan);

		// Display the percentage within the progress bar and make sure to
		// extend the bar appropriately to reflect that percentage
		percentageSpan.innerHTML = percentage + '%';
		barLength = window.parseInt(window.getComputedStyle(element).getPropertyValue('width'), 10);
		barSpan.style.width = barLength * (percentage / 100)
	},

	/**
	  * Function responsible for crunching the numbers necessary to 
	  * properly render a progress bar for the passed task
	  *
	  * @param $task {jQuery Node} - the DIV element that represents the task to be
	  *						evaluated here
	  *
	  * @author kinsho
	  */
	renderProgressBars: function($task)
	{
		var view = this, // a reference to the Progress object itself
			$percentageSpan = $task.children('span.percentage'),
			$difficultySpan = $task.children('span.difficulty'),
			percentage = window.parseFloat($percentageSpan.html().trim()) || 0,
			difficulty = window.parseInt($difficultySpan.html().trim(), 10) || 0,
			$childTasks = $task.children('div');

		/*
		 * If no difficulty was found associated with the task, it must be calculated from
		 * the collective difficulty of the task's children. Then we can calculate
		 * the progress on this particular task
		 */
		if ( !(difficulty) )
		{
			$childTasks.each(function()
			{
				var $this = $(this),
					$childPercentageSpan = $this.children('span.percentage'),
					$childDifficultySpan = $this.children('span.difficulty'),
					childPercentage = window.parseFloat($childPercentageSpan.html().trim()),
					childDifficulty = window.parseInt($childDifficultySpan.html().trim(), 10) || 0;

				/*
				 * If a difficulty has been recorded for this child task, the child also
				 * has a recorded progress percentage that can be used to render a
				 * corresponding progress bar
				 */
				if (childDifficulty)
				{
					view.convertPercentageToBar($childPercentageSpan[0], childPercentage);
				}
				/*
				 * Otherwise, no difficulty was recorded for this task, which means that we're
				 * dealing with a child task that itself is a parent that will need to have
				 * its difficulty and progress computed as well
				 */
				else
				{
					view.renderProgressBars($this);

					// Now fetch the difficulty and progress percentage metrics from their
					// respective slots
					$childPercentageSpan = $this.children('span.barOutline').find('.percentage'); // Reset the span variable as its location within the DOM is now different
					childPercentage = window.parseFloat($childPercentageSpan.html().trim());
					childDifficulty = window.parseInt($childDifficultySpan.html().trim(), 10);
				}

				difficulty += childDifficulty; 
				percentage += (childPercentage * childDifficulty);

			});

			// Now calculate the percentage that will be used to render the parent's progress bar
			percentage /= difficulty;

			// Now set the difficulty value where it needs to be set
			$difficultySpan.html(difficulty);
		}

		// With the percentage amount in hand, create the progress bar
		this.convertPercentageToBar( $percentageSpan[0], Math.round(percentage) );
	},

	/**
	  * Function responsible for setting up collapsible icons for the tasks
	  * that have descendent tasks
	  *
	  * @author kinsho
	  */
	setUpCollapsibleIcons: function()
	{
		var view = this,  // reference to the ProgressUtility object
			$tasks = $('.levelOne, .levelTwo');

		// Go through each potential task to determine its parenthood
		// and set up collapsible icons, if necessary
		$tasks.each(function()
		{
			var $this = $(this),
				$childTasks = $this.children('div'),
				collapsibleSpan,
				imageElement;

			// If the task has children, set up a collapsible icon before the task itself
			if ($childTasks.length)
			{
				// Create a span to house the icon
				collapsibleSpan = document.createElement('span');
				collapsibleSpan.className = 'collapsibleIcon';

				// Create the image element for the icon
				imageElement = document.createElement('img');
				imageElement.src = view.COLLAPSIBLE_ICON_URL;

				// Now place the icon before the text associated with the task
				$this.children().eq(0).before(collapsibleSpan);
				collapsibleSpan.appendChild(imageElement);
			}
		});
	},

	/**
	  * Function responsible for styling the difficulty metrics associated with
	  * each task
	  *
	  * @author kinsho
	  */
	markDifficulty: function()
	{
		var view = this, // a reference to the progress utility object
			$difficultySpans = $('.difficulty');

		$difficultySpans.each(function()
		{
			var $this = $(this),
				contentSpan,
				difficulty = window.parseInt(this.innerHTML.trim(), 10);

			/* 
			 * Move the difficulty metric to a newly created span that will
			 * be appended to the current element as a child. This is done
			 * to center the text within the circle
			 */
			contentSpan = document.createElement('span');
			this.innerHTML = '';
			contentSpan.innerHTML = difficulty + '';
			this.appendChild(contentSpan);

			if (difficulty > 5)
			{
				$this.addClass(view.DIFFICULTY_FIVE_PLUS_CLASS);			
			}
		});
	}
}