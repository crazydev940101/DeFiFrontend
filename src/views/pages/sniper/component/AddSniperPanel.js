/**
 *  Created by Dragonslayer 7/5/2023
 */

import React, { useEffect, useState, useRef, useCallback } from "react";
import { ClipLoader } from "react-spinners";
import Select from "react-select";

import {
    Col, Row, Modal, Form, Label, FormGroup, Input, Button
} from "reactstrap";
import { globalVariables, onSetLimitHtmlInput, onOnlyAllowNumeric, validateString } from '../../../../variables/variable.js';
import "./addsniperpanel.css";


function useIsMounted() {
    const mountedRef = useRef(false);
    const get = useCallback(() => mountedRef.current, []);
    useEffect(() => {
        mountedRef.current = true;
        return () => mountedRef.current = false;
    }, []);
    return get;
}

const AddSniperPanel = (props) => {
    const isMounted = useIsMounted();
    const { showNotify } = props;
    const [modalFlag, showModalFlag] = useState(false);
    const [newItem, setNewItem] = useState({
        token_address: '',
        owner_address: '',
        gas_price: 0, // gwei
        gas_limit: 300000, // number
        sell_price: 0,
        eth_amount: 0.05,
        token_amount: 0,
        initial_price: 0,
        rug_check: false,
        tx: '',
        delay: 0,
        time_block: 'block',
        type: 2,
        slippage: 10,
        sell_slippage: 10,
        base_gas_multiple: 2,
        max_priority_fee: 20,
        sell_multiple: 5,
        func_regex: '',
        func_name: '',
        func_description: '',
        auto: false,
        isLoading: false,
        exist: false
    });

    const [addressPrimaryOption, setAddPriOption] = useState([]);
    const [functionListOption, setFunctionListOption] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingBuyButton, setLoadingBuyButton] = useState(false);
    const [loadingMethod, setLoadingMethod] = useState(false);

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
                    setLoading(false);
                }
            } catch (error) {
                showNotify("Something went wrong", 'danger');
            }
        }
        getRegisteredWalletList();

        setLoadingMethod(true);
        async function getAllMethods() {
            try {
                const payLoad = {
                    user_id: props.credential.loginUserName,
                    status: 2
                };
                const response = await ApiCall(
                    apiConfig.get_signature.url,
                    apiConfig.get_signature.method,
                    props.credential.loginToken,
                    payLoad
                );
                if (response.status === 200 && response.data.signatures) {
                    if (isMounted()) {
                        const updateData = response.data.signatures.map(item => {
                            item.value = item.signature;
                            item.label = item.name;
                            item.func_regex = item.signature;
                            item.func_description = item.description;
                            item.func_name = item.name;
                            return item;
                        })
                        setFunctionListOption(updateData);
                        setLoadingMethod(false);
                    }
                }
            } catch (error) {
                if (error.response && typeof (error.response.data.message) === "string") showNotify(error.response.data.message, 'danger');
                else showNotify('Something went wrong', 'danger');
            }
        }
        getAllMethods();
    }, [props.credential.loginToken]);

    useEffect(() => {
        if (props.modalShowToAdd) {
            if (props.modalShowToAdd.flag) {
                showModalFlag(true);
            }
        }
    }, [props.modalShowToAdd])

    const onCloseModal = () => {
        showModalFlag(false);
    }

    const onAddToSniper = async () => {
        if (newItem.owner_address == "") {
            showNotify("Please input your address.", "danger");
            return;
        }
        if (!validateString(newItem.token_address, 'public')) {
            showNotify("Please check token address format", "danger");
            return;
        }
        if (newItem.func_regex == "") {
            showNotify("Please select start function.", "danger");
            return;
        }
        setLoadingBuyButton(true);
        try {
            newItem.user_id = props.credential.loginUserName;
            newItem.type = 2;
            const payLoad = JSON.parse(JSON.stringify(newItem));
            const response = await ApiCall(
                apiConfig.add_new.url,
                apiConfig.add_new.method,
                props.credential.loginToken,
                payLoad
            );
            if (response.status === 200 && response.data.sniper) {
                setNewItem({
                    token_address: '',
                    owner_address: '',
                    gas_price: 0, // gwei
                    gas_limit: 300000, // number
                    sell_price: 0,
                    eth_amount: 0.05,
                    token_amount: 0,
                    initial_price: 0,
                    rug_check: false,
                    tx: '',
                    delay: 0,
                    created: '',
                    time_block: 'block',
                    type: 2,
                    slippage: 10,
                    sell_slippage: 10,
                    base_gas_multiple: 2,
                    max_priority_fee: 20,
                    sell_multiple: 5,
                    func_regex: '',
                    func_name: '',
                    func_description: '',
                    auto: false,
                    isLoading: false,
                    exist: false
                });
                props.sendSniperDataToParent(response.data.sniper);
                showNotify(response.data.message, 'success');
            }
            setLoadingBuyButton(false);
            showModalFlag(false);
        } catch (error) {
            setLoadingBuyButton(false);
            if (error.response && typeof (error.response.data.message) === "string") {
                showNotify(error.response.data.message, 'danger');
            } else {
                showNotify("Something went wrong", 'danger');
            }
        }

    }

    return (
        <>
            <Modal modalClassName="modal-black mModal logs-page-modal" isOpen={modalFlag} >
                <div className="modal-header">
                    <h4>Add Sniper</h4>
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
                                <Col className="pr-md-1" md="6">
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
                                <Col className="pr-md-1" md="6">
                                    {loading ?
                                        (
                                            <ClipLoader color={globalVariables.GREEN} size="50px" />
                                        ) : (
                                            <FormGroup>
                                                <label>Token address</label>
                                                <Input
                                                    type="text"
                                                    value={newItem.token_address}
                                                    onChange={(e) =>
                                                        setNewItem({ ...newItem, token_address: e.target.value })
                                                    }
                                                />
                                            </FormGroup>
                                        )}
                                </Col>
                                <Col className="pr-md-1" md="12">
                                    <Row>
                                        <Col className="pr-md-1" md="4">
                                            <FormGroup>
                                                <label>ETH Amount</label>
                                                <Input
                                                    type="number"
                                                    value={newItem.eth_amount}
                                                    min={0}
                                                    onChange={(e) =>
                                                        setNewItem({ ...newItem, eth_amount: e.target.value })
                                                    }
                                                    onBlur={(e) =>
                                                        setNewItem({ ...newItem, eth_amount: onSetLimitHtmlInput(newItem.eth_amount, 0, null) })
                                                    }
                                                    onKeyPress={onOnlyAllowNumeric}
                                                />
                                            </FormGroup>
                                        </Col>
                                        <Col className="pr-md-1" md="4">
                                            <FormGroup>
                                                <label>Token Amount</label>
                                                <Input
                                                    type="number"
                                                    value={newItem.token_amount}
                                                    min={0}
                                                    onChange={(e) =>
                                                        setNewItem({ ...newItem, token_amount: e.target.value })
                                                    }
                                                    onBlur={(e) =>
                                                        setNewItem({ ...newItem, token_amount: onSetLimitHtmlInput(newItem.token_amount, 0, null) })
                                                    }
                                                    onKeyPress={onOnlyAllowNumeric}
                                                />
                                            </FormGroup>
                                        </Col>
                                        <Col className="pr-md-1" md="3">
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
                                    </Row>
                                </Col>
                                <Col className="pr-md-1" md="12">
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
                                                    onKeyPress={onOnlyAllowNumeric}
                                                />
                                            </FormGroup>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col className="pr-md-1" md="11">
                                            {loadingMethod ?
                                                (
                                                    <ClipLoader color={globalVariables.GREEN} size="50px" />
                                                ) : (
                                                    <FormGroup>
                                                        <label>Start Functions</label>
                                                        <Select
                                                            options={functionListOption}
                                                            className="react-select info"
                                                            classNamePrefix="react-select"
                                                            value={functionListOption.label}
                                                            onChange={(e) => {
                                                                setNewItem({ ...newItem, func_regex: e.value, func_description: e.description, func_name: e.name })
                                                            }}
                                                        >
                                                        </Select>
                                                    </FormGroup>
                                                )}
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col className="pr-md-1" md="4">
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
                                        <Col className="pr-md-1" md='4'>
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
                                        <Col className="pr-md-1" md='4'>
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
                                <Col className="pr-md-1" md="4">
                                    {loadingBuyButton ? (
                                        <div className="clip-loader">
                                            <ClipLoader color={globalVariables.GREEN} size="50px" />
                                        </div>
                                    ) : (
                                        <Button color="green" className="btn-fill" onClick={onAddToSniper}>
                                            + Add New Sniper
                                        </Button>
                                    )}
                                </Col>
                            </Row>
                        </Form>
                    </div>
                }
            </Modal>
        </>
    )
}

export default AddSniperPanel