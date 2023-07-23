import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createChart } from 'lightweight-charts';
import { ClipLoader } from "react-spinners";
import { globalVariables } from '../../variables/variable';
const LineChart = (props) => {

    const [itemList, setItemList] = useState([]);
    const [contractAddress, setContractAddress] = useState('');
    const [loading, setLoading] = useState(false);
    const itemListRef = useRef();
    const chartRef = useRef();
    const containerRef = useRef();
    const [tokenId, setTokenId] = useState('');
    const tokenIdRef = useRef();

    const chartOptions = {
        width: 900,
        height: 600,
        layout: {
            textColor: 'black',
            background: { type: 'solid', color: 'white' },
        },
    };

    useEffect(() => {
        if (props.sendTokenAddress) {
            setTokenId(props.sendTokenAddress.token_id);
        }
    }, [props.sendTokenAddress])

    useEffect(() => {
        const timeNow = new Date().getTime();
        console.log('aaa,', timeNow);
        const data = [
            { time: 1689165130000, value: 27.58405298746434 },
            { time: 1689165130010, value: 31.74088841431117 },
            { time: 1689165130050, value: 35.892978753808926 },
            { time: 1689165130100, value: 39.63642029045179 },
            { time: 1689165130200, value: 40.79167357702531 },
            { time: 1689165130600, value: 47.691740220947764 },
            { time: 1689165131000, value: 49.377161099825415 },
        ]
        itemListRef.current = [...data];
        setItemList(itemListRef.current);        
    }, [])

    

    const blockNumberCallback = useCallback(date => {
        const timeNow = new Date().getTime();
        console.log('aaa,', timeNow);
        const response = {
            time: timeNow, value: 27.58405298746434 
        }
        const updateData = [...itemListRef.current, response];
        itemListRef.current = updateData;
        setItemList(itemListRef.current);
        console.log("socket on", itemList);
    })
    useEffect(() => {
        const socket = props.socket;
        if (socket) {
            socket.on("test:socket", blockNumberCallback);
            return () => {
                if (socket) {
                    socket.off("test:socket", blockNumberCallback);
                }
            };
        }
    }, [props.socket])

    useEffect(() => {
        console.log("initial price,", itemList);
    }, [itemList])

    useEffect(() => {
        console.log(4, itemList)
        if(tokenId) {
            
            // const chart = createChart(containerRef.current, chartOptions);
            const chart = createChart(document.getElementById('container'), chartOptions);
    
            const series = chart.addLineSeries({
                color: '#2962FF',
                lineWidth: 2,
                // disabling built-in price lines
                lastValueVisible: false,
                priceLineVisible: false,
            });
    
            series.setData(itemList);

            let minimumPrice = itemList[0].value;
            let maximumPrice = minimumPrice;
            for (let i = 1; i < itemList.length; i++) {
                const price = itemList[i].value;
                if (price > maximumPrice) {
                    maximumPrice = price;
                }
                if (price < minimumPrice) {
                    minimumPrice = price;
                }
            }
            const avgPrice = (maximumPrice + minimumPrice) / 2;
    
            const lineWidth = 2;
            const minPriceLine = {
                price: minimumPrice,
                color: '#ef5350',
                lineWidth: lineWidth,
                lineStyle: 2, // LineStyle.Dashed
                axisLabelVisible: true,
                title: 'min price',
            };
            const avgPriceLine = {
                price: avgPrice,
                color: 'black',
                lineWidth: lineWidth,
                lineStyle: 1, // LineStyle.Dotted
                axisLabelVisible: true,
                title: 'ave price',
            };
            const maxPriceLine = {
                price: maximumPrice,
                color: '#26a69a',
                lineWidth: lineWidth,
                lineStyle: 2, // LineStyle.Dashed
                axisLabelVisible: true,
                title: 'max price',
            };
    
            series.createPriceLine(minPriceLine);
            series.createPriceLine(avgPriceLine);
            series.createPriceLine(maxPriceLine);
    
            // chart.timeScale().fitContent();

            // chart.applyOptions({
            //     timeScale: {
            //         timeVisible: true,
            //         secondsVisible: true,
            //         tickMarkFormatter: (time, tickIndex, ticks) => {
            //             const date = new Date(time * 1000);
            //             const hours = date.getHours().toString().padStart(2, '0');
            //             const minutes = date.getMinutes().toString().padStart(2, '0');
            //             return `${hours}:${minutes}`;
            //         },
            //     },
            // })
    
            return () => {
                chart.remove();
            };
        }
        
        

    }, [tokenId, itemList]);


    return (
        <>
            {
                loading ? (
                    <div className='clip-loader'>
                        <ClipLoader color={globalVariables.GREEN} size="50px" />
                    </div>
                ) : (
                    <div className="chart-wrapper-OHMYAEMB">
                        {/* <div ref={containerRef} /> */}
                        <div id='container'/>
                    </div>
                )
            }
        </>
    );
};

export default LineChart;
