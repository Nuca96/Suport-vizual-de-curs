function init() {
	genericInit();
	canvas.addEventListener("click", addPoint);
	loadButton.addEventListener("click", loadPoints);
}

function addPoint(event) {
	var punct = genericEvent(event);
	addPointToCanvas(punct);

	pointList.append("<li>" + punct.litera + " (" + punct.x + ", " + punct.y + ")</li>");

	var drawing = {
		"shape":"point",
		"point": punct
	}
	canvas.permanent_drawings.push(drawing);
	draw(drawing);
	var drawing = {
		"shape":"liter",
		"point": punct
	}
	canvas.permanent_drawings.push(drawing);
	draw(drawing);
}

function loadPoints() {
	for (var idx in Jarvis) {
		var ev = {
			"clientX": Jarvis[idx].x,
			"clientY": Jarvis[idx].y
		}
		addPoint(ev);
	}
	loadButton.removeEventListener("click", loadPoints);
}

function run(){
	if(canvas.points.length < 2){
		return null;
	}
	var k = 0;
	var valid = true;
	var S, to_draw;
	var L = [];
	L.push(leftmostPoint(canvas.points));

	// break point
	to_draw = {
		"shape": "point",
		"colour": "cyan",
		"point": L[0],
		"message": "Punctul " + L[0].litera + " e cel mai din dreapta."
	};
	drawings.push(to_draw)
	while (valid == true) {
		do {
			var nr = Math.floor(random(0, canvas.points.length));
			S = canvas.points[nr];
		} while(S == L[k])

		// break point
		to_draw = [{
			"shape": "segment",
			"colour": "CadetBlue",
			"segment": get_segment(L[k], S),
			"events": ["push", "redraw"]
		},{
			"shape": "point",
			"colour": "cyan",
			"point": S,
			"events": ["push", "redraw"],
			"message": "Punctul " + S.litera + " a fost ales random."
		}];
		drawings.push(to_draw);

		for (var idx in canvas.points) {
			var pct = canvas.points[idx];
			var orient = orientation(L[k], S, pct);
			var message1 = "Punctul " + pct.litera + " ";
			var message2 = " la dreapta muchiei orientate " + L[k].litera + S.litera;

			// break point
			to_draw = {
				"shape": "point",
				"colour": "red",
				"point": pct,
				"size": 4,
				"events": ["redraw"]
			};

			if (orient !== "dreapta") {
				var message = message1 + "<b>NU ESTE</b>" + message2;
				to_draw.message = message;
				drawings.push(to_draw);
				continue;
			}
			var message = message1 + "<b>ESTE</b>" + message2;
			to_draw.message = message;
			drawings.push(to_draw);

			// break point
			to_draw = [{
				"shape": "segment",
				"colour": "CadetBlue",
				"segment": get_segment(L[k], pct),
				"events": ["pop", "pop", "push", "redraw"]
			},{
				"shape": "point",
				"colour": "cyan",
				"point": pct,
				"events": ["push", "redraw"]
			}];
			drawings.push(to_draw);
			S = pct;
		}

		// break point
		to_draw = {
			"shape": "segment",
			"segment": get_segment(L[k], S),
			"events": ["pop", "pop", "push", "redraw"],
			"message": "Muchia " + L[k].litera + S.litera + " face parte din acoperirea convexa."
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

function firstPart() {
	var res = run();
	if (res == null) {
		message.innerText = "at least 2 points";
		return null;
	}

	startButton.removeEventListener("click", startAlgorithm);
	canvas.removeEventListener("click", addPoint);
	loadButton.removeEventListener("click", loadPoints);
	runButton.removeEventListener("click", autorun);

	drawingsIdx = 0;
	return true;
}