var dataBase = {};
var dateData = {};

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
		dateData[val] = years[val];
	});
	var data = $.map(dateData, function(el) { return el; });
	var y = d3.scale.linear()
				.domain([0,d3.max(data)])
				.range([0, 503]);
	
	d3.select(".dateBarChart")
	.selectAll("div")
	.data(data)
	.enter().append("div")
	.style("height", function(d) {return y(d)+"px"})
	.text(function(d){return d;});
}