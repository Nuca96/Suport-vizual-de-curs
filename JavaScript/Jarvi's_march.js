function load() {
	this.canvas = document.getElementById("myCanvas");
	this.startButton = document.getElementById("startButton");
	this.message = document.getElementById("message");
	this.loadButton = document.getElementById("loadButton");
	// this.nextButton = document.getElementById("nextButton");
	// this.prev = document.getElementById("prev");
	this.ctx = canvas.getContext("2d");
	init();
}


function init() {
	canvas.addEventListener("click", coordonate);
	startButton.addEventListener("click", startAlgorithm);
	loadButton.addEventListener("click", loadDots);
	canvas.puncte = [];
	canvas.litera = 'A';
	canvas.permanent_drawings = [];
	this.drawings = [];
	this.drawingsIdx = 0;
// {
// 	"shape": [dot, line],
// 	"colour": ...,
// 	"dot1":
// 	"dot2":
// 	"dot"
// }
}

function draw(drawing) {
	if (drawing.shape == "line") {
		drawLine(ctx, drawing.dot1, drawing.dot2, drawing.colour);
	}
	if (drawing.shape == "dot") {
		drawDot(ctx, drawing.dot, drawing.colour);
		ctx.font = "15px Arial";
	    ctx.fillText(drawing.dot.litera, drawing.dot.x-10, drawing.dot.y-10);
	}
}

function coordonate(event) {
	var punct = {
		"x": event.clientX - canvas.offsetLeft,
		"y": event.clientY - canvas.offsetTop,
		"litera": canvas.litera
	};
	canvas.litera = nextChar(canvas.litera);
	canvas.puncte.push(punct);

	var drawing = {
		"shape":"dot",
		"dot": punct,
		"colour": "black"
	}
	canvas.permanent_drawings.push(drawing);
	draw(drawing);
}

function loadDots() {
	for (var idx in Jarvis) {
		var ev = {
			"clientX": Jarvis[idx].x,
			"clientY": Jarvis[idx].y
		}
		coordonate(ev);
	}
	loadButton.removeEventListener("click", loadDots);
}

function run(){
	if(canvas.puncte.length < 2){
		return null;
	}
	var k = 0;
	var valid = true;
	var S, to_draw;
	var L = [];
	L.push(leftmostDot(canvas.puncte));

	// break point
	to_draw = {
		"shape": "dot",
		"colour": "cyan",
		"dot": L[0]
	};
	drawings.push(to_draw)
	while (valid == true) {
		do {
			var nr = Math.floor(random(0, canvas.puncte.length));
			S = canvas.puncte[nr];
		} while(S == L[k])

		// break point
		to_draw = [{
			"shape": "line",
			"colour": "yellow",
			"dot1": L[k],
			"dot2": S,
			"events": ["push"]
		},{
			"shape": "dot",
			"colour": "cyan",
			"dot": S,
			"events": ["push"]
		}];
		drawings.push(to_draw);

		for (var idx in canvas.puncte) {
			var pct = canvas.puncte[idx];
			// break point
			to_draw = {
				"shape": "dot",
				"colour": "red",
				"dot": pct
			};
			drawings.push(to_draw);

			var orient = orientation(L[k], S, pct);
			if (orient !== "dreapta") {
				continue
			}

			// break point
			to_draw = [{
				"shape": "line",
				"colour": "yellow",
				"dot1": L[k],
				"dot2": pct,
				"events": ["pop", "pop", "push"]
			},{
				"shape": "dot",
				"colour": "cyan",
				"dot": pct,
				"events": ["push"]
			}];
			drawings.push(to_draw);
			S = pct;
		}

		// break point
		to_draw = {
			"shape": "line",
			"colour": "black",
			"dot1": L[k],
			"dot2": S,
			"events": ["pop", "pop", "push"]
		};
		drawings.push(to_draw);

		if (S != L[0]) {
			k = k + 1;
			L.push(S);
		}
		else {
			valid = false;
		}
	}	
	return L;
}

function startAlgorithm() {
	var res = run();
	if (res == null) {
		message.innerText = "at least 2 dots";
		return		
	}

	nextStep();
	startButton.removeEventListener("click", startAlgorithm);
	canvas.removeEventListener("click", coordonate);
	loadButton.removeEventListener("click", loadDots);
	startButton.addEventListener("click", nextStep);
	startButton.innerText = "Next";
	eventIdx = 0;
	// prev.addEventListener("click", prev);
}

function redraw() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	for (var idx in canvas.permanent_drawings) {
		draw(canvas.permanent_drawings[idx]);
	}
}

function nextStep() {
	if (drawingsIdx > drawings.length - 1) {
		message.innerText = "Algoritmul s-a sfarsit";
		startButton.removeEventListener("click", nextStep);
		return;
	}

	to_draw = drawings[drawingsIdx];
	drawingsIdx += 1;

	function action(drawing) {
		for (idx in drawing.events) {
			var ev = drawing.events[idx];
			if (ev == "push") {
				canvas.permanent_drawings.push(drawing);
			}
			if (ev == "pop") {
				canvas.permanent_drawings.pop();
			}
		}
		drawing.events = [];
		redraw();
		draw(drawing);
	}

	if (false === Array.isArray(to_draw)) {
		action(to_draw);
		return;
	}
	for (var idx in to_draw) {
		action(to_draw[idx]);
	}
}

function reset() {
	startButton.removeEventListener("click", nextStep);
	startButton.innerText = "Start";
	message.innerText = "";
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	init();
}