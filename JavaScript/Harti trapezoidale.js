function init() {
	genericInit();
	canvas.segmente = [];
	canvas.points = [];
	canvas.addEventListener("click", firstClick);
	loadButton.addEventListener("click", loadSegments);
}

function getNearPoint(event) {
	var point = genericClick(event);

	for (var idx in canvas.points) {
		if (distance(canvas.points[idx], point) < 10){
			return canvas.points[idx];
		}
	}
	return point;
}

function firstClick(event) {
	canvas.removeEventListener("click", firstClick);
	var punct = getNearPoint(event);
	canvas.firstPoint = punct;

	var drawing = {
		"shape": "liter",
		"point": punct
	};
	canvas.permanent_drawings.push(drawing);
	draw(drawing);

	var drawing = {
		"shape": "point",
		"point": punct
	};
	canvas.permanent_drawings.push(drawing);
	draw(drawing);

	canvas.addEventListener("click", secondClick);
	canvas.addEventListener("mousemove", mouseMove);
}

function segmentOk(verif) {
	if (verif.lowerPoint.x == verif.upperPoint.x) {
		return false;
	}

	for (var idx in canvas.segmente) {
		var segm = canvas.segmente[idx];
		var int = has_intersection(verif, segm);

		if (false === int) {
			continue;
		}

		if (theSamePoint(int, verif.lowerPoint) || theSamePoint(int, verif.upperPoint)) {
			if (theSamePoint(int, segm.lowerPoint) || theSamePoint(int, segm.upperPoint)) {
				continue;
			}
		}
		return false;
	}

	return true;
}

function secondClick(event) {
	var punct = getNearPoint(event);
	var segment = get_segment(canvas.firstPoint, punct);

	if (!segmentOk(segment)) {
		return;
	}

	canvas.removeEventListener("click", secondClick);
	canvas.removeEventListener("mousemove", mouseMove);
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

	var drawing = {
		"shape": "point",
		"point": punct
	};
	canvas.permanent_drawings.push(drawing);

	var drawing = {
		"shape": "segment",
		"colour": "DarkCyan",
		"segment": segment
	};
	canvas.permanent_drawings.push(drawing);

	redraw();
}

function loadSegments() {
	for (var idx in Trapeze) {
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
}

function mouseMove(event) {
	redraw();
	var punct = {
		"x": event.clientX - canvas.offsetLeft,
		"y": event.clientY - canvas.offsetTop
	};

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