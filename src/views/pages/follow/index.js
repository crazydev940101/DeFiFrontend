/**
 *  Created by Dragonslayer 5/31/2023
 */

import React, { useState, useContext } from "react";
import { connect } from "react-redux";
import NotificationAlert from "react-notification-alert";

import { SocketContext } from "../../../views/socket/SocketContext.js";
import AddNewPanel from "./component/AddNewPanel.js";
import FollowListPanel from "./component/FollowListPanel.js";
import BackToTopButton from "../../../views/components/BackToTopButton";
import "./index.css";

const Follow = (props) => {
  const notificationAlertRef = React.useRef(null);
  const showNotify = (message, type) => {
    let options = {};
    options = {
      place: "tr",
      message: message,
      type: type,
      icon: "tim-icons icon-bell-55",
      autoDismiss: 2,
    };
    if (notificationAlertRef.current) notificationAlertRef.current.notificationAlert(options);
  };
  const socket = useContext(SocketContext).socket;
  const [sendNewFollowToList, setSendNewFollowToList] = useState('');

  const getNewFollowFromAddNew = (responseData) => {
    setSendNewFollowToList(responseData)
  }

  return (
    <>
      <div className="rna-container">
        <NotificationAlert ref={notificationAlertRef} />
      </div>
      <div className="content">
        <AddNewPanel sendNewFollowToParent={getNewFollowFromAddNew} credential={props.credential} showNotify={showNotify} />
        <FollowListPanel sendNewFollowToFollowList={sendNewFollowToList} credential={props.credential} showNotify={showNotify} socket={socket} />
      </div>
      <BackToTopButton></BackToTopButton>
    </>
  );
}

const mapStateToProps = (state) => {
  const { LoginReducer } = state;
  return { credential: LoginReducer };
};

export default connect(mapStateToProps)(Follow);