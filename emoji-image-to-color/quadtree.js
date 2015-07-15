function d3_functor(v) {
  return typeof v === "function" ? v : function() { return v; };
}
function d3_geom_pointX(d) {
  return d[0];
}
function d3_geom_pointY(d) {
  return d[1];
}
quadtree = function() {
  var x = d3_geom_pointX, y = d3_geom_pointY, points, x1, y1, x2, y2;
  function quadtree(data) {
    var d, fx = d3_functor(x), fy = d3_functor(y), xs, ys, i, n, x1_, y1_, x2_, y2_;
    if (x1 != null) {
      x1_ = x1, y1_ = y1, x2_ = x2, y2_ = y2;
    } else {
      x2_ = y2_ = -(x1_ = y1_ = Infinity);
      xs = [], ys = [];
      n = data.length;
      for (i = 0; i < n; ++i) {
        var x_ = +fx(d = data[i], i), y_ = +fy(d, i);
        if (x_ < x1_) x1_ = x_;
        if (y_ < y1_) y1_ = y_;
        if (x_ > x2_) x2_ = x_;
        if (y_ > y2_) y2_ = y_;
        xs.push(x_);
        ys.push(y_);
      }
    }
    var dx = x2_ - x1_, dy = y2_ - y1_;
    if (dx > dy) y2_ = y1_ + dx; else x2_ = x1_ + dy;
    function insert(n, d, x, y, x1, y1, x2, y2) {
      if (isNaN(x) || isNaN(y)) return;
      if (n.leaf) {
        var nx = n.x, ny = n.y;
        if (nx != null) {
          if (Math.abs(nx - x) + Math.abs(ny - y) < .01) {
            insertChild(n, d, x, y, x1, y1, x2, y2);
          } else {
            var nPoint = n.point;
            n.x = n.y = n.point = null;
            insertChild(n, nPoint, nx, ny, x1, y1, x2, y2);
            insertChild(n, d, x, y, x1, y1, x2, y2);
          }
        } else {
          n.x = x, n.y = y, n.point = d;
        }
      } else {
        insertChild(n, d, x, y, x1, y1, x2, y2);
      }
    }
    function insertChild(n, d, x, y, x1, y1, x2, y2) {
      var xm = (x1 + x2) * .5, ym = (y1 + y2) * .5, right = x >= xm, below = y >= ym, i = below << 1 | right;
      n.leaf = false;
      n = n.nodes[i] || (n.nodes[i] = d3_geom_quadtreeNode());
      if (right) x1 = xm; else x2 = xm;
      if (below) y1 = ym; else y2 = ym;
      insert(n, d, x, y, x1, y1, x2, y2);
    }
    var root = d3_geom_quadtreeNode();
    root.add = function(d) {
      insert(root, d, +fx(d, ++i), +fy(d, i), x1_, y1_, x2_, y2_);
    };
    root.visit = function(f) {
      d3_geom_quadtreeVisit(f, root, x1_, y1_, x2_, y2_);
    };
    root.find = function(point) {
      return d3_geom_quadtreeFind(root, point[0], point[1], x1_, y1_, x2_, y2_);
    };
    i = -1;
    if (x1 == null) {
      while (++i < n) {
        insert(root, data[i], xs[i], ys[i], x1_, y1_, x2_, y2_);
      }
      --i;
    } else data.forEach(root.add);
    xs = ys = data = d = null;
    return root;
  }
  quadtree.x = function(_) {
    return arguments.length ? (x = _, quadtree) : x;
  };
  quadtree.y = function(_) {
    return arguments.length ? (y = _, quadtree) : y;
  };
  quadtree.extent = function(_) {
    if (!arguments.length) return x1 == null ? null : [ [ x1, y1 ], [ x2, y2 ] ];
    if (_ == null) x1 = y1 = x2 = y2 = null; else x1 = +_[0][0], y1 = +_[0][1], x2 = +_[1][0],
    y2 = +_[1][1];
    return quadtree;
  };
  quadtree.size = function(_) {
    if (!arguments.length) return x1 == null ? null : [ x2 - x1, y2 - y1 ];
    if (_ == null) x1 = y1 = x2 = y2 = null; else x1 = y1 = 0, x2 = +_[0], y2 = +_[1];
    return quadtree;
  };
  return quadtree;
};
function d3_geom_quadtreeNode() {
  return {
    leaf: true,
    nodes: [],
    point: null,
    x: null,
    y: null
  };
}
function d3_geom_quadtreeVisit(f, node, x1, y1, x2, y2) {
  if (!f(node, x1, y1, x2, y2)) {
    var sx = (x1 + x2) * .5, sy = (y1 + y2) * .5, children = node.nodes;
    if (children[0]) d3_geom_quadtreeVisit(f, children[0], x1, y1, sx, sy);
    if (children[1]) d3_geom_quadtreeVisit(f, children[1], sx, y1, x2, sy);
    if (children[2]) d3_geom_quadtreeVisit(f, children[2], x1, sy, sx, y2);
    if (children[3]) d3_geom_quadtreeVisit(f, children[3], sx, sy, x2, y2);
  }
}
function d3_geom_quadtreeFind(root, x, y, x0, y0, x3, y3) {
  var minDistance2 = Infinity, closestPoint;
  (function find(node, x1, y1, x2, y2) {
    if (x1 > x3 || y1 > y3 || x2 < x0 || y2 < y0) return;
    if (point = node.point) {
      var point, dx = x - node.x, dy = y - node.y, distance2 = dx * dx + dy * dy;
      if (distance2 < minDistance2) {
        var distance = Math.sqrt(minDistance2 = distance2);
        x0 = x - distance, y0 = y - distance;
        x3 = x + distance, y3 = y + distance;
        closestPoint = point;
      }
    }
    var children = node.nodes, xm = (x1 + x2) * .5, ym = (y1 + y2) * .5, right = x >= xm, below = y >= ym;
    for (var i = below << 1 | right, j = i + 4; i < j; ++i) {
      if (node = children[i & 3]) switch (i & 3) {
       case 0:
        find(node, x1, y1, xm, ym);
        break;

       case 1:
        find(node, xm, y1, x2, ym);
        break;

       case 2:
        find(node, x1, ym, xm, y2);
        break;

       case 3:
        find(node, xm, ym, x2, y2);
        break;
      }
    }
  })(root, x0, y0, x3, y3);
  return closestPoint;
}