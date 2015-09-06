/** @jsx React.DOM */
var API_KEY = 'vector-tiles-ZAjmKEM';

var App = React.createClass({
  getInitialState: function () {
    return {
      geojsons: [],
      zll: this.props.initialZll,
      start: 0,
      end: 2,
    }
  },
  getZxy: function (z, x, y) {
    var self = this;
    var url = 'http://vector.mapzen.com/osm/all/' + [z, x, y].join('/') + '.json?api_key=' + API_KEY;
    $.getJSON(url, function (res) {
      self.setState({
        geojsons: self.state.geojsons.concat([res]),
      });
    });
  },
  getAllTiles: function () {
    var self = this;

    var ZXY = zxyOfLatlng(this.state.zll.lat, this.state.zll.lng, this.state.zll.zoom);

    for (var i=self.state.start; i<self.state.end; i++) {
      for (var j=self.state.start; j<self.state.end; j++) {
        this.getZxy(ZXY.z, ZXY.x+i, ZXY.y+j);
      }
    }

    this.getZxy(ZXY.z, ZXY.x+0, ZXY.y+0);
    this.getZxy(ZXY.z, ZXY.x+1, ZXY.y+0);
    this.getZxy(ZXY.z, ZXY.x+0, ZXY.y+1);
    this.getZxy(ZXY.z, ZXY.x+1, ZXY.y+1);
  },
  componentDidMount: function () {

    var self = this;

    var ZXY = zxyOfLatlng(this.state.zll.lat, this.state.zll.lng, this.state.zll.zoom);

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

    this.setState({
      bounds: {
        lat: lat_range,
        lng: lng_range,
      }
    });

    self.getAllTiles();

  },
  onMapDrop: function (offset) {

    var self = this;

    var bounds = $.extend({}, this.state.bounds, {
      tile_width: self.props.tile_size,
      tile_height: self.props.tile_size,
      map_width: self.props.map_size,
      map_height: self.props.map_size,
    });

    var ZXY = zxyOfLatlng(self.state.zll.lat, self.state.zll.lng, self.state.zll.zoom);

    var aLlz = latlngOfZxy(self.state.zll.zoom, ZXY.x + self.state.start, ZXY.y + self.state.start);
    var bLlz = latlngOfZxy(self.state.zll.zoom, ZXY.x + self.state.end, ZXY.y + self.state.end);

    var aXy = xyOfLatlong(aLlz.lat, aLlz.lng, bounds);
    var bXy = xyOfLatlong(bLlz.lat, bLlz.lng, bounds);

    var realAXy = sumPoints(aXy, offset);
    var realBXy = sumPoints(bXy, offset);

    if (realAXy.x > 0 || realAXy.y > 0) {
      self.setState({
        start: self.state.start - 1,
      }, self.getAllTiles);
    }

  },
  render: function () {
    var self = this;
    return (
      <Map color_scheme="mapbox_wheatpaste" geojsons={this.state.geojsons} bounds={$.extend({}, this.state.bounds, {
        tile_width:self.props.tile_size,
        tile_height:self.props.tile_size,
        map_width:self.props.map_size,
        map_height:self.props.map_size,
      })} onMapDrop={self.onMapDrop}/>
    );
  }
});

React.render(
  <App tile_size={800} map_size={1600} initialZll = {{
    lat: 37.7833,
    lng: -122.4167,
    zoom: 13,
  }} />,
  document.body
);
