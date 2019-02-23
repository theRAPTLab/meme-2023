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

  componentDidMount() {
    console.log(`<${this.constructor.name}> mounted`);
  }

  //
  static getDerivedStateFromError(error) {
    console.error(`${this.constructor.name} error`, error);
    return { hasError: true };
  }

  render() {
    /// return component with matching routed view
    if (this.state.hasError) return <p>Error in {`${this.constructor.name}`} (see console)</p>;
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
