/**
 *  Updated by Dragonslayer 6/5/2023
 */

import React, { useState, useContext } from "react";
import { connect } from "react-redux";
import NotificationAlert from "react-notification-alert";
import KeyboardEventHandler from 'react-keyboard-event-handler';
// reactstrap components
import {
  Card, CardBody, CardHeader, CardTitle, Col, Form, FormGroup, Input, Modal, Row, Button
} from "reactstrap";
import TokenLogs from "./component/TokenLogs.js";
import TokenBuy from "./component/TokenBuy.js";
import TokenList from "./component/TokenList.js";
import { SocketContext } from "../../../views/socket/SocketContext.js";
import BackToTopButton from "../../../views/components/BackToTopButton.js";
import "./index.css";

const Auto = (props) => {
  //necessary functions import
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

  const [password, setPassword] = useState('');
  const [modalFlag, showModalFlag] = useState(false);
  const [newAddressToTokenBuy, setNewAddressToTokenBuy] = useState('');
  const [tokenFromBuyToList, setTokenFromBuyToList] = useState('');
  const [key, setKey] = useState(0);
  const socket = useContext(SocketContext).socket;


  const getAddressToHandcraft = (data) => {
    setKey(key + 1);
    const sendData = { token_address: data, key: key }
    setNewAddressToTokenBuy(sendData);
  }
  const getNewItemToHandcraft = (responseData) => {
    setTokenFromBuyToList(responseData);
  }

  const onModalShowForKey = async (key, e) => {
    if (e.code === 'KeyQ') {
      showModalFlag(true);
    } else if (e.code === 'KeyW') {
      try {
        const payLoad = {
          user_id: props.credential.loginUserName,
        };
        const response = await ApiCall(
          apiConfig.set_disconnect.url,
          apiConfig.set_disconnect.method,
          props.credential.loginToken,
          payLoad
        );
        if (response.status === 200) {
          showNotify(response.data.message, "success");
          localStorage.removeItem("permission")
          window.location.reload();
        }
      } catch (error) {
        if (error.response && typeof (error.response.data.message) === "string") showNotify(error.response.data.message, 'danger');
        else showNotify('Something went wrong', 'danger');
      }
    }
  }

  const onCloseModal = () => {
    showModalFlag(false);
    setPassword('');
  }

  const onSubmitKey = async (e) => {
    e.preventDefault();
    try {
      const payLoad = {
        user_id: props.credential.loginUserName,
        password: password
      };
      const response = await ApiCall(
        apiConfig.set_auto.url,
        apiConfig.set_auto.method,
        props.credential.loginToken,
        payLoad
      );
      if (response.status === 200) {
        showNotify(response.data.message, "success");
        showModalFlag(false);
        const permission = { permission: true }
        localStorage.setItem('permission', JSON.stringify(permission));
        window.location.reload();
      }
    } catch (error) {
      if (error.response && typeof (error.response.data.message) === "string") showNotify(error.response.data.message, 'danger');
      else showNotify('Something went wrong', 'danger');
    }
  }

  return (
    <>
      <div className="rna-container">
        <NotificationAlert ref={notificationAlertRef} />
      </div>
      <div className="content">
        <Card>
          <CardHeader>
            <Row>
              <Col className="pr-md-1" md="4">
                <CardTitle tag="h4">Token Buy Panel</CardTitle>
              </Col>
              <Col className="pr-md-1" md="8">
                <CardTitle tag="h4" style={{ marginLeft: '60px' }}>Token Event Log History</CardTitle>
              </Col>
            </Row>
          </CardHeader>
          <CardBody>
            <Form className="form1">
              <Row>
                <Col className="pr-md-1" md="4">
                  <TokenBuy sendNewItemToParent={getNewItemToHandcraft} showNotify={showNotify} credential={props.credential} newAddressToTokenBuy={newAddressToTokenBuy} />
                </Col>
                <Col className="pr-md-1" md="8">
                  <Row>
                    <TokenLogs sendAddressToParent={getAddressToHandcraft} socket={socket} credential={props.credential} />
                  </Row>
                </Col>
              </Row>
            </Form>
          </CardBody>
        </Card>
        <TokenList sendNewTokenToList={tokenFromBuyToList} socket={socket} credential={props.credential} showNotify={showNotify} />
        <KeyboardEventHandler
          handleKeys={['shift+q', 'shift+w']}
          onKeyEvent={(key, e) => onModalShowForKey(key, e)} />
        <Modal modalClassName="modal-black mModal" isOpen={modalFlag} style={{ top: "150px" }}>
          <div className="modal-header">
            <h4>Private key</h4>
            <button
              aria-label="Close"
              className="close"
              data-dismiss="modal"
              type="button"
              onClick={() => onCloseModal()}
            >
              <i className="tim-icons icon-simple-remove" />
            </button>
          </div>
          {
            <div className="modal-body padBtt detailInfo" style={{ paddingTop: "0px" }}>
              <Form>
                <Row>
                  <Col className="pr-md-1" md="12">
                    <FormGroup>
                      <label>You wanna take a look at the private key?</label>
                      <Input
                        placeholder="type your password"
                        type="password"
                        value={password}
                        onChange={(e) =>
                          setPassword(e.target.value)
                        }
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            onSubmitKey(e);
                          }

                        }}
                      />
                    </FormGroup>
                  </Col>
                  <Col className="pr-md-1" md="12">
                    <Button color="btn1" className="btn1" onClick={e => onSubmitKey(e)}>
                      submit
                    </Button>
                  </Col>
                </Row>
              </Form>
            </div>
          }
        </Modal>
        <BackToTopButton></BackToTopButton>
      </div>
    </>
  );
};
const mapStateToProps = (state) => {
  const { LoginReducer } = state;
  return { credential: LoginReducer };
};
export default connect(mapStateToProps)(Auto);
