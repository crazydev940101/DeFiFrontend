/**
 *  Created by Dragonslayer 6/22/2023
 */

import React, { useEffect, useState, useRef, useCallback } from "react";
import { useSelector, useDispatch, shallowEqual } from "react-redux";
import { ClipLoader } from "react-spinners";
import { confirmAlert } from "react-confirm-alert";
import { ReadMoreReadLess } from "react-readmore-and-readless";
import { Tooltip as ReactTooltip } from 'react-tooltip';
import ToggleButton from 'react-toggle-button';
import empty from 'empty-lite';
import Select from "react-select";
import {
  Button, Card, CardBody, CardHeader, CardTitle, Col, Form, FormGroup, Input, Row, Label, CardText,
} from "reactstrap";

import { setNewFollowTokenData } from "../../../../store/actions/socket.action.js";
import { onDetectGas, onApproveHandle, onEstimatePrice, onSellHandle, onRemoveToken, onDetectRugPool } from "../../../../views/pages/component/TokenModule.js";
import { globalVariables, onSetLimitHtmlInput, onOnlyAllowNumeric } from "../../../../variables/variable";
import { LineChart } from "../../../components/chartLine.js";

import "./followlistpanel.css";

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
const FollowListPanel = (props) => {
  const isMounted = useIsMounted();
  const { apiConfig, ApiCall } = global;
  const { showNotify } = props;

  const [itemList, setItemList] = useState([[]]);
  const [rowData, setRowData] = useState(-1);
  const [colData, setColData] = useState(-1);
  const [loadingAllData, setLoadingAllData] = useState(false);
  const [colorRead, setColorRead] = useState(0);
  const [_key, setKey] = useState(0);
  const [sell_button, setSellButton] = useState({
    opacity: "1",
    pointerEvents: "initial"
  })
  const [editMode, setEditMode] = useState(false);
  const [editedData, setEditedData] = useState({});
  const [initialData, setInitialData] = useState({});

  const colors = ['red', 'green', 'blue'];
  const itemListRef = useRef();
  const selectInputRef = useRef([]);
  const newFollowToken = useSelector((state) => state.SocketReducer.newFollowTokenData);
  const dispatch = useDispatch();
  const borderRadiusStyle = { borderRadius: 2 };
  const socket = props.socket;

  /**
   *      add new follow to the follow list
   */
  useEffect(() => {
    const responseData = props.sendNewFollowToFollowList;
    itemListRef.current = [...itemList];
    itemListRef.current.unshift(responseData);
    setItemList(itemListRef.current);
    setRowData(-1);
    setColData(-1);
    if (selectInputRef.current) {
      selectInputRef.current.map(item => {
        item?.select.clearValue();
      })
    }
  }, [props.sendNewFollowToFollowList])

  /**
   *      show color wrapping after new token arrive
   */
  useEffect(() => {
    const intervalID = setInterval(() => {
      setColorRead((colorIndex) => (colorIndex + 1) % colors.length);
    }, 1000);

    return () => clearInterval(intervalID);
  }, [colors.length]);


  /**
   *      get all follows from DB
   */
  useEffect(() => {
    setLoadingAllData(true);
    async function getFollows() {
      try {
        const payLoad = {
          user_id: props.credential.loginUserName
        };
        const response = await ApiCall(
          apiConfig.get_follows.url,
          apiConfig.get_follows.method,
          props.credential.loginToken,
          payLoad,
        );
        if (response.status === 200 && isMounted()) {
          if (response.data.follows) {
            const d_jsonarry = response.data.follows.map(follow => {
              const { tokens } = follow;
              var _jsonArray = [];
              if (!tokens) {
                return [];
              } else {
                _jsonArray = tokens.map(item => {
                  var isReadVisible = '';
                  if (item.read_status) isReadVisible = 'none';
                  else isReadVisible = 'inline-block';
                  return { ...item, value: item.id, label: item.token_address, percentage: 100, slippage: 10, is_read_visible: isReadVisible, isApproveDisabled: item.approved, isSellDisabled: false }
                })
              }
              const utils = {
                loading_buy_button: false,
                loading_sell_button: false,
                loading_approve_button: false,
                loading_price_button: false,
                loading_gas_button: false,
                loading_selected_token: false,
              }
              let count = 0;
              if (newFollowToken) {
                newFollowToken.newTokenCountByFollow.map(item => {
                  if (item.follow_id === follow._id) {
                    count = item.count;
                  }
                })
              }


              return { ...follow, tokens: _jsonArray, is_visible: 'none', count: count, utils: utils, is_rug: false, socket_message: '' }
            })
            itemListRef.current = d_jsonarry;
            setItemList(itemListRef.current);
            /** init loading flag array to get all follows */
            setLoadingAllData(false);
          }
        }
      } catch (error) {
        showNotify("Something went wrong", 'danger');
      }
    }
    getFollows();

  }, []);

  /**
   *  new token receives by socket.io
   */
  useEffect(() => {
    let copyItemList = [...itemList];
    let rowIndex = -1;
    if (isMounted() && newFollowToken) {
      if (!empty(newFollowToken.newToken)) {
        copyItemList.forEach((row, i) => {
          if (row._id === newFollowToken.newToken.follow_id) {
            rowIndex = i;
          }
        });
        const newData = { ...newFollowToken.newToken, _id: newFollowToken.newToken.token_id, value: newFollowToken.newToken.token_id, label: newFollowToken.newToken.token_address, percentage: 100, slippage: 10, read_status: false, is_read_visible: 'inline-block' }
        if (rowIndex > -1) {
          copyItemList[rowIndex]?.tokens.unshift(newData);
          itemListRef.current = copyItemList;
          setItemList(itemListRef.current);
          handleForceUpdate();
        }

        itemListRef.current = copyItemList.map((follow) => {
          const matchItem = newFollowToken.newTokenCountByFollow.filter((newfollow) => follow._id == newfollow.follow_id)
          if (matchItem)
            return { ...follow, count: matchItem[0]?.count };
          return follow;
        })

        setItemList(itemListRef.current);
      }
    }
  }, [newFollowToken]);

  const handleForceUpdate = () => {
    setKey(prevKey => prevKey + 1);
  };

  /**
   *    detect rug pull by socket.io
   */
  const rugPoolCallback = useCallback(data => {
    if (data) {
      var rowIndex = -1;
      var colIndex = -1;
      const updateList = [...itemList];
      updateList.forEach((value, i) => {
        value.tokens?.forEach((val, j) => {
          if (val._id === data.token_id) {
            rowIndex = i;
            colIndex = j;
          }
        })
      })
      if (rowIndex > -1 && colIndex > -1) {
        updateList[rowIndex].tokens[colIndex].is_rug = data.status; // status:    0, 1  (0 - danger color, 1- green color)
        updateList[rowIndex].tokens[colIndex].socket_message = data.message;
        itemListRef.current = updateList;
        setItemList(itemListRef.current);
      }
    }
  })
  const tokenMessageCallback = useCallback(data => {
    if (data) {
      var rowIndex = -1;
      var colIndex = -1;
      const updateData = [...itemList];
      updateData.forEach((follow, i) => {
        follow.tokens?.forEach((token, j) => {
          if (token._id === data.token_id && token.follow_id === data.follow_id) {
            rowIndex = i;
            colIndex = j;
          }
        })
      })
      if (rowIndex > -1 && colIndex > -1) {
        updateData[rowIndex].tokens[colIndex].status = data.status;
        updateData[rowIndex].tokens[colIndex].message = data.message;
        itemListRef.current = updateData;
        setItemList(itemListRef.current);
      }
    }
  })

  const tokenWatchCallback = useCallback(data => {
    if (data) {
      var rowIndex = -1;
      var colIndex = -1;
      const updateData = [...itemList];
      updateData.forEach((follow, i) => {
        follow.tokens?.forEach((token, j) => {
          if (token._id === data.token_id && token.follow_id === data.follow_id) {
            rowIndex = i;
            colIndex = j;
          }
        })
      })
      if (rowIndex > -1 && colIndex > -1) {
        updateData[rowIndex].tokens[colIndex].estimationPrice = data.estPrice;
        itemListRef.current = updateData;
        setItemList(itemListRef.current);
      }
    }
  })

  useEffect(() => {
    if (socket) {
      socket.on("token:rugpool", rugPoolCallback);
      socket.on("follows:tokenMessage", tokenMessageCallback);
      socket.on("token:watch", tokenWatchCallback);
      return () => {
        if (socket) {
          socket.off("token:rugpool", rugPoolCallback);
          socket.off("follows:tokenMessage", tokenMessageCallback);
          socket.off("token:watch", tokenWatchCallback);
        }
      };
    }
  }, [socket, itemList]);


  /**
   *  to remove your current following
   */
  const onRemoveFollow = async (event, key) => {
    try {
      const payLoad = {
        obj_id: itemList[key]._id,
        user_id: props.credential.loginUserName
      };
      const response = await ApiCall(
        apiConfig.remove_follow.url,
        apiConfig.remove_follow.method,
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
        setRowData(-1);
        setColData(-1);
      } else {
        showNotify(response.data.error, "danger");
      }
    } catch (error) {
      showNotify("Failed to remove your Follow.", "danger");
    }
  };

  /**
   *    to start or stop following when click the button
   */
  const onStartFollow = async (value, key) => {
    const updatedState = [...itemList];
    updatedState[key].is_start = !value;
    setItemList(updatedState)

    try {
      const payLoad = {
        follow_id: itemList[key]._id,
        is_start: !value,
        user_id: props.credential.loginUserName
      };
      const response = await ApiCall(
        apiConfig.start_follow_detect.url,
        apiConfig.start_follow_detect.method,
        props.credential.loginToken,
        payLoad
      );

      if (response.status === 200) {
        showNotify(response.data.message, "success");
      }
    } catch (error) {
      showNotify("Failed to start follow.", "danger");
    }
  }

  /**
   *    to start or stop to do auto sell
   */
  const onAutoSellAll = async (value, key) => {
    const updatedState = [...itemList];
    updatedState[key].auto = !value;
    setItemList(updatedState)

    try {
      const payLoad = {
        follow_id: itemList[key]._id,
        auto: !value,
        user_id: props.credential.loginUserName
      };
      const response = await ApiCall(
        apiConfig.change_auto_setting.url,
        apiConfig.change_auto_setting.method,
        props.credential.loginToken,
        payLoad
      );

      if (response.status === 200) {
        showNotify(response.data.message, "success");
      }
    } catch (error) {
      showNotify("Failed to start follow.", "danger");
    }
  }

  /**
 *    to start or stop to do auto sell
 */
  const onAutoSell = async (value, row, col) => {
    const updatedState = [...itemList];
    updatedState[row].tokens[col].auto = !value;
    setItemList(updatedState)

    try {
      const payLoad = {
        follow_id: itemList[row]._id,
        token_id: itemList[row].tokens[col]._id,
        auto: !value,
        user_id: props.credential.loginUserName
      };
      const response = await ApiCall(
        apiConfig.change_autosell_setting.url,
        apiConfig.change_autosell_setting.method,
        props.credential.loginToken,
        payLoad
      );

      if (response.status === 200) {
        showNotify(response.data.message, "success");
      }
    } catch (error) {
      showNotify("Failed to start follow.", "danger");
    }
  }



  /**
   *      Show token that you wanna take a look at 
   */
  const onHandleTokenList = async (_selectedOption, key) => {
    if (_selectedOption === null) {
      return;
    }
    
    if (rowData > -1 && rowData !== key) {
      selectInputRef.current[rowData]?.select.clearValue();
    }

    const update = [...itemList];
    update[key].utils.loading_selected_token = true;
    setItemList(update);

    try {
      const payLoad = {
        user_id: props.credential.loginUserName,
        token_id: _selectedOption.value
      };
      const response = await ApiCall(
        apiConfig.get_token_by_id.url,
        apiConfig.get_token_by_id.method,
        props.credential.loginToken,
        payLoad,
      );
      if (response.status === 200 && isMounted()) {
        let rowI = -1;
        let len = itemList.length - 1;
        let col = -1;
        let columnI = -1;
        itemList.forEach((row, i) => {
          row.tokens.forEach((value, j) => {
            if (value.follow_id === _selectedOption.follow_id && value._id === _selectedOption._id) {
              rowI = i;
              columnI = j;
            }
            col = j + 1;
          });
        });
        setRowData(rowI === -1 ? -1 : rowI);
        setColData(rowI === -1 ? -1 : columnI);

        const updateTokenListOption = [...itemList];
        updateTokenListOption[rowI].is_visible = 'block';

        if (!(updateTokenListOption[rowI].tokens[columnI].read_status)) {

          const parentElement = document.querySelector('.flex-element');
          const element = parentElement.querySelector('.socket-message');
          const countToken = parseInt(updateTokenListOption[rowI].count);
          if (countToken > 0) {
            updateTokenListOption[rowI].count = countToken - 1;
            newFollowToken.newTokenCountByFollow[len - rowI].count = countToken - 1;
            dispatch(setNewFollowTokenData(newFollowToken));
            if (element) {
              element.innerText = element.innerText - 1;
              if (element.innerText < 1) {
                element.style.display = 'none';
              } else {
                element.style.display = 'block';
              }
            }

          }
          updateTokenListOption[rowI].tokens[columnI].is_read_visible = 'none';
          updateTokenListOption[rowI].tokens[columnI].read_status = true;
        }
        updateTokenListOption[key].utils.loading_selected_token = false;
        itemListRef.current = updateTokenListOption;
        setItemList(itemListRef.current);
      }
    } catch (error) {
      const update = [...itemList];
      update[key].utils.loading_selected_token = false;
      setItemList(update);
      showNotify("Something went wrong", 'danger');
    }
  };

  const onBuyMoreHandle = async (e, row, col) => {
    const update = [...itemList];
    update[row].utils.loading_buy_button = true;
    setItemList(update);
    try {
      const payLoad = {
        user_id: props.credential.loginUserName,
        follow_id: itemList[row].tokens[col].follow_id,
        token_address: itemList[row].tokens[col].token_address,
        owner_address: itemList[row].tokens[col].owner_address,
        gas_price: 0, // gwei
        gas_limit: 250000, // number
        sell_price: 0,
        ethAmount: itemList[row].tokens[col].ethAmountAdd,
        tokenAmount: 0,
        initial_price: 0,
        rug_check: false,
        tx: '',
        created: '',
        delay: 0,
        time_block: 'block',
        type: 0,
        slippage: 10,
        read_status: true,
        is_read_visible: 'none'
      }
      const response = await ApiCall(
        apiConfig.manual_buy.url,
        apiConfig.manual_buy.method,
        props.credential.loginToken,
        payLoad
      );
      if (response.data.data) {
        const responseData = { ...response.data.data }


        const update = [...itemList];
        update[row].tokens[col].message = responseData.message;
        update[row].tokens[col].status = responseData.status;
        update[row].tokens[col].ethAmount = responseData.ethAmount;
        update[row].tokens[col].ethAmountAdd = 0;
        // update[row].tokens[col].read_status = true;
        // update[row].tokens[col].is_read_visible = 'none';
        update[row].utils.loading_buy_button = false;
        itemListRef.current = update;
        setItemList(itemListRef.current);

        if (responseData.status === 200) {
          showNotify(response.data.message, 'success');
        } else {
          showNotify(response.data.message, 'danger');
        }
      }
    } catch (error) {
      const update = [...itemList];
      update[row].tokens[col].status = error?.response?.data?.status;
      update[row].tokens[col].message = error?.response?.data?.message;
      update[row].utils.loading_buy_button = false;
      itemListRef.current = update;
      setItemList(itemListRef.current);
      if (error.response && typeof (error.response.data.message) === "string") {
        showNotify(error.response.data.message, 'danger');
      } else {
        showNotify("Something went wrong", 'danger');
      }
    }
  };


  const handleChange = (row, col, value, type) => {
    const updatedDataList = [...itemList];
    if (updatedDataList[row]) {
      switch (type) {
        case 'percentage':
          updatedDataList[row].tokens[col].percentage = value;
          break;
        case 'slippage':
          updatedDataList[row].tokens[col].slippage = value;
          break;
        case 'gas_limit':
          updatedDataList[row].tokens[col].gas_limit = value;
          break;
        case 'gas_price':
          updatedDataList[row].tokens[col].gas_price = value;
          break;
        case 'ethAmountAdd':
          updatedDataList[row].tokens[col].ethAmountAdd = value;
          break;
        default:
          break;
      }
      setItemList(updatedDataList);
    }
  };

  const handleBlur = (row, col, type) => {
    const updatedDataList = [...itemList];
    if (updatedDataList[row]) {
      switch (type) {
        case 'percentage':
          updatedDataList[row].tokens[col].percentage = onSetLimitHtmlInput(updatedDataList[row]?.tokens[col]?.percentage, 0, 100);
          break;
        case 'slippage':
          updatedDataList[row].tokens[col].slippage = onSetLimitHtmlInput(updatedDataList[row]?.tokens[col]?.slippage, 0, 100);
          break;
        case 'gas_limit':
          updatedDataList[row].tokens[col].gas_limit = onSetLimitHtmlInput(updatedDataList[row]?.tokens[col]?.gas_limit, 0, null);
          break;
        case 'gas_price':
          updatedDataList[row].tokens[col].gas_price = onSetLimitHtmlInput(updatedDataList[row]?.tokens[col]?.gas_price, 0, null);
          break;
        case 'ethAmountAdd':
          updatedDataList[row].tokens[col].ethAmountAdd = onSetLimitHtmlInput(updatedDataList[row]?.tokens[col]?.ethAmountAdd, 0, null);
          break;
        default:
          break;
      }
      setItemList(updatedDataList);
    }
  };

  /**
   *  to update the trader's name
   */

  const onHandleEdit = (e, key) => {
    e.preventDefault();
    setEditMode(true);
    setEditedData(itemList[key]);
  };

  const onHandleSave = async (e, key) => {
    const updatedData = [...itemList];
    const index = updatedData.findIndex((item) => item.id === editedData.id);
    updatedData[index] = editedData;
    setItemList(updatedData);
    setEditMode(false);
    setEditedData({});

    try {
      const payLoad = {
        user_id: props.credential.loginUserName,
        follow_id: itemList[key]._id,
        eth_for_exa_eth: editedData.eth_for_exa_eth,
        slippage: editedData.slippage,
        sell_slippage: editedData.sell_slippage,
      };
      const response = await ApiCall(
        apiConfig.update_follow_item.url,
        apiConfig.update_follow_item.method,
        props.credential.loginToken,
        payLoad
      );
      if (response.status === 200) {
        showNotify("Successfully updated information", 'success');
      }
    } catch (error) {
      if (error.response && typeof (error.response.data.message) === "string") showNotify(error.response.data.message, 'danger');
      else showNotify('Something went wrong', 'danger');
    }
  };

  const onHandleCancel = () => {
    setEditMode(false);
    setEditedData({});
  };

  const onHandleChange = (e) => {
    if (e.target) {
      const { name, value } = e.target;
      setEditedData((prevData) => ({
        ...prevData,
        [name]: value
      }));
    } else {
      const updatedData = { ...editedData };
      updatedData.status = e.value;
      setEditedData(updatedData);
    }

  };

  const onShowChart = (e, row, col) => {
    setInitialData({ key: row, token_id: itemList[row].tokens[col]._id, token_address: itemList[row].tokens[col].token_address, ethAmount: itemList[row].tokens[col].ethAmount, created: itemList[row].tokens[col].created });
  }

  return (
    <>
      {
        loadingAllData ? (
          <div className="clip-loader"><ClipLoader color={globalVariables.GREEN} size="50px" /> </div>
        ) : (
          itemList.map((ele, key) => (
            <Card key={key} style={{ backgroundColor: key % 2 === 0 ? globalVariables.BACKGROUND_COLOR : '#ffffff' }}>
              <CardHeader style={{ display: 'flex' }}>
                <CardTitle tag="h4">Follow #{key + 1}   &nbsp;&nbsp;&nbsp;
                  {
                    ele.count > 0 ? <span className="socket-message-follow">New &nbsp;{ele.count}</span>
                      : ''
                  }
                </CardTitle>
                {editMode && editedData.id === ele.id ? (
                  <div className="handle-edit-method" style={{ display: 'flex' }}>
                    <Button onClick={e => onHandleSave(e, key)} className="btn-simple btn-round method-panel-1" color="success">
                      <i className="tim-icons icon-check-2" />
                    </Button>
                    <Button onClick={onHandleCancel} className="btn-simple btn-round" color="danger">
                      <i className="tim-icons icon-simple-remove" />
                    </Button>
                  </div>
                ) : (
                  <a href="" onClick={(e) => onHandleEdit(e, key)} >
                    <i className="tim-icons icon-pencil edit-pencil" />
                  </a>
                )}
              </CardHeader>

              <CardBody>
                <Form className="form1">
                  <Row>

                    <Col className="pr-md-1" md="12">
                      <Row>
                        <Col className="pr-md-1" md="1"><CardTitle>* Your address:</CardTitle></Col>
                        <Col className="pr-md-1" md="3"><CardText><a href={globalVariables.ETHERSCAN_IO + ele.owner_address} target="_blank">{ele.owner_address}</a></CardText></Col>
                        <Col className="pr-md-1" md="1"><CardTitle>* Trader's addr:</CardTitle></Col>
                        <Col className="pr-md-1" md="3"><CardText><a href={globalVariables.ETHERSCAN_IO + ele.trader_address} target="_blank">{ele.trader_address}</a></CardText></Col>
                      </Row>
                      <Row>
                        <Col className="pr-md-1" md="2"><CardTitle>* ETH Maximum Limit for ExactETH:</CardTitle></Col>
                        <Col className="pr-md-1" md="2">
                          <FormGroup>
                            <CardText className="edit-pencil-follow">
                              {editMode && editedData.id === ele.id ?
                                <Input type="text" name="eth_for_exa_eth" value={editedData.eth_for_exa_eth} onChange={onHandleChange} />
                                : ele.eth_for_exa_eth + ' ' + globalVariables.BASE_TOKEN_SYMBOL}
                            </CardText>
                          </FormGroup>
                        </Col>
                        <Col className="pr-md-1" md="2"><CardTitle>* ETH Maximum Limit for ExactToken:</CardTitle></Col>
                        <Col className="pr-md-1" md="2"><CardText>{ele.eth_for_exa_token}</CardText></Col>
                      </Row>
                      <Row>
                        <Col className="pr-md-1" md="1"><CardTitle>* Delay:</CardTitle></Col>
                        <Col className="pr-md-1" md="3"><CardText>{ele.delay}</CardText></Col>
                        <Col className="pr-md-1" md="1"><CardTitle>* Delay Method:</CardTitle></Col>
                        <Col className="pr-md-1" md="3"><CardText>{ele.time_block}</CardText></Col>
                      </Row>
                      <Row>
                        <Col className="pr-md-1" md="1"><CardTitle>* Gas Price:</CardTitle></Col>
                        <Col className="pr-md-1" md="3"><CardText>{ele.gas_price} </CardText></Col>
                        <Col className="pr-md-1" md="1"><CardTitle>* Sell Price:</CardTitle></Col>
                        <Col className="pr-md-1" md="3"><CardText>{ele.sell_price}</CardText></Col>
                      </Row>
                      <Row>
                        <Col className="pr-md-1" md="1"><CardTitle>* Buy Slippage:</CardTitle></Col>
                        <Col className="pr-md-1" md="3">
                          <FormGroup>
                            <CardText className="edit-pencil-follow">
                              {editMode && editedData.id === ele.id ?
                                <Input type="text" name="slippage" value={editedData.slippage} onChange={onHandleChange} />
                                : ele.slippage + " %"}
                            </CardText>
                          </FormGroup>
                        </Col>
                        <Col className="pr-md-1" md="1"><CardTitle>* Sell Slippage:</CardTitle></Col>
                        <Col className="pr-md-1" md="3">
                          <FormGroup>
                            <CardText className="edit-pencil-follow">
                              {editMode && editedData.id === ele.id ?
                                <Input type="text" name="sell_slippage" value={editedData.sell_slippage} onChange={onHandleChange} />
                                : ele.sell_slippage + " %"}
                            </CardText>
                          </FormGroup>
                        </Col>
                      </Row>
                      <Row>
                        <Col className="pr-md-1" md="1"><CardTitle>* Created Time:</CardTitle></Col>
                        <Col className="pr-md-1" md="3"><CardText>{format('yyyy-MM-dd    hh:mm:ss O', new Date(ele.created))}</CardText></Col>
                      </Row>
                    </Col>
                  </Row>
                  <Row>
                    <Col className="pr-md-1 toggle_botton" md="2">
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
                        value={ele.is_start}
                        thumbAnimateRange={[1, 57]}
                        thumbStyle={borderRadiusStyle}
                        trackStyle={borderRadiusStyle}
                        onToggle={(value) => onStartFollow(value, key)} />
                      * click here to start *
                    </Col>
                    <Col className="pr-md-1 toggle_botton" md="2">
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
                        value={ele.auto}
                        thumbAnimateRange={[1, 57]}
                        thumbStyle={borderRadiusStyle}
                        trackStyle={borderRadiusStyle}
                        onToggle={(value) => onAutoSellAll(value, key)} />
                      * click here to do auto sell *
                    </Col>
                    <Col className="pr-md-1" md="2">
                      <Button color="btn1" className="btn1" onClick={(e) => {
                        confirmAlert({
                          title: 'Confirm to submit',
                          message: 'Are you sure to remove this follow?',
                          buttons: [
                            {
                              label: 'Yes',
                              onClick: () => onRemoveFollow(e, key)
                            },
                            {
                              label: 'No',
                              onClick: () => { }
                            }
                          ]
                        });
                      }}>
                        Remove Follow
                      </Button>
                    </Col>
                  </Row>
                </Form>
              </CardBody>

              <hr size="5" width="95%" style={{ alignSelf: "center", color: "#e4ebe4" }} />

              <CardHeader>
                <CardTitle tag="h4">Bought Tokens Information</CardTitle>
              </CardHeader>
              <CardBody>
                <Form className="form1">
                  <Row>
                    <Col className="pr-md-1" md="4">
                      <FormGroup>
                        <Label>* Please choose if you wanna take a look at the token</Label>
                        <Select
                          key={_key}
                          ref={(ref) => selectInputRef.current[key] = ref}
                          // value={selectedOption[key] || ''}
                          options={ele?.tokens}
                          className="react-select info"
                          classNamePrefix="react-select"
                          onChange={(follows) => onHandleTokenList(follows, key)}
                          getOptionLabel={(option) => (
                            <span className="new-read-unread">
                              {option.label}
                              {//option.label && follows[rowData]?.tokens[colData].read_status ? // && follows[key].data[colData].is_visible ?
                                (<i className="tim-icons icon-email-85" style={{ display: option.is_read_visible, color: colors[colorRead], borderColor: colors[colorRead] }} />)}
                            </span>
                          )}
                          clearFocusValueOnUpdate={true}
                        >
                        </Select>
                      </FormGroup>
                    </Col>
                    <Col className="pr-md-1" md="2" style={{ marginTop: "16px" }}>
                      <Button color="btn1" className="btn1" onClick={(e) => onRemoveToken(e, key, rowData, colData, itemList, setItemList, props, ApiCall, apiConfig, showNotify, setColData, setRowData, 2)}>
                        Remove Token
                      </Button>
                    </Col>
                  </Row>
                </Form>
              </CardBody>
              { //follows[rowData[key]]?.tokens[colData[key]]
                itemList[key].utils?.loading_selected_token && key === rowData ? (
                  <div className="clip-loader" style={{ display: itemList[rowData].is_visible }}>
                    <ClipLoader color={globalVariables.GREEN} size="50px" />
                  </div>
                ) : (
                  (rowData === key) && colData > -1 && itemList[rowData].tokens[colData] &&
                  <div style={{ display: itemList[rowData].is_visible }}>
                    <CardHeader>
                      <CardTitle tag="h4">Token logs</CardTitle>
                    </CardHeader>
                    <CardBody>
                      <Row>
                        <Col className="pr-md-1" md="5">
                          <Row>
                            <Col className="pr-md-1" md="4"><CardTitle>* Token Address</CardTitle></Col>
                            <Col className="pr-md-1" md="8"><CardText><a href={globalVariables.ETHERSCAN_IO + itemList[rowData].tokens[colData]?.token_address} target="_blank">{itemList[rowData].tokens[colData]?.token_address}</a>&nbsp;&nbsp;<a href={globalVariables.DEXTOOL_PAIR_EXPLORER + itemList[rowData].tokens[colData]?.token_address} target="_blank"><i className="tim-icons icon-link-72" /></a></CardText></Col>
                          </Row>
                          <Row>
                            <Col className="pr-md-1" md="4"><CardTitle>* Initial Buy Amount</CardTitle></Col>
                            <Col className="pr-md-1" md="8"><CardText>{itemList[rowData].tokens[colData]?.ethAmount} &nbsp; {globalVariables.BASE_TOKEN_SYMBOL}</CardText></Col>
                          </Row>
                          <Row>
                            <Col className="pr-md-1" md="4"><CardTitle>* Status</CardTitle></Col>
                            {/* <Col className="pr-md-1" md="8"><CardText>{ itemList[rowData].tokens[colData].status }</CardText></Col> */}
                            <Col className="pr-md-1 read-more-button" md="8" >
                              <ReadMoreReadLess
                                text={itemList[rowData]?.tokens[colData]?.message || ''}
                                charLimit={50}
                                rootStyles={
                                  itemList[rowData]?.tokens[colData]?.status === 200 ? { color: globalVariables.GREEN } : { color: globalVariables.RED }
                                }
                                readMoreStyle={{
                                  color: "green",
                                }}
                                readLessStyle={{
                                  color: "green",
                                }}
                              />
                            </Col>
                          </Row>
                          <Row>
                            <Col className="pr-md-1" md="4"><CardTitle>* Created Time</CardTitle></Col>
                            <Col className="pr-md-1" md="8"><CardText>{format('yyyy-MM-dd    hh:mm:ss O', new Date(itemList[rowData]?.tokens[colData]?.created))}</CardText></Col>
                          </Row>
                          <hr size="5" width="95%" style={{ alignSelf: "center", color: "#e4ebe4" }} />
                          <Row className="css_gas_part">
                            <Col className="pr-md-1" md="3">
                              {
                                itemList[rowData].utils.loading_price_button ?
                                  (<div className="clip-loader"><ClipLoader color={globalVariables.GREEN} size="50px" /> </div>
                                  ) : (
                                    <Button color="btn1" className="btn1" onClick={(e) => onEstimatePrice(e, rowData, colData, itemList, setItemList, props, showNotify, ApiCall, apiConfig, 2, onShowChart)}>
                                      Watch
                                    </Button>
                                  )
                              }
                            </Col>
                            <Col className="pr-md-1" md="6"><CardTitle style={{ float: "left", fontSize: "16px" }}>{itemList[rowData].tokens[colData].estimationPrice || 0} &nbsp; {globalVariables.BASE_TOKEN_SYMBOL}</CardTitle></Col>
                          </Row>
                          <hr size="5" width="80%" style={{ alignSelf: "center", color: "#e4ebe4" }} />
                          <Row>
                            <Col className="pr-md-1" md="4">
                              {
                                itemList[rowData].utils.loading_gas_button ?
                                  (<div className="clip-loader"><ClipLoader color={globalVariables.GREEN} size="50px" /> </div>
                                  ) : (
                                    <Button color="btn1" className="btn1" onClick={(e) => onDetectGas(e, rowData, colData, itemList, setItemList, props, showNotify, ApiCall, apiConfig, 2)}>
                                      Detect Gas
                                    </Button>
                                  )
                              }
                            </Col>
                            <Col className="pr-md-1 toggle_botton" md="2">
                              <ToggleButton
                                inactiveLabel={'OFF'}
                                activeLabel={'ON'}
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
                                value={itemList[rowData]?.tokens[colData]?.rug_check}
                                thumbAnimateRange={[1, 57]}
                                thumbStyle={borderRadiusStyle}
                                trackStyle={borderRadiusStyle}
                                onToggle={(value) => onDetectRugPool(value, rowData, colData, itemList, setItemList, props, ApiCall, apiConfig, 2, showNotify)} />
                              *Detect Rug Pull
                            </Col>
                            <Col>
                              <CardText className={itemList[rowData]?.tokens[colData]?.is_rug === 0 ? "css_rug_pool_state_false" : "css_rug_pool_state_true"}><i id={'tooltip_token_detected_rug_pull_' + key} className="tim-icons icon-alert-circle-exc" /><em style={{ position: 'absolute' }}>{itemList[rowData]?.tokens[colData]?.socket_message}</em></CardText>
                            </Col>
                            <ReactTooltip
                              anchorId={'tooltip_token_detected_rug_pull_' + key}
                              place="bottom"
                              variant="success"
                              content={itemList[rowData]?.tokens[colData]?.is_rug === 0 ? "Detected Rug Pull!" : "Nothing Detected Rug Pull!"}
                            />
                          </Row>
                          <Row className="css_gas_part">
                            <Col className="pr-md-1" md="2"><CardTitle>* Gas Price:</CardTitle></Col>
                            <Col className="pr-md-1" md="3">
                              <FormGroup>
                                <Input
                                  type="Number"
                                  value={itemList[rowData]?.tokens[colData]?.gas_price || 0}
                                  min={0}
                                  onChange={(e) => handleChange(rowData, colData, e.target.value, 'gas_price')}
                                  onBlur={() => handleBlur(rowData, colData, 'gas_price')}
                                  onKeyPress={onOnlyAllowNumeric}
                                />
                              </FormGroup>
                            </Col>
                            <Col className="pr-md-1" md="2"><CardTitle>* Gas Limit:</CardTitle></Col>
                            <Col className="pr-md-1" md="3">
                              <FormGroup>
                                <Input
                                  type="Number"
                                  value={itemList[rowData]?.tokens[colData]?.gas_limit || 250000}
                                  min={0}
                                  onChange={(e) => handleChange(rowData, colData, e.target.value, 'gas_limit')}
                                  onBlur={() => handleBlur(rowData, colData, 'gas_limit')}
                                  onKeyPress={onOnlyAllowNumeric}
                                />
                              </FormGroup>
                            </Col>
                          </Row>
                          <Row className="css_gas_part">
                            <Col className="pr-md-1" md="2"><CardTitle>* Slippage:</CardTitle></Col>
                            <Col className="pr-md-1" md="3">
                              <FormGroup>
                                <Input
                                  type="Number"
                                  value={itemList[rowData]?.tokens[colData]?.slippage || 10}
                                  min={0}
                                  max={100}
                                  onChange={(e) => handleChange(rowData, colData, e.target.value, 'slippage')}
                                  onBlur={() => handleBlur(rowData, colData, 'slippage')}
                                  onKeyPress={onOnlyAllowNumeric}
                                />
                              </FormGroup>
                            </Col>
                            <Col className="pr-md-1" md="2">
                              {
                                itemList[rowData].utils.loading_approve_button ?
                                  (<div className="clip-loader"><ClipLoader color={globalVariables.GREEN} size="50px" /> </div>
                                  ) : (
                                    <Button color="btn1" className="btn1" onClick={(e) => onApproveHandle(e, rowData, colData, itemList, setItemList, props, ApiCall, apiConfig, showNotify, setSellButton, 2)} disabled={itemList[rowData].tokens[colData].isApproveDisabled}>
                                      Approve
                                    </Button>
                                  )}

                            </Col>
                          </Row>
                          <hr size="5" width="80%" style={{ alignSelf: "center", color: "#e4ebe4" }} />
                          <Row className="css_gas_part">
                            <Col className="pr-md-1" md="2"><CardTitle>* ETH Amount</CardTitle></Col>
                            <Col className="pr-md-1" md="3">
                              <FormGroup>
                                <Input
                                  type="Number"
                                  value={itemList[rowData]?.tokens[colData]?.ethAmountAdd || 0}
                                  min={0}
                                  onChange={(e) => handleChange(rowData, colData, e.target.value, 'ethAmountAdd')}
                                  onBlur={() => handleBlur(rowData, colData, 'ethAmountAdd')}
                                  onKeyPress={onOnlyAllowNumeric}
                                />
                              </FormGroup>
                            </Col>
                            <Col className="pr-md-1" md="4">
                              {itemList[rowData].utils.loading_buy_button ? (
                                <div className="clip-loader"><ClipLoader color={globalVariables.GREEN} size="50px" /> </div>
                              ) : (
                                <Button color="green" className="btn-fill" onClick={(e) => onBuyMoreHandle(e, rowData, colData)}>
                                  Buy More
                                </Button>
                              )}
                            </Col>
                          </Row>
                          <Row className="css_gas_part">
                            <Col className="pr-md-1" md="2"><CardTitle>* Custom %</CardTitle></Col>
                            <Col className="pr-md-1" md="3">
                              <FormGroup>
                                <Input
                                  type="Number"
                                  value={itemList[rowData]?.tokens[colData]?.percentage || 100}
                                  min={0}
                                  max={100}
                                  onChange={(e) => handleChange(rowData, colData, e.target.value, 'percentage')}
                                  onBlur={() => handleBlur(rowData, colData, 'percentage')}
                                  onKeyPress={onOnlyAllowNumeric}
                                />
                              </FormGroup>
                            </Col>
                            <Col className="pr-md-1" md="3">
                              {itemList[rowData].utils.loading_sell_button ? (
                                <div className="clip-loader"><ClipLoader color={globalVariables.GREEN} size="50px" /> </div>
                              ) : (
                                <Button color="green" className="btn-fill" onClick={(e) => onSellHandle(e, rowData, colData, itemList, setItemList, props, ApiCall, apiConfig, showNotify, 2)} disabled={itemList[rowData].tokens[colData].isSellDisabled}>
                                  Sell
                                </Button>
                              )}
                            </Col>
                            <Col className="pr-md-1 toggle_botton" md="2">
                              <ToggleButton
                                inactiveLabel={'OFF'}
                                activeLabel={'ON'}
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
                                value={itemList[rowData]?.tokens[colData]?.auto}
                                thumbAnimateRange={[1, 57]}
                                thumbStyle={borderRadiusStyle}
                                trackStyle={borderRadiusStyle}
                                onToggle={(value) => onAutoSell(value, rowData, colData)} />
                              *auto sell
                            </Col>
                          </Row>
                          {/* <hr size="5" width="95%" style={{alignSelf: "center", color: "#e4ebe4"}}/>
                        <Row>
                            <Col className="pr-md-1" md="2">
                                <Button color="btn1" className="btn1" onClick={onBuyToken}>
                                    Buy
                                </Button>
                            </Col>
                        </Row>              */}
                        </Col>
                        <Col className="pr-md-1" md="7">
                          {
                            (rowData === initialData.key) && (
                              <LineChart sendInitialData={initialData} socket={socket} />
                            )
                          }
                        </Col>
                      </Row>
                    </CardBody>
                  </div>

                )}
            </Card>
          ))
        )
      }
    </>
  )
}

export default FollowListPanel