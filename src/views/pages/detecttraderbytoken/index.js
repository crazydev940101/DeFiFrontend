/**
 *  Updated by Dragonslayer 5/27/2023
 */

import { connect } from "react-redux";

import React, { useState, } from "react";
import NotificationAlert from "react-notification-alert";
// reactstrap components
import {
  Row,
  Col,
} from "reactstrap";
import BackToTopButton from "../../../views/components/BackToTopButton.js";
import TradersPanel from "./component/TradersPanel.js";
import TokensPanel from "./component/TokensPanel.js";
import './index.css';


const DetectTraderByToken = (props) => {

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

  const [tokenAddressToTradersPanel, setTokenAddressToTradersPanel] = useState();

  const getTokenAddressFromTokensPanel = (data => {
    setTokenAddressToTradersPanel(data);
  })

  return (
    <>
      <div className="rna-container">
        <NotificationAlert ref={notificationAlertRef} />
      </div>
      <div className="content">
        <Row>
          <Col md="12">
            <TokensPanel history={props.history} sendTokenAddressToParent={getTokenAddressFromTokensPanel} credential={props.credential} showNotify={showNotify}/>
            <TradersPanel sendTokenAddressToTradersPanel={tokenAddressToTradersPanel} showNotify={showNotify} />
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


export default connect(mapStateToProps)(DetectTraderByToken);