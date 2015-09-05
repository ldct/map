/*
 * latlong
 * Zxy
 * Xy
 */

var latlngOfZxy = function (z, x, y) {
 var n=Math.PI-2*Math.PI*y/Math.pow(2,z);
 return {
  lng: x/Math.pow(2,z)*360-180,
  lat: 180/Math.PI*Math.atan(0.5*(Math.exp(n)-Math.exp(-n))),
 }
}

var zxyOfLatlng = function (lat, lng, zoom) {
  return {
    z: zoom,
    x: Math.floor((lng+180)/360*Math.pow(2,zoom)),
    y: Math.floor((1-Math.log(Math.tan(lat*Math.PI/180) + 1/Math.cos(lat*Math.PI/180))/Math.PI)/2 *Math.pow(2,zoom)),
  }
}

var API_KEY = 'vector-tiles-ZAjmKEM';
var ZOOM = 16;
var ZXY = zxyOfLatlng(37.7616, -122.4346, 13);

// SF: http://tristan.io/hoverboard/#13//

var ZXY = {
  z: ZOOM,
  x: 19293,
  y: 24641
}

var url = 'http://vector.mapzen.com/osm/all/' + [ZXY.z, ZXY.x, ZXY.y].join('/') + '.json?api_key=' + API_KEY;

var a = latlngOfZxy(ZXY.z, ZXY.x, ZXY.y);
var b = latlngOfZxy(ZXY.z, ZXY.x + 1, ZXY.y + 1);

var lat_range = {
  min: b.lat,
  max: a.lat,
}

var lng_range = {
  min: a.lng,
  max: b.lng,
}

var alphaOf = function (min, x, max) {
  return (x - min) / (max - min);
}

var render = function (geom) {

  var width = $('#map-canvas').width();
  var height = $('#map-canvas').height();
  var canvas = $('#map-canvas')[0].getContext('2d');

  canvas.globalAlpha = 1;

  var xyOfLatlong = function (lat, lng) {
    return {
      x: alphaOf(lat_range.min, lat, lat_range.max) * width,
      y: alphaOf(lng_range.min, lng, lng_range.max) * height,
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

  geom.coordinates.forEach(function (points) {
    renderPolygon(points);
  });

}

$.getJSON(url, function (res) {

  render(res.earth.features[0].geometry);

});