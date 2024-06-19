/*///////////////////////////////// ABOUT \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\

Resource Item Title Card

Collapsible display that shows:
- Reference Number
- Reference Title
- Reference Notes
- Type of resource (pdf, report, etc)
- Number of Links
- Collapse/Expand Arrow

Props
- resource
- isAlwaysExpanded (boolean) -- if true, the card will always be expanded
                                Used to hide the expand arrow when
                                expansion is not necessary in the
                                EVResourceItemDialog view.
- onExpand (function) -- callback for when the expand arrow is clicked

\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * /////////////////////////////////////*/

/// LIBRARIES /////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
import React from 'react';
import './MEMEStyles.css';
import './EVResourceItemTitleBar.css';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faImage } from '@fortawesome/free-solid-svg-icons';
import { faFileLines } from '@fortawesome/free-solid-svg-icons';
import { faLightbulb } from '@fortawesome/free-solid-svg-icons';
import { faCircleQuestion } from '@fortawesome/free-solid-svg-icons';
const ImageIcon = <FontAwesomeIcon icon={faImage} />;
const DescriptionIcon = <FontAwesomeIcon icon={faFileLines} />;
const IdeaIcon = <FontAwesomeIcon icon={faLightbulb} />;
const ContactSupportIcon = <FontAwesomeIcon icon={faCircleQuestion} />;
const RESOURCE_TYPES = {
  simulation: ImageIcon,
  assumption: IdeaIcon,
  idea: IdeaIcon,
  report: DescriptionIcon,
  question: ContactSupportIcon,
  other: DescriptionIcon
};

/// COMPONENTS ////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
import DATA from '../modules/data';
import ICNCountBadge from './ICNCountBadge';
import ICNExpandSingleArrow from './ICNExpandSingleArrow';

/// CLASS DECLARATION /////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

class EVResourceItemTitleBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isExpanded: true
    };

    this.evt_OnExpand = this.evt_OnExpand.bind(this);
  }

  evt_OnExpand(event) {
    event.stopPropagation();
    event.preventDefault();
    const { isExpanded } = this.state;
    const { onExpand } = this.props;
    onExpand();
    this.setState({ isExpanded: !isExpanded });
  }

  render() {
    const { isExpanded } = this.state;
    const { resource, isAlwaysExpanded, onExpand } = this.props;
    const linksCount = DATA.GetEvLinksCountByResourceId(resource.id);
    return (
      <div className="EVResourceItemTitleBar">
        <ICNCountBadge count={resource.referenceLabel} size="large" type="ev-dark" />
        <div>
          <div className="label">{resource.label}</div>
          <div className="notes">{resource.notes}</div>
        </div>
        <div className="widgets">
          {!isExpanded && <ICNCountBadge count={linksCount} size="tiny" />}
          <div className="type-icon" title={resource.type}>
            {RESOURCE_TYPES[resource.type]
              ? RESOURCE_TYPES[resource.type]
              : RESOURCE_TYPES.other}
          </div>
          {!isAlwaysExpanded && (
            <div onClick={this.evt_OnExpand}>
              <ICNExpandSingleArrow expanded={isExpanded} />
            </div>
          )}
        </div>
      </div>
    );
  }
}

/// EXPORT REACT COMPONENT ////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
export default EVResourceItemTitleBar;
