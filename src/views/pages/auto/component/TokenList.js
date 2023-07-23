/**
 *  Created by Dragonslayer 6/22/2023
 */

import React, { useEffect, useState, useRef, useCallback } from "react";
import { ClipLoader } from "react-spinners";
import { ReadMoreReadLess } from "react-readmore-and-readless";
import { Tooltip as ReactTooltip } from 'react-tooltip';
import ToggleButton from 'react-toggle-button';
import empty from "empty-lite/src/empty";
import { CandleChart } from "../../../components/chartCandle.js";
import { LineChart } from "../../../components/chartLine.js";

import {
    Button, Card, CardBody, CardHeader, CardTitle, Col, FormGroup, Input, Row, CardText, CardFooter
} from "reactstrap";

import { onDetectGas, onEstimatePrice, onSellHandle, onApproveHandle, onDetectRugPool, onRemoveToken } from "../../../../views/pages/component/TokenModule.js";
import { globalVariables, onSetLimitHtmlInput, onOnlyAllowNumeric } from '../../../../variables/variable.js';
import "./tokenlogs.css";

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

const TokenList = (props) => {
    const isMounted = useIsMounted();
    const { apiConfig, ApiCall } = global;
    const [itemList, setItemList] = useState([]);
    const [loadingAllData, setLoadingAllData] = useState(false);
    const [initialData, setInitialData] = useState({});
    // const [isloading, setIsLoading] = useState(false);
    const [sell_button, setSellButton] = useState({
        opacity: "1",
        pointerEvents: "initial"
    })

    const { showNotify } = props;
    const borderRadiusStyle = { borderRadius: 2 };
    const socket = props.socket;
    const itemListRef = useRef(itemList); // Create a ref and assign the initial value

    useEffect(() => {
        const responseData = props.sendNewTokenToList;
        const condition = (item) => (responseData.status === 200 && item.status === 200) && (item.token_address.toLowerCase() === responseData.token_address.toLowerCase() && item.owner_address.toLowerCase() === responseData.owner_address.toLowerCase());
        const index = itemList.findIndex(condition);
        const jsonArray = itemList.filter(item => {
            return responseData.status !== 200 || item.status !== 200 || item.token_address.toLowerCase() !== responseData.token_address.toLowerCase() || item.owner_address.toLowerCase() !== responseData.owner_address.toLowerCase();
        });
        if (index >= 0) {
            //   jsonArray.splice(index, 0, responseData);
            //   setItemList(jsonArray);
            itemListRef.current = [...jsonArray];
            itemListRef.current.unshift(responseData);
            setItemList(itemListRef.current);
        } else {
            itemListRef.current = [...itemList];
            itemListRef.current.unshift(responseData);
            setItemList(itemListRef.current);
        }
    }, [props.sendNewTokenToList])


    useEffect(() => {
        /**
         *  ontain all pending datas from DB
         */
        setLoadingAllData(true);
        async function getPendingList() {
            try {
                const payLoad = {
                    user_id: props.credential.loginUserName,
                    type: 1,
                    pending: true
                };
                const response = await ApiCall(
                    apiConfig.get_pending_lists.url,
                    apiConfig.get_pending_lists.method,
                    props.credential.loginToken,
                    payLoad,
                );
                if (response.status === 200 && isMounted()) {
                    if (response.data.pendingLists) {
                        const updatePending = response.data.pendingLists.map(pending => {
                            const utils = {
                                loading_approve_button: false,
                                loading_sell_button: false,
                                loading_gas_button: false,
                                loading_price_button: false,
                            }
                            return { ...pending, slippage: 5, estimationPrice: 0, percentage: 100, utils: utils, is_rug: false, isApproveDisabled: pending.approved, isSellDisabled: false, socket_message: '' }
                        });
                        itemListRef.current = updatePending;
                        setItemList(itemListRef.current);
                        /** init loading flag array to get all pending list */
                        setLoadingAllData(false);
                    }
                }
            } catch (error) {
                showNotify("Something went wrong", 'danger');
            }
        }
        getPendingList();

    }, []);

    /**
     *    Detect rug pull by socket.io
     */

    const newTokenBuyingback = useCallback(data => {
        if (data) {
            const updateData = [...itemList];
            updateData.unshift({ ...data, isLoading: true })
            itemListRef.current = updateData;
            setItemList(itemListRef.current);
        }
    })
    const newTokenBoughtCallback = useCallback(data => {
        const newData = data.data;
        if (newData) {
            if (!data.exist) {
                const tempData = itemListRef.current.map(item => {
                    if (item?.token_address?.toLowerCase() === newData?.token_address?.toLowerCase()) {
                        const utils = {
                            loading_approve_button: false,
                            loading_sell_button: false,
                            loading_gas_button: false,
                            loading_price_button: false,
                        }
                        const update = { ...item, ...newData, utils: utils, slippage: 5, estimationPrice: 0, percentage: 100, isApproveDisabled: false, isSellDisabled: false, is_rug: false, socket_message: '', isLoading: false, exist: false };
                        return update

                    } else {
                        return item;
                    }
                })
                itemListRef.current = tempData
                setItemList(itemListRef.current);
            } else {
                // const tempData = updateData.filter(item => item.token_address === data.data.token_address);
                const tempData = itemListRef.current.map(item => {
                    return item;
                }).filter(element => element?.token_address?.toLowerCase() !== newData?.token_address?.toLowerCase() || element.isLoading)


                if (tempData) {
                    const finalData = tempData.map(item => {
                        if (item?.token_address?.toLowerCase() === newData?.token_address?.toLowerCase()) {
                            const utils = {
                                loading_approve_button: false,
                                loading_sell_button: false,
                                loading_gas_button: false,
                                loading_price_button: false,
                            }
                            const update = { ...item, ...newData, utils: utils, slippage: 5, estimationPrice: 0, percentage: 100, isApproveDisabled: false, isSellDisabled: false, is_rug: false, socket_message: '', isLoading: false, exist: false };
                            return update

                        } else {
                            return item;
                        }
                    })
                    itemListRef.current = tempData
                    setItemList(itemListRef.current);
                }

                // tempData.map(item => {
                //     if(!item.exist){
                //         return undefined;
                //     }
                //     return item;
                // }).filter(element => element !== undefined);
            }
        }
        // updateData.map((item, key) => {
        //     if(!data.newData.exist && (item.token_address === data.newData.token_address)) {
        //         item = {...item, ...data.newData, isLoading: false, exist: false};                
        //         console.log(11, item);
        //     }else if(data.newData.exist && (item.token_address === data.newData.token_address)){

        //     }else{
        //         console.log('error');
        //     }
        //     return item;
        // })
        // if(data.token_address === )
        // setIsLoading(true);

        // itemList.unshift(data);
        // setItemList(itemList);


        // const updateData = [...itemList];
        // updateData.unshift({...data, isLoading: true}) 


    })

    const rugPoolCallback = useCallback(data => {
        if (data) {
            var index = -1;
            const updateList = [...itemList];
            updateList.forEach((value, i) => {
                if (value._id === data.token_id) {
                    index = i;
                }
            })
            if (index > -1) {
                updateList[index].is_rug = data.status; // status:    0, 1  (0 - danger color, 1- green color)
                updateList[index].socket_message = data.message;
                itemListRef.current = updateList;
                setItemList(itemListRef.current);
            }
        }
    })

    const tokenWatchCallback = useCallback(data => {
        if (data) {
            var index = -1;
            const updateData = [...itemList];
            updateData.forEach((value, i) => {
                if (value._id === data.token_id) {
                    index = i;
                }
            })
            if (index > -1) {
                updateData[index].estimationPrice = data.estPrice;
                itemListRef.current = updateData;
                setItemList(itemListRef.current);
            }
        }
    })
    useEffect(() => {
        if (socket) {
            socket.on("token:rugpool", rugPoolCallback);
            socket.on("test:buying", newTokenBuyingback);
            socket.on("test:bought", newTokenBoughtCallback);
            socket.on("token:watch", tokenWatchCallback);
            return () => {
                if (socket) {
                    socket.off("token:rugpool", rugPoolCallback);
                    socket.off("test:buying", newTokenBuyingback);
                    socket.on("test:bought", newTokenBoughtCallback);
                    socket.off("token:watch", tokenWatchCallback);
                }
            };
        }
    }, [socket, itemList]);

    const handleChange = (key, value, type) => {
        const updatedDataList = [...itemList];
        switch (type) {
            case 'percentage':
                updatedDataList[key].percentage = value;
                break;
            case 'slippage':
                updatedDataList[key].slippage = value;
                break;
            case 'gas_limit':
                updatedDataList[key].gas_limit = value;
                break;
            case 'gas_price':
                updatedDataList[key].gas_price = value;
                break;
            default:
                break;
        }

        setItemList(updatedDataList);
    };

    const handleBlur = (key, type) => {
        const updatedDataList = [...itemList];

        switch (type) {
            case 'percentage':
                updatedDataList[key].percentage = onSetLimitHtmlInput(updatedDataList[key].percentage, 0, 100);
                break;
            case 'slippage':
                updatedDataList[key].slippage = onSetLimitHtmlInput(updatedDataList[key].slippage, 0, 100);
                break;
            case 'gas_limit':
                updatedDataList[key].gas_limit = onSetLimitHtmlInput(updatedDataList[key].gas_limit, 0, null);
                break;
            case 'gas_price':
                updatedDataList[key].gas_price = onSetLimitHtmlInput(updatedDataList[key].gas_price, 0, null);
                break;
            default:
                break;
        }
        setItemList(updatedDataList);
    };

    /**
     *      show chart to analyze the dex trades
     */
    const onShowChart = (e, key, col) => {
        setInitialData({ key: key, token_id: itemList[key]._id, token_address: itemList[key].token_address, ethAmount: itemList[key].ethAmount, created: itemList[key].created });
    }

    return (
        <>
            {loadingAllData ? (
                <div className="clip-loader"><ClipLoader color={globalVariables.GREEN} size="50px" /></div>
            ) : (
                !empty(itemList) &&
                itemList.map((ele, key) => (

                    ele.isLoading ? (
                        <Card key={key} style={{ backgroundColor: key % 2 === 0 ? globalVariables.BACKGROUND_COLOR : '#ffffff' }}>
                            <CardHeader>
                                <Row>
                                    <Col className="pr-md-1" md="2">
                                        <CardTitle tag="h4">Token logs # {key + 1}</CardTitle>
                                    </Col>
                                </Row>
                            </CardHeader>
                            <CardBody>
                                <Row>
                                    <Col className="pr-md-1" md="6">
                                        <Row>
                                            <Col className="pr-md-1" md="2"><CardTitle>Token Address</CardTitle></Col>
                                            <Col className="pr-md-1" md="6"><CardText><a href={globalVariables.ETHERSCAN_IO + ele?.token_address} target="_blank">{ele?.token_address}</a></CardText></Col>
                                        </Row>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col className="pr-md-1" md="12">
                                        <div className="clip-loader"><ClipLoader color={globalVariables.GREEN} size="50px" /></div>
                                    </Col>
                                </Row>

                            </CardBody>

                            <CardFooter>

                            </CardFooter>
                        </Card>

                    ) : (

                        <Card key={key} style={{ backgroundColor: key % 2 === 0 ? globalVariables.BACKGROUND_COLOR : '#ffffff' }}>
                            {/* <Card> */}
                            <CardHeader>
                                <Row>
                                    <Col className="pr-md-1" md="2">
                                        <CardTitle tag="h4">Token logs # {key + 1}</CardTitle>
                                    </Col>
                                    <Col className="pr-md-1" md="10">
                                        <Button color="btn1" className="btn1" onClick={(e) => onRemoveToken(e, -1, key, -1, itemList, setItemList, props, ApiCall, apiConfig, showNotify, null, null, 1)} style={{ float: "right", marginRight: "10px" }}>
                                            Remove Token
                                        </Button>
                                    </Col>
                                </Row>
                            </CardHeader>
                            <CardBody>
                                <Row>
                                    <Col className="pr-md-1" md="5">
                                        <Row>
                                            <Col className="pr-md-1" md="4"><CardTitle>* Owner Address</CardTitle></Col>
                                            <Col className="pr-md-1" md="8"><CardText><a href={globalVariables.ETHERSCAN_IO + ele?.owner_address} target="_blank">{ele?.owner_address}</a></CardText></Col>
                                        </Row>
                                        <Row>
                                            <Col className="pr-md-1" md="4"><CardTitle>* Token Address</CardTitle></Col>
                                            <Col className="pr-md-1" md="8"><CardText><a href={globalVariables.ETHERSCAN_IO + ele.token_address} target="_blank">{ele?.token_address}</a> &nbsp;&nbsp;<a href={globalVariables.DEXTOOL_PAIR_EXPLORER + ele.token_address} target="_blank"><i className="tim-icons icon-link-72" /></a></CardText></Col>
                                        </Row>

                                        <Row>
                                            <Col className="pr-md-1" md="4"><CardTitle>* ETH Maximum for ExactETH</CardTitle></Col>
                                            <Col className="pr-md-1" md="8"><CardText>{ele?.ethAmount} &nbsp; {globalVariables.BASE_TOKEN_SYMBOL}</CardText></Col>
                                        </Row>
                                        <Row>
                                            <Col className="pr-md-1" md="4"><CardTitle>* Exact Token Amount</CardTitle></Col>
                                            <Col className="pr-md-1" md="8"><CardText>{ele?.tokenAmount}</CardText></Col>
                                        </Row>
                                        <Row>
                                            <Col className="pr-md-1" md="4"><CardTitle>* Status</CardTitle></Col>
                                            <Col className="pr-md-1 read-more-button" md="8" >
                                                {/* {ele?.message} */}
                                                <ReadMoreReadLess
                                                    text={ele?.message || ''}
                                                    charLimit={50}
                                                    rootStyles={
                                                        ele?.status === 200 ? { color: globalVariables.GREEN } : { color: globalVariables.RED }
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
                                            <Col className="pr-md-1" md="8"><CardText>{format('yyyy-MM-dd    hh:mm:ss O', new Date(ele?.created))}</CardText></Col>
                                        </Row>
                                        <hr size="5" width="80%" style={{ alignSelf: "center", color: "#e4ebe4" }} />
                                        <Row className="css_gas_part">
                                            <Col className="pr-md-1" md="4">
                                                {
                                                    ele.utils?.loading_price_button ?
                                                        (<ClipLoader color={globalVariables.GREEN} size="50px" />
                                                        ) : (
                                                            <Button color="btn1" className="btn1" onClick={(e) => onEstimatePrice(e, key, -1, itemList, setItemList, props, showNotify, ApiCall, apiConfig, 1, onShowChart)}>
                                                                Watch
                                                            </Button>
                                                        )
                                                }
                                            </Col>
                                            <Col className="pr-md-1" md="8"><CardTitle style={{ float: "left", fontSize: "16px" }}>{ele ? ele.estimationPrice : 0} &nbsp; {globalVariables.BASE_TOKEN_SYMBOL}</CardTitle></Col>
                                        </Row>
                                        {/* <Row className="css_gas_part">
                                            <Col className="pr-md-1" md="4">
                                                <Button color="btn1" className="btn1" onClick={(e) => onShowChart(e, key)}>
                                                    Show Chart
                                                </Button>
                                            </Col>
                                        </Row> */}
                                        <hr size="5" width="80%" style={{ alignSelf: "center", color: "#e4ebe4" }} />
                                        <Row>
                                            <Col className="pr-md-1" md="5">
                                                {
                                                    ele.utils?.loading_gas_button ?
                                                        (
                                                            <ClipLoader color={globalVariables.GREEN} size="50px" />
                                                        ) : (
                                                            <Button color="btn1" className="btn1" onClick={(e) => onDetectGas(e, key, -1, itemList, setItemList, props, showNotify, ApiCall, apiConfig, 1)}>
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
                                                    value={ele.rug_check}
                                                    thumbAnimateRange={[1, 57]}
                                                    thumbStyle={borderRadiusStyle}
                                                    trackStyle={borderRadiusStyle}
                                                    onToggle={(value) => onDetectRugPool(value, key, -1, itemList, setItemList, props, ApiCall, apiConfig, 1, showNotify)} />
                                                <span className="detect-rug-pull-label">* Detect Rug Pull</span>
                                            </Col>
                                            <Col>
                                                <CardText className={ele.is_rug === 0 ? "css_rug_pool_state_false" : "css_rug_pool_state_true"} ><i id={"tooltip_token_detected_rug_pull_" + key} className="tim-icons icon-alert-circle-exc" /><em style={{ position: 'absolute' }}>{ele.socket_message}</em></CardText>
                                            </Col>
                                            <ReactTooltip
                                                anchorId={'tooltip_token_detected_rug_pull_' + key}
                                                place="bottom"
                                                variant="success"
                                                content={ele.is_rug === 0 ? "Detected Rug Pull!" : "Nothing Detected Rug Pull!"}
                                            />
                                        </Row>
                                        <Row className="css_gas_part">
                                            <Col className="pr-md-1" md="2"><CardTitle>* Gas Price:</CardTitle></Col>
                                            <Col className="pr-md-1" md="3">
                                                <FormGroup>
                                                    <Input
                                                        type="Number"
                                                        value={ele.gas_price}
                                                        min={0}
                                                        onChange={(e) => handleChange(key, e.target.value, 'gas_price')}
                                                        onBlur={() => handleBlur(key, 'gas_price')}
                                                        onKeyPress={onOnlyAllowNumeric}
                                                    />
                                                </FormGroup>
                                            </Col>
                                            <Col className="pr-md-1" md="2"><CardTitle>* Gas Limit:</CardTitle></Col>
                                            <Col className="pr-md-1" md="3">
                                                <FormGroup>
                                                    <Input
                                                        type="Number"
                                                        value={ele.gas_limit}
                                                        min={0}
                                                        onChange={(e) => handleChange(key, e.target.value, 'gas_limit')}
                                                        onBlur={() => handleBlur(key, 'gas_limit')}
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
                                                        value={ele.slippage}
                                                        min={0}
                                                        max={100}
                                                        onChange={(e) => handleChange(key, e.target.value, 'slippage')}
                                                        onBlur={() => handleBlur(key, 'slippage')}
                                                        onKeyPress={onOnlyAllowNumeric}
                                                    />
                                                </FormGroup>
                                            </Col>
                                            <Col className="pr-md-1" md="2">
                                                {
                                                    ele.utils?.loading_approve_button ?
                                                        (<ClipLoader color={globalVariables.GREEN} size="50px" />
                                                        ) : (
                                                            <Button color="btn1" className="btn1" onClick={(e) => onApproveHandle(e, key, -1, itemList, setItemList, props, ApiCall, apiConfig, showNotify, setSellButton, 1)} disabled={ele?.isApproveDisabled}>
                                                                Approve
                                                            </Button>
                                                        )}
                                                {/* <div className="white-sell-button"><LoadingButton isLoading={itemList[key].utils.loading_approve_button} onClick={(e) => onApproveHandle(e, key)}
                                    text = "Approve"
                                    loadingMode="SPINNER" 
                                    animationColor="#14a800"/></div> */}
                                            </Col>
                                        </Row>

                                        {/* <hr size="5" width="80%" style={{alignSelf: "center", color: "#e4ebe4"}}/> */}
                                        <Row className="css_gas_part">
                                            <Col className="pr-md-1" md="2"><CardTitle>* Custom %</CardTitle></Col>
                                            <Col className="pr-md-1" md="3">
                                                <FormGroup>
                                                    <Input
                                                        type="Number"
                                                        value={ele.percentage}
                                                        min={0}
                                                        max={100}
                                                        onChange={(e) => handleChange(key, e.target.value, 'percentage')}
                                                        onBlur={() => handleBlur(key, 'percentage')}
                                                        onKeyPress={onOnlyAllowNumeric}
                                                    />
                                                </FormGroup>
                                            </Col>
                                            <Col className="pr-md-1" md="2">
                                                {
                                                    ele.utils?.loading_sell_button ? (
                                                        <ClipLoader color={globalVariables.GREEN} size="50px" />
                                                    ) : (
                                                        <Button color="green" className="btn-fill" onClick={(e) => onSellHandle(e, key, -1, itemList, setItemList, props, ApiCall, apiConfig, showNotify, 1)} disabled={ele?.isSellDisabled}>
                                                            Sell
                                                        </Button>

                                                    )
                                                }
                                                {/* <div className="handcraft-sell-button" style={sell_button}><LoadingButton isLoading={itemList[key].utils.loading_sell_button} onClick={(e) => onSellHandle(e, key)}
                                    text = "Sell"
                                    loadingMode="SPINNER" /></div> */}
                                            </Col>
                                        </Row>
                                        <hr size="5" width="80%" style={{ alignSelf: "center", color: "#e4ebe4" }} />
                                    </Col>
                                    <Col className="pr-md-1" md="7">
                                        {
                                            ele.token_address === initialData.token_address && key === initialData.key && (
                                                <LineChart sendInitialData={initialData} socket={socket} />
                                                // <CandleChart sendInitialData={initialData} socket={socket}/>
                                            )
                                        }

                                    </Col>
                                </Row>
                            </CardBody>
                        </Card>
                    )
                ))
            )
            }
        </>
    )
}

export default TokenList