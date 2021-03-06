(function() {
'use strict';

	angular
		.module('app')
		.controller('ReachController', ReachController);

	ReachController.$inject = ['dataFactory', '$log', '$window', 'socketsFactory'];
	function ReachController(dataFactory, $log, $window, socketsFactory) {
		var vm = this;
		
		// reach array
		vm.reachData = [];
		vm.newItem = {};
		
		// vm.newItem 			= vm.emptyItem;
		vm.showAddForm 		= false;
		vm.toggleAddForm 	= toggleAddForm;
		
		// actions
		vm.addNewData		= addNewData;
		vm.updateChart 		= updateChart;
		
		// d3
		var d3 = $window.d3;
		var margin = {top: 20, right: 20, bottom: 30, left: 40},
				width = 1200 - margin.left - margin.right,
				height = 500 - margin.top - margin.bottom;
				
		// ordinal scale for X ( post index )
		var x = d3.scale.ordinal()
			.rangeRoundBands([0, width], .1);
		
		// linear scale for Y post impressions
		var y = d3.scale.linear()
			.range([height, 0]);
		
		// bar colors
		var yellow 	= '#FFC107',
			green	= '#d0743c',
			blue	= '#607D8B'; 
			
		// get color range 
		var color = d3.scale.ordinal().range([yellow, green, blue]);
		
		// x axis on the bottom
		var xAxis = d3.svg.axis()
			.scale(x)
			.orient('bottom');
		
		// y axis on the left with 10 ticks
		var yAxis = d3.svg.axis()
			.scale(y)
			.orient('left')
			.ticks(10)
			.tickFormat(d3.format("s"));
				
		// var parseDate = d3.time.format('%X');
		
		// find our element and append size it
		var svg = d3.select('#stack-chart')
			.attr('width', width + margin.left + margin.right)
			.attr('height', height + margin.top + margin.bottom)
			.append('g')
			.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
		
		// actions
		activate();
		
		// sockets
		
		// listen to added item
		socketsFactory.on('add:reach:out', function (data) {
			//* ghetto-debugging *//
			$log.log('Emit Add Reach Element', data.item);
			// update chart with new item
			updateChart(data.item);
		});
		
		////////////////

		function activate() { 
		
			return getReachData().then(function (data) {
				// clean up array
				vm.reachData = cleanArray(data);
				//* ghetto-debugging *//
				// $log.info('OK:: getReachData(): ', vm.reachData);
				drawChart();
			})
		
		}
		
		function getReachData(){
			return dataFactory.getReach()
				.then(function(data) {
                	return data.data.response;
				});
		}
		
		// manipulate array to my liking
		function cleanArray(array){
			
			//* ghetto-debugging *//
			// $log.log('Cleaned ', array);
			
			// remove empty objects
			var newArray = array.filter(function (n) {
				return n.hasOwnProperty('post_impressions');
			})
			
			
			newArray = newArray.map(function(obj, index){ 
				
				//* ghetto-debugging *//
				// $log.log('Obj ', obj);
				
				// how we want the object to look
				var item = {
					index 		: 	null,
					timestamp 	:	null,
    				total 		:	null,
					organic		:	null,
					paid 		: 	null,
					viral		:	null
				};
				
				// start index from 1
				item.index = ++index;
				
				// if has impressions
				if (obj.post_impressions){
					// start index from 1
					// timestamp as Date so we can quanitfy it. Timestamp is same for all properties
					item.timestamp = new Date(obj.post_impressions[0].timestamp);
					
					item.total 		= obj.post_impressions[0].value;
					item.organic 	= obj.post_impressions_organic[0].value;
					item.paid 		= obj.post_impressions_paid[0].value;
					item.viral 		= obj.post_impressions_viral[0].value;
				};
				return item;
			});
			
			//* ghetto-debugging *//
			// $log.log('Cleaned ', newArray);
			
			return newArray;
		}
		
		function drawChart(){
					
			// get highest post value
			var yMax = d3.max(vm.reachData, function(d){ return Math.max(d.total); });
			
			//* fancy-debugging *//
			// debugger
			
			
			// divide impression properties for bar height
			addImpressionProperties(vm.reachData);
			
			// sort by value
			vm.reachData.sort(function(a, b) { return b.total - a.total; });
				
			// set x domain the number of elements
			x.domain(vm.reachData.map(function(d) { return d.index; }));
			
			// set y domain, the highest post value
			y.domain([0, yMax]);
			
			xAxis
			.tickValues(x.domain().filter(function(d, i) { return !(i % 2); }))
			
			// style the x axis
			svg.append('g')
				.attr('class', 'x axis')
				.attr('transform', 'translate(0,' + height + ')')
				.attr('font-size', '7px')
				.call(xAxis);
			
			// x axis label
			svg.append('text')
				.attr('class', 'x axis')
				.attr('text-anchor', 'end')
				.attr('x', width / 2)
				.attr('y', height+ 30)
				.text('Post Item');
				
			// style the y axis
			svg.append('g')
				.attr('class', 'y axis')
				.style('font-size', '10px')
				.call(yAxis);
				
			// draw the bars
			var impressions = svg.selectAll('.bar')
					.data(vm.reachData)
				.enter().append('g')
					.attr('class', 'bar')
					.attr('transform', function(d) { return 'translate(' + x(d.index) + ',0)'; });

			impressions.selectAll('rect')
				.data(function(d) { return d.impressions; })
				.enter().append('rect')
				// build bars from the bottom
				.attr('width', x.rangeBand())
				// set rect class to it's color for manipulation
				.attr('y', function(d) { return y(height - d.y1); })
				.attr('height', 0)
				.transition()
				.duration(600)
				.delay(function (d, i) {
					return i * 50;
				})
				.attr('y', function(d) { return y(d.y1); })
				.attr('height', function(d) { return y(d.y0) - y(d.y1); })
				.style('fill', function(d) { return color(d.name); })
				
			// tooltip info
			impressions.selectAll('rect')
				.attr('class', function(d) { return d.name; })
				.append('svg:title')
   				.text(function(d) { return d.name + ': ' + (d.y1 - d.y0);});
			
			// Impression types legend
			var legend = svg.selectAll('.legend')
				.data(color.domain().slice().reverse())
				.enter().append('g')
				.attr('class', 'legend')
				.attr('transform', function(d, i) { return 'translate(0,' + i * 20 + ')'; });
			
			var organicVisibility = false;
			var paidVisibility = false;
			var viralVisibility = false;
			
			legend.append('rect')
				.attr('x', width - 18)
				.attr('width', 18)
				.attr('height', 18)
				.attr('id', color)
				.style('cursor', 'pointer')
				.style('cursor', 'hand') 
				.style('fill', color)
				// lighten the bars on hover
				.on('mouseover', function(d){
					switch (d3.select(this).attr('id')){
						// organic
						case '#FFC107':
							d3.selectAll('.viral').style('opacity', '0.3');
							d3.selectAll('.paid').style('opacity', '0.3');
						break;
						// paid
						case '#d0743c':
							d3.selectAll('.organic').style('opacity', '0.3');
							d3.selectAll('.viral').style('opacity', '0.3');
						break;
						// viral
						case '#607D8B':
							d3.selectAll('.organic').style('opacity', '0.3');
							d3.selectAll('.paid').style('opacity', '0.3');
						break;
					}
				})
				.on('mouseleave', function(d){
					switch (d3.select(this).attr('id')){
						// organic
						case '#FFC107':
							d3.selectAll('.viral').style('opacity', '1');
							d3.selectAll('.paid').style('opacity', '1');
						break;
						// paid
						case '#d0743c':
							d3.selectAll('.organic').style('opacity', '1');
							d3.selectAll('.viral').style('opacity', '1');
						break;
						// viral
						case '#607D8B':
							d3.selectAll('.organic').style('opacity', '1');
							d3.selectAll('.paid').style('opacity', '1');
						break;
					}
				})
				// toggle visibility of bars 
				// TODO: More elegantly
				.on('click', function(){
					
					switch (d3.select(this).attr('id')){
						// organic
						case '#FFC107':
							var active   = organicVisibility ? false : true,
							newOpacity = active ? 0 : 1;
							// Hide or show the elements
							d3.selectAll('.viral').style('opacity', newOpacity);
							d3.selectAll('.paid').style('opacity', newOpacity);
							// Update whether or not the elements are active
							organicVisibility = active;
						break;
						// paid
						case '#d0743c':
							var active   = paidVisibility ? false : true,
							newOpacity = active ? 0 : 1;
							// Hide or show the elements
							d3.selectAll('.organic').style('opacity', newOpacity);
							d3.selectAll('.viral').style('opacity', newOpacity);
							// Update whether or not the elements are active
							paidVisibility = active;
						break;
						// viral
						case '#607D8B':
							var active   = viralVisibility ? false : true,
							newOpacity = active ? 0 : 1;
							// Hide or show the elements
							d3.selectAll('.organic').style('opacity', newOpacity);
							d3.selectAll('.paid').style('opacity', newOpacity);
							// Update whether or not the elements are active
							viralVisibility = active;
						break;
					}
				});
			
			legend.append('text')
				.attr('x', width - 24)
				.attr('y', 9)
				.attr('dy', '.35em')
				.style('text-anchor', 'end')
				.text(function(d) { return d; });
				
			// monitor checkbox for sort
			
			d3.select('#sort-box').on('change', change);
			
			function change() {
				
				d3.select('#sort-box').property('checked') ? (vm.sortText = 'value') : (vm.sortText = 'index');
				

				// delay the redraw of the elements
				var sortTimeout = setTimeout(function() {
					d3.select('#sort-box').property('checked', true).each(change);
				}, 1000);

				clearTimeout(sortTimeout);

				// Copy-on-write since tweens are evaluated after a delay.
				// order either by post value or index
				x.domain(vm.reachData.sort(this.checked
					? function(a, b) { return a.index - b.index; }
					: function(a, b) { return b.total - a.total; })
					.map(function(d) { return d.index; }));
					
				// make delay relative to element index
				var transition = svg.transition().duration(750),
					delay = function(d, i) { return i * 5; };
				
				// redo ticks on sort 
				xAxis
				.tickValues(x.domain().filter(function(d, i) { return !(i % 2); }))
				
				transition.selectAll('g.bar')
					.delay(delay)
					.attr('transform', function(d) { return 'translate(' + x(d.index) + ',0)'; });
					
				transition.select('.x.axis')
					.call(xAxis)
					.selectAll('g')
					.delay(delay);
			}
		}
		
		function updateChart(item) {
			
			//  give item last index
			item.index = vm.reachData.length + 1;		
			// insert into array
			vm.reachData.push(item);
			
			// get data again
			addImpressionProperties(vm.reachData);
			
			// get highest post value
			var yMax = d3.max(vm.reachData, function(d){ return Math.max(d.total); });
			
			// Scale the range of the data again 
			x.domain(vm.reachData.map(function(d) { return d.index; }));
			y.domain([0, yMax]);
			
			// check input value
			x.domain(vm.reachData.sort(d3.select('#sort-box').property('checked')
					? function(a, b) { return a.index - b.index; }
					: function(a, b) { return b.total - a.total; })
					.map(function(d) { return d.index; }));
			
			
			// remove bars for new animation effect
			var impressions = svg.selectAll('.bar')
				.remove();
			
			// draw the bars
			impressions = svg.selectAll('.bar')
					.data(vm.reachData)
				.enter().append('g')
					.attr('class', 'bar')
					.attr('transform', function(d) { return 'translate(' + x(d.index) + ',0)'; });

			// draw the sub-bars
			impressions.selectAll('rect')
				.data(function(d) { return d.impressions; })
				.enter().append('rect')
				.attr('width', x.rangeBand())
				// build bars from the bottom
				.attr('y', function(d) { return y(height - d.y1); })
				.attr('height', 0)
					.transition()
					.duration(600)
					.delay(function (d, i) {
						return i * 50;
					})
				.attr('height', function(d) { return y(d.y0) - y(d.y1); })
				.attr('y', function(d) { return y(d.y1); })
				.style('fill', function(d) { return color(d.name); })
				
			// tooltip info
			impressions.selectAll('rect')
				// set rect class to it's color for manipulation
				.attr('class', function(d) { return d.name; })
				.append('svg:title')
   				.text(function(d) { return d.name + ' impressions: ' + (d.y1 - d.y0);});
				
			
			// make delay relative to element index
			var transition = svg.transition().duration(750),
				delay = function(d, i) { return i * 5; };
				
			transition.select('.x.axis')
				.call(xAxis)
				.selectAll('g')
				.delay(delay);
				
			transition.select('.y.axis')
				.call(yAxis)
				.selectAll('g')
				.delay(delay);
				
		}
		
		function toggleAddForm() {
			// open/close form on click
			vm.showAddForm = !vm.showAddForm;
			// clear item on click
			vm.newItem = {};
		} 
		
		// add item
		function addNewData(item) {
			// close new item form
			vm.showAddForm = false;
			// create empty object
			var newItem = {};
			// add item to current array
			
			item.total = item.organic + item.viral + item.paid;
			item.timestamp = Date.now();
			
			// numbers to string
			newItem.total		= item.total.toString();  
			newItem.viral		= item.viral.toString();
			newItem.organic		= item.organic.toString();
			newItem.paid		= item.paid.toString(); 
			
			// $log.log('Added Element', newItem);
			
			// add to array
			updateChart(newItem);
			
			// send new itemect through socket
			socketsFactory.emit('add:reach', { item: item });
		 }
		 
		 function addImpressionProperties(array) {
			// we only need the impression properties
			color.domain(d3.keys(array[0]).filter(function (key) { return (key !== 'timestamp' && key !== 'index' && key !== 'total' && key !== 'impressions');}));

			array.forEach(function (d) {
				var y0 = 0;
				// stack the values
				d.impressions = color.domain().map(function (name) { return { name: name, y0: y0, y1: y0 += +d[name] }; });
			});
		 }
		 
	}
})();