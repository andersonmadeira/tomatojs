/*
 * The global canvas used to draw svg
 */
var paper = null;

/**
 * App config
 */
var App = {
	Mode: {
		State: 0,
		Transition: 0 
	},
	Preferences: {
		xPos: 100,
		yPos: 100,
		radius: 25,
		strokeWidth: 2,
		fillColor: "#21acd7",
		strokeColor: "#1d7996",
		fontFamily: "Arial",
		fontSize: 25,
	},
	StateCount: 0
}

/**
 * Enables states (including labels) to be draggable
 */
Raphael.st.draggable = function() {
  var me = this,
      lx = 0,
      ly = 0,
      ox = 0,
      oy = 0,
      moveFun = function(dx, dy) {
          lx = dx + ox;
          ly = dy + oy;
          me.transform('t' + lx + ',' + ly);
      },
      // note: also a single left mouse click
      startFun = function() {
      	// start dragging brings the set to front
      	me.toFront();
      	// change opacity
      	me.animate({'fill-opacity': 0.5, 'stroke-opacity': 0.7}, 200);
      },
      endFun = function() {
          ox = lx;
          oy = ly;
          me.animate({'fill-opacity': 1, 'stroke-opacity': 1}, 200);
      };
  
  this.drag(moveFun, startFun, endFun);
};

/**  
* State Factory: responsible for building state objects
*/
var State = {
	/**
	 * @param paper: RaphaelJS canvas object.
	 * @param paramStrText: string
	 * @param paramX: number
	 * @param paramY: number
	 * @param paramRadius: number
	 */
	build: function(paper, paramStrText, paramX, paramY, paramRadius) {
		var obj = new State.__stateClass();
		// default values
		var x       = (typeof paramX      !== 'undefined')  ? paramX      : App.Preferences.xPos;
		var y       = (typeof paramY      !== 'undefined')  ? paramY      : App.Preferences.yPos;
		var radius  = (typeof paramRadius !== 'undefined')  ? paramRadius : App.Preferences.radius;
		// starts set, ie Circle (State) + Text (Label)
		paper.setStart();
		// create the object
		obj._pCircle = paper.circle(x, y, radius);
		obj._pCircle.attr("stroke-width", App.Preferences.strokeWidth);
		obj._pCircle.attr("fill", App.Preferences.fillColor);
		obj._pCircle.attr("stroke", App.Preferences.strokeColor);
		obj._label = Label.build(paramStrText, 
			obj._pCircle.attr('cx'), obj._pCircle.attr('cy'));
		// end set creation
		obj._set = paper.setFinish();
		// change cursor when hovering set
		obj._set.attr({opacity: 1, cursor: "move"});
		// makes the set draggable
		obj._set.draggable();
		// return the new object
		return obj;
	},
	// "private" class representing the state.
	__stateClass: function () {
		// @todo: methods
	}
};

/**  
 * Label Factory: responsible for building label objects
 */
var Label = {
	/**
	 * @param paramStrText: string
	 * @param paramX: number
	 * @param paramY: number
	 * @param paramFontSize: number
	 */
	build: function(paramStrText, paramX, paramY, paramFontSize) {
		var obj = new Label.__labelClass();
		// default values
		var fSize = (typeof paramFontSize !== 'undefined') ? paramFontSize : App.Preferences.fontSize;
		// object contruction
		obj._pText = paper.text(paramX, paramY, paramStrText);
		obj._pText.attr("font-size", App.Preferences.fontSize);
		obj._pText.attr('font-family', App.Preferences.fontFamily);
		obj._pText.attr('fill', App.Preferences.strokeColor);	
		obj._pText.attr('font-size', App.Preferences.fontSize);
		// return the new object
		return obj;
	},
	__labelClass: function () {
		// @todo: methods
	}
};

function insert_state () {
	State.build(paper, "q"+App.StateCount);
	App.StateCount += 1;
}

$(document).ready(function() {
	// init main objs
	paper = new Raphael('svg_canvas_container', 794, 394);
	// resizes the div container and canvas
	$('#svg_canvas_container').resizable({
		resize: function( event, ui ) {
			paper.setSize($('#svg_canvas_container').width(), $('#svg_canvas_container').height());
		}
	});
});

