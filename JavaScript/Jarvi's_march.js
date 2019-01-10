function init() {
	genericInit();
	canvas.addEventListener("click", addPoint);
	loadButton.addEventListener("click", loadPoints);
}

function addPoint(event) {
	var punct = genericEvent(event);
	addPointToCanvas(punct);

	var permanents = [{
		"shape":"point",
		"data": punct
	}, {
		"shape":"liter",
		"data": punct
	}]
	canvas.permanent_drawings.push.apply(canvas.permanent_drawings, permanents);
	redraw();
}

function loadPoints() {
	loadButton.style.visibility = "hidden";
	for (var idx in Jarvis) {
		var ev = genericEventReverse(Jarvis[idx]);
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
		"data": L[0],
		"colour": "cyan",
		"message": "Punctul " + L[0].litera + " e cel mai din dreapta."
	};
	breakPoints.push(to_draw)
	while (valid == true) {
		do {
			var nr = Math.floor(random(0, canvas.points.length));
			S = canvas.points[nr];
		} while(S == L[k])

		// break point
		to_draw = [{
			"shape": "segment",
			"data": getSegmentY(L[k], S),
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
			var orient = orientation(L[k], S, pct);
			var message1 = "Punctul " + pct.litera + " ";
			var message2 = " la dreapta muchiei orientate " + L[k].litera + S.litera;

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
				"data": getSegmentY(L[k], pct),
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
			"data": getSegmentY(L[k], S),
			"events": ["pop", "pop", "push", "redraw"],
			"message": "Muchia " + L[k].litera + S.litera + " face parte din acoperirea convexa."
		};
		breakPoints.push(to_draw);

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
	runButton.style.visibility = "hidden";

	startButton.removeEventListener("click", startAlgorithm);
	canvas.removeEventListener("click", addPoint);
	loadButton.removeEventListener("click", loadPoints);
	runButton.removeEventListener("click", autorun);

	breakPointsIdx = 0;
	return true;
}