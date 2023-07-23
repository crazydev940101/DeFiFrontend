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
import React, { useState, useEffect, useCallback } from "react";
import { Route, Switch, Redirect, useLocation } from "react-router-dom";
import { connect, useDispatch } from 'react-redux';
import { useAlert } from "react-alert";
// javascript plugin used to create scrollbars on windows
import PerfectScrollbar from "perfect-scrollbar";
// react plugin for creating notifications over the dashboard
import NotificationAlert from "react-notification-alert";
// core components
import AdminNavbar from "../../components/Navbars/AdminNavbar.js";
import Footer from "../../components/Footer/Footer.js";
import Sidebar from "../../components/Sidebar/Sidebar.js";
import FixedPlugin from "../../components/FixedPlugin/FixedPlugin.js";
import routes from "../../routes.js";
import logo from "../../assets/img/react-logo.png";
import './admin.css';
import { alertShow, reduceString } from "../../variables/variable";
import { SocketContext } from "../../views/socket/SocketContext.js";
import { setNewAutoTokenData, setNewPairData, setNewFollowTokenData } from "../../store/actions/socket.action.js";
var ps;

const Admin = (props) => {
  const [activeColor, setActiveColor] = React.useState("blue");
  const [sidebarMini, setSidebarMini] = React.useState(true);
  const [opacity, setOpacity] = React.useState(0);
  const [sidebarOpened, setSidebarOpened] = React.useState(false);
  const mainPanelRef = React.useRef(null);
  const notificationAlertRef = React.useRef(null);
  const location = useLocation();
  const sideBar = routes.filter(router => router.name !== "Trader Transaction History" && router.name !== "Compair Token");
  const alert = useAlert();

  const socket = React.useContext(SocketContext).socket;
  const dispatch = useDispatch();
  React.useEffect(() => {
    document.documentElement.scrollTop = 0;
    document.scrollingElement.scrollTop = 0;
    if (mainPanelRef.current) {
      mainPanelRef.current.scrollTop = 0;
    }
  }, [location]);


  /*****************  socket part ********************/

  const newPairCallback = useCallback(data => {
    if (data) {
      alert.show(alertShow(data.name, data.totalsupply, 'logs'));
      dispatch(setNewPairData(data));
    }
  })
  const newTokenFollowCallback = useCallback(data => {
    if (data.newToken) {
      alert.show(alertShow(data.newToken.follow_id, data.newToken.token_id, 'follow'));
    }
    dispatch(setNewFollowTokenData(data));
    const parentElement = document.querySelector('.flex-element');
    const childElement = parentElement.querySelector('.socket-message');
    if (data.newTokenCount > 0 && childElement) {
      childElement.style.display = 'block';
      childElement.innerText = data.newTokenCount;
    } else if (data.newTokenCount <= 0 && childElement) {
      childElement.style.display = 'none';
    }
  })
  const newTokenAutoCallback = useCallback(data => {
    if (data) {
      alert.show(alertShow('data.name', 'data.totalsupply', 'auto'));
      dispatch(setNewAutoTokenData(data));
    }
  })
  React.useEffect(() => {
    async function getNewCount() {
      try {
        const payLoad = {
          user_id: props.credential.loginUserName,
        };
        const response = await ApiCall(
          apiConfig.get_new_count.url,
          apiConfig.get_new_count.method,
          props.credential.loginToken,
          payLoad
        );
        if (response.data) {
          // console.log(response);
        }
      } catch (error) {
      }
    }
    getNewCount();
  }, []);

  /*****************  socket part ********************/

  React.useEffect(() => {
    if (socket) {
      socket.on("connect_error", (error) => {
        console.error("WebSocket connection error:", error);
        // Handle the error, e.g., display an error message to the user
      });
      socket.on("logs:one:newPair", newPairCallback);
      socket.on("follows:newToken", newTokenFollowCallback);
      socket.on("token:newToken", newTokenAutoCallback);
      return () => {
        if (socket) {
          socket.off("logs:one:newPair", newPairCallback);
          socket.off("follows:newToken", newTokenFollowCallback);
          socket.off("token:newToken", newTokenAutoCallback);
        }
      };
    }
  }, [socket]);

  React.useEffect(() => {
    let innerMainPanelRef = mainPanelRef;
    if (navigator.platform.indexOf("Win") > -1) {
      document.documentElement.classList.add("perfect-scrollbar-on");
      document.documentElement.classList.remove("perfect-scrollbar-off");
      ps = new PerfectScrollbar(mainPanelRef.current);
      mainPanelRef.current &&
        mainPanelRef.current.addEventListener("ps-scroll-y", showNavbarButton);
      let tables = document.querySelectorAll(".table-responsive");
      for (let i = 0; i < tables.length; i++) {
        ps = new PerfectScrollbar(tables[i]);
      }
    }
    window.addEventListener("scroll", showNavbarButton);
    return function cleanup() {
      if (navigator.platform.indexOf("Win") > -1) {
        ps.destroy();
        document.documentElement.classList.add("perfect-scrollbar-off");
        document.documentElement.classList.remove("perfect-scrollbar-on");
        innerMainPanelRef.current &&
          innerMainPanelRef.current.removeEventListener(
            "ps-scroll-y",
            showNavbarButton
          );
      }
      window.removeEventListener("scroll", showNavbarButton);
    };
  }, []);
  const showNavbarButton = () => {
    if (
      document.documentElement.scrollTop > 50 ||
      document.scrollingElement.scrollTop > 50 ||
      (mainPanelRef.current && mainPanelRef.current.scrollTop > 50)
    ) {
      setOpacity(1);
    } else if (
      document.documentElement.scrollTop <= 50 ||
      document.scrollingElement.scrollTop <= 50 ||
      (mainPanelRef.current && mainPanelRef.current.scrollTop <= 50)
    ) {
      setOpacity(0);
    }
  };
  const getRoutes = (routes) => {
    return routes.map((prop, key) => {
      if (prop.collapse) {
        return getRoutes(prop.views);
      }
      if (prop.layout === "/bot") {
        return (
          <Route
            path={prop.layout + prop.path}
            component={prop.component}
            key={key}
          />
        );
      } else {
        return null;
      }
    });
  };
  const getActiveRoute = (routes) => {
    let activeRoute = "Bot management";
    for (let i = 0; i < routes.length; i++) {
      if (routes[i].collapse) {
        let collapseActiveRoute = getActiveRoute(routes[i].views);
        if (collapseActiveRoute !== activeRoute) {
          return collapseActiveRoute;
        }
      } else {
        if (
          window.location.pathname.indexOf(
            routes[i].layout + routes[i].path
          ) !== -1
        ) {
          return routes[i].name;
        }
      }
    }
    return activeRoute;
  };
  const handleActiveClick = (color) => {
    setActiveColor(color);
  };
  const handleMiniClick = () => {
    let notifyMessage = "Sidebar mini ";
    if (document.body.classList.contains("sidebar-mini")) {
      setSidebarMini(false);
      notifyMessage += "deactivated...";
    } else {
      setSidebarMini(true);
      notifyMessage += "activated...";
    }
    let options = {};
    options = {
      place: "tr",
      message: notifyMessage,
      type: "primary",
      icon: "tim-icons icon-bell-55",
      autoDismiss: 7,
    };
    if (notificationAlertRef.current) notificationAlertRef.current.notificationAlert(options);
    document.body.classList.toggle("sidebar-mini");
  };
  const toggleSidebar = () => {
    setSidebarOpened(!sidebarOpened);
    document.documentElement.classList.toggle("nav-open");
  };
  const closeSidebar = () => {
    setSidebarOpened(false);
    document.documentElement.classList.remove("nav-open");
  };




  return (
    <div className="wrapper">
      <div className="rna-container">
        <NotificationAlert ref={notificationAlertRef} />
      </div>
      <div className="navbar-minimize-fixed" style={{ opacity: opacity }}>
        <button
          className="minimize-sidebar btn btn-link btn-just-icon"
          onClick={handleMiniClick}
        >
          <i className="tim-icons icon-align-center visible-on-sidebar-regular text-muted" />
          <i className="tim-icons icon-bullet-list-67 visible-on-sidebar-mini text-muted" />
        </button>
      </div>
      <div className="flex-element">
        <Sidebar
          {...props}
          routes={sideBar}
          activeColor={activeColor}
          logo={{
            outterLink: "",
            text: "",
            imgSrc: logo,
          }}
          closeSidebar={closeSidebar}
        />
        <span className="socket-message" style={{ display: 'none' }}></span>
        <div className="main-panel" ref={mainPanelRef} data={activeColor}>
          <AdminNavbar
            {...props}
            handleMiniClick={handleMiniClick}
            brandText={getActiveRoute(routes)}
            sidebarOpened={sidebarOpened}
            toggleSidebar={toggleSidebar}
          />
          <Switch>
            {getRoutes(routes)}
            <Redirect from="*" to="/bot/wallet" />
          </Switch>
          {
            // we don't want the Footer to be rendered on full screen maps page
            props.location.pathname.indexOf("full-screen-map") !== -1 ? null : (
              <Footer fluid />
            )
          }
        </div>
      </div>
      {/* <FixedPlugin
        activeColor={activeColor}
        sidebarMini={sidebarMini}
        handleActiveClick={handleActiveClick}
        handleMiniClick={handleMiniClick}
      /> */}
    </div>
  );
};


const mapStateToProps = (state) => {
  const { LoginReducer } = state;
  return { credential: LoginReducer };
};

export default connect(mapStateToProps)(Admin);
