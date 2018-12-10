function nextChar(c) {
    return String.fromCharCode(c.charCodeAt(0) + 1);
}

function leftmostDot(dotList) {
	if (dotList.length == 0) 
		return null;

	var leftmost = dotList[0];
	for (idx in dotList) {
		dot = dotList[idx];
		if (dot.x == "undefined"){
			console.log("leftDot function must get list of correct dots");
			return null;
		}
		if (dot.x < leftmost.x){
			leftmost = dot;
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

function drawDot(ctx, dot, colour="black") {
	ctx.beginPath();		
	ctx.arc(dot.x, dot.y, 4, 0, 2 * Math.PI);		// un punct este de fapt un cerc plin
	ctx.fillStyle = colour;
	ctx.fill();
	ctx.closePath();
}

function drawLiter(ctx, dot, colour="black") {
	ctx.beginPath();
	ctx.font = "15px Arial";
	ctx.fillStyle = colour;
    ctx.fillText(dot.litera, dot.x-10, dot.y-10);
	ctx.closePath();
}

function drawLine(ctx, dot1, dot2, colour="black") {
	ctx.beginPath();  
	ctx.lineWidth = 3;
    ctx.strokeStyle=colour;
	ctx.moveTo(dot1.x, dot1.y);
	ctx.lineTo(dot2.x, dot2.y);
	ctx.lineWidth = 3;
	ctx.stroke();	
	ctx.closePath();
}

function draw(drawing) {
	switch (drawing.shape) {
	case "line": {
		drawLine(ctx, drawing.dot1, drawing.dot2, drawing.colour);
		break;
	}
	case "dot": {
		drawDot(ctx, drawing.dot, drawing.colour);
		break;
	}
	case "liter": {
		drawLiter(ctx, drawing.dot, drawing.colour);
		break;
	}
	default: {
		console.log("wrong shape");
	}
	}

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

function compareDotsY(p1, p2) {
	if (p1.y < p2.y) return -1;
	if (p1.y > p2.y) return 1;
	if (p1.x < p2.x) return -1;
	if (p1.x > p2.x) return 1;
	return 0;
}

function compareLinesY(l1, l2) {
	var compSup = compareDotsY(l1.dot1, l2.dot1);
	if (compSup != 0) {
		return compSup;
	}
	return compareDotsY(l1.dot2, l2.dot2);
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
	var dr1 = ecuatia_dreptei(seg1.dot1, seg1.dot2);
	var dr2 = ecuatia_dreptei(seg2.dot1, seg2.dot2);
	var matrice = [[dr1.x_coef, dr1.y_coef],
				   [dr2.x_coef, dr2.y_coef]];
	var deltha = determinant2(matrice);

	if (deltha == 0)
		return false;

	matrice = [[-dr1.termen_liber, dr1.y_coef],
			   [-dr2.termen_liber, dr2.y_coef]];
	var x = determinant2(matrice) / deltha;

	matrice = [[-dr1.termen_liber, dr1.x_coef],
			   [-dr2.termen_liber, dr2.x_coef]]
	var y = - determinant2(matrice) / deltha;

	return {
		"x": x,
		"y": y
	}
}

function has_intersection(seg1, seg2) {
	var int = intersection(seg1, seg2);

	if (false === int)
		return false;

	function between(P1, P2, verif) {
		if (P1.x <= verif.x && verif.x <= P2.x)
			return true;
		if (P2.x <= verif.x && verif.x <= P1.x)
			return true;
		return false;
	}

	if (between(seg1.dot1, seg1.dot2, int) && between(seg2.dot1, seg2.dot2, int)) {
		return int;
	}

	return false;
}
