/** @jsx React.DOM */
var API_KEY = 'vector-tiles-ZAjmKEM';

var ZXY = zxyOfLatlng(37.7833, -122.4167, 11); /* initial zxy */
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

var App = React.createClass({
  getInitialState: function () {
    return {
      geojsons: [],
      bounds: {
        lat: lat_range,
        lng: lng_range,
        tile_width: 800,
        tile_height: 800,
        map_width: 1600,
        map_height: 1600,
      },
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
    this.getZxy(ZXY.z, ZXY.x+0, ZXY.y+0);
    this.getZxy(ZXY.z, ZXY.x+1, ZXY.y+0);
    this.getZxy(ZXY.z, ZXY.x+0, ZXY.y+1);
    this.getZxy(ZXY.z, ZXY.x+1, ZXY.y+1);

  },
  render: function () {
    return (
      <Map geojsons={this.state.geojsons} bounds={this.state.bounds} />
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
          <App />,
          document.body
        );
      });
    });
  });
});

