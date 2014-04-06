// ------------------ PROGRESS OBJECT ------------------------

window.progress =
{
	UTILITY_NAME: 'progressUtility',

	/**
	  * Function responsible for highlighting the task row over which the user is
	  * currently hovering
	  *
	  * @param event {Event} - the event responsible for triggering this function
	  *
	  * @author kinsho
	  */
	highlightRow: function(event)
	{
		// Stop the event from propagating to the parent elements
		event.stopPropagation();

		$(event.currentTarget).addClass('highlight');
	},

	/**
	  * Function responsible for restoring the background-color of the task row to its
	  * original neutral color
	  *
	  * @param event {Event} - the event responsible for triggering this function
	  *
	  * @author kinsho
	  */
	unhighlightRow: function(event)
	{
		// Stop the event from propagating to the parent elements
		event.stopPropagation();

		$(event.currentTarget).removeClass('highlight');
	},

	/**
	  * Function responsible for exposing and concealing a parent task's children
	  *
	  * @param event {Event} - the event responsible for triggering this function
	  *
	  * @author kinsho
	  */
	exposeConcealChildren: function(event)
	{
		var $icon = $(event.currentTarget)
			$parentTask = $icon.closest('div'),
			$children = $parentTask.children('.levelTwo, .levelThree');

		if ($icon.hasClass('collapsed'))
		{
			$icon.removeClass('collapsed');
			$children.show();
		}
		else
		{
			$icon.addClass('collapsed');
			$children.hide();
		}
	},

	/**
	  * Function responsible for initializing all listeners on the progress page
	  *
	  * @author kinsho
	  */
	initListeners: function()
	{
		var $tasks = $('.levelOne, .levelTwo, .levelThree');

		// For each task row, set up a hover listener that would highlight the row
		// and a mouseout listener to take away the highlight effect
		$tasks.on('mouseover', this.highlightRow);
		$tasks.on('mouseout', this.unhighlightRow);

		// For each task with children, set up a listener to expose and conceal that
		// task's children
		$('.collapsibleIcon').find('img').on('click', this.exposeConcealChildren);
	},

	/**
	  * Initializer function
	  *
	  * @author kinsho
	  */
	initialize: function()
	{
		var view = this,
			$levelOneTasks = $('.levelOne');

		// Set up the collapsible icons first before initializing listeners
		window[view.UTILITY_NAME].setUpCollapsibleIcons();

		this.initListeners();

		// Initiate the processing necessary to render all the progress bars
		$levelOneTasks.each(function()
		{
			window[view.UTILITY_NAME].renderProgressBars($(this));
		});

		// Style the difficulty metrics for each task
		window[view.UTILITY_NAME].markDifficulty();

		// Conceal all the sub-level tasks from view
		$('.collapsibleIcon').find('img').trigger('click');
	}
};

// -------------------------------------------------------------

$(document).ready(function()
{
	progress.initialize();
});