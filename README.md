# Emoji Mosaic

Turn an image into a mosaic made of emojis.

[Live site](http://ericandrewlewis.github.io/emoji-mosaic/)

## How it works

Having emoji as a set of images is assumed. Apple has a very liberal stance on
how their Apple Emoji font can be used (see [Peter Edberg's note regarding this](https://groups.google.com/forum/#!topic/emoji4unicode-fontdesign/eqY3_p_ET8E)).

### Extract color values from emoji

[This script](/emoji-image-to-color/index.js) reads all the emoji images and finds
the most prevalent color in each.

Color can be represented using various [color models](https://en.wikipedia.org/wiki/Color_model)
including RGB, CMYK, HSL, and HSV.

[RGB](https://en.wikipedia.org/wiki/RGB_color_model) is a useful model to use for
our purposes. It is a 3-dimensional model which will make plotting pixel color data
extracted from an image and figuring out what's the most prevalent color easy.
This is also the output of [the canvas API](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/getImageData)
which we'll use to extract color data from the source image to be converted.


## Figure out the average color value of each Emoji?

What is the source for the Emoji character? Using the actual system character seems exceedingly hard — I don't think I got [node-canvas](https://github.com/Automattic/node-canvas) installed correctly, and even so I don't believe it would render the Apple Emoji system font.

Maybe extract emoji characters from another library? [Gemoji did it](https://github.com/github/gemoji/tree/master/images/emoji/unicode) [The Apple ttf library might be unlicensed](http://stackoverflow.com/questions/22337295/license-of-apple-color-emoji-ttf/22949517#22949517)?

Get a package to [read pngs](https://github.com/niegowski/node-pngjs) and make a lookup table?

Use a prebaked lookup table [like in emojicam](https://github.com/AlexWiles/emojicam/blob/master/emojicam/emoji-colors-jpg.js)?

## How to layout the emoji?

The Emoji should be tightly packed, laid on top of each other, and skewed angle to give it an organic vibe. To get an organic layout (rather than a grid layout) [Poisson-Disc sampling is cool](http://bl.ocks.org/mbostock/dbb02448b0f93e4c82c3), here's a [great example](http://bl.ocks.org/mbostock/19168c663618b7f07158).
