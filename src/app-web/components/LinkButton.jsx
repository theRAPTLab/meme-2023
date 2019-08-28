/*///////////////////////////////// ABOUT \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\

LinkButton


\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * /////////////////////////////////////*/

/// LIBRARIES /////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
import React from 'react';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
// Material UI Icons
import CreateIcon from '@material-ui/icons/Create';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
// Material UI Theming
import { withStyles } from '@material-ui/core/styles';

/// COMPONENTS ////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
import MEMEStyles from './MEMEStyles';

/// CLASS DECLARATION /////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

class LinkButton extends React.Component {
  constructor(props) {
    super(props);
    this.OnClick = this.OnClick.bind(this);
  }

  componentDidMount() {}

  componentWillUnmount() {}

  OnClick(e) {
    e.preventDefault();
    e.stopPropagation();
    this.props.OnLinkButtonClick();
  }

  render() {
    const {
      sourceLabel,
      sourceType,
      listenForSourceSelection,
      isBeingEdited,
      isExpanded,
      classes
    } = this.props;
    let label;
    let icon;
    let evidenceLinkSelectButtonClass;

    if (listenForSourceSelection) {
      label = 'Click on Target...';
      icon = <ArrowBackIcon />;
      evidenceLinkSelectButtonClass = classes.evidenceLinkSourceAvatarWaiting;
    } else if (sourceLabel !== undefined) {
      label = sourceLabel;
      switch (sourceType) {
        case 'mech':
          evidenceLinkSelectButtonClass = classes.evidenceLinkSourceMechAvatarSelected;
          break;
        default:
        case 'prop':
          evidenceLinkSelectButtonClass = classes.evidenceLinkSourcePropAvatarSelected;
          break;
      }
    } else {
      if (isBeingEdited) {
        label = 'Set Target';
        icon = <CreateIcon />;
      } else {
        label = 'Target Not Set';
      }
      evidenceLinkSelectButtonClass = classes.evidenceLinkSelectButton;
    }

    return (
      <Button
        onClick={this.OnClick}
        className={evidenceLinkSelectButtonClass}
        disabled={!isBeingEdited || listenForSourceSelection}
        size={isExpanded ? 'large' : 'small'}
      >
        {icon}
        {label}
      </Button>
    );
  }
}

LinkButton.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  classes: PropTypes.object,
  sourceLabel: PropTypes.string,
  sourceType: PropTypes.string,
  listenForSourceSelection: PropTypes.bool,
  isBeingEdited: PropTypes.bool,
  isExpanded: PropTypes.bool,
  OnLinkButtonClick: PropTypes.func
};

LinkButton.defaultProps = {
  classes: {},
  sourceLabel: undefined,
  sourceType: undefined,
  listenForSourceSelection: false,
  isBeingEdited: false,
  isExpanded: false,
  OnLinkButtonClick: () => {
    console.error('Missing OnLinkButtonClick Handler!');
  }
};

/// EXPORT REACT COMPONENT ////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
export default withStyles(MEMEStyles)(LinkButton);
