function init() {
	genericInit();
	canvas.segmente = [];
	canvas.points = [];
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
	var segment = get_segment(canvas.firstPoint, punct);

	var upperPoint = segment.upperPoint;
	var lowerPoint = segment.lowerPoint;
	upperPoint.type = "upper";
	lowerPoint.type = "lower";
	upperPoint.segment = segment;
	lowerPoint.segment = segment;
	addPointToCanvas(upperPoint);
	addPointToCanvas(lowerPoint);
	canvas.segmente.push(segment);

	canvas.firstPoint = null;
	canvas.addEventListener("click", firstClick);

	//draw new elements
	var permanents = [{
		"shape": "liter",
		"point": lowerPoint
	}, {
		"shape": "liter",
		"point": upperPoint
	}, {
		"shape": "segment",
		"colour": "DarkCyan",
		"segment": segment
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
}

function mouseMove(event) {
	redraw();
	var punct = {
		"x": event.clientX - canvas.offsetLeft,
		"y": event.clientY - canvas.offsetTop
	};
	var drawing = {
		"shape": "segment",
		"segment": get_segment(canvas.firstPoint, punct),
		"colour": "CadetBlue"
	};
	draw(drawing);
}

function run2() {
	for (var idx1 = 0; idx1<canvas.segmente.length; idx1++) {
		var seg1 = canvas.segmente[idx1];
		for (var idx2 = idx1 + 1; idx2<canvas.segmente.length; idx2++) {
			var seg2 = canvas.segmente[idx2];

			var int = has_intersection(seg1, seg2);
			if (false === int) {
				continue;
			}

			var drawing = {
				"shape": "point",
				"point": int,
				"colour": "red"
			};
			draw(drawing);
			canvas.permanent_drawings.push(drawing);
		}
	}
	return true;
}

function insertSegm(array, point) {
	var idx = 0;
	for (; idx < array.length; idx++) {
		var int = intersection(array[idx], get_sweep(point));

		if (int.x < point.x)
			continue;
		array.splice(idx, 0, point.segment);
		return idx;
	}
	array.push(point.segment);
	return idx;
}

function theSameIntersection(p1, p2) {
	if (p1.type != "inter" || p2.type != "inter") {
		return false;
	}

	if ( _.isEqual(p1.leftSeg, p2.rightSeg) &&
		_.isEqual(p2.leftSeg, p1.rightSeg) ) {
		return true;
	}

	if ( _.isEqual(p1.leftSeg, p2.leftSeg) &&
		_.isEqual(p2.rightSeg, p1.rightSeg) ) {
		return true;
	}
	return false;
}

function addIntersection(points, seg1, seg2) {
	if (typeof seg1 == "undefined" || typeof seg2 == "undefined") {
		return;
	}

	drawing = [{
		"shape": "segment",
		"segment": seg1,
		"colour": "purple"
	}, {
		"shape": "segment",
		"segment": seg2,
		"colour": "purple",
		"message": "Se calculeaza intersectia dintre " + seg1.str() + " si " + seg2.str()
	}];
	drawings.push(drawing);

	var int = has_intersection(seg1, seg2);
	if (false == int) {
		return;
	}

	int.type = "inter";
	int.leftSeg = seg1;
	int.rightSeg = seg2;

	for (var i in points) {
		if(theSameIntersection(points[i], int)) {
			return;
		}
	}
	addPointToCanvas(int);

	function addToDrawings(int) {
		var drawing = [{
			"shape": "point",
			"point": int,
			"events": ["push"],
			"size": 4
		}, {
			"shape": "liter",
			"point": int,
			"events": ["push"]
		}];
		drawings.push(drawing);
	}

	for (var idx in points) {
		if (points[idx].y <= int.y)
			continue;
		points.splice(idx, 0, int);
		addToDrawings(int)
		return int;
	}
	points.push(int);
	addToDrawings(int)
	return int;
}

function run() {
	var sortedPoints = sort(canvas.points, comparePointsY);
	var activeSegments = [];
	for (var idx=0; idx<sortedPoints.length; idx++) {
		var point = sortedPoints[idx];

		var drawing = [{
			"shape": "sweep",
			"point": point,
			"size": 1,
			"events": ["redraw"]
		}, {
			"shape": "point",
			"point": point,
			"colour": "red"
		}];

		switch (point["type"]) {
			case "upper": {
				drawing.push({
					"shape": "segment",
					"segment": point.segment,
					"colour": "pink",
					"message": "Punctul " + point.litera + ": se introduce segmentul " + point.segment.str()
				});
				drawings.push(drawing);
				var index = insertSegm(activeSegments, point);

				addIntersection(sortedPoints, activeSegments[index - 1], activeSegments[index]);
				addIntersection(sortedPoints, activeSegments[index], activeSegments[index + 1]);

				break;
			}
			case "lower": {
				drawing.push({
					"shape": "segment",
					"segment": point.segment,
					"colour": "pink",
					"message": "Punctul " + point.litera + ": se elimina segmentul " + point.segment.str()
				});
				drawings.push(drawing);

				var index = activeSegments.indexOf(point["segment"]);
				activeSegments.splice(index, 1);
				addIntersection(sortedPoints, activeSegments[index - 1], activeSegments[index]);

				break
			}
			case "inter": {
				drawing.push({
					"shape": "segment",
					"segment": point.leftSeg,
					"colour": "pink"
				});
				drawing.push({
					"shape": "segment",
					"segment": point.rightSeg,
					"colour": "pink",
					"message": "Punctul " + point.litera + ": se interschimba segmentele " + point.leftSeg.str() + " si " + point.rightSeg.str()
				});
				drawings.push(drawing);

				var index = activeSegments.indexOf(point["leftSeg"]);
				var aux = activeSegments[index];
				activeSegments[index] = activeSegments[index + 1];
				activeSegments[index + 1] = aux;
				addIntersection(sortedPoints, activeSegments[index - 1], activeSegments[index]);
				addIntersection(sortedPoints, activeSegments[index + 1], activeSegments[index + 2]);
				break;
			}
			default: {
				break;
			}
		}
	}
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

	drawingsIdx = 0;
	return true;
}