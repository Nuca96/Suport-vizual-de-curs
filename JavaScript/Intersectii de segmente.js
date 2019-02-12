var globalPoint;

function compareSS(segm1, segm2, purpose) {
	function compfct(y) {
		var int1 = intersection(segm1, canvas.getSweepY(y));
		var int2 = intersection(segm2, canvas.getSweepY(y));
		return comparePointsX(int1, int2);
	}

	var comp = compfct(globalPoint.y);
	if (purpose === "insert") {
		comp = compfct(globalPoint.y + 5);
	}
	if (purpose === "delete") {
		comp = compfct(globalPoint.y - 5);
	}

	if (comp != 0) {
		return comp;
	}

	return comparePointsX(segm1.secondPoint, segm2.secondPoint);
}

function compareSP(segm) {
	var segments = concat(globalPoint.C, globalPoint.L, globalPoint.U);
	if (segments.indexOf(segm) != -1) {
		return 0;
	}

	var ec = ecuatia_dreptei(segm);
	// x * ec.x_coef + y * ec.y_coef = ec.termen_liber
	var x = (ec.termen_liber - (globalPoint.y * ec.y_coef)) / ec.x_coef;

	if (x < globalPoint.x) {
		return -1;
	}
	if (x > globalPoint.x) {
		return 1;
	}
	return 0;
}

function pointInArray(point, array) {
	for (var idx in array) {
		if (theSamePoint(point, array[idx])) {
			return array[idx];
		}
	}
	return null;
}

var events = function() {
	this.intersections = [];
	this.next = function() {
		return this.events[this.idx++];
	}
}

events.prototype.again = function(){
	this.events = [];
	this.idx = 0;
	for (var idx in canvas.segmente) {
		this.newSegment(canvas.segmente[idx]);
	}
}

events.prototype.addIntersection = function(point) {
	if (this.intersections.indexOf(point) != -1) {
		return;
	}

	this.intersections.push(point);
	breakPoints.push([{
		"shape": "point",
		"data": point,
		"events": ["push"]
	}, {
		"shape": "liter",
		"data": point,
		"events": ["push"],
		"message": "<b>" + point.litera + "</b> este un nou punct de intersecție"
	}]);
};

events.prototype.add = function(point) {
	for (var idx=0; idx<this.events.length; idx++) {
		if (comparePointsY(this.events[idx], point) > 0) {
			break;
		}
	}
	this.events.splice(idx, 0, point);
}

events.prototype.getPoint = function(point) {
	var p = pointInArray(point, this.events);
	if (p) {
		point = p;
	} else {
		point.L = [];
		point.U = [];
		point.C = [];
		this.add(point);
	}
	return point;
}

events.prototype.overWriteEvent = function(point, segment) {
	// check if point is not endpoint of segment
	if (concat(point.C, point.U, point.L).indexOf(segment) == -1) {
		point.C.push(segment);
	}

	if (canvas.points.indexOf(point) == -1) {
		canvas.addPoint(point);
	}

	this.addIntersection(point);
}

events.prototype.newIntersection = function(seg1, seg2, point) {
	var p = this.getPoint(point);
	this.overWriteEvent(p, seg1);
	this.overWriteEvent(p, seg2);
}

events.prototype.newSegment = function(segment) {
	var upper = this.getPoint(segment.firstPoint);
	var lower = this.getPoint(segment.secondPoint);

	upper.U.push(segment);
	lower.L.push(segment);
}

function init() {
	this.eventPoints = new events();
	canvas.segmente = [];
	canvas.addEvent("click", firstClick);
	loadButton.addEventListener("click", loadSegments);
}

function firstClick(event) {
	canvas.removeEvent("click", firstClick);
	var punct = canvas.genericEvent(event);
	canvas.firstPoint = punct;

	canvas.addEvent("click", secondClick);
	canvas.addEvent("mousemove", mouseMove);
}

function secondClick(event) {
	canvas.removeEvent("click", secondClick);
	canvas.removeEvent("mousemove", mouseMove);

	var punct = canvas.genericEvent(event);
	var segment = getSegmentY(canvas.firstPoint, punct);
	canvas.segmente.push(segment);

	canvas.firstPoint = null;
	canvas.addEvent("click", firstClick);
	canvas.addPoint(segment.firstPoint);
	canvas.addPoint(segment.secondPoint);

	//draw new elements
	var permanents = [{
		"shape": "segment",
		"data": segment,
		"colour": "DarkCyan"
	}, {
		"shape": "liter",
		"data": segment.secondPoint
	}, {
		"shape": "liter",
		"data": segment.firstPoint
	}];
	extend(canvas.permanent_drawings, permanents);

	canvas.redraw();
}

function loadSegments() {
	loadButton.style.visibility = "hidden";
	for (var idx in intersectii) {
		var segm = intersectii[idx];
		var ev1 = canvas.genericEventReverse(segm.p1);
		firstClick(ev1);

		var ev2 = canvas.genericEventReverse(segm.p2);
		secondClick(ev2);
	}
	loadButton.removeEventListener("click", loadSegments);
}

function mouseMove(event) {
	canvas.redraw();
	var punct = canvas.genericEvent(event);
	var drawing = {
		"shape": "segment",
		"data": getSegmentY(canvas.firstPoint, punct),
		"colour": "CadetBlue"
	};
	canvas.draw(drawing);
}

function findNewEvent(seg1, seg2) {
	if (typeof seg1 == "undefined" || typeof seg2 == "undefined") {
		return;
	}
	if (seg1 == null || seg2 == null) {
		return;
	}

	drawing = [{
		"shape": "segment",
		"data": seg1,
		"colour": "purple"
	}, {
		"shape": "segment",
		"data": seg2,
		"colour": "purple",
		"message": "Se calculează intersecția dintre <b>" + seg1.str() + "</b> și <b>" + seg2.str() + "</b>"
	}];
	breakPoints.push(drawing);

	var int = has_intersection(seg1, seg2);
	if (false == int) {
		return;
	}
	eventPoints.newIntersection(seg1, seg2, int);

	return int;
}

function deleteSegmentsFromTree(activeSegments, toDelete) {
	// se sterg segmentele din arbore
	if (toDelete.length == 0) {
		return;
	}

	var message = "Sterge <b>";
	for (var idx in toDelete) {
		var segm = toDelete[idx];
		activeSegments.delete(segm);
		breakPoints.push([{
			"shape": "segment",
			"data": segm,
			"colour": "pink"
			},{
			"shape": "graph",
			"data": activeSegments.getChart(),
			"message": message + segm.str() + "</b>"
		}]);
	}
}

function insertSegmentsIntoTree(activeSegments, toAdd) {
	// se adauga segmente in arbore
	if (toAdd.length == 0) {
		return;
	}

	var message = "Insereaza <b>";
	for (var idx in toAdd) {
		var segm = toAdd[idx];
		activeSegments.insert(segm);
		breakPoints.push([{
			"shape": "segment",
			"data": segm,
			"colour": "chocolate"
			},{
			"shape": "graph",
			"data": activeSegments.getChart(),
			"message": message + segm.str() + "</b>"
		}]);
	}
}


function handleEvent(activeSegments, point) {
	globalPoint = point;
	if (concat(point.U, point.C, point.L).length > 1) {
		eventPoints.addIntersection(point);
	}
	var toAdd = concat(point.U, point.C);
	var toDelete = concat(point.L, point.C);
	deleteSegmentsFromTree(activeSegments, toDelete);
	insertSegmentsIntoTree(activeSegments, toAdd);

	// se determina noi evenimente

	var leftNeigh = activeSegments.leftNeigh();
	var rightNeigh = activeSegments.rightNeigh();

	if (toAdd.length == 0) {
		findNewEvent(leftNeigh, rightNeigh);
		return;
	}

	var leftMost = toAdd[0];
	var rightMost = toAdd[0];
	for (var idx in toAdd) {
		var segm = toAdd[idx];
		if (compareSS(rightMost, segm, "insert") < 0) {
			rightMost = segm;
		}
		if (compareSS(segm, leftMost, "insert") < 0) {
			leftMost = segm;
		}
	}
	findNewEvent(leftNeigh, leftMost);
	findNewEvent(rightMost, rightNeigh);
}
function condition() {
	return true;
}

function run() {
	var activeSegments = new AvlTree(compareSS, compareSP);
	eventPoints.again();
	while(true) {
		var point = eventPoints.next();
		if (typeof point === "undefined")
			break;
		var drawing = {
			"shape": "sweepY",
			"data": point,
			"colour": "red",
			"events": ["redraw"],
			"message": "Dreapta de baleiere ajunge la punctul <b>" + point.litera + "</b>"
		};
		breakPoints.push(drawing)

		handleEvent(activeSegments, point);
	}
}

function firstPart() {
	if (canvas.firstPoint != null) {
		canvas.removeEvent("click", secondClick);
		canvas.removeEvent("mousemove", mouseMove);
		canvas.redraw();
	}

	for (var idx in canvas.segmente) {
	 	var segment = canvas.segmente[idx];
		extend(canvas.permanent_drawings, [{
			"shape": "segment",
			"data": segment,
			"colour": "DarkCyan"
		}, {
			"shape": "liter",
			"data": segment.secondPoint
		}, {
			"shape": "liter",
			"data": segment.firstPoint
		}]);
	}

	run();
	canvas.removeEvent("click", firstClick);
	return true;
}

function callback(){
	return;
}