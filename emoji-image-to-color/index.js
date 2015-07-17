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
		var tree = new Octree( {x:0,y:0,z:0}, {x:255,y:255,z:255} );
		// Iterate over every pixel in the image
		for (var y = 0; y < this.height; y++) {
			for (var x = 0; x < this.width; x++) {
				var index = (this.width * y + x) << 2;
				// Skip the pixel if the opacity is below a threshold.
				if ( this.data[index+3] < 127 ) {
					continue;
				}

				tree.add( {x:this.data[index], y:this.data[index+1], z: this.data[index+2]} );
			}
		}
		console.log( tree.root.points.length );
		// exit;
		var x = 0;
		tree.visit(function() {
			console.log( arguments[0] );
			return true;
			x++;
			console.log(x);
			tree.visit(function(){
				return true;
			});
		});
		console.log( this.height, this.width );

		console.log( tree.find({x:124, y:5,z:6}) );
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