Octree = require('./octree-d3-fork');
data = [];
// for ( i = 0; i <= 10; i++ ) {
// 	for ( j = 0; j <= 10; j++ ) {
// 		for ( k = 0; k <= 10; k++ ) {
// 		data.push( {x: i,y: j, z: k } );
// 		}
// 	}
// }
data = [ {x:1,y:1,z:1}, {x:3,y:3,z:3}, {x:1,y:1,z:1} ];
var x = Octree(data);
// Visit each node
x.visit(function(node) {
	var maxDist = 2;
	console.log(node);
	if ( ! node.point ) {
		return;
	}
	var nx1 = node.x - maxDist,
		nx2 = node.x + maxDist,
		ny1 = node.y - maxDist,
		ny2 = node.y + maxDist,
		nz1 = node.z - maxDist,
		nz2 = node.z + maxDist,
		closePoints = 0;
	// Find the number of points less than maxDist distance away
	x.visit(function(quad, x1, y1, z1, x2, y2, z2) {
		if (quad.point && (quad.point !== node.point)) {
			var x = node.x - quad.point.x,
				y = node.y - quad.point.y,
				z = node.z - quad.point.z,
			distanceBetweenPoints = Math.sqrt(x * x + y * y  + z * z);
			if (distanceBetweenPoints <= maxDist) {
				closePoints++;
			} else {
				// debugger;
			}
		}
		return;
		// return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1 || z1 > nz2 || z2 < nz1;
	});
	console.log(closePoints);
});