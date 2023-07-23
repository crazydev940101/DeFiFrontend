/**
 *  Updated by Dragonslayer 5/27/2023
 */

import React, { useEffect, useState, useRef, useCallback } from "react";
import Web3 from "web3";
import axios from 'axios';
// reactstrap components
import {
    Card,
    CardHeader,
    CardBody,
    CardFooter,
    Row,
    Col,
} from "reactstrap";

const web3 = new Web3('https://mainnet.infura.io/v3/YOUR_INFURA_PROJECT_ID');



function useIsMounted() {
    const mountedRef = useRef(false);
    const get = useCallback(() => mountedRef.current, []);
    useEffect(() => {
        mountedRef.current = true;
        return () => mountedRef.current = false;
    }, []);
    return get;
}
const WalletList = (props) => {
    const { showNotify } = props;
    const isMounted = useIsMounted();
    const { apiConfig, ApiCall } = global;
    const walletAddress = 'YOUR_WALLET_ADDRESS';
    
    useEffect(() => {
        const apiUrl = `https://api.ethplorer.io/getAddressInfo/${walletAddress}?apiKey=freekey`;
        axios.get(apiUrl)
          .then(response => {
            const tokens = response.data.tokens;
            tokens.forEach(token => {
              console.log(`Token: ${token.tokenInfo.symbol}`);
              console.log(`Balance: ${token.balance}`);
            });
          })
          .catch(error => {
            console.error('Error fetching token balances:', error);
          });
     
    }, []);


    return (
        <>
            <Card>
                <CardHeader>
                    <h5 className="title">Track Wallet</h5>
                </CardHeader>
                <CardBody>
                    <Row>
                        <Col className="pr-md-1 clock-center" md="12">
                        </Col>

                    </Row>
                </CardBody>
                <CardFooter>

                </CardFooter>
            </Card>
        </>
    );
};

export default WalletList;