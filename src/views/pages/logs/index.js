/**
 *  Updated by dragonslayer 7/5/2023
 */

import React, { useState, useRef } from "react";
import { connect } from "react-redux";
import NotificationAlert from "react-notification-alert";
import BackToTopButton from "../../../views/components/BackToTopButton.js";
import "./index.css"
import MainPanel from "./component/MainPanel.js";
import AddSniperPanel from "./component/AddSniperPanel.js";


const Logs = (props) => {
  const notificationAlertRef = useRef(null);
  const showNotify = (message, type) => {
    let options = {};
    options = {
      place: "bl",
      message: message,
      type: type,
      icon: "tim-icons icon-bell-55",
      autoDismiss: 2,
    };
    if (notificationAlertRef.current) notificationAlertRef.current.notificationAlert(options);
  };

  const [tokenDataToAdd, setTokenDataToAdd] = useState('');

  const getTokenDataFromMain = (data => {
    setTokenDataToAdd(data);
  })

  return (
    <>
      <div className="rna-container">
        <NotificationAlert ref={notificationAlertRef} />
      </div>
      <MainPanel sendTokenDataToParent={getTokenDataFromMain} credential={props.credential} showNotify={showNotify} />
      <AddSniperPanel tokenDataToAdd={tokenDataToAdd} history={props.history} credential={props.credential} showNotify={showNotify}/>
      <BackToTopButton></BackToTopButton>
    </>
  );
};

const mapStateToProps = (state) => {
  const { LoginReducer } = state;
  return { credential: LoginReducer };
};


export default connect(mapStateToProps)(Logs);