/**
 *  Updated by dragonslayer 6/25/2023
 */

import React, { useState, useRef, } from "react";
import { connect } from "react-redux";
import NotificationAlert from "react-notification-alert";
import BackToTopButton from "../../../views/components/BackToTopButton.js";
import TokenSecurityPanel from "./component/TokenSecurityPanel.js";
import MainPanel from "./component/MainPanel.js";
import HoneyPotPanel from "./component/HoneyPotPanel.js";
import "./index.css"
import RugPullPanel from "./component/RugPullPanel.js";


const TokenLogs = (props) => {

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

  const [tokenAddressToSecurity, setTokenAddressToSecurity] = useState('');
  const [loadingForGoPlusToMain, setLoadingForGoPlusToMain] = useState('');
  const [tokenAddressForHoneyToSecurity, setTokenAddressForHoneyToSecurity] = useState('');
  const [loadingForHoneyToMain, setLoadingForHoneyToMain] = useState('');
  const [tokenAddressForRugPullToSecurity, setTokenAddressForRugPullToSecurity] = useState('');
  const [loadingForRugPullToMain, setLoadingForRugPullToMain] = useState('');

  const getTokenAddressToSecurity = (response) => {
    setTokenAddressToSecurity(response);
  }
  const getTokenAddressForHoneyToSecurity = (response) => {
    setTokenAddressForHoneyToSecurity(response);
  }
  const getTokenAddressForRugPullToSecurity = (response) => {
    setTokenAddressForRugPullToSecurity(response);
  }

  const getLoadingForGoPlusFromSecurity = (flag, key) => {
    const responseData = {
      flag: flag,
      key: key
    }
    setLoadingForGoPlusToMain(responseData)
  }
  const getLoadingForHoneyFromSecurity = (flag, key) => {
    const responseData = {
      flag: flag,
      key: key
    }
    setLoadingForHoneyToMain(responseData)
  }
  const getLoadingForRugPullFromSecurity = (flag, key) => {
    const responseData = {
      flag: flag,
      key: key
    }
    setLoadingForRugPullToMain(responseData)
  }

  return (
    <>
      <div className="rna-container">
        <NotificationAlert ref={notificationAlertRef} />
      </div>
      <MainPanel sendTokenAddressToParent={getTokenAddressToSecurity} sendTokenAddressForHoneyToParent={getTokenAddressForHoneyToSecurity} sendTokenAddressForRugPullToParent={getTokenAddressForRugPullToSecurity} 
      sendLoadingForGoPlusToMain={loadingForGoPlusToMain} sendLoadingForHoneyToMain={loadingForHoneyToMain}  sendLoadingForRugPullToMain={loadingForRugPullToMain} 
      credential={props.credential} showNotify={showNotify} />
      <TokenSecurityPanel sendTokenAddressToSecurity={tokenAddressToSecurity}  sendLoadingForGoPlusToParent={getLoadingForGoPlusFromSecurity} showNotify={showNotify}/>
      <HoneyPotPanel sendTokenAddressForHoneyToSecurity={tokenAddressForHoneyToSecurity} sendLoadingForHoneyToParent={getLoadingForHoneyFromSecurity} showNotify={showNotify}/>
      <RugPullPanel  sendTokenAddressForRugPullToSecurity={tokenAddressForRugPullToSecurity} sendLoadingForRugPullToParent={getLoadingForRugPullFromSecurity} showNotify={showNotify}/>
      <BackToTopButton></BackToTopButton>
    </>
  );
};

const mapStateToProps = (state) => {
  const { LoginReducer } = state;
  return { credential: LoginReducer };
};

export default connect(mapStateToProps)(TokenLogs);