
import { createChart } from 'lightweight-charts';
import React, {
    createContext,
    forwardRef,
    useCallback,
    useContext,
    useEffect,
    useImperativeHandle,
    useLayoutEffect,
    useRef,
    useState,
} from 'react';
import { createClient } from 'graphql-ws';
import { request, gql } from "graphql-request";
import { ClipLoader } from "react-spinners";
import { globalVariables } from '../../variables/variable';


const Context = createContext();

export const CandleChart = props => {
    const initData = props.sendInitialData;
    const client = createClient({
        url: 'wss://streaming.bitquery.io/graphql'
    });
    const endpoint = 'https://streaming.bitquery.io/graphql';
    const GET_HISTORY = gql`
        query {
        EVM(network: eth) {
            DEXTradeByTokens(
            orderBy: {ascendingByField: "Block_Time"}
            where: {Trade: {Side: {Currency: {SmartContract: {is: "${initData.token_address}"}}}}, Block: {Number: {gt: "0"}}}
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
    const GET_SUBSCRIPTION = `
        subscription {
        EVM(network: eth) {
            DEXTradeByTokens(
            orderBy: { ascendingByField: "Block_Time" }
            where: {
                Trade: {
                Side: {
                    Currency: {
                    SmartContract: { is: "${initData.token_address}" }
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

    const [initialData, setInitialData] = useState([]);
    const [loading, setLoading] = useState(false);
    const initialDataRef = useRef();

    const {
        colors: {
            backgroundColor = initData.key % 2 === 0 ? '#c4c9c5' : '#ffffff',
            lineColor = globalVariables.GREEN,
            textColor = 'black',
        } = {},
    } = props;

    const [chartLayoutOptions, setChartLayoutOptions] = useState({});
    // The following variables illustrate how a series could be updated.
    const series1 = useRef(null);

    // The purpose of this effect is purely to show how a series could
    // be updated using the `reference` passed to the `Series` component.

    useEffect(() => {
        if (initData.token_address) {
            client.subscribe({ query: GET_SUBSCRIPTION }, {
                next: (data) => {
                    if (data.data.EVM) {
                        const item = data.data.EVM.DEXTradeByTokens[0];
                        const result = {
                                    time: new Date(item.Block.Time).getTime() / 1000,
                                    open: Number(item.Trade.open),
                                    high: Number(item.Trade.high),
                                    low:  Number(item.Trade.low),
                                    close: Number(item.Trade.close),
                                };
                        console.log("new data, ", result.time);   
                        series1.current.update(result);
                    }
                },
                error: (err) => {
                    console.log('err, ', err);
                }
            })
        }
    }, [initData.token_address]);

    useEffect(() => {
        if (initData.token_address) {
            setLoading(true);
            const fetchHistory = async () => {
                const response = await request(endpoint, GET_HISTORY);
                console.log("history data, ", response);
                if (response) {
                    const chartData = response.EVM.DEXTradeByTokens.reduce((result, item) => {
                        const { Trade, Block } = item;
                        const open = Number(Trade.open);
                        const high = Number(Trade.high);
                        const low = Number(Trade.low);
                        const close = Number(Trade.close);
                        const time = new Date(Block.Time).getTime() / 1000;
                        if(result[time]) {
                            result[time].high = Math.max(result[time].high, high);
                            result[time].low = Math.min(result[time].low, low);
                            result[time].close = close;
                        }else{
                            result[time] = {
                                time: time,
                                open: open,
                                high: high,
                                low: low,
                                close: close,
                            };
                        }
                        return result;
                    }, {})
                    const objectChartData = Object.values(chartData);
                    initialDataRef.current = objectChartData;
                    // console.log(11, objectChartData);
                    setInitialData(initialDataRef.current);
                    setLoading(false);
                }
            }
            fetchHistory();
        }

    }, [initData.token_address])

    useEffect(() => {
        setChartLayoutOptions({
            background: {
                color: backgroundColor,

            },
            textColor,
        });
    }, [backgroundColor, textColor]);

    return (
        loading ? (
            <div className='clip-loader'>
                <ClipLoader color={globalVariables.GREEN} size="50px" />
            </div>
        ) : (
        <div className="chart-wrapper-OHMYAEMB">
            <Chart layout={chartLayoutOptions}>
                <Series
                    ref={series1}
                    type={'candle'}
                    data={initialData}
                    color={lineColor}
                />
            </Chart>
        </div>
           )
    );
};

export function Chart(props) {
    const [container, setContainer] = useState(false);
    const handleRef = useCallback(ref => setContainer(ref), []);
    return (
        <div ref={handleRef}>
            {container && <ChartContainer {...props} container={container} />}
        </div>
    );
}

export const ChartContainer = forwardRef((props, ref) => {
    const { children, container, layout, ...rest } = props;
    const chartApiRef = useRef({
        api() {
            if (!this._api) {
                const myPriceFormatter = p => p.toFixed(20);
                this._api = createChart(container, {
                    ...rest,
                    layout,
                    width: container.clientWidth,
                    height: 600,
                    priceFormat: {
                        type: 'price',
                        precision: 6,
                        minMove: 0.000001,
                    },
                    priceScale: {
                        priceScaleId: 'overlay',
                        mode: 0,
                        // autoScale: true,
                        // priceRange: {
                        //     minValue: 0,
                        //     maxValue: 100,
                        // },
                        // margins: {
                        // 	above: 10,
                        // 	below: 10,
                        // },
                        precision: 6,
                        minMove: 0.0000001,
                        // scaleMargins: {
                        // 	top: 1,
                        // 	bottom: 1,
                        // }
                    },
                    timeScale: {
                        timeVisible: true,
                        secondsVisible: true,
                        tickMarkFormatter: (time, tickIndex, ticks) => {
                            const date = new Date(time * 1000);
                            const hours = date.getHours().toString().padStart(2, '0');
                            const minutes = date.getMinutes().toString().padStart(2, '0');
                            const seconds = date.getSeconds().toString().padStart(2, '0');
                            return `${hours}:${minutes}:${seconds}`;
                        },
                    },
                    localization: {
                        priceFormatter: myPriceFormatter,
                    },
                });console.log(1, this._api);
                // this._api.timeScale().fitContent();
            }
            return this._api;
        },
        free() {
            if (this._api) {
                this._api.remove();
            }
        },
    });

    useLayoutEffect(() => {
        const currentRef = chartApiRef.current;
        const chart = currentRef.api();

        const handleResize = () => {
            chart.applyOptions({
                ...rest,
                width: container.clientWidth,
            });
        };

        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
            chart.remove();
        };
    }, []);

    useLayoutEffect(() => {
        const currentRef = chartApiRef.current;
        currentRef.api();
    }, []);

    useLayoutEffect(() => {
        const currentRef = chartApiRef.current;
        currentRef.api().applyOptions(rest);
    }, []);

    useImperativeHandle(ref, () => chartApiRef.current.api(), []);

    useEffect(() => {
        const currentRef = chartApiRef.current;
        currentRef.api().applyOptions({ layout });
    }, [layout]);

    return (
        <Context.Provider value={chartApiRef.current}>
            {props.children}
        </Context.Provider>
    );
});
ChartContainer.displayName = 'ChartContainer';

export const Series = forwardRef((props, ref) => {
    const parent = useContext(Context);
    const context = useRef({
        api() {
            if (!this._api) {
                const { children, data, type, ...rest } = props;console.log(111, data);
                this._api = type === 'candle'
                    ? parent.api().addCandlestickSeries(rest)
                    : parent.api().addAreaSeries(rest);
                this._api.setData(data);
            }
            return this._api;
        },
        free() {
            if (this._api) {
                parent.free();
            }
        },
    });

    // useLayoutEffect(() => {
    // 	const currentRef = context.current;
    // 	currentRef.api();

    // 	return () => currentRef.free();
    // }, []);

    useLayoutEffect(() => {
        const currentRef = context.current;
        const { children, data, ...rest } = props;
        currentRef.api().applyOptions(rest);
    });

    useImperativeHandle(ref, () => context.current.api(), []);

    return (
        <Context.Provider value={context.current}>
            {props.children}
        </Context.Provider>
    );
});
Series.displayName = 'Series';