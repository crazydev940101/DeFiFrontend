/**
 *  Updated by dragonslayer 6/3/2023
 */

import React, { useEffect, useState, useRef, useCallback } from "react";
import { connect } from "react-redux";
import { confirmAlert } from 'react-confirm-alert';
import { ClipLoader } from "react-spinners";
import { Tooltip as ReactTooltip } from 'react-tooltip'
import NotificationAlert from "react-notification-alert";
// reactstrap components
import {
  Button,
  Card, CardBody,
  CardFooter, CardHeader, Col, Row,
} from "reactstrap";

import { globalVariables, reduceString } from '../../../../variables/variable.js';
import BackToTopButton from "../../../../views/components/BackToTopButton.js";

import "./traderlogs.css"

var format = require('date-format');
var ta = require('time-ago')  // node.js

function useIsMounted() {
  const mountedRef = useRef(false);
  const get = useCallback(() => mountedRef.current, []);
  useEffect(() => {
    mountedRef.current = true;
    return () => mountedRef.current = false;
  }, []);
  return get;
}

const TraderLogs = (props) => {

  const isMounted = useIsMounted();
  const { apiConfig, ApiCall } = global;
  const notificationAlertRef = useRef(null);
  const notify = (message, type) => {
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

  const [itemList, setItemList] = useState([]);
  const [loading, setLoading] = useState(false);

  //init
  useEffect(() => {
    /**
     *  get all of trader's transaction history from DB
     */
    if (!props.location.state) {
      return;
    }
    const data = props.location.state;
    setLoading(true);
    async function getTransactionsHistory() {
      try {
        const payLoad = {
          wallet_id: data._id,
          user_id: props.credential.loginUserName,
          type: props.location.state.type
        };
        const response = await ApiCall(
          apiConfig.detect_by_wallet_id.url,
          apiConfig.detect_by_wallet_id.method,
          props.credential.loginToken,
          payLoad
        );
        if (response.status === 200) {
          if (isMounted()) {
            const dataList = response.data.mempoolDetectList.filter(item => item.type === props.location.state.type);
            setItemList(dataList);
            setLoading(false);
          }
        }
      } catch (error) {
        console.log(error);
      }
    }
    getTransactionsHistory();
  }, [props.credential.loginToken]);

  const confirmationCheck = () => {
    confirmAlert({
      title: 'Confirm to submit',
      message: 'Are you sure to delete all logs',
      buttons: [
        {
          label: 'Yes',
          onClick: () => onDeleteAllLogs()
        },
        {
          label: 'No',
          onClick: () => { }
        }
      ]
    });
  }

  /**
   *  Delete all logs of trader's transactions
   */

  const onDeleteAllLogs = async () => {
    try {
      const payLoad = {
        wallet_id: props.location.state._id,
        user_id: props.credential.loginUserName
      };
      const response = await ApiCall(
        apiConfig.remove_all_detect_log_by_wallet_id.url,
        apiConfig.remove_all_detect_log_by_wallet_id.method,
        props.credential.loginToken,
        payLoad
      );
      if (response.status === 200) {
        setItemList([]);
        notify(response.data.message, "success");
      }
    } catch (error) {
      notify("Failed to delete all Logs.", "danger");
    }
  }

  /**
 *  remove trader's current transaction history 
 */
  const onRemoveTransaction = async (event, key) => {
    try {
      const payLoad = {
        _id: itemList[key]._id,
        user_id: props.credential.loginUserName
      };
      const response = await ApiCall(
        apiConfig.remove_current_log.url,
        apiConfig.remove_current_log.method,
        props.credential.loginToken,
        payLoad
      );
      if (response.status === 200) {
        notify(response.data.message, "success");
        setItemList((ele) => {
          let ele1 = JSON.parse(JSON.stringify(ele));
          ele1.splice(key, 1);
          return ele1;
        });
      } else {
        notify(response.data.error, "danger");
      }
    } catch (error) {
      notify("Failed to remove the current transaction.", "danger");
    }
  }

  const onBackMethod = () => {
    props.history.push({
      pathname: '/bot/wallet'
    })
  }

  return (
    <>
      <div className="rna-container">
        <NotificationAlert ref={notificationAlertRef} />
      </div>
      <div className="content">
        <Row>
          <Col md="12">
            <Card>
              <CardHeader>
                <Row>
                  <Col className="pr-md-1 toggle_botton" md="1">
                    <Button className="btn1" color="btn1" type="submit" onClick={onBackMethod}>
                      Back
                    </Button>
                  </Col>
                  <Col className="pr-md-1 toggle_botton" md="11" style={{ paddingTop: "15px", paddingLeft: "20px !important" }}>
                    <h5 className="title">
                      <em>
                        {props.location.state ? (
                          <>
                            {props.location.state.fullname + " ("}
                            <a href={globalVariables.ETHERSCAN_IO + props.location.state.address} target="_blank">
                              {props.location.state.address}
                            </a>
                            {")"}
                          </>)
                          : null}
                      </em>&nbsp;&nbsp;&nbsp; 's Transaction History
                    </h5>
                  </Col>
                </Row>
              </CardHeader>
              <CardBody>
                <Col className="pr-md-1 toggle_botton" md="12" style={{ textAlign: "right", paddingRight: "20px !important" }}>
                  <Button className="btn-fill" color="green" type="submit" onClick={confirmationCheck}>
                    Delete all
                  </Button>
                </Col>
                {loading ? (
                  <ClipLoader color={globalVariables.GREEN} size="50px" />
                ) : (
                  <>
                    <table className="table">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Token Address</th>
                          <th>Transaction Hash</th>
                          <th>Method</th>
                          <th>Method ID</th>
                          <th>Value</th>
                          <th>Sell Percent</th>
                          <th>Time</th>
                          <th>Since</th>
                          <th>Remove</th>
                        </tr>
                      </thead>
                      <tbody>
                        {
                          itemList &&
                          itemList.map((ele, key) => (
                            <tr key={key}>
                              <td>
                                {key + 1}. &nbsp;
                              </td>
                              <td style={{ whiteSpace: 'nowrap' }}  id={'tooltip_trader_log_token1_' + key}>
                                <a href={globalVariables.ETHERSCAN_IO + ele.token1} target="_blank">
                                  {reduceString(ele.token1, 10)}
                                  <ReactTooltip
                                    anchorId={'tooltip_trader_log_token1_' + key}
                                    place="bottom"
                                    variant="success"
                                    content={ele.token1}
                                  />
                                </a>
                                &nbsp;&nbsp;&nbsp;&nbsp;<a href={globalVariables.DEXTOOL_PAIR_EXPLORER + ele.token1} target="_blank"><i className="tim-icons icon-link-72" /></a>
                              </td>
                              <td id={'tooltip_trader_log_tx_' + key}>
                                <a href={globalVariables.ETHERSCAN_IO_TX + ele.tx} target="_blank">
                                  {reduceString(ele.tx, 10)}
                                  <ReactTooltip
                                    anchorId={'tooltip_trader_log_tx_' + key}
                                    place="bottom"
                                    variant="success"
                                    content={ele.tx}
                                  />
                                </a>
                              </td>
                              <td>
                                {ele.method}
                              </td>
                              <td>
                                {ele.methodID}
                              </td>
                              <td>
                                {ele.unit} {ele.value !== null ? ": " + ele.value : ''}
                              </td>
                              <td>
                                {ele.sell_percent}
                              </td>
                              <td>
                                {format('yyyy-MM-dd    hh:mm:ss O', new Date(ele.created))}
                              </td>
                              <td>
                                {ta.ago(new Date(ele.created))}
                              </td>
                              <td>
                                <Button onClick={(event) => onRemoveTransaction(event, key)} className="btn-simple btn-round" color="danger">
                                  <i className="tim-icons icon-simple-remove" />
                                </Button>
                              </td>
                            </tr>
                          ))
                        }
                      </tbody>
                    </table>

                  </>

                )}
              </CardBody>
              <CardFooter></CardFooter>
            </Card>
          </Col>
        </Row>
      </div>
      <BackToTopButton></BackToTopButton>
    </>
  );
};

const mapStateToProps = (state) => {
  const { LoginReducer } = state;
  return { credential: LoginReducer };
};


export default connect(mapStateToProps)(TraderLogs);