/**
 *  Created by Dragonslayer 6/22/2023
 */

import React, { useEffect, useState, useRef, useCallback } from "react";
import { ClipLoader } from "react-spinners";
import { confirmAlert } from "react-confirm-alert";
import classnames from "classnames";
import Select from 'react-select';

import {
    Card, CardBody, CardHeader, CardFooter, Col, FormGroup, InputGroup, Row, Input, Button, Modal, Form, CardTitle
} from "reactstrap";
import { globalVariables, onOnlyAllowNumeric, onSetLimitHtmlInput, validateString } from "../../../../variables/variable.js";
import "./ownerpanel.css";


const select_options = [
    { value: 0, label: 'Primary' },
    { value: 1, label: 'Secondary' },
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
const OwnerPanel = (props) => {
    const isMounted = useIsMounted();
    const { apiConfig, ApiCall } = global;
    const { showNotify } = props;

    const [itemList, setItemList] = useState([]);
    const [newItem, setNewItem] = useState({ fullname: '', newData: '' });
    const [loading, setLoading] = useState(false);
    const [selectedOption, setSelectedState] = useState('');
    const [password, setPasswordState] = useState('');
    const [publ, setPublState] = useState('');
    const [showpriv, showPrivState] = useState('');
    const [modalFlag, showModalFlag] = useState(false);
    const [name, setName] = useState('');
    const [modalWalletFlag, setModalWalletFlag] = useState(false);
    const itemListRef = useRef();

    const [transferItem, setTransferItem] = useState({ sender: '', receiver: '', other: '', ethAmount: 0 });
    const [addressPrimaryOption, setAddPriOption] = useState([]);
    const [ethBalance, setEthAmount] = useState();
    const [_key, setKey] = useState(0);
    const [otherDisabled, setOtherDisabled] = useState(true);
    /**
     *  get all your wallets from DB
     */
    useEffect(() => {
        setLoading(true);
        async function get_all_your_walletsDB() {
            try {
                const payLoad = {
                    _id: props.credential.loginUserName
                };
                const response = await ApiCall(
                    apiConfig.get_wallet.url,
                    apiConfig.get_wallet.method,
                    props.credential.loginToken,
                    payLoad
                );
                if (response.data.walletlist) {
                    if (isMounted()) {
                        itemListRef.current = response.data.walletlist;
                        itemListRef.current.map(item => {
                            item.label = item.fullname;
                            item.value = item.public;
                        })
                        setItemList((ele) => {
                            ele = itemListRef.current;
                            return ele;
                        });

                        const priOption = [...itemListRef.current];
                        priOption.push({ value: 'other', label: 'other' });
                        setAddPriOption(priOption);
                        setNewItem({ ...newItem, fullname: '', newData: '' });
                        setLoading(false);
                    }
                }
            } catch (error) {
                showNotify("Failed to get all of your wallets from DB.", "danger");
            }
        };
        get_all_your_walletsDB();
    }, []);

    /**
     *  add your new wallet to DB
     */
    const onAddNewWallet = async (e) => {
        e.preventDefault();
        if (newItem.fullname == "") {
            showNotify("Please input your name.", "danger");
            return;
        }
        if (newItem.newData.length !== 64) {
            showNotify("Please check your private key's format", "danger");
            return;
        }
        try {
            const payLoad = {
                fullname: newItem.fullname,
                newData: newItem.newData,
                type: 0,
                is_user: 0,
                _id: props.credential.loginUserName
            };
            const response = await ApiCall(
                apiConfig.add_wallet.url,
                apiConfig.add_wallet.method,
                props.credential.loginToken,
                payLoad
            );
            if (response.status === 200) {
                showNotify("New wallet has been added.", "success");
                setItemList((ele) => {
                    ele.push(response.data.wallet);
                    return ele;
                });
                setNewItem({ ...newItem, fullname: '', newData: '' });
            } else {
                showNotify(response.data.error, "danger");
            }
        } catch (error) {
            if (error.response && typeof (error.response.data.message) === "string") showNotify(error.response.data.message, 'danger');
            else showNotify("Failed to add your new wallet.", "danger");

        }

    };

    /**
     *  remove your wallets from DB
     */
    const onRemoveWallet = async (e, key) => {
        try {
            const payLoad = {
                obj_id: itemList[key]._id,
                _id: props.credential.loginUserName
            };
            const response = await ApiCall(
                apiConfig.remove_wallet.url,
                apiConfig.remove_wallet.method,
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

    /**
     *  show modal to get your private key
     */
    const onShowPrivateKeyModal = (e, key) => {
        var public_key = itemList[key].public;
        setPublState({ publ: public_key })
        showModalFlag(true);
    }

    /**
     *  Update your wallet priority whether is primary or secondary
     */
    const onHandlePriorityWallet = async (selectedOption, key) => {
        setSelectedState({ selectedOption: selectedOption })
        try {
            const payLoad = {
                public: itemList[key].public,
                type: selectedOption.value,
                _id: props.credential.loginUserName
            };
            const response = await ApiCall(
                apiConfig.update_priority.url,
                apiConfig.update_priority.method,
                props.credential.loginToken,
                payLoad
            );
            if (response.status === 200) {
                showNotify("Your wallet's priority has been changed.", "success");
            } else {
                showNotify(response.data.error, "danger");
            }
        } catch (error) {
            showNotify("Failed to change priority of your wallet.", "danger");
        }
    };

    /**
     *  get private key from your public address
     */

    const onGetPrivkeyFromPublic = async (e) => {
        e.preventDefault();
        showPrivState('');
        if (password == "") {
            showNotify("Please input your password", "danger");
            return;
        }
        try {
            const payLoad = {
                public: publ.publ,
                password: password,
                _id: props.credential.loginUserName
            };
            const response = await ApiCall(
                apiConfig.get_privkey.url,
                apiConfig.get_privkey.method,
                props.credential.loginToken,
                payLoad
            );
            if (response.status === 200) {
                showNotify("Please obtain your private key.", "success");
                showPrivState((e) => {
                    e = response.data.privkey;
                    return e;
                })
                // showModalFlag(false);
                // setNewData({ ...newsData,  fullname: '', newData:''});
            } else {
                showNotify(response.data.error, "danger");
            }
        } catch (error) {
            showNotify("Failed to get your private key.", "danger");
        }
    }

    const onCloseModal = () => {
        showModalFlag(false);
        showPrivState('');
        setPasswordState('');
    }

    const onShowModalToGenerateWallet = (e) => {
        e.preventDefault();
        setModalWalletFlag(true);
    }

    const onGenerateWallet = async (e) => {
        e.preventDefault();
        if (name == "") {
            showNotify("Please input your name", "danger");
            return;
        }
        try {
            const payLoad = {
                wallet_name: name,
                user_id: props.credential.loginUserName
            };
            const response = await ApiCall(
                apiConfig.generate.url,
                apiConfig.generate.method,
                props.credential.loginToken,
                payLoad
            );
            if (response.status === 200) {
                setModalWalletFlag(false);
                showNotify(response.data.message, "success");
                setItemList((prevItem) => [...prevItem, response.data.wallet]);
            }
        } catch (error) {
            if (error.response && typeof (error.response.data.message) === "string") showNotify(error.response.data.message, 'danger');
            else showNotify('Something went wrong', 'danger');
        }
    }

    const onCloseModalWallet = () => {
        setModalWalletFlag(false);
    }

    const onConfirmTransferEth = (event) => {
        if (transferItem.sender === "") {
            showNotify("Please choose sender address", "danger");
            return;
        }
        if (transferItem.receiver === '' && otherDisabled) {
            showNotify("Please choose receiver address", "danger");
            return;
        }
        if (transferItem.ethAmount === '') {
            showNotify("Please input eth amount to transfer", "danger");
            return;
        }
        if (transferItem.ethAmount > ethBalance) {
            showNotify("Please set eth amount less than your current balance", "danger");
            return;
        }
        if (!validateString(transferItem.other, 'public') && !otherDisabled) {
            showNotify("Please check your transfer wallet format", "danger");
            return;
        }

        confirmAlert({
            title: 'Confirm to submit',
            message: 'Are you sure to transfer eth?',
            buttons: [
                {
                    label: 'Yes',
                    onClick: (e) => onTransferEth(e)

                },
                {
                    label: 'No',
                    onClick: () => { }
                }
            ]
        })
    }

    const onTransferEth = async (e) => {
        // e.preventDefault();

        try {
            let recipientAddress = '';
            if (transferItem.other === '' || otherDisabled) {
                recipientAddress = transferItem.receiver;
            } else {
                recipientAddress = transferItem.other;
            }
            const payLoad = {
                sender_address: transferItem.sender,
                recipient_address: recipientAddress,
                eth_amount: transferItem.ethAmount,
                user_id: props.credential.loginUserName
            };
            const response = await ApiCall(
                apiConfig.transfer.url,
                apiConfig.transfer.method,
                props.credential.loginToken,
                payLoad
            );
            if (response.status === 200) {
                showNotify(response.data.message, "success");
                setTransferItem({ ...transferItem, sender: '', receiver: '', ethAmount: 0, other: '' });
            }
        } catch (error) {
            if (error.response && typeof (error.response.data.message) === "string") showNotify(error.response.data.message, 'danger');
            else showNotify("Something went wrong.", "danger");

        }
    }
    const onGetEthAmount = async (e) => {
        try {
            const payLoad = {
                wallet_address: e.public,
                user_id: props.credential.loginUserName
            };
            const response = await ApiCall(
                apiConfig.getETHBalance.url,
                apiConfig.getETHBalance.method,
                props.credential.loginToken,
                payLoad
            );
            if (response.status === 200) {
                setEthAmount(response.data.ethBalance);
            }
        } catch (error) {
        }
    }
    const onOtherAddress = (e) => {
        console.log(e);
        if (e.value === 'other') {
            setOtherDisabled(false);
        } else {
            setOtherDisabled(true);
            // setTransferItem({ ...transferItem, other: '' });
        }
    }
    const handleForceUpdate = () => {
        setKey(prevKey => prevKey + 1);
    };


    return (
        <>
            <Card>
                <CardHeader className="owner-wallet-title">
                    <h5 className="title">Your Wallet</h5>
                    <a href="#" onClick={(e) => onShowModalToGenerateWallet(e)} className="btn-simple btn-round"  >
                        <i className="tim-icons icon-simple-add edit-pencil-wallet" />
                    </a>
                </CardHeader>
                <CardBody>
                    <Row className="spacing-wallet">
                        <Col className="pr-md-1" md="6">
                            <CardTitle>Manage Wallet</CardTitle>
                            <FormGroup style={{ width: '70%' }}>
                                <InputGroup
                                    className={classnames({
                                        "input-group-focus": newItem.fullnameFocus,
                                    })}
                                ></InputGroup>
                                <label>Your Name</label>
                                <Input
                                    type="text"
                                    onFocus={(e) => setNewItem({ ...newItem, fullnameFocus: true })}
                                    onBlur={(e) => setNewItem({ ...newItem, fullnameFocus: false })}
                                    value={newItem.fullname}
                                    onChange={(e) => setNewItem({ ...newItem, fullname: e.target.value })}
                                />
                                <InputGroup
                                    className={classnames({
                                        "input-group-focus": newItem.newDataFocus,
                                    })}
                                ></InputGroup>
                                <label>Private Key</label>
                                <Input
                                    type="text"
                                    onFocus={(e) => setNewItem({ ...newItem, newDataFocus: true })}
                                    onBlur={(e) => setNewItem({ ...newItem, newDataFocus: false })}
                                    value={newItem.newData}
                                    onChange={(e) => setNewItem({ ...newItem, newData: e.target.value })}
                                />
                                <Button
                                    style={{ marginTop: '10px' }}
                                    className="btn-fill"
                                    color="green"
                                    type="button"
                                    onClick={onAddNewWallet}
                                >
                                    Add
                                </Button>
                            </FormGroup>
                            {loading ? (
                                <div className="clip-loader">
                                    <ClipLoader color={globalVariables.GREEN} size="50px" />
                                </div>
                            ) : (
                                <table className="table" style={{marginTop: '50px'}}>
                                    <thead>
                                        {
                                            itemList.length !== 0 &&
                                            <tr>
                                                <th>#</th>
                                                <th>Name</th>
                                                <th>Public Address</th>
                                                <th>Priority</th>
                                                <th>Reveal</th>
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
                                                        {ele.fullname}
                                                    </td>
                                                    <td>
                                                        <a href={globalVariables.ETHERSCAN_IO + ele.public} target="_blank">
                                                            {ele.public}
                                                        </a>
                                                    </td>
                                                    <td>
                                                        <Select
                                                            className="react-select-priority info"
                                                            classNamePrefix="react-select-priority"
                                                            value={selectedOption.value}
                                                            onChange={(selectedOption) => onHandlePriorityWallet(selectedOption, key)}
                                                            options={select_options}
                                                            defaultValue={{ value: ele.type, label: (select_options.filter(item => item.value === ele.type))[0]?.label }}
                                                        />
                                                    </td>
                                                    <td>
                                                    <Button onClick={(event) => onShowPrivateKeyModal(event, key)} className="btn-simple btn-round" style={{ color: "#14a800" }}>
                                                        <i className="tim-icons icon-key-25" />
                                                    </Button>
                                                </td>
                                                    {/* {ele.bnb} BNB, {ele.eth} ETH */}
                                                    <td>
                                                        <Button onClick={(event) => {
                                                            confirmAlert({
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
                                                            })
                                                        }} className="btn-simple btn-round" color="danger">
                                                            <i className="tim-icons icon-simple-remove" />
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))}
                                    </tbody>
                                </table>
                            )}
                        </Col>
                        <Col className="pr-md-1" md="6">
                            <CardTitle>Transfer Wallet</CardTitle>
                            {loading ?
                                (
                                    <ClipLoader color={globalVariables.GREEN} size="50px" />
                                ) : (
                                    <div>
                                        <FormGroup>
                                            <label>Sender address</label> &nbsp; &nbsp; &nbsp;
                                            <label><b style={{ fontSize: 'medium' }}>{ethBalance ? ethBalance : 0}</b>&nbsp;{globalVariables.BASE_TOKEN_SYMBOL}</label>
                                            <Select
                                                key={_key}
                                                options={addressPrimaryOption.filter(item => item.value !== "other")}
                                                className="react-select info"
                                                classNamePrefix="react-select"
                                                value={{ value: transferItem.sender, label: transferItem.sender }}
                                                onChange={(e) => {
                                                    setTransferItem({ ...transferItem, sender: e.value });
                                                    onGetEthAmount(e);
                                                    handleForceUpdate();
                                                }}
                                                isOptionDisabled={(option) => option.value === transferItem.receiver}
                                            >
                                            </Select>
                                        </FormGroup>
                                        <FormGroup>
                                            <label>Receiver address</label>
                                            <Select
                                                key={_key}
                                                options={addressPrimaryOption}
                                                className="react-select info"
                                                classNamePrefix="react-select"
                                                value={{ value: transferItem.receiver, label: transferItem.receiver }}
                                                onChange={(e) => {
                                                    setTransferItem({ ...transferItem, receiver: e.value });
                                                    onOtherAddress(e);
                                                    handleForceUpdate();
                                                }}
                                                isOptionDisabled={(option) => option.value === transferItem.sender}
                                            >
                                            </Select>
                                        </FormGroup>
                                        <FormGroup>
                                            <InputGroup
                                                className={classnames({
                                                    "input-group-focus": transferItem.other_newDataFocus,
                                                })}
                                            ></InputGroup>
                                            <label>Other Address to transfer</label>
                                            <Input
                                                type="text"
                                                onFocus={(e) => setTransferItem({ ...transferItem, other_newDataFocus: true })}
                                                onBlur={(e) => setTransferItem({ ...transferItem, other_newDataFocus: false })}
                                                value={transferItem.other}
                                                onChange={(e) => setTransferItem({ ...transferItem, other: e.target.value })}
                                                disabled={otherDisabled}
                                            />
                                        </FormGroup>
                                        <FormGroup>
                                            <label>Amount(ETH)</label>
                                            <Input
                                                type="number"
                                                value={transferItem.ethAmount}
                                                min={0}
                                                onChange={(e) =>
                                                    setTransferItem({ ...transferItem, ethAmount: e.target.value })
                                                }
                                                onBlur={(e) =>
                                                    setTransferItem({ ...transferItem, ethAmount: onSetLimitHtmlInput(transferItem.ethAmount, 0, null) })
                                                }
                                                onKeyPress={onOnlyAllowNumeric}
                                            />
                                        </FormGroup>
                                        <FormGroup>
                                            <Button
                                                style={{ marginTop: '10px' }}
                                                className="btn-fill"
                                                color="green"
                                                type="button"
                                                onClick={(event) => onConfirmTransferEth(event)

                                                }
                                            >
                                                Click To Transfer
                                            </Button>
                                        </FormGroup>
                                    </div>
                                )}
                        </Col>
                    </Row>
                </CardBody>
                <CardFooter></CardFooter>
            </Card>

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
                                                setPasswordState(e.target.value)
                                            }
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    onGetPrivkeyFromPublic(e);
                                                }
                                            }}
                                        />
                                        <label>{showpriv}</label>
                                    </FormGroup>
                                </Col>
                                <Col className="pr-md-1" md="12">
                                    <Button color="btn1" className="btn1" onClick={onGetPrivkeyFromPublic}>
                                        Reveal
                                    </Button>
                                </Col>
                            </Row>
                        </Form>
                    </div>
                }
            </Modal>

            <Modal modalClassName="modal-black mModal" isOpen={modalWalletFlag} style={{ top: "150px" }}>
                <div className="modal-header">
                    <h4>Generate Wallet</h4>
                    <button
                        aria-label="Close"
                        className="close"
                        data-dismiss="modal"
                        type="button"
                        onClick={() => onCloseModalWallet()}
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
                                        <label>Please input your name to generate wallet</label>
                                        <Input
                                            placeholder="type your name"
                                            type="text"
                                            value={name}
                                            onChange={(e) =>
                                                setName(e.target.value)
                                            }
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    onGenerateWallet(e);
                                                }
                                            }}
                                        />
                                    </FormGroup>
                                </Col>
                                <Col className="pr-md-1" md="12">
                                    <Button color="btn1" className="btn1" onClick={onGenerateWallet}>
                                        Generate
                                    </Button>
                                </Col>
                            </Row>
                        </Form>
                    </div>
                }
            </Modal>
        </>
    )
}

export default OwnerPanel