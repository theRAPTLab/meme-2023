/*///////////////////////////////// ABOUT \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\

Ratings Dialog

\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * /////////////////////////////////////*/

/// LIBRARIES /////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
import { yellow, green, red } from '@material-ui/core/colors';
import React from 'react';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import SvgIcon from '@material-ui/core/SvgIcon';
// Material UI Icons
import PositiveIcon from '@material-ui/icons/Add';
import NegativeIcon from '@material-ui/icons/Clear';
// Material UI Theming
import { withStyles } from '@material-ui/core/styles';

/// COMPONENTS ////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
import MEMEStyles from './MEMEStyles';
import UR from '../../system/ursys';
import DATA from '../modules/pmc-data';
import ADM from '../modules/adm-data';

/// CONSTANTS /////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const DBG = false;
const PKG = 'RatingsDialog:';

/// CLASS DECLARATION /////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

class RatingsDialog extends React.Component {
  constructor(props) {
    super(props);
    this.DoOpen = this.DoOpen.bind(this);
    this.DoClose = this.DoClose.bind(this);
    this.OnClose = this.OnClose.bind(this);
    this.OnRatingSelect = this.OnRatingSelect.bind(this);

    this.state = {
      isOpen: false,
      evId: '',
      selectedRating: 0,
      ratingsDef: [
        { label: 'Really disagrees!', rating: -3 },
        { label: 'Kinda disagrees!', rating: -2 },
        { label: 'Disagrees a little', rating: -1 },
        { label: 'Not rated / Irrelevant', rating: 0 },
        { label: 'Weak support', rating: 1 },
        { label: 'Medium support', rating: 2 },
        { label: 'Rocks!!', rating: 3 }
      ]
    };

    UR.Sub('RATING:OPEN', this.DoOpen);
  }

  componentDidMount() { }

  componentWillUnmount() {
    UR.Unsub('SHOW_RESOURCE', this.OnOpen);
  }

  DoOpen(data) {
    if (DBG) console.log('Rating open',data.evId,data.rating);
    this.setState({ evId: data.evId, selectedRating: data.rating, isOpen: true });
  }

  DoClose() {
    this.setState({
      isOpen: false
    });
  }
  
  OnClose() {
    this.DoClose();
  }
  
  OnRatingSelect(e, rating) {
    DATA.SetEvidenceLinkRating(this.state.evId, rating);
    this.DoClose();
  }

  render() {
    const { isOpen, ratingsDef, selectedRating } = this.state;
    const { classes, OnRatingSelect } = this.props;
    
    // Predefine ratings icons
    const icons = {};
    ratingsDef.forEach(def => {
      const n = def.rating;
      let count = Math.abs(n);
      let result = [];
      for (let i = 0; i < count; i++) {
        if (n < 0) {
          result.push(<NegativeIcon className={classes.ratingIconNegative} key={i}/>);
        } else if (n > 0) {
          result.push(<PositiveIcon className={classes.ratingIconPositive} key={i}/>);
        } else {
          // leave blank
        }
      }
      icons[n] = result;
    });

    return (
      <Dialog open={isOpen} onClose={this.OnClose} maxWidth='xs'>
        <DialogTitle>How well does this resource support your model?</DialogTitle>
        <DialogContent>
        {ratingsDef.map(def => {
          return (<Button key={def.label} style={{ width: '300px' }}
            onClick={e => this.OnRatingSelect(e, def.rating)} 
            variant={selectedRating===def.rating ? 'outlined' : 'text'}
          >
            <div style={{ width: '100px' }}>{icons[def.rating]}</div>
            <div style={{ width: '200px', textAlign: 'left' }}>{def.label}</div>
          </Button>)
        })}
        </DialogContent>
      </Dialog>
    );
  }
}

RatingsDialog.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  classes: PropTypes.object
};

RatingsDialog.defaultProps = {
  classes: {}
};

/// EXPORT REACT COMPONENT ////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
export default withStyles(MEMEStyles)(RatingsDialog);
