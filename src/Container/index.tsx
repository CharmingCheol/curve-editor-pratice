import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import "./index.css";
import hipsPos from "./hipsPos.json";

type d3ScaleLinear = d3.ScaleLinear<number, number, never>;
type d3SvgSelection = d3.Selection<SVGGElement, unknown, null, undefined>;

interface D3ZoomDatum {
  name: string;
  times: number[];
  values: number[];
}

const App = () => {
  const curveEditorScale = useRef<d3ScaleLinear | null>(null);
  const curveEditorRef = useRef<SVGSVGElement>(null);
  // const curveEditorRef = useRef<HTMLDivElement>(null);

  //
  useEffect(() => {
    if (!curveEditorRef.current) return;
    const width = window.innerWidth;
    const height = window.innerHeight;
    const margin = { top: 40, right: 40, bottom: 40, left: 40 };
    const x = d3.scaleLinear().domain([-4.5, 4.5]).range([margin.left, width]);
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
    console.log(posX);
    console.log(posY);
    console.log(posX);

    const svg = d3.select(curveEditorRef.current);
    const gx = svg.append("g");
    const gy = svg.append("g");
    const zoomBehavior = d3
      .zoom()
      .on("zoom", (event: d3.D3ZoomEvent<Element, D3ZoomDatum>) => {
        const { transform } = event;
        const gAxis = (g: d3SvgSelection, x: any) =>
          g
            .attr("transform", `translate(${margin.left},${margin.top})`)
            .call(d3.axisTop(x).ticks(12))
            .call((g) => g.select(".domain").attr("display", "none"));
        const yAxis = (g: d3SvgSelection, y: any) =>
          g
            .attr("transform", `translate(0,${margin.top})`)
            .call(d3.axisRight(y).ticks(12))
            .call((g) => g.select(".domain").attr("display", "none"));
        gx.call(gAxis, transform.rescaleX(x));
        gy.call(yAxis, transform.rescaleY(y));

        //
        svg.select(".grid-line").remove();
        svg
          .append("g")
          .attr("class", "grid-line")
          .call(
            (g, x) =>
              g
                .append("g")
                .selectAll("line")
                .data(x.ticks())
                .join("line")
                .attr("x1", (d) => 40 + x(d))
                .attr("x2", (d) => 40 + x(d))
                .attr("y1", margin.top)
                .attr("y2", height - margin.bottom),
            transform.rescaleX(x)
          )
          .call(
            (g, y) =>
              g
                .append("g")
                .selectAll("line")
                .data(y.ticks())
                .join("line")
                .attr("y1", (d) => 16 + y(d))
                .attr("y2", (d) => 16 + y(d))
                .attr("x1", margin.left)
                .attr("x2", width - margin.right),
            transform.rescaleY(y)
          );

        const lineGenerator = d3
          .line()
          .curve(d3.curveBasis)
          .x((d) => transform.rescaleX(x)(d[0]))
          .y((d) => transform.rescaleY(y)(d[1]));

        svg.selectAll(".curve-line").remove();
        ["red", "green", "blue"].forEach((color, index) => {
          const className = `curve-line ${
            index === 0 ? "x" : index === 1 ? "y" : "z"
          }`;
          svg
            .append("g")
            .attr("class", className)
            .append("path")
            .datum(index === 0 ? posX : index === 1 ? posY : posZ)
            .attr("fill", "none")
            .attr("stroke", color)
            .attr("stroke-width", 1.5)
            .attr("stroke-linejoin", "round")
            .attr("d", lineGenerator as any);
          svg
            .select(`.${index === 0 ? "x" : index === 1 ? "y" : "z"}`)
            .selectAll("circle")
            .data(index === 0 ? posX : index === 1 ? posY : posZ)
            .join("circle")
            .attr("cx", (d) => transform.rescaleX(x)(d[0]))
            .attr("cy", (d) => transform.rescaleY(y)(d[1]))
            .attr("r", 2);
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
