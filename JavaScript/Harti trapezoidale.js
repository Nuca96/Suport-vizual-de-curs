function Trapez(top, bottom, leftp, rightp) {
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
	this.topLeft = topLeft;
	this.topRight = topRight;
	this.bottomLeft = bottomLeft;
	this.bottomRight = bottomRight;
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
		var leftp = {x: 0, y:0};
		var rightp = {x:canvas.width, y:canvas.height};
		var top = getSegmentX(leftp, {x:canvas.width, y:0});
		var bottom = getSegmentX({x:0, y:canvas.height}, rightp);
		var tr = new Trapez(top, bottom, leftp, rightp);
		var nod = new Node("trapez", null, null, tr);
		this.root = nod;
	},
	search: function(point) {
		return this.root.search(point);
	}
};

function createExtension(point, trapez) {
	if (typeof point.lower != "undefined") {
		return;
	}

	var sweep = getSweepX(point.x);
	point.upper = intersection(sweep, trapez.top);
	point.lower = intersection(sweep, trapez.bottom);
}

function addInner(segm, trapez) {
	var leftTrapez = new Trapez(trapez.top, trapez.bottom, trapez.leftp, segm.firstPoint);
	var rightTrapez = new Trapez(trapez.top, trapez.bottom, segm.seconsPoint, trapez.rightp);
	var topTrapez = new Trapez(trapez.top, segm, segm.firstPoint, segm.secondPoint);
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
	var secondNode = new Node("point", segmentNode, leftNode, segm.secondPoint);

	T.delete(trapez);
	var oldNode = trapez.node;
	oldNode.type = "point";
	oldNode.leftn = leftNode;
	oldNode.rightn = secondNode;
	oldNode.info = segm.firstPoint;
	segm.firstPoint.node = oldNode;
}

function addSegment(segm) {
	canvas.segmente.push(segm);

	var node = D.search(segm.firstPoint);

	createExtension(segm.firstPoint, node.info);
	createExtension(segm.secondPoint, node.info);
	if (node == D.search(segm.secondPoint)) {
		addInner(segm, node.info);
	}

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

	// draw({
	// 	"shape": "polygon",
	// 	"points":[segm.firstPoint, segm.secondPoint, T0.info.rightp],
	// 	"colour": "yellow"
	// });
}

function init() {
	genericInit();
	canvas.segmente = [];
	canvas.points = [];
	canvas.addEventListener("click", firstClick);
	loadButton.addEventListener("click", loadSegments);

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

		if ((theSamePoint(int, verif.secondPoint) ||	theSamePoint(int, verif.firstPoint)) &&
			(theSamePoint(int, segm.secondPoint) || theSamePoint(int, segm.firstPoint))) {
			return true;
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

	breakPointsIdx = 0;
	return true;
}