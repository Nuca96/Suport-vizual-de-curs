var speedMap = [0, 500, 1000, 3000, 5000];

function load() {
	this.canvas = new Canvas("myCanvas");
	this.startButton = document.getElementById("startButton");
	this.message = document.getElementById("message");
	this.loadButton = document.getElementById("loadButton");
	this.runButton = document.getElementById("runButton");
	this.speedSelector = document.getElementById("speedSelector");

    $("#flip").click(function(){
        $("#panel").slideToggle("slow");
    });
	this.messList = $("#messList");
	this.breakPointsIdx = null;

	startButton.addEventListener("click", startAlgorithm);
	runButton.addEventListener("click", autorun);
	this.breakPoints = [];
	init();
}

function nextStep() {
	if (breakPointsIdx > breakPoints.length - 1) {
		genericCB();
		return null;
	}

	to_draw = breakPoints[breakPointsIdx];
	breakPointsIdx += 1;

	if (false === Array.isArray(to_draw)) {
		canvas.action(to_draw);
		return true;
	}
	for (var idx in to_draw) {
		canvas.action(to_draw[idx]);
	}
	return true;
}

function genericCB() {
	startButton.removeEventListener("click", nextStep);
	message.innerText = "Algoritmul s-a sfarsit";
	canvas.redraw();
	callback();
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
	runButton.style.visibility = "hidden";

	function timer() {
		if (null === nextStep()){
			return null;
		}
		setTimeout(timer, speedMap[speedSelector.value]);
	}
	timer();
}

function reset() {
	location.reload();
}