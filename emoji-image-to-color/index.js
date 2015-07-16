var fs = require('fs'),
	PNG = require('pngjs').PNG,
	Octree = require('./octree');

// var tree = new Octree( {x: 0,y:0,z:0}, {x: 100,y:100,z:100} );
// tree.add({x: 1, y: 1,z: 1});
// tree.add({x: 20, y: 20,z: 20});
// tree.add({x: 40, y: 40,z: 40});
// tree.add({x: 60, y: 60,z: 60});
// console.log( tree.find({x: 41, y: 41,z: 41}) );
// return;
fs.createReadStream('emoji-images/0001.png')
	.pipe(new PNG({
		filterType: 4
	}))
	.on('parsed', function() {
		var tree = new Octree( {x:0,y:0,z:0}, {x:1,y:1,z:1} );
		// Iterate over every pixel in the image
		for (var y = 0; y < this.height; y++) {
			for (var x = 0; x < this.width; x++) {
				var index = (this.width * y + x) << 2;
				// Skip the pixel if the opacity is below a threshold.
				if ( this.data[index+3] < 127 ) {
					continue;
				}
				// HSL is a more usable thing to figure out
				var hsl = rgbToHsl( this.data[index], this.data[index+1], this.data[index+2] );

				// saturation is a number that pushes out the point from the center.
				hueAngle = hsl[0] * 360;

				var multiplyY = 1, multiplyX = 1;
				if ( hueAngle > 270 ) {
					hueAngle -= 270;
					multiplyY = -1;
				}
				if ( hueAngle > 180 ) {
					hueAngle -= 90;
					multiplyY = -1;
				}
				if ( hueAngle > 90 ) {
					hueAngle -= 90;
					multiplyX = -1;
				}
				var radians = hueAngle * Math.PI / 180;
				// Calculate the X Y position of the points, given the
				// length of the hypotenuse (saturation) and the angle of the triangle (hue).
				// sin() = opp / hyp, therefore sin() * hyp = opp
				yoffset = ( Math.sin(radians) * ( hsl[1] / 2 ) * multiplyY ) + .5;
				// tan() = opp / adj, therefore adj / tan() = opp
				xoffset = ( ( (yoffset - .5) / Math.tan(radians) ) * multiplyX ) + .5;

				// Toss it into an octree structure we can go through later
				tree.add( {x:xoffset, y:yoffset, z: hsl[2]} );
		// 		// invert color
		// 		this.data[idx] = 255 - this.data[idx];
		// 		this.data[idx+1] = 255 - this.data[idx+1];
		// 		this.data[idx+2] = 255 - this.data[idx+2];

		// 		// and reduce opacity
		// 		this.data[idx+3] = this.data[idx+3] >> 1;
			}
		}
		console.log( tree.find({x:.4, y:.5,z:.6}) );
		processPixelColorData();
		// this.pack().pipe(fs.createWriteStream('out.png'));
	});

function processPixelColorData() {
	// now that we have all the pixels in some data structure,
	// traverse it finding the most saturated part.
	//
}

/**
 * Converts an RGB color value to HSL. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
 * Assumes r, g, and b are contained in the set [0, 255] and
 * returns h, s, and l in the set [0, 1].
 *
 * @param   Number  r       The red color value
 * @param   Number  g       The green color value
 * @param   Number  b       The blue color value
 * @return  Array           The HSL representation
 */
function rgbToHsl(r, g, b){
    r /= 255, g /= 255, b /= 255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var h, s, l = (max + min) / 2;

    if(max == min){
        h = s = 0; // achromatic
    }else{
        var d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch(max){
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    return [h, s, l];
}