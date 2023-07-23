/**
 *  Updated by Dragonslayer 6/8/2023
 */

import React, { useState, useEffect, useRef, useCallback } from "react";
import { confirmAlert } from "react-confirm-alert";
import { ClipLoader } from "react-spinners";
import Select from "react-select";
import empty from "empty-lite/src/empty.js";
// reactstrap components
import {
    Button,
    Card,
    CardHeader,
    CardBody,
    CardFooter,
    CardText,
    CardTitle,
    FormGroup,
    Row,
    Col,
} from "reactstrap";
import { globalVariables } from '../../../../variables/variable.js';
import "./tokenlistpanel.css";


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

    const [itemList, setItemList] = useState([]);
    const [type, setType] = useState(-1);
    const [loadingAllData, setLoadingAllData] = useState(false);

    /**
     *  to show tokens list filtered by type  // 0 -follower, 1- manual, 2 - sniper
     */
    const onShowTokenByType = async (item) => {
        setLoadingAllData(true);
        try {
            const payLoad = {
                user_id: props.credential.loginUserName,
                type: item.value,
                pending: false
            };
            const response = await ApiCall(
                apiConfig.get_pending_lists.url,
                apiConfig.get_pending_lists.method,
                props.credential.loginToken,
                payLoad,
            );
            if (response.status === 200 && isMounted()) {
                if (response.data.pendingLists) {
                    setItemList(response.data.pendingLists);
                    /** init loading flag array to get all pending list */

                }
            }
            setType(item.value);
            setLoadingAllData(false);
        } catch (error) {
            setLoadingAllData(false);
            showNotify("Something went wrong", 'danger');
        }
    }

    /**
       *  to remove your chosen token information
       */
    const onRemoveToken = async (e, key, _type) => {
        var flag = -1;
        var tokenId = '';
        switch (_type) {
            case 'individual':
                flag = 0;
                tokenId = itemList[key]._id
                break;
            case 'all':
                flag = 1;
                tokenId = ''
                break;
            default:
                break;
        }

        if (flag === -1) {
            showNotify("Please choose correctly.", "danger");
            return;
        }

        if (flag === 1 && itemList.length < 1) {
            showNotify("Please choose token list.", "danger");
            return;
        }

        try {
            const payLoad = {
                token_id: tokenId,
                user_id: props.credential.loginUserName,
                flag: flag,
                type: type
            };
            const response = await ApiCall(
                apiConfig.remove_token_complete.url,
                apiConfig.remove_token_complete.method,
                props.credential.loginToken,
                payLoad
            );
            if (response.status === 200) {
                showNotify(response.data.message, "success");
                if (flag === 0) {
                    setItemList((ele) => {
                        let ele1 = JSON.parse(JSON.stringify(ele));
                        ele1.splice(key, 1);
                        return ele1;
                    });
                } else if (flag === 1) {
                    setItemList([]);
                }

                /** init background color % 2 */
                // onChangeBackgroundColor(itemList); 
            }
        } catch (error) {
            showNotify("Failed to remove your Token.", "danger");
        }
    }

    const onUndoToken = async (e, key) => {
        console.log(itemList[key]);
        try {
            const payLoad = {
                user_id: props.credential.loginUserName,
                token_id: itemList[key]._id
            };
            const response = await ApiCall(
                apiConfig.undo_token.url,
                apiConfig.undo_token.method,
                props.credential.loginToken,
                payLoad
            );
            if (response.status === 200 && response.data) {
                showNotify(response.data.message, 'success');
                setItemList((ele) => {
                    let ele1 = JSON.parse(JSON.stringify(ele));
                    ele1.splice(key, 1);
                    return ele1;
                })
            }
        } catch (error) {
            if (error.response && typeof (error.response.data.message) === "string") {
                showNotify(error.response.data.message, 'danger');
            } else {
                showNotify("Something went wrong", 'danger');
            }
        }
    }

    return (
        <>
            <Card>
                <CardHeader>
                    <h5 className="title">Token List</h5>
                </CardHeader>
                <CardBody>
                    <Row>
                        <Col className="pr-md-1" md="3">
                            <FormGroup>
                                <label>* choose if you need to check token's list *</label>
                                <Select
                                    options={[
                                        {
                                            value: 0,
                                            label: 'Follower',
                                        },
                                        {
                                            value: 1,
                                            label: 'Manual',
                                        },
                                        {
                                            value: 2,
                                            label: 'Sniper'
                                        },
                                    ]}
                                    className="react-select info"
                                    classNamePrefix="react-select"
                                    onChange={(item) => {
                                        onShowTokenByType(item)
                                    }}
                                >
                                </Select>
                            </FormGroup>
                        </Col>
                        <Col className="pr-md-1" md="9">
                            <Button color="btn1" className="btn1" onClick={(e) => {
                                confirmAlert({
                                    title: 'Confirm to submit',
                                    message: 'Are you sure to remove this token?',
                                    buttons: [
                                        {
                                            label: 'Yes',
                                            onClick: () => onRemoveToken(e, null, 'all')
                                        },
                                        {
                                            label: 'No',
                                            onClick: () => { }
                                        }
                                    ]
                                });
                            }
                            } style={{ float: "right", marginRight: "10px" }}>
                                Remove All
                            </Button>
                        </Col>
                    </Row>
                </CardBody>
                <CardFooter>
                </CardFooter>
            </Card>


            {loadingAllData ? (<div className="clip-loader"><ClipLoader color={globalVariables.GREEN} size="50px" /></div>) : (
                !empty(itemList) &&
                itemList.map((ele, key) => (
                    <Card key={key} >
                        <CardHeader>
                            <Row>
                                <Col className="pr-md-1" md="2">
                                    <CardTitle tag="h4">Token logs # {key + 1}</CardTitle>
                                </Col>
                                <Col className="pr-md-1" md="9">
                                    <Button color="btn1" className="btn1" onClick={(e) => onRemoveToken(e, key, 'individual')} style={{ float: "right", marginRight: "10px" }}>
                                        Remove
                                    </Button>
                                </Col>
                                <Col className="pr-md-1" md="1">
                                    <Button color="btn1" className="btn1" onClick={(e) => onUndoToken(e, key)} style={{ float: "right", marginRight: "10px" }}>
                                        Undo
                                    </Button>
                                </Col>
                            </Row>
                        </CardHeader>
                        <CardBody>
                            <Row>
                                <Col className="pr-md-1" md="6">
                                    <Row>
                                        <Col className="pr-md-1" md="4"><CardTitle>* Owner Address</CardTitle></Col>
                                        <Col className="pr-md-1" md="8"><CardText><a href={globalVariables.ETHERSCAN_IO + ele?.owner_address} target="_blank">{ele?.owner_address}</a></CardText></Col>
                                    </Row>
                                    <Row>
                                        <Col className="pr-md-1" md="4"><CardTitle>* Token Address</CardTitle></Col>
                                        <Col className="pr-md-1" md="8"><CardText><a href={globalVariables.ETHERSCAN_IO + ele.token_address} target="_blank">{ele?.token_address}</a> &nbsp;&nbsp;<a href={globalVariables.DEXTOOL_PAIR_EXPLORER + ele.token_address} target="_blank"><i className="tim-icons icon-link-72" /></a></CardText></Col>
                                    </Row>

                                    <Row>
                                        <Col className="pr-md-1" md="4"><CardTitle>* ETH Maximum Limit for ExactETH</CardTitle></Col>
                                        <Col className="pr-md-1" md="8"><CardText>{ele?.ethAmount} &nbsp; {globalVariables.BASE_TOKEN_SYMBOL}</CardText></Col>
                                    </Row>
                                    <Row>
                                        <Col className="pr-md-1" md="4"><CardTitle>* Exact Token Amount</CardTitle></Col>
                                        <Col className="pr-md-1" md="8"><CardText>{ele?.tokenAmount}</CardText></Col>
                                    </Row>
                                    <Row>
                                        <Col className="pr-md-1" md="4"><CardTitle>* Status</CardTitle></Col>
                                        <Col className="pr-md-1" md="8"><CardText>{itemList[key]?.message}</CardText></Col>
                                    </Row>
                                </Col>
                            </Row>
                        </CardBody>
                    </Card>
                ))
            )}
        </>
    );
};

export default TokenListPanel;