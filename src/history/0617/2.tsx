import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import "./index.css";
import hipsPos from "../hipsPos.json";

type D3ScaleLinear = d3.ScaleLinear<number, number, never>;
type D3SvgSelection = d3.Selection<SVGGElement, unknown, null, undefined>;

interface D3ZoomDatum {
  name: string;
  times: number[];
  values: number[];
}

const App = () => {
  const curveEditorRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!curveEditorRef.current) return;
    const width = window.innerWidth;
    const height = window.innerHeight;
    const margin = { top: 40, right: 40, bottom: 40, left: 40 };
    const x = d3.scaleLinear().domain([-10, 10]).range([margin.left, width]);
    const y = d3.scaleLinear().domain([-4.5, 4.5]).range([height, margin.top]);

    const posX: number[][] = [];
    const posY: number[][] = [];
    const posZ: number[][] = [];
    for (let index = 0; index < hipsPos.values.length; index += 1) {
      const remainder = index % 3;
      const value = hipsPos.values[index];
      const timeIndex = (index / 3) | 0; // 비트 연산자로 소수 제거
      const time = hipsPos.times[timeIndex];
      if (remainder === 0) {
        posX.push([time * 30, value]);
      } else if (remainder === 1) {
        posY.push([time * 30, value]);
      } else {
        posZ.push([time * 30, value]);
      }
    }

    const setCurvePath = (scaleX: D3ScaleLinear, scaleY: D3ScaleLinear) => {
      return d3
        .line()
        .curve(d3.curveMonotoneX)
        .x((d) => scaleX(d[0]))
        .y((d) => scaleY(d[1]));
    };

    const arrangeXAxis = (g: D3SvgSelection, scaleX: D3ScaleLinear) => {
      g.attr("transform", `translate(${margin.left},${margin.top})`)
        .call(d3.axisTop(scaleX).ticks(12))
        .call((g) => g.select(".domain").attr("display", "none"));
    };

    const arrangeYAxis = (g: D3SvgSelection, scaleY: D3ScaleLinear) => {
      g.attr("transform", `translate(0,${margin.top})`)
        .call(d3.axisRight(scaleY).ticks(12))
        .call((g) => g.select(".domain").attr("display", "none"));
    };

    const arrangeGridX = (g: D3SvgSelection, scaleX: D3ScaleLinear) => {
      g.selectAll("line")
        .data(scaleX.ticks())
        .join("line")
        .attr("x1", (d) => 40 + scaleX(d))
        .attr("x2", (d) => 40 + scaleX(d))
        .attr("y1", margin.top)
        .attr("y2", height - margin.bottom);
    };

    const arrangeGridY = (g: D3SvgSelection, scaleY: D3ScaleLinear) => {
      g.selectAll("line")
        .data(scaleY.ticks())
        .join("line")
        .attr("y1", (d) => 16 + scaleY(d))
        .attr("y2", (d) => 16 + scaleY(d))
        .attr("x1", margin.left)
        .attr("x2", width - margin.right);
    };

    const svg = d3.select(curveEditorRef.current);
    const gx = svg.append("g");
    const gy = svg.append("g");
    const grid = svg.append("g").attr("class", "grid-line");
    const gridX = grid.append("g").attr("class", "grid-x");
    const gridY = grid.append("g").attr("class", "grid-y");

    gx.call((g) => arrangeXAxis(g, x));
    gy.call((g) => arrangeYAxis(g, y));
    gridX.call((g) => arrangeGridX(g, x));
    gridY.call((g) => arrangeGridY(g, y));

    ["red", "green", "blue"].forEach((color, index) => {
      const xyz = index === 0 ? "x" : index === 1 ? "y" : "z";
      const className = `curve-path ${xyz}`;
      const posData = index === 0 ? posX : index === 1 ? posY : posZ;
      svg
        .append("g")
        .attr("class", className)
        .append("path")
        .datum(posData)
        .attr("fill", "none")
        .attr("stroke", color)
        .attr("stroke-width", 1.5)
        .attr("stroke-linejoin", "round")
        .attr("d", setCurvePath(x, y) as any);
      svg
        .select(`.${index === 0 ? "x" : index === 1 ? "y" : "z"}`)
        .selectAll("circle")
        .data(posData)
        .join("circle")
        .attr("r", 4)
        .attr("cx", (d) => x(d[0]))
        .attr("cy", (d) => y(d[1]));
    });

    const zoomBehavior = d3
      .zoom()
      .on("zoom", (event: d3.D3ZoomEvent<Element, D3ZoomDatum>) => {
        const { transform } = event;
        const rescaleX = transform.rescaleX(x);
        const rescaleY = transform.rescaleY(y);

        gx.call((g) => arrangeXAxis(g, rescaleX));
        gy.call((g) => arrangeYAxis(g, rescaleY));
        gridX.call((g) => arrangeGridX(g, rescaleX));
        gridY.call((g) => arrangeGridY(g, rescaleY));

        ["red", "green", "blue"].forEach((color, index) => {
          const xyz = index === 0 ? "x" : index === 1 ? "y" : "z";
          const className = `curve-path.${xyz}`;
          const group = d3.select(`.${className}`);
          group
            .select("path")
            .attr("d", setCurvePath(rescaleX, rescaleY) as any);
          group.selectAll("circle").each(function () {
            d3.select(this).attr("cx", (d: any) => rescaleX(d[0]));
            d3.select(this).attr("cy", (d: any) => rescaleY(d[1]));
          });
        });
      });
    svg.call(zoomBehavior as any);
  }, []);

  return (
    <div className="wrapper">
      <svg ref={curveEditorRef} />
    </div>
  );
};

export default App;
