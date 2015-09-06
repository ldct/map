/** @jsx React.DOM */
var API_KEY = 'vector-tiles-ZAjmKEM';

var App = React.createClass({
  getInitialState: function () {
    return {
      geojsons: [],
      existing_zxy: [],
      zll: this.props.initialZll,
      color_scheme: 'mapbox_wheatpaste',
    }
  },
  getZxy: function (z, x, y) {
    var self = this;

    var key = [z, x, y].join('/');
    if (self.state.existing_zxy.indexOf(key) !== -1) return;
    self.setState(function (state) {
      return {
        existing_zxy: state.existing_zxy.concat([key]),
      }
    }, function () {

      var url = '/tiles/' + [z, x, y].join('/');
      $.getJSON(url, function (res) {
        self.setState({
          geojsons: self.state.geojsons.concat([res]),
        });
      });

    });
  },
  getFourTiles: function (z, x, y) {
    console.log('getFourTiles', z, x, y);
    this.getZxy(z, x+0, y+0);
    this.getZxy(z, x+1, y+0);
    this.getZxy(z, x+0, y+1);
    this.getZxy(z, x+1, y+1);
  },
  componentDidMount: function () {

    var self = this;

    var ZXY = zxyOfLatlng(this.state.zll.lat, this.state.zll.lng, this.state.zll.zoom);

    var a = latlngOfZxy(ZXY.z, ZXY.x, ZXY.y);
    var b = latlngOfZxy(ZXY.z, ZXY.x + 1, ZXY.y + 1);

    console.log(a, b);

    var lat_range = {
      min: Math.min(a.lat, b.lat),
      max: Math.max(a.lat, b.lat),
    }

    var lng_range = {
      min: Math.min(a.lng, b.lng),
      max: Math.max(a.lng, b.lng),
    }

    this.setState({
      bounds: {
        lat: lat_range,
        lng: lng_range,
      }
    });

    self.getFourTiles(ZXY.z, ZXY.x, ZXY.y);

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
    // var aXy = xyOfLatlong(aLlz.lat, aLlz.lng, bounds);

    // from here
    var viewAxy = negPoint(offset);
    var realLl = llOfXy(viewAxy.x, viewAxy.y, bounds);
    var realZXY = zxyOfLatlng(realLl.lat, realLl.lng, self.state.zll.zoom);

    self.getFourTiles(realZXY.z, realZXY.x, realZXY.y);

  },

  onSelectColorScheme: function (e) {
    this.setState({
      color_scheme: e.target.value,
    });
  },

  render: function () {
    var self = this;
    return (
      <div>
        <Map color_scheme={this.state.color_scheme} geojsons={this.state.geojsons} bounds={$.extend({}, this.state.bounds, {
          tile_width:self.props.tile_size,
          tile_height:self.props.tile_size,
          map_width:self.props.map_size,
          map_height:self.props.map_size,
        })} onMapDrop={self.onMapDrop}/>
        <select style={{
          position: 'absolute',
          top: 20,
          left: 20,
        }} onChange={this.onSelectColorScheme}>
          <option value="mapbox_wheatpaste">Mapbox Wheatpaste </option>
          <option value="mapzen_open"> Mapzen Open </option>
          <option value="mapzen_default"> Mapzen Default </option>
        </select>
      </div>
    );
  }
});

React.render(
  <App tile_size={600} map_size={1200} initialZll = {{
    lat: 37.7833,
    lng: -122.4167,
    zoom: 10,
  }} />,
  document.body
);
