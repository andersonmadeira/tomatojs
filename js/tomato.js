// Navigation info obj
var State = function(label) {
	this.strokeWidth = 5;
	this.fillColor = "#21acd7";
	this.strokeColor = "#1d7996";
	this.label = label;
	this.radius = 50;
};

var Label = function (text) {
	this.text = text;
	this.fontFamily = 'Arial';
	this.fill = '#000000';
};

$(document).ready(function() {
	// init main objs
	var q0     = new State("q0");
	var gui    = new dat.GUI();
	var paper  = new Raphael(10, 10, 500, 500);
	var circle = paper.circle(100, 100, q0.radius);
	circle.attr("stroke-width", q0.strokeWidth);
	circle.attr("fill", q0.fillColor);
	circle.attr("stroke", q0.strokeColor);
	paper.text(circle.attr("cx"), circle.attr("cy"), q0.label);
	// setup natigation
	var menu1 = gui.addFolder('State');
	// when label changed, draw circle and new label
	menu1.add(q0, 'label', 0, 10).onChange(function (value) {
		paper.clear();
		circle = paper.circle(100, 100, q0.radius);
		circle.attr("stroke-width", q0.strokeWidth);
		circle.attr("fill", q0.fillColor);
		circle.attr("stroke", q0.strokeColor);
		paper.text(circle.attr("cx"), circle.attr("cy"), value);
	});
	menu1.add(q0, 'strokeWidth', 0, 10).step(1).onChange(function (value) {
		circle.attr("stroke-width", value);
	});
	menu1.add(q0, 'radius', 0, 100).step(1).onChange(function (value) {
		circle.attr("r", value);
	});
	menu1.addColor(q0, 'fillColor').onChange(function (value) {
		circle.attr("fill", value);
	});
	menu1.addColor(q0, 'strokeColor').onChange(function (value) {
		circle.attr("stroke", value);
	});
	// open the folder
	menu1.open();
});

