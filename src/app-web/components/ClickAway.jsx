/*//////////////////////////////// ABOUT \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\

  ClickAway

  TO USE

    <ClickAway onClickAway={() => console.log('clicked awway!!!')}>
      <div>Hello World</div>
    </ClickAway>

  NOTE

    ClickAway can inadvertently disable clicks from other sources.  e.g.
    * Clicks from Template Node/Edge Type color selection

\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * //////////////////////////////////////*/

const React = require('react');

/// CONSTANTS & DECLARATIONS //////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const DBG = true;
const PR = 'ClickAway';

/// REACT COMPONENT ///////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
class ClickAway extends React.Component {
  constructor(props) {
    super(props);
    this.containerRef = React.createRef();
    this.handleClick = this.handleClick.bind(this);
    document.addEventListener('click', this.handleClick);
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.handleClick);
  }

  handleClick(event) {
    console.log('click');
    event.preventDefault();
    event.stopPropagation();
    const { onClickAway } = this.props;
    if (
      this.containerRef.current &&
      !this.containerRef.current.contains(event.target)
    ) {
      if (DBG) console.log('clicked away');
      onClickAway(event);
    } else if (DBG) console.log('clicked children');
  }

  render() {
    const { children } = this.props;
    return <div ref={this.containerRef}>{children}</div>;
  }
}

/// EXPORT REACT COMPONENT ////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
module.exports = ClickAway;
