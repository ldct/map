
var Map = React.createClass({

  getInitialState: function () {
    return {
      dragging: false,
      offset: {
        x: 0,
        y: 0
      }
    }
  },

  onMouseDown: function (e) {
    if (e.button !== 0) return;

    e.stopPropagation()
    e.preventDefault()

    this.setState({
      dragging: true,
      mouse_start: {
        x: e.pageX,
        y: e.pageY
      }
    });

    document.addEventListener('mousemove', this.onMouseMove)
    document.addEventListener('mouseup', this.onMouseUp)

  },
  onMouseUp: function (e) {
    this.setState({dragging: false})

    e.stopPropagation()
    e.preventDefault()

    this.setState({
      offset: {
        x: this.state.offset.x + e.pageX - this.state.mouse_start.x,
        y: this.state.offset.y + e.pageY - this.state.mouse_start.y,
      }
    });

    document.removeEventListener('mousemove', this.onMouseMove)
    document.removeEventListener('mouseup', this.onMouseUp)

  },
  onMouseMove: function (e) {
    if (!this.state.dragging) return;
    var new_offset = {
      x: this.state.offset.x + e.pageX - this.state.mouse_start.x,
      y: this.state.offset.y + e.pageY - this.state.mouse_start.y,
    }

    var new_transform = "translate(" + new_offset.x + " " + new_offset.y + ")"
    $(React.findDOMNode(this)).children().attr('transform', new_transform);

    e.stopPropagation()
    e.preventDefault()
  },

  shouldComponentUpdate: function () {
    return false;
  },


  render: function() {
    var self = this;
    return (
      <svg onMouseDown={this.onMouseDown} style={{border: '1px solid pink'}} width={self.props.bounds.map_width} height={self.props.bounds.map_height}>

        <g transform={"translate(" + self.state.offset.x + " " + self.state.offset.y + ")"}>

        {self.props.geojsons.map(function (geojson) {
          return (
            <g>
              <FeatureCollection data={geojson.earth} bounds={self.props.bounds} fill="#F1EEDF" />
              <FeatureCollection data={geojson.water} bounds={self.props.bounds} fill="#6E9197" />
              <FeatureCollection data={geojson.roads} bounds={self.props.bounds} stroke="rgba(0, 0, 0, 0.05)" />
              <FeatureCollection data={geojson.buildings} bounds={self.props.bounds} fill="#EAE5D5" stroke="#BBB7A9"/>
              <FeatureCollection data={geojson.transit} bounds={self.props.bounds} fill="purple" stroke="purple"/>
            </g>
          )
        })}

        </g>

      </svg>
    );
  }

});