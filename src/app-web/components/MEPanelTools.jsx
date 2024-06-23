/*///////////////////////////////// ABOUT \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\

  MEPanelTools - Left sidebar in Main Application View

\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * /////////////////////////////////////*/

/// LIBRARIES /////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
import React from 'react';
import './MEMEStyles.css';
import './MEPanelTools.css';

import PropTypes from 'prop-types';

import ICNExpandDoubleArrow from './ICNExpandDoubleArrow';
import WDisclosure from './WDisclosure';

/// COMPONENTS ////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// MEME Modules and Utils
import UR from '../../system/ursys';
import DEFAULTS from '../modules/defaults';
import DATA from '../modules/data';
import ADM from '../modules/data';
import DATAMAP from '../../system/common-datamap';

const { COLOR, CoerceToEdgeObj } = DEFAULTS;

/// CONSTANTS /////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const DBG = false;
const PKG = 'MEPanelTools:';

/// CLASS DECLARATION /////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
class MEPanelTools extends React.Component {
  // constructor
  constructor(props) {
    super(props);

    this.DoPropHoverStart = this.DoPropHoverStart.bind(this);
    this.DoPropHoverEnd = this.DoPropHoverEnd.bind(this);
    this.DoMechHoverStart = this.DoMechHoverStart.bind(this);
    this.DoMechHoverEnd = this.DoMechHoverEnd.bind(this);
    this.DoSelectionChange = this.DoSelectionChange.bind(this);
    this.OnOutcomeAdd = this.OnOutcomeAdd.bind(this);
    this.OnComponentAdd = this.OnComponentAdd.bind(this);
    this.OnMechAdd = this.OnMechAdd.bind(this);
    this.RenderComponentsList = this.RenderComponentsList.bind(this);
    this.RenderComponentsListItem = this.RenderComponentsListItem.bind(this);
    this.RenderMechanismsList = this.RenderMechanismsList.bind(this);

    this.state = {
      selectedPropId: '',
      selectedMechId: '', // edgeObj e.g. {w,v}
      hoveredPropId: '',
      hoveredMechId: '' // edgeObj e.g. {w,v}
    };

    UR.Subscribe('SELECTION_CHANGED', this.DoSelectionChange);
    UR.Subscribe('PROP_HOVER_START', this.DoPropHoverStart);
    UR.Subscribe('PROP_HOVER_END', this.DoPropHoverEnd);
    UR.Subscribe('MECH_HOVER_START', this.DoMechHoverStart);
    UR.Subscribe('MECH_HOVER_END', this.DoMechHoverEnd);
  }

  componentDidMount() {}

  componentWillUnmount() {
    UR.Unsubscribe('SELECTION_CHANGED', this.DoSelectionChange);
    UR.Unsubscribe('PROP_HOVER_START', this.DoPropHoverStart);
    UR.Unsubscribe('PROP_HOVER_END', this.DoPropHoverEnd);
    UR.Unsubscribe('MECH_HOVER_START', this.DoMechHoverStart);
    UR.Unsubscribe('MECH_HOVER_END', this.DoMechHoverEnd);
  }

  DoPropHoverStart(data) {
    this.setState({ hoveredPropId: data.propId });
  }

  DoPropHoverEnd(data) {
    this.setState({ hoveredPropId: '' });
  }

  /**
   *
   * @param {*} data - Contains a `mechId` EdgeObject, e.g. {mechId: {w, v}}
   */
  DoMechHoverStart(data) {
    let hoveredMechId = data.mechId;
    this.setState({ hoveredMechId });
  }

  DoMechHoverEnd(data) {
    this.setState({ hoveredMechId: '' });
  }

  DoSelectionChange() {
    let selectedPropId = '';
    let selectedMechId = {};
    let selectedPropIds = DATA.VM_SelectedPropsIds();
    // only show the first selected prop
    if (selectedPropIds.length > 0) {
      selectedPropId = selectedPropIds[0];
    }

    // Only select the first one
    let selectedMechIds = DATA.VM_SelectedMechIds();
    if (selectedMechIds.length > 0) {
      selectedMechId = CoerceToEdgeObj(selectedMechIds[0]);
    }
    this.setState({
      selectedPropId,
      selectedMechId
    });
  }

  // User clicked on "(+) Add Outcome" drawer button
  OnOutcomeAdd() {
    UR.Publish('OUTCOME_ADD');
  }

  // User clicked on "(+) Add Component" drawer button
  OnComponentAdd() {
    UR.Publish('PROP_ADD');
  }

  // User clicked on "(+) Add Mechanism" drawer button
  OnMechAdd() {
    UR.Publish('MECH_ADD');
  }

  OnPropClick(e, propId) {
    e.preventDefault();
    e.stopPropagation();
    this.setState({
      selectedPropId: propId,
      selectedMechId: ''
    });
    const vprop = DATA.VM_VProp(propId);
    DATA.VM_DeselectAll();
    DATA.VM_SelectProp(vprop);
  }

  OnMechClick(e, mechId) {
    e.preventDefault();
    e.stopPropagation();
    this.setState({
      selectedPropId: '',
      selectedMechId: mechId
    });
    const vmech = DATA.VM_VMech(mechId);
    DATA.VM_DeselectAll();
    DATA.VM_SelectOneMech(vmech);
  }

  RenderComponentsList(propIds, filterByPropType) {
    let relevantProps = propIds.filter(id => {
      const prop = DATA.Prop(id);
      if (filterByPropType === DATAMAP.PMC_MODELTYPES.COMPONENT.id) {
        return (
          prop.propType === DATAMAP.PMC_MODELTYPES.COMPONENT.id ||
          prop.propType === undefined
        ); // for backward compatibility
        // project data that predated propTypes assumed all props were components
      } else {
        return prop.propType === filterByPropType;
      }
    });
    return relevantProps.map(propId => {
      return this.RenderComponentsListItem(propId);
    });
  }

  // This supports recursive calls to handle nested components.
  RenderComponentsListItem(propId, isSub = false) {
    const { selectedPropId, hoveredPropId } = this.state;
    const { theme: classes } = this.props;
    const prop = DATA.Prop(propId);
    if (prop === undefined) {
      // Catch error if a component has not been correctly deleted, so a mech
      // is left with a stray propId.
      console.error(
        'ToolsPanel.RenderComponentsListItem skipping missing propId',
        propId
      );
      return '';
    }
    const children = DATA.Children(propId);

    const cssSub = isSub ? 'subItem' : '';
    const cssClr =
      prop.propType === DATAMAP.PMC_MODELTYPES.OUTCOME.id
        ? 'clr-item-outcome'
        : 'clr-item-entity';
    const cssSelected = selectedPropId === propId ? 'selected' : '';
    const cssHovered = hoveredPropId === propId ? 'hovered' : '';
    const cssClasses = `${cssSub} ${cssClr} ${cssSelected} ${cssHovered}`;

    return (
      <div
        key={propId}
        className={cssClasses}
        onClick={e => this.OnPropClick(e, propId)}
        onMouseEnter={e => {
          e.stopPropagation();
          UR.Publish('PROP_HOVER_START', { propId: propId });
        }}
        onMouseLeave={e => {
          e.stopPropagation();
          UR.Publish('PROP_HOVER_END', { propId: propId });
        }}
      >
        {prop.name}
        {children.length > 0
          ? children.map(childId => this.RenderComponentsListItem(childId, true))
          : ''}
      </div>
    );
  }

  RenderMechanismsList(mechIds) {
    const { selectedMechId, hoveredMechId } = this.state;
    const { theme: classes } = this.props;
    let i = 0;
    return mechIds.map(mechId => {
      const mech = DATA.Mech(mechId);
      const sourceObj = DATA.Prop(mechId.v);
      const targetObj = DATA.Prop(mechId.w);
      // protect against corrupt data
      const source = sourceObj ? sourceObj.name : 'missing prop';
      const sourceType = sourceObj ? sourceObj.propType : 'missing prop';
      const target = targetObj ? targetObj.name : 'missing prop';
      const targetType = sourceObj ? targetObj.propType : 'missing prop';
      i++;

      const cssSelected =
        selectedMechId.v === mechId.v && selectedMechId.w === mechId.w
          ? 'selected'
          : '';
      const cssHovered =
        hoveredMechId.v === mechId.v && hoveredMechId.w === mechId.w ? 'hovered' : '';
      const cssClasses = `item clr-item-mech ${cssSelected} ${cssHovered}`;

      return (
        <div
          key={`mech${i}`}
          className={cssClasses}
          onClick={e => this.OnMechClick(e, mechId)}
          onMouseEnter={e => {
            e.stopPropagation();
            UR.Publish('MECH_HOVER_START', { mechId: mechId });
            this.setState({ hoveredMechId: mechId });
          }}
          onMouseLeave={e => {
            e.stopPropagation();
            UR.Publish('MECH_HOVER_END', { mechId: mechId });
          }}
        >
          <span
            className={
              sourceType === DATAMAP.PMC_MODELTYPES.OUTCOME.id
                ? 'clr-item-outcome'
                : 'clr-item-entity'
            }
          >
            {source}{' '}
          </span>
          {mech.name}
          <span
            className={
              targetType === DATAMAP.PMC_MODELTYPES.OUTCOME.id
                ? 'clr-item-outcome'
                : 'clr-item-entity'
            }
          >
            {' '}
            {target}
          </span>
        </div>
      );
    });
  }

  render() {
    const { classes, isDisabled, toggleOpen } = this.props;

    const outcomesList = this.RenderComponentsList(
      DATA.Components(),
      DATAMAP.PMC_MODELTYPES.OUTCOME.id
    );
    const componentsList = this.RenderComponentsList(
      DATA.Components(),
      DATAMAP.PMC_MODELTYPES.COMPONENT.id
    );
    const mechanismsList = this.RenderMechanismsList(DATA.AllMechs());

    const isViewOnly = ADM.IsViewOnly();

    const ENTITIESPANEL = (
      <div className="entitiesPanel">
        <WDisclosure
          title={DATAMAP.PMC_MODELTYPES.COMPONENT.plural}
          items={componentsList}
        />
        <button
          onClick={this.OnComponentAdd}
          disabled={isDisabled}
          hidden={isViewOnly}
        >
          Add {DATAMAP.PMC_MODELTYPES.COMPONENT.label}
        </button>
      </div>
    );

    const PROCESSESPANEL = (
      <div className="processesPanel">
        <WDisclosure
          title={DATAMAP.PMC_MODELTYPES.MECHANISM.plural}
          items={mechanismsList}
        />
        <button onClick={this.OnMechAdd} disabled={isDisabled} hidden={isViewOnly}>
          Add {DATAMAP.PMC_MODELTYPES.MECHANISM.label}
        </button>
      </div>
    );

    const OUTCOMESPANEL = (
      <div className="outcomesPanel">
        <WDisclosure
          title={DATAMAP.PMC_MODELTYPES.OUTCOME.plural}
          items={outcomesList}
        />
        <button onClick={this.OnOutcomeAdd} disabled={isDisabled} hidden={isViewOnly}>
          Add {DATAMAP.PMC_MODELTYPES.OUTCOME.label}
        </button>
      </div>
    );

    return (
      <div className="MEPanelTools">
        <div className="appbar">
          <button onClick={toggleOpen}>
            <ICNExpandDoubleArrow direction="left" />
          </button>
          Elements
        </div>
        <div className="list">
          {ENTITIESPANEL}
          {PROCESSESPANEL}
          {OUTCOMESPANEL}
        </div>
      </div>
    );
  }
}
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/// default props are expect properties that we expect
/// and are declared for validation
MEPanelTools.defaultProps = {
  classes: {},
  theme: {},
  isDisabled: false
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/// propTypes are declared. Note "vague" propstypes are
/// disallowed by eslint, so use shape({prop: ProtType })
/// to describe them in more detail
MEPanelTools.propTypes = {
  classes: PropTypes.shape({}),
  isDisabled: PropTypes.bool
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/// requirement for UR MODULES and COMPONENTS
MEPanelTools.MOD_ID = __dirname;

/// EXPORT REACT COMPONENT ////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/// include MaterialUI styles
export default MEPanelTools;
