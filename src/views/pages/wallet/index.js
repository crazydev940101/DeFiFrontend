/**
 *  Created by DragonSlayer 5/27/2023
 */

import { connect } from "react-redux";
import React, { useRef } from "react";
import NotificationAlert from "react-notification-alert";

// reactstrap components
import {
  Row,
  Col,
} from "reactstrap";
import BackToTopButton from "../../../views/components/BackToTopButton.js";
import TraderPanel from "./component/TraderPanel.js";
import OwnerPanel from "./component/OwnerPanel.js";
import './index.css';

const Wallet = (props) => {
  const notificationAlertRef = useRef(null);
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
            <OwnerPanel credential={props.credential} showNotify={showNotify} />
          </Col>

          <Col md="12">
            <TraderPanel history={props.history} credential={props.credential} showNotify={showNotify} />
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

export default connect(mapStateToProps)(Wallet);
