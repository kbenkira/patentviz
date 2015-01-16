var dataBase = {};
var dateData = [];
var inventorData = {"nodes":[], "links":[]};
var referenceData = {"nodes":[], "links":[]};
var width = 740,
height = 503;
var marginLeft = ($(window).width()-width)/2;
var margin = {top: 0, right: marginLeft, bottom: 20, left: marginLeft};

$(window).resize(function(){
	marginLeft = ($(window).width()-width)/2;
	margin.right = marginLeft;
	margin.left = marginLeft;
	d3.select(".referenceChart")
				.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
	d3.select(".inventorChart")
				.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
	d3.select(".dateChart")
				.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
});
	

$.getJSON("brevets.json", function(data){
	if(marginLeft < 0) marginLeft = 0;
	dataBase = data;
	d3.select(".chart")
				.attr("width", width)
				.attr("height", height)
				.attr("pointer-events", "all");
	loadDate();
	loadInventor();
	loadReference();
	loadInventorChart();
	loadDateChart();
	loadReferenceChart();
	$(".dateChart").hide();
	$(".referenceChart").hide();
	$(".referenceLegend").hide();
});

function loadReference(){
	var links = [];
	var nodes = {};
	var children = {};
	$.each(dataBase, function(key, val){
		var id = val.id,
			referencedBy = val.referenced_by,
			reference = val.reference;
		$.each(referencedBy, function(k,v){
			links.push({"source": v, "target": id});
		});
		$.each(reference, function(k,v){
			links.push({"source": id, "target": v});
		});
	});
	$.each(links, function(key, link){
		link.source = nodes[link.source] || 
			(nodes[link.source] = {name: link.source, hidden: false});
		link.target = nodes[link.target] || 
			(nodes[link.target] = {name: link.target, hidden: false});
	});
	
	referenceData.nodes = d3.values(nodes);
	referenceData.links = links;
	$.each(referenceData.nodes, function(key, val){
		val.childrenReferenceBy = [];
		val.childrenReference = [];
		var tmpRChildren = $.grep(referenceData.links, function(v){
			return v.source.name == val.name;
		});
		var tmpRBChildren = $.grep(referenceData.links, function(v){
			return v.target.name == val.name;
		});
		$.each(tmpRChildren, function(k, v){
			val.childrenReference.push(v.target);
		});	
		$.each(tmpRBChildren, function(k, v){
			val.childrenReferenceBy.push(v.source);
		});	
		if((val.childrenReference.length == 0 && val.childrenReferenceBy.length == 1)||(val.childrenReference.length == 1 && val.childrenReferenceBy.length == 0)){
			val.isEndOfGraph = true;
			val.hidden = true;
			if(val.childrenReference.length == 1){
				val.childrenReference[0].hidden = true;
			}
			if(val.childrenReferenceBy.length == 1){
				val.childrenReferenceBy[0].hidden = true;
			}
		}else{
			val.isEndOfGraph = false;
		}
	});
}

function loadReferenceChart(){
	var rayonMin = 5;
	var ctrl = false;
	var color = d3.scale.category20();

	var force = d3.layout.force()
		.size([width, height])
		.linkDistance(60)
		.charge(-60)
		.on("tick", tick);

	var svg = d3.select(".chart")
				.append("g")
				.attr("class", "referenceChart")
				.attr("transform", "translate(" + margin.left + "," + margin.top + ")")
				.call(d3.behavior.zoom().on("zoom", redraw))
				.append('g');
				
				svg.append('svg:rect')
				.attr('width',width)
				.attr("height", height)
				.attr('fill', 'white');
				
	var path = svg.append("svg:g").selectAll("path"), 
		node = svg.selectAll(".node");
	update();
	
	function redraw() {
  console.log("here", d3.event.translate, d3.event.scale);
  svg.attr("transform",
      "translate(" + d3.event.translate + ")"
      + " scale(" + d3.event.scale + ")");
}

	function update(){
		var nodes = updateNodes(),
			links = updateLinks();
			
		force
			.nodes(nodes)
			.links(links)
			.start();
			
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
		path = path.data(force.links());
		path.exit().remove();
		path.enter().append("svg:path")
			.attr("class", "link")
			.attr("marker-end", "url(#end)");

		// define the nodes
		node = node.data(force.nodes());
		node.exit().remove();
		var nodeEnter = node.enter().append("g")
			.attr("class", "node")
			.on("click", click)
			.call(force.drag);

		// add the nodes
		nodeEnter.append("circle")
			.attr("r", rayonMin);

		// add the text 
		nodeEnter.append("title")
			.text(function(d) { return d.name; });
			
		node.select("circle")
			.style("fill", function(d){return color(d.isEndOfGraph? 3 : d.hidden? 1 : 2);});
			
			
	}
		
		// Toggle children on click.
	function click(d) {
	  if (!d3.event.defaultPrevented) {
		if(d3.event.altKey){
			window.open("https://www.google.fr/patents/"+d.name);		
		}
		else if((d.childrenReference.length > 1)||(d.childrenReferenceBy.length > 1)){
			if(checkChildren(d)){
				d.hidden = !d.hidden;
				update();
			}
		}
	  }
	}		

	
	function checkChildren(obj){
		var rep = false;
		$.each(obj.childrenReference, function(key, val){
			if(val.isEndOfGraph){
				rep = true;
				val.hidden = !val.hidden;
			}
		});
		$.each(obj.childrenReferenceBy, function(key, val){
			if(val.isEndOfGraph){
				rep = true;
				val.hidden = !val.hidden;
			}
		});
		return rep;
	}

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
	
	function updateNodes(){
		var nodes = [];
		$.each(referenceData.nodes, function(key, val){
			if(!(val.hidden&&val.isEndOfGraph)){
				nodes.push(val);
			}
		});
		return nodes;
	}
	
	function updateLinks(){
		var links = [];
		$.each(referenceData.links, function(key, val){
			if(!((val.source.hidden&&val.source.isEndOfGraph)||(val.target.hidden&&val.target.isEndOfGraph))){
				links.push(val);
			}
		});
		return links;
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
		.charge(-60)
		.linkDistance(50)
		.gravity(0.1)
		.size([width, height]);
			
	var svg = d3.select(".chart")
				.append("g")
				.attr("class", "inventorChart")
				.attr("transform", "translate(" + margin.left + "," + margin.top + ")")
				.call(d3.behavior.zoom().on("zoom", redraw))
				.append('g');
	
	svg.append('svg:rect')
				.attr('width',width)
				.attr("height", height)
				.attr('fill', 'white');
							

	function redraw() {
	  console.log("here", d3.event.translate, d3.event.scale);
	  svg.attr("transform",
		  "translate(" + d3.event.translate + ")"
		  + " scale(" + d3.event.scale + ")");
	}				
				
	
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
						.on("click", click)
						.call(force.drag);

	node.append("title")
		.text(function(d) { return d.name+": "+d.value; });

	force.on("tick", function() {
		link.attr("x1", function(d) { return d.source.x; })
			.attr("y1", function(d) { return d.source.y; })
			.attr("x2", function(d) { return d.target.x; })
			.attr("y2", function(d) { return d.target.y; });

		node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")";});
});

	function click(d) {
	  if (!d3.event.defaultPrevented) {
		if(d3.event.altKey){
			window.open("http://patents.justia.com/inventor/"+d.name);		
		}
	  }
	}
	
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
				.range([height-margin.bottom,0])
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
		.attr("transform", "translate(0," + (height-margin.bottom) + ")")
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
		.attr("height", function(d) { return height-margin.bottom - y(d.value); })
		.attr("width", x.rangeBand());
}