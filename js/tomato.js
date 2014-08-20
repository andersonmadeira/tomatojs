/**
 * RaphaelJS
 */
 var paper = null;

/**  
* Stabe Builder class: responsible for building state objects
*/
/*
var State = {*/
	/**
	 * @param labelText: string
	 * @param [x]: x position
	 * @param [y]: y position
	 */
	/*build: function(paramLabelText, paramX, paramY, paramRadius) {
		var obj = new State.__stateClass();
		// default values
		var x       = (typeof paramX !== 'undefined')      ? paramX      : 100; // default value 100
		var y       = (typeof paramY !== 'undefined')      ? paramY      : 100; // default value 100
		var radius  = (typeof paramRadius !== 'undefined') ? paramRadius : 50; // default value 100
		// default properties
		obj._pCircle = paper.circle(x, y, radius);
		obj._pCircle.attr("stroke-width", 5);
		obj._pCircle.attr("fill", "#21acd7");
		obj._pCircle.attr("stroke", "#1d7996");
		obj._label = Label.build(paramLabelText, obj._pCircle);
		// return the new object
		return obj;
	},*/
	// "private" class representing the state.
/*	__stateClass: function () {
		// methods
	}
};*/
/**  
* Label Builder class: responsible for building label objects
*/
/*var Label = {*/
	/**
	 * @param labelText: string
	 * @param [x]: x position
	 * @param [y]: y position
	 */
	/*build: function(paramStrText, paramFontSize, paramX, paramY) {
		var obj = new Label.__labelClass();
		// default values
		var fSize = (typeof paramFontSize !== 'undefined') ? paramFontSize : 20; // default value 100
		// default properties
		obj._pText = paper.text(paramX, paramY, paramStrText);
		obj._pText.attr("font-size", q0.label.fontSize);
		// return the new object
		return obj;
	},*/
	/*__labelClass: function () {
		// methods
	}
};
*/
/**  Label class
	@param: labelText: string text to be used as label.
*/
/*
@deprecated
var Label = function (text) {
	this.text = text;
	this.fontFamily = 'Arial';
	this.fillColor = '#000000';
	this.fontSize = 35;
};*/

$(document).ready(function() {
	// init main objs
	var paper  = new Raphael('svg_canvas_container', 794, 394);
	// var q0     = State.build("q0");
	// setup natigation
	$('#svg_canvas_container').resizable({
		resize: function( event, ui ) {
			paper.setSize($('#svg_canvas_container').width(), $('#svg_canvas_container').height());
		}
	});
});

