function init() {
	this.algorithm =  document.getElementById("algorithmSelector");
	canvas.addEvent("click", addPoint);
	loadButton.addEventListener("click", loadPoints);
}

function addPoint(event) {
	var punct = canvas.genericEvent(event);
	canvas.addPoint(punct);

	var permanents = [{
		"shape":"point",
		"data": punct
	}, {
		"shape":"liter",
		"data": punct
	}]
	extend(canvas.permanent_drawings, permanents);
	canvas.redraw();
}

function loadPoints() {
	loadButton.style.visibility = "hidden";
	for (var idx in Jarvis) {
		var ev = canvas.genericEventReverse(Jarvis[idx]);
		addPoint(ev);
	}
	loadButton.removeEventListener("click", loadPoints);
}

function runJarvis(){
	if(canvas.points.length < 2){
		return null;
	}
	var valid = true;
	var S, to_draw;
	var L = [];
	L.push(canvas.leftmostPoint());

	// break point
	to_draw = {
		"shape": "point",
		"data": L[0],
		"colour": "cyan",
		"message": "Punctul " + L[0].litera + " e cel mai din dreapta."
	};
	breakPoints.push(to_draw)
	while (true) {
		var last = lastElem(L);
		do {
			var nr = Math.floor(random(0, canvas.points.length));
			S = canvas.points[nr];
		} while (S == last)

		// break point
		to_draw = [{
			"shape": "segment",
			"data": getSegmentY(last, S),
			"colour": "CadetBlue",
			"events": ["push", "redraw"]
		},{
			"shape": "point",
			"data": S,
			"colour": "cyan",
			"events": ["push", "redraw"],
			"message": "Punctul " + S.litera + " a fost ales random."
		}];
		breakPoints.push(to_draw);

		for (var idx in canvas.points) {
			var pct = canvas.points[idx];
			var orient = orientation(last, S, pct);
			var message1 = "Punctul " + pct.litera + " ";
			var message2 = " la dreapta muchiei orientate " + last.litera + S.litera;

			// break point
			to_draw = {
				"shape": "point",
				"data": pct,
				"colour": "red",
				"size": 4,
				"events": ["redraw"]
			};

			if (orient !== "dreapta") {
				var message = message1 + "<b>NU ESTE</b>" + message2;
				to_draw.message = message;
				breakPoints.push(to_draw);
				continue;
			}
			var message = message1 + "<b>ESTE</b>" + message2;
			to_draw.message = message;
			breakPoints.push(to_draw);

			// break point
			to_draw = [{
				"shape": "segment",
				"data": getSegmentY(last, pct),
				"colour": "CadetBlue",
				"events": ["pop", "pop", "push", "redraw"]
			},{
				"shape": "point",
				"data": pct,
				"colour": "cyan",
				"events": ["push", "redraw"]
			}];
			breakPoints.push(to_draw);
			S = pct;
		}

		// break point
		to_draw = {
			"shape": "segment",
			"data": getSegmentY(last, S),
			"events": ["pop", "pop", "push", "redraw"],
			"message": "Muchia " + last.litera + S.litera + " face parte din acoperirea convexa."
		};
		breakPoints.push(to_draw);

		if (S == L[0]) {
			break;
		}
		L.push(S);
	}
	return L;
}

function runGrahams() {
	var sortedPoints = sort(canvas.points, comparePointsX);

	for (var idx in sortedPoints) {
		breakPoints.push({
			"shape": "point",
			"data": sortedPoints[idx],
			"colour": "red",
			"size": 4,
			"events": ["redraw"]
		});
	}
	return true;
}

function firstPart() {
	if (algorithm.value == 0) {
		var res = runGrahams();
	} else {
		var res = runJarvis();
	}
	if (res == null) {
		message.innerText = "at least 2 points";
		return null;
	}
	runButton.style.visibility = "hidden";

	startButton.removeEventListener("click", startAlgorithm);
	canvas.removeEvent("click", addPoint);
	loadButton.removeEventListener("click", loadPoints);
	runButton.removeEventListener("click", autorun);

	breakPointsIdx = 0;
	return true;
}

function callback(){
	return;
}
