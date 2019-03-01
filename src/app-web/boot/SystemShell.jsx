/*///////////////////////////////// ABOUT \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\

  SystemShell - React App Container

  Loaded by SystemInit which wraps a HashRouter around it

\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * /////////////////////////////////////*/

/// LIBRARIES /////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
import React from 'react';
import { Switch, Route } from 'react-router-dom';

/// SYSTEM ROUTES /////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
import SystemRoutes from './SystemRoutes';

/// DEBUG CONTROL /////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const DBG = true;

/// CLASS DECLARATION /////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
class SystemShell extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidMount() {
    console.log(`<${this.constructor.name}> mounted`);
  }

  render() {
    // omg an error???
    if (this.state.hasError) {
      return (
        <div>
          <div className={classes.toolbar} />
          <p>Error in {`${this.constructor.name}`} (see console)</p>
        </div>
      );
    }
    // otherwise return component with matching routed view
    return (
      <Switch>
        {SystemRoutes.map(route => (
          <Route key={route.path} path={route.path} component={route.component} />
        ))}
      </Switch>
    );
  }
}

/// EXPORT REACT CLASS ////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
export default SystemShell;
