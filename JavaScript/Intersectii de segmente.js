function init() {
	genericInit();
	canvas.segmente = [];
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

	var drawing = {
		"shape": "line",
		"dot1": canvas.firstDot,
		"dot2": punct,
		"colour": "DarkCyan" 
	};
	canvas.permanent_drawings.push(drawing);
	draw(drawing);

	canvas.segmente.push(drawing);

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
	for (var idx in canvas.segmente) {
		var seg = canvas.segmente[idx];
		var to_draw = {
			"shape": "dot",
			"dot": seg.dot1,
			"colour": "red"
		};
		drawings.push(to_draw);
		to_draw = {
			"shape": "dot",
			"dot": seg.dot2,
			"colour": "red"
		};
		drawings.push(to_draw);
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