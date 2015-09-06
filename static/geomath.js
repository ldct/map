var alphaOf = function (min, x, max) {
  return (x - min) / (max - min);
}

var inverseAlphaOf = function (min, y, max) {
  return min + (max - min) * y;
}

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

var xyOfLatlong = function (lat, lng, bounds) {
  return {
    x: alphaOf(bounds.lng.min, lng, bounds.lng.max) * bounds.tile_width,
    y: -alphaOf(bounds.lat.min, lat, bounds.lat.max) * bounds.tile_height,
  }
}

var llOfXy = function (x, y, bounds) {
  return {
    lng: inverseAlphaOf(bounds.lng.min, x / bounds.tile_height, bounds.lng.max),
    lat: inverseAlphaOf(bounds.lat.min, -y / bounds.tile_width, bounds.lat.max),
  }
}

var sumPoints = function (a, b) {
  return {
    x: a.x + b.x,
    y: a.y + b.y,
  };
}

var subPoints = function (a, b) {
  return {
    x: a.x - b.x,
    y: a.y - b.y,
  };
}

var negPoint = function (p) {
  return {
    x: -p.x,
    y: -p.y,
  }
}