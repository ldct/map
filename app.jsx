/** @jsx React.DOM */
var API_KEY = 'vector-tiles-ZAjmKEM';

var App = React.createClass({
  getInitialState: function () {
    return {
      geojsons: [],
      zll: this.props.initialZll,
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
  componentDidMount: function () {

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
    })

    this.getZxy(ZXY.z, ZXY.x+0, ZXY.y+0);
    this.getZxy(ZXY.z, ZXY.x+1, ZXY.y+0);
    this.getZxy(ZXY.z, ZXY.x+0, ZXY.y+1);
    this.getZxy(ZXY.z, ZXY.x+1, ZXY.y+1);

  },
  render: function () {
    var self = this;
    return (
      <Map geojsons={this.state.geojsons} bounds={$.extend({}, this.state.bounds, {
        tile_width:self.props.tile_size,
        tile_height:self.props.tile_size,
        map_width:self.props.map_size,
        map_height:self.props.map_size,
      })} />
    );
  }
});

React.render(
  <App tile_size={800} map_size={1600} initialZll = {{

    lat: 37.7833,
    lng: -122.4167,
    zoom: 11,

  }} />,
  document.body
);
