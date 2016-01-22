/** @jsx React.DOM */
var API_KEY = 'vector-tiles-ZAjmKEM';

var App = React.createClass({
  getInitialState: function () {
    var self = this;
    return {
      geojsons: [],
      existing_zxy: [],
      zll: this.props.initialZll,
      color_scheme: 'mapbox_wheatpaste',
      offset: {
        x: 0,
        y: self.props.tile_size,
       }
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

    var viewAxy = negPoint(offset);
    var realLl = llOfXy(viewAxy.x, viewAxy.y, bounds);
    var realZXY = zxyOfLatlng(realLl.lat, realLl.lng, self.state.zll.zoom);

    self.setState({
      offset: offset,
    });

    self.getFourTiles(realZXY.z, realZXY.x, realZXY.y);

  },

  onSelectColorScheme: function (e) {
    this.setState({
      color_scheme: e.target.value,
    });
  },

  // normalizeViewport: function () {

  //   var self = this;

  //   var bounds = self.getBounds();


  //   var offset = self.state.offset;

  //   var viewAxy = negPoint(offset);
  //   var realLl = llOfXy(viewAxy.x, viewAxy.y, bounds);

  //   var gridZxy = zxyOfLatlng(realLl.lat, realLl.lng, self.state.zll.zoom);
  //   var gridXy = xyOfZxy(gridZxy.z, gridZxy.x, gridZxy.y, bounds);

  //   var new_offset = negPoint(sumPoints(gridXy, offset));

  //   self.setState({
  //     offset: {
  //       x: new_offset.x,
  //       y: new_offset.y
  //     },
  //     zll: {
  //       lat: realLl.lat,
  //       lng: realLl.lng,
  //       zoom: self.state.zll.zoom,
  //     }
  //   });

  //   return;
  // },

  handleNormalize: function (e) {

    e.stopPropagation();
    e.preventDefault();

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

    return (
      <div>
        <Map color_scheme={self.state.color_scheme}
             geojsons={self.state.geojsons}
             zoom={self.state.zll.zoom}
             bounds={bounds}
             onMapDrop={self.onMapDrop}
             offset={self.state.offset} />
        <form style = {{
          position: 'absolute',
          top: 20,
          left: 20,
        }}>
          <button style={{ marginLeft: 10 }} onClick={this.handleZoomIn}> + </button>
          <button style={{ marginLeft: 10 }} onClick={this.handleZoomOut}> - </button>
          <button style={{ marginLeft: 10 }} onClick={this.handleNormalize}> N </button>
        </form>
      </div>
    );
  }
});

React.render(
  <App tile_size={600} map_size={2400} initialZll = {{
    lat: 37.7833,
    lng: -122.4167,
    zoom: 10,
  }} />,
  document.body
);
