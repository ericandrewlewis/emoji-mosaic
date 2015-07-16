var geom = require('pex-geom');

var Vec3 = geom.Vec3;

/**
 * An octree.
 *
 * @constructor
 *
 * @param {[type]} position [description]
 * @param {[type]} size     [description]
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

Octree.MaxLevel = 8;

/**
 * Add a point to the Octree.
 *
 * @param {[type]} p    [description]
 * @param {[type]} data [description]
 */
Octree.prototype.add = function (p, data) {
  this.root.add(p, data);
};

//check if the point was already added to the octreee
Octree.prototype.has = function (p) {
  return this.root.has(p);
};

//includeData - return both point and it's data, defaults to false
//maxDist - don't include points further than maxDist, defaults to Inifinity
//notSelf - return point only if different than submited point, defaults to false
Octree.prototype.findNearestPoint = function (p, options) {
  options.includeData = options.includeData ? options.includeData : false;
  options.bestDist = options.maxDist ? options.maxDist : Infinity;
  options.notSelf = options.notSelf ? options.notSelf : false;

  var result = this.root.findNearestPoint(p, options);
  if (result) {
    if (options.includeData) return result;
    else return result.point;
  }
  else return null;
};

Octree.prototype.findNearbyPoints = function (p, r, options) {
  options = options || { };
  var result = { points: [], data: [] };
  this.root.findNearbyPoints(p, r, result, options);
  return result;
};

Octree.prototype.getAllCellsAtLevel = function (cell, level, result) {
  if (typeof level == 'undefined') {
    level = cell;
    cell = this.root;
  }
  result = result || [];
  if (cell.level == level) {
    if (cell.points.length > 0) {
      result.push(cell);
    }
    return result;
  } else {
    cell.children.forEach(function (child) {
      this.getAllCellsAtLevel(child, level, result);
    }.bind(this));
    return result;
  }
};

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
  this.temp = new Vec3(); //temp vector for distance calculation
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
      var distSq = p.squareDistance(o);
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
  this.children.push(new Octree.Cell(this.tree, Vec3.create(x, y, z), Vec3.create(w2, h2, d2), this.level + 1));
  this.children.push(new Octree.Cell(this.tree, Vec3.create(x + w2, y, z), Vec3.create(w2, h2, d2), this.level + 1));
  this.children.push(new Octree.Cell(this.tree, Vec3.create(x, y, z + d2), Vec3.create(w2, h2, d2), this.level + 1));
  this.children.push(new Octree.Cell(this.tree, Vec3.create(x + w2, y, z + d2), Vec3.create(w2, h2, d2), this.level + 1));
  this.children.push(new Octree.Cell(this.tree, Vec3.create(x, y + h2, z), Vec3.create(w2, h2, d2), this.level + 1));
  this.children.push(new Octree.Cell(this.tree, Vec3.create(x + w2, y + h2, z), Vec3.create(w2, h2, d2), this.level + 1));
  this.children.push(new Octree.Cell(this.tree, Vec3.create(x, y + h2, z + d2), Vec3.create(w2, h2, d2), this.level + 1));
  this.children.push(new Octree.Cell(this.tree, Vec3.create(x + w2, y + h2, z + d2), Vec3.create(w2, h2, d2), this.level + 1));
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
 * Delete this as it's not critical to the API?
 *
 * @param  {[type]} p       [description]
 * @param  {[type]} options [description]
 * @return {[type]}         [description]
 */
Octree.Cell.prototype.findNearestPoint = function (p, options) {
  var nearest = null;
  var nearestData = null;
  var bestDist = options.bestDist;

  if (this.points.length > 0 && this.children.length == 0) {
    for (var i = 0; i < this.points.length; i++) {
      var dist = this.points[i].distance(p);
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
        var childNearest = child.findNearestPoint(p, options);
        if (!childNearest || !childNearest.point) {
          continue;
        }
        var childNearestDist = childNearest.point.distance(p);
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

/**
 * Delete this as it's not critical to the API?
 *
 * @param  {[type]} p       [description]
 * @param  {[type]} options [description]
 * @return {[type]}         [description]
 */
Octree.Cell.prototype.findNearbyPoints = function (p, r, result, options) {
  if (this.points.length > 0 && this.children.length == 0) {
    for (var i = 0; i < this.points.length; i++) {
      var dist = this.points[i].distance(p);
      if (dist <= r) {
        if (dist == 0 && options.notSelf)
          continue;
        result.points.push(this.points[i]);
        if (options.includeData) result.data.push(this.data[i]);
      }
    }
  }

  //children order doesn't matter
  var children = this.children;

  if (children.length > 0) {
    for (var i = 0; i < children.length; i++) {
      var child = children[i];
      if (child.points.length > 0) {
        if (p.x < child.position.x - r || p.x > child.position.x + child.size.x + r ||
            p.y < child.position.y - r || p.y > child.position.y + child.size.y + r ||
            p.z < child.position.z - r || p.z > child.position.z + child.size.z + r
          ) {
          continue;
        }
        child.findNearbyPoints(p, r, result, options);
      }
    }
  }
};

module.exports = Octree;