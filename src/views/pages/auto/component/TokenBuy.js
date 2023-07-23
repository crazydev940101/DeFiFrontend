/**
 *  Created by Dragonslayer 6/22/2023
 */

import React, { useEffect, useState, useRef, useCallback, } from "react";
import { ClipLoader } from "react-spinners";
import { confirmAlert } from 'react-confirm-alert';
import Select from "react-select";
import ToggleButton from 'react-toggle-button';

import {
    Button, Col, FormGroup, Input, Row,
} from "reactstrap";
import { globalVariables, validateString, onSetLimitHtmlInput, onOnlyAllowNumeric } from '../../../../variables/variable.js';
import "./tokenbuy.css";

function useIsMounted() {
    const mountedRef = useRef(false);
    const get = useCallback(() => mountedRef.current, []);
    useEffect(() => {
        mountedRef.current = true;
        return () => mountedRef.current = false;
    }, []);
    return get;
}

const TokenBuy = (props) => {
    const isMounted = useIsMounted();
    const { apiConfig, ApiCall } = global;
    const { showNotify } = props;

    const [newItem, setNewItem] = useState({
        token_address: '',
        owner_address: '',
        gas_price: 0, // gwei
        gas_limit: 300000, // number
        sell_price: 0,
        ethAmount: 0.05,
        tokenAmount: 0,
        initial_price: 0,
        rug_check: false,
        tx: '',
        created: '',
        delay: 0,
        time_block: 'block',
        type: 1,
        slippage: 5,
        base_gas_multiple: 2,
        max_priority_fee: 20,
        sell_multiple: 5
    });

    const [loading, setLoading] = useState(false);
    const [loading_buy_button, setLoadingBuyButton] = useState(false);
    const [loading_estimate_gas_button, setLoadingEstimateGasButton] = useState(false);
    const [addressPrimaryOption, setAddPriOption] = useState([]);
    const [isStartAuto, setIsStartAuto] = useState(false);
    const [disabled, setDisabled] = useState(false);
    const borderRadiusStyle = { borderRadius: 2 };


    /**
     *      get all token pair logs history
     */
    useEffect(() => {
        /**
       * get informations about your primary wallets and trader's wallet registered.
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
                        setLoading(false);
                    }

                }
            } catch (error) {
                if (error.response && typeof (error.response.data.message) === "string") showNotify(error.response.data.message, 'danger');
                else showNotify('Something went wrong', 'danger');
            }
        }
        getRegisteredWalletList();

        async function getAutoBuyState() {
            try {
                const payLoad = {
                    user_id: props.credential.loginUserName
                };
                const response = await ApiCall(
                    apiConfig.get_auto_buy.url,
                    apiConfig.get_auto_buy.method,
                    props.credential.loginToken,
                    payLoad
                );
                if (response.status === 200) {
                    if (isMounted()) {
                        //   if(!response.data.is_start){
                        //     setIsStartAuto(false);
                        //     setDisabled(false);
                        //     console.log(1);
                        //   }else{
                        // setIsStartAuto(response.data.is_start);
                        const permission = { permission: true }
                        localStorage.setItem('permission', JSON.stringify(permission));
                        
                        if(response.data.is_start === null) {setIsStartAuto(false); setDisabled(false);}
                        else {setIsStartAuto(response.data.is_start);setDisabled(response.data.is_start)}
                        if (response.data.data) {
                            // setNewItem(response.data.data);
                            const responseData = response.data.data;
                            setNewItem({
                                owner_address: responseData.owner_address,
                                ethAmount: responseData.ethAmount,
                                tokenAmount: responseData.tokenAmount,
                                delay: responseData.delay,
                                slippage: responseData.slippage,
                                base_gas_multiple: responseData.base_gas_multiple,
                                max_priority_fee: responseData.max_priority_fee,
                                sell_multiple: responseData.sell_multiple,
                                gas_price: responseData.gas_price || 0, // gwei
                                gas_limit: responseData.gas_limit || 300000, // number
                                token_address: '',
                            });
                        }


                        //   }
                    }
                }
            } catch (error) {
            }
        }
        getAutoBuyState();
    }, [])

    useEffect(() => {
        const newData = { ...newItem };
        if (props.newAddressToTokenBuy) {
            newData.token_address = props.newAddressToTokenBuy.token_address;
            setNewItem(newData);
        }
    }, [props.newAddressToTokenBuy])


    /**
     *  confirm to buy or sell token
     */
    const confirmationCheck = () => {
        if (newItem.owner_address == "") {
            showNotify("Please choose your wallet account.", "danger");
            return;
        }
        if (!validateString(newItem.token_address, 'public')) {
            showNotify("Please check format of token's address.", "danger");
            return;
        }
        if (newItem.ethAmount == null) {
            showNotify("Please input maximum ether amount for Exact Ether.", "danger");
            return;
        }
        if (newItem.tokenAmount == null) {
            showNotify("Please input maximum ether amount for Exact Token.", "danger");
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
        confirmAlert({
            title: 'Confirm to submit',
            message: 'Are you sure to buy this token?',
            buttons: [
                {
                    label: 'Yes',
                    onClick: () => onAddHandler()
                },
                {
                    label: 'No',
                    onClick: () => { }
                }
            ]
        });
    }

    /**
     *  to buy token manually
     */

    const onAddHandler = async () => {
        if (newItem.owner_address == '') {
            showNotify("Please input your address.", "danger");
            return;
        }
        if (!validateString(newItem.token_address, 'public')) {
            showNotify("Please check format of token's address.", "danger");
            return;
        }
        setLoadingBuyButton(true);
        try {
            newItem.user_id = props.credential.loginUserName;
            newItem.type = 1;
            const payLoad = JSON.parse(JSON.stringify(newItem));
            const response = await ApiCall(
                apiConfig.manual_buy.url,
                apiConfig.manual_buy.method,
                props.credential.loginToken,
                payLoad
            );
            if (response.status === 200 && response.data.data) {
                const utils = {
                    loading_approve_button: false,
                    loading_sell_button: false,
                    loading_gas_button: false,
                    loading_price_button: false,
                }

                const responseData = { ...response.data.data, slippage: 5, estimationPrice: 0, percentage: 100, utils: utils, isApproveDisabled: false, isSellDisabled: false, is_rug: false, socket_message: '', isLoading: false, exist: false }
                props.sendNewItemToParent(responseData);

                // setNewItem({
                //     token_address: '',
                //     owner_address: '',
                //     gas_price: 0, // gwei
                //     gas_limit: 300000, // number
                //     sell_price: 0,
                //     ethAmount: 0.05,
                //     tokenAmount: 0,
                //     initial_price: 0,
                //     rug_check: false,
                //     tx: '',
                //     created: '',
                //     delay: 0,
                //     time_block: 'block',
                //     type: 1,
                //     slippage: 50,
                //     base_gas_multiple: 2,
                //     max_priority_fee: 20,
                //     sell_multiple: 5
                // });
                if (responseData.status === 200) {
                    showNotify(response.data.message, 'success');
                } else {
                    showNotify(response.data.message, 'danger');
                }
            }
            setLoadingBuyButton(false);
        } catch (error) {
            setLoadingBuyButton(false);
            if (error.response && typeof (error.response.data.message) === "string") {
                showNotify(error.response.data.message, 'danger');
            } else {
                showNotify("Something went wrong", 'danger');
            }
        }
    };


    /**
     *  to estimate gas before buy tokens  
     */
    const onHandleEstimateGas = async () => {
        // if (newItem.gas_price == null) {
        //     showNotify("Please input gas price.", "danger");
        //     return;
        // }
        // if (newItem.gas_limit == null) {
        //     showNotify("Please input gas limit.", "danger");
        //     return;
        // }
        setLoadingEstimateGasButton(true);
        try {
            newItem.user_id = props.credential.loginUserName;
            const payLoad = JSON.parse(JSON.stringify(newItem));
            const response = await ApiCall(
                apiConfig.estimateGas.url,
                apiConfig.estimateGas.method,
                props.credential.loginToken,
                payLoad
            );
            if (response.status === 200) {
                setNewItem({ ...newItem, gas_price: response.data.maxFeePerGas, gas_limit: response.data.maxGasLimit });
            }
            setLoadingEstimateGasButton(false);
            //if (response.data.data) setLogData(response.data.data);
        } catch (error) {
            if (error.response && typeof (error.response.data.message) === "string") {
                showNotify(error.response.data.message, 'danger');
            } else {
                showNotify("Something went wrong", 'danger');
            }
            setLoadingEstimateGasButton(false);
            // setNewItem({...newItem, gas_price: 100, gas_limit: 400000 });
        }

    }

    const onStartAuto = async (value) => {
        if (newItem.owner_address === '') {
            showNotify("Please choose your wallet.", "danger");
            return;
        }
        if (!localStorage.getItem('permission')) {
            showNotify("Permission Denied", "danger");
            return;
        }
        setIsStartAuto(!value);

        if (!value) setDisabled(true);
        else setDisabled(false);

        try {
            const payLoad = {
                owner_address: newItem.owner_address,
                ethAmount: newItem.ethAmount,
                tokenAmount: newItem.tokenAmount,
                delay: newItem.delay,
                slippage: newItem.slippage,
                base_gas_multiple: newItem.base_gas_multiple,
                max_priority_fee: newItem.max_priority_fee,
                sell_multiple: newItem.sell_multiple,
                user_id: props.credential.loginUserName,
                is_start: !value
            };
            const response = await ApiCall(
                apiConfig.set_auto_buy.url,
                apiConfig.set_auto_buy.method,
                props.credential.loginToken,
                payLoad
            );
            if (response.status === 200) {
            }
        } catch (error) {
            if (error.response && typeof (error.response.data.message) === "string") showNotify(error.response.data.message, 'danger');
            else showNotify('Something went wrong', 'danger');
        }
    }



    const onSetDefault = async () =>  {
        // setNewItem({
        //     token_address: '',
        //     owner_address: '',
        //     gas_price: 0, // gwei
        //     gas_limit: 300000, // number
        //     sell_price: 0,
        //     ethAmount: 0.05,
        //     tokenAmount: 0,
        //     initial_price: 0,
        //     rug_check: false,
        //     tx: '',
        //     created: '',
        //     delay: 0,
        //     time_block: 'block',
        //     type: 1,
        //     slippage: 5,
        //     base_gas_multiple: 2,
        //     max_priority_fee: 20,
        //     sell_multiple: 5
        // });

        try {
            const payLoad = {
                owner_address: newItem.owner_address,
                ethAmount: newItem.ethAmount,
                tokenAmount: newItem.tokenAmount,
                delay: newItem.delay,
                slippage: newItem.slippage,
                base_gas_multiple: newItem.base_gas_multiple,
                max_priority_fee: newItem.max_priority_fee,
                sell_multiple: newItem.sell_multiple,
                user_id: props.credential.loginUserName,
                gas_limit: newItem.gas_limit,
                gas_price: newItem.gas_price,
            };
            const response = await ApiCall(
                apiConfig.set_auto_buy.url,
                apiConfig.set_auto_buy.method,
                props.credential.loginToken,
                payLoad
            );
            if (response.status === 200 && response.data) {
                const responseData = response.data.autoSetting;
                setNewItem({
                    owner_address: responseData.owner_address,
                    ethAmount: responseData.ethAmount,
                    tokenAmount: responseData.tokenAmount,
                    delay: responseData.delay,
                    slippage: responseData.slippage,
                    base_gas_multiple: responseData.base_gas_multiple,
                    max_priority_fee: responseData.max_priority_fee,
                    sell_multiple: responseData.sell_multiple,
                    gas_price: responseData.gas_price, // gwei
                    gas_limit: responseData.gas_limit, // number
                    token_address: '',
                });
                showNotify(response.data.message, 'success');
            }
        } catch (error) {
            if (error.response && typeof (error.response.data.message) === "string") showNotify(error.response.data.message, 'danger');
            else showNotify('Something went wrong', 'danger');
        }
    }

    return (
        <>
            <Row>
                <Col className="pr-md-1" md="12">
                    <FormGroup>
                        <label>Your address</label>
                        {
                            loading ? (
                                <ClipLoader color={globalVariables.GREEN} size="50px" />
                            ) : (
                                <Select
                                    options={addressPrimaryOption}
                                    className="react-select info"
                                    classNamePrefix="react-select"
                                    value={{ value: newItem.owner_address, label: newItem.owner_address }}
                                    onChange={(e) => {
                                        setNewItem({ ...newItem, owner_address: e.value })
                                    }}
                                    isDisabled={disabled}
                                >
                                </Select>
                            )
                        }
                    </FormGroup>
                </Col>
            </Row>
            <Row>
                <Col className="pr-md-1" md="12">
                    <FormGroup>
                        <label>Token address</label>
                        <Input
                            type="text"
                            value={newItem.token_address}
                            onChange={(e) =>
                                setNewItem({ ...newItem, token_address: e.target.value })
                            }
                            disabled={disabled}
                        />
                    </FormGroup>
                </Col>
            </Row>
            <Row>
                <Col className="pr-md-1" md="6">
                    <FormGroup>
                        <label>ETH Maximum Limit for ExactETH</label>
                        <Input
                            type="number"
                            value={newItem.ethAmount}
                            min={0}
                            onChange={(e) =>
                                setNewItem({ ...newItem, ethAmount: e.target.value })
                            }
                            onBlur={(e) =>
                                setNewItem({ ...newItem, ethAmount: onSetLimitHtmlInput(newItem.ethAmount, 0, null) })
                            }
                            disabled={disabled}
                            onKeyPress={onOnlyAllowNumeric}
                        />
                    </FormGroup>
                </Col>
                <Col className="pr-md-1" md="6">
                    <FormGroup>
                        <label>Exact Token Amount</label>
                        <Input
                            type="number"
                            value={newItem.tokenAmount}
                            min={0}
                            onChange={(e) =>
                                setNewItem({ ...newItem, tokenAmount: e.target.value })
                            }
                            onBlur={(e) =>
                                setNewItem({ ...newItem, tokenAmount: onSetLimitHtmlInput(newItem.tokenAmount, 0, null) })
                            }
                            disabled={disabled}
                            onKeyPress={onOnlyAllowNumeric}
                        />
                    </FormGroup>
                </Col>
            </Row>
            <Row>
                <Col className="pr-md-1" md="6">
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
                            disabled={disabled}
                            onKeyPress={onOnlyAllowNumeric}
                        />
                    </FormGroup>
                </Col>
                <Col className="pr-md-1" md="6">
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
                            isDisabled={disabled}
                            onKeyPress={onOnlyAllowNumeric}
                        >
                        </Select>
                    </FormGroup>
                </Col>
            </Row>
            <Row>
                <Col className="pr-md-1" md="4">
                    <FormGroup>
                        <label>Gas price</label>
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
                            disabled={disabled}
                            onKeyPress={onOnlyAllowNumeric}
                        />
                    </FormGroup>
                </Col>
                <Col className="pr-md-1" md="4">
                    <FormGroup>
                        <label>Gas limit</label>
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
                            disabled={disabled}
                            onKeyPress={onOnlyAllowNumeric}
                        />
                    </FormGroup>
                </Col>
                <Col className="pr-md-1" md="4">
                    <FormGroup>
                        <label>Slippage</label>&nbsp;&nbsp;(<em>%</em>)
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
                            disabled={disabled}
                            onKeyPress={onOnlyAllowNumeric}
                        />
                    </FormGroup>
                </Col>
            </Row>
            <Row>
                <Col className="pr-md-1" md="4">
                    <FormGroup>
                        <label>Base Gas Multiple</label>
                        <Input
                            type="number"
                            value={newItem.base_gas_multiple}
                            min={0}
                            onChange={(e) =>
                                setNewItem({ ...newItem, base_gas_multiple: e.target.value })
                            }
                            onBlur={(e) =>
                                setNewItem({ ...newItem, base_gas_multiple: onSetLimitHtmlInput(newItem.base_gas_multiple, 0, null) })
                            }
                            disabled={disabled}
                            onKeyPress={onOnlyAllowNumeric}
                        />
                    </FormGroup>
                </Col>
                <Col className="pr-md-1" md="4">
                    <FormGroup>
                        <label>Max Priority Fee</label>
                        <Input
                            type="number"
                            value={newItem.max_priority_fee}
                            min={0}
                            onChange={(e) =>
                                setNewItem({ ...newItem, max_priority_fee: e.target.value })
                            }
                            onBlur={(e) =>
                                setNewItem({ ...newItem, max_priority_fee: onSetLimitHtmlInput(newItem.max_priority_fee, 0, null) })
                            }
                            disabled={disabled}
                            onKeyPress={onOnlyAllowNumeric}
                        />
                    </FormGroup>
                </Col>
                <Col className="pr-md-1" md="4">
                    <FormGroup>
                        <label>Auto Sell Multiple</label>
                        <Input
                            type="number"
                            value={newItem.sell_multiple}
                            min={0}
                            onChange={(e) =>
                                setNewItem({ ...newItem, sell_multiple: e.target.value })
                            }
                            onBlur={(e) =>
                                setNewItem({ ...newItem, sell_multiple: onSetLimitHtmlInput(newItem.sell_multiple, 0, null) })
                            }
                            disabled={disabled}
                            onKeyPress={onOnlyAllowNumeric}
                        />
                    </FormGroup>
                </Col>
            </Row>
            <Row>
                <Col className="pr-md-1" md="5">
                    {loading_estimate_gas_button ? (
                        <ClipLoader color={globalVariables.GREEN} size="50px" />
                    ) : (
                        <Button color="btn1" className="btn1" onClick={onHandleEstimateGas}>
                            Estimate Gas
                        </Button>

                    )
                    }
                </Col>
                <Col className="pr-md-1" md="3">
                    {loading_buy_button ? (
                        <ClipLoader color={globalVariables.GREEN} size="50px" />
                    ) : (
                        <Button color="btn1" className="btn1" onClick={confirmationCheck}>
                            Buy
                        </Button>
                    )
                    }
                    {/* <Button color="btn1" className="btn1" onClick={sellHandle}>
                    Sell
                </Button>
                <Button color="btn1" className="btn1" onClick={approveHandle}>
                    Approve
                </Button> */}
                </Col>
                <Col className="pr-md-1" md="4">
                    <Button color="btn1" className="btn1" onClick={onSetDefault}>
                        Set Default
                    </Button>
                </Col>
            </Row>
            <Row>
                <Col className="pr-md-1 toggle_botton" md="3" style={{marginTop: '15px'}}>
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
                        value={isStartAuto}
                        thumbAnimateRange={[1, 57]}
                        thumbStyle={borderRadiusStyle}
                        trackStyle={borderRadiusStyle}
                        onToggle={(value) => onStartAuto(value)} />
                    * Detect Pull
                </Col>
            </Row>
        </>
    )
}

export default TokenBuy