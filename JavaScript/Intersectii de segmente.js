function init() {
	genericInit();
	canvas.segmente = [];
	canvas.points = [];
	canvas.addEventListener("click", firstClick);
	loadButton.addEventListener("click", loadSegments);
}

function firstClick(event) {
	canvas.removeEventListener("click", firstClick);
	var punct = genericClick(event);
	canvas.firstPoint = punct;

	var drawing = {
		"shape": "liter",
		"point": punct
	};
	canvas.permanent_drawings.push(drawing);
	draw(drawing);

	canvas.addEventListener("click", secondClick);
	canvas.addEventListener("mousemove", mouseMove);
}

function secondClick(event) {
	canvas.removeEventListener("click", secondClick);
	canvas.removeEventListener("mousemove", mouseMove);

	var punct = genericClick(event);
	var segment = get_segment(canvas.firstPoint, punct);
	canvas.segmente.push(segment);

	var upperPoint = {
		"x": segment.upperPoint.x,
		"y": segment.upperPoint.y,
		"litera": segment.upperPoint.litera,
		"type": "upper",
		"segment": segment
	};
	var lowerPoint = {
		"x": segment.lowerPoint.x,
		"y": segment.lowerPoint.y,
		"litera": segment.lowerPoint.litera,
		"type": "lower",
		"segment": segment
	};
	canvas.points.push(upperPoint);
	canvas.points.push(lowerPoint);

	canvas.firstPoint = null;
	canvas.addEventListener("click", firstClick);

	//draw new elements
	var drawing = {
		"shape": "liter",
		"point": punct
	};
	canvas.permanent_drawings.push(drawing);
	draw(drawing);

	var drawing = {
		"shape": "segment",
		"colour": "DarkCyan",
		"segment": segment
	};
	canvas.permanent_drawings.push(drawing);
	draw(drawing);
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

function equalInters(p1, p2) {
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

function addIntersection(points, seg1, seg2, sweep) {
	if (typeof seg1 == "undefined" || typeof seg2 == "undefined") {
		return;
	}
	var int = has_intersection(seg1, seg2);
	if (false == int) {
		return;
	}

	int.type = "inter";
	int.leftSeg = seg1;
	int.rightSeg = seg2;

	for (var i in points) {
		if(equalInters(points[i], int)) {
			return;
		}
	}
	int.litera = getNextLiter(canvas);

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
			"colour": "red",
			"message": "Dreapta de baleiere a cooborat la punctul " + point.litera
		}];
		drawings.push(drawing);

		switch (point["type"]) {
			case "upper": {
				var index = insertSegm(activeSegments, point);

				addIntersection(sortedPoints, activeSegments[index - 1], activeSegments[index], point.y);
				addIntersection(sortedPoints, activeSegments[index], activeSegments[index + 1]);

				break;
			}
			case "lower": {
				var index = activeSegments.indexOf(point["segment"]);
				activeSegments.splice(index, 1);
				addIntersection(sortedPoints, activeSegments[index - 1], activeSegments[index], point.y);

				break
			}
			case "inter": {
				var index = activeSegments.indexOf(point["leftSeg"]);
				var aux = activeSegments[index];
				activeSegments[index] = activeSegments[index + 1];
				activeSegments[index + 1] = aux;
				addIntersection(sortedPoints, activeSegments[index - 1], activeSegments[index], point.y);
				addIntersection(sortedPoints, activeSegments[index + 1], activeSegments[index + 2], point.y);
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
		canvas.permanent_drawings.pop();
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