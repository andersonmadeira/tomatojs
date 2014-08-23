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
Raphael.st.draggable = function() {
	var me = this,
		lx = 0, // last X and Y
		ly = 0,
		ox = 0, // origin
		oy = 0,
		sx = 0, // start pos
		sy = 0;

	__move = function(dx, dy) {
		if (App.Config.Mode == 1) {
			lx = dx + ox;
			ly = dy + oy;
			me.transform('t' + lx + ',' + ly);
		} else if (App.Config.Mode == 2) {

		}
	},
	// note: also a single left mouse click
	__start = function(startX, startY) {
		// change opacity
		me.animate({'fill-opacity': 0.5, 'stroke-opacity': 0.7}, 200);
		// start dragging brings the set to front
		me.toFront();
		console.log('Start drag!');
		if (App.Config.Mode == 2) {
			sx = startX;
			sy = startY;
		}
	},
	__end = function() {
		me.animate({'fill-opacity': 1, 'stroke-opacity': 1}, 200);

		if (App.Config.Mode == 1) {
			ox = lx;
			oy = ly;
			console.log('End drag at: '+ox+','+oy);
		} else if (App.Config.Mode == 2) {
			new Transition(sx, sy, lx, ly);
		}
	};
  
	this.drag(__move, __start, __end);
};

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
	this._set.draggable();
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
	this._pText.attr('font-size', this.__fSize);
}

/**
 * Transition Class
 *
 * @param ox: number
 * @param oy: number
 * @param tx: number
 * @param ty: number
 *
 */

function Transition(ox, oy, tx, ty) {
	// setting middle point
	this.__mx = (ox + tx) / 2;
	this.__my = (oy + ty) / 2;
	// set paths
	this.__path = ["M", ox, oy, "S", this.__mx, this.__my, tx, ty];
	this.__lines = ["M", this.__mx, this.__my, "L", ox, oy, "M", this.__mx, this.__my, "L", tx, ty];

	this._lines_obj = paper.path(this.__lines)
					  .attr({color: "#ffaa44", "stroke-dasharray": "- ", "stroke-width": 1});

	this._path_obj = paper.path(this.__path)
					  .attr({color: "#ffaa44", "stroke-width": 5});
	this._control_obj = paper.circle(this.__mx, this.__my, 5).attr({fill: "#444", stroke: "none"});

	// register the drag callbacks
	this._control_obj.drag(this.__move(this), this.__start(this), this.__end(this));
}

// BEGIN - methods

// called when drag starts
Transition.prototype.__start = function(obj) {
	// closure that acts as the move func
	return function(sx, sy) {
		// set the origin of movement to the previous center point
		this.ox = this.attr('cx');
		this.oy = this.attr('cy');
		this.attr({opacity: 0.5});
	}
}

// called everytime position changes
Transition.prototype.__move = function(obj) {
	return function(dx, dy) {
		// center now moves to origin+distance
	    this.attr({'cx': this.ox + dx, 'cy': this.oy + dy});
	    // the position of our control point has changed, thus register new position.
	    obj.__path[4] = this.ox + dx;
	    obj.__path[5] = this.oy + dy;
	    obj.__lines[1] = obj.__lines[7] = this.ox + dx;
	    obj.__lines[2] = obj.__lines[8] = this.oy + dy;
	    // apply changes to paths.
	    obj._path_obj.attr({path: obj.__path});
	    obj._lines_obj.attr({path: obj.__lines});
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

    t = new Transition(10, 10, 300, 300);
    
});

