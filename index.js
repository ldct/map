/*
 * latlong
 * Zxy
 * Xy
 */

var render = function (geom) {

  var width = $('#map-canvas').width();
  var height = $('#map-canvas').height();
  var canvas = $('#map-canvas')[0].getContext('2d');

  canvas.globalAlpha = 1;

  var xyOfLatlong = function (lat, lng) {
    return {
      x: alphaOf(lng_range.min, lng, lng_range.max) * width,
      y: (1 - alphaOf(lat_range.min, lat, lat_range.max)) * height,
    }
  }


  var renderXy = function (x, y) {
    console.log('renderXy', x, y);
    canvas.fillRect(x, y, 1, 1);
  }

  var renderPolygon = function (points) { /*longlat */

    var first_xy = xyOfLatlong(points[0][1], points[0][0]);

    canvas.beginPath();
    canvas.moveTo(first_xy.x, first_xy.y);

    points.forEach(function (point) {
      var xy = xyOfLatlong(point[1], point[0]);
      canvas.lineTo(xy.x, xy.y);
    });
    canvas.closePath();
    canvas.fill();

  }

  var renderMultiPolygon = function (polygons) {
    polygons.forEach(renderPolygon);
  }

  if (geom.type === 'MultiPolygon') {
    geom.coordinates.forEach(function (points) {
      renderMultiPolygon(points);
    });
  } else if (geom.type === 'Polygon') {
    geom.coordinates.forEach(function (points) {
      renderPolygon(points);
    });
  }


}

