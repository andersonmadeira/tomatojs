/*
 * The global canvas used to draw svg
 */
var paper = null;

/**
 * App config
 */
var App = {
	Config: {
		Mode: 0,
		Pref: {
			xPos: 100,
			yPos: 100,
			radius: 25,
			strokeWidth: 2,
			fillColor: "#21acd7",
			strokeColor: "#1d7996",
			fontFamily: "Arial",
			fontSize: 25,
		},
		Internal: {
			InsertAt: {x: 0, y: 0}
		},
		StateCount: 0
	},
	insert_state: function() {
		// if state mode is on
		if (App.Config.Mode == 1) {
			new State("q"+App.Config.StateCount);
			App.Config.StateCount += 1;
		}
	},
	state_on: function() {
		// 1 => Handling states
		if (App.Config.Mode != 1) {
			console.log("States: ON");
			App.Config.Mode = 1;
		}
	},
	trans_on: function() { 
		// 2 => Handling states
		if (App.Config.Mode != 2) {
			console.log("Transition: ON");
			App.Config.Mode = 2;
		}
	}
}

/**
 * Handle drag events on states (sets made of circles and labels)
 * Enables states (including labels) to be draggable
 */

/**  
 * State class
 * 
 * @param paper: RaphaelJS canvas object.
 * @param paramStrText: string
 * @param paramX: number
 * @param paramY: number
 * @param paramRadius: number
 */
function State(paramStrText, paramX, paramY, paramRadius) {
	// default values
	this.__x       = (typeof paramX      !== 'undefined')  ? paramX      : App.Config.Pref.xPos;
	this.__y       = (typeof paramY      !== 'undefined')  ? paramY      : App.Config.Pref.yPos;
	this.__radius  = (typeof paramRadius !== 'undefined')  ? paramRadius : App.Config.Pref.radius;
	// starts set, ie Circle (State) + Text (Label)
	paper.setStart();
	// create the object
	this._pCircle = paper.circle(this.__x, this.__y, this.__radius);
	this._pCircle.attr("stroke-width", App.Config.Pref.strokeWidth);
	this._pCircle.attr("fill", App.Config.Pref.fillColor);
	this._pCircle.attr("stroke", App.Config.Pref.strokeColor);
	this._label = new Label(paramStrText, 
		this._pCircle.attr('cx'), this._pCircle.attr('cy'));
	// end set creation
	this._set = paper.setFinish();
	// change cursor when hovering set
	this._set.attr({opacity: 1, cursor: "move"});
	// makes the set draggable
	this.__lx = 0; // last X and Y
	this.__ly = 0;
	this.__ox = 0; // origin
	this.__oy = 0;
	
	this._set.drag(this.__move(this), this.__start(this), this.__end(this));
}

// note: also a single left mouse click
State.prototype.__start = function (obj) {
	return function(startX, startY) {
		// change opacity
		obj._set.animate({'fill-opacity': 0.5, 'stroke-opacity': 0.7}, 200);
		// start dragging brings the set to front
		obj._set.toFront();
		console.log('Start drag!');
	}
}

State.prototype.__move = function (obj) {
	return function(dx, dy) {
		// compute the shift
		obj.__lx = dx + obj.__ox;
		obj.__ly = dy + obj.__oy;
		// move it
		obj._set.transform('t' + obj.__lx + ',' + obj.__ly);
	}
}	

State.prototype.__end = function(obj) {
	return function () {
		obj._set.animate({'fill-opacity': 1, 'stroke-opacity': 1}, 200);

		obj.__ox = obj.__lx;
		obj.__oy = obj.__ly;
		console.log('End drag at: '+obj.__ox+','+obj.__oy);
	}
}


/**  
 * Label class
 * 
 * @param paramStrText: string
 * @param paramX: number
 * @param paramY: number
 * @param paramFontSize: number
 */
function Label(paramStrText, paramX, paramY, paramFontSize) {
	// default values
	this.__fSize = (typeof paramFontSize !== 'undefined') ? paramFontSize : App.Config.Pref.fontSize;
	// object contruction
	this._pText = paper.text(paramX, paramY, paramStrText);
	this._pText.attr("font-size", App.Config.Pref.fontSize);
	this._pText.attr('font-family', App.Config.Pref.fontFamily);
	this._pText.attr('fill', App.Config.Pref.strokeColor);	
}

/**
 * Transition Class
 *
 * @param symbolStr: string
 * @param ox: number
 * @param oy: number
 * @param tx: number
 * @param ty: number
 *
 */

function Transition(symbolStr, ox, oy, tx, ty) {
	// control point
	mx = (ox + tx) / 2;
	my = (oy + ty) / 2;
	// set paths
	this.__path = ["M", ox, oy, "S", mx, my, tx, ty];
	this.__lines = ["M", mx, my, "L", ox, oy, "M", mx, my, "L", tx, ty];

	this._lines_obj = paper.path(this.__lines)
					  .attr({color: "#ffaa44", "stroke-dasharray": "- ", "stroke-width": 1});

	this._path_obj = paper.path(this.__path)
					  .attr({color: "#ffaa44", "stroke-width": 5});

	// aux points
	this._control_obj2 = paper.circle((this.__path[4] + this.__path[1]) / 2, 
									  (this.__path[5] + this.__path[2]) / 2, 5).attr({fill: "#00FF00", stroke: "none"});
	this._control_obj3 = paper.circle((this.__path[4] + this.__path[6]) / 2, 
									  (this.__path[5] + this.__path[7]) / 2, 5).attr({fill: "#0000FF", stroke: "none"});
	this._control_obj4 = paper.circle((this._control_obj2.attr('cx') + this._control_obj3.attr('cx')) / 2, 
									  (this._control_obj2.attr('cy') + this._control_obj3.attr('cy')) / 2, 5).attr({fill: "#FF0000", stroke: "none"});

	this._control_obj = paper.circle(mx, my, 5).attr({fill: "#444", stroke: "none"});

	this._label_obj = paper.text(this._control_obj4.attr('cx'), this._control_obj4.attr('cy'), symbolStr)
						   .attr({"font-size": App.Config.Pref.fontSize,
								  'font-family': App.Config.Pref.fontFamily,
								  'fill': App.Config.Pref.strokeColor});

	// register the drag callbacks
	this._control_obj.drag(this.__move(this), this.__start(this), this.__end(this));
	this._control_obj.toFront();
}

// BEGIN - methods

// update control point positions
Transition.prototype.__update_controls = function() {
	// update middle points every time the 'draggable' control point moves (this._control_obj)
	this._control_obj2.attr({'cx': (this.__path[4] + this.__path[1]) / 2, 
							 'cy': (this.__path[5] + this.__path[2]) / 2});
	this._control_obj3.attr({'cx': (this.__path[4] + this.__path[6]) / 2, 
							 'cy': (this.__path[5] + this.__path[7]) / 2});
	this._control_obj4.attr({'cx': (this._control_obj2.attr('cx') + this._control_obj3.attr('cx')) / 2, 
							 'cy': (this._control_obj2.attr('cy') + this._control_obj3.attr('cy')) / 2});
	this._label_obj.attr({'x': (this._control_obj4.attr('cx')+this.__path[4]) / 2, 
						  'y': (this._control_obj4.attr('cy')+this.__path[5]) / 2});
};

// called when drag starts
Transition.prototype.__start = function(obj) {
	// closure that acts as the move func
	return function(sx, sy) {
		// set the origin of movement to the previous center point
		this.sx = this.attr('cx');
		this.sy = this.attr('cy');
		this.attr({opacity: 0.5});
	}
}

// called everytime position changes
Transition.prototype.__move = function(obj) {
	return function(dx, dy) {
		// center now moves to origin+distance
	    this.attr({'cx': this.sx + dx, 'cy': this.sy + dy});
	    // the position of our control point has changed, thus register new position.
	    obj.__path[4] = this.sx + dx;
	    obj.__path[5] = this.sy + dy;
	    obj.__lines[1] = obj.__lines[7] = this.sx + dx;
	    obj.__lines[2] = obj.__lines[8] = this.sy + dy;
	    // apply changes to paths.
	    obj._path_obj.attr({path: obj.__path});
	    obj._lines_obj.attr({path: obj.__lines});
	    obj.__update_controls();
	}
}

// called when the drag is over
Transition.prototype.__end = function(obj) {
	return function () {
		this.attr({opacity: 1});
	}
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

    t = new Transition('A', 10, 10, 300, 300);
    t2 = new Transition('symbol', 200, 200, 300, 100);
    t3 = new Transition('0', 102, 230, 30, 50);
    
});

