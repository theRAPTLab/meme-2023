/*//////////////////////////////// NOTES \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\

The root of the SVG-based application!
should be a child of RoutedView

\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * //////////////////////////////////////*/

/// LIBRARIES /////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
import React from 'react';
import PropTypes from 'prop-types';
import '../modules/svgjs-plugin-draggable.js';
import '../modules/svgjs-plugin-panzoom.js';
import PMCView from '../modules/pmc-view';

import UR from '../../system/ursys';

import { cssreact, cssalert } from '../modules/console-styles';

const DBG = false;

/// CLASS DECLARATION /////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
class SVGView extends React.Component {
  //
  constructor(props) {
    super(props);
    this.displayName = this.constructor.name;
    this.refContainer = React.createRef();
    // bindings
    this.DoAppLoop = this.DoAppLoop.bind(this);
    this.DoPanZoomOut = this.DoPanZoomOut.bind(this);
    this.DoPanZoomSet = this.DoPanZoomSet.bind(this);
    this.DoPanZoomBBoxSet = this.DoPanZoomBBoxSet.bind(this);
    this.DoPanZoomReset = this.DoPanZoomReset.bind(this);
    // LIFECYCLE: Initialize DataGraph

    // Graph is now loaded by ADM.LoadModel.
    // DATA.LoadGraph();

    // Look for Data Updates
    UR.Subscribe('DATA_UPDATED', this.DoAppLoop);
    UR.Subscribe('SVG_PANZOOM_OUT', this.DoPanZoomOut);
    UR.Subscribe('SVG_PANZOOM_SET', this.DoPanZoomSet);
    UR.Subscribe('SVG_PANZOOMBBOX_SET', this.DoPanZoomBBoxSet);
    UR.Subscribe('SVG_PANZOOM_RESET', this.DoPanZoomReset);
  }

  componentDidMount() {
    // placeholder
    // LIFECYCLE: Initialize ViewGraph
    PMCView.InitializeViewgraph(this.refContainer.current);
    if (this.props.viewWidth && this.props.viewHeight) {
      this.DoAppLoop();
    } else if (DBG) console.log(`%ccomponentDidMount() skip draw`, cssalert);
  }

  componentDidUpdate(prevProps) {
    // placeholder to trap resizing
    let dimChanged = prevProps.viewWidth !== this.props.viewWidth;
    dimChanged = dimChanged || prevProps.viewHeight !== this.props.viewHeight;
    if (dimChanged) {
      if (DBG)
        console.log(
          `%ccomponentDidUpdate() winsize ${this.props.viewWidth}x${this.props.viewHeight}`,
          cssreact
        );
      this.DoAppLoop();
      // DEBUG WINDOW UPDATE
      // PMCView.DrawTestScene(this.props.viewWidth, this.props.viewHeight);
    }
  }

  componentWillUnmount() {
    UR.Unsubscribe('DATA_UPDATED', this.DoAppLoop);
    UR.Unsubscribe('SVG_PANZOOM_OUT', this.DoPanZoomOut);
    UR.Unsubscribe('SVG_PANZOOM_SET', this.DoPanZoomSet);
    UR.Unsubscribe('SVG_PANZOOMBBOX_SET', this.DoPanZoomBBoxSet);
    UR.Unsubscribe('SVG_PANZOOM_RESET', this.DoPanZoomReset);
  }

  DoPanZoomOut() {
    PMCView.PanZoomOut(this.props.viewWidth, this.props.viewHeight);
  }

  /**
   * Pans and zooms to the xy point to the center of the view
   * @param {Object} data
   * @param {number} data.x left position of vprop
   * @param {number} data.y top position of vprop
   * @param {number} data.z optional zoom
   */
  DoPanZoomSet(data) {
    const parms = {
      x: data.x || 100,
      y: data.y || 100,
      w: this.props.viewWidth,
      h: this.props.viewHeight,
      z: data.zoom || 1
    };
    PMCView.PanZoomSet(parms);
  }

  /**
   * Pans and zooms the bbox object to the center of the view
   * with a callback that returns the moved bounding box.
   * The callback is used to open a comment AFTER the parent
   * object has been panned and zoomed
   * @param {Object} data
   * @param {number} data.bbox.x
   * @param {number} data.bbox.y
   * @param {number} data.bbox.width
   * @param {number} data.bbox.height
   * @param {number} data.bbox.zoom
   * @param {number} data.cb
   */
  DoPanZoomBBoxSet(data) {
    const { bbox, cb } = data;
    const x = bbox.x + bbox.width / 2 - this.props.viewWidth / 2;
    const y = bbox.y + bbox.height / 2 - this.props.viewHeight / 2;
    const parms = {
      x,
      y,
      w: this.props.viewWidth,
      h: this.props.viewHeight,
      z: bbox.zoom || 1
    };
    PMCView.PanZoomSet(parms);
    if (cb && typeof cb === 'function') cb(PMCView.GetBBox());
  }

  DoPanZoomReset() {
    PMCView.PanZoomReset(this.props.viewWidth, this.props.viewHeight);
  }

  DoAppLoop() {
    // TEST DRAWING
    // PMCView.TestGroups();

    // LIFECYCLE: handle changes to underlying data and queued user inputs
    PMCView.SyncPropsFromGraphData();
    PMCView.SyncMechsFromGraphData();
    // LIFECYCLE: update critical lists, element states, data.
    // This is purely DATA related
    // PMCView.UpdateModel();

    // LIFECYCLE: Update the underlying viewmodel by setting modes
    // of all properties, which is used by the layout module
    PMCView.UpdateViewModel();

    // LIFECYCLE: Handle visual updates
    // (1) calls LayoutComponents() to spread 'em out
    PMCView.UpdateView();

    // NOTE: PMCData is restoring the view model (setting prop positions) on initial load after this!
  }

  render() {
    // NOTE: on first render
    // this.props.viewWidth and this.props.viewHeight will be 0
    // because SystemInit needs to complete its entire rendering process
    // for dimensions to begin valid
    if (DBG) {
      const css = this.props.viewWidth && this.props.viewHeight ? cssreact : cssalert;
      console.log(
        `%crender() called. winsize ${this.props.viewWidth}x${this.props.viewHeight}`,
        css
      );
    }
    // returns a root svg that is the PARENT of the SVGJS-created draw surface
    return (
      <svg
        id="modelSVG"
        ref={this.refContainer}
        width={this.props.viewWidth}
        height={this.props.viewHeight}
      />
    );
  }
}
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/// define the property types in detail
SVGView.propTypes = {
  viewWidth: PropTypes.number,
  viewHeight: PropTypes.number
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/// defaultProps are used to populate props if they aren't passed in
SVGView.defaultProps = {
  viewWidth: 300,
  viewHeight: 300
};

/// EXPORT REACT COMPONENT ////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
export default SVGView;
