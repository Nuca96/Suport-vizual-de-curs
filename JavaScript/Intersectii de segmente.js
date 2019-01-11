var segmentsStructure = function(comparefct) {
	this.compare = comparefct;
	this.segmente = [];
}

segmentsStructure.prototype.rightMost = function() {
	if (this.segmente.length == 0)
		return null;
	return this.segmente[this.segmente.length - 1];
}
segmentsStructure.prototype.leftMost = function() {
	if (this.segmente.length == 0)
		return null;
	return this.segmente[0];
}

segmentsStructure.prototype.rightNeigh = function(segm) {
	if (segm == null) {
		return this.leftMost();
	}
	var idx = this.segmente.indexOf(segm);
	if (idx == this.segmente.length - 1)
		return null;
	return this.segmente[idx+1];
}

segmentsStructure.prototype.leftNeigh = function(segm) {
	if (segm == null) {
		return this.rightMost();
	}
	var idx = this.segmente.indexOf(segm);
	if (idx == 0) {
		return null;
	}
	return this.segmente[idx-1];
}

segmentsStructure.prototype.delete = function(segm) {
	var idx = this.segmente.indexOf(segm);
	this.segmente.splice(idx, 1);
}

segmentsStructure.prototype.insert = function(segm, point) {
	var array = this.segmente;
	for (var idx=0; idx<array.length; idx++) {
		if (this.compare(array[idx], segm, point) > 0)
			break;

	}
	array.splice(idx, 0, segm);
	return idx;
}

function compare(segm1, segm2, point) {
	// pentru a fi mai precisa, ordonarea se face dupa punctul de intersectie
	// al dreptei de baleiere cu un pixel mai jos decat se afla acum

	// ^^^ nu stiu daca mai e corect
	var int1 = intersection(segm1, getSweepY(point.y + 1));
	var int2 = intersection(segm2, getSweepY(point.y + 1));
	var comp = comparePointsX(int1, int2);

	if (comp>0) {
		return comp;
	}

	if (comp < 0){
		return comp;
	}

	if (segm1.secondPoint.x <= segm2.secondPoint.x){
		return -1;
	}
	return 1;

}
function init() {
	genericInit();
	canvas.points = [];
	canvas.eventPoints = {
		pointArray: [],
		idx: -1,
		next: function() {
			this.idx += 1;
			return this.pointArray[this.idx];
		},
		overWriteEvent: function(point, type, segment) {
			if (type == "upper") {
				point.U.push(segment);
				return point;
			}
			if (type == "lower") {
				point.L.push(segment);
				return point;
			}

			// check if intersection is not yet present
			for (var idx2 in point.C) {
				if(point.C[idx2] == segment)
					return null;
			}
			point.C.push(segment);
			return point;
		},
		insert: function(point, type, segment) {
			for (var idx =0; idx < this.pointArray.length; idx++) {
				var comp = comparePointsY(this.pointArray[idx], point);
				if (comp == 0){
					// exista deja un eveniment in array
					return this.overWriteEvent(this.pointArray[idx], type, segment);
				}
				if (comp > 0){
					break;
				}
			}
			addPointToCanvas(point);
			point.L = [];
			point.U = [];
			point.C = [];
			this.pointArray.splice(idx, 0, point);
			return this.overWriteEvent(point, type, segment);
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

	if (canvas.eventPoints.insert(int, "inter", seg1) == null) {
		return;
	}
	canvas.eventPoints.insert(int, "inter", seg2);

	var drawing = [{
		"shape": "point",
		"data": int,
		"events": ["push"],
		"size": 4
	}, {
		"shape": "liter",
		"data": int,
		"events": ["push"]
	}];
	breakPoints.push(drawing);
	return int;
}

function handleEvent(activeSegments, point) {
	var firstLeft = activeSegments.rightMost();

	var toDelete = point.L.concat(point.C);
	if (toDelete.length > 0) {
		var drawing = [];
		var message = "Delete segments: ";
		for (var idx in toDelete) {
			var segm = toDelete[idx];
			drawing.push({
				"shape": "segment",
				"data": segm,
				"colour": "pink"
			});
			message += segm.str() + " ";

			var neigh = activeSegments.leftNeigh(segm);
			activeSegments.delete(segm);

			// actualizeaza primul segment din stanga
			if (firstLeft == null || neigh == null) {
				firstLeft = null;
			} else {
				if (activeSegments.compare(neigh, firstLeft, point) < 0) {
					firstLeft = neigh
				}
			}
		}
		drawing[0].message = message;
		breakPoints.push(drawing);
	}

	var toAdd = point.U.concat(point.C);
	var firstRight = activeSegments.leftMost();
	if (toAdd.length > 0) {
		var drawing = [];
		var message = "Add segments: ";
		for (var idx in toAdd) {
			var segm = toAdd[idx];
			drawing.push({
				"shape": "segment",
				"data": segm,
				"colour": "chocolate"
			});
			message += segm.str() + " ";

			activeSegments.insert(segm, point);

			// actualizeaza primul segment din stanga
			var neigh = activeSegments.leftNeigh(segm);
			if (firstLeft == null || neigh == null) {
				firstLeft = null;
			} else {
				if (activeSegments.compare(neigh, firstLeft, point) < 0) {
					firstLeft = neigh
				}
			}

			//actualizeaza primul segment din dreapta
			var neigh = activeSegments.rightNeigh(segm);
			if (firstRight == null || neigh == null) {
				firstRight = null;
			} else {
				if (activeSegments.compare(firstRight, neigh, point) < 0) {
					firstRight = neigh;
				}
			}

		}
		drawing[0].message = message;
		breakPoints.push(drawing);
		findNewEvent(activeSegments.leftNeigh(firstRight), firstRight);
	}

	findNewEvent(firstLeft, activeSegments.rightNeigh(firstLeft));
}

function run() {
	var activeSegments = new segmentsStructure(compare);

	while(true) {
		var point = canvas.eventPoints.next();
		if (typeof point === "undefined")
			break;
		var drawing = {
			"shape": "sweepY",
			"data": point,
			"colour": "red",
			"events": ["redraw"]
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