/*///////////////////////////////// ABOUT \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\

Info Dialog

Display a general information dialog.
You can use markdown in the dialog text.


\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * /////////////////////////////////////*/

/// LIBRARIES /////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
import React from 'react';
import PropTypes from 'prop-types';
// import MDReactComponent from 'markdown-react-js';
import MDReactComponent from 'react-markdown'
// Material UI Components
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
// Material UI Icons
import CloseIcon from '@mui/icons-material/Close';
// Material UI Theming
import { styled } from "@mui/system";

/// COMPONENTS ////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
import MEMEStyles from './MEMEStyles';
import UR from '../../system/ursys';
import ADM from '../modules/data';
import DEFAULTS from '../modules/defaults';
import UTILS from '../modules/utils';
import CriteriaList from '../views/ViewAdmin/components/AdmCriteriaList';
import DATAMAP from '../../system/common-datamap';

/// CONSTANTS /////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const DBG = false;
const PKG = 'HelpView:';

/// CLASS DECLARATION /////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

class InfoDialog extends React.Component {
  constructor(props) {
    super();
    this.DoOpen = this.DoOpen.bind(this);
    this.DoClose = this.DoClose.bind(this);

    const component = UTILS.InitialCaps(DATAMAP.PMC_MODELTYPES.COMPONENT.label);
    const mechanism = UTILS.InitialCaps(DATAMAP.PMC_MODELTYPES.MECHANISM.label);
    const outcome = UTILS.InitialCaps(DATAMAP.PMC_MODELTYPES.OUTCOME.label);

    this.state = {
      isOpen: false,
      infoText: ``,
    };

    UR.Subscribe('DIALOG_OPEN', this.DoOpen);
  }

  componentDidMount() {}

  componentWillUnmount() {
    UR.Unsubscribe('DIALOG_OPEN', this.DoOpen);
  }

  DoOpen(data) {
    this.setState({
      isOpen: true,
      infoText: data.text,
    });
  }

  DoClose() {
    this.setState({ isOpen: false });
  }

  render() {
    const { isOpen, infoText } = this.state;
    const { classes } = this.props;
    return (
      <>
        {isOpen && (
          <Dialog className={classes.infoDialog} open>
            <DialogContent>
              {/* <MDReactComponent text={infoText} /> */}
              <MDReactComponent skipHtml>{infoText}</MDReactComponent>
            </DialogContent>
            <DialogActions>
              <Button color="primary" variant="contained" onClick={this.DoClose}>
                Close
              </Button>
            </DialogActions>
          </Dialog>
        )}
      </>
    );
  }
}

InfoDialog.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  classes: PropTypes.object,
};

InfoDialog.defaultProps = {
  classes: {},
};

/// EXPORT REACT COMPONENT ////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
export default styled(MEMEStyles)(InfoDialog);
