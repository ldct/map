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

// var ZXY = zxyOfLatlng(37.7833, -122.4167, 11);
var ZXY = zxyOfLatlng(39.95, -75.19, 9);
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
var xyOfLatlong = function (lat, lng, bounds) {
  return {
    x: alphaOf(bounds.lng.min, lng, bounds.lng.max) * bounds.width,
    y: (1 - alphaOf(bounds.lat.min, lat, bounds.lat.max)) * bounds.height,
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
    var outside = this.props.points[0];
    var xy_serialized_points = outside.map(function (point) {
      var xy = xyOfLatlong(point[1], point[0], self.props.bounds);
      if (isNaN(xy.x)) {
      }
      return xy.x + ',' + xy.y;
    });
    return <polygon points={xy_serialized_points.join(' ')} fill={self.props.fill} stroke={self.props.stroke} />;
  }
});

var GeoLineString = React.createClass({
  render: function () {
    var self = this;
    var xy_serialized_points = this.props.points.map(function (point) {
      var xy = xyOfLatlong(point[1], point[0], self.props.bounds);
      return xy.x + ',' + xy.y;
    });
    return <polyline points={xy_serialized_points.join(' ')} stroke={self.props.stroke} fill="none" strokeWidth="1px"/>;
  }
})

var Geometry = React.createClass({
  render: function () {
    var self = this;
    if (self.props.data.type === 'MultiPolygon') {
      return (
        <g>
          {
            self.props.data.coordinates.map(function (polygon) {
              return <GeoPolygon points={polygon} bounds={self.props.bounds} fill={self.props.fill} />
            })
          }
        </g>
      )
    } else if (self.props.data.type === 'MultiLineString') {
      return (
        <g>
          {
            self.props.data.coordinates.map(function (line) {
              return <GeoLineString points={line} bounds={self.props.bounds} fill={self.props.fill} stroke={self.props.stroke} />
            })
          }
        </g>
      )
    } else if (self.props.data.type === 'Polygon') {
      return <GeoPolygon points={self.props.data.coordinates} bounds={self.props.bounds} fill={self.props.fill} stroke={self.props.stroke} />
    } else if (self.props.data.type === 'LineString') {
      return <GeoLineString points={self.props.data.coordinates} bounds={self.props.bounds} stroke={self.props.stroke} />
    } else {
      console.log('unknown type:', self.props.data.type);
      return <g />
    }
  }
})

var Earth = React.createClass({
  render: function () {
    var self = this;
    if (!self.props.data) return <g />;
    return (<g>
      {this.props.data.features.map(function (feature) {
        return <Geometry data={feature.geometry} bounds={self.props.bounds} fill={self.props.fill} />
      })}
    </g>)
  }
});

var Water = React.createClass({
  render: function () {
    var self = this;
    if (!self.props.data) return <g />;
    return (<g>
      {this.props.data.features.map(function (feature) {
        return <Geometry data={feature.geometry} bounds={self.props.bounds} fill={self.props.fill}/>
      })}
    </g>)
  }
});

var Roads = React.createClass({
  render: function () {
    var self = this;
    if (!self.props.data) return <g />;
    return (<g>
      {this.props.data.features.map(function (feature) {
        return <Geometry data={feature.geometry} bounds={self.props.bounds} stroke={self.props.stroke}/>
      })}
    </g>)
  }
});

var Buildings = React.createClass({
  render: function () {
    var self = this;
    if (!self.props.data) return <g />;
    return (<g>
      {this.props.data.features.map(function (feature) {
        return <Geometry data={feature.geometry} bounds={self.props.bounds} stroke={self.props.stroke} fill={self.props.fill}/>
      })}
    </g>)
  }
});

var Transit = React.createClass({
  render: function () {
    var self = this;
    if (!self.props.data) return <g />;
    return (<g>
      {this.props.data.features.map(function (feature) {
        return <Geometry data={feature.geometry} bounds={self.props.bounds} stroke={self.props.stroke} fill={self.props.fill}/>
      })}
    </g>)
  }
})

var Map = React.createClass({

  render: function() {
    var self = this;
    console.log(self.props.bounds);
    return (
      <svg width={self.props.bounds.width} height={self.props.bounds.height}>
        <Earth data={self.props.geojson.earth} bounds={self.props.bounds} fill="#F1EEDF" />
        <Water data={self.props.geojson.water} bounds={self.props.bounds} fill="#6E9197" />
        <Roads data={self.props.geojson.roads} bounds={self.props.bounds} stroke="rgba(0, 0, 0, 0.1)" />
        <Buildings data={self.props.geojson.buildings} bounds={self.props.bounds} fill="#EAE5D5" stroke="#BBB7A9"/>
        <Transit data={self.props.geojson.transit} bounds={self.props.bounds} fill="purple" stroke="purple"/>
      </svg>
    );
  }

});

var url = 'http://vector.mapzen.com/osm/all/' + [ZXY.z, ZXY.x, ZXY.y].join('/') + '.json?api_key=' + API_KEY;

$.getJSON(url, function (res) {

  React.render(
    <App
      geojson={res}
      bounds={{
        lat: lat_range,
        lng: lng_range,
        width: 800,
        height: 800,
      }} />, document.body);
  // render(res.earth.features[0].geometry);

});
