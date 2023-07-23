/**
 *  Updated by Dragonslayer 5/27/2023
 */

import { connect } from "react-redux";
import React, { useState, useContext } from "react";
import NotificationAlert from "react-notification-alert";

// reactstrap components
import {
  Row,
  Col
} from "reactstrap";

import { SocketContext } from "../../../views/socket/SocketContext.js";
import TokenCardPanel from "./component/TokenCardPanel.js";
import TokenListPanel from "./component/TokenListPanel.js";
import AddSniperPanel from "./component/AddSniperPanel.js";
import BackToTopButton from "../../../views/components/BackToTopButton.js";
import './index.css';


const Sniper = (props) => {
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
  const [sniperDataToList, setSniperDataToList] = useState('');
  const [modalShowToAdd, setModalShowToAdd] = useState('');
  const [newTokenBought, setNewTokenBought] = useState('');
  const socket = useContext(SocketContext).socket;

  const getSniperDataFromAdd = (data) => {
    setSniperDataToList(data);
  }

  const getModalShowFromList = (data) => {
    setModalShowToAdd(data);
  }

  const getNewTokenBought = (data) => {
    setNewTokenBought(data);
  }

  return (
    <>
      <div className="rna-container">
        <NotificationAlert ref={notificationAlertRef} />
      </div>
      <div className="content">
        <Row>
          <Col md="12">
            <AddSniperPanel sendSniperDataToParent={getSniperDataFromAdd} modalShowToAdd={modalShowToAdd} credential={props.credential} showNotify={showNotify} />
            <TokenListPanel sendModalShowToParent={getModalShowFromList} sniperDataToList={sniperDataToList} newTokenBought={newTokenBought} credential={props.credential} showNotify={showNotify} />
            <TokenCardPanel sendNewTokenBought={getNewTokenBought} credential={props.credential} showNotify={showNotify} socket={socket}/>
          </Col>
        </Row>
        <BackToTopButton></BackToTopButton>
      </div>
    </>
  );
};

const mapStateToProps = (state) => {
  const { LoginReducer } = state;
  return { credential: LoginReducer };
};


export default connect(mapStateToProps)(Sniper);