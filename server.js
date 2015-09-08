var express = require('express');
var app = express();
var http = require('http');
var server = http.createServer(app);
var bodyParser = require('body-parser');
var morgan = require('morgan');
var cors = require('cors');
var request = require('request');

app.use(cors());
app.use(bodyParser.json({ 'limit': '10mb' }));
app.use(morgan('dev'));

var cache = {};

app.use(express.static('static'));

app.get('/tiles/:zoom/:x/:y', function (req, res) {
  var key = [req.params.zoom, req.params.x, req.params.y].join('/');

  if (cache[key]) return res.json(cache[key]);

  var url = 'http://vector.mapzen.com/osm/earth,water,roads,buildings,transit/' + key + '.json?api_key=vector-tiles-ZAjmKEM';
  // var url = 'http://vector.mapzen.com/osm/earth,water/' + key + '.json?api_key=vector-tiles-ZAjmKEM';
  request(url, function (err, response, body) {
    var body = JSON.parse(body);

    Object.keys(body).forEach(function (key) {
      for (var i=0; i<body[key].features.length; i++) {
        delete body[key].features[i].properties;
      }
    });

    cache[key] = body;
    res.json(body);
  });
});



var port = +process.argv[2] || 3000;
server.listen(port, function() {

  var host = server.address().address;
  var port = server.address().port;

  console.log('map listening at http://%s:%s', host, port);

});
