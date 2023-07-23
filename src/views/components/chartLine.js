
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
import { globalVariables } from '../../variables/variable';


const Context = createContext();



export const LineChart = props => {
    const initData = props.sendInitialData
    const initialData = [
        { time: new Date(initData.created).getTime() / 1000, value: initData.ethAmount },
    ];
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

    const tokenWatchCallback = useCallback(data => {
        if (series1.current === null) {
			return;
		}

        const timeNow = new Date(data.date).getTime() / 1000;
        const response = {
            time: timeNow, value: parseFloat(data.estPrice)
        }
        series1.current.update(response);
    })

    useEffect(() => {
        const socket = props.socket;
        if (socket) {
            socket.on("token:watch", tokenWatchCallback);
            return () => {
                if (socket) {
                    socket.off("token:watch", tokenWatchCallback);
                }
            };
        }
    }, [props.socket])

	
	useEffect(() => {
		setChartLayoutOptions({
			background: {
				color: backgroundColor,

			},
			textColor,
		});
	}, [backgroundColor, textColor]);

	return (
		<div className="chart-wrapper-OHMYAEMB">
			<Chart layout={chartLayoutOptions}>
				<Series
					ref={series1}
					type={'line'}
					data={initialData}
					color={lineColor}
				/>
			</Chart>
		</div>
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
                const myPriceFormatter = p => p.toFixed(10);
				this._api = createChart(container, {
					...rest,
					layout,
					width: container.clientWidth,
					height: 600,
					priceScale: {
						priceScaleId: 'overlayPriceScales',
						mode: 2,
						// autoScale: true,
						// priceRange: {
						// 	minValue: 0,
						// 	maxValue: 1,
						// },
						// margins: {
						// 	above: 10,
						// 	below: 10,
						// },
						// minMove: 0.01,
						// scaleMargins: {
						// 	top: 1,
						// 	bottom: 1,
						// }
                        minMove: 0.0000000000000001,
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
				});
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
				const { children, data, type, ...rest } = props;
				this._api = type === 'line'
					? parent.api().addLineSeries(rest)
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