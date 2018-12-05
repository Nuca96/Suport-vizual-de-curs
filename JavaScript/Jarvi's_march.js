function init() {
	genericInit();
	canvas.addEventListener("click", addDot);
	loadButton.addEventListener("click", loadDots);
	canvas.puncte = [];
}

function addDot(event) {
	var punct = genericClick(event);
	canvas.puncte.push(punct);

	dotList.append("<li>" + punct.litera + " (" + punct.x + ", " + punct.y + ")</li>");

	var drawing = {
		"shape":"dot",
		"dot": punct,
		"colour": "black"
	}
	canvas.permanent_drawings.push(drawing);
	draw(drawing);
	var drawing = {
		"shape":"liter",
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
		addDot(ev);
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
		"dot": L[0],
		"message": "Punctul " + L[0].litera + " e cel mai din dreapta."
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
			"colour": "CadetBlue",
			"dot1": L[k],
			"dot2": S,
			"events": ["push"]
		},{
			"shape": "dot",
			"colour": "cyan",
			"dot": S,
			"events": ["push"],
			"message": "Punctul " + S.litera + " a fost ales random."
		}];
		drawings.push(to_draw);

		for (var idx in canvas.puncte) {
			var pct = canvas.puncte[idx];
			var orient = orientation(L[k], S, pct);
			var message1 = "Punctul " + pct.litera + " ";
			var message2 = " la dreapta muchiei orientate " + L[k].litera + S.litera;

			// break point
			to_draw = {
				"shape": "dot",
				"colour": "red",
				"dot": pct
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
				"shape": "line",
				"colour": "CadetBlue",
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
			"events": ["pop", "pop", "push"],
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
		message.innerText = "at least 2 dots";
		return null;	
	}

	startButton.removeEventListener("click", startAlgorithm);
	canvas.removeEventListener("click", addDot);
	loadButton.removeEventListener("click", loadDots);
	runButton.removeEventListener("click", autorun);

	drawingsIdx = 0;
	return true;
}