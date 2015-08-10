/**
 * An octree.
 *
 * @constructor
 *
 * @param {Object} position Position of the octree corner.
 * @param {Integer} position.x
 * @param {Integer} position.y
 * @param {Integer} position.z
 * @param {[type]} size     Physical size of the octree.
 * @param {[type]} size.x
 * @param {[type]} size.y
 * @param {[type]} size.z
 * @param {[type]} accuracy [description]
 */
function Octree(position, size, accuracy) {
  this.maxDistance = Math.max(size.x, Math.max(size.y, size.z));
  this.accuracy = 0;
  this.root = new Octree.Cell(this, position, size, 0);
}

Octree.fromBoundingBox = function (bbox) {
  return new Octree(bbox.min.clone(), bbox.getSize().clone());
};

Octree.MaxLevel = 20;

/**
 * Add a point to the Octree.
 *
 * @param {Object} p    Point
 * @param {Integer} p.x
 * @param {Integer} p.y
 * @param {Integer} p.z
 * @param {[type]} data [description]
 */
Octree.prototype.add = function (p, data) {
  this.root.add(p, data);
};

//check if the point was already added to the octreee
Octree.prototype.has = function (p) {
  return this.root.has(p);
};

/**
 * Find the nearest point in the octree given a set of points.
 *
 * @param  {object} p                   The point.
 * @param  {object} options             Options hash.
 * @param  {object} options.includeData Return both point and it's data, defaults to false
 * @param  {object} options.maxDist     Don't include points further than maxDist, defaults to Inifinity
 * @param  {object} options.notSelf     Return point only if different than submited point, defaults to false
 * @return {object} Closest point.
 */
Octree.prototype.find = function (p, options) {
  options = options || {};
  options.includeData = options.includeData ? options.includeData : false;
  options.bestDist = options.maxDist ? options.maxDist : Infinity;
  options.notSelf = options.notSelf ? options.notSelf : false;

  var result = this.root.find(p, options);
  if (result) {
    if (options.includeData) return result;
    else return result.point;
  }
  else return null;
};

Octree.prototype.visit = function(func) {
	this.root.visit(func);
}

/**
 * An octree cell.
 *
 * @constructor
 *
 * @param {Octree} tree     The root octree object the cell exists under.
 * @param {[type]} position [description]
 * @param {[type]} size     [description]
 * @param {[type]} level    [description]
 */
Octree.Cell = function (tree, position, size, level) {
  this.tree = tree;
  this.position = position;
  this.size = size;
  this.level = level;
  this.points = [];
  this.data = [];
  this.children = [];
};

/**
 * Whether a cell "has" a point
 *
 * @param  {[type]}  p [description]
 * @return {Boolean}   [description]
 */
Octree.Cell.prototype.has = function (p) {
  if (!this.contains(p))
    return null;
  if (this.children.length > 0) {
    for (var i = 0; i < this.children.length; i++) {
      var duplicate = this.children[i].has(p);
      if (duplicate) {
        return duplicate;
      }
    }
    return null;
  } else {
    var minDistSqrt = this.tree.accuracy * this.tree.accuracy;
    for (var i = 0; i < this.points.length; i++) {
      var o = this.points[i];
      var distSq = squareDistanceBetweenPoints( p, o);
      if (distSq <= minDistSqrt) {
        return o;
      }
    }
    return null;
  }
};

/**
 * Add a point to the Octree cell.
 *
 * @param {[type]} p    [description]
 * @param {[type]} data [description]
 */
Octree.Cell.prototype.add = function (p, data) {
  this.points.push(p);
  this.data.push(data);
  if (this.children.length > 0) {
    this.addToChildren(p, data);
  } else {
    if (this.points.length > 1 && this.level < Octree.MaxLevel) {
      this.split();
    }
  }
};

Octree.Cell.prototype.addToChildren = function (p, data) {
  for (var i = 0; i < this.children.length; i++) {
    if (this.children[i].contains(p)) {
      this.children[i].add(p, data);
      break;
    }
  }
};

/**
 * Whether a cell contains a point.
 *
 * @param  {Object} p Point object containing x,y,z properties.
 * @return {Boolean}
 */
Octree.Cell.prototype.contains = function (p) {
  return p.x >= this.position.x - this.tree.accuracy
      && p.y >= this.position.y - this.tree.accuracy
      && p.z >= this.position.z - this.tree.accuracy
      && p.x < this.position.x + this.size.x + this.tree.accuracy
      && p.y < this.position.y + this.size.y + this.tree.accuracy
      && p.z < this.position.z + this.size.z + this.tree.accuracy;
};

/**
 * Split a cell into 8 child cells.
 *
 * @return {[type]} [description]
 */
Octree.Cell.prototype.split = function () {
  var x = this.position.x;
  var y = this.position.y;
  var z = this.position.z;
  var w2 = this.size.x / 2;
  var h2 = this.size.y / 2;
  var d2 = this.size.z / 2;
  this.children.push(new Octree.Cell(this.tree, {x: x, y: y, z: z}, {x: w2, y: h2, z: d2}, this.level + 1));
  this.children.push(new Octree.Cell(this.tree, {x: x + w2, y: y,  z: z}, {x: w2, y: h2, z: d2}, this.level + 1));
  this.children.push(new Octree.Cell(this.tree, {x: x, y: y, z: z + d2}, {x: w2, y: h2, z: d2}, this.level + 1));
  this.children.push(new Octree.Cell(this.tree, {x: x + w2, y: y,  z: z + d2}, {x: w2, y: h2, z: d2}, this.level + 1));
  this.children.push(new Octree.Cell(this.tree, {x: x, y: y + h2, z: z}, {x: w2, y: h2, z: d2}, this.level + 1));
  this.children.push(new Octree.Cell(this.tree, {x: x + w2, y: y + h2, z: z}, {x: w2, y: h2, z: d2}, this.level + 1));
  this.children.push(new Octree.Cell(this.tree, {x: x, y: y + h2, z: z + d2}, {x: w2, y: h2, z: d2}, this.level + 1));
  this.children.push(new Octree.Cell(this.tree, {x: x + w2, y: y + h2, z: z + d2}, {x: w2, y: h2, z: d2}, this.level + 1));
  for (var i = 0; i < this.points.length; i++) {
    this.addToChildren(this.points[i], this.data[i]);
  }
};

/**
 * Delete this as it's not critical to the API?
 *
 * @param  {[type]} p       [description]
 * @param  {[type]} options [description]
 * @return {[type]}         [description]
 */
Octree.Cell.prototype.squareDistanceToCenter = function(p) {
  var dx = p.x - (this.position.x + this.size.x / 2);
  var dy = p.y - (this.position.y + this.size.y / 2);
  var dz = p.z - (this.position.z + this.size.z / 2);
  return dx * dx + dy * dy + dz * dz;
}

/**
 * Find the nearest point given a point in the octree.
 *
 * @param  {[type]} p       [description]
 * @param  {[type]} options [description]
 * @return {[type]}         [description]
 */
Octree.Cell.prototype.find = function (p, options) {
  var nearest = null;
  var nearestData = null;
  var bestDist = options.bestDist;

  if (this.points.length > 0 && this.children.length == 0) {
    for (var i = 0; i < this.points.length; i++) {
      var dist = distanceBetweenPoints( this.points[i], p);
      if (dist <= bestDist) {
        if (dist == 0 && options.notSelf)
          continue;
        bestDist = dist;
        nearest = this.points[i];
        nearestData = this.data[i];
      }
    }
  }

  var children = this.children;

  //traverse children in order from closest to furthest
  var children = this.children
    .map(function(child) { return { child: child, dist: child.squareDistanceToCenter(p) } })
    .sort(function(a, b) { return a.dist - b.dist; })
    .map(function(c) { return c.child; });

  if (children.length > 0) {
    for (var i = 0; i < children.length; i++) {
      var child = children[i];
      if (child.points.length > 0) {
        if (p.x < child.position.x - bestDist || p.x > child.position.x + child.size.x + bestDist ||
            p.y < child.position.y - bestDist || p.y > child.position.y + child.size.y + bestDist ||
            p.z < child.position.z - bestDist || p.z > child.position.z + child.size.z + bestDist
          ) {
          continue;
        }
        var childNearest = child.find(p, options);
        if (!childNearest || !childNearest.point) {
          continue;
        }
        var childNearestDist = distanceBetweenPoints( childNearest.point, p);
        if (childNearestDist < bestDist) {
          nearest = childNearest.point;
          bestDist = childNearestDist;
          nearestData = childNearest.data;
        }
      }
    }
  }
  return {
    point: nearest,
    data: nearestData
  }
};

Octree.Cell.prototype.visit = function(f) {
	var x1 = this.position.x, x2 = this.position.x + this.size.x,
	    y1 = this.position.y, y2 = this.position.y + this.size.y,
	    z1 = this.position.z, z2 = this.position.z + this.size.z;

	// If the visiting function doesn't return true, visit the branch cells.
	if ( !f( this, x1, y1, z1, x2, y2, z2 ) ) {
		this.children.forEach(function(child) {
			child.visit(f);
		});
	}
}

function distanceBetweenPoints( p1, p2 ) {
	var dx = p1.x - p2.x;
  var dy = p1.y - p2.y;
  var dz = p1.z - p2.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

function squareDistanceBetweenPoints( p1, p2 ) {
	var dx = p1.x - p2.x;
  var dy = p1.y - p2.y;
  var dz = p1.z - p2.z;
  return dx * dx + dy * dy + dz * dz;
}
module.exports = Octree;