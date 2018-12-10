function init() {
	genericInit();
	canvas.segmente = [];
	canvas.puncte = [];
	canvas.addEventListener("click", firstClick);
}

function firstClick(event) {
	canvas.removeEventListener("click", firstClick);
	var punct = genericClick(event);
	canvas.firstDot = punct;

	var drawing = {
		"shape": "liter",
		"dot": punct,
		"colour": "black"
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

	var drawing = {
		"shape": "liter",
		"dot": punct,
		"colour": "black"
	};
	canvas.permanent_drawings.push(drawing);
	draw(drawing);

	var line = {
		"shape": "line",
		"colour": "DarkCyan" 
	};

	if(compareDotsY(canvas.firstDot, punct) < 1) {
		line.dot1 = canvas.firstDot;
		line.dot2 = punct;
	} else {
		line.dot1 = punct;
		line.dot2 = canvas.firstDot;
	}
	canvas.permanent_drawings.push(line);
	draw(line);

	canvas.segmente.push(line);
	canvas.puncte.push(line.dot1);
	canvas.puncte.push(line.dot2);

	canvas.firstDot = null;
	canvas.addEventListener("click", firstClick);
}

function mouseMove(event) {
	redraw();
	var punct = {
		"x": event.clientX - canvas.offsetLeft,
		"y": event.clientY - canvas.offsetTop
	};
	var drawing = {
		"shape": "line",
		"dot1": canvas.firstDot,
		"dot2": punct,
		"colour": "CadetBlue"
	};
	draw(drawing);
}

function run() {
	for (var idx1 = 0; idx1<canvas.segmente.length; idx1++) {
		var seg1 = canvas.segmente[idx1];
		for (var idx2 = idx1 + 1; idx2<canvas.segmente.length; idx2++) {
			var seg2 = canvas.segmente[idx2];

			var int = has_intersection(seg1, seg2);
			if (false === int) {
				continue;
			}

			var drawing = {
				"shape": "dot",
				"dot": int,
				"colour": "red"
			};
			draw(drawing);
			canvas.permanent_drawings.push(drawing);
		}
	}
	return true;
}

function firstPart() {
	if (canvas.firstDot != null) {
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