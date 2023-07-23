/**
 *  Created by Dragonslayer 6/22/2023
 */

import React, { useEffect, useState, useRef, useCallback } from "react";
import { ClipLoader } from "react-spinners";
import Select from "react-select";

import {
  Card, CardBody, CardHeader, CardTitle, Form, FormGroup, Col, Button, Row, Input
} from "reactstrap";

import { globalVariables, onSetLimitHtmlInput, onOnlyAllowNumeric } from "../../../../variables/variable";
import "./addnewpanel.css";


function useIsMounted() {
  const mountedRef = useRef(false);
  const get = useCallback(() => mountedRef.current, []);
  useEffect(() => {
    mountedRef.current = true;
    return () => mountedRef.current = false;
  }, []);
  return get;
}

const AddNewPanel = (props) => {
  const isMounted = useIsMounted();
  const { apiConfig, ApiCall } = global;
  const { showNotify } = props;

  const [newItem, setNewItem] = useState({
    owner_address: '', trader_address: '',
    eth_for_exa_eth: 0.05, eth_for_exa_token: 0, delay: 0, time_block: 'block',
    gas_limit: 0, gas_price: 0, sell_price: 0, slippage: 10, sell_slippage: 10, rug_check: false, ethAmountAdd: 0,
  });
  const [addressPrimaryOption, setAddPriOption] = useState([]);
  const [followerOption, setFolOption] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    /**
    *    get owner and follower's wallet address
    */
    setLoading(true);
    async function getRegisteredWalletList() {
      try {
        const payLoad = {
          user_id: props.credential.loginUserName
        };
        const response = await ApiCall(
          apiConfig.get_registered_wallet_list.url,
          apiConfig.get_registered_wallet_list.method,
          props.credential.loginToken,
          payLoad,
        );
        if (response.status === 200 && isMounted()) {
          if (response.data.userAddressList) {
            setAddPriOption(response.data.userAddressList);
          }
          if (response.data.followList) {
            setFolOption(response.data.followList);
          }
          setLoading(false);
        }
      } catch (error) {
        showNotify("Something went wrong", 'danger');
      }
    }
    getRegisteredWalletList();
  }, [props.credential.loginToken]);



  /**
   *  to add new follow
   */
  const onAddNewFollow = async (e) => {
    e.preventDefault();
    if (newItem.owner_address == "") {
      showNotify("Please choose your wallet account.", "danger");
      return;
    }
    if (newItem.trader_address == "") {
      showNotify("Please choose follower's address.", "danger");
      return;
    }
    if (newItem.eth_for_exa_eth == null) {
      showNotify("Please input maximum ether amount for Exact Ether.", "danger");
      return;
    }
    if (newItem.eth_for_exa_token == null) {
      showNotify("Please input maximum ether amount for Exact Token.", "danger");
      return;
    }
    if (newItem.delay == null) {
      showNotify("Please input delay amount.", "danger");
      return;
    }
    if (newItem.gas_limit == null) {
      showNotify("Please input gas limit.", "danger");
      return;
    }
    if (newItem.gas_price == null) {
      showNotify("Please input gas price.", "danger");
      return;
    }
    if (newItem.sell_price == null) {
      showNotify("Please input sell price.", "danger");
      return;
    }
    try {
      const payLoad = {
        owner_address: newItem.owner_address,
        trader_address: newItem.trader_address,
        eth_for_exa_eth: newItem.eth_for_exa_eth,
        eth_for_exa_token: newItem.eth_for_exa_token,
        delay: newItem.delay,
        time_block: newItem.time_block,
        gas_limit: newItem.gas_limit,
        gas_price: newItem.gas_price,
        sell_price: newItem.sell_price,
        slippage: newItem.slippage,
        sell_slippage: newItem.sell_slippage,
        user_id: props.credential.loginUserName,
      };
      const response = await ApiCall(
        apiConfig.add_new_follow.url,
        apiConfig.add_new_follow.method,
        props.credential.loginToken,
        payLoad
      );
      if (response.status === 200 && response.data.follow) {
        const utils = {
          loading_buy_button: false,
          loading_sell_button: false,
          loading_approve_button: false,
          loading_price_button: false,
          loading_gas_button: false,
          loading_selected_token: false
        }

        const responseData = { ...response.data.follow, tokens: [], is_visible: 'none', count: 0, utils: utils, isApproveDisabled: false, isSellDisabled: false }
        props.sendNewFollowToParent(responseData);

        setNewItem({
          ...newItem, owner_address: '', trader_address: '',
          eth_for_exa_eth: 0.05, eth_for_exa_token: 0, delay: 0, time_block: 'block',
          gas_limit: 0, gas_price: 0, sell_price: 0, slippage: 10, sell_slippage: 10, rug_check: false, ethAmountAdd: 0,
        });

        showNotify("New follow has been added.", "success");
      } else {
        // showNotify(response.data.error, "danger");
      }
    } catch (error) {
      if (error.response && typeof (error.response.data.message) === "string") showNotify(error.response.data.message, 'danger');
      else showNotify('Failed to add a new follow.', 'danger');
    }

  };


  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle tag="h4">Following</CardTitle>
        </CardHeader>
        <CardBody>
          <Form className="form1">
            <Row>
              <Col className="pr-md-1" md="4">
                {loading ?
                  (
                    <ClipLoader color={globalVariables.GREEN} size="50px" />
                  ) : (
                    <FormGroup>
                      <label>Your address</label>
                      <Select
                        options={addressPrimaryOption}
                        className="react-select info"
                        classNamePrefix="react-select"
                        value={{ value: newItem.owner_address, label: newItem.owner_address }}
                        onChange={(e) => {
                          setNewItem({ ...newItem, owner_address: e.value })
                        }}
                      >
                      </Select>
                    </FormGroup>
                  )}
              </Col>
              <Col className="pr-md-1" md="4">
                {loading ?
                  (
                    <ClipLoader color={globalVariables.GREEN} size="50px" />
                  ) : (
                    <FormGroup>
                      <label>Follower's address</label>
                      <Select
                        options={followerOption}
                        className="react-select info"
                        classNamePrefix="react-select"
                        value={{ value: newItem.trader_address, label: newItem.trader_address }}
                        onChange={(e) => {
                          setNewItem({ ...newItem, trader_address: e.value })
                        }}
                      >
                      </Select>
                    </FormGroup>
                  )}
              </Col>
              <Col className="pr-md-1" md="12">
                <Row>
                  <Col className="pr-md-1" md="2">
                    <FormGroup>
                      <label>ETH Maximum Limit for ExactETH</label>
                      <Input
                        type="number"
                        value={newItem.eth_for_exa_eth}
                        min={0}
                        onChange={(e) =>
                          setNewItem({ ...newItem, eth_for_exa_eth: e.target.value })
                        }
                        onBlur={(e) =>
                          setNewItem({ ...newItem, eth_for_exa_eth: onSetLimitHtmlInput(newItem.eth_for_exa_eth, 0, null) })
                        }
                        onKeyPress={onOnlyAllowNumeric}
                      />
                    </FormGroup>
                  </Col>
                  <Col className="pr-md-1" md="2">
                    <FormGroup>
                      <label>ETH Maximum Limit for ExactToken</label>
                      <Input
                        type="number"
                        value={newItem.eth_for_exa_token}
                        min={0}
                        onChange={(e) =>
                          setNewItem({ ...newItem, eth_for_exa_token: e.target.value })
                        }
                        onBlur={(e) =>
                          setNewItem({ ...newItem, eth_for_exa_token: onSetLimitHtmlInput(newItem.eth_for_exa_token, 0, null) })
                        }
                        onKeyPress={onOnlyAllowNumeric}
                      />
                    </FormGroup>
                  </Col>
                  <Col className="pr-md-1" md="2">
                    <FormGroup>
                      <label>delay</label>
                      <Input
                        type="number"
                        value={newItem.delay}
                        min={0}
                        onChange={(e) =>
                          setNewItem({ ...newItem, delay: e.target.value })
                        }
                        onBlur={(e) =>
                          setNewItem({ ...newItem, delay: onSetLimitHtmlInput(newItem.delay, 0, null) })
                        }
                        onKeyPress={onOnlyAllowNumeric}
                      />
                    </FormGroup>
                  </Col>
                  <Col className="pr-md-1" md="2">
                    <FormGroup>
                      <label>time/block</label>
                      <Select
                        options={[
                          {
                            value: 'block',
                            label: 'block',
                          },
                          {
                            value: 'second',
                            label: 'second'
                          },
                        ]}
                        className="react-select info"
                        classNamePrefix="react-select"
                        value={{ value: newItem.time_block, label: newItem.time_block }}
                        onChange={(e) => {
                          setNewItem({ ...newItem, time_block: e.value })
                        }}
                      >
                      </Select>
                    </FormGroup>
                  </Col>
                </Row>
              </Col>
              <Col className="pr-md-1" md="12">
                <Row>
                  <Col className="pr-md-1" md="2">
                    <FormGroup>
                      <label>GasPrice(in gwei)</label>
                      <Input
                        type="number"
                        value={newItem.gas_price}
                        min={0}
                        onChange={(e) =>
                          setNewItem({ ...newItem, gas_price: e.target.value })
                        }
                        onBlur={(e) =>
                          setNewItem({ ...newItem, gas_price: onSetLimitHtmlInput(newItem.gas_price, 0, null) })
                        }
                        onKeyPress={onOnlyAllowNumeric}
                      />
                    </FormGroup>
                  </Col>
                  <Col className="pr-md-1" md="2">
                    <FormGroup>
                      <label>GasLimit(in general &gt; 4000000)</label>
                      <Input
                        type="number"
                        value={newItem.gas_limit}
                        min={0}
                        onChange={(e) =>
                          setNewItem({ ...newItem, gas_limit: e.target.value })
                        }
                        onBlur={(e) =>
                          setNewItem({ ...newItem, gas_limit: onSetLimitHtmlInput(newItem.gas_limit, 0, null) })
                        }
                        onKeyPress={onOnlyAllowNumeric}
                      />
                    </FormGroup>
                  </Col>
                  <Col className="pr-md-1" md="2">
                    <FormGroup>
                      <label>Sell price(unit - {globalVariables.BASE_TOKEN_SYMBOL}..  this is optional)</label>
                      <Input
                        type="Number"
                        value={newItem.sell_price}
                        min={0}
                        onChange={(e) =>
                          setNewItem({ ...newItem, sell_price: e.target.value })
                        }
                        onBlur={(e) =>
                          setNewItem({ ...newItem, sell_price: onSetLimitHtmlInput(newItem.sell_price, 0, null) })
                        }
                        onKeyPress={onOnlyAllowNumeric}
                      />
                    </FormGroup>
                  </Col>
                </Row>
                <Row>
                  <Col className="pr-md-1" md='2'>
                    <FormGroup>
                      <label>Buy Slippage</label>&nbsp;&nbsp;(<em>%</em>)
                      <Input
                        type="number"
                        value={newItem.slippage}
                        min={0}
                        max={100}
                        onChange={(e) =>
                          setNewItem({ ...newItem, slippage: e.target.value })
                        }
                        onBlur={(e) =>
                          setNewItem({ ...newItem, slippage: onSetLimitHtmlInput(newItem.slippage, 0, 100) })
                        }
                        onKeyPress={onOnlyAllowNumeric}
                      />
                    </FormGroup>
                  </Col>
                  <Col className="pr-md-1" md='2'>
                    <FormGroup>
                      <label>Sell Slippage</label>&nbsp;&nbsp;(<em>%</em>)
                      <Input
                        type="number"
                        value={newItem.sell_slippage}
                        min={0}
                        max={100}
                        onChange={(e) =>
                          setNewItem({ ...newItem, sell_slippage: e.target.value })
                        }
                        onBlur={(e) =>
                          setNewItem({ ...newItem, sell_slippage: onSetLimitHtmlInput(newItem.sell_slippage, 0, 100) })
                        }
                        onKeyPress={onOnlyAllowNumeric}
                      />
                    </FormGroup>
                  </Col>
                </Row>
              </Col>
              <Col className="pr-md-1" md="2">
                <Button color="btn1" className="btn1" onClick={onAddNewFollow}>
                  + Add new Follow
                </Button>
              </Col>
              {/* <Col className="pr-md-1" md="2">
                <Button color="btn1" className="btn1" onClick={onEstimateGas}>
                    Estimate Gas
                </Button>
              </Col> */}
            </Row>
          </Form>
        </CardBody>
      </Card>
    </>
  )
}

export default AddNewPanel