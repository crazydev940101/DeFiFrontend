/**
 *  Created by Dragonslayer 6/22/2023
 */

import React, { useEffect, useState, } from "react";
import { GoPlusLabs } from '@normalizex/gopluslabs-api';

import {
    Col, Row, Modal, Form, Label
} from "reactstrap";
import { setColorToI, setColorToLabel, } from '../../../../variables/variable.js';
import "./rugpullpanel.css";

const RugPullPanel = (props) => {
    const { showNotify } = props;

    const CHAIN_ID = 1;
    const [modalRugPullFlag, showModalRugPullFlag] = useState(false);
    const [resultRugPull, setResultRugPull] = useState(null);

    useEffect(() => {

        async function getTokenAddressForRugPullFromMainPanel() {
            if (props.sendTokenAddressForRugPullToSecurity) {
                const responseData = props.sendTokenAddressForRugPullToSecurity;
                const DeFi = responseData.token_address.toLowerCase();
                props.sendLoadingForRugPullToParent(true, responseData.key);
                try {
                    const response = await fetch(`https://api.gopluslabs.io/api/v1/rugpull_detecting/${CHAIN_ID}?contract_addresses=${DeFi}`);
                    const data = await response.json();
                    if (data.code === 1) {
                        setResultRugPull(data.result);
                        showModalRugPullFlag(true);
                    }else {
                        showNotify(data.message + '. Try again.', 'danger');
                    }
                    
                    props.sendLoadingForRugPullToParent(false, responseData.key);
                } catch (error) {
                    props.sendLoadingForRugPullToParent(false, responseData.key);
                    if(error) showNotify(error.message, 'danger');
                    else if (error.response && typeof (error.response.data.message) === "string") showNotify(error.response.data.message, 'danger');
                    else showNotify('Something went wrong', 'danger');
                }
            }
        }
        getTokenAddressForRugPullFromMainPanel();

    }, [props.sendTokenAddressForRugPullToSecurity])

    const onCloseRugPullModal = () => {
        showModalRugPullFlag(false);
    }

    return (
        <>
            <Modal modalClassName="modal-black mModalGoPlus logs-page-modal" id="mModalGoPlus" isOpen={modalRugPullFlag} >
                <div className="modal-header">
                    <h4>Check RugPull</h4>
                    <button
                        aria-label="Close"
                        className="close"
                        data-dismiss="modal"
                        type="button"
                        onClick={() => onCloseRugPullModal()}
                    >
                        <i className="tim-icons icon-simple-remove" />
                    </button>
                </div>
                {
                    <div className="modal-body padBtt detailInfo" style={{ paddingTop: "0px" }}>
                        <Form>
                            <Row>
                                <Col className="pr-md-1" md="12">
                                    {resultRugPull &&
                                        <>
                                        
                                            <Label title=''>
                                                *Contract name: <b>{resultRugPull.contract_name}</b></Label>
                                            <br />
                                            <br />

                                            <Label title='It describes whether the owner can spend the allowance that obtained by the contract. If so, this function could potentially be abused to steal user assets."1" means true; "0" means false;“-1” means unknown.'>
                                                *approval_abuse:  <span style={{ color: setColorToLabel(resultRugPull.approval_abuse) }}> {setColorToI(resultRugPull.approval_abuse)}</span></Label>
                                            <br />
                                            <Label title='It describes whether the contract has blacklist function that would block user from withdrawing their assets."1" means true;"0" means false; "-1" means unknown.'>
                                                *blacklist: <span style={{ color: setColorToLabel(resultRugPull.blacklist) }}> {setColorToI(resultRugPull.blacklist)}</span></Label>
                                            <br />
                                            <Label title='It describes whether this contract is open source. "1" means true; "0" means false.'>
                                                *is_open_source: <span style={{ color: setColorToLabel(resultRugPull.is_open_source) }}> {setColorToI(resultRugPull.is_open_source)}</span></Label>
                                            <br />
                                            <Label title='It describes whether this contract has a proxy contract. "1" means true; "0" means false;“-1” means unknown.'>
                                                *is_proxy: <span style={{ color: setColorToLabel(resultRugPull.is_proxy) }}> {setColorToI(resultRugPull.is_proxy)}</span></Label>
                                            <br />
                                            <Label title='It descirbes whether the contract owner can withdraw all the assets in the contract, without uses` permission."1" means true;"0" means false; "-1" means unknown.'>
                                                *privilege_withdraw: <span style={{ color: setColorToLabel(resultRugPull.privilege_withdraw) }}> {setColorToI(resultRugPull.privilege_withdraw)}</span></Label>
                                            <br />
                                            <Label title='It describes whether this contract can self destruct."1" means true; "0" means false;“-1” means unknown.'>
                                                *selfdestruct: <span style={{ color: setColorToLabel(resultRugPull.selfdestruct) }}> {setColorToI(resultRugPull.selfdestruct)}</span></Label>
                                            <br />
                                            <Label title='It describes whether the contract lacks withdrawal method. If it is missing, users will be unable to withdraw the assets they have putted in."1" means true;"0" means false; "-1" means unknown.'>
                                                *withdraw_missing: <span style={{ color: setColorToLabel(resultRugPull.withdraw_missing) }}> {setColorToI(resultRugPull.withdraw_missing)}</span></Label>
                                            <br />
                                        </>
                                    }
                                </Col>
                            </Row>
                        </Form>
                    </div>
                }
            </Modal>
        </>
    )
}

export default RugPullPanel