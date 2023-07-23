/**
 *  Updated by Dragonslayer 5/27/2023
 */

import React, { useEffect, useState, useRef, useCallback } from "react";
import { request, gql } from "graphql-request";
import { ClipLoader } from "react-spinners";
import { Tooltip as ReactTooltip } from 'react-tooltip';
import { reduceString, globalVariables } from '../../../../variables/variable';
// reactstrap components
import {
  Row,
  Col,
  Modal,
  CardTitle,
  CardText,
} from "reactstrap";
import './traderspanel.css';


function useIsMounted() {
  const mountedRef = useRef(false);
  const get = useCallback(() => mountedRef.current, []);
  useEffect(() => {
    mountedRef.current = true;
    return () => mountedRef.current = false;
  }, []);
  return get;
}
const TradersPanel = (props) => {
  const { showNotify } = props;
  const isMounted = useIsMounted();
  const { apiConfig, ApiCall } = global;
  const [itemList, setItemList] = useState([]);
  const [loading, setLoading] = useState(false);
  const endpoint = 'https://streaming.bitquery.io/graphql';
  // const contractAddress = '0x7Dc00BCb98deE603AE2D2C284E91292746e833Cb';
  const [contractAddress, setContractAddress] = useState();
  const [token, setToken] = useState({});
  const [modalFlag, showModalFlag] = useState(false);

  const GET_HISTORY = gql`
    {
        EVM(dataset: combined, network: eth) {
          buyside: DEXTrades(
            orderBy: {descending: Block_Time}
            where: {Trade: {Buy: {Currency: {SmartContract: {is: "${contractAddress}"}}}}, Block: {Number: {gt: "0"}}}
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
            where: {Trade: {Sell: {Currency: {SmartContract: {is: "${contractAddress}"}}}}, Block: {Number: {gt: "0"}}}
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

  useEffect(() => {
    if (props.sendTokenAddressToTradersPanel) {
      setContractAddress(props.sendTokenAddressToTradersPanel.token_address);
      showModalFlag(true);
    }
  }, [props.sendTokenAddressToTradersPanel])

  useEffect(() => {
    if (contractAddress) {

      const fetchHistory = async () => {
        setLoading(true);
        try {
          const response = await request(endpoint, GET_HISTORY);
          if (response) {
            const sellingData = response.EVM.buyside.flat().reduce((acc, item) => {
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

            const buyingData = response.EVM.sellside.flat().reduce((acc, item) => {
              let BuyCount = 1;
              const { From } = item.Transaction;
              const BuyAmount = Number(item.Trade.Buy.Amount);
              const BlockNumber = Number(item.Block.Number);
              const existingItem = acc.find(obj => obj.From === From);
              if (existingItem) {
                existingItem.BuyAmount = Number(existingItem.BuyAmount) + Number(BuyAmount);
                existingItem.BuyCount += 1;
                existingItem.BlockNumber = Math.min(Number(existingItem.BlockNumber), Number(BlockNumber));
              } else {
                acc.push({ From, BuyAmount, BuyCount, BlockNumber });
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

            const currency = response.EVM.sellside[0]?.Trade.Sell.Currency;
            if (currency) {
              setToken({ Name: currency.Name, SmartContract: currency.SmartContract, Symbol: currency.Symbol, FirstBlock: mixData[0]?.BlockNumber || '' });
            }
            setItemList(mixData);

          }
          setLoading(false);
        } catch (error) {
          console.log(error);
          setLoading(false);
        }


      }
      fetchHistory();
    }
  }, [contractAddress]);

  const onCloseModal = () => {
    showModalFlag(false);
  }

  return (
    <>
      <Modal modalClassName="modal-black mModal traders-panel-modal" isOpen={modalFlag} >
        <div className="modal-header">
          <h4>Trader's information to buy and sell that tokens</h4>
          <button
            aria-label="Close"
            className="close"
            data-dismiss="modal"
            type="button"
            onClick={() => onCloseModal()}
          >
            <i className="tim-icons icon-simple-remove" />
          </button>
        </div>
        <div className="modal-body padBtt detailInfo" style={{ paddingTop: "0px" }}>
          {loading ? (
            <div className='clip-loader'>
              <ClipLoader color={globalVariables.GREEN} size="50px" />
            </div>
          ) : (
            // <Card>
            //   <CardHeader>
            //     <h5 className="title">Find out Best Dex | DeFi Trader</h5>
            //   </CardHeader>
            //   <CardBody>
            <Row>
              <Col className="pr-md-1 clock-center" md="12">
                <p style={{ color: 'black ' }}>
                  * Token Name: {token.Name}
                  <br />

                  * Token Address: <a href={globalVariables.ETHERSCAN_IO + token.SmartContract} target="_blank">{token.SmartContract}</a>
                  &nbsp;&nbsp;<a href={globalVariables.DEXTOOL_PAIR_EXPLORER + token.SmartContract} target="_blank"><i className="tim-icons icon-link-72" /></a>
                  <br />
                  * Token Symbol: {token.Symbol}
                  <br />
                  * First Block Number: {token.FirstBlock}
                  <br />
                </p>
                <table className="table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Address</th>
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
                      itemList.map((ele, key) => (
                        <tr key={key}>
                          <td>
                            {key + 1}
                          </td>
                          <td>
                            <a href={globalVariables.ETHERSCAN_IO + ele.From} target="_blank">{ele.From}</a>
                          </td>
                          <td>
                            {ele.BlockNumber}
                          </td>
                          <td>
                            {ele.BuyCount}
                          </td>
                          <td id={'tooltip_trader_buy_amount_' + key}>
                            {reduceString(ele.BuyAmount, 6) + "  " + globalVariables.BASE_TOKEN_SYMBOL}
                            <ReactTooltip
                              anchorId={'tooltip_trader_buy_amount_' + key}
                              place="bottom"
                              variant="success"
                              content={ele.BuyAmount}
                            />
                          </td>
                          <td>
                            {ele.SellCount}
                          </td>
                          <td id={'tooltip_trader_sell_amount_' + key}>
                            {reduceString(ele.SellAmount, 6) + "  " + globalVariables.BASE_TOKEN_SYMBOL}
                            <ReactTooltip
                              anchorId={'tooltip_trader_sell_amount_' + key}
                              place="bottom"
                              variant="success"
                              content={ele.SellAmount}
                            />
                          </td>
                          <td id={'tooltip_trader_profit_' + key}>
                            <span style={{ color: ele.Profit > 0 ? globalVariables.GREEN : globalVariables.RED }}>{reduceString(ele.Profit, 10) + "  " + globalVariables.BASE_TOKEN_SYMBOL}</span>
                            <ReactTooltip
                              anchorId={'tooltip_trader_profit_' + key}
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
            //   </CardBody>
            //   <CardFooter>

            //   </CardFooter>
            // </Card>
          )}
        </div>
      </Modal >
    </>
  );
};

export default TradersPanel;