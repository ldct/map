/** @jsx React.DOM */

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

var ZXY = zxyOfLatlng(37.7833, -122.4167, 11);


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

/* todo: combine bounds, width, height */
var xyOfLatlong = function (lat, lng, bounds, width, height) {
  return {
    x: alphaOf(bounds.lng.min, lng, bounds.lng.max) * width,
    y: (1 - alphaOf(bounds.lat.min, lat, bounds.lat.max)) * height,
  }
}

var App = React.createClass({
  render: function() {
    return (
      <Map geojson={this.props.geojson} bounds = {this.props.bounds} />
    );
  }
});

var GeoPolygon = React.createClass({
  render: function () {
    var self = this;
    console.log(this.props.bounds);
    var xy_serialized_points = this.props.points.map(function (point) {
      var xy = xyOfLatlong(point[1], point[0], self.props.bounds, 800, 800);
      return xy.x + ',' + xy.y;
    });
    console.log(xy_serialized_points);
    return <polygon points={xy_serialized_points.join(' ')}/>;
  }
})

var Geometry = React.createClass({
  render: function () {
    var self = this;
    if (this.props.data.type === 'MultiPolygon') {
      return (
        <g>
          {
            this.props.data.coordinates.map(function (polygon) {
              if (polygon.length !== 1) console.log('huh?');
              return <GeoPolygon points={polygon[0]} bounds = {self.props.bounds} />
            })
          }
        </g>
      )
    } else {
      console.log('unknown type:', this.props.ty)
    }
  }
})

/*
 * geojson, bounds => svg
 */
var Map = React.createClass({

  renderEarth: function () {
    var self = this;
    if (!this.props.geojson.earth) return null;
    return this.props.geojson.earth.features.map(function (feature) {
      return <Geometry data={feature.geometry} bounds={self.props.bounds} />
    });
  },

  render: function() {
    console.log('gjson', this.props.geojson);
    return (
      <svg width='800' height='800'>
        { this.renderEarth() }
      </svg>
    );
  }
});

var url = 'http://vector.mapzen.com/osm/all/' + [ZXY.z, ZXY.x, ZXY.y].join('/') + '.json?api_key=' + API_KEY;

$.getJSON(url, function (res) {

  console.log(res.earth.features[0].geometry);
  React.render(
    <App
      geojson={res}
      bounds={{
        lat: lat_range,
        lng: lng_range,
      }} />, document.body);
  // render(res.earth.features[0].geometry);

});
