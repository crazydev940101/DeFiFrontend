/**
 *  Created by Dragonslayer 6/22/2023
 */

import React, { useEffect, useState, useRef, useCallback } from "react";
import { confirmAlert } from 'react-confirm-alert';
import { ClipLoader, ScaleLoader } from "react-spinners";
import { Tooltip as ReactTooltip } from 'react-tooltip';
import Pagination from "replace-js-pagination";
import Select from 'react-select';

import {
    Button,
    Card, CardBody,
    CardFooter, CardHeader, Col, Row, Modal, Form, ListGroup, Label,
} from "reactstrap";
import { globalVariables, reduceString,} from '../../../../variables/variable.js';
import "./mainpanel.css";

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
    const { showNotify } = props;

    const borderRadiusStyle = { borderRadius: 2 };

    const [itemList, setItemList] = useState([]);
    const [loading, setLoading] = useState(false);
    const itemListRef = useRef();

    const [modalFlag, showModalFlag] = useState(false);
    const [keyTokenList, setKeyTokenList] = useState([]);
    const [pageCount, setPageCount] = useState(10);
    const [totalCount, setTotalCount] = useState(0);
    const [pageNumber, setPageNumber] = useState(1);
    const [buyFlag, setBuyFlag] = useState(false);

    const filterCountOption = [
        { value: 10, label: 10 },
        { value: 20, label: 20 },
        { value: 50, label: 50 },
    ];
    const filterBuyFlagOption = [
        { value: false, label: 'all' },
        { value: true, label: 'true' },
    ];
    const [selectedOption, setSelectedOption] = useState(filterCountOption[0]); // Set the default value here
    const [selectedBuyFlagOption, setSelectedBuyFlagOption] = useState(filterBuyFlagOption[0]); // Set the default value here

    //init
    useEffect(() => {
        /** 
         *  get all uniswap pair list
         */
        setLoading(true);
        async function getAllTokenLogs() {
            try {
                const payLoad = {
                    user_id: props.credential.loginUserName,
                    page_count: pageCount,
                    page_number: pageNumber,
                    // pageCount: totalPageCount,
                    buy_flag: buyFlag,
                    sort_type: 0
                };
                const response = await ApiCall(
                    apiConfig.get_logs.url,
                    apiConfig.get_logs.method,
                    props.credential.loginToken,
                    payLoad
                );
                if (response.data.tokenLogs) {
                    const updateData = response.data.tokenLogs;
                    updateData.map(item => { item.loadingGetCode = false; item.loadingForGoPlus = false; item.loadingForHoneyPot = false; item.loadingForRugPull = false; });
                    itemListRef.current = updateData;
                    if (isMounted()) {
                        setLoading(false);
                        setPageNumber(pageNumber);
                        setPageCount(pageCount);
                        setTotalCount(response.data.totalCount);
                        setItemList(itemListRef.current);
                    }
                }
            } catch (error) {
            }
        }
        getAllTokenLogs();

    }, [props.credential.loginToken, pageCount, pageNumber, buyFlag]);

    useEffect(() => {
        if (props.sendLoadingForGoPlusToMain) {
            const updateData = [...itemList];
            const key = props.sendLoadingForGoPlusToMain.key;
            updateData[key].loadingForGoPlus = props.sendLoadingForGoPlusToMain.flag;
            itemListRef.current = updateData;
            setItemList(itemListRef.current);
        }
    }, [props.sendLoadingForGoPlusToMain]);

    useEffect(() => {
        if (props.sendLoadingForHoneyToMain) {
            const updateData = [...itemList];
            const key = props.sendLoadingForHoneyToMain.key;
            updateData[key].loadingForHoneyPot = props.sendLoadingForHoneyToMain.flag;
            itemListRef.current = updateData;
            setItemList(itemListRef.current);
        }
    }, [props.sendLoadingForHoneyToMain]);

    useEffect(() => {
        if (props.sendLoadingForRugPullToMain) {
            const updateData = [...itemList];
            const key = props.sendLoadingForRugPullToMain.key;
            updateData[key].loadingForRugPull = props.sendLoadingForRugPullToMain.flag;
            itemListRef.current = updateData;
            setItemList(itemListRef.current);
        }
    }, [props.sendLoadingForRugPullToMain]);

    /**
     *  remove the uniswap token 
     */
    const onRemoveTokenLog = async (event, key) => {
        event.preventDefault();
        try {
            // const leng = itemList.length - 1 - key;
            const payLoad = {
                tokenlog_id: itemList[key]._id,
                user_id: props.credential.loginUserName
            };
            const response = await ApiCall(
                apiConfig.remove_tokenlog.url,
                apiConfig.remove_tokenlog.method,
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
                // const update = [...itemList];
                // const len = update.length;
                // update.splice(len - 1 - key, 1);
                // setItemList(update);
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
                apiConfig.remove_tokenlog.url,
                apiConfig.remove_tokenlog.method,
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

    const onHandlePageClick = async (pageNum) => {
        setPageNumber(pageNum);
    }

    const onHandleFilterByBuyFlag = async (selectedOption) => {
        setSelectedBuyFlagOption(selectedOption);
        setBuyFlag(selectedOption.value);
    }

    const onHandleFilterByCount = (selectedOption) => {
        setSelectedOption(selectedOption);
        setPageCount(selectedOption.value);
    }

    const onShowModalToGetCode = async (e, key) => {
        e.preventDefault();
        const updateData = [...itemList];
        updateData[key].loadingGetCode = true;
        setItemList(updateData);
        try {
            const payLoad = {
                user_id: props.credential.loginUserName,
                token_address: itemList[key].token_address
            };
            const response = await ApiCall(
                apiConfig.get_code.url,
                apiConfig.get_code.method,
                props.credential.loginToken,
                payLoad
            );
            if (response.status === 200 && response.data) {
                const updateData = [...itemList];
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
    }
    const onShowModalForGoPlus = async (e, key) => {
        e.preventDefault();
        const sendData = { token_address: itemList[key].token_address, key: key }
        props.sendTokenAddressToParent(sendData);
    }
    const onShowModalForHoneyPot = async (e, key) => {
        e.preventDefault();
        const sendData = { token_address: itemList[key].token_address, key: key }
        props.sendTokenAddressForHoneyToParent(sendData);
    }
    const onShowModalRugPool = async (e, key) => {
        e.preventDefault();
        const sendData = { token_address: itemList[key].token_address, key: key }
        props.sendTokenAddressForRugPullToParent(sendData);
    }
    const onShowGoPlusToConsole = (e, key) => {
        e.preventDefault();
        const data = JSON.parse(itemList[key].security);
        console.log('Current, ', data);
    }
    const onShowGoPlusNextToConsole = (e, key) => {
        e.preventDefault();
        const data = JSON.parse(itemList[key].security_next);
        console.log('Next, ', data);
    }


    return (
        <>
            <div className="content">
                <Row>
                    <Col md="12">
                        <Card>
                            <CardHeader>
                                <h5 className="title">Token Logs</h5>
                            </CardHeader>
                            <CardBody>
                                {loading ? (
                                    <div className="clip-loader"><ClipLoader color={globalVariables.GREEN} size="50px" /> </div>
                                ) : (
                                    <>
                                        <Row>
                                            <Col className="pr-md-1" md="6">
                                            </Col>
                                            <Col className="pr-md-1" md="2" style={{ alignSelf: 'center' }}>
                                                <label style={{ marginTop: '10px' }}>Filter By BuyFlag: </label>
                                                <Select
                                                    className="react-select-pagination info"
                                                    classNamePrefix="react-select-pagination"
                                                    defaultValue={selectedBuyFlagOption}
                                                    value={filterBuyFlagOption.value}
                                                    onChange={onHandleFilterByBuyFlag}
                                                    options={filterBuyFlagOption}
                                                />
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
                                            <Col className="pr-md-1 toggle_botton" md="2" style={{ textAlign: "right" }}>
                                                <Button className="btn-fill" color="green" type="submit" onClick={confirmationCheck} style={{ marginRight: "15px" }}>
                                                    Delete all
                                                </Button>
                                            </Col>
                                        </Row>

                                        <table className="table">
                                            <thead>
                                                <tr>
                                                    <th>#</th>
                                                    <th>Get code</th>
                                                    <th>Go Plus</th>
                                                    <th>Honey Pot</th>
                                                    <th>Rug Pull</th>
                                                    {/* <th>Console</th>
                                                    <th>Next</th> */}
                                                    <th>Token Address</th>
                                                    <th>Token Name</th>
                                                    <th>Buy Tax</th>
                                                    <th>Sell Tax</th>
                                                    <th>Buy Flag</th>
                                                    <th>Closed</th>
                                                    <th>Count</th>
                                                    <th>Action Name</th>
                                                    {/* <th>Action ID</th> */}
                                                    <th>Buy Percent</th>
                                                    <th>Total Supply</th>
                                                    <th>Eth Amount</th>
                                                    <th>Token Amount</th>
                                                    <th>Created</th>
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
                                                            <td className="scale-loader">
                                                                {
                                                                    ele.loadingForGoPlus ? (
                                                                        <ScaleLoader color="#14a800" size="50px" style={{ textAlign: 'center' }} />
                                                                    ) : (
                                                                        <a href="#" onClick={(e) => onShowModalForGoPlus(e, key)} className="btn-simple btn-round">
                                                                            <i className="tim-icons icon-zoom-split" />
                                                                        </a>
                                                                    )
                                                                }
                                                            </td>
                                                            <td className="scale-loader">
                                                                {
                                                                    ele.loadingForHoneyPot ? (
                                                                        <ScaleLoader color="#14a800" size="50px" style={{ textAlign: 'center' }} />
                                                                    ) : (
                                                                        <a href="#" onClick={(e) => onShowModalForHoneyPot(e, key)} className="btn-simple btn-round">
                                                                            <i className="tim-icons icon-zoom-split" />
                                                                        </a>
                                                                    )
                                                                }
                                                            </td>
                                                            <td className="scale-loader">
                                                                {
                                                                    ele.loadingForRugPull ? (
                                                                        <ScaleLoader color="#14a800" size="50px" style={{ textAlign: 'center' }} />
                                                                    ) : (
                                                                        <a href="#" onClick={(e) => onShowModalRugPool(e, key)} className="btn-simple btn-round">
                                                                            <i className="tim-icons icon-zoom-split" />
                                                                        </a>
                                                                    )
                                                                }
                                                            </td>
                                                            {/* <td className="scale-loader">
                                                                <a href="#" onClick={(e) => onShowGoPlusToConsole(e, key)} className="btn-simple btn-round">
                                                                    <i className="tim-icons icon-zoom-split" />
                                                                </a>
                                                            </td>
                                                            <td className="scale-loader">
                                                                <a href="#" onClick={(e) => onShowGoPlusNextToConsole(e, key)} className="btn-simple btn-round">
                                                                    <i className="tim-icons icon-zoom-split" />
                                                                </a>
                                                            </td> */}
                                                            <td style={{ whiteSpace: 'nowrap' }} id={'tooltip_token_address_' + key}>
                                                                <a href={globalVariables.ETHERSCAN_IO + ele.token_address} target="_blank">{reduceString(ele.token_address, 10)}</a>
                                                                &nbsp;&nbsp;&nbsp;&nbsp;<a href={globalVariables.DEXTOOL_PAIR_EXPLORER + ele.token_address} target="_blank"><i className="tim-icons icon-link-72" /></a>
                                                                <ReactTooltip
                                                                    anchorId={'tooltip_token_address_' + key}
                                                                    place="bottom"
                                                                    variant="success"
                                                                    content={ele.token_address}
                                                                />
                                                            </td>
                                                            <td id={'tooltip_token_name_' + key}>
                                                                {reduceString(ele.token_name, 15)}
                                                                <ReactTooltip
                                                                    anchorId={'tooltip_token_name_' + key}
                                                                    place="bottom"
                                                                    variant="success"
                                                                    content={ele.token_name}
                                                                />
                                                            </td>
                                                            <td>
                                                                {ele.buy_tax > 0 ? <b style={{ color: 'red' }}>{ele.buy_tax}</b> : ele.buy_tax === 0 ? ele.buy_tax : 0}
                                                            </td>
                                                            <td>
                                                                {ele.sell_tax > 0 ? <b style={{ color: 'red' }}>{ele.sell_tax}</b> : ele.sell_tax === 0 ? ele.sell_tax : 0}
                                                            </td>
                                                            <td>
                                                                {ele.buy_flag > 2 ? <b style={{ color: 'blue' }}>{ele.buy_flag}</b> : ele.buy_flag <= 2 && ele.buy_flag > 0 ? <b style={{ color: 'red' }}>{ele.buy_flag}</b> : ele.buy_flag === 0 ? ele.buy_flag : 'false'}

                                                            </td>
                                                            <td>
                                                                {ele.closed}
                                                            </td>
                                                            <td>
                                                                {ele.count}
                                                            </td>
                                                            <td id={'tooltip_token_action_name_' + key}>
                                                                {reduceString(ele.action_name, 30)}
                                                                <ReactTooltip
                                                                    anchorId={'tooltip_token_action_name_' + key}
                                                                    place="bottom"
                                                                    variant="success"
                                                                    content={ele.action_name}
                                                                />
                                                            </td>
                                                            {/* <td>
                                                                {ele.action}
                                                            </td> */}
                                                            <td id={'tooltip_token_buy_percent_' + key}>
                                                                {reduceString(ele.buy_percentage, 5)}
                                                                <ReactTooltip
                                                                    anchorId={'tooltip_token_buy_percent_' + key}
                                                                    place="bottom"
                                                                    variant="success"
                                                                    content={ele.buy_percentage}
                                                                />
                                                            </td>
                                                            <td id={'tooltip_total_supply_' + key}>
                                                                {reduceString(ele.total_supply, 5)}
                                                                <ReactTooltip
                                                                    anchorId={'tooltip_total_supply_' + key}
                                                                    place="bottom"
                                                                    variant="success"
                                                                    content={ele.total_supply}
                                                                />
                                                            </td>
                                                            <td id={'tooltip_eth_balance_' + key}>
                                                                {reduceString(ele.eth_balance, 5)} &nbsp; {globalVariables.BASE_TOKEN_SYMBOL}
                                                                <ReactTooltip
                                                                    anchorId={'tooltip_eth_balance_' + key}
                                                                    place="bottom"
                                                                    variant="success"
                                                                    content={ele.eth_balance}
                                                                />
                                                            </td>
                                                            <td id={'tooltip_token_balance_' + key}>
                                                                {reduceString(ele.token_balance, 5)}
                                                                <ReactTooltip
                                                                    anchorId={'tooltip_token_balance_' + key}
                                                                    place="bottom"
                                                                    variant="success"
                                                                    content={ele.token_balance}
                                                                />
                                                            </td>
                                                            <td>
                                                                {format('yyyy-MM-dd    hh:mm:ss O', new Date(ele.created))}
                                                            </td>
                                                            <td>
                                                                <Button onClick={(event) => onRemoveTokenLog(event, key)} className="btn-simple btn-round" color="danger">
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
                            <CardFooter>

                            </CardFooter>
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
    )
}

export default MainPanel