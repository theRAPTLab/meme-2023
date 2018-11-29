const React = require('react');
const { Alert, Collapse } = require('reactstrap');
const { Navbar, NavbarToggler } = require('reactstrap');
const { NavbarBrand, Nav, NavItem, NavLink } = require('reactstrap');
const { UncontrolledDropdown, DropdownToggle } = require('reactstrap');
const { DropdownMenu, DropdownItem } = require('reactstrap');
const { BrowserRouter, HashRouter, withRouter } = require('react-router-dom');
// workaround name collision in ReactRouterNavLink with ReactStrap
const RRNavLink = require('react-router-dom').NavLink;
//
const { renderRoutes } = require('react-router-config');
//
const AppDefault = require('./AppDefault');

function NoMatch(props) {
  let hash = props.location.pathname.substring(1);
  return (
    <Alert color="warning">
      No Match for route <tt>#{hash}</tt>
    </Alert>
  );
}

const Routes = [
  {
    path: '/',
    exact: true,
    component: AppDefault
  },
  {
    path: '*',
    restricted: false,
    component: NoMatch
  }
];

class AppShell extends React.Component {
  constructor(props) {
    super(props);
    this.state = { isOpen: true, hasError: false };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  render() {
    /// return component with matching routed view
    if (this.state.hasError) return <p>ERROR IN APPSHELL.JSX (see console)</p>;

    return (
      <div style={{ display: 'flex', flexFlow: 'column nowrap', width: '100%', height: '100vh' }}>
        <Navbar fixed="top" light expand="md" style={{ backgroundColor: '#f0f0f0' }}>
          <NavbarBrand href="#">MEME BOIILERPLATE</NavbarBrand>
          <NavbarToggler onClick={this.toggle} />
          <Collapse isOpen={this.state.isOpen} navbar>
            {/*/ (1) add navigation links here /*/}
            <Nav className="ml-auto" navbar>
              <UncontrolledDropdown direction="right" nav>
                <DropdownToggle>Extras</DropdownToggle>
                <DropdownMenu>
                  <DropdownItem>
                    <NavLink to="/" tag={RRNavLink} replace>
                      Home
                    </NavLink>
                  </DropdownItem>
                </DropdownMenu>
              </UncontrolledDropdown>
            </Nav>
          </Collapse>
        </Navbar>
        <div style={{ height: '3.5em' }}>{/*/ add space underneath the fixed navbar /*/}</div>
        {renderRoutes(Routes)}
      </div>
    );
  } // render()
} // AppShell()

/// EXPORT ROUTE INFO /////////////////////////////////////////////////////////
AppShell.Routes = Routes;

/// EXPORT REACT CLASS ////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
module.exports = AppShell;
