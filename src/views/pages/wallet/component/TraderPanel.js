/**
 *  Created by Dragonslayer 6/22/2023
 */

import React, { useEffect, useState, useRef, useCallback } from "react";
import { ClipLoader } from "react-spinners";
import { confirmAlert } from "react-confirm-alert";
import { Tooltip as ReactTooltip } from 'react-tooltip'
import ToggleButton from 'react-toggle-button';
import Select from 'react-select';
import classnames from "classnames";

import {
  Card, CardBody, CardHeader, CardFooter, Col, FormGroup, InputGroup, Row, Input, Button
} from "reactstrap";
import { globalVariables, validateString } from "../../../../variables/variable.js";
import "./ownerpanel.css";



const select_options = [
  { value: 0, label: 'Flash' },
  { value: 1, label: 'Normal' },
];
function useIsMounted() {
  const mountedRef = useRef(false);
  const get = useCallback(() => mountedRef.current, []);
  useEffect(() => {
    mountedRef.current = true;
    return () => mountedRef.current = false;
  }, []);
  return get;
}
const TraderPanel = (props) => {
  const isMounted = useIsMounted();
  const { apiConfig, ApiCall } = global;
  const { showNotify } = props;
  const [newItem, setNewItem] = useState({ fullname: '', address: '' });
  const [itemList, setItemList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedMemOption, setSelectedMemState] = useState('');
  const [editingIndex, setEditingIndex] = useState(-1);
  const [value, setValue] = useState("");
  const borderRadiusStyle = { borderRadius: 2 };
  const itemListRef = useRef();

  /**
   *  get all the lists of trader's wallet
   */
  useEffect(() => {
    setLoading(true);
    async function get_all_your_lists_traderWallet() {
      try {
        const payLoad = {
          _id: props.credential.loginUserName
        };
        const response = await ApiCall(
          apiConfig.get_trader_wallet.url,
          apiConfig.get_trader_wallet.method,
          props.credential.loginToken,
          payLoad
        );
        if (response.data.walletlist) {
          if (isMounted()) {
            setNewItem({ ...newItem, fullname: '', address: '' });

            /** Setting the updated state into detectState */
            itemListRef.current = response.data.walletlist
            setItemList(itemListRef.current);
            setLoading(false);
          }
        }
      } catch (error) {
        showNotify("Failed to get all of traders's wallet.", "danger");
      }
    }
    get_all_your_lists_traderWallet();
  }, [])



  /**
   *  remove trader's wallet from DB
   */

  const onRemoveWallet = async (e, key) => {
    try {
      const payLoad = {
        obj_id: itemList[key]._id,
        _id: props.credential.loginUserName
      };
      const response = await ApiCall(
        apiConfig.remove_trader_wallet.url,
        apiConfig.remove_trader_wallet.method,
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
      showNotify("Failed to remove trader's wallet.", "danger");
    }
  }


  /**
 *  add new trader's wallet to DB
 */

  const onAddNewWallet = async (e) => {
    e.preventDefault();
    if (newItem.fullname == "") {
      showNotify("Please input the trader's name.", "danger");
      return;
    }
    if (!validateString(newItem.address, 'public')) {
      showNotify("Please check your trader's wallet format", "danger");
      return;
    }
    try {
      const payLoad = {
        fullname: newItem.fullname,
        newData: newItem.address,
        is_user: 1,
        _id: props.credential.loginUserName
      };
      const response = await ApiCall(
        apiConfig.add_trader_wallet.url,
        apiConfig.add_trader_wallet.method,
        props.credential.loginToken,
        payLoad
      );
      if (response.status === 200) {
        showNotify("New Wallet added.", "success");
        setItemList((ele) => {
          ele.push(response.data.trader);
          return ele;
        });
        setNewItem({ ...newItem, fullname: '', address: '' });
      } else {
        showNotify(response.data.error, "danger");
      }
    } catch (error) {
      if (error.response && typeof (error.response.data.message) === "string") showNotify(error.response.data.message, 'danger');
      else showNotify("Failed to add a new trader's wallet.", "danger");

    }

  };


  /**
   *  delete all trader's wallets
   */
  const onDeleteAllTraders = async () => {
    try {
      const payLoad = {
        user_id: props.credential.loginUserName
      };
      const response = await ApiCall(
        apiConfig.remove_all_traders.url,
        apiConfig.remove_all_traders.method,
        props.credential.loginToken,
        payLoad
      );

      if (response.status === 200) {
        showNotify(response.data.message, "success");
      }
    } catch (error) {
      showNotify("Failed to delete all Logs.", "danger");
    }
  }




  /**
  *    set the trader whether is using flashbot or not
  */

  const onSetIsMempool = async (selectedMemOption, key) => {
    setSelectedMemState({ selectedMemOption: selectedMemOption });
    const update = [...itemList];
    try {
      const payLoad = {
        wallet_id: update[key]._id,
        is_mempool: parseInt(selectedMemOption.value),
        user_id: props.credential.loginUserName,
        verified: true
      };
      const response = await ApiCall(
        apiConfig.set_mempool.url,
        apiConfig.set_mempool.method,
        props.credential.loginToken,
        payLoad
      );
      if (response.status === 200) {
        showNotify("Trader's Mempool has been changed.", "success");
        update[key].is_mempool = true;
        update[key].verified = true;
        setItemList(update);
      } else {
        showNotify(response.data.error, "danger");
      }
    } catch (error) {
      showNotify("Failed to set the trader's mempool.", "danger");
    }
  }

  /**
  *  detect the trader's transaction history to check for using Mevbot
  */
  const onDetectIsMempool = async (value, key) => {
    const update = [...itemList];
    update[key].is_detect = !value;
    setItemList(update);
    // if(!itemList[key]) {
    //   itemList[key] = false;
    // }
    try {
      const payLoad = {
        wallet_id: itemList[key]._id,
        is_detect: !value,
        _id: props.credential.loginUserName
      };
      const response = await ApiCall(
        apiConfig.start_detect.url,
        apiConfig.start_detect.method,
        props.credential.loginToken,
        payLoad
      );
      if (response.status === 200) {

      }
    } catch (error) {
      console.log(error);
    }

  }

  /**
  *  go to trader's transaction history page
  */
  const onShowDetectLogs = async (e, address, fullname, _id, _type) => {
    e.preventDefault();
    var type = 0;
    if (_type === 0) {
      type = 0;
    } else {
      type = 1;
    }
    props.history.push({
      pathname: '/bot/trader_logs',
      state: { address, fullname, _id, type }
    });
  }

  /**
  *  to update the trader's name
  */

  const onHandleEdit = (e, index) => {
    e.preventDefault();
    setEditingIndex(index);
  };

  const onHandleSave = async (index, field, value) => {
    const newData = [...itemList];
    newData[index][field] = value;
    setItemList(newData);

    try {
      const payLoad = {
        wallet_id: itemList[index]._id,
        name: value,
        _id: props.credential.loginUserName
      };
      const response = await ApiCall(
        apiConfig.change_name.url,
        apiConfig.change_name.method,
        props.credential.loginToken,
        payLoad
      );
      if (response.status === 200) {
        setValue("");
      }
    } catch (error) {
      console.log(error);
    }
    setEditingIndex(-1);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <h5 className="title">Trader Wallet</h5>
        </CardHeader>
        <CardBody>
          <Row className="spacing-wallet">
            <Col className="pr-md-1" md="6">
              <FormGroup>
                <InputGroup
                  className={classnames({
                    "input-group-focus": newItem.fullnameFocus,
                  })}
                ></InputGroup>
                <label>Trader's Name</label>
                <Input
                  type="text"
                  onFocus={(e) => setNewItem({ ...newItem, trader_fullnameFocus: true })}
                  onBlur={(e) => setNewItem({ ...newItem, trader_fullnameFocus: false })}
                  value={newItem.fullname}
                  onChange={(e) => setNewItem({ ...newItem, fullname: e.target.value })}
                />
                <InputGroup
                  className={classnames({
                    "input-group-focus": newItem.trader_newDataFocus,
                  })}
                ></InputGroup>
                <label>Public Address</label>
                <Input
                  type="text"
                  onFocus={(e) => setNewItem({ ...newItem, trader_newDataFocus: true })}
                  onBlur={(e) => setNewItem({ ...newItem, trader_newDataFocus: false })}
                  value={newItem.address}
                  onChange={(e) => setNewItem({ ...newItem, address: e.target.value })}
                />
              </FormGroup>
            </Col>
            <Col className="pr-md-1" md="11">
              <FormGroup>
                <Button
                  className="btn-fill"
                  color="green"
                  type="button"
                  onClick={onAddNewWallet}
                >
                  Add
                </Button>
                <Button
                  className="btn-fill"
                  color="green"
                  type="button"
                  onClick={onDeleteAllTraders}
                  style={{ float: "right" }}
                >
                  Delete all
                </Button>
              </FormGroup>
            </Col>
          </Row>
          {loading ? (
            <div className="clip-loader">
              <ClipLoader color={globalVariables.GREEN} size="50px" />
            </div>
          ) : (
            <Col className="pr-md-1" md="11" style={{ paddingLeft: "0px" }}>
              <table className="table">
                <thead>
                  {
                    itemList.length !== 0 &&
                    <tr>
                      <th>#</th>
                      <th>Name</th>
                      <th>Public Address</th>
                      <th>Detect</th>
                      <th>Is Mempool</th>
                      <th>Edit</th>
                      <th>Remove</th>
                    </tr>
                  }
                </thead>
                <tbody>
                  {
                    itemList.map((ele, key) => (
                      <tr key={key}>
                        <td>
                          {key + 1}. &nbsp;
                        </td>
                        <td>
                          {editingIndex === key ? (
                            <div className="form-group">
                              <input
                                type="text"
                                className="form-control"
                                // value={value}
                                defaultValue={ele.fullname}
                                onBlur={(e) => onHandleSave(key, "fullname", e.target.value)}
                                onChange={(e) => setValue(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    onHandleSave(key, "fullname", e.target.value)
                                    // Perform some action when the Enter key is pressed
                                  }
                                }}
                              />
                            </div>
                          ) : (
                            <>
                              {ele.fullname}
                            </>
                          )}
                        </td>
                        <td>
                          <a href={globalVariables.ETHERSCAN_IO + ele.public} target="_blank">
                            {ele.public}
                          </a>
                        </td>
                        <td className="toggle_a_part">
                          <ToggleButton
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
                            value={itemList[key].is_detect}
                            thumbStyle={borderRadiusStyle}
                            trackStyle={borderRadiusStyle}
                            onToggle={(value) => onDetectIsMempool(value, key)} />
                          <a href="" id={"tooltip_detect_mempool" + key} onClick={(e) => onShowDetectLogs(e, ele.public, ele.fullname, ele._id, 0)}>
                            <i className="tim-icons icon-zoom-split" />
                          </a>
                          <a href="" id={"tooltip_detect_block" + key} onClick={(e) => onShowDetectLogs(e, ele.public, ele.fullname, ele._id, 1)}>
                            <i className="tim-icons icon-compass-05" />
                          </a>

                          <ReactTooltip
                            anchorId={'tooltip_detect_mempool' + key}
                            place="bottom"
                            variant="success"
                            content="Detected at Mempool"
                          />
                          <ReactTooltip
                            anchorId={'tooltip_detect_block' + key}
                            place="bottom"
                            variant="success"
                            content="Detected at Block"
                          />
                        </td>
                        {/* {ele.bnb} BNB, {ele.eth} ETH */}
                        <td>
                          <div className="toggle_b_part">
                            <Select
                              className="react-select-priority-2 info"
                              classNamePrefix="react-select-priority"
                              value={selectedMemOption.value}
                              onChange={(selectedMemOption) => onSetIsMempool(selectedMemOption, key)}
                              options={select_options}
                              defaultValue={{ value: ele.is_mempool, label: (select_options.filter(item => item.value === ele.is_mempool))[0]?.label }}
                            />
                            <p id={'tooltip_verfied_mempool_' + key}>
                              <i className={itemList[key].verified ? "tim-icons icon-check-2 verified-mempool-2" : "tim-icons icon-check-2 verified-mempool-1"} />
                            </p>
                            <ReactTooltip
                              anchorId={'tooltip_verfied_mempool_' + key}
                              place="bottom"
                              variant="success"
                              content={itemList[key].verified ? 'Verified' : 'Nothing Verified'}
                            />
                          </div>
                        </td>
                        <td>
                          <a href="" id={"tooltip_edit_your_name_" + key} onClick={(e) => onHandleEdit(e, key)} >
                            <i className="tim-icons icon-pencil edit-pencil" />
                          </a>
                          <ReactTooltip
                            anchorId={'tooltip_edit_your_name_' + key}
                            place="bottom"
                            variant="success"
                            content={"Edit your name @" + ele.fullname}
                          />
                        </td>
                        <td>
                          <Button onClick={(event) => confirmAlert({
                            title: 'Confirm to submit',
                            message: 'Are you sure to remove this wallet?',
                            buttons: [
                              {
                                label: 'Yes',
                                onClick: () => onRemoveWallet(event, key)
                              },
                              {
                                label: 'No',
                                onClick: () => { }
                              }
                            ]
                          })} className="btn-simple btn-round" color="danger">
                            <i className="tim-icons icon-simple-remove" />
                          </Button>
                        </td>
                      </tr>
                    ))
                  }
                </tbody>
              </table>
            </Col>
          )}
        </CardBody>
        <CardFooter></CardFooter>
      </Card>
    </>
  )
}

export default TraderPanel