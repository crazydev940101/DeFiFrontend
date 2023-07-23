/**
 *  Created by Dragonslayer 6/22/2023
 */

import React, { useEffect, useState, useRef, useCallback } from "react";
import { ClipLoader } from "react-spinners";
import Select from "react-select";
import { confirmAlert } from "react-confirm-alert";
import {
    Card, CardBody, CardHeader, CardFooter, Form, FormGroup, Input, Col, Row, Button, CardText
} from "reactstrap";
import { globalVariables } from "../../../../variables/variable.js";
import "./tokenlistpanel.css";

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

const TokenListPanel = (props) => {
    const isMounted = useIsMounted();
    const { apiConfig, ApiCall } = global;
    const { showNotify } = props;

    const itemListRef = useRef();
    const [itemList, setItemList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingMethod, setLoadingMethod] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [editedData, setEditedData] = useState({});

    const [functionListOption, setFunctionListOption] = useState([]);


    useEffect(() => {
        /**
        *    get all transactions methods from DB
        */
        setLoading(true);
        async function getAllLists() {
            try {
                const payLoad = {
                    user_id: props.credential.loginUserName,
                };
                const response = await ApiCall(
                    apiConfig.get_lists.url,
                    apiConfig.get_lists.method,
                    props.credential.loginToken,
                    payLoad
                );
                if (response.status === 200 && response.data.snipers) {
                    if (isMounted()) {
                        itemListRef.current = response.data.snipers;
                        setItemList(itemListRef.current);
                        setLoading(false);
                    }
                }
            } catch (error) {
                if (error.response && typeof (error.response.data.message) === "string") showNotify(error.response.data.message, 'danger');
                else showNotify('Something went wrong', 'danger');
            }
        }
        getAllLists();

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
                            item.func_name = item.name
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
        if (props.sniperDataToList) {
            const updateData = [...itemList];
            updateData.push(props.sniperDataToList)
            itemListRef.current = updateData;
            setItemList(itemListRef.current);
        }
    }, [props.sniperDataToList])

    useEffect(() => {
        let row = -1;
        if (props.newTokenBought) {
            const updateData = [...itemList];
            updateData.forEach((item, i) => {
                if (item.token_address.toLowerCase() === props.newTokenBought.token_address.toLowerCase()) {
                    row = i;
                }
            })
            if (row > -1) {
                setItemList((ele) => {
                    let ele1 = JSON.parse(JSON.stringify(ele));
                    ele1.splice(row, 1);
                    return ele1;
                });
            }
        }
    }, [props.newTokenBought])

    /**
     *    remove transaction method what you want to delete 
     */

    const onRemoveToken = async (e, key) => {
        e.preventDefault();
        try {
            const payLoad = {
                user_id: props.credential.loginUserName,
                sniper_id: itemList[key]._id
            };
            const response = await ApiCall(
                apiConfig.sniper_remove.url,
                apiConfig.sniper_remove.method,
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
            showNotify("Failed to remove your method.", "danger");
        }
    }

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
                sniper_id: itemList[index].id,
                owner_address: itemList[index].owner_address,
                token_address: itemList[index].token_address,
                auto: false,
                eth_amount: editedData.eth_amount,
                token_amount: itemList[index].token_amount,
                delay: itemList[index].delay,
                base_gas_multiple: editedData.base_gas_multiple,
                max_priority_fee: editedData.max_priority_fee,
                func_regex: editedData.func_regex,
                func_description: editedData.func_description,
                func_name: editedData.func_name,
                sell_price: editedData.sell_price,
                slippage: editedData.slippage,
                sell_slippage: itemList[index].sell_slippage
            };
            const response = await ApiCall(
                apiConfig.sniper_update.url,
                apiConfig.sniper_update.method,
                props.credential.loginToken,
                payLoad
            );
            if (response.status === 200) {
                showNotify("Successfully updated sniper setting", 'success');
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
            updatedData.func_regex = e.value;
            setEditedData(updatedData);
        }

    };

    const onAddNew = (e) => {
        const payLoad = { flag: true };
        props.sendModalShowToParent(payLoad);
    }

    return (
        <>
            <Card>
                <CardHeader>
                    <h5 className="title">Sniper List</h5>
                    <Col className="pr-md-1" md="4">

                        <Button color="btn1" className="btn1" onClick={(e) => onAddNew(e)}>
                            + Add New Sniper
                        </Button>
                    </Col>
                </CardHeader>
                <CardBody>

                    {
                        loading ? (
                            <div className="clip-loader">
                                <ClipLoader color={globalVariables.GREEN} size="50px" />
                            </div>
                        ) : (
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Token Address</th>
                                        <th>Eth Amount</th>
                                        <th>Function Id</th>
                                        <th>Function Description</th>
                                        <th>Sell Price</th>
                                        <th>Slippage</th>
                                        <th>Base Gas Multiple</th>
                                        <th>Max Priority Fee</th>
                                        <th>Created</th>
                                        <th>Edit</th>
                                        <th>Remove</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {itemList.map((item, key) => (
                                        <tr key={key}>
                                            <td>{key + 1}</td>
                                            <td>
                                                <CardText><a href={globalVariables.ETHERSCAN_IO + item.token_address} target="_blank">{item?.token_address}</a> &nbsp;&nbsp;<a href={globalVariables.DEXTOOL_PAIR_EXPLORER + item.token_address} target="_blank"><i className="tim-icons icon-link-72" /></a></CardText>
                                            </td>
                                            <td>{editMode && editedData.id === item.id ?
                                                <FormGroup><Input type="text" name="eth_amount" value={editedData.eth_amount} onChange={onHandleChange} /></FormGroup> : item.eth_amount + "  " + globalVariables.BASE_TOKEN_SYMBOL}
                                            </td>
                                            <td>{editMode && editedData.id === item.id ?
                                                (loadingMethod ?
                                                    (
                                                        <ClipLoader color={globalVariables.GREEN} size="50px" />
                                                    ) : (
                                                        <FormGroup style={{ width: 300 }}>
                                                            <Select
                                                                options={functionListOption}
                                                                name="func_regex"
                                                                className="react-select info"
                                                                classNamePrefix="react-select"
                                                                defaultValue={editedData.func_regex}
                                                                // value={editedData.func_regex}
                                                                // value={{ value: editedData.func_regex, label: editedData.func_name }}
                                                                onChange={onHandleChange}
                                                            // getOptionLabel={(option) => (
                                                            //       option.value
                                                            // )}
                                                            />
                                                        </FormGroup>
                                                    )) :
                                                item.func_regex
                                            }
                                            </td>
                                            <td>{editMode && editedData.id === item.id ?
                                                <FormGroup><Input type="text" name="func_description" value={editedData.func_description} onChange={onHandleChange} /></FormGroup> : item.func_description}
                                            </td>
                                            <td>{editMode && editedData.id === item.id ?
                                                <FormGroup><Input type="text" name="sell_price" value={editedData.sell_price} onChange={onHandleChange} /></FormGroup> : item.sell_price}
                                            </td>
                                            <td>{editMode && editedData.id === item.id ?
                                                <FormGroup><Input type="text" name="slippage" value={editedData.slippage} onChange={onHandleChange} /></FormGroup> : item.slippage}
                                            </td>
                                            <td>{editMode && editedData.id === item.id ?
                                                <FormGroup><Input type="text" name="base_gas_multiple" value={editedData.base_gas_multiple} onChange={onHandleChange} /></FormGroup> : item.base_gas_multiple}
                                            </td>
                                            <td>{editMode && editedData.id === item.id ?
                                                <FormGroup><Input type="text" name="max_priority_fee" value={editedData.max_priority_fee} onChange={onHandleChange} /></FormGroup> : item.max_priority_fee}
                                            </td>
                                            <td>
                                                {format('yyyy-MM-dd    hh:mm:ss O', new Date(item?.created))}
                                            </td>
                                            <td>
                                                {editMode && editedData.id === item.id ? (
                                                    <div className="handle-edit-method" style={{ display: 'flex' }}>
                                                        <Button onClick={e => onHandleSave(e, key)} className="btn-simple btn-round method-panel-1" color="danger">
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
                                            </td>
                                            <td>
                                                <Button onClick={(event) => onRemoveToken(event, key)} className="btn-simple btn-round" color="danger">
                                                    <i className="tim-icons icon-simple-remove" />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                </CardBody>
                <CardFooter>

                </CardFooter>
            </Card >
        </>
    )
}

export default TokenListPanel