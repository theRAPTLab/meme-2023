import React from 'react';
import PropTypes from 'prop-types';
import Canvas from '../components/Canvas';
import D3SVG from '../components/D3SVG';
import CytosView from '../components/CytoView';
import SVG from '../components/SVG';
import DB from './models/prototype.model';

class RoutedView extends React.Component {
  constructor(props) {
    super(props);
    this.cstrName = this.constructor.name;
    this.routedComponent = React.createRef();
  }

  render() {
    let { mode } = this.props.match.params;
    console.log('render.width,height', this.props.viewWidth, this.props.viewHeight);
    if (mode === undefined) mode = 'cyto';
    switch (mode) {
      case 'svg':
        return <SVG DB={DB} {...this.props} />;
      case 'd3':
        return <D3SVG DB={DB} {...this.props} />;
      case 'canvas':
        return <Canvas DB={DB} {...this.props} />;
      case 'cyto':
      case undefined:
        return <CytosView DB={DB} {...this.props} />;
      default:
        return <div>unrecognized display mode:{mode}</div>;
    }
  }
}
RoutedView.propTypes = {
  match: PropTypes.shape({ params: PropTypes.shape({ mode: PropTypes.string }) }),
  viewHeight: PropTypes.number
};
RoutedView.defaultProps = {
  match: { params: '' },
  viewHeight: 0
};

export default RoutedView;
