/**
 *  Created by Dragonslayer 6/22/2023
 */

import React, { useEffect, useState, useRef, useCallback } from "react";
import { HoneypotIsV1 } from '@normalizex/honeypot-is';

import {
    Col, Row, Modal, Form, Label
} from "reactstrap";
import { globalVariables, setColorToI, setColorToLabel, setColorToIByCount, setColorToLabelByCount } from '../../../../variables/variable.js';
import "./honeypotpanel.css";

const HoneyPotPanel = (props) => {
    const { showNotify } = props;

    const CHAIN_ID = 1;
    const [modalHoneyFlag, showModalHoneyFlag] = useState(false);
    const [resultHoney, setResultHoney] = useState(null);
    const honeypotis = new HoneypotIsV1();

    useEffect(() => {

        async function getTokenAddressFromMainPanel() {
            if (props.sendTokenAddressForHoneyToSecurity) {
                const responseData = props.sendTokenAddressForHoneyToSecurity;
                const DeFi = responseData.token_address.toLowerCase();
                props.sendLoadingForHoneyToParent(true, responseData.key);
                try {
                    const DeFi_PAIRS = await honeypotis.getPairs(DeFi, CHAIN_ID);
                    const response = await honeypotis.honeypotScan(
                        DeFi,
                        DeFi_PAIRS[0].Router,
                        DeFi_PAIRS[0].Pair,
                        CHAIN_ID
                    );
                    // const response = await fetch(`https://api.honeypot.is/v1/GetPairs?chainID=1&address=${DeFi}`);
                    if (response) {
                        showModalHoneyFlag(true);
                        setResultHoney(response);
                    }

                    props.sendLoadingForHoneyToParent(false, responseData.key);
                } catch (error) {
                    props.sendLoadingForHoneyToParent(false, responseData.key);
                    if (error) showNotify(error.message, 'danger');
                    else if (error.response && typeof (error.response.data.message) === "string") showNotify(error.response.data.message, 'danger');
                    else showNotify('Something went wrong', 'danger');
                }
            }
        }
        getTokenAddressFromMainPanel();

    }, [props.sendTokenAddressForHoneyToSecurity])

    const onCloseHoneyModal = () => {
        showModalHoneyFlag(false);
    }

    return (
        <>
            <Modal modalClassName="modal-black mModal logs-page-modal" isOpen={modalHoneyFlag} >
                <div className="modal-header">
                    <h4>Check HoneyPot</h4>
                    <button
                        aria-label="Close"
                        className="close"
                        data-dismiss="modal"
                        type="button"
                        onClick={() => onCloseHoneyModal()}
                    >
                        <i className="tim-icons icon-simple-remove" />
                    </button>
                </div>
                {
                    <div className="modal-body padBtt detailInfo" style={{ paddingTop: "0px" }}>
                        <Form>
                            <Row>
                                <Col className="pr-md-1" md="12">
                                    {resultHoney &&

                                        <p style={{ color: "black" }}>

                                            *Token Address: {resultHoney.Token.Address}
                                            <br />
                                            *Token Name: {resultHoney.Token.Name}
                                            <br />

                                            *HoneyPot: {resultHoney.IsHoneypot === true ? (<span style={{ color: globalVariables.RED }}>HoneyPot detected</span>) :
                                                resultHoney.IsHoneypot === false ? (<span style={{ color: globalVariables.GREEN }}>No detected</span>) :
                                                    resultHoney.IsHoneypot === null ? <span>Retry detect.</span> : ''}
                                            <br />
                                            *Flags: {resultHoney.Flags && resultHoney.Flags.map(item => { return item + ", " })}

                                            <br />
                                            *Error: {resultHoney.Error}
                                            <br />


                                            *BuyGas: {resultHoney.BuyGas}
                                            <br />
                                            *SellGas: {resultHoney.SellGas}
                                            <br />
                                            *BuyTax: {resultHoney.BuyTax}
                                            <br />
                                            *SellTax: {resultHoney.SellTax}
                                            <br />
                                            *MaxBuy: {resultHoney.MaxBuy?.Token || '?'} {resultHoney.Token.Symbol} , &nbsp; {resultHoney.MaxBuy?.WithToken || '?'} {resultHoney.WithToken.Symbol}
                                            <br />
                                            *MaxSell: {resultHoney.MaxSell?.Token || '?'} {resultHoney.Token.Symbol} , &nbsp; {resultHoney.MaxSell?.WithToken || '?'} {resultHoney.WithToken.Symbol}
                                            <br />
                                            *TransferTax: {resultHoney.TransferTax}
                                            <br />
                                        </p>
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

export default HoneyPotPanel