/*//////////////////////////////// NOTES \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\

\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * //////////////////////////////////////*/

/// LIBRARIES /////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const React = require('react');
const D3 = require('d3');

/// CLASS DECLARATION /////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
class D3SVG extends React.Component {
  constructor(props) {
    super(props);
    this.fileName = '/static/sample-dsv.csv';
    this.d3data = {};
    this.refContainer = React.createRef();
    this.d3svg = null;
    //
    this.sim = null;
    this.handleData = this.handleData.bind(this);
  }

  componentDidMount() {
    // save reference elements
    this.d3svg = D3.select(this.refContainer.current).append('svg');
    // figure out how big to make the SVG full screen
    const nav = document.getElementById('nav');
    this.width = window.innerWidth;
    this.height = window.innerHeight - nav.offsetHeight;
    this.d3svg.style('width', this.width);
    this.d3svg.style('height', this.height);
    // set viewbox mode
    this.d3svg.attr('preserveAspectRatio', 'xMaxYMax');
    this.d3svg.attr(
      'viewBox',
      `${this.width / -2} ${this.height / -2} ${this.width} ${this.height}`
    );
    // load data
    LoadData(this.fileName, this.handleData);
  }

  shouldComponentUpdate() {
    // don't even check nextProps, nextState
    // just return false to prevent renders
    return false;
  }

  handleData(data) {
    this.d3data = data;
    // referred to by above
    console.log('D3DATA', this.d3data);

    // initial data binding
    const mult = 10;
    this.circles = this.d3svg.selectAll('circle').data(this.d3data);
    this.circles
      .enter()
      .append('circle')
      .attr('cx', datum => {
        return datum.cx * mult;
      })
      .attr('cy', datum => {
        return datum.cy * mult;
      })
      .attr('r', datum => {
        return datum.r;
      })
      .attr('fill', datum => {
        return datum.fill;
      });
  }

  render() {
    return (
      <div
        style={{
          display: 'flex',
          flexFlow: 'row nowrap',
          width: '100%',
          height: '100%'
        }}
        ref={this.refContainer}
      />
    );
  }
}

function LoadData(fileName, handler) {
  // csv(input,init,row)
  // input is the url
  // init are options passed to fetch (network protocol stuff)
  // row is a row processing function to conform datas
  D3.csv(fileName, f_conform).then(data => {
    handler(data);
  });
  //
  function f_conform(data) {
    const sizeDivisor = 100;
    const d = data;
    d.gdp = +d.gdp;
    d.size = +d.gdp / sizeDivisor;
    d.radius = d.size < 3 ? 3 : d.size;
    return d;
  } // f_conform
} // LoadData

/// EXPORT REACT COMPONENT ////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
module.exports = D3SVG;
