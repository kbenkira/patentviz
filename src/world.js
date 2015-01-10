var dataBase = {};
var dateData = [];
var inventorData = {"nodes":[], "links":[]};
var margin = {top: 20, right: 30, bottom: 30, left: 40},
width = 740 - margin.left - margin.right,
height = 503 - margin.top - margin.bottom;
	

$.getJSON("brevets.json", function(data){
	dataBase = data;
	d3.select(".chart")
				.attr("width", width + margin.left + margin.right)
				.attr("height", height + margin.top + margin.bottom);
	loadDate();
	loadInventor();
	loadInventorChart();
	loadDateChart();
	$(".dateChart").hide();
});

function loadInventor(){
	var inventors = {};
	var inv = [];
	var existingLinks = [];
	$.each(dataBase, function(key, val){
		var names = val.inventors;
		$.each(names, function(key, val){
			val = val.replace(", ", "");
			names[key] = val;
		});
			
		$.each(names, function(key, val){
			var n = names;
			n = $.grep(n, function (value){return value != val;});
			if(val in inventors){
				inventors[val].value++;
				$.each(n, function(key, v){				
					if($.inArray(v, inventors[val].colleague) < 0){
						inventors[val].colleague.push(v);
					}
				});
			}else{
				inventors[val] = {"value":1, "colleague": n};
			}
		});
	});
	$.each(inventors, function(key, val){
		inventorData.nodes.push({"name": key, "value": val.value, "colleague":val.colleague});
		inv.push(key);
	});
	$.each(inventorData.nodes, function(key, val){
		existingLinks.push(key);
		$.each(val.colleague, function(k, v){
			var indexLinks = $.inArray(v, inv);
			if(key < indexLinks){
				inventorData.links.push({"source":key, "target": indexLinks});
			}
		});
	});
}

function loadInventorChart(){
	var width = 740,
		height = 503,
		rayonMin = 5;
		
	var color = d3.scale.category20();

	var force = d3.layout.force()
		.charge(-120)
		.linkDistance(30)
		.gravity(0.3)
		.size([width, height]);

	var svg = d3.select(".chart")
				.append("g")
				.attr("class", "inventorChart");
	
	force
		.nodes(inventorData.nodes)
		.links(inventorData.links)
		.linkDistance(60)
		.start();

	var link = svg.selectAll(".link")
				.data(inventorData.links)
				.enter().append("line")
				.attr("class", "link")
				.style("stroke-width", 3 );

	var node = svg.selectAll(".node")
				.data(inventorData.nodes)
				.enter().append("circle")
				.attr("class", "node")
				.attr("r", function(d){return rayonMin*d.value;})
				.style("fill", function(d) { return color(d.group); })
				.call(force.drag);

	node.append("title")
		.text(function(d) { return d.name; });

	force.on("tick", function() {
		link.attr("x1", function(d) { return d.source.x; })
			.attr("y1", function(d) { return d.source.y; })
			.attr("x2", function(d) { return d.target.x; })
			.attr("y2", function(d) { return d.target.y; });

		node.attr("cx", function(d) { return d.x = Math.max(rayonMin, Math.min(width-rayonMin, d.x)); })
			.attr("cy", function(d) { return d.y = Math.max(rayonMin, Math.min(height-rayonMin, d.y)); });
	});
}


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
}

function loadDateChart(){	
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