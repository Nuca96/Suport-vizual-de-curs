function init() {
	genericInit();
	canvas.segmente = [];
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
	canvas.segmente.push(segment);

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
	for (var idx in Intersection) {
		var segm = Intersection[idx];
		var ev1 = {
			"clientX": segm.p1.x,
			"clientY": segm.p1.y
		};
		firstClick(ev1);

		var ev2 = {
			"clientX": segm.p2.x,
			"clientY": segm.p2.y
		};
		secondClick(ev2);
	}
	loadButton.removeEventListener("click", loadSegments);
}

function mouseMove(event) {
	redraw();
	var punct = {
		"x": event.clientX - canvas.offsetLeft,
		"y": event.clientY - canvas.offsetTop
	};
	var drawing = {
		"shape": "segment",
		"data": getSegmentY(canvas.firstPoint, punct),
		"colour": "CadetBlue"
	};
	draw(drawing);
}

function insertSegm(array, point, segm, lit) {
	for (var idx=0; idx<array.length; idx++) {
		// pentru a fi mai precisa, ordonarea se face dupa punctul de intersectie
		// al dreptei de baleiere cu un pixel mai jos decat se afla acum
		var int = intersection(array[idx], getSweepY(point.y + 1));
		var comp = comparePointsX(int, point);

		if (comp > 0){
			break;
		}
		if (comp < 0){
			continue;
		}

		if (array[idx].secondPoint.x < segm.secondPoint.x){
			break;
		}

	}
	array.splice(idx, 0, segm);
	return idx;
}

function findNewEvent(seg1, seg2) {
	if (typeof seg1 == "undefined" || typeof seg2 == "undefined") {
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
	var leftMost = activeSegments.length;

	var toDelete = point.L.concat(point.C);
	if (toDelete.length > 0) {
		var drawing = [];
		var message = "Delete segments: ";
		for (var idx in toDelete) {
			drawing.push({
				"shape": "segment",
				"data": toDelete[idx],
				"colour": "pink"
			});
			message += toDelete[idx].str() + " ";

			var index = activeSegments.indexOf(toDelete[idx]);
			activeSegments.splice(index, 1);

			if (index < leftMost)
				leftMost = index;
		}
		drawing[0].message = message;
		breakPoints.push(drawing);
	}

	var toAdd = point.U.concat(point.C);
	if (toAdd.length > 0) {
		var drawing = [];
		var message = "Add segments: ";
		for (var idx in toAdd) {
			drawing.push({
				"shape": "segment",
				"data": toAdd[idx],
				"colour": "chocolate"
			});
			message += toAdd[idx].str() + " ";

			var index = insertSegm(activeSegments, point, toAdd[idx], point.litera);

			if (index < leftMost)
				leftMost = index;
		}
		drawing[0].message = message;
		breakPoints.push(drawing);

		var rightMost = leftMost + toAdd.length - 1;
		findNewEvent(activeSegments[rightMost], activeSegments[rightMost +1]);
	}

	findNewEvent(activeSegments[leftMost-1], activeSegments[leftMost]);
}

function run() {
	var activeSegments = [];

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
	runButton.removeEventListener("click", autorun);
	loadButton.removeEventListener("click", loadSegments);

	breakPointsIdx = 0;
	return true;
}