/**
 *    Created by Dragonslayer 6/24/2023
 */

import React, { useEffect, lazy, Suspense } from "react";
import ReactDOM from "react-dom";
import storePersist from './store/store.jsx';
import { BrowserRouter, Route, Switch, Redirect } from "react-router-dom";
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/es/integration/react';
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { transitions, positions, types, Provider as AlertProvider } from 'react-alert';
import AlertTemplate from 'react-alert-template-oldschool-dark';
import ApiCall from "./shared/globalApiService";
import Actions from "./store/actions/index";
import apiConfig from "./shared/apiConfig";
import AuthLayout from './layouts/Auth/Auth.js';
import AdminLayout from './layouts/Admin/Admin.js';
import SocketProvider from "./views/socket/SocketProvider.js";
import 'react-notification-alert/dist/animate.css';
import './assets/css/nucleo-icons.css';
import './assets/scss/black-dashboard-pro-react.scss?v=1.2.0';
import 'react-confirm-alert/src/react-confirm-alert.css';
import './assets/demo/demo.css';

const mapStateToProps = (state) => ({
  credential: state.LoginReducer,
});

const PrivateRoute = withRouter(
  connect(mapStateToProps)((props) => {
    if (props.credential.loginToken && props.credential.expiresAt){
      return (
        <Route path="/bot" render={(props) => <AdminLayout {...props} />} />
      );
    }else{
      return (
        <Redirect to="/auth/login" />
      );
    }
  }));
global.ApiCall = ApiCall;
global.Actions = Actions;
global.apiConfig = apiConfig;

const options = {
  // you can also just use 'bottom center'
  position: positions.BOTTOM_RIGHT,
  timeout: 5000,
  offset: '30px',
  type: types.SUCCESS,
  // you can also just use 'scale'
  transition: transitions.FADE,
}

ReactDOM.render(

    <Provider store={storePersist.store}>
      <SocketProvider>
          <AlertProvider template={AlertTemplate} {...options}>
              <PersistGate persistor={storePersist.persistor}>
                <BrowserRouter>
                  <Switch>
                    <Route path="/auth" render={(props) => <AuthLayout {...props} />} />
                    <PrivateRoute path="/bot" />
                    {/* <Route path="/rtl" render={(props) => <RTLLayout {...props} />} /> */}
                    <Redirect from="/" to="/bot/pancake_one" />
                  </Switch>
                </BrowserRouter>
              </PersistGate>
            </AlertProvider>
        </SocketProvider>
    </Provider>,
  document.getElementById("root")
);
