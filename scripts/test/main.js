require(['library/d3/d3'], function(d3)
{
	console.log(d3.version);

	var data =
			[
				{
					team: 'San Francisco 49ers',
					picks: 50
				},
				{
					team: 'New York Giants',
					picks: 14
				},
				{
					team: 'San Diego Chargers',
					picks: 26
				},
				{
					team: 'Philadelphia Eagles',
					picks: 10
				},
			],
		total = 0,
		prop;

	for (prop in data)
	{
		total += data[prop];
	}

	var generatePieChart = function()
	{
		var width = 960,
			height = 500,
			radius = Math.min(width, height) / 2;

		var color = d3.scale.ordinal()
			.range(["#98abc5", "#8a89a6"]);

		var arc = d3.svg.arc()
			.outerRadius(radius - 10)
			.innerRadius(0);

		var pie = d3.layout.pie()
			.sort(function(x, y)
			{
				if (x > y)
				{
					return 1;
				}
				else if (x < y)
				{
					return -1;
				}
				else
				{
					return 0;
				}
			})
			.value(function(datum) { return datum.picks; });

		var svg = d3.select("#statsPie").append("svg")
			.attr("width", width)
			.attr("height", height)
			.append("g")
			.attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");


		data.forEach(function(datum)
		{
			datum.picks = +datum.picks;
		});

		var g = svg.selectAll(".arc")
			.data(pie(data))
			.enter().append("g")
			.attr("class", "arc");

		g.append("path")
			.attr("d", arc)
			.style("fill", function(d) { return color (d.data.picks); });

		g.append("text")
			.attr("transform", function(d) { return "translate(" + arc.centroid(d) + ")"; })
			.attr("dy", ".35em")
			.style("text-anchor", "middle")
			.text(function(d) { return d.data.team; });
	};
});