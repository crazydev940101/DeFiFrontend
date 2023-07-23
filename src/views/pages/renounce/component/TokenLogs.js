/**
 *   Created by Dragonslayer 6/28/2023
 */

import React, { useEffect, useState, useRef, useCallback, } from "react";
import { Scrollbars } from 'react-custom-scrollbars-2';
import { ClipLoader } from "react-spinners";
import { globalVariables } from "../../../../variables/variable";
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

const TokenLogs = (props) => {
    const isMounted = useIsMounted();
    const { apiConfig, ApiCall } = global;
    const [itemList, setItemList] = useState([]);
    const [loading, setLoading] = useState(false);
    const socket = props.socket;
    const itemListRef = useRef();
    const scrollRef = useRef();
    const [fontColor, setFontColor] = useState([]);
    /**
     *      get all token pair logs history
     */
    useEffect(() => {
        setLoading(true);
        async function getAllTokenPairLogs() {
            try {
                const payLoad = {
                    _id: props.credential.loginUserName,
                    sort_type: 1
                };
                const response = await ApiCall(
                    apiConfig.get_renounce_logs.url,
                    apiConfig.get_renounce_logs.method,
                    props.credential.loginToken,
                    payLoad
                );
                if (response.data) {
                    itemListRef.current = response.data;
                    if (isMounted()) {
                        itemListRef.current = [...response.data.tokenRenounceLogs]
                        setItemList(itemListRef.current);
                        onChangeFontColor(itemListRef.current);
                    }
                }
                setLoading(false);
            } catch (error) {
                setLoading(false);
            }
        }
        getAllTokenPairLogs();

    }, [])

    useEffect(() => {
        if (scrollRef.current && isMounted()) {
            scrollRef.current.scrollToBottom();
        }

    }, [scrollRef.current, loading])
    /**
     *      get new pair log history
     */

    // useEffect(() => {
    //     if (socket) {
    //         socket.on("test:auto", newTokenCallback);
    //         socket.on("test:pending", newPendingCallback);
    //         return () => {
    //             if (socket) {
    //                 socket.off("test:auto", newTokenCallback);
    //                 socket.off("test:pending", newPendingCallback);
    //             }
    //         };
    //     }
    // }, [socket, itemList]);

    /**
     *      display count and seconds of new token
     */
    const newPendingCallback = (data) => {
        if (data) {
            const upadteData = itemList.map(item => {
                if (item.token_address.toLowerCase() === data.token_address.toLowerCase() &&
                    item.action === data.action) {
                    let seconds = data.seconds;
                    if (data.seconds >= 20)
                        seconds = 'closed';
                    return { ...item, count: data.buy_count, seconds: seconds }
                } else {
                    return item;
                }
            })
            itemListRef.current = upadteData;
            setItemList(itemListRef.current);
        }
    }

    /**
     *      display new token arrived
     */
    const newTokenCallback = (data) => {
        // console.log(3, data);
        if (itemListRef.current && data && isMounted()) {
            itemListRef.current.push(data);
            setItemList(itemListRef.current);
            requestAnimationFrame(() => {
                scrollRef.current.scrollToBottom();
            })
            
            onChangeFontColor(itemList);
        }
    }

    const onSetAddressToInput = (e, key) => {
        e.preventDefault();
        props.sendAddressToParent(itemList[key].token_address)
    }

    const onChangeFontColor = (list) => {
        const font_color_list = list.map((item, key) => {
            if (key % 2 == 1)
                return globalVariables.GREEN;
            else
                return '#33dde7';
        });
        setFontColor(font_color_list);
    }


    return (
        <div className="pair-log-panel">
            <label>Token Logs</label>
            {loading ? (
                <div className="clip-loader"><ClipLoader color={globalVariables.GREEN} size="50px" /> </div>
            ) : (
                <Scrollbars
                    ref={scrollRef}
                    autoHeight
                    autoHeightMin={0}
                    autoHeightMax={500}
                    thumbMinSize={30}
                >
                    {
                        <>
                            {
                                itemList.map((item, key) => (
                                    <div key={key}>
                                        <p style={{backgroundColor: key % 2 === 1 ? "#cad9c8" : "#fafafa"}}>
                                            <span style={{ color: fontColor[key] }}>
                                                [{format('yyyy-MM-dd    hh:mm:ss O', new Date(item.created))}]
                                            </span>
                                            <br />
                                            Token Address: &nbsp;
                                            <a href="#" target="_blank" onClick={e => onSetAddressToInput(e, key)} style={{ color: globalVariables.RED, fontSize: '18px' }}>
                                                {item.token_address}
                                            </a> &nbsp;<a href={globalVariables.DEXTOOL_PAIR_EXPLORER + item.token_address} target="_blank"><i className="tim-icons icon-link-72" /></a>,
                                            &nbsp;&nbsp;
                                            Name:   {item.token_name}
                                            <br />
                                            Hash:   <a href={globalVariables.ETHERSCAN_IO_TX + item.hash} target="_blank">{item.hash}</a>
                                            <br />
                                            {/* Action Name:   {item.action_name.toLowerCase().includes('addliquidity') ? (<b>{item.action_name}</b>) : (<em>{item.action_name}</em>)},
                                            &nbsp;&nbsp;
                                            ID: {item.action}
                                            <br /> */}
                                            Total Supply: {item.total_supply},
                                            &nbsp;&nbsp;
                                            Eth Balance: {item.eth_balance + `  ` + globalVariables.BASE_TOKEN_SYMBOL},
                                            &nbsp;&nbsp;
                                            Token Balance: {item.token_balance}
                                            &nbsp;&nbsp;
                                            Current Price: {item.current_token_price}
                                            <br />
                                            {/* Gas Price: {item.gas_price || 0},
                                            &nbsp;&nbsp;
                                            Gas Limit: {item.gas_limit || 0},
                                            &nbsp;&nbsp;
                                            Max Priority Fee: {item.max_priority_fee || 0},
                                            &nbsp;&nbsp;
                                            Max Fee Per Gas: {item.max_fee_per_gas || 0}
                                            <br />
                                            Count: {item.count},
                                            &nbsp;&nbsp;
                                            Pending Time: {item.seconds <= 21 ? item.seconds : "closed"} */}
                                        </p>
                                    </div>
                                ))
                            }
                        </>
                    }
                </Scrollbars>
            )}
        </div>
    )
}

export default TokenLogs