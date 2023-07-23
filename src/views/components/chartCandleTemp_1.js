import React, { useState, useEffect, useRef } from 'react';
import { createChart } from 'lightweight-charts';
import { createClient } from 'graphql-ws';
import { request, gql } from "graphql-request";
import { ClipLoader } from "react-spinners";
import { globalVariables } from '../../variables/variable';
const CandleChart = (props) => {

    const [itemList, setItemList] = useState([]);
    const [contractAddress, setContractAddress] = useState('');
    const [loading, setLoading] = useState(false);
    const contractAddressRef = useRef();
    const itemListRef = useRef();
    const chartRef = useRef();
    const containerRef = useRef();
    const client = createClient({
        url: 'wss://streaming.bitquery.io/graphql'
    });
    const endpoint = 'https://streaming.bitquery.io/graphql';

    const GET_SUBSCRIPTION = `
            subscription {
            EVM(network: eth) {
                DEXTradeByTokens(
                orderBy: { ascendingByField: "Block_Time" }
                where: {
                    Trade: {
                    Side: {
                        Currency: {
                        SmartContract: { is: "${contractAddress}" }
                        }
                    }
                    }
                }
                ) {
                Block {
                    Time(interval: { in: minutes, count: 1})
                }
                volume: sum(of: Trade_Amount)
                Trade {
                    high: Price(maximum: Trade_Price)
                    low: Price(minimum: Trade_Price)
                    open: Price(minimum: Block_Number)
                    close: Price(maximum: Block_Number)
                }
                count
                }
            }
            }
            `;

    const GET_HISTORY = gql`
            query {
            EVM(network: eth) {
                DEXTradeByTokens(
                orderBy: {ascendingByField: "Block_Time"}
                where: {Trade: {Side: {Currency: {SmartContract: {is: "${contractAddress}"}}}}, Block: {Number: {gt: "0"}}}
                ) {
                Block {
                    Time(interval: {in: minutes, count: 1})
                    Number
                }
                volume: sum(of: Trade_Amount)
                Trade {
                    high: Price(maximum: Trade_Price)
                    low: Price(minimum: Trade_Price)
                    open: Price(minimum: Block_Number)
                    close: Price(maximum: Block_Number)
                }
                count
                }
            }
            }
            `

    useEffect(() => {
        if (props.sendTokenAddress) {
            contractAddressRef.current = props.sendTokenAddress;
            setContractAddress(contractAddressRef.current);
        }
    }, [props.sendTokenAddress])

    useEffect(() => {
        // console.log("contract address, ", contractAddress)
        if (contractAddress) {
            client.subscribe({ query: GET_SUBSCRIPTION }, {
                next: (data) => {
                    if (data.data.EVM) {
                        const item = data.data.EVM.DEXTradeByTokens[0];
                        setItemList(prevItem => [...prevItem, item]);
                    }
                },
                error: (err) => {
                    console.log('err, ', err);
                }
            })
        }
    }, [contractAddress]);


    useEffect(() => {
        if (contractAddress) {
            setLoading(true);
            const fetchHistory = async () => {
                const response = await request(endpoint, GET_HISTORY);
                if (response) {
                    setItemList(response.EVM.DEXTradeByTokens);
                    // console.log(123, response.EVM.DEXTradeByTokens);
                    setLoading(false);
                }
            }
            fetchHistory();
        }

    }, [contractAddress])


    // useEffect(() => {
    //     const chartOptions = {
    //         width: 900,
    //         height: 600,
    //     };
    //     const chart = createChart(containerRef.current, chartOptions);
    //     chartRef.current = chart;
    // }, [])

    useEffect(() => {
        let chart = null;
        if (itemList && containerRef.current) {
            const chartData = itemList.reduce((result, item) => {
                // console.log(1, exchangeRate)
                const { Trade, Block } = item;
                const open = Number(Trade.open);
                const high = Number(Trade.high);
                const low = Number(Trade.low);
                const close = Number(Trade.close);
                // const value = tradeAmount / trades;
                const dateTime = new Date(Block.Time);
                const hoursToAdd = 7;
                const PDTTime = new Date(
                    dateTime.getTime() - hoursToAdd * 60 * 60 * 1000
                );
                // console.log("time: ", new Date(item.timeInterval.minute).getTime() / 1000)
                // console.log(format('hh:mm:ss', PDTTime));

                const minuteKey = new Date(PDTTime).getTime() / 1000; // Use the timestamp as key

                if (result[minuteKey]) {
                    // If the minute key already exists, update the aggregated values
                    // console.log(1, high)
                    // console.log(2, result[minuteKey].high)
                    result[minuteKey].high = Math.max(result[minuteKey].high, high);
                    result[minuteKey].low = Math.min(result[minuteKey].low, low);
                    result[minuteKey].close = close;

                } else {
                    // If the minute key doesn't exist, create a new entry
                    result[minuteKey] = {
                        time: minuteKey,
                        open: open,
                        high: high,
                        low: low,
                        close: close,
                    };
                }

                return result;
            }, {});

            const objectChartData = Object.values(chartData);
            const chartOptions = {
                width: 900,
                height: 600,
            };
            chart = createChart(containerRef.current, chartOptions);
            chartRef.current = chart;

            const candlestickSeries = chartRef.current.addCandlestickSeries();
            console.log(567, candlestickSeries);
            if (objectChartData) {
                itemListRef.current = objectChartData
                candlestickSeries.setData(itemListRef.current);
            }
            // chart.timeScale().fitContent();  
            const myPriceFormatter = p => p.toFixed(30);
            chartRef.current.applyOptions({

                priceScale: {
                    mode: 1,
                    autoScale: true,
                    invertScale: false,
                    alignLabels: true,
                    borderVisible: true,
                    scaleMargins: {
                        top: 0.2,
                        bottom: 0.2,
                    }
                },
                timeScale: {
                    // autoScale: true,
                    // barSpacing: 3,
                    // fixRightEdge: true,
                    // lockVisibleTimeRangeOnResize: true,
                    // rightBarStaysOnScroll: true,
                    // borderVisible: false,
                    // borderColor: "#fff000",
                    // visible: true,

                    rightOffset: 5,
                    minBarSpacing: 0.1,
                    barSpacing: 10,
                    timeVisible: true,
                    secondsVisible: true,
                    tickMarkFormatter: (time, tickIndex, ticks) => {
                        const date = new Date(time * 1000);
                        const hours = date.getHours().toString().padStart(2, '0');
                        const minutes = date.getMinutes().toString().padStart(2, '0');
                        return `${hours}:${minutes}`;
                    },
                },
                localization: {
                    priceFormatter: myPriceFormatter,
                },
            });

            // const symbolName = 'ETC USD 7D VWAP';
            // const container = containerRef.current;


            // const childElement = container.querySelector('div');
            // if (childElement) {
            //     container.removeChild(childElement);
            // }
            // const legend = document.createElement('div');
            // legend.style = `position: absolute; left: 40px; top: 32px; z-index: 1; font-size: 14px;-family: sans-serif; line-height: 18px; font-weight: 300;`;
            // container.appendChild(legend);
            // const firstRow = document.createElement('div');
            // firstRow.innerHTML = symbolName;
            // firstRow.style.color = 'black';
            // legend.appendChild(firstRow);



            // chartRef.current.subscribeCrosshairMove(param => {
            //     let priceFormatted = '';
            //     let open = 0;
            //     let close = 0;
            //     let high = 0;
            //     let low = 0;
            //     if (param.time) {
            //         if (param.seriesData) {
            //             const array2D = Array.from(param.seriesData.entries()).map(([key, value]) => ({ key, ...value }));

            //             // open = array2D[0].open.toFixed(16).replace(/0+$/, '').replace('.', '₀');
            //             open = array2D[0].open.toFixed(30);
            //             close = array2D[0].close.toFixed(30);
            //             high = array2D[0].high.toFixed(30);
            //             low = array2D[0].low.toFixed(30);
            //         }
            //         // const price = data.value !== undefined ? data.value : data.close;
            //         // priceFormatted = price.toFixed(20);
            //     }
            //     firstRow.innerHTML = `${symbolName} open: <strong>${open}</strong> close: <strong>${close}</strong> high: <strong>${high}</strong> low: <strong>${low}</strong>`;
            // });
            // chart.timeScale().scrollToPosition(1, true);
            // chart.timeScale().fitContent();  

        }

        return () => {
            if (chartRef.current) chartRef.current.remove();
        };


    }, [itemList]);


    return (
        <>
            {
                contractAddress && (
                    loading ? (
                        <div className='clip-loader'>
                            <ClipLoader color={globalVariables.GREEN} size="50px" />
                        </div>
                    ) : (
                        <div className="chart-wrapper-OHMYAEMB">
                            <div ref={containerRef} />
                        </div>
                    )
                )
            }
        </>
    );
};

export default CandleChart;
