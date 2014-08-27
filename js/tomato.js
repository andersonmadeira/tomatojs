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
		displayControlPoints: true,
		StateCount: 0
	},
	Canvas: {
		paper: null,
		bgRect: null
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
	toggle_cp: function() {
		App.Config.displayControlPoints = !App.Config.displayControlPoints;
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
	App.Canvas.paper.setStart();
	// create the object
	this._pCircle = App.Canvas.paper.circle(this.__x, this.__y, this.__radius);
	this._pCircle.attr("stroke-width", App.Config.Pref.strokeWidth);
	this._pCircle.attr("fill", App.Config.Pref.fillColor);
	this._pCircle.attr("stroke", App.Config.Pref.strokeColor);
	this._label = new Label(paramStrText, 
		this._pCircle.attr('cx'), this._pCircle.attr('cy'));
	// end set creation
	this._set = App.Canvas.paper.setFinish();
	// change cursor when hovering set
	this._set.attr({opacity: 1, cursor: "move"});
	// makes the set draggable
	this.__lx = 0; // last X and Y
	this.__ly = 0;
	this.__ox = 0; // origin
	this.__oy = 0;
	
	this._set.drag(this.__onMove(this), this.__onStart(this), this.__onEnd(this));
	this._set.mouseup(this.__onMouseUp);
	this._set.mousedown(this.__onMouseDown);
}

State.prototype.__onMouseUp = function() {
	console.log('Mouse up!');
};

State.prototype.__onMouseDown = function() {
	console.log('Mouse Down!');
};

// note: also a single left mouse click
State.prototype.__onStart = function (obj) {
	return function(startX, startY) {
		// change opacity
		obj._set.animate({'fill-opacity': 0.5, 'stroke-opacity': 0.7}, 200);
		// start dragging brings the set to front
		obj._set.toFront();
		console.log('Start drag!');
	}
}

State.prototype.__onMove = function (obj) {
	return function(dx, dy) {
		// compute the shift
		obj.__lx = dx + obj.__ox;
		obj.__ly = dy + obj.__oy;
		// move it
		obj._set.transform('t' + obj.__lx + ',' + obj.__ly);
	}
}	

State.prototype.__onEnd = function(obj) {
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
	this._pText = App.Canvas.paper.text(paramX, paramY, paramStrText);
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

	this._lines_obj = App.Canvas.paper.path(this.__lines)
				  .attr({color: "#ffaa44", "stroke-dasharray": "- ", "stroke-width": 1});

	this._path_obj = App.Canvas.paper.path(this.__path)
					  .attr({color: "#ffaa44", "stroke-width": 5});

	// aux points
	this._control_obj2 = App.Canvas.paper.circle((this.__path[4] + this.__path[1]) / 2, 
									  (this.__path[5] + this.__path[2]) / 2, 5).attr({fill: "#00FF00", stroke: "none"});
	this._control_obj3 = App.Canvas.paper.circle((this.__path[4] + this.__path[6]) / 2, 
									  (this.__path[5] + this.__path[7]) / 2, 5).attr({fill: "#0000FF", stroke: "none"});
	this._control_obj4 = App.Canvas.paper.circle((this._control_obj2.attr('cx') + this._control_obj3.attr('cx')) / 2, 
									  (this._control_obj2.attr('cy') + this._control_obj3.attr('cy')) / 2, 5).attr({fill: "#FF0000", stroke: "none"});

	this._control_obj = App.Canvas.paper.circle(mx, my, 5).attr({fill: "#444", stroke: "none"});

	this._label = new Label(symbolStr, this._control_obj4.attr('cx'), this._control_obj4.attr('cy'));

	// register the drag callbacks
	this._control_obj.drag(this.__onMove(this), this.__onStart(this), this.__onEnd(this));
	this._control_obj.toFront();
}

Transition.prototype.set_label_text = function(strLabeltext) {
	this._label._pText.attr({'text': strLabeltext});
};

// update control point positions
Transition.prototype.__update_controls = function() {
	// update middle points every time the 'draggable' control point moves (this._control_obj)
	this._control_obj2.attr({'cx': (this.__path[4] + this.__path[1]) / 2, 
							 'cy': (this.__path[5] + this.__path[2]) / 2});
	this._control_obj3.attr({'cx': (this.__path[4] + this.__path[6]) / 2, 
							 'cy': (this.__path[5] + this.__path[7]) / 2});
	this._control_obj4.attr({'cx': (this._control_obj2.attr('cx') + this._control_obj3.attr('cx')) / 2, 
							 'cy': (this._control_obj2.attr('cy') + this._control_obj3.attr('cy')) / 2});
	this._label._pText.attr({'x': (((this._control_obj4.attr('cx')+this.__path[4]) / 2) + (this._control_obj4.attr('cx'))) / 2, 
						  'y': (((this._control_obj4.attr('cy')+this.__path[5]) / 2) + (this._control_obj4.attr('cy'))) / 2});
};

// called when drag starts
Transition.prototype.__onStart = function(obj) {
	// closure that acts as the move func
	return function(sx, sy) {
		// set the origin of movement to the previous center point
		this.sx = this.attr('cx');
		this.sy = this.attr('cy');
		this.attr({opacity: 0.5});
	}
}

// called everytime position changes
Transition.prototype.__onMove = function(obj) {
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
Transition.prototype.__onEnd = function(obj) {
	return function () {
		this.attr({opacity: 1});
	}
}

// sets the target point (tx, ty)
Transition.prototype.set_target = function(tx, ty) {
	this.__path[6] = this.__lines[10] = tx;
	this.__path[7] = this.__lines[11] = ty;
	this.__path[4] = (tx + this.__path[1]) / 2;
	this.__path[5] = (ty + this.__path[2]) / 2;
	this.__lines[1] = this.__lines[7] = (tx + this.__path[1]) / 2;
	this.__lines[2] = this.__lines[8] = (ty + this.__path[2]) / 2;
	this._control_obj.attr({'cx': (tx + this.__path[1]) / 2, 
							'cy': (ty + this.__path[2]) / 2});
	this._path_obj.attr({path: this.__path});
	this._lines_obj.attr({path: this.__lines});
	this.__update_controls();
};



$(document).ready(function() {
	// init main objs
	App.Canvas.paper = new Raphael('svg_canvas_container', 800, 400);
	var jQueryPaperCanvas = $(App.Canvas.paper.canvas);
	var bgRect = App.Canvas.paper.rect(0, 0, jQueryPaperCanvas.width(), jQueryPaperCanvas.height())
						 		 .attr({'stroke': 'none', 'fill': '#FAFAFA'})
						 		 .toBack();
	// paper offsets
	var offsetLeft = jQueryPaperCanvas.offset().left;
	var offsetTop = jQueryPaperCanvas.offset().top;
	// check if using IE
	var IE = document.all ? true : false;
	// aux vars - positioning
	var sx = 0, sy = 0, mx = 0, my = 0;
	// last transition
	var lastTransition = null;
	// mouse move 
	bgRect.mousemove(function (event) {
        var x, y;

        if (this.__IE) {
            x = event.clientX + document.body.scrollLeft +
                document.documentElement.scrollLeft;
            y = event.clientY + document.body.scrollTop +
                document.documentElement.scrollTop;
        } else {
            x = event.pageX;
            y = event.pageY;
        }
        
        // subtract paper coords on page
        mx = x - offsetLeft;
        my = y - offsetTop;
        //console.log('[mousemove event] pos: '+mx+'.'+my);
    });
    // drag functions
    var onStart = function (psx, psy) {
		sx = psx - offsetLeft;
		sy = psy - offsetTop;
		console.log('Start drag at: '+sx+'.'+sy);
		lastTransition = new Transition('', sx, sy, sx, sy);
	};
	var onMove = function (dx, dy) {
		lastTransition.set_target(dx+sx, dy+sy);
	};
	var onEnd = function () {
		console.log('Drag end: '+(mx)+'.'+(my));
		strSymbol = prompt('Symbol: ');
		lastTransition.set_label_text(strSymbol);
	};
	// assign callbacks
	bgRect.drag(onMove, onStart, onEnd);
	// resizes the div container and canvas
	$('#svg_canvas_container').resizable({
		resize: function( event, ui ) {
			var w = $('#svg_canvas_container').width(),
				h = $('#svg_canvas_container').height();
			App.Canvas.paper.setSize(w, h);
			bgRect.attr({'width': w, 'height': h});
		}
	});

	$(document).keydown(function(event) {
		console.log("Key down [code]: "+event.keyCode);
	});

	$(document).keyup(function(event) {
		console.log("Key up [code]: "+event.keyCode);
	});

    t = new Transition('Anderson', 10, 10, 300, 300);

});

