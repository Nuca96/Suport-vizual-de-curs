function init() {
	genericInit();
	canvas.segmente = [];
	canvas.points = [];
	canvas.addEventListener("click", firstClick);
	loadButton.addEventListener("click", loadSegments);
}

function getNearPoint(event) {
	var point = genericEvent(event);

	for (var idx in canvas.points) {
		if (distance(canvas.points[idx], point) < 15){
			return canvas.points[idx];
		}
	}
	return point;
}

function firstClick(event) {
	canvas.removeEventListener("click", firstClick);
	var punct = getNearPoint(event);
	canvas.firstPoint = punct;

	canvas.addEventListener("click", secondClick);
	canvas.addEventListener("mousemove", mouseMove);
}

function segmentOk(verif) {
	if (verif.lowerPoint.x == verif.upperPoint.x) {
		return false;
	}

	for (var idx in canvas.points) {
		if (theSamePoint(verif.lowerPoint, canvas.points[idx]) ||
			theSamePoint(verif.upperPoint, canvas.points[idx])) {
			return true;
		}
	}

	for (var idx in canvas.segmente) {
		var segm = canvas.segmente[idx];
		var int = has_intersection(verif, segm);

		if (false === int) {
			continue;
		}

		// deja au fost verificate capetele segmentelor
		return false;
	}

	return true;
}

function addPoint(point) {
	for (var idx in canvas.points) {
		if (theSamePoint(point, canvas.points[idx])) {
			return;
		}
	}

	addPointToCanvas(point);
}

function secondClick(event) {
	var punct = getNearPoint(event);
	var segment = get_segment(canvas.firstPoint, punct);

	if (!segmentOk(segment)) {
		return;
	}
	addPoint(segment.upperPoint);
	addPoint(segment.lowerPoint);

	canvas.removeEventListener("click", secondClick);
	canvas.removeEventListener("mousemove", mouseMove);
	canvas.segmente.push(segment);

	canvas.firstPoint = null;
	canvas.addEventListener("click", firstClick);

	//draw new elements
	var permanents = [{
		"shape": "liter",
		"point": segment.upperPoint
	}, {
		"shape": "point",
		"point": segment.upperPoint
	}, {
		"shape": "liter",
		"point": segment.lowerPoint
	}, {
		"shape": "point",
		"point": segment.lowerPoint
	}, {
		"shape": "segment",
		"colour": "DarkCyan",
		"segment": segment
	}];
	canvas.permanent_drawings.push.apply(canvas.permanent_drawings, permanents);

	redraw();
}

function loadSegments() {
	for (var idx in Trapez) {
		var segm = Trapez[idx];
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
	var punct = getNearPoint(event);
	var segm = get_segment(canvas.firstPoint, punct);

	if (!segmentOk(segm)) {
		return;
	}
	var drawing = {
		"shape": "segment",
		"segment": segm,
		"colour": "CadetBlue"
	};
	draw(drawing);
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