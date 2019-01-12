var segmentsStructure = function(compareSS, compareSP) {
	this.compareSS = compareSS;
	this.compareSP = compareSP;
	this.segmente = [];
}

segmentsStructure.prototype.rightNeigh = function(point) {
	for (var idx in this.segmente) {
		if (this.compareSP(this.segmente[idx], point) > 0) {
			return this.segmente[idx];
		}
	}
	return null;
}

segmentsStructure.prototype.leftNeigh = function(point) {
	var neigh = null;
	for (var idx in this.segmente) {
		if (this.compareSP(this.segmente[idx], point) >= 0) {
			break;
		}
		neigh = this.segmente[idx];
	}
	return neigh;
}

segmentsStructure.prototype.delete = function(segm) {
	var idx = this.segmente.indexOf(segm);
	this.segmente.splice(idx, 1);
}

segmentsStructure.prototype.insert = function(segm, point) {
	var array = this.segmente;
	for (var idx=0; idx<array.length; idx++) {
		if (this.compareSS(array[idx], segm, point) > 0){
			break;
		}
	}
	array.splice(idx, 0, segm);
}

function compareSS(segm1, segm2, point) {
	// pentru a fi mai precisa, ordonarea se face dupa punctul de intersectie
	// al dreptei de baleiere cu un pixel mai jos decat se afla acum

	// ^^^ nu stiu daca mai e corect
	var int1 = intersection(segm1, getSweepY(point.y + 1));
	var int2 = intersection(segm2, getSweepY(point.y + 1));
	var comp = comparePointsX(int1, int2);

	if (comp != 0) {
		return comp;
	}

	return comparePointsX(segm1.secondPoint, segm2.secondPoint);
}

function compareSP(segm, point) {
	var int = intersection(segm, getSweepY(point.y));
	if (areNear(point, int)) {
		return 0;
	}
	return comparePointsX(int, point);
}

function init() {
	genericInit();
	canvas.points = [];
	canvas.eventPoints = {
		events: [],
		intersections: [],
		idx: -1,
		next: function() {
			this.idx += 1;
			return this.events[this.idx];
		},
		present: function(point, array) {
			for (var idx in array) {
				if (areNear(point, array[idx])) {
					return true;
				}
			}
			return false;
		},
		addIntersection: function(point) {
			if (this.present(point, this.intersections)) {
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

			this.addIntersection(point);
			// check if intersection is not yet present
			for (var idx2 in point.C) {
				if(point.C[idx2] == segment)
					return;
			}
			if (areNear(point, segment.firstPoint)) {
				return;
			}
			if (areNear(point, segment.secondPoint)) {
				return;
			}
			point.C.push(segment);
		},
		add: function(point) {
			addPointToCanvas(point);

			for (var idx=0; idx<this.events.length; idx++) {
				if (comparePointsY(this.events[idx], point) > 0) {
					break;
				}
			}
			this.events.splice(idx, 0, point);
		},
		insert: function(point, type, segment) {
			if (false === this.present(point, this.events)) {
				point.L = [];
				point.U = [];
				point.C = [];
				this.add(point);
			}
			this.overWriteEvent(point, type, segment);
		}
	};
	canvas.addEventListener("click", firstClick);
	loadButton.addEventListener("click", loadSegments);
}

function firstClick(event) {
	canvas.removeEventListener("click", firstClick);
	var punct = genericEvent(event);
	canvas.firstPoint = punct;

	canvas.addEventListener("click", secondClick);
	canvas.addEventListener("mousemove", mouseMove);
}

function secondClick(event) {
	canvas.removeEventListener("click", secondClick);
	canvas.removeEventListener("mousemove", mouseMove);

	var punct = genericEvent(event);
	var segment = getSegmentY(canvas.firstPoint, punct);

	canvas.eventPoints.insert(segment.firstPoint, "upper", segment);
	canvas.eventPoints.insert(segment.secondPoint, "lower", segment);

	canvas.firstPoint = null;
	canvas.addEventListener("click", firstClick);

	//draw new elements
	var permanents = [{
		"shape": "liter",
		"data": segment.secondPoint
	}, {
		"shape": "liter",
		"data": segment.firstPoint
	}, {
		"shape": "segment",
		"data": segment,
		"colour": "DarkCyan"
	}];
	canvas.permanent_drawings.push.apply(canvas.permanent_drawings, permanents);

	redraw();
}

function loadSegments() {
	loadButton.style.visibility = "hidden";
	for (var idx in Intersection) {
		var segm = Intersection[idx];
		var ev1 = genericEventReverse(segm.p1);
		firstClick(ev1);

		var ev2 = genericEventReverse(segm.p2);
		secondClick(ev2);
	}
	loadButton.removeEventListener("click", loadSegments);
}

function mouseMove(event) {
	redraw();
	var punct = genericEvent(event);
	var drawing = {
		"shape": "segment",
		"data": getSegmentY(canvas.firstPoint, punct),
		"colour": "CadetBlue"
	};
	draw(drawing);
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

	var point = getNearPoint(int);
	canvas.eventPoints.insert(point, "inter", seg1);
	canvas.eventPoints.insert(point, "inter", seg2);

	return point;
}

function deleteSegmentsFromTree(activeSegments, point) {
	// se sterg segmentele din arbore
	var toDelete = point.L.concat(point.C);
	if (toDelete.length == 0) {
		return;
	}

	var drawing = [];
	var message = "Sterge: ";
	for (var idx in toDelete) {
		var segm = toDelete[idx];
		drawing.push({
			"shape": "segment",
			"data": segm,
			"colour": "pink"
		});
		message += segm.str() + " ";
		activeSegments.delete(segm);
	}
	drawing[0].message = message;
	breakPoints.push(drawing);
}

function insertSegmentsIntoTree(activeSegments, point) {
	// se adauga segmente in arbore
	var toAdd = point.U.concat(point.C);
	if (toAdd.length == 0) {
		return;
	}

	var drawing = [];
	var message = "Insereaza: ";
	for (var idx in toAdd) {
		var segm = toAdd[idx];
		drawing.push({
			"shape": "segment",
			"data": segm,
			"colour": "chocolate"
		});
		message += segm.str() + " ";
		activeSegments.insert(segm, point);
	}
	drawing[0].message = message;
	breakPoints.push(drawing);
}


function handleEvent(activeSegments, point) {
	if (point.U.concat(point.C).concat(point.L).length > 1) {
		canvas.eventPoints.addIntersection(point);
	}
	deleteSegmentsFromTree(activeSegments, point);
	insertSegmentsIntoTree(activeSegments, point);

	// se determina noi evenimente
	var leftNeigh = activeSegments.leftNeigh(point);
	var rightNeigh = activeSegments.rightNeigh(point);
	var inserted = point.U.concat(point.C);
	if (inserted.length == 0) {
		findNewEvent(leftNeigh, rightNeigh);
		return;
	}

	var leftMost = inserted[0];
	var rightMost = inserted[0];
	for (var idx in inserted) {
		var segm = inserted[idx];
		if (compareSS(rightMost, segm, point) < 0) {
			rightMost = segm;
		}
		if (compareSS(segm, leftMost, point) < 0) {
			leftMost = segm;
		}
	}
	findNewEvent(leftNeigh, leftMost);
	findNewEvent(rightMost, rightNeigh);
}

function run() {
	var activeSegments = new segmentsStructure(compareSS, compareSP);

	while(true) {
		var point = canvas.eventPoints.next();
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

		handleEvent(activeSegments, point);	}
	return true;
}

function firstPart() {
	if (canvas.firstPoint != null) {
		canvas.removeEventListener("click", secondClick);
		canvas.removeEventListener("mousemove", mouseMove);
		redraw();
	}

	var res = run();
	if (res == null) {
		message.innerText = "error";
		return null;
	}
	canvas.removeEventListener("click", firstClick);
	startButton.removeEventListener("click", startAlgorithm);
	loadButton.removeEventListener("click", loadSegments);
	runButton.style.visibility = "hidden";

	breakPointsIdx = 0;
	return true;
}