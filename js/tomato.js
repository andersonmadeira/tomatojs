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
	moveFun = function(dx, dy) {
		if (App.Config.Mode == 1) {
			lx = dx + ox;
			ly = dy + oy;
			me.transform('t' + lx + ',' + ly);
		}
	},
	// note: also a single left mouse click
	startFun = function() {
		// start dragging brings the set to front
		me.toFront();
		// change opacity
		me.animate({'fill-opacity': 0.5, 'stroke-opacity': 0.7}, 200);
		console.log('Start drag!');
	},
	endFun = function() {
		if (App.Config.Mode == 1) {
			ox = lx;
			oy = ly;
			console.log('End drag at: '+ox+','+oy);
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
});

