## How it works

Emoji mosaic can be broken into two pieces: extract the most prevalent color in an
emoji into a usable data structure, and the front-end experience that users interact with
which uses the look-up table.

## Emoji as images

Having emoji in the format of a set of images is assumed. This makes a few processes easier.
Extracting color content from an image is easier than parsing a TrueType font (`.ttf`),
and placing characters of a TrueType font onto an HTML canvas would only work on OSX.

Web developers have used images as a basic data format for ages, so there's plenty
of experience and ease-of-use here.

## Extracting prevalent colors from emoji

When extracting the most saturated color from an emoji, images are easier to
than characters of a system's font. Using the system font seems like a
native and less hacky solution. However, there is no easy way to place a character
from a system font (at least in Node) on a canvas. Presumably like [Node Canvas](https://github.com/Automattic/node-canvas)
makes sense, but installation is non-trivial. Could you read the raw TTF file for
information? Maybe, but sounds intense.

[A script](/emoji-image-to-color/index.js) reads all the emoji images and finds
the most prevalent color in each image.

[`pngjs`](https://github.com/niegowski/node-pngjs) extracts pixel color data from
an image file. For some reason pngjs doesn't support a bit depth of 16, but if you
comment out that check it works fine.

Color can be represented using various [color models](https://en.wikipedia.org/wiki/Color_model)
including [RGB](https://en.wikipedia.org/wiki/RGB_color_model), [HSL, and HSV](https://en.wikipedia.org/wiki/HSL_and_HSV).

[RGB](https://en.wikipedia.org/wiki/RGB_color_model) is a useful model to use for
our purposes.

[HSL and HSV](https://en.wikipedia.org/wiki/HSL_and_HSV) are optimized for a human's
understanding of color. The concept of picking a hue (i.e. color) and then saturating
the color and making the color lighter or darker are familiar ideas. However,
the data structure of these two color models creates a cylindrical 3-d shape.

The task at hand is to plot the pixel color makeup of an image into a format that is
easy to traverse and find neighbor density, in the end to find the most prevalent
color in an image.

RGB is a 3-dimensional model which makes plotting pixel color makeup of an image
and finding the most prevalent color easy.

A 3-dimensional data layout is a great format to traverse data with speed.
The [Quadtree](https://en.wikipedia.org/wiki/Quadtree) is an age-old data structure
(literally first written about in 1974) for traversing 2-dimensional data.
Points plotted in 2-dimensional space are split into recursive four-part regions.
This is helpful when doing large computational tasks on a dataset because you can
ignore "visiting" data points based on generalized spacial relations.

E.g. [this example](http://bl.ocks.org/patricksurry/6478178) given hundreds of x,y
data points the user can pick a point and finds the next closets point.
With a brute force approach, we would test every other point for closeness to the
selected point. With a quadtree, only a few points need to be tested for distance.
Whole branches (including many child data points) can be compared with distance
comparisons, which makes our searches more performant.

Bostock's collision detection http://bl.ocks.org/mbostock/3231298

The [Octree](https://en.wikipedia.org/wiki/Octree) is an extension of the quadtree
but for three-dimensional space.

e.g. https://web.archive.org/web/20150220005814/http://pawlowski.it/octtree/

This is also the output of [the canvas API](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/getImageData)
which we'll use to extract color data from the source image to be converted.









