tridx = 0;
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

var T = {
	push: function(tr) {
		this.array.push(tr);
	},
	init: function() {
		this.array = [];
	},
	delete: function(tr) {
		for (var idx=0; idx<this.array.len; idx++) {
			if (tr === this.array[idx]) {
				this.array.splice(idx, 1);
			}
		}
	}
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
		T.push(tr);
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

function addInner(segm, trapez) {
	var leftTrapez = new Trapez(trapez.top, trapez.bottom, trapez.leftp, segm.firstPoint);
	var topTrapez = new Trapez(trapez.top, segm, segm.firstPoint, segm.secondPoint);
	var rightTrapez = new Trapez(trapez.top, trapez.bottom, segm.secondPoint, trapez.rightp);
	var bottomTrapez = new Trapez(segm, trapez.bottom, segm.firstPoint, segm.secondPoint);

	leftTrapez.updateNeighbors(trapez.topLeft, topTrapez, trapez.bottomLeft, bottomTrapez);
	rightTrapez.updateNeighbors(topTrapez, trapez.topRight, trapez.bottom, trapez.bottomRight);
	topTrapez.updateNeighbors(leftTrapez, rightTrapez, null, null);
	bottomTrapez.updateNeighbors(null, null, leftTrapez, rightTrapez);

	var leftNode = new Node("trapez", null, null, leftTrapez);
	var rightNode = new Node("trapez", null, null, rightTrapez);
	var topNode = new Node("trapez", null, null, topTrapez);
	var bottomNode = new Node("trapez", null, null, bottomTrapez);
	var segmentNode = new Node("segment", topNode, bottomNode, segm);
	var secondNode = new Node("point", segmentNode, rightNode, segm.secondPoint);

	T.delete(trapez);
	T.push(leftTrapez);
	T.push(rightTrapez);
	T.push(topTrapez);
	T.push(bottomTrapez);

	var oldNode = trapez.node;
	oldNode.type = "point";
	oldNode.leftn = leftNode;
	oldNode.rightn = secondNode;
	oldNode.info = segm.firstPoint;
	segm.firstPoint.node = oldNode;
}

function addDiag(segm, trapez) {
	var topTrapez = new Trapez(trapez.top, segm, trapez.leftp, trapez.rightp);
	var bottomTrapez = new Trapez(segm, trapez.bottom, trapez.leftp, trapez.rightp);

	topTrapez.updateNeighbors(trapez.topLeft, trapez.topRight, null, null);
	bottomTrapez.updateNeighbors(null, null, trapez.bottomLeft, trapez.bottomRight);

	var topNode = new Node("trapez", null, null, topTrapez);
	var bottomNode = new Node("trapez", null, null, bottomTrapez);

	var oldNode = trapez.node;
	oldNode.type = "segment";
	oldNode.leftn = topNode;
	oldNode.rightn = bottomNode;
	oldNode.info = segm;
	segm.node = oldNode;
}

function addSemiDiagLeft(segm, trapez) {
	var topTrapez = new Trapez(trapez.top, segm, segm.firstPoint, segm.secondPoint);
	var bottomTrapez = new Trapez(segm, trapez.bottom, segm.firstPoint, segm.secondPoint);
	var leftTrapez = new Trapez(trapez.top, trapez.bottom, trapez.leftp, segm.firstPoint);

	topTrapez.updateNeighbors(leftTrapez, trapez.topRight, null, null);
	bottomTrapez.updateNeighbors(null, null, leftTrapez, trapez.bottomRight);
	leftTrapez.updateNeighbors(trapez.topLeft, topTrapez, trapez.bottomLeft, bottomTrapez);

	var topNode = new Node("trapez", null, null, topTrapez);
	var bottomNode = new Node("trapez", null, null, bottomTrapez);
	var leftNode = new Node("trapez", null, null, leftTrapez);
	var segmentNode = new Node("segment", topNode, bottomNode, segm);

	var oldNode = trapez.node;
	oldNode.type = "point";
	oldNode.leftn = leftNode;
	oldNode.rightn = segmentNode;
	oldNode.info = segm.firstPoint;
	segm.firstPoint.node = oldNode;
}

function addSemiDiagRight(segm, trapez) {
	var topTrapez = new Trapez(trapez.top, segm, segm.firstPoint, segm.secondPoint);
	var bottomTrapez = new Trapez(segm, trapez.bottom, segm.firstPoint, segm.secondPoint);
	var rightTrapez = new Trapez(trapez.top, trapez.bottom, segm.secondPoint, trapez.rightp);

	topTrapez.updateNeighbors(trapez.topLeft, rightTrapez, null, null);
	bottomTrapez.updateNeighbors(null, null, trapez.bottomLeft, rightTrapez);
	rightTrapez.updateNeighbors(topTrapez, trapez.topRight, bottomTrapez, trapez.bottomRight);

	var topNode = new Node("trapez", null, null, topTrapez);
	var bottomNode = new Node("trapez", null, null, bottomTrapez);
	var rightNode = new Node("trapez", null, null, rightTrapez);
	var segmentNode = new Node("segment", topNode, bottomNode, segm);

	var oldNode = trapez.node;
	oldNode.type = "point";
	oldNode.leftn = segmentNode;
	oldNode.rightn = rightNode;
	oldNode.info = segm.secondPoint;
	segm.firstPoint.node = oldNode;
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

function addTrapez(segm, trapez, nodes, where) {
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

function addMultiDiag(segm, trList) {
	var bottomNodes = [];
	var topNodes = [];

	for (var idx in trList) {
		var trapez = trList[idx];
		var newInt = intersection(getSweepX(trapez.rightp.x), segm);

		if (nextTrapez(segm, trapez) == trapez.topRight) {
			trapez.rightp.upper = newInt;
			trapez.type = "bottom";
			addTrapez(segm, trapez, bottomNodes, "bottom");
			continue;
		}
		if (nextTrapez(segm, trapez) == trapez.bottomRight) {
			trapez.rightp.lower = newInt;
			trapez.type = "top";
			addTrapez(segm, trapez, topNodes, "top");
			continue;
		}

		//last one
		addTrapez(segm, trapez, bottomNodes, "bottom");
		addTrapez(segm, trapez, topNodes, "top");
	}

	var lastOne = "";
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

			if (lastOne != "bottom") {
				lastOne = "bottom";
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

			if (lastOne != "top") {
				lastOne = "top";
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

function modifyTrapezoids(segm, trList) {
	if (trList.length == 1) {
		if (newPoint(segm.firstPoint) && newPoint(segm.secondPoint)){
			addInner(segm, trList[0]);
			return;
		}
		if (newPoint(segm.firstPoint)) {
			addSemiDiagLeft(segm, trList[0]);
			return;
		}
		if (newPoint(segm.secondPoint)) {
			addSemiDiagRight(segm, trList[0]);
			return;
		}
		addDiag(segm, trList[0]);
		return;
	}
	if (!newPoint(segm.firstPoint) && !newPoint(segm.secondPoint)) {
		addMultiDiag(segm, trList);
		return;
	}
	console.log("TODO");
}

function addSegment(segm) {
	canvas.segmente.push(segm);

	var trList = getIntersectList(segm);
	modifyTrapezoids(segm, trList);

	createExtension(segm.firstPoint, trList[0]);
	createExtension(segm.secondPoint, lastElem(trList));

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

	T.init();
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

	addSegment(segment);
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

	var where = D.search(point);
	console.log(where.info);

	if (where.type == "trapez") {
		draw({
			"shape": "trapez",
			"trapez": where.info,
			"colour": "purple"
		});
	}
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

	breakPointsIdx = 0;
	return true;
}