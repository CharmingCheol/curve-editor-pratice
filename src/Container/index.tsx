import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import "./index.css";

type d3ScaleLinear = d3.ScaleLinear<number, number, never>;

const X_AXIS_DOMAIN = 500000;
const INITIAL_ZOOM_LEVEL = 7500;

const App = () => {
  const curveEditorScale = useRef<d3ScaleLinear | null>(null);
  // const curveEditorRef = useRef<SVGSVGElement>(null);
  const curveEditorRef = useRef<HTMLDivElement>(null);

  //
  useEffect(() => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const svg = d3.select(curveEditorRef.current).append("svg");

    // curve editor scale 레벨 조정
    const setScaleRange = (resizedWidth: number, event: d3.ZoomTransform) => {
      curveEditorScale.current = d3
        .scaleLinear()
        .domain([-X_AXIS_DOMAIN, X_AXIS_DOMAIN])
        .range([0, resizedWidth]);
      const rescaleXLineer = event.rescaleX(curveEditorScale.current);
      curveEditorScale.current = rescaleXLineer;
    };

    // time frame, 세로 선 생성
    const arrangeTimeFrameBar = () => {
      if (!curveEditorScale.current) return;
      const margin = { top: 20, right: 20, bottom: 35, left: 40 };
      const scaleLinear = curveEditorScale.current;
      const y = d3
        .scaleLinear()
        .domain([-X_AXIS_DOMAIN, X_AXIS_DOMAIN])
        .range([height - margin.bottom, margin.top]);

      // x축 bar 생성
      svg
        .append("g")
        .attr("transform", `translate(0,${margin.top})`)
        .call(d3.axisTop(scaleLinear))
        .call((g) => g.select(".domain").remove())
        .call((g) => g.selectAll(".tick line").remove())
        .call((g) =>
          g
            .selectAll(".tick text")
            .style("transform", "translate3d(0px, 16px, 0px)")
        );

      // y축 bar 생성
      svg
        .append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y).ticks(5))
        .call((g) => g.select(".domain").remove())
        .call((g) => g.selectAll(".tick line").remove())
        .call((g) =>
          g
            .selectAll(".tick text")
            .style("transform", "rotate(-90deg) translate3d(0px, -16px, 0px)")
        );

      // grid line 생성
      svg
        .append("g")
        .call((g) =>
          g
            .append("g")
            .selectAll("line")
            .data(scaleLinear.ticks())
            .join("line")
            .attr("x1", (d) => 0.5 + scaleLinear(d))
            .attr("x2", (d) => 0.5 + scaleLinear(d))
            .attr("y1", margin.top)
            .attr("y2", height - margin.bottom)
        )
        .call((g) =>
          g
            .append("g")
            .selectAll("line")
            .data(y.ticks(5))
            .join("line")
            .attr("y1", (d) => 0.5 + y(d))
            .attr("y2", (d) => 0.5 + y(d))
            .attr("x1", margin.left)
            .attr("x2", width - margin.right)
        );
    };

    const initialZoom = d3.zoomIdentity
      .scale(INITIAL_ZOOM_LEVEL)
      .translate(-(width / 2), 0);
    const rescaledZoom = d3.zoomIdentity
      .scale(1)
      .translate(initialZoom.x + width / 2, 0)
      .scale(INITIAL_ZOOM_LEVEL);
    setScaleRange(width, rescaledZoom);
    arrangeTimeFrameBar();
  }, []);

  return <div className="wrapper" ref={curveEditorRef} />;
};

export default App;
