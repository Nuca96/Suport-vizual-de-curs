var speedMap = [0, 500, 1000, 3000, 5000];

function load() {
	this.canvas = document.getElementById("myCanvas");
	this.startButton = document.getElementById("startButton");
	this.message = document.getElementById("message");
	this.loadButton = document.getElementById("loadButton");
	this.runButton = document.getElementById("runButton");
	this.speedSelector = document.getElementById("speedSelector");
	this.panel = $("#panel");
	this.pointList = $("#pointList");
	this.ctx = canvas.getContext("2d");
	this.breakPointsIdx = null;
	init();
}

function genericInit() {
	startButton.addEventListener("click", startAlgorithm);
	runButton.addEventListener("click", autorun);
	$('#panel').empty();
	$('#pointList').empty();
	canvas.permanent_drawings = [];
	this.breakPoints = [];
	canvas.points = [];
	canvas.liter = 'A';
}

function addPointToCanvas(point) {
	// point.litera = "P" + canvas.points.length;
	point.litera = canvas.liter;
	canvas.liter = nextChar(canvas.liter);

	canvas.points.push(point);
}

function genericEvent(event) {
	var punct = {
		"x": event.clientX - canvas.offsetLeft,
		"y": event.clientY - canvas.offsetTop
	};
	return punct;
}

function nextStep() {
	if (breakPointsIdx > breakPoints.length - 1) {
		redraw();
		message.innerText = "Algoritmul s-a sfarsit";
		startButton.removeEventListener("click", nextStep);
		return null;
	}

	to_draw = breakPoints[breakPointsIdx];
	breakPointsIdx += 1;

	function action(drawing) {
		if (typeof drawing.message !== "undefined") {
			panel.append( '<li>' + drawing.message + '</li>' );
		}
		for (idx in drawing.events) {
			var ev = drawing.events[idx];
			if (ev == "push") {
				canvas.permanent_drawings.push(drawing);
			}
			if (ev == "pop") {
				canvas.permanent_drawings.pop();
			}
			if (ev == "redraw") {
				redraw();
			}
		}

		draw(drawing);
	}

	if (false === Array.isArray(to_draw)) {
		action(to_draw);
		return true;
	}
	for (var idx in to_draw) {
		action(to_draw[idx]);
	}
	return true;
}

function startAlgorithm() {
	if (null === firstPart())
		return null;

	startButton.addEventListener("click", nextStep);
	startButton.innerText = "Next";

	nextStep();
}

function autorun() {
	if (!firstPart())
		return null;
	var speed = speedMap[speedSelector.value];

	function timer() {
		if (null === nextStep()){
			return null;
		}
		setTimeout(timer, speed);
	}
	timer();
}

function redraw() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	for (var idx in canvas.permanent_drawings) {
		draw(canvas.permanent_drawings[idx]);
	}
}

function reset() {
	startButton.removeEventListener("click", nextStep);
	startButton.innerText = "Start";
	message.innerText = "";
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	init();
}

function getSweepY(y) {
	return {
		"firstPoint": {
			"x": 0,
			"y": y
		},
		"secondPoint": {
			"x": canvas.width,
			"y": y
		}
	}
}

function getSweepX(x) {
	return {
		"firstPoint": {
			"x": x,
			"y": 0
		},
		"secondPoint": {
			"x": x,
			"y": canvas.height
		}
	}
}

function draw(drawing) {
	if (typeof drawing.colour == "undefined") {
		drawing.colour = "black";
	}
	if (typeof drawing.size == "undefined") {
		drawing.size = 3;
	}
	switch (drawing.shape) {
	case "segment": {
		drawLine(ctx, drawing.segment, drawing.colour, drawing.size);
		break;
	}
	case "point": {
		drawPoint(ctx, drawing.point, drawing.colour, drawing.size);
		break;
	}
	case "liter": {
		drawLiter(ctx, drawing.point, drawing.colour);
		break;
	}
	case "sweepY": {
		drawLine(ctx, getSweepY(drawing.point.y), "black", 1);
		drawPoint(ctx, drawing.point, drawing.colour, drawing.size);
		break;
	}
	default: {
		console.log("wrong shape: " + drawing.shape);
	}
	}
}