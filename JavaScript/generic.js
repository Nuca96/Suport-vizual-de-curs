var speedMap = [0, 500, 1000, 3000, 5000];

function load() {
	this.canvas = document.getElementById("myCanvas");
	this.startButton = document.getElementById("startButton");
	this.message = document.getElementById("message");
	this.loadButton = document.getElementById("loadButton");
	this.runButton = document.getElementById("runButton");
	this.speedSelector = document.getElementById("speedSelector");

    $("#flip").click(function(){
        $("#panel").slideToggle("slow");
    });
	this.messList = $("#messList");
	this.ctx = canvas.getContext("2d");
	this.breakPointsIdx = null;
	init();
}

function genericInit() {
	startButton.addEventListener("click", startAlgorithm);
	runButton.addEventListener("click", autorun);

	loadButton.style.visibility = "visible";
	startButton.style.visibility = "visible";
	speedSelector.style.visibility = "visible";
	runButton.style.visibility = "visible";

	$('#messList').empty();
	canvas.permanent_drawings = [];
	this.breakPoints = [];
	canvas.points = [];
	canvas.liter = 'A';
}

function getNearPoint(point) {
	for (var idx in canvas.points) {
		if (areNear(canvas.points[idx], point)) {
			return canvas.points[idx];
		}
	}
	return point;
}


function addPointToCanvas(point) {
	// point.litera = "P" + canvas.points.length;
	point.litera = canvas.liter;
	canvas.liter = nextChar(canvas.liter);

	canvas.points.push(point);
}

function genericEvent(event) {
    var rect = canvas.getBoundingClientRect();
	var punct = {
		"x": event.clientX - rect.left,
		"y": event.clientY - rect.top
	};
	return getNearPoint(punct);
}

function genericEventReverse(point) {
    var rect = canvas.getBoundingClientRect();
	var event = {
		clientX: Math.floor(point.x + rect.left),
		clientY: Math.floor(point.y + rect.top)
	}
	return event;
}

function action(drawing) {
	if (typeof drawing.message !== "undefined") {
		messList.append( '<li>' + drawing.message + '</li>' );
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
		if (ev == "update") {
			for (var key in drawing.update) {
				drawing.data[key] = drawing.update[key];
			}
		}
	}

	draw(drawing);
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
	loadButton.style.visibility = "hidden";
	runButton.style.visibility = "hidden";

	startButton.addEventListener("click", nextStep);
	startButton.innerText = "Next";

	nextStep();
}

function autorun() {
	if (!firstPart())
		return null;
	loadButton.style.visibility = "hidden";
	startButton.style.visibility = "hidden";
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
	var data = drawing.data;
	if (typeof drawing.colour == "undefined") {
		drawing.colour = "black";
	}
	if (typeof drawing.size == "undefined") {
		drawing.size = 3;
	}
	switch (drawing.shape) {
	case "segment": {
		drawLine(ctx, data, drawing.colour, drawing.size);
		break;
	}
	case "point": {
		drawPoint(ctx, data, drawing.colour, drawing.size);
		break;
	}
	case "liter": {
		drawLiter(ctx, data, drawing.colour);
		break;
	}
	case "sweepY": {
		drawLine(ctx, getSweepY(data.y), "black", 1);
		drawPoint(ctx, data, drawing.colour, drawing.size);
		break;
	}
	case "polygon": {
		drawPolygon(ctx, data, drawing.colour);
		break
	}
	case "trapez": {
		drawPolygon(ctx, data.polygon, drawing.colour);
		break
	}
	case "extension": {
		var sweep = getSweepX(data.x);
		var lowerPoint = intersection(sweep, data.lower);
		var upperPoint = intersection(sweep, data.upper);
		var ext = getSegmentY(lowerPoint, upperPoint);
		drawLine(ctx, ext, drawing.colour, drawing.size);
		break;
	}
	default: {
		console.log("wrong shape: " + drawing.shape);
	}
	}
}