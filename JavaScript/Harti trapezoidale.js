function Trapez(top, bottom, leftp, rightp) {
	this.idx = tridx;
	tridx++;
	this.bottom = bottom;
	this.top = top;
	this.leftp = leftp;
	this.rightp = rightp;
	this.node = null; //this property will be updated lately

	this.topLeft = null;
	this.topRight = null;
	this.bottomLeft = null;
	this.bottomRight = null;
};

Trapez.prototype.updateNeighbors = function(topLeft, topRight, bottomLeft, bottomRight) {
	if (topLeft != null) {
		this.topLeft = topLeft;
		topLeft.topRight = this;
	}
	if (topRight != null) {
		this.topRight = topRight;
		topRight.topLeft = this;
	}
	if (bottomLeft != null) {
		this.bottomLeft = bottomLeft;
		bottomLeft.bottomRight = this;
	}
	if (bottomRight != null) {
		this.bottomRight = bottomRight;
		bottomRight.bottomLeft = this;
	}
};

var Node = function(type, leftn, rightn, info) {
	this.type = type;
	this.leftn = leftn;
	this.rightn = rightn;
	this.info = info;
	info.node = this;
};

Node.prototype.search = function(point) {
	if (this.type == "trapez")
		return this;

	if (this.type == "segment") {
		breakPoints.push({
			"shape": "segment",
			"segment": this.info,
			"colour": "red"
		});
		var orient = orientation(this.info.firstPoint, this.info.secondPoint, point);
		if (orient == "dreapta") {
			return this.rightn.search(point);
		}
		if (orient == "stanga") {
			return this.leftn.search(point);
		}
		return this;
	}

	if (this.type == "point") {
		breakPoints.push({
			"shape": "point",
			"point": this.info,
			"colour": "red",
			"size": 5
		});
		if (point.x < this.info.x) {
			return this.leftn.search(point);
		}
		if (this.info.x < point.x) {
			return this.rightn.search(point);
		}
		return this;
	}
	console.log("wrong node type");
};

var D = {
	init: function() {
		var tr = {x:canvas.width, y:0};
		var bl = {x:0, y:canvas.height};
		var tl = {x: 0, y:0, lower: bl};
		var br = {x:canvas.width, y:canvas.height, upper: tr};
		var top = getSegmentX(tl, tr);
		var bottom = getSegmentX(bl, br);
		var tr = new Trapez(top, bottom, tl, br);

		// "not null" - fot drawing the lefter and righter trapezoids
		tr.updateNeighbors(null, "not null", "not null", null);
		var nod = new Node("trapez", null, null, tr);
		this.root = nod;
	},
	search: function(point) {
		return this.root.search(point);
	}
};

function newPoint(point) {
	return typeof point.lower === "undefined";
}

function createExtension(point, trapez) {
	if (!newPoint(point)) {
		return false;
	}
	var sweep = getSweepX(point.x);
	point.upper = intersection(sweep, trapez.top);
	point.lower = intersection(sweep, trapez.bottom);

	return true;
}

function nextTrapez(segm, trapez) {
	if (segm.secondPoint === trapez.rightp) {
		return NaN;
	}
	var orient = orientation(segm.firstPoint, segm.secondPoint, trapez.rightp);
	if (orient == "dreapta") {
		return trapez.topRight;
	}
	if (orient == "stanga") {
		return trapez.bottomRight;
	}
	return NaN;
}

function getIntersectList(segm) {
	var node = D.search(segm.firstPoint);
	if (node.type !== "trapez") {
		var int = intersection(segm, getSweepX(segm.firstPoint.x + near));
		node = D.search(int);
	}

	var trList = [node.info];
	var second = segm.secondPoint;
	do {
		var lastTr = lastElem(trList);
		if (lastTr.rightp.x >= second.x) {
			break;
		}
		trList.push(nextTrapez(segm, lastTr));
	} while(true);

	return trList;
}

function createTrapez(segm, trapez, nodes, where) {
	var leftp = segm.firstPoint;
	var lastTr = null;
	var lastNode = lastElem(nodes);
	if (lastNode != null) {
		lastTr = lastNode.info;
		leftp = lastTr.rightp;
	}
	if (where == "bottom") {
		var newTrapez = new Trapez(segm, trapez.bottom, leftp, trapez.rightp);
	} else {
		var newTrapez = new Trapez(trapez.top, segm, leftp, trapez.rightp);
	}
	var newNode = new Node("trapez", null, null, newTrapez);
	nodes.push(newNode);
}

function createMiddleTrapezoids(segm, trList) {
	var bottomNodes = [];
	var topNodes = [];

	for (var idx in trList) {
		var trapez = trList[idx];
		var newInt = intersection(getSweepX(trapez.rightp.x), segm);

		if (nextTrapez(segm, trapez) == trapez.topRight) {
			trapez.rightp.upper = newInt;
			trapez.type = "bottom";
			createTrapez(segm, trapez, bottomNodes, "bottom");
			continue;
		}
		if (nextTrapez(segm, trapez) == trapez.bottomRight) {
			trapez.rightp.lower = newInt;
			trapez.type = "top";
			createTrapez(segm, trapez, topNodes, "top");
			continue;
		}

		//last one
		createTrapez(segm, trapez, bottomNodes, "bottom");
		createTrapez(segm, trapez, topNodes, "top");
	}

	// set neighbours
	var previous = "";
	var lastBottom = trList[0].bottomLeft;
	var lastTop = trList[0].topLeft;
	for (var tidx=0, bidx=0, idx=0; idx<trList.length; idx++) {
		var trapez = trList[idx];
		var thisNode = trapez.node;

		thisNode.type = "segment";
		thisNode.leftn = topNodes[tidx];
		thisNode.rightn = bottomNodes[bidx];
		thisNode.info = segm;
		if (trapez.type != "top") {
			var topLeft = null;
			var topRight = null;
			var bottomLeft = trapez.bottomLeft;
			var bottomRight = trapez.bottomRight;

			if (previous != "bottom") {
				previous = "bottom";
				bottomLeft = lastBottom;
				lastTop = trapez.topLeft;
			}

			if (bidx!=0) {
				topLeft = bottomNodes[bidx-1].info;
			}
			bottomNodes[bidx].info.updateNeighbors(topLeft, topRight, bottomLeft, bottomRight);
			bidx++;
		}
		if (trapez.type != "bottom") {
			var topLeft = trapez.topLeft;
			var topRight = trapez.topRight;
			var bottomLeft = null;
			var bottomRight = null;

			if (previous != "top") {
				previous = "top";
				topLeft = lastTop;
				lastBottom = trapez.bottomLeft;
			}
			if (tidx!=0) {
				bottomLeft = topNodes[tidx-1].info;
			}
			topNodes[tidx].info.updateNeighbors(topLeft, topRight, bottomLeft, bottomRight);
			tidx++;
		}
	}
}

function createLeftTrapez(point, trList) {
	var trapez = trList[0];

	var leftTrapez = new Trapez(trapez.top, trapez.bottom, trapez.leftp, point);
	var fakeTrapez = new Trapez(trapez.top, trapez.bottom, point, trapez.rightp);

	leftTrapez.updateNeighbors(trapez.topLeft, null, trapez.bottomLeft, null);
	fakeTrapez.updateNeighbors(leftTrapez, trapez.topRight, leftTrapez, trapez.bottomRight);

	var leftNode = new Node("trapez", null, null, leftTrapez);
	var fakeNode = new Node("trapez", null, null, fakeTrapez);

	var oldNode = trapez.node;
	oldNode.type = "point";
	oldNode.leftn = leftNode;
	oldNode.rightn = fakeNode;
	oldNode.info = point;

	trList[0] = fakeTrapez;
}

function createRightTrapez(point, trList) {
	var trapez = lastElem(trList);

	var rightTrapez = new Trapez(trapez.top, trapez.bottom, point, trapez.rightp);
	var fakeTrapez = new Trapez(trapez.top, trapez.bottom, trapez.leftp, point);

	rightTrapez.updateNeighbors(null, trapez.topRight, null, trapez.bottomRight);
	fakeTrapez.updateNeighbors(trapez.topLeft, rightTrapez, trapez.bottomLeft, rightTrapez);

	var rightNode = new Node("trapez", null, null, rightTrapez);
	var fakeNode = new Node("trapez", null, null, fakeTrapez);

	var oldNode = trapez.node;
	oldNode.type = "point";
	oldNode.leftn = fakeNode;
	oldNode.rightn = rightNode;
	oldNode.info = point;

	trList[trList.length-1] = fakeTrapez;
}

function modifyTrapezoids(segm) {
	var trList = getIntersectList(segm);

	if (newPoint(segm.firstPoint)) {
		createLeftTrapez(segm.firstPoint, trList);
		createExtension(segm.firstPoint, trList[0]);
	}
	if (newPoint(segm.secondPoint)) {
		createRightTrapez(segm.secondPoint, trList);
		createExtension(segm.secondPoint, lastElem(trList));
	}
	createMiddleTrapezoids(segm, trList);

	//draw new elements
	var permanents = [{
		"shape": "liter",
		"point": segm.firstPoint
	}, {
		"shape": "point",
		"point": segm.firstPoint
	}, {
		"shape": "extension",
		"point": segm.firstPoint
	}, {
		"shape": "liter",
		"point": segm.secondPoint
	}, {
		"shape": "point",
		"point": segm.secondPoint
	}, {
		"shape": "extension",
		"point": segm.secondPoint
	}, {
		"shape": "segment",
		"colour": "DarkCyan",
		"segment": segm
	}];
	canvas.permanent_drawings.push.apply(canvas.permanent_drawings, permanents);

	redraw();
}

function init() {
	genericInit();
	canvas.segmente = [];
	canvas.points = [];
	canvas.addEventListener("click", firstClick);
	loadButton.addEventListener("click", loadSegments);
	canvas.removeEventListener("click", find);

	this.tridx = 0;
	D.init();
}

near = 10;

function getNearPoint(event) {
	var point = genericEvent(event);

	for (var idx in canvas.points) {
		if (pointDistance(canvas.points[idx], point) < near){
			return canvas.points[idx];
		}
	}
	return point;
}

function firstClick(event) {
	var punct = getNearPoint(event);
	if (!pointOk(punct)) {
		return;
	}
	canvas.removeEventListener("click", firstClick);
	canvas.firstPoint = punct;

	canvas.addEventListener("click", secondClick);
	canvas.addEventListener("mousemove", mouseMove);
}

function tooNear(point, segm) {
	var picior = piciorulPerpendicularei(point, segm);
	return between(picior, segm) && pointDistance(picior, point) < near;
}

function pointOk(verif) {
	if (verif.x <= 0 || verif.x >= canvas.width)
		return false;
	if (verif.y <= 0 || verif.y >= canvas.height)
		return false;

	for (var idx in canvas.points) {
		var point = canvas.points[idx];
		if (theSamePoint(verif, point)) {
			return true;
		}

		if (point.x == verif.x) {
			return false;
		}
	}

	for (var idx in canvas.segmente) {
		if (tooNear(verif, canvas.segmente[idx])) {
			return false;
		}
	}

	return true;
}

function segmentOk(verif) {
	if (verif.secondPoint.x == verif.firstPoint.x) {
		return false;
	}

	for (var idx in canvas.segmente) {
		var segm = canvas.segmente[idx];

		if (!theSamePoint(segm.secondPoint, verif.secondPoint) &&
			!theSamePoint(segm.secondPoint, verif.firstPoint) &&
			tooNear(segm.secondPoint, verif)) {
			return false;
		}
		if (!theSamePoint(segm.firstPoint, verif.secondPoint) &&
			!theSamePoint(segm.firstPoint, verif.firstPoint) &&
			tooNear(segm.firstPoint, verif)) {
			return false;
		}

		var int = has_intersection(verif, segm);
		if (false === int) {
			continue;
		}

		if ((theSamePoint(int, verif.secondPoint) || theSamePoint(int, verif.firstPoint)) &&
			(theSamePoint(int, segm.secondPoint) || theSamePoint(int, segm.firstPoint))) {
			continue;
		}

		return false;
	}
	return true;
}

function addPoint(point) {
	for (var idx in canvas.points) {
		if (theSamePoint(point, canvas.points[idx])) {
			return;
		}
	}

	addPointToCanvas(point);
}

function secondClick(event) {
	var punct = getNearPoint(event);
	if (!pointOk(punct)) {
		return;
	}

	var segment = getSegmentX(canvas.firstPoint, punct);
	if (!segmentOk(segment)) {
		return;
	}

	if (pointDistance(segment.firstPoint, segment.secondPoint) < near) {
		return;
	}
	canvas.firstPoint = null;

	addPoint(segment.firstPoint);
	addPoint(segment.secondPoint);

	canvas.removeEventListener("click", secondClick);
	canvas.removeEventListener("mousemove", mouseMove);
	canvas.addEventListener("click", firstClick);
	canvas.firstPoint = null;

	canvas.segmente.push(segment);
	modifyTrapezoids(segment);
}

function instantInsert(p1, p2) {
	var ev1 = {
		"clientX": p1.x,
		"clientY": p1.y
	};
	firstClick(ev1);

	var ev2 = {
		"clientX": p2.x,
		"clientY": p2.y
	};
	secondClick(ev2);
}

function loadSegments() {
	for (var idx in TrapezMap) {
		var segm =TrapezMap[idx];
		instantInsert(segm.p1, segm.p2);
	}
	loadButton.removeEventListener("click", loadSegments);
}

function mouseMove(event) {
	redraw();

	var punct = getNearPoint(event);
	if (!pointOk(punct)) {
		return;
	}

	var segm = getSegmentX(canvas.firstPoint, punct);
	if (!segmentOk(segm)) {
		return;
	}

	var drawing = {
		"shape": "segment",
		"segment": segm,
		"colour": "CadetBlue"
	};
	draw(drawing);
}

function run() {
	return true;
}

function find(event) {
	redraw();
	var point = genericEvent(event);
	if (!pointOk(point)) {
		return;
	}
	breakPoints = [];

	var where = D.search(point);
	console.log(where.info);

	var speed = speedMap[speedSelector.value];

	var idx = 0;
	function timer() {
		if (idx == breakPoints.length){
			draw({
				"shape": "trapez",
				"trapez": where.info,
				"colour": "purple"
			});
			return null;
		}
		draw(breakPoints[idx]);
		idx++;
		setTimeout(timer, speed);
	}
	timer();
}

function firstPart() {
	if (canvas.firstPoint != null) {
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
	loadButton.removeEventListener("click", loadSegments);

	canvas.addEventListener("click", find);

	breakPoints = [];
	return true;
}