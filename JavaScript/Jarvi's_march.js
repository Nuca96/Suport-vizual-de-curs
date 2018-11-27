function load() {
	this.canvas = document.getElementById("myCanvas");
	this.startButton = document.getElementById("startButton");
	this.message = document.getElementById("message");
	// this.nextButton = document.getElementById("nextButton");
	// this.prev = document.getElementById("prev");
	this.ctx = canvas.getContext("2d");
	init();
}


function init() {
	canvas.addEventListener("click", coordonate);
	startButton.addEventListener("click", startAlgorithm);
	canvas.puncte = [];
	canvas.litera = 'A';
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

function coordonate(event) {
	var punct = {
		x: event.clientX - this.offsetLeft,
		y: event.clientY - this.offsetTop,
		litera: canvas.litera
	};
	canvas.litera = nextChar(canvas.litera);
	canvas.puncte.push(punct);

	drawDot(ctx, punct);
	ctx.font = "15px Arial";
    ctx.fillText(punct.litera, punct.x-10, punct.y-10);
}

function run(){
	if(canvas.puncte.length < 3){
		message.innerText = "at least 3 dots";
		return;
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
		//artificiu pentru a evita stergerea din canvas a liniei de frontiera anterioare
		if (k>0 && S == L[k-1]) {
			console.log("artificiu");
			continue;
		}

		// break point
		to_draw = [{
			"shape": "dot",
			"colour": "black",
			"dot": L[k]
		},{
			"shape": "line",
			"colour": "yellow",
			"dot1": L[k],
			"dot2": S
		},{
			"shape": "dot",
			"colour": "cyan",
			"dot": S
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
				// break point
				to_draw = {
					"shape": "dot",
					"colour": "black",
					"dot": pct
				};
				drawings.push(to_draw);
				continue
			}

			// break point
			to_draw = [{
				"shape": "line",
				"colour": "white",
				"dot1": L[k],
				"dot2": S
			},{
				"shape": "dot",
				"colour": "black",
				"dot": S
			},{
				"shape": "line",
				"colour": "yellow",
				"dot1": L[k],
				"dot2": pct
			},{
				"shape": "dot",
				"colour": "cyan",
				"dot": pct
			}];
			drawings.push(to_draw);
			S = pct;
		}

		// break point
		to_draw = {
			"shape": "line",
			"colour": "green",
			"dot1": L[k],
			"dot2": S
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
	console.log("startAlgorithm");
	startButton.removeEventListener("click", startAlgorithm);
	canvas.removeEventListener("click", coordonate);
	console.log(run());

	startButton.addEventListener("click", nextStep);
	startButton.innerText = "Next";
	eventIdx = 0;
	// prev.addEventListener("click", prev);
}

function draw(drawing) {
	if (drawing.shape == "line") {
		drawLine(ctx, drawing.dot1, drawing.dot2, drawing.colour);
	}
	if (drawing.shape == "dot") {
		drawDot(ctx, drawing.dot, drawing.colour);
	}
}

function nextStep() {
	if (drawingsIdx > drawings.length - 1) {
		message.innerText = "Algoritmul s-a sfarsit";
		return;
	}

	to_draw = drawings[drawingsIdx];
	drawingsIdx += 1;

	if (false === Array.isArray(to_draw)) {
		draw(to_draw);
		return;
	}
	for (var idx in to_draw) {
		draw(to_draw[idx]);
	}
}

function reset() {
	startButton.removeEventListener("click", nextStep);
	startButton.innerText = "Start";
	message.innerText = "";
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	init();
}