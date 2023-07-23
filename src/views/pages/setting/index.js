/**
 *  Updated by Dragonslayer 5/27/2023
 */

import { connect } from "react-redux";
import React from "react";
import NotificationAlert from "react-notification-alert";

// reactstrap components
import {
  Row,
  Col
} from "reactstrap";

import MethodPanel from "./component/MethodPanel.js";
import ProfilePanel from "./component/ProfilePanel.js";
import SocketPanel from "./component/SocketPanel.js";
import BackToTopButton from "../../../views/components/BackToTopButton.js";
import './index.css';

const User = (props) => {
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

  return (
    <>
      <div className="rna-container">
        <NotificationAlert ref={notificationAlertRef} />
      </div>
      <div className="content">
        <Row>
          <Col md="12">
            <ProfilePanel credential={props.credential} showNotify={showNotify} />
            <SocketPanel credential={props.credential} showNotify={showNotify} />
            <MethodPanel credential={props.credential} showNotify={showNotify} />
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


export default connect(mapStateToProps)(User);