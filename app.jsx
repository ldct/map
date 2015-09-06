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
// var ZXY = zxyOfLatlng(39.95, -75.19, 9);
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
    x: alphaOf(bounds.lng.min, lng, bounds.lng.max) * bounds.tile_width,
    y: (1 - alphaOf(bounds.lat.min, lat, bounds.lat.max)) * bounds.tile_height,
  }
}

var App = React.createClass({
  render: function() {
    return (
      <Map geojsons={this.props.geojsons} bounds = {this.props.bounds} />
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
});

var GeoPoint = React.createClass({
  render: function () {
    var self = this;
    var xy = xyOfLatlong(self.props.point[1], self.props.point[0], self.props.bounds);
    return <circle cx={xy.x} cy={xy.y} r={2} stroke="pink" fill="pink" strokeWidth="1px"/>;
  }
});

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
    } else if (self.props.data.type === 'Point') {
      return <GeoPoint point={self.props.data.coordinates} bounds={self.props.bounds} />
    } else {
      console.log('unknown type:', self.props.data.type);
      return <g />
    }
  }
})

var FeatureCollection = React.createClass({
  render: function () {
    var self = this;
    if (!self.props.data) return <g />;
    return (<g>
      {this.props.data.features.map(function (feature) {
        return <Geometry data={feature.geometry} bounds={self.props.bounds} fill={self.props.fill} stroke={self.props.stroke} />
      })}
    </g>)
  }
});

var Map = React.createClass({

  getInitialState: function () {
    return {
      dragging: false,
      offset: {
        x: 0,
        y: 0
      }
    }
  },

  componentDidUpdate: function (props, state) {
    if (this.state.dragging && !state.dragging) {
      document.addEventListener('mousemove', this.onMouseMove)
      document.addEventListener('mouseup', this.onMouseUp)
    } else if (!this.state.dragging && state.dragging) {
      document.removeEventListener('mousemove', this.onMouseMove)
      document.removeEventListener('mouseup', this.onMouseUp)
    }
  },

  onMouseDown: function (e) {
    if (e.button !== 0) return;
    this.setState({
      dragging: true,
      mouse_start: {
        x: e.pageX,
        y: e.pageY
      }
    });
    e.stopPropagation()
    e.preventDefault()
  },
  onMouseUp: function (e) {
    this.setState({dragging: false})
    e.stopPropagation()
    e.preventDefault()
  },
  onMouseMove: function (e) {
    if (!this.state.dragging) return
    console.log(e.pageX - this.state.mouse_start.x, e.pageY - this.state.mouse_start.y);
    this.setState({
      offset: {
        x: this.state.offset.x + e.pageX - this.state.mouse_start.x,
        y: this.state.offset.y + e.pageY - this.state.mouse_start.y,
      }
    })
    e.stopPropagation()
    e.preventDefault()
  },


  render: function() {
    var self = this;
    return (
      <div onMouseDown={this.onMouseDown} style={{border: '1px solid pink'}}>
      <svg width={self.props.bounds.map_width} height={self.props.bounds.map_height}>

        {self.props.geojsons.map(function (geojson) {
          return (
            <g transform={"translate(" + self.state.offset.x + " " + self.state.offset.y + ")"}>
              <FeatureCollection data={geojson.earth} bounds={self.props.bounds} fill="#F1EEDF" />
              <FeatureCollection data={geojson.water} bounds={self.props.bounds} fill="#6E9197" />
              <FeatureCollection data={geojson.roads} bounds={self.props.bounds} stroke="rgba(0, 0, 0, 0.05)" />
              <FeatureCollection data={geojson.buildings} bounds={self.props.bounds} fill="#EAE5D5" stroke="#BBB7A9"/>
              <FeatureCollection data={geojson.transit} bounds={self.props.bounds} fill="purple" stroke="purple"/>
            </g>
          )
        })}

      </svg>
      </div>
    );
  }

});

var url1 = 'http://vector.mapzen.com/osm/all/' + [ZXY.z, ZXY.x, ZXY.y].join('/') + '.json?api_key=' + API_KEY;
var url2 = 'http://vector.mapzen.com/osm/all/' + [ZXY.z, ZXY.x+1, ZXY.y].join('/') + '.json?api_key=' + API_KEY;
var url3 = 'http://vector.mapzen.com/osm/all/' + [ZXY.z, ZXY.x, ZXY.y+1].join('/') + '.json?api_key=' + API_KEY;
var url4 = 'http://vector.mapzen.com/osm/all/' + [ZXY.z, ZXY.x+1, ZXY.y+1].join('/') + '.json?api_key=' + API_KEY;

$.getJSON(url1, function (res1) {
  $.getJSON(url2, function (res2) {
    $.getJSON(url3, function (res3) {
      $.getJSON(url4, function (res4) {
        React.render(
          <App
            geojsons={[res1, res2, res3, res4]}
            bounds={{
              lat: lat_range,
              lng: lng_range,
              tile_width: 800,
              tile_height: 800,
              map_width: 1600,
              map_height: 1600,
            }} />,
          document.body
        );
      });
    });
  });
});

