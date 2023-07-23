/**
 *  Created by Dragonslayer 6/22/2023
 */

import React, { useEffect, useState, useRef, useCallback } from "react";
import { GoPlusLabs } from '@normalizex/gopluslabs-api';

import {
    Col, Row, Modal, Form, Label
} from "reactstrap";
import { setColorToI, setColorToLabel, setColorToIByCount, setColorToLabelByCount } from '../../../../variables/variable.js';
import "./tokensecuritypanel.css";

const TokenSecurityPanel = (props) => {
    const { showNotify } = props;

    const CHAIN_ID = 1;
    const [modalGoPlusFlag, showModalGoPlusFlag] = useState(false);
    const [resultGoPlus, setResultGoPlus] = useState(null);
    const goPlus = new GoPlusLabs();

    useEffect(() => {

        async function getTokenAddressFromMainPanel() {
            if (props.sendTokenAddressToSecurity) {
                const responseData = props.sendTokenAddressToSecurity;
                const DeFi = responseData.token_address.toLowerCase();
                props.sendLoadingForGoPlusToParent(true, responseData.key);
                try {
                    const response = await goPlus.tokenSecurity(CHAIN_ID, DeFi)
                    if (response) {
                        setResultGoPlus(response);
                        showModalGoPlusFlag(true);
                    }
                    props.sendLoadingForGoPlusToParent(false, responseData.key);
                } catch (error) {
                    props.sendLoadingForGoPlusToParent(false, responseData.key);
                    if(error) showNotify(error.message, 'danger');
                    else if (error.response && typeof (error.response.data.message) === "string") showNotify(error.response.data.message, 'danger');
                    else showNotify('Something went wrong', 'danger');
                }
            }
        }
        getTokenAddressFromMainPanel();

    }, [props.sendTokenAddressToSecurity])

    const onCloseGoPlusModal = () => {
        showModalGoPlusFlag(false);
    }

    return (
        <>
            <Modal modalClassName="modal-black mModalGoPlus logs-page-modal" id="mModalGoPlus" isOpen={modalGoPlusFlag} >
                <div className="modal-header">
                    <h4>Check HoneyPot</h4>
                    <button
                        aria-label="Close"
                        className="close"
                        data-dismiss="modal"
                        type="button"
                        onClick={() => onCloseGoPlusModal()}
                    >
                        <i className="tim-icons icon-simple-remove" />
                    </button>
                </div>
                {
                    <div className="modal-body padBtt detailInfo" style={{ paddingTop: "0px" }}>
                        <Form>
                            <Row>
                                <Col className="pr-md-1" md="12">
                                    {resultGoPlus &&
                                        <>
                                            <Label title=''>
                                                *Token Address: <b>{resultGoPlus.address}</b></Label>
                                            <br />
                                            <Label title=''>
                                                *token_name: <b>{resultGoPlus.token_name}</b></Label>
                                            <br />
                                            <Label title=''>
                                                *token_symbol: <b>{resultGoPlus.token_symbol}</b></Label>
                                            <br />
                                            <Label title='It describes the supply number of the token.Example:"total_supply": 100000000'>
                                                *total_supply: <span style={{ color: setColorToLabelByCount(resultGoPlus.total_supply) }}> {setColorToIByCount(resultGoPlus.total_supply)}</span></Label>
                                            <br />
                                            <br />

                                            <Label title='It describes this contract`s owner address. Example: "creator_address": "0x744aF9cBb7606BB040f6FBf1c0a0B0dcBA6385E5";'>
                                                *creator_address: {resultGoPlus.creator_address}</Label>
                                            <br />
                                            <Label title='It describes the balance of the contract owner. Example:"owner_balance": 100000000.'>
                                                *creator_balance: <span style={{ color: setColorToLabelByCount(resultGoPlus.creator_balance) }}> {setColorToIByCount(resultGoPlus.creator_balance)}</span></Label>
                                            <br />
                                            <Label title='It describes the percentage of tokens held by the contract owner. Example:"owner_balance": 0.1.'>
                                                *creator_percent: <span style={{ color: setColorToLabelByCount(resultGoPlus.creator_percent) }}> {setColorToIByCount(resultGoPlus.creator_percent)}</span></Label>
                                            <br />
                                            <br />

                                            <Label title="It describes this contract's owner address. Example: 'owner_address': '0x744aF9cBb7606BB040f6FBf1c0a0B0dcBA6385E5'; No return means unknown; Return empty means there is no ownership or can't find ownership.">
                                                *owner_address: {resultGoPlus.owner_address}</Label>
                                            <br />
                                            <Label title='It describes the balance of the contract owner. Example: "owner_balance": "100000000". No return or return empty means there is no ownership or can`t find ownership.'>
                                                *owner_balance: <span style={{ color: setColorToLabelByCount(resultGoPlus.owner_balance) }}> {setColorToIByCount(resultGoPlus.owner_balance)}</span></Label>
                                            <br />
                                            <Label title='It describes whether the contract owner has the authority to change the balance of any token holder. "1" means true; "0" means false; No return means unknown.'>
                                                *owner_change_balance: <span style={{ color: setColorToLabel(resultGoPlus.owner_change_balance) }}> {setColorToI(resultGoPlus.owner_change_balance)}</span></Label>
                                            <br />
                                            <Label title='It describes the percentage of tokens held by the contract owner. Example:"owner_balance": "0.1". No return or return empty means there is no ownership or can`t find ownership.'>
                                                *owner_percent: <span style={{ color: setColorToLabelByCount(resultGoPlus.owner_percent) }}> {setColorToIByCount(resultGoPlus.owner_percent)}</span></Label>
                                            <br />
                                            <br />

                                            <Label title='It describes the tax when buying the token. Example: "buy_tax": 0.1%. Empty string (i.e., "") means unknown."'>
                                                *buy_tax:  <span style={{ color: setColorToLabelByCount(resultGoPlus.buy_tax) }}> {setColorToIByCount(resultGoPlus.buy_tax)}</span></Label>
                                            <br />
                                            <Label title='It describes the tax when selling the token. Example: "sell_tax": 0.1%. Empty string (i.e., "") means unknown.'>
                                                *sell_tax: <span style={{ color: setColorToLabelByCount(resultGoPlus.sell_tax) }}> {setColorToIByCount(resultGoPlus.sell_tax)}</span></Label>
                                            <br />
                                            <Label title='It describes whether the trading tax can be modifiable by token contract."1" means true;"0" means false;No return means unknown.'>
                                                *slippage_modifiable: <span style={{ color: setColorToLabel(resultGoPlus.slippage_modifiable) }}> {setColorToI(resultGoPlus.slippage_modifiable)}</span></Label>
                                            <br />
                                            <Label title='It describes whether this contract has the function to mint tokens. "1" means true; "0" means false; No return means unknown. '>
                                                *is_mintable: <span style={{ color: setColorToLabel(resultGoPlus.is_mintable) }}> {setColorToI(resultGoPlus.is_mintable)}</span></Label>
                                            <br />
                                            <Label title='It describes whether the contract has the function to modify the maximum amount of transactions or the maximum token position. "1" means true; "0" means false; No return means unknown.'>
                                                *anti_whale_modifiable: <span style={{ color: setColorToLabel(resultGoPlus.anti_whale_modifiable) }}> {setColorToI(resultGoPlus.anti_whale_modifiable)}</span></Label>
                                            <br />
                                            <Label title='It describes whether the contract has the function to limit the maximum amount of transactions or the maximum token position that for single address. "1" means true; "0" means false; No return means unknown.'>
                                                *is_anti_whale: <span style={{ color: setColorToLabel(resultGoPlus.is_anti_whale) }}> {setColorToI(resultGoPlus.is_anti_whale)}</span></Label>
                                            <br />
                                            <Label title="It describes whether the token is a honeypot. 'HoneyPot' means that the token maybe cannot be sold because of the token contract's function, Or the token contains malicious code. '1' means true; '0' means false; No return means unknown.">
                                                *is_honeypot: <span style={{ color: setColorToLabel(resultGoPlus.is_honeypot) }}> {setColorToI(resultGoPlus.is_honeypot)}</span></Label>
                                            <br />
                                            <Label title=''>
                                                *honeypot_with_same_creator: <span style={{ color: setColorToLabelByCount(resultGoPlus.honeypot_with_same_creator) }}> {setColorToIByCount(resultGoPlus.honeypot_with_same_creator)}</span></Label>
                                            <br />
                                            <Label title='It describes whether trading can be pausable by token contract."1" means true;"0" means false;No return means unknown.'>
                                                *transfer_pausable: <span style={{ color: setColorToLabel(resultGoPlus.transfer_pausable) }}> {setColorToI(resultGoPlus.transfer_pausable)}</span></Label>
                                            <br />
                                            <Label title='It describes whether the blacklist function is not included in the contract. If there is a blacklist, some addresses may not be able to trade normally."1" means true;"0" means false; No return means unknown.'>
                                                *is_blacklisted: <span style={{ color: setColorToLabel(resultGoPlus.is_blacklisted) }}> {setColorToI(resultGoPlus.is_blacklisted)}</span></Label>
                                            <br />
                                            <Label title='It describes whether the whitelist function is not included in the contract. If there is a whitelist, some addresses may not be able to trade normally."1" means true;"0" means false; No return means unknown.'>
                                                *is_whitelisted: <span style={{ color: setColorToLabel(resultGoPlus.is_whitelisted) }}> {setColorToI(resultGoPlus.is_whitelisted)}</span></Label>
                                            <br />
                                            <br />

                                            <Label title='It describes whether this contract has the function to take back ownership. "1" means true; "0" means false; No return means unknown.'>
                                                *can_take_back_ownership: <span style={{ color: setColorToLabel(resultGoPlus.can_take_back_ownership) }}> {setColorToI(resultGoPlus.can_take_back_ownership)}</span></Label>
                                            <br />
                                            <Label title='It deiscribes whether the Token can be bought."1" means true; "0" means false; No return means unknown.'>
                                                *cannot_buy: <span style={{ color: setColorToLabel(resultGoPlus.cannot_buy) }}> {setColorToI(resultGoPlus.cannot_buy)}</span></Label>
                                            <br />
                                            <Label title='It describes whether the contract has the function restricting token holder selling all the token. "1" means true; "0" means false; No return means unknown.'>
                                                *cannot_sell_all: <span style={{ color: setColorToLabel(resultGoPlus.cannot_sell_all) }}> {setColorToI(resultGoPlus.cannot_sell_all)}</span></Label>
                                            <br />

                                            <Label title='It describes whether the contract would call functions of other contracts when primary methods are executed."1" means true; "0" means false;No return means unknown.'>
                                                *external_call: <span style={{ color: setColorToLabel(resultGoPlus.external_call) }}> {setColorToI(resultGoPlus.external_call)}</span></Label>
                                            <br />
                                            <Label title='It describes whether the contract has hidden owners. For contract with a hidden owner, developer can still manipulate the contract even if the ownership has been abandoned.“1” means true;"0" means false;No return means unknown.'>
                                                *hidden_owner: <span style={{ color: setColorToLabel(resultGoPlus.hidden_owner) }}> {setColorToI(resultGoPlus.hidden_owner)}</span></Label>
                                            <br />
                                            <Label title='It describes the number of token holders.Example:"holder_count": "4342"'>
                                                *holder_count:  <span style={{ color: setColorToLabelByCount(resultGoPlus.holder_count) }}> {setColorToIByCount(resultGoPlus.holder_count)}</span></Label>
                                            <br />
                                            <Label title='It describes whether the token can be traded on the main Dex."1" means true;"0" means false'>
                                                *is_in_dex: <span style={{ color: setColorToLabel(resultGoPlus.is_in_dex) }}> {setColorToI(resultGoPlus.is_in_dex)}</span></Label>
                                            <br />
                                            <Label title='It describes whether this contract is open source. "1" means true; "0" means false.'>
                                                *is_open_source: <span style={{ color: setColorToLabel(resultGoPlus.is_open_source) }}> {setColorToI(resultGoPlus.is_open_source)}</span></Label>
                                            <br />

                                            <Label title='It describes whether this contract has a proxy contract. "1" means true; "0" means false; No return means unknown.'>
                                                *is_proxy: <span style={{ color: setColorToLabel(resultGoPlus.is_proxy) }}> {setColorToI(resultGoPlus.is_proxy)}</span></Label>
                                            <br />
                                            <br />




                                            <Label title='It describes whether the owner can set a different tax rate for every assigned address."1" means ture;"0" means false;No return means unknown.'>
                                                *personal_slippage_modifiable: <span style={{ color: setColorToLabel(resultGoPlus.personal_slippage_modifiable) }}> {setColorToI(resultGoPlus.personal_slippage_modifiable)}</span></Label>
                                            <br />
                                            <Label title='It describes whether this contract can self destruct."1" means true; "0" means false;No return means unknown.'>
                                                *selfdestruct: <span style={{ color: setColorToLabel(resultGoPlus.selfdestruct) }}> {setColorToI(resultGoPlus.selfdestruct)}</span></Label>
                                            <br />
                                            <Label title='It describes whether the contract has trading-cool-down mechanism which can limits the minimum time between two transactions."1" means true; "0" means false; No return means unknown.'>
                                                *trading_cooldown: <span style={{ color: setColorToLabel(resultGoPlus.trading_cooldown) }}> {setColorToI(resultGoPlus.trading_cooldown)}</span></Label>
                                            <br />
                                            <br />


                                            <Label title='It describes the number of LP token holders.Example:"lp_holder_count": "4342".No return means no LP.'>
                                                *lp_holder_count: <span style={{ color: setColorToLabelByCount(resultGoPlus.lp_holder_count) }}> {setColorToIByCount(resultGoPlus.lp_holder_count)}</span></Label>
                                            <br />
                                            <Label title='It describes the supply number of the LP token.Example:"lp_total_supply": "100000000".No return means no LP.'>
                                                *lp_total_supply: <span style={{ color: setColorToLabelByCount(resultGoPlus.lp_total_supply) }}> {setColorToIByCount(resultGoPlus.lp_total_supply)}</span></Label>
                                            <br />
                                            <br />

                                            <Label title='It describes whether the token is true or fake."1" means true token;"0" means fake token;None means no result (Because we did not find decisive information about the truth or falsity)'>
                                                *is_true_token: <span style={{ color: setColorToLabel(resultGoPlus.is_true_token) }}> {setColorToI(resultGoPlus.is_true_token)}</span></Label>
                                            <br />
                                            <Label title='It describes whether the token is an airdrop scam."1" means true;"0" means false;None means no result (Because We did not find conclusive information on whether token is an airdrop scam).'>
                                                *is_airdrop_scam: <span style={{ color: setColorToLabel(resultGoPlus.is_airdrop_scam) }}> {setColorToI(resultGoPlus.is_airdrop_scam)}</span></Label>
                                            <br />
                                            <Label title='It describes whether the token is a famous and trustworthy one. "1" means true; No return no result (Because We did not find conclusive information on whether token is a airdrop scam).'>
                                                *trust_list: <span style={{ color: setColorToLabel(resultGoPlus.trust_list) }}> {setColorToI(resultGoPlus.trust_list)}</span></Label>
                                            <br />
                                            <Label title='It describes whether the contract has other potential risks.Example:“other_potential_risks”: “Owner can set different transaction taxes for each user, which can trigger serious losses.”'>
                                                *other_potential_risks: {resultGoPlus.other_potential_risks}</Label>
                                            <br />
                                            <Label title='It describes whether the contract has other things investors need to know. Example: "note”: “Contract owner is a multisign contract.”'>
                                                *note: {resultGoPlus.note}</Label>
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

export default TokenSecurityPanel