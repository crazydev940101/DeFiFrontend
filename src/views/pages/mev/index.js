/**
 *  Updated by Dragonslayer 5/27/2023
 */

import { connect } from "react-redux";

import React, { useEffect, } from "react";
import NotificationAlert from "react-notification-alert";
// reactstrap components
import {
  Row,
  Col,
} from "reactstrap";
import BackToTopButton from "../../../views/components/BackToTopButton.js";
import ComingSoon from "./component/ComingSoon.js";
import './index.css';

const Mev = (props) => {

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

  useEffect(() => {

  }, []);


  return (
    <>
      <div className="rna-container">
        <NotificationAlert ref={notificationAlertRef} />
      </div>
      <div className="content">
        <Row>
          <Col md="12">
            <ComingSoon showNotify={showNotify} />
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


export default connect(mapStateToProps)(Mev);