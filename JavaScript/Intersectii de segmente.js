function init() {
	genericInit();
	canvas.segmente = [];
	canvas.points = [];
	canvas.addEventListener("click", firstClick);
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
		"type": "upper",
		"segment": segment
	};
	var lowerPoint = {
		"x": segment.lowerPoint.x,
		"y": segment.lowerPoint.y,
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
		if(_.isEqual(points[i], int)) {
			return;
		}
	}

	for (var idx in points) {
		if (points[idx].y <= int.y)
			continue;
		points.splice(idx, 0, int);
		return int;
	}
	points.push(int);
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
			"events": ["push"]
		}, {
			"shape": "point",
			"point": point,
			"colour": "red"
		}];
		drawings.push(drawing);

		switch (point["type"]) {
			case "upper": {
				var index = insertSegm(activeSegments, point);

				var int1 = addIntersection(sortedPoints, activeSegments[index - 1], activeSegments[index], point.y);
				var int2 = addIntersection(sortedPoints, activeSegments[index], activeSegments[index + 1]);

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