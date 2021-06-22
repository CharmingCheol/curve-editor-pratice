import React, { memo, useEffect, useRef, FunctionComponent } from "react";
import * as d3 from "d3";

interface Props {
  datum: number[][];
  color: string;
}

const GraphItem: FunctionComponent<Props> = ({ datum, color }) => {
  const pathRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    if (!pathRef.current) return;
    const width = window.innerWidth;
    const height = window.innerHeight;
    const margin = { top: 40, right: 40, bottom: 40, left: 40 };
    const x = d3.scaleLinear().domain([-10, 10]).range([margin.left, width]);
    const y = d3.scaleLinear().domain([-4.5, 4.5]).range([height, margin.top]);

    d3.select(pathRef.current)
      .datum(datum)
      .attr(
        "d",
        d3
          .line()
          .curve(d3.curveMonotoneX)
          .x((d) => x(d[0]))
          .y((d) => y(d[1])) as any
      );

    d3.select(pathRef.current.parentElement)
      .selectAll("circle")
      .data(datum)
      .join("circle")
      .attr("class", "none")
      .attr("r", 2)
      .attr("cx", (d) => x(d[0]))
      .attr("cy", (d) => y(d[1]));
  }, [datum]);

  return (
    <g>
      <path
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinejoin="round"
        ref={pathRef}
      />
    </g>
  );
};

export default memo(GraphItem);
