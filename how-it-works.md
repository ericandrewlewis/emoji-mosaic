## How it works

Having emoji in the format of a set of images is assumed. This makes a few processes easier.
When extracting the most saturated color from an emoji, images are easier to handle
than characters of a system's font. Using the system font seems like a
native and less hacky solution. However, there is no easy way to place a character
from a system font (at least in Node) on a canvas. Presumably like [Node Canvas](https://github.com/Automattic/node-canvas)
makes sense, but installation is non-trivial. Could you read the raw TTF file for
information? Maybe.

The image file is a standard object to toss around that has been used over and over,
so rather than reading data from an unfamiliar filetype like ttf, let's use the image file.

### Extract color values from emoji

[This script](/emoji-image-to-color/index.js) reads all the emoji images and finds
the most prevalent color in each.

For some reason pngjs doesn't support a bit depth of 16, so you have to comment out
that check and it will work.

Color can be represented using various [color models](https://en.wikipedia.org/wiki/Color_model)
including RGB, CMYK, HSL, and HSV.

[RGB](https://en.wikipedia.org/wiki/RGB_color_model) is a useful model to use for
our purposes. It is a 3-dimensional model which will make plotting pixel color data
extracted from an image and figuring out what's the most prevalent color easy.
This is also the output of [the canvas API](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/getImageData)
which we'll use to extract color data from the source image to be converted.

