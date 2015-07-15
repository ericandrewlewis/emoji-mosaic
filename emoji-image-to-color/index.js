var fs = require('fs'),
	PNG = require('pngjs').PNG;

fs.createReadStream('emoji-images/0001.png')
	.pipe(new PNG({
		filterType: 4
	}))
	.on('parsed', function() {

		for (var y = 0; y < this.height; y++) {
			for (var x = 0; x < this.width; x++) {
				// For every pixel, toss it into a data structure
				// we can go through later
				// Convert rgb to hsl
				var idx = (this.width * y + x) << 2;
				console.log( this.data[idx+3] );
		// 		// invert color
		// 		this.data[idx] = 255 - this.data[idx];
		// 		this.data[idx+1] = 255 - this.data[idx+1];
		// 		this.data[idx+2] = 255 - this.data[idx+2];

		// 		// and reduce opacity
		// 		this.data[idx+3] = this.data[idx+3] >> 1;
			}
		}
		processPixelColorData();
		// this.pack().pipe(fs.createWriteStream('out.png'));
	});

function processPixelColorData() {
	// now that we have all the pixels in some data structure,
	// traverse it finding the most saturated part.
	//
}