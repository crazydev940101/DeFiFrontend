/*!

=========================================================
* Black Dashboard PRO React - v1.2.0
=========================================================

* Product Page: https://www.creative-tim.com/product/black-dashboard-pro-react
* Copyright 2020 Creative Tim (https://www.creative-tim.com)

* Coded by Creative Tim

=========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

*/
/*eslint-disable*/
// javascript plugin used to create scrollbars on windows
import PerfectScrollbar from "perfect-scrollbar";
import PropTypes from "prop-types";
import React from "react";
import { NavLink, useLocation } from "react-router-dom";
// reactstrap components
import { Collapse, Nav } from "reactstrap";


var ps;

const Sidebar = (props) => {
  // const [state, setState] = React.useState({});
  const [collapse, setCollapse] = React.useState([]);
  const [state, setState] = React.useState([]);
  const [toggle, setToggle] = React.useState(false);
  const sidebarRef = React.useRef(null);
  const location = useLocation();
  React.useEffect(() => {
    setState(getCollapseStates(props.routes));
  }, []);
  React.useEffect(() => {
    // if you are using a Windows Machine, the scrollbars will have a Mac look
    if (navigator.platform.indexOf("Win") > -1) {
      ps = new PerfectScrollbar(sidebarRef.current, {
        suppressScrollX: true,
        suppressScrollY: false,
      });
    }
    return function cleanup() {
      // we need to destroy the false scrollbar when we navigate
      // to a page that doesn't have this component rendered
      if (navigator.platform.indexOf("Win") > -1) {
        ps.destroy();
      }
    };
  });
  // this creates the intial state of this component based on the collapse routes
  // that it gets through props.routes
  const getCollapseStates = (routes) => {
    let initialState = [];
    routes.map((prop, key) => {
      if (prop.collapse) {
        initialState.push(false);
        initialState = [...initialState, ...getCollapseStates(prop.views)];
      }
      return null;
    });
    return initialState;
  };
  // this verifies if any of the collapses should be default opened on a rerender of this component
  // for example, on the refresh of the page,
  // while on the src/views/forms/RegularForms.js - route /admin/regular-forms
  const getCollapseInitialState = (routes) => {
    for (let i = 0; i < routes.length; i++) {
      if (routes[i].collapse && getCollapseInitialState(routes[i].views)) {
        return true;
      } else if (window.location.href.indexOf(routes[i].path) !== -1) {
        return true;
      }
    }
    return false;
  };

  const toggleCollapse = (index) => {
    let collapseCopy = [...collapse];
    collapseCopy[index] = !collapseCopy[index];
    setCollapse(collapseCopy);
  }
  // this function creates the links and collapses that appear in the sidebar (left menu)
  const createLinks = (routes) => {
    const { rtlActive } = props;
    return routes.map((prop, key) => {
      if (prop.redirect || prop.layout != "/bot") {
        return null;
      }
      if (prop.collapse) {
        const isOpen = state.includes(prop.state);
        const toggleItem = () => {
          if (isOpen) {
            setState(state.filter((item) => item !== prop.state));
          } else {
            setState([...state, prop.state]);
          }
        };
        return (
          <li
            className={getCollapseInitialState(prop.views) ? "active" : ""}
            key={key}
          >
            <a
              href="#pablo"
              data-toggle="collapse"
              aria-expanded={isOpen}
              onClick={(e) => {
                e.preventDefault();
                // toggleItem();
                toggleCollapse(key);
              }}
              key={key}
            >
              {prop.icon !== undefined ? (
                <>
                  <i className={prop.icon} />
                  <p>
                    {rtlActive ? prop.rtlName : prop.name}
                    <b className="caret" />
                  </p>
                </>
              ) : (
                <>
                  <span className="sidebar-mini-icon">
                    {rtlActive ? prop.rtlMini : prop.mini}
                  </span>
                  <span className="sidebar-normal">
                    {rtlActive ? prop.rtlName : prop.name}
                    <b className="caret" />
                  </span>
                </>
              )}
            </a>
            <Collapse isOpen={collapse[key]}>
              <ul className="nav">{createLinks(prop.views)}</ul>
            </Collapse>
          </li>
        );
      }
      return (
        <li className={activeRoute(prop.path)} key={key}>
          <NavLink
            to={prop.layout + prop.path}
            activeClassName=""
            onClick={props.closeSidebar}
          >
            {prop.name !== undefined && !prop.mini ? (
              <>
                <i className={prop.icon} />
                <p>{rtlActive ? prop.rtlName : prop.name}</p>
              </>
            ) : (
              <>
                {
                  toggle ? (
                    <>
                    <span className="sidebar-mini-icon">
                      {rtlActive ? prop.rtlMini : prop.mini}
                    </span>
                    <p>.</p>
                    </>
                  ) : (
                    <>
                    <span className="sidebar-mini-icon sidebar-mini-icon-white">
                      {rtlActive ? prop.rtlMini : prop.mini}
                    </span>
                    <p>
                      {rtlActive ? prop.rtlName : prop.name}
                    </p>
                    </>
                  )
                }
              </>
            )}
          </NavLink>
        </li>
      );
    });
  };
  // verifies if routeName is the one active (in browser input)
  const activeRoute = (routeName) => {
    return location.pathname === routeName ? "active" : "";
  };

  const toggleSidebar = (event, _toggle) => {
    event.preventDefault();
    const sidebar = document.querySelector('.sidebar');
    const arrowbtn = document.querySelector('.tim-arrow');
    sidebar.classList.toggle('hide');
    arrowbtn.classList.toggle('icon-minimal-right');
    setToggle(!_toggle);
  }

  const { activeColor, logo } = props;
  let logoImg = null;
  let logoText = null;
  if (logo !== undefined) {
    if (logo.outterLink !== undefined) {
      logoImg = (
        <>
          <a
            href={logo.outterLink}
            className="simple-text logo-mini"
            target="_blank"
            onClick={props.closeSidebar}
          >
            <div className="logo-img">
              <img src={logo.imgSrc} alt="react-logo" />
            </div>
          </a>
          <div style={{ padding: "12px" }}>
            <a href="javascript(0);" onClick={(event) => toggleSidebar(event, toggle)}>
              <i className="tim-arrow tim-icons icon-minimal-left" style={{ float: "right", borderStyle: "solid", borderWidth: "1px", borderRadius: "50%" }}></i>
            </a>
          </div>
        </>
      );
      logoText = (
        <a
          href={logo.outterLink}
          className="simple-text logo-normal"
          target="_blank"
          onClick={props.closeSidebar}
        >
          {logo.text}
        </a>
      );
    } else {
      logoImg = (
        <NavLink
          to={logo.innerLink}
          className="simple-text logo-mini"
          onClick={props.closeSidebar}
        >
          <div className="logo-img">
            <img src={logo.imgSrc} alt="react-logo" />
          </div>
        </NavLink>
      );
      logoText = (
        <NavLink
          to={logo.innerLink}
          className="simple-text logo-normal"
          onClick={props.closeSidebar}
        >
          {logo.text}
        </NavLink>
      );
    }
  }

  return (
    <div className="sidebar" data={activeColor}>
      <div className="sidebar-wrapper" ref={sidebarRef}>
        {logoImg !== null || logoText !== null ? (
          <div className="nav">
            {logoImg}
            {logoText}
          </div>
        ) : null}
        <Nav>{createLinks(props.routes)}</Nav>
      </div>
    </div>
  );
};

Sidebar.propTypes = {
  activeColor: PropTypes.oneOf(["primary", "blue", "green", "orange", "red"]),
  rtlActive: PropTypes.bool,
  routes: PropTypes.array.isRequired,
  logo: PropTypes.oneOfType([
    PropTypes.shape({
      innerLink: PropTypes.string.isRequired,
      imgSrc: PropTypes.string.isRequired,
      text: PropTypes.string.isRequired,
    }),
    PropTypes.shape({
      outterLink: PropTypes.string.isRequired,
      imgSrc: PropTypes.string.isRequired,
      text: PropTypes.string.isRequired,
    }),
  ]),
  // this is used on responsive to close the sidebar on route navigation
  closeSidebar: PropTypes.func,
};

export default Sidebar;
