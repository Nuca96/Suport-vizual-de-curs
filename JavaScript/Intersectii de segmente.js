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

function run() {
	var sortedPoints = sort(canvas.points, comparePointsY);
	for (var idx in sortedPoints) {
		var point = sortedPoints[idx];
		var drawing = [{
			"shape": "point",
			"point": point,
			"colour": "red"
		}, {
			"shape": "sweep",
			"point": point,
			"size": 1
		}];
		drawings.push(drawing);
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