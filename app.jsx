/** @jsx React.DOM */
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

var App = React.createClass({
  render: function() {
    return (
      <Map geojsons={this.props.geojsons} bounds = {this.props.bounds} />
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

