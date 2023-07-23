/**
 *  Updated by Dragonslayer 6/8/2023
 */

import { connect } from "react-redux";
import React from "react";
import NotificationAlert from "react-notification-alert";
// reactstrap components
import {
  Row,
  Col,
} from "reactstrap";
import { SocketContext } from "../../../views/socket/SocketContext.js";
import BackToTopButton from "../../../views/components/BackToTopButton.js";
import BlockPanel from "./component/BlockPanel.js";
import TokenListPanel from "./component/TokenListPanel.js";
import "./index.css";


const Test = (props) => {
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

  const socket = React.useContext(SocketContext).socket;


  return (
    <>
      <div className="rna-container">
        <NotificationAlert ref={notificationAlertRef} />
      </div>
      <div className="content">
        <Row>
          <Col md="12">
          <BlockPanel socket={socket}/> 
          <TokenListPanel showNotify={showNotify} credential={props.credential}/>
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


export default connect(mapStateToProps)(Test);