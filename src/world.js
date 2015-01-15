var dataBase = {};
var dateData = [];

$.getJSON("brevets.json", function(data){
	dataBase = data;
	loadDate();
});

function loadDate(){
	var years = {};
	var keys = [];
	$.each(dataBase, function(key, val){
		var year = val.publication_date;
		year = year.slice(year.length-4, year.length);
		if(year in years){
			years[year]++;
		}else{
			years[year] = 1;
		}
	});
	keys = Object.keys(years).sort();
	$.each(keys, function(key, val){
		dateData[key] = {"year": val, "value": years[val]};
	});
	
	var margin = {top: 20, right: 30, bottom: 30, left: 40},
    width = 740 - margin.left - margin.right,
    height = 503 - margin.top - margin.bottom;
	
	var x = d3.scale.ordinal()
				.rangeRoundBands([0, width], .1)
				.domain(dateData.map(function(d) {return d.year;}));
	
	var y = d3.scale.linear()
				.range([height,0])
				.domain([0,d3.max(dateData, function(d){return d.value;})]);
				
	var xAxis = d3.svg.axis()
				.scale(x)
				.orient("bottom");

	var yAxis = d3.svg.axis()
				.scale(y)
				.orient("left");
	
	var chart = d3.select(".chart")
				.attr("width", width + margin.left + margin.right)
				.attr("height", height + margin.top + margin.bottom)
				.append("g")
				.attr("class", "dateChart")
				.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
					
	chart.append("g")
		.attr("class", "x axis")
		.attr("transform", "translate(0," + height + ")")
		.call(xAxis);
		
	chart.append("g")
		.attr("class", "y axis")
		.call(yAxis)
		.append("text")
		.attr("transform", "rotate(-90)")
		.attr("y", 6)
		.attr("dy", ".71em")
		.style("text-anchor", "end")
		.text("Frequency");
		
	chart.selectAll(".bar")
		.data(dateData)
		.enter().append("rect")
		.attr("class", "bar")
		.attr("x", function(d) { return x(d.year); })
		.attr("y", function(d) { return y(d.value); })
		.attr("height", function(d) { return height - y(d.value); })
		.attr("width", x.rangeBand());
}