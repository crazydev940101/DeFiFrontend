import React, { useRef, useEffect } from "react";
import {
  select,
  line,
  curveCardinal,
  scaleLinear,
  axisBottom,
  axisLeft,
} from "d3";
//data
const data = [
  { x: 0, y: 10 },
  { x: 1, y: 20 },
  { x: 2, y: 15 },
  { x: 3, y: 25 },
  { x: 4, y: 30 },
];

//chart component
const LineChart = () => {
  //refs
  const svgRef = useRef();

  //draws chart
  useEffect(() => {
    const svg = select(svgRef.current);

    //scales
    const xScale = scaleLinear()
      .domain([0, data.length - 1])
      .range([0, 300]);

    const yScale = scaleLinear().domain([0, 100]).range([100, 0]);

    //axes
    const xAxis = axisBottom(xScale).ticks(data.length);
    svg.select(".x-axis").style("transform", "translateY(100px)").call(xAxis);

    const yAxis = axisLeft(yScale);
    svg.select(".y-axis").style("transform", "translateX(0px)").call(yAxis);

    //line generator
    const myLine = line()
      .x((d, i) => xScale(i))
      .y((d) => yScale(d.y))
      .curve(curveCardinal);

    //drawing the line
    svg
      .selectAll(".line")
      .data([data])
      .join("path")
      .attr("class", "line")
      .attr("d", myLine)
      .attr("fill", "none")
      .attr("stroke", "#00bfa6");
  }, [data]);

  return (
    
      <svg ref={svgRef}>
        <g className="plot-area" />
        <g className="x-axis" />
        <g className="y-axis" />
        
      </svg>
    
  );
};

export default LineChart;