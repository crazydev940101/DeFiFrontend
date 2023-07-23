/**
 *  Updated by Dragonslayer 5/27/2023
 */

import React, { useEffect, useState, useRef, useCallback } from "react";
import { ClipLoader } from "react-spinners";
import { Tooltip as ReactTooltip } from 'react-tooltip';
import Pagination from "replace-js-pagination";
import Select from 'react-select';
import { reduceString, globalVariables } from '../../../../variables/variable';
// reactstrap components
import {
    Card,
    CardHeader,
    CardBody,
    CardFooter,
    Row,
    Col,
    Button,
    Input,
    FormGroup
} from "reactstrap";
import './tokenspanel.css';
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
const TokensPanel = (props) => {
    const { showNotify } = props;
    const isMounted = useIsMounted();
    const { apiConfig, ApiCall } = global;
    const [itemList, setItemList] = useState([]);
    const itemListRef = useRef();
    const [loading, setLoading] = useState(false);

    const [pageCount, setPageCount] = useState(50);
    const [totalCount, setTotalCount] = useState(0);
    const [pageNumber, setPageNumber] = useState(1);

    const filterCountOption = [
        { value: 10, label: 10 },
        { value: 20, label: 20 },
        { value: 50, label: 50 },
    ];
    const [selectedOption, setSelectedOption] = useState(filterCountOption[2]); // Set the default value here

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
                    updateData.map(item => { item.loadingGetCode = false; item.loadingForHoney = false; item.loadingForGoPlus = false; item.checked = false; });
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
    }, [props.credential.loginToken, pageCount, pageNumber]);

    const onHandlePageClick = async (pageNum) => {
        setPageNumber(pageNum);
    }

    const onHandleFilterByCount = (selectedOption) => {
        setSelectedOption(selectedOption);
        setPageCount(selectedOption.value);
    }

    const onShowModalToGetTraderList = (e, key) => {
        e.preventDefault();
        const data = {
            token_address: itemList[key].address
        }
        props.sendTokenAddressToParent(data);
    }

    const onCompairToken = () => {
        const updateData = [...itemList];
        let sendData = [];
        updateData.map(item => {
            if(item.checked){
                sendData.push(item.address);
            }
        })
        props.history.push({
            pathname: '/bot/compair_token',
            state: sendData
        })
    }

    const onHandleAllCheckBox = (e) => {
        const { checked } = e.target;
        const updateData = [...itemList];
        updateData.map(item => {
            if(checked){
                item.checked = true;
            }else{
                item.checked = false;
            }
        })
        setItemList(updateData);
    }

    const onHandleCheckBox = (e, key) => {
        const { checked } = e.target;
        const updateData = [...itemList];
        updateData[key].checked = checked;
        setItemList(updateData);
    }


    return (
        <>
            <Card>
                <CardHeader>
                    <h5 className="title">Token List</h5>
                </CardHeader>
                <CardBody>
                    {loading ? (
                        <div className='clip-loader'>
                            <ClipLoader color={globalVariables.GREEN} size="50px" />
                        </div>
                    ) : (
                        <>
                            <Row>
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
                                <Col className="pr-md-1" md="8">
                                </Col>
                                <Col className="pr-md-1 toggle_botton" md="2" style={{ textAlign: "right", marginTop: "15px" }}>
                                    <Button className="btn-fill" color="green" type="submit" onClick={onCompairToken} style={{ marginRight: "15px" }}>
                                        Compair
                                    </Button>
                                </Col>
                            </Row>
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Contract Address</th>
                                        <th>Get Trader List</th>
                                        <th>Token Name</th>
                                        <th>Total Supply</th>
                                        <th>Time</th>
                                        <th><Input
                                            type="checkbox"
                                            onChange={(e) => onHandleAllCheckBox(e)}
                                        /></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        itemList.map((ele, key) => (
                                            <tr key={key}>
                                                <td>
                                                    {(pageNumber - 1) * pageCount + 1 + key} &nbsp;
                                                </td>
                                                <td><a href={globalVariables.ETHERSCAN_IO + ele.address} target="_blank">
                                                    {ele.address}
                                                </a>
                                                    &nbsp;&nbsp;&nbsp;&nbsp;
                                                    <a href={globalVariables.DEXTOOL_PAIR_EXPLORER + ele.address} target="_blank">
                                                        <i className="tim-icons icon-link-72" />
                                                    </a>
                                                </td>
                                                <td className="scale-loader">
                                                    <a href="#" onClick={(e) => onShowModalToGetTraderList(e, key)} className="btn-simple btn-round">
                                                        <i className="tim-icons icon-zoom-split" />
                                                    </a>
                                                </td>
                                                <td>
                                                    <span id={'tooltip_token_log_name_' + key}>{reduceString(ele.name, 20)}</span>
                                                    <ReactTooltip
                                                        anchorId={'tooltip_token_log_name_' + key}
                                                        place="bottom"
                                                        variant="success"
                                                        content={ele.name}
                                                    />
                                                </td>
                                                <td>
                                                    {ele.totalsupply}
                                                </td>
                                                <td>
                                                    {format('yyyy-MM-dd    hh:mm:ss O', new Date(ele.createtime))}
                                                </td>
                                                <td>
                                                    <FormGroup>
                                                        <Input
                                                            type="checkbox"
                                                            value={ele.checked}
                                                            checked={ele.checked}
                                                            onChange={(e) => onHandleCheckBox(e, key)}
                                                        />
                                                    </FormGroup>
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

        </>
    );
};

export default TokensPanel;