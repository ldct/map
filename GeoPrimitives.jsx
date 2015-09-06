/** @jsx React.DOM */
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