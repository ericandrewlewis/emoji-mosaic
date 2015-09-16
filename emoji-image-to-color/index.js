var fs = require('fs'),
	PNG = require('pngjs').PNG,
	Octree = require('./octree-d3-fork'),
	mapping = [];

var x = 0;
/**
 * Given an image file, find the most prevalent color in it and write to the color map.
 *
 * @param  {[type]} filepath [description]
 * @return {[type]}          [description]
 */
function readImageFile( filepath ) {
	var filepathIndexForArray = parseInt( filepath.replace(/^.*[\\\/]/, '') ) - 1;
	fs.createReadStream(filepath)
		.pipe(new PNG({
			filterType: 4
		}))
		.on('parsed', function() {
			var color = getMostPrevalentColor( this.data, this.width, this.height );
			mapping[filepathIndexForArray] = color;
			console.log(mapping);
			var mappingThing = "var mapping = ['" + mapping.join("', '") + "'];";
			fs.writeFile("asdf", mappingThing, function(err) {
				if(err) {
					return console.log(err);
				}
			});
		});
}

/*
 * For all the emoji images in a folder, read each image fine.
 */
fs.readdir('emoji-images', function(err, files) {
	files.forEach( function(file) {
		// Bail on filetype because there's some extra crap in there.
		if ( file.indexOf('png') < 0 ) {
			return;
		}
		readImageFile( 'emoji-images/' + file );
	} );
});
/**
 * Given pixel color data, finds the most prevalent color.
 *
 * @param  {[type]} data   [description]
 * @param  {[type]} width  [description]
 * @param  {[type]} height [description]
 * @return {[type]}        [description]
 */
function getMostPrevalentColor(data, width, height) {
	allPixels = [];
	// Iterate over every pixel in the image
	var y;
	var x;
	for ( y=0; y < height; y+=4 ) {
		for ( x=0; x < width; x+=4 ) {
			var index = (width * y + x) << 2;
			// Skip the pixel if the opacity is below a threshold.
			if ( data[index+3] < 127 ) {
				continue;
			}
			allPixels.push( {x:data[index], y:data[index+1], z:data[index+2]} );
		}
	}
	var tree = Octree(allPixels);
	var minClosePoints = .35 * allPixels.length;
	var wellSaturated = null;
	var averageColor = [0,0,0];
	var visited = 0;
	tree.visit(function(node) {
		visited++;
		var maxDist = 30;
		if ( ! node.point ) {
			return;
		}
		var nx1 = node.x - maxDist,
			nx2 = node.x + maxDist,
			ny1 = node.y - maxDist,
			ny2 = node.y + maxDist,
			nz1 = node.z - maxDist,
			nz2 = node.z + maxDist,
			closePoints = 0,
			visitedSelf = false;
		averageColor[0] = ( averageColor[0] * ( visited - 1 ) + node.x ) / visited;
		averageColor[1] = ( averageColor[1] * ( visited - 1 ) + node.y ) / visited;
		averageColor[2] = ( averageColor[2] * ( visited - 1 ) + node.z ) / visited;
		// Find the number of points less than maxDist distance away
		tree.visit(function(quad, x1, y1, z1, x2, y2, z2) {
			if (quad.point) {
				var x = node.x - quad.point.x,
					y = node.y - quad.point.y,
					z = node.z - quad.point.z,
				distanceBetweenPoints = Math.sqrt(x * x + y * y  + z * z);
				if (distanceBetweenPoints <= maxDist) {
					closePoints++;
				}
			}
			return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1 || z1 > nz2 || z2 < nz1;
		});

		if ( closePoints > minClosePoints && ! wellSaturated ) {
			wellSaturated = true;
		}
	});
	if ( wellSaturated ) {
		return rgbToHex( parseInt( averageColor[0] ), parseInt( averageColor[1] ), parseInt( averageColor[2] ) );
	} else {
		return false;
	}
}

function componentToHex(c) {
	var hex = c.toString(16);
	return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
	return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}