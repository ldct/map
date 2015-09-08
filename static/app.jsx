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

    self.getFourTiles(ZXY.z, ZXY.x, ZXY.y);

  },
  getBounds: function () {

    /* goes from self.state.zll to everything else */

    var self = this;

    var ZXY = zxyOfLatlng(this.state.zll.lat, this.state.zll.lng, this.state.zll.zoom);

    var a = latlngOfZxy(ZXY.z, ZXY.x, ZXY.y);
    var b = latlngOfZxy(ZXY.z, ZXY.x + 1, ZXY.y + 1);

    var lat_range = {
      min: Math.min(a.lat, b.lat),
      max: Math.max(a.lat, b.lat),
    }

    var lng_range = {
      min: Math.min(a.lng, b.lng),
      max: Math.max(a.lng, b.lng),
    }

    return {
      lat: lat_range,
      lng: lng_range,
      tile_width:self.props.tile_size,
      tile_height:self.props.tile_size,
      map_width:self.props.map_size,
      map_height:self.props.map_size,
    };

  },
  onMapDrop: function (offset) {

    var self = this;

    var bounds = self.getBounds();

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

  normalizeViewport: function () {
    return;
  },

  handleZoomIn: function (e) {
    var self = this;
    self.setState({
      zll: {
        lat: self.state.zll.lat,
        lng: self.state.zll.lng,
        zoom: self.state.zll.zoom + 1,
      }
    });
    e.stopPropagation();
    e.preventDefault();
  },

  handleZoomOut: function (e) {
    var self = this;
    self.setState({
      zll: {
        lat: self.state.zll.lat,
        lng: self.state.zll.lng,
        zoom: self.state.zll.zoom - 1,
      }
    });
    e.stopPropagation();
    e.preventDefault();
  },

  render: function () {
    var self = this;

    var ZXY = zxyOfLatlng(this.state.zll.lat, this.state.zll.lng, this.state.zll.zoom);

    var a = latlngOfZxy(ZXY.z, ZXY.x, ZXY.y);
    var b = latlngOfZxy(ZXY.z, ZXY.x + 1, ZXY.y + 1);

    var lat_range = {
      min: Math.min(a.lat, b.lat),
      max: Math.max(a.lat, b.lat),
    }

    var lng_range = {
      min: Math.min(a.lng, b.lng),
      max: Math.max(a.lng, b.lng),
    }

    var bounds = {
      lat: lat_range,
      lng: lng_range,
      tile_width:self.props.tile_size,
      tile_height:self.props.tile_size,
      map_width:self.props.map_size,
      map_height:self.props.map_size,
    };

    console.log(this.state.zll.zoom, lat_range.min, lat_range.max);

    return (
      <div>
        <Map color_scheme={this.state.color_scheme} geojsons={this.state.geojsons} zoom={this.state.zll.zoom} bounds={bounds} onMapDrop={self.onMapDrop}/>
        <form style = {{
          position: 'absolute',
          top: 20,
          left: 20,
        }}>
          <select onChange={this.onSelectColorScheme}>
            <option value="mapbox_wheatpaste">Mapbox Wheatpaste </option>
            <option value="mapzen_open"> Mapzen Open </option>
            <option value="mapzen_default"> Mapzen Default </option>
          </select>

          <button style={{ marginLeft: 10 }} onClick={this.handleZoomIn}> + </button>
          <button style={{ marginLeft: 10 }} onClick={this.handleZoomOut}> - </button>
        </form>
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
