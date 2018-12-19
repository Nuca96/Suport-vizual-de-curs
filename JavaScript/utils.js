function nextChar(c) {
    return String.fromCharCode(c.charCodeAt(0) + 1);
}

function leftmostPoint(pointList) {
	if (pointList.length == 0) 
		return null;

	var leftmost = pointList[0];
	for (idx in pointList) {
		point = pointList[idx];
		if (point.x == "undefined"){
			console.log("leftPoint function must get list of correct points");
			return null;
		}
		if (point.x < leftmost.x){
			leftmost = point;
		}
	}

	return leftmost;
}

function random(min, max) {
	if (min > max)
		return null;
	var nr = Math.random();
	nr = nr * (max - min) + min;
	return nr;
}

function determinant3(matrice) {
	if (matrice.length != 3){
		console.log("cannot calculate delta");
		return null;
	}
	var l0 = matrice[0];
	var l1 = matrice[1];
	var l2 = matrice[2];

	if (l0.length != 3 || l1.length != 3 || l2.length != 3){
		console.log("cannot calculate delta");
		return null;
	}

	return l0[0]*l1[1]*l2[2] + l0[1]*l1[2]*l2[0] + l0[2]*l1[0]*l2[1] -
		l0[2]*l1[1]*l2[0] - l0[1]*l1[0]*l2[2] - l0[0]*l1[2]*l2[1];
}

function determinant2(matrice) {
	if (matrice.length != 2){
		console.log("cannot calculate delta");
		return null;
	}
	var l0 = matrice[0];
	var l1 = matrice[1];

	if (l0.length != 2 || l1.length != 2){
		console.log("cannot calculate delta");
		return null;		
	}

	return l0[0]*l1[1] - l0[1]*l1[0];
}

function orientation(p1, p2, p3) {
	var D = determinant3([[1, 1, 1], [p1.x, p2.x, p3.x], [p1.y, p2.y, p3.y]]);

	if (D == 0) 
		return "fata";
	// invers fata de sistemul de coordonate xOy
	// in canvas, "cresterea" coordonatei y este de sus in jos
	if (D > 0) 
		return "dreapta";
	if (D < 0)
		return "stanga";
}

function drawPoint(ctx, point, colour, size) {
	ctx.beginPath();		
	ctx.arc(point.x, point.y, size, 0, 2 * Math.PI);		// un punct este de fapt un cerc plin
	ctx.fillStyle = colour;
	ctx.fill();
	ctx.closePath();
}

function drawLiter(ctx, point, colour) {
	ctx.beginPath();
	ctx.font = "15px Arial";
	ctx.fillStyle = colour;
    ctx.fillText(point.litera, point.x-10, point.y-10);
	ctx.closePath();
}

function drawLine(ctx, segment, colour, width) {
	ctx.beginPath();
	ctx.moveTo(segment.upperPoint.x, segment.upperPoint.y);
	ctx.lineTo(segment.lowerPoint.x, segment.lowerPoint.y);
	ctx.lineWidth = width;
    ctx.strokeStyle = colour;
	ctx.stroke();	
	ctx.closePath();
}

function sort(list, compare) {
	var len = list.length;
	if (len < 2) {
		return list;
	}
	var st = list.slice(0, len/2);
	var dr = list.slice(len/2, len);

	var sort_st = sort(st, compare);
	var sort_dr = sort(dr, compare);

	var sorted = [];
	var idx_st = 0, idx_dr = 0;
	while (idx_st < sort_st.length && idx_dr < sort_dr.length) {
		if (compare(sort_st[idx_st], sort_dr[idx_dr]) > 0) {
			sorted.push(sort_dr[idx_dr]);
			idx_dr++;
		} else {
			sorted.push(sort_st[idx_st]);
			idx_st++;
		}
	}
	sorted.push.apply(sorted, sort_st.slice(idx_st, sort_st.length));
	sorted.push.apply(sorted, sort_dr.slice(idx_dr, sort_dr.length));

	return sorted;
}

function comparePointsY(p1, p2) {
	if (p1.y < p2.y) return -1;
	if (p1.y > p2.y) return 1;
	if (p1.x < p2.x) return -1;
	if (p1.x > p2.x) return 1;
	return 0;
}

function compareSegmentsY(s1, s2) {
	var compSup = comparePointsY(s1.upperPoint, s2.upperPoint);
	if (compSup != 0) {
		return compSup;
	}
	return comparePointsY(s1.lowerPoint, s2.lowerPoint);
}

function comparePointsX(p1, p2) {
	if (p1.x < p2.x) return -1;
	if (p1.x > p2.x) return 1;
	if (p1.y < p2.y) return -1;
	if (p1.y > p2.y) return 1;
	return 0;
}

function compareSegmentsX(s1, s2) {
	var compSup = comparePointsX(s1.upperPoint, s2.upperPoint);
	if (compSup != 0) {
		return compSup;
	}
	return comparePointsX(s1.lowerPoint, s2.lowerPoint);
}

function ecuatia_dreptei(A, B) {
	// x * x_coef + y * y_coef = termen_liber
	return {
		"x_coef": A.y - B.y,
		"y_coef": B.x - A.x,
		"termen_liber": A.x*B.y - B.x*A.y
	}
}

function intersection(seg1, seg2) {
	var dr1 = ecuatia_dreptei(seg1.upperPoint, seg1.lowerPoint);
	var dr2 = ecuatia_dreptei(seg2.upperPoint, seg2.lowerPoint);
	var matrice = [[dr1.x_coef, dr1.y_coef],
				   [dr2.x_coef, dr2.y_coef]];
	var delta = determinant2(matrice);

	if (delta == 0)
		return false;

	matrice = [[-dr1.termen_liber, dr1.y_coef],
			   [-dr2.termen_liber, dr2.y_coef]];
	var x = determinant2(matrice) / delta;

	matrice = [[-dr1.termen_liber, dr1.x_coef],
			   [-dr2.termen_liber, dr2.x_coef]]
	var y = - determinant2(matrice) / delta;

	return {
		"x": Math.floor(x),
		"y": Math.floor(y)
	}
}

function has_intersection(seg1, seg2) {
	var int = intersection(seg1, seg2);

	if (false === int)
		return false;

	function between(seg, point) {
		// punctul este mai decat altul daca are y mai mic
		return seg.upperPoint.y <= point.y && point.y <= seg.lowerPoint.y;
	}

	if (between(seg1, int) && between(seg2, int)) {
		return int;
	}

	return false;
}

function get_segment(point1, point2) {
	var upperPoint, lowerPoint;

	if (comparePointsY(point1, point2) <= 0) {
		upperPoint = point1;
		lowerPoint = point2;
	} else {
		upperPoint = point2;
		lowerPoint = point1;
	}

	return {
		"upperPoint": upperPoint,
		"lowerPoint": lowerPoint
	}
}
