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
	point = globalPoint;
	var int = intersection(segm, canvas.getSweepY(point.y));
	if (areNear(point, int)) {
		return 0;
	}
	return comparePointsX(int, point);
}

function pointInArray(point, array) {
	for (var idx in array) {
		if (areNear(point, array[idx])) {
			return array[idx];
		}
	}
	return null;
}

function init() {
	this.eventPoints = {
		events: [],
		intersections: [],
		idx: -1,
		next: function() {
			this.idx += 1;
			return this.events[this.idx];
		},
		addIntersection: function(point) {
			if (pointInArray(point, this.intersections)) {
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
				"message": point.litera + " este un nou punct de intersectie"
			}]);
		},
		overWriteEvent: function(point, type, segment) {
			if (type == "upper") {
				point.U.push(segment);
				return;
			}
			if (type == "lower") {
				point.L.push(segment);
				return;
			}

			// check if segment is not yet present in point.C
			for (var idx2 in point.C) {
				if(point.C[idx2] == segment)
					return;
			}
			this.addIntersection(point);

			// check if point is not endpoint of segment
			if (areNear(point, segment.firstPoint) ||
				areNear(point, segment.secondPoint)) {
				return;
			}

			point.C.push(segment);
		},
		add: function(point) {
			canvas.addPoint(point);

			for (var idx=0; idx<this.events.length; idx++) {
				if (comparePointsY(this.events[idx], point) > 0) {
					break;
				}
			}
			this.events.splice(idx, 0, point);
		},
		insert: function(point, type, segment) {
			var p = pointInArray(point, this.events)
			if (p) {
				point = p;
			} else {
				point.L = [];
				point.U = [];
				point.C = [];
				this.add(point);
			}
			this.overWriteEvent(point, type, segment);
		}
	};
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

	eventPoints.insert(segment.firstPoint, "upper", segment);
	eventPoints.insert(segment.secondPoint, "lower", segment);

	canvas.firstPoint = null;
	canvas.addEvent("click", firstClick);

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
	for (var idx in Intersection) {
		var segm = Intersection[idx];
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
		"message": "Se calculeaza intersectia dintre " + seg1.str() + " si " + seg2.str()
	}];
	breakPoints.push(drawing);

	var int = has_intersection(seg1, seg2);
	if (false == int) {
		return;
	}

	var point = canvas.getNearPoint(int);
	eventPoints.insert(point, "inter", seg1);
	eventPoints.insert(point, "inter", seg2);

	return point;
}

function deleteSegmentsFromTree(activeSegments, toDelete) {
	// se sterg segmentele din arbore
	if (toDelete.length == 0) {
		return;
	}

	var message = "Sterge ";
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
			"message": message + segm.str()
		}]);
	}
}

function insertSegmentsIntoTree(activeSegments, toAdd) {
	// se adauga segmente in arbore
	if (toAdd.length == 0) {
		return;
	}

	var message = "Insereaza ";
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
			"message": message + segm.str()
		}]);
	}
}


function handleEvent(activeSegments, point) {
	globalPoint = point;
	var toAdd = point.U.concat(point.C);
	var toDelete = point.L.concat(point.C);
	if (toAdd.concat(point.L).length > 1) {
		eventPoints.addIntersection(point);
	}
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

function run() {
	var activeSegments = new AvlTree(compareSS, compareSP);

	while(true) {
		var point = eventPoints.next();
		if (typeof point === "undefined")
			break;
		var drawing = {
			"shape": "sweepY",
			"data": point,
			"colour": "red",
			"events": ["redraw"],
			"message": "Dreapta de baleiere ajunge la punctul " + point.litera
		};
		breakPoints.push(drawing)

		handleEvent(activeSegments, point);
	}
	return true;
}

function firstPart() {
	if (canvas.firstPoint != null) {
		canvas.removeEvent("click", secondClick);
		canvas.removeEvent("mousemove", mouseMove);
		canvas.redraw();
	}

	var res = run();
	if (res == null) {
		message.innerText = "error";
		return null;
	}
	canvas.removeEvent("click", firstClick);
	startButton.removeEventListener("click", startAlgorithm);
	loadButton.removeEventListener("click", loadSegments);
	runButton.style.visibility = "hidden";

	breakPointsIdx = 0;
	return true;
}

function callback(){
	return;
}