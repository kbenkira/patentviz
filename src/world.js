var dataBase = {};
var dateData = [];
var inventorData = {"nodes":[], "links":[]};
var referenceData = {"nodes":[], "links":[]};
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
	loadReference();
	loadInventorChart();
	loadDateChart();
	loadReferenceChart();
	$(".dateChart").hide();
	$(".referenceChart").hide();
});

function loadReference(){
	var links = [];
	var nodes = {};
	var note = {};
	$.each(dataBase, function(key, val){
		var id = val.id,
			referencedBy = val.referenced_by,
			reference = val.reference;
		note[id] = 1;
		$.each(referencedBy, function(k,v){
			links.push({"source": v, "target": id});
			note[id]++;
		});
		$.each(reference, function(k,v){
			links.push({"source": id, "target": v});
		});
	});
	$.each(links, function(key, link){
		link.source = nodes[link.source] || 
			(nodes[link.source] = {name: link.source, value: note[link.source]||1});
		link.target = nodes[link.target] || 
			(nodes[link.target] = {name: link.target, value: note[link.target]||1});
	});
	referenceData.nodes = d3.values(nodes);
	referenceData.links = links;
}

function loadReferenceChart(){
	var rayonMin = 5;
	
	var color = d3.scale.category20();

	var force = d3.layout.force()
		.nodes(referenceData.nodes)
		.links(referenceData.links)
		.size([width, height])
		.linkDistance(60)
		.charge(-30)
		.on("tick", tick)
		.start();

	var svg = d3.select(".chart")
				.append("g")
				.attr("class", "referenceChart")
				.attr("transform", "translate(" + margin.left + "," + margin.top + ")");;

	// build the arrow.
	svg.append("svg:defs").selectAll("marker")
		.data(["end"])      // Different link/path types can be defined here
	  .enter().append("svg:marker")    // This section adds in the arrows
		.attr("id", String)
		.attr("viewBox", "0 -5 10 10")
		.attr("refX", 15)
		.attr("refY", -1.5)
		.attr("markerWidth", 6)
		.attr("markerHeight", 6)
		.attr("orient", "auto")
	  .append("svg:path")
		.attr("d", "M0,-5L10,0L0,5");

	// add the links and the arrows
	var path = svg.append("svg:g").selectAll("path")
		.data(force.links())
	  .enter().append("svg:path")
	//    .attr("class", function(d) { return "link " + d.type; })
		.attr("class", "link")
		.attr("marker-end", "url(#end)");

	// define the nodes
	var node = svg.selectAll(".node")
		.data(force.nodes())
	  .enter().append("g")
		.attr("class", "node")
		.style("fill", color(1))
		.call(force.drag);

	// add the nodes
	node.append("circle")
		.attr("r", rayonMin);

	// add the text 
	node.append("title")
		.text(function(d) { return d.name; });

	// add the curvy lines
	function tick() {
		path.attr("d", function(d) {
			var dx = d.target.x - d.source.x,
				dy = d.target.y - d.source.y,
				dr = Math.sqrt(dx * dx + dy * dy);
			return "M" + 
				d.source.x + "," + 
				d.source.y + "A" + 
				dr + "," + dr + " 0 0,1 " + 
				d.target.x + "," + 
				d.target.y;
		});

		node
			.attr("transform", function(d) { 
			return "translate(" + d.x + "," + d.y + ")"; });
	}
}

function loadInventor(){
	var inventors = {};
	var inv = [];
	var existingLinks = [];
	var group = 0;
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
				inventors[val] = {"value":1, "colleague": n, "group": group};
			}
		});
		group++;
	});
	$.each(inventors, function(key, val){
		inventorData.nodes.push({"name": key, "value": val.value, "colleague":val.colleague, "group": val.group});
		inv.push(key);
	});
	/*inventorData.nodes.push({"name": "gravityPoint", "value": 0, "colleague":"", "group": 0});
	inventorData.nodes.push({"name": "gravityPoint", "value": 0, "colleague":"", "group": 1});
	inventorData.nodes.push({"name": "gravityPoint", "value": 0, "colleague":"", "group": 2});
	inventorData.nodes.push({"name": "gravityPoint", "value": 0, "colleague":"", "group": 3});
	inventorData.nodes.push({"name": "gravityPoint", "value": 0, "colleague":"", "group": 4});*/
	$.each(inventorData.nodes, function(key, val){
		existingLinks.push(key);
		$.each(val.colleague, function(k, v){
			var indexLinks = $.inArray(v, inv);
			if(key < indexLinks){
				inventorData.links.push({"source":key, "target": indexLinks, "group": val.group});
			}
		});
	});
}

function loadInventorChart(){
	var rayonMin = 5;
	var highlighted = null;
	
	var color = d3.scale.category20b();

	var force = d3.layout.force()
		.charge(-60)//function(d){if(d.name == "gravityPoint"){return 2000;}else{return -60;}})
		.linkDistance(50)
		.gravity(0.1)
		.size([width, height]);

	var svg = d3.select(".chart")
				.append("g")
				.attr("class", "inventorChart")
				.attr("transform", "translate(" + margin.left + "," + margin.top + ")");;
	
	force
		.nodes(inventorData.nodes)
		.links(inventorData.links)
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

			
		node.attr("cx", function(d) { /*if(d.name == "gravityPoint"){return d.x = 185*d.group;}else{*/return d.x = Math.max(rayonMin, Math.min(width+20-rayonMin, d.x));} )
			.attr("cy", function(d) { /*if(d.name == "gravityPoint"){return d.y = 250;}else{*/return d.y = Math.max(rayonMin, Math.min(height+20-rayonMin, d.y));} );
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