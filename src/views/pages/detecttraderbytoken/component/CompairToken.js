/**
 *  Updated by Dragonslayer 5/27/2023
 */

import React, { useEffect, useState, useRef, useCallback } from "react";
import { connect } from "react-redux";
import { request, gql } from "graphql-request";
import { ClipLoader } from "react-spinners";
import { Tooltip as ReactTooltip } from 'react-tooltip';
import { reduceString, globalVariables } from '../../../../variables/variable';
import NotificationAlert from "react-notification-alert";
import BackToTopButton from "../../../../views/components/BackToTopButton.js";
// reactstrap components
import {
    Card,
    CardHeader,
    CardBody,
    CardFooter,
    Row,
    Col,
    Button,
    CardText
} from "reactstrap";
import './compairtoken.css';


function useIsMounted() {
    const mountedRef = useRef(false);
    const get = useCallback(() => mountedRef.current, []);
    useEffect(() => {
        mountedRef.current = true;
        return () => mountedRef.current = false;
    }, []);
    return get;
}
const CompairToken = (props) => {
    const isMounted = useIsMounted();
    const { apiConfig, ApiCall } = global;
    const notificationAlertRef = useRef(null);
    const showNotify = (message, type) => {
        let options = {};
        options = {
            place: "bl",
            message: message,
            type: type,
            icon: "tim-icons icon-bell-55",
            autoDismiss: 2,
        };
        if (notificationAlertRef.current) notificationAlertRef.current.notificationAlert(options);
    };
    const [loading, setLoading] = useState(false);
    const endpoint = 'https://streaming.bitquery.io/graphql';
    // const contractAddress = '0x7Dc00BCb98deE603AE2D2C284E91292746e833Cb';
    const [contractAddress, setContractAddress] = useState([]);
    const [compairData, setCompairData] = useState([]);
    const compairDataRef = useRef();
    const [result, setResult] = useState([]);

    const GET_HISTORY = contractAddress.map(item => {
        return gql`
        {
            EVM(dataset: combined, network: eth) {
              buyside: DEXTrades(
                orderBy: {descending: Block_Time}
                where: {Trade: {Buy: {Currency: {SmartContract: {is: "${item}"}}}}, Block: {Number: {gt: "0"}}}
              ) {
                Transaction {
                  From
                }
                Trade {
                  Buy {
                    Currency {
                      Name
                      SmartContract
                      Symbol
                    }
                  }
                  Sell {
                    Amount
                  }
                }
              }
              sellside: DEXTrades(
                orderBy: {descending: Block_Time}
                where: {Trade: {Sell: {Currency: {SmartContract: {is: "${item}"}}}}, Block: {Number: {gt: "0"}}}
              ) {
                Block {
                  Number
                  Time
                }
                Transaction {
                  From
                }
                Trade {
                  Buy {
                    Amount
                  }
                  Sell {
                    Currency {
                      Name
                      SmartContract
                      Symbol
                    }
                  }
                }
              }
            }
          }
          `
    })

    useEffect(() => {
        if (!props.location.state) {
            return;
        }
        const data = props.location.state;
        // const data = ['0x15fdc208ba6601933b610fb12b2516702773ce2b', '0x4d8a15aa13d06c2261e2176dab97261d0236003e'];
        // const data = ['0xe8b60d95881a522b82fb9add9f96fa5855544e34', '0xe86682391a71ff8c7526d97321db193c15add126'];
        setContractAddress(data)
    }, [props.location.state])

    useEffect(() => {
        if (GET_HISTORY.length > 0) {
            const fetchHistory = async () => {
                setLoading(true);
                try {
                    const requests = GET_HISTORY.map(history => fetch(endpoint, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ query: history }),
                    }));

                    const responses = await Promise.all(requests);
                    const data = await Promise.all(responses.map(response => response.json()));
                    if (data) {
                        data.map(response => {
                            const sellingData = response.data.EVM.buyside.flat().reduce((acc, item) => {
                                let SellCount = 1;
                                const { From } = item.Transaction;
                                const SellAmount = Number(item.Trade.Sell.Amount);
                                const existingItem = acc.find(obj => obj.From === From);
                                if (existingItem) {
                                    existingItem.SellAmount = Number(existingItem.SellAmount) + Number(SellAmount);
                                    existingItem.SellCount += 1;

                                } else {
                                    acc.push({ From, SellAmount, SellCount });
                                }
                                return acc;
                            }, []);

                            const buyingData = response.data.EVM.sellside.flat().reduce((acc, item) => {
                                let BuyCount = 1;
                                const { From } = item.Transaction;
                                const BuyAmount = Number(item.Trade.Buy.Amount);
                                const BlockNumber = Number(item.Block.Number);
                                const existingItem = acc.find(obj => obj.From === From);
                                const SmartContract = item.Trade.Sell.Currency.SmartContract;
                                if (existingItem) {
                                    existingItem.BuyAmount = Number(existingItem.BuyAmount) + Number(BuyAmount);
                                    existingItem.BuyCount += 1;
                                    existingItem.BlockNumber = Math.min(Number(existingItem.BlockNumber), Number(BlockNumber));
                                    existingItem.SmartContract = SmartContract;
                                } else {
                                    acc.push({ From, BuyAmount, BuyCount, BlockNumber, SmartContract });
                                }
                                return acc;
                            }, []);

                            const mixData = buyingData.map(item1 => {
                                const matchItem = sellingData.find(item2 => item2.From === item1.From);
                                if (matchItem) {
                                    return { ...item1, SellCount: matchItem.SellCount, SellAmount: matchItem.SellAmount, Profit: Number(matchItem.SellAmount) - Number(item1.BuyAmount) };
                                } else {
                                    return { ...item1, SellCount: 0, SellAmount: 0, Profit: 0 - Number(item1.BuyAmount) }
                                }
                            }).sort((a, b) => a.BlockNumber - b.BlockNumber)

                            const resultData = [...mixData, { FirstBlock: mixData[0]?.BlockNumber }];
                            setCompairData(prevItem => [...prevItem, resultData]);
                        })
                    }

                    setLoading(false);
                }
                catch (error) {
                    if (error.response && typeof (error.response.data.message) === "string") showNotify(error.response.data.message, 'danger');
                    else showNotify("Something went wrong.", "danger");
                    setLoading(false);
                }
            }
            fetchHistory();
        }
    }, [contractAddress]);


    useEffect(() => {
        const result = compairData.reduce((acc, arr) => {

            arr.forEach(item => {
                const { From } = item;
                const info = {
                    BuyCount: item.BuyCount,
                    SellCount: item.SellCount,
                    BuyAmount: item.BuyAmount,
                    SellAmount: item.SellAmount,
                    Profit: item.Profit,
                    SmartContract: item.SmartContract,
                    BlockNumber: item.BlockNumber,
                    FirstBlock: arr[arr.length - 1].FirstBlock
                }
                const existingItem = acc.find(obj => obj.From === From);
                if (existingItem) {
                    existingItem.Information.push(info);
                } else {
                    acc.push({ From, Information: [info] });
                }
            });
            return acc;

        }, []);

        const final = result.filter(item => item.Information.length > 1 && item.From !== undefined)      
        setResult(final);
    }, [compairData])

    const onBackMethod = () => {
        props.history.push({
            pathname: '/bot/detect_trader_by_token'
        })
    }

    return (
        <>
            <div className="rna-container">
                <NotificationAlert ref={notificationAlertRef} />
            </div>
            <div className="content">
                <Row>
                    <Col md="12">
                        <Col className="pr-md-1 toggle_botton" md="1">
                            <Button className="btn1" color="btn1" type="submit" onClick={onBackMethod}>
                                Back
                            </Button>
                        </Col>
                        {loading ? (
                            <div className='clip-loader'>
                                <ClipLoader color={globalVariables.GREEN} size="50px" />
                            </div>
                        ) : (
                            result.length === 0 ? (
                                <Card>
                                    <CardHeader>
                                    </CardHeader>
                                    <CardBody>
                                        <CardText style={{textAlign: "center", fontSize: "25px"}}>There are no results...</CardText>
                                    </CardBody>
                                </Card>
                            ) : (
                                result.map((ele, row) => (
                                    <Card key={row}>
                                        <CardHeader>
                                            <h5 className="title"><b>Trader Address:</b>&nbsp;&nbsp;&nbsp;<a href={globalVariables.ETHERSCAN_IO + ele.From} target="_blank">{ele.From}</a></h5>
                                        </CardHeader>
                                        <CardBody>
                                            <Row>
                                                <Col className="pr-md-1 clock-center" md="12">
                                                    <table className="table">
                                                        <thead>
                                                            <tr>
                                                                <th>#</th>
                                                                <th>Token Address</th>
                                                                <th>First Block Number</th>
                                                                <th>Block Number (First Bought)</th>
                                                                <th>Buy count</th>
                                                                <th>Buy amount</th>
                                                                <th>Sell count</th>
                                                                <th>Sell amount</th>
                                                                <th>Profit</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {
                                                                ele.Information.map((ele, col) => (
                                                                    <tr key={col}>
                                                                        <td>
                                                                            {col + 1}
                                                                        </td>
                                                                        <td>
                                                                            <a href={globalVariables.ETHERSCAN_IO + ele.SmartContract} target="_blank">{ele.SmartContract}</a>
                                                                            &nbsp;&nbsp;&nbsp;&nbsp;
                                                                            <a href={globalVariables.DEXTOOL_PAIR_EXPLORER + ele.SmartContract} target="_blank">
                                                                                <i className="tim-icons icon-link-72" />
                                                                            </a>
                                                                        </td>
                                                                        <td>{ele.FirstBlock}</td>
                                                                        <td>{ele.BlockNumber}</td>
                                                                        <td>
                                                                            {ele.BuyCount}
                                                                        </td>
                                                                        <td id={'tooltip_trader_buy_amount_' + row + '_' + col}>
                                                                            {reduceString(ele.BuyAmount, 6) + "  " + globalVariables.BASE_TOKEN_SYMBOL}
                                                                            <ReactTooltip
                                                                                anchorId={'tooltip_trader_buy_amount_' + row + '_' + col}
                                                                                place="bottom"
                                                                                variant="success"
                                                                                content={ele.BuyAmount}
                                                                            />
                                                                        </td>
                                                                        <td>
                                                                            {ele.SellCount}
                                                                        </td>
                                                                        <td id={'tooltip_trader_sell_amount_' + row + '_' + col}>
                                                                            {reduceString(ele.SellAmount, 6) + "  " + globalVariables.BASE_TOKEN_SYMBOL}
                                                                            <ReactTooltip
                                                                                anchorId={'tooltip_trader_sell_amount_' + row + '_' + col}
                                                                                place="bottom"
                                                                                variant="success"
                                                                                content={ele.SellAmount}
                                                                            />
                                                                        </td>
                                                                        <td id={'tooltip_trader_profit_' + row + '_' + col}>
                                                                            <span style={{ color: ele.Profit > 0 ? globalVariables.GREEN : globalVariables.RED }}>{reduceString(ele.Profit, 10) + "  " + globalVariables.BASE_TOKEN_SYMBOL}</span>
                                                                            <ReactTooltip
                                                                                anchorId={'tooltip_trader_profit_' + row + '_' + col}
                                                                                place="bottom"
                                                                                variant="success"
                                                                                content={ele.Profit}
                                                                            />
                                                                        </td>
                                                                    </tr>

                                                                ))
                                                            }
                                                        </tbody>
                                                    </table>
                                                </Col>
                                            </Row>
                                        </CardBody>
                                        <CardFooter>

                                        </CardFooter>
                                    </Card>
                                )
                                ))
                        )}
                    </Col>
                </Row>
            </div>
            <BackToTopButton></BackToTopButton>
        </>
    );
};


const mapStateToProps = (state) => {
    const { LoginReducer } = state;
    return { credential: LoginReducer };
};

export default connect(mapStateToProps)(CompairToken);