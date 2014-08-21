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
			State.build(paper, "q"+App.Config.StateCount);
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
		lx = 0,
		ly = 0,
		ox = 0,
		oy = 0,
		sx = 0,
		sy = 0;
	moveFun = function(dx, dy) {
		if (App.Config.Mode == 1) {
			lx = dx + ox;
			ly = dy + oy;
			me.transform('t' + lx + ',' + ly);
		} else if (App.Config.Mode == 2) {
			paper.path('M '+sx+','+sy+' Q 100,40 '+lx+','+ly);
		}
	},
	// note: also a single left mouse click
	startFun = function(startX, startY) {
		// start dragging brings the set to front
		me.toFront();
		// change opacity
		me.animate({'fill-opacity': 0.5, 'stroke-opacity': 0.7}, 200);
		console.log('Start drag!');
		if (App.Config.Mode == 2) {
			sx = startX;
			sy = startY;
		}
	},
	endFun = function() {
		if (App.Config.Mode == 1) {
			ox = lx;
			oy = ly;
			console.log('End drag at: '+ox+','+oy);
		} else if (App.Config.Mode == 2) {

		}
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
		var x       = (typeof paramX      !== 'undefined')  ? paramX      : App.Config.Pref.xPos;
		var y       = (typeof paramY      !== 'undefined')  ? paramY      : App.Config.Pref.yPos;
		var radius  = (typeof paramRadius !== 'undefined')  ? paramRadius : App.Config.Pref.radius;
		// starts set, ie Circle (State) + Text (Label)
		paper.setStart();
		// create the object
		obj._pCircle = paper.circle(x, y, radius);
		obj._pCircle.attr("stroke-width", App.Config.Pref.strokeWidth);
		obj._pCircle.attr("fill", App.Config.Pref.fillColor);
		obj._pCircle.attr("stroke", App.Config.Pref.strokeColor);
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
		var fSize = (typeof paramFontSize !== 'undefined') ? paramFontSize : App.Config.Pref.fontSize;
		// object contruction
		obj._pText = paper.text(paramX, paramY, paramStrText);
		obj._pText.attr("font-size", App.Config.Pref.fontSize);
		obj._pText.attr('font-family', App.Config.Pref.fontFamily);
		obj._pText.attr('fill', App.Config.Pref.strokeColor);	
		obj._pText.attr('font-size', App.Config.Pref.fontSize);
		// return the new object
		return obj;
	},
	__labelClass: function () {
		// @todo: methods
	}
};

$(document).ready(function() {
	// init main objs
	paper = new Raphael('svg_canvas_container', 794, 394);
	// resizes the div container and canvas
	$('#svg_canvas_container').resizable({
		resize: function( event, ui ) {
			paper.setSize($('#svg_canvas_container').width(), $('#svg_canvas_container').height());
		}
	});
/*	$(document).keypress(function(event) {
		// if we are handling states and 'a' was pressed.
		console.log('Key pressed.');
		if (App.Config.Mode == 1 && event.keyCode == 97) {
			console.log('"a" pressed.');
			// reset (x,y) position so the system knows it has to capture next click
			App.Config.Internal.InsertAt.x = -1;
			App.Config.Internal.InsertAt.y = -1;
		}
	}).click(function(event) {
		// if the system is waiting for a click, ie user has pressed 'a' (x == -1) then insert at click position
		console.log('Clicked.');
		if (App.Config.Mode == 1 && App.Config.Internal.InsertAt.x == -1) {
			var offset = $(this).offset();
    		App.Config.Internal.InsertAt.x = event.clientX - offset.left;
    		App.Config.Internal.InsertAt.y = event.clientY - offset.top;

    		console.log('New state at: '+App.Config.Internal.InsertAt.x+", "+App.Config.Internal.InsertAt.y)
			
			insert_state(App.Config.Internal.InsertAt.x, App.Config.Internal.InsertAt.y);
		}
	});*/
	function curve(x, y, ax, ay, bx, by, zx, zy, color) {
        var path = [["M", x, y], ["C", ax, ay, bx, by, zx, zy]],
            path2 = [["M", x, y], ["L", ax, ay], ["M", bx, by], ["L", zx, zy]],
            curve = paper.path(path).attr({stroke: color || Raphael.getColor(), 
            								"stroke-width": 10, 
            								'arrow-end': 'block-midium-midium'}),
            controls = paper.set(
                paper.path(path2).attr({stroke: "#000", "stroke-dasharray": "- "}),
                paper.circle(x, y, 5).attr({fill: "#444", stroke: "none"}),
                paper.circle(ax, ay, 5).attr({fill: "#444", stroke: "none"}),
                paper.circle(bx, by, 5).attr({fill: "#444", stroke: "none"}),
                paper.circle(zx, zy, 5).attr({fill: "#444", stroke: "none"})
            );
        controls[1].update = function (x, y) {
            var X = this.attr("cx") + x,
                Y = this.attr("cy") + y;
            this.attr({cx: X, cy: Y});
            path[0][1] = X;
            path[0][2] = Y;
            path2[0][1] = X;
            path2[0][2] = Y;
            controls[2].update(x, y);
        };
        controls[2].update = function (x, y) {
            var X = this.attr("cx") + x,
                Y = this.attr("cy") + y;
            this.attr({cx: X, cy: Y});
            path[1][1] = X;
            path[1][2] = Y;
            path2[1][1] = X;
            path2[1][2] = Y;
            curve.attr({path: path});
            controls[0].attr({path: path2});
        };
        controls[3].update = function (x, y) {
            var X = this.attr("cx") + x,
                Y = this.attr("cy") + y;
            this.attr({cx: X, cy: Y});
            path[1][3] = X;
            path[1][4] = Y;
            path2[2][1] = X;
            path2[2][2] = Y;
            curve.attr({path: path});
            controls[0].attr({path: path2});
        };
        controls[4].update = function (x, y) {
            var X = this.attr("cx") + x,
                Y = this.attr("cy") + y;
            this.attr({cx: X, cy: Y});
            path[1][5] = X;
            path[1][6] = Y;
            path2[3][1] = X;
            path2[3][2] = Y;
            controls[3].update(x, y);
        };
        controls.drag(move, up);
    }
    function move(dx, dy) {
        this.update(dx - (this.dx || 0), dy - (this.dy || 0));
        this.dx = dx;
        this.dy = dy;
    }
    function up() {
        this.dx = this.dy = 0;
    }
    curve(70, 100, 110, 100, 130, 200, 170, 200, "hsb(0, .75, .75)");
    curve(170, 100, 210, 100, 230, 200, 270, 200, "hsb(.8, .75, .75)");
    curve(270, 100, 310, 100, 330, 200, 370, 200, "hsb(.3, .75, .75)");
    curve(370, 100, 410, 100, 430, 200, 470, 200, "hsb(.6, .75, .75)");
    curve(470, 100, 510, 100, 530, 200, 570, 200, "hsb(.1, .75, .75)");
});

