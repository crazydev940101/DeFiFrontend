/**
 *  Updated by dragonslayer 7/5/2023
 */

import React, { useEffect, useState, useRef, useCallback } from "react";
import { useSelector } from "react-redux";
import { confirmAlert } from 'react-confirm-alert';
import { ClipLoader, ScaleLoader } from "react-spinners";
import { Tooltip as ReactTooltip } from 'react-tooltip';
import ToggleButton from 'react-toggle-button';
import Pagination from "replace-js-pagination";
import Select from 'react-select';
// reactstrap components
import {
  Button,
  Card, CardBody,
  CardFooter, CardHeader, Col, Row, Modal, Form, ListGroup, Label,
} from "reactstrap";

import { globalVariables, reduceString } from '../../../../variables/variable.js';
import "./mainpanel.css"
var format = require('date-format');

function useIsMounted() {
  const mountedRef = useRef(false);
  const get = useCallback(() => mountedRef.current, []);
  useEffect(() => {
    mountedRef.current = true;
    return () => mountedRef.current = false;
  }, []);
  return get;
}

const MainPanel = (props) => {
  const isMounted = useIsMounted();
  const { apiConfig, ApiCall } = global;
  const { showNotify } = props

  const [itemList, setItemList] = useState([]);
  const [checkLogState, setCheckLogState] = useState(false);
  const [loading, setLoading] = useState(false);
  const [keyTokenList, setKeyTokenList] = useState([]);
  const [modalFlag, showModalFlag] = useState(false);
  const itemListRef = useRef();
  const borderRadiusStyle = { borderRadius: 2 };
  const dataMessage = useSelector((state) => state.SocketReducer.newPairData);

  const [pageCount, setPageCount] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);

  const filterCountOption = [
    { value: 10, label: 10 },
    { value: 20, label: 20 },
    { value: 50, label: 50 },
  ];
  const [selectedOption, setSelectedOption] = useState(filterCountOption[0]); // Set the default value here

  //init
  useEffect(() => {
    /** 
     *  get all uniswap pair list
     */
    setLoading(true);
    async function get_all_uniswap_pairList() {
      try {
        const payLoad = {
          user_id: props.credential.loginUserName,
          page_count: pageCount,
          page_number: pageNumber,
        };
        const response = await ApiCall(
          apiConfig.get_token_logs.url,
          apiConfig.get_token_logs.method,
          props.credential.loginToken,
          payLoad
        );
        if (response.data.tokenLogs) {
          const updateData = response.data.tokenLogs;
          updateData.map(item => { item.loadingGetCode = false; item.loadingForHoney = false; item.loadingForGoPlus = false; });
          itemListRef.current = updateData;
          if (isMounted()) {
            setLoading(false)
            setPageNumber(pageNumber);
            setPageCount(pageCount);
            setTotalCount(response.data.totalCount);
            setItemList(itemListRef.current);
          }
        }
      } catch (error) {
      }
    }
    get_all_uniswap_pairList();

    async function getStartBtnState() {
      try {
        const payLoad = {
          user_id: props.credential.loginUserName
        };
        const response = await ApiCall(
          apiConfig.get_logs_history.url,
          apiConfig.get_logs_history.method,
          props.credential.loginToken,
          payLoad
        );
        if (response.status === 200) {
          if (isMounted()) {
            if (!response.data.checkstate) {
              setCheckLogState(false);
            } else {
              setCheckLogState(response.data.checkstate);
            }
          }
        }
      } catch (error) {
      }
    }
    getStartBtnState();
  }, [props.credential.loginToken, pageCount, pageNumber]);


  /**
   *  new token receives by socket.io
   */
  // useEffect(() => {
  //   if(itemListRef.current && isMounted()){
  //     itemListRef.current.unshift(props.logsOneNewPair);
  //     setItemList([...itemListRef.current]);
  //   } 

  // },[props.logsOneNewPair])

  useEffect(() => {
    if (dataMessage) {
      if (itemListRef.current && isMounted()) {
        itemListRef.current.unshift(dataMessage);
        setItemList([...itemListRef.current]);
      }
    }

  }, [dataMessage]);


  /**
   *  whether you start to get uniswap pair lists or not by clicking start button
   */
  const onDetectLogs = async (value) => {
    setCheckLogState(!value);
    try {
      const payLoad = {
        checkLogState: !checkLogState,
        user_id: props.credential.loginUserName
      };
      const response = await ApiCall(
        apiConfig.start_logs_history.url,
        apiConfig.start_logs_history.method,
        props.credential.loginToken,
        payLoad
      );
      if (response.status === 200) {
      }
    } catch (error) {
    }
  }

  /**
   *  remove the uniswap token 
   */
  const onRemoveToken = async (event, key) => {
    event.preventDefault();
    try {
      const payLoad = {
        obj_id: itemList[key]._id,
        user_id: props.credential.loginUserName
      };
      const response = await ApiCall(
        apiConfig.remove_log.url,
        apiConfig.remove_log.method,
        props.credential.loginToken,
        payLoad
      );
      if (response.status === 200) {
        showNotify(response.data.message, "success");
        setItemList((ele) => {
          let ele1 = JSON.parse(JSON.stringify(ele));
          ele1.splice(key, 1);
          return ele1;
        });
      } else {
        showNotify(response.data.error, "danger");
      }
    } catch (error) {
      showNotify("Failed to remove your wallet.", "danger");
    }
  }

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

  const onDeleteAllLogs = async () => {
    try {
      const payLoad = {
        user_id: props.credential.loginUserName
      };
      const response = await ApiCall(
        apiConfig.remove_all_log.url,
        apiConfig.remove_all_log.method,
        props.credential.loginToken,
        payLoad
      );
      if (response.status === 200) {
        setItemList([]);
        showNotify(response.data.message, "success");
      }
    } catch (error) {
      showNotify("Failed to delete all Logs.", "danger");
    }
  }

  const onShowModalToGetCode = async (e, key) => {
    e.preventDefault();
    const updateData = [...itemList];
    updateData[key].loadingGetCode = true;
    setItemList(updateData);
    try {
      const payLoad = {
        user_id: props.credential.loginUserName,
        token_address: itemList[key].address
      };
      const response = await ApiCall(
        apiConfig.get_code.url,
        apiConfig.get_code.method,
        props.credential.loginToken,
        payLoad
      );
      if (response.status === 200 && response.data) {
        updateData[key].loadingGetCode = false;
        setItemList(updateData);
        setKeyTokenList(response.data);
        showModalFlag(true);
        // showNotify(response.data.message, "success");
      }
    } catch (error) {
      const updateData = [...itemList];
      updateData[key].loadingGetCode = false;
      setItemList(updateData);
      showNotify("Failed to retrieve code of given token.", "danger");
    }
  }

  const onCloseModal = () => {
    showModalFlag(false);
    // showPrivState('');
    // setPasswordState('');
  }

  const onHandlePageClick = async (pageNum) => {
    setPageNumber(pageNum);
  }


  const onHandleFilterByCount = (selectedOption) => {
    setSelectedOption(selectedOption);
    setPageCount(selectedOption.value);
  }

  const onShowModalToAddSniper = (e, key) => {
    e.preventDefault();
    const data = { token_address: itemList[key].address }
    props.sendTokenDataToParent(data);
  }

  return (
    <>
      <div className="content">
        <Row>
          <Col md="12">
            <Card>
              <CardHeader>
                <h5 className="title">Uniswap Token Pair List</h5>

              </CardHeader>
              <CardBody>
                {loading ? (
                  <div className="clip-loader"><ClipLoader color={globalVariables.GREEN} size="50px" /> </div>
                ) : (
                  <>
                    <Row>
                      <Col className="pr-md-1 toggle_botton" md="8">
                        <ToggleButton
                          inactiveLabel={'STOP'}
                          activeLabel={'START'}
                          colors={{
                            activeThumb: {
                              base: 'rgb(250,250,250)',
                            },
                            inactiveThumb: {
                              base: 'rgb(250,250,250)',
                            },
                            active: {
                              base: 'rgb(20,168,0)',
                              hover: 'rgb(20,168,0)',
                            },
                            inactive: {
                              base: 'rgb(65,66,68)',
                              hover: 'rgb(95,96,98)',
                            }
                          }}
                          value={checkLogState}
                          thumbAnimateRange={[1, 57]}
                          thumbStyle={borderRadiusStyle}
                          trackStyle={borderRadiusStyle}
                          onToggle={(value) => onDetectLogs(value)} />
                        * click here to start for detecting Uniswap pair list*
                      </Col>
                      <Col className="pr-md-1" md="2" style={{ alignSelf: 'center' }}>
                        <label style={{ marginTop: '10px' }}>Filter By count: </label>
                        <Select
                          className="react-select-pagination info"
                          classNamePrefix="react-select-pagination"
                          defaultValue={selectedOption}
                          value={filterCountOption.value}
                          onChange={onHandleFilterByCount}
                          options={filterCountOption}
                        />
                      </Col>
                      <Col className="pr-md-1 toggle_botton" md="2" style={{ textAlign: "right", marginTop: "15px" }}>
                        <Button className="btn-fill" color="green" type="submit" onClick={confirmationCheck} style={{ marginRight: "15px" }}>
                          Delete all
                        </Button>
                      </Col>
                    </Row>

                    <table className="table">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Get Code</th>
                          <th>Contract Address</th>
                          <th>Token Name</th>
                          {/* <th>Pool Amount</th>
                        <th>Initial Liquidity</th> */}
                          <th>Total Supply</th>
                          <th>Time</th>
                          <th>Remove</th>
                        </tr>
                      </thead>
                      <tbody>
                        {
                          itemList.map((ele, key) => (
                            <tr key={key}>
                              <td>
                                {(pageNumber - 1) * pageCount + 1 + key} &nbsp;
                              </td>
                              <td className="scale-loader">
                                {
                                  ele.loadingGetCode ? (
                                    <ScaleLoader color="#14a800" size="50px" style={{ textAlign: 'center' }} />
                                  ) : (
                                    <a href="#" onClick={(e) => onShowModalToGetCode(e, key)} className="btn-simple btn-round">
                                      <i className="tim-icons icon-zoom-split" />
                                    </a>
                                  )
                                }
                              </td>
                              <td><a href={globalVariables.ETHERSCAN_IO + ele.address} target="_blank">
                                {ele.address}
                              </a>
                                &nbsp;&nbsp;&nbsp;&nbsp;
                                <a href={globalVariables.DEXTOOL_PAIR_EXPLORER + ele.address} target="_blank">
                                  <i className="tim-icons icon-link-72" />
                                </a>
                                &nbsp;&nbsp;&nbsp;&nbsp;
                                <a href="#" onClick={(e) => onShowModalToAddSniper(e, key)} className="btn-simple btn-round"  >
                                  <i className="tim-icons icon-simple-add edit-pencil" />
                                </a>
                              </td>
                              <td id={'tooltip_token_log_name_' + key}>
                                {reduceString(ele.name, 20)}
                                <ReactTooltip
                                  anchorId={'tooltip_token_log_name_' + key}
                                  place="bottom"
                                  variant="success"
                                  content={ele.name}
                                />
                              </td>
                              {/* <td>
                          {ele.poolamount}
                        </td>
                        <td>
                          {ele.initialliquidity}
                        </td> */}
                              <td>
                                {ele.totalsupply}
                              </td>
                              <td>
                                {format('yyyy-MM-dd    hh:mm:ss O', new Date(ele.createtime))}
                              </td>
                              <td>
                                <Button onClick={(event) => onRemoveToken(event, key)} className="btn-simple btn-round" color="danger">
                                  <i className="tim-icons icon-simple-remove" />
                                </Button>
                              </td>
                            </tr>
                          ))
                        }
                      </tbody>
                    </table>
                    <div style={{ float: "right" }}>
                      <Pagination
                        itemClass="bot-page-item"
                        linkClass="bot-page-link"
                        activePage={pageNumber}
                        itemsCountPerPage={pageCount}
                        totalItemsCount={totalCount}
                        pageRangeDisplayed={5}
                        onChange={onHandlePageClick}
                      />
                    </div>
                  </>

                )}
              </CardBody>
              <CardFooter></CardFooter>
            </Card>
          </Col>
        </Row>
      </div>

      <Modal modalClassName="modal-black mModal logs-page-modal" isOpen={modalFlag} >
        <div className="modal-header">
          <h4>Token Code</h4>
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
                  <Label style={{ fontWeight: 700 }}>{
                    keyTokenList.status == 0 ?
                      <><i className="tim-icons icon-check-2 verified-mempool-1" /><em style={{ color: globalVariables.RED }}>Unverified Contract</em></> :
                      <><i className="tim-icons icon-check-2 verified-mempool-2" /><em style={{ color: globalVariables.GREEN }}>Verified Contract</em></>}</Label>
                  <Row className="spacing-wallet">
                    <Col className="pr-md-1" md="12">
                      <ListGroup>
                        <Row>
                          {
                            keyTokenList?.function_lists &&
                            keyTokenList.function_lists.map((item, key) => (
                              <Col className="pr-md-1" md="12" key={key}>
                                <label style={{ color: '#001e00' }}>
                                  {item}
                                </label>
                              </Col>
                            ))
                          }
                        </Row>
                      </ListGroup>
                    </Col>
                  </Row>
                </Col>
              </Row>
            </Form>
          </div>
        }
      </Modal>
    </>
  );
};

export default MainPanel;