window.visualEffects =
{
	/**
	  * Function is responsible for fading elements into display.
	  * 
	  * @param element - the element that is to be faded into view.
	  * @param duration - the amount of time that will be spent fading the element into view (in milliseconds).
	  * @param startFromZeroOpacity - indicates whether the element should be made completely transparent before being faded into view.
	  * @param callback - if specified, a callback function to invoke after the fading animation is finished.
	  *
	  * @author kinsho
	  */
	fadeIn: function(element, duration, callback)
	{
		var elementStyle = element.style,
			intervals,
			jumps,
			timeDelay;

		duration = Math.max(duration, 10);
		intervals = Math.floor(duration / 10);
		jumps = (1 - elementStyle.opacity) / intervals;
		timeDelay = 0;

		do
		{
			setTimeout(function() { elementStyle.opacity = parseFloat(elementStyle.opacity) + jumps; }, timeDelay += 10);
		}
		while (intervals -= 1);

		if (callback)
		{
			setTimeout(callback, timeDelay += 10);
		}
	},

	/**
	  * Function is responsible for fading elements out of display.
	  * 
	  * @param element - the element that is to be faded out of view.
	  * @param duration - the amount of time that will be spent fading the element out of view (in milliseconds).
	  * @param startFromFullOpacity - indicates whether the element should be made completely opaque before being faded out of view.
	  * @param callback - if specified, a callback function to invoke after the fading animation is finished.
	  *
	  * @author kinsho
	  */
	fadeOut: function(element, duration, callback)
	{
		var elementStyle = element.style,
			intervals,
			jumps,
			timeDelay;

		duration = Math.max(duration, 10);
		intervals = Math.floor(duration / 10);
		jumps = elementStyle.opacity / intervals;
		timeDelay = 0;

		do
		{
			setTimeout(function() { elementStyle.opacity = parseFloat(elementStyle.opacity) - jumps; }, timeDelay += 10);
		}
		while (intervals -= 1);

		if (callback)
		{
			setTimeout(callback, timeDelay += 10);
		}
	},

	/**
	  * Function is responsible for sliding tables down into view.
	  * 
	  * @param tableElement - the table element that is to be slid into view.
	  * @param duration - the amount of time that the animation should span 
	  * @param callback - if specified, the callback function that executes following the animation
	  *
	  * @author kinsho
	  */
	slideTableDown: function(tableElement, duration, callback)
	{
		var $tableElement = $(tableElement),
			isTableElement = (tableElement.tagName.toLowerCase() === 'table'),
			parentDiv = document.createElement('div');

		if (isTableElement)
		{
			parentDiv.style.display = 'none';
			parentDiv.style.marginTop = '0px';

			$tableElement.wrap(parentDiv);
			$tableElement.show();

			$tableElement.parent().slideDown(duration, function()
			{
				$tableElement.unwrap();
				if (callback)
				{
					callback();
				}
			});
		}
	},

	/**
	  * Function is responsible for sliding tables up out of view.
	  * 
	  * @param tableElement - the table element that is to be slid up out of view.
	  * @param duration - the amount of time that the animation should span 
	  * @param callback - if specified, the callback function that executes following the animation
	  *
	  * @author kinsho
	  */
	slideTableUp: function(tableElement, duration, callback)
	{
		var $tableElement = $(tableElement),
			isTableElement = (tableElement.tagName.toLowerCase() === 'table'),
			parentDiv = document.createElement('div');

		if (isTableElement)
		{
			parentDiv.style.display = 'block';
			parentDiv.style.marginTop = '0px';

			$tableElement.wrap(parentDiv);
			$tableElement.parent().slideUp(duration, function()
			{
				$tableElement.hide();
				$tableElement.unwrap();
				if (callback)
				{
					callback();
				}
			});
		}

	},

	/**
	  * Function is responsible animating the rotation of an element by a certain
	  * number of degrees.
	  *
	  * @param element - the element with which to rotate a certain number of degrees
	  * @param degrees - the amount of degrees which the element should be rotated
	  * @param duration - the amount of time that the animation should span 
	  * @param callback - if specified, the callback function that executes following the animation
	  *
	  * @author kinsho
	  */
	rotateAround: function(element, degrees, duration, callback)
	{
		var elementTransformer = 'transform',
			elementStyle = element.style,
			valueFormat = 'rotate([%d]deg)',
			testProperties = ['transform', 'webkitTransform', 'MozTransform', 'msTransform', 'OTransform'],
			currentValue,
			transitiveValue,
			intervals,
			jumps,
			timeDelay,
			i,

		duration = Math.max(duration, 10);
		intervals = Math.floor(duration / 10);
		jumps = degrees / intervals,
		timeDelay = 0;

		// Must account for the fact that different browsers handle rotational transformations in a non-standardized way.
		for (i = testProperties.length - 1; i >= 0; i -= 1)
		{
			if (elementStyle.hasOwnProperty(testProperties[i]))
			{
				elementTransformer = testProperties[i];
				break;
			}
		}

		// Deduce the base rotational angle from which to initiate the animation
		currentValue = elementStyle[elementTransformer];
		transitiveValue = ( (currentValue && currentValue.indexOf('rotate') >= 0) ? parseFloat( currentValue.replace('rotate(', '').replace('deg)') ) : 0);

		do
		{
			setTimeout(function() 
			{
				elementStyle[elementTransformer] = valueFormat.replace('[%d]', (transitiveValue += jumps));
			}, timeDelay += 10);
		}
		while (intervals -= 1);

		if (callback)
		{
			setTimeout(callback, timeDelay += 10);
		}
	},

	/**
	  * Object that will contain all the spacing parameters for distribution graphs generated via d3.js
	  */
	graphSpacing: {top: 20, right: 20, bottom: 30, left: 50},

	/**
	  * Generic function responsible for generating distribution charts using d3.js.
	  * 
	  * @param data - the data array to be used for creating the chart. Please be aware that this array
					  will be comprised of objects that only have two attributes, one containing x-axis 
					  values and the other containing y-axis values. These two properties will respectively
					  be referenced here as 'x' and 'y'.
	  * @param yAxisLabel - the label that will mark the y-axis.
	  *
	  * @author kinsho
	  */
	createDistributionGraph: function(data, yAxisLabel)
	{
		var width = 960 - this.graphSpacing.left - this.graphSpacing.right,
			height = 500 - this.graphSpacing.top - this.graphSpacing.bottom,
			x = d3.scale.linear().
				range([0, width]),
			y = d3.scale.linear().
				range([height, 0]),
			xAxis = d3.svg.axis().
					scale(x).
					orient("bottom"),
			yAxis = d3.svg.axis().
					scale(y).
					orient("left"),
			area = d3.svg.area().
				   x(function(d) { return x(d.x); }).
				   y0(height).
				   y1(function(d) { return y(d.y); }),
			svg = d3.select("#svgContainer").append("svg").
				  attr("width", width + this.graphSpacing.left + this.graphSpacing.right).
				  attr("height", height + this.graphSpacing.top + this.graphSpacing.bottom).
				  append("g").
				  attr("transform", "translate(" + this.graphSpacing.left + "," + this.graphSpacing.top + ")"),
			maxPoints = d3.max(data, function(d) { return d.x; }),
			minPoints = d3.min(data, function(d) { return d.x; });

		x.domain([minPoints - (minPoints * 0.4), maxPoints + (maxPoints * 0.1)]);
		y.domain([0, d3.max(data, function(d) { return d.y; })]);

		svg.append("path")
		  .datum(data)
		  .attr("class", "chartArea")
		  .attr("d", area);

		svg.append("g")
		  .attr("class", "x axis")
		  .attr("transform", "translate(0," + height + ")")
		  .call(xAxis);

		svg.append("g")
		  .attr("class", "y axis")
		  .call(yAxis)
		.append("text")
		  .attr("transform", "rotate(-90)")
		  .attr("y", 6)
		  .attr("dy", ".71em")
		  .style("text-anchor", "end")
		  .text(yAxisLabel);

	}
};

