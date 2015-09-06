
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