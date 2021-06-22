import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import _ from "lodash";
import "./index.css";
import GraphGroup from "./GraphGroup";
import dummy from "../dummy.json";

type D3ScaleLinear = d3.ScaleLinear<number, number, never>;
type D3SvgSelection = d3.Selection<SVGGElement, unknown, null, undefined>;

interface D3ZoomDatum {
  name: string;
  times: number[];
  values: number[];
}

const ZOOM_THROTTLE_TIMER = 100;

const App = () => {
  const [areRemovedKeyframes, setAreRemovedKeyframes] = useState(true);
  const curveEditorRef = useRef<SVGSVGElement>(null);
  const rafID = useRef(0);

  useEffect(() => {
    if (!curveEditorRef.current) return;
    const width = window.innerWidth;
    const height = window.innerHeight;
    const margin = { top: 40, right: 40, bottom: 40, left: 40 };
    const x = d3.scaleLinear().domain([-10, 10]).range([margin.left, width]);
    const y = d3.scaleLinear().domain([-4.5, 4.5]).range([height, margin.top]);

    const arrangeXAxis = (g: D3SvgSelection, scaleX: D3ScaleLinear) => {
      g.call(d3.axisTop(scaleX));
    };

    const arrangeYAxis = (g: D3SvgSelection, scaleY: D3ScaleLinear) => {
      g.call(d3.axisRight(scaleY));
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
    const gx = svg.append("g").attr("class", "x-axis");
    const gy = svg.append("g").attr("class", "y-axis");
    const grid = svg.append("g").attr("class", "grid-line");
    const gridX = grid.append("g").attr("class", "grid-x");
    const gridY = grid.append("g").attr("class", "grid-y");

    gx.call((g) => arrangeXAxis(g, x));
    gy.call((g) => arrangeYAxis(g, y));
    gridX.call((g) => arrangeGridX(g, x));
    gridY.call((g) => arrangeGridY(g, y));

    const updateScreen = (event: d3.D3ZoomEvent<Element, D3ZoomDatum>) => {
      const { transform } = event;
      const rescaleX = transform.rescaleX(x);
      const rescaleY = transform.rescaleY(y);

      gx.call((g) => arrangeXAxis(g, rescaleX));
      gy.call((g) => arrangeYAxis(g, rescaleY));
      gridX.call((g) => arrangeGridX(g, rescaleX));
      gridY.call((g) => arrangeGridY(g, rescaleY));

      const scale = transform.k;
      const transformX = transform.x + margin.left;
      const transformY = transform.y + margin.top;
      const translate3d = `translate3d(${transformX}px, ${transformY}px, 0px)`;
      const graphWrapper = document.getElementById("graph-group-wrapper");
      if (graphWrapper) {
        graphWrapper.style.cssText = `transform:${translate3d} scale(${scale});`;
      }
      rafID.current = requestAnimationFrame(() => updateScreen(event));
    };

    const zoomBehavior = d3
      .zoom()
      .on("start", () => {
        setAreRemovedKeyframes(false);
      })
      .on(
        "zoom",
        _.throttle((event: d3.D3ZoomEvent<Element, D3ZoomDatum>) => {
          updateScreen(event);
          cancelAnimationFrame(rafID.current);
        }, ZOOM_THROTTLE_TIMER)
      )
      .on("end", () => {
        setAreRemovedKeyframes(true);
        cancelAnimationFrame(rafID.current);
      });
    svg.call(zoomBehavior as any);
  }, []);

  return (
    <div className="wrapper">
      <svg ref={curveEditorRef}>
        <g id="graph-group-wrapper">
          {dummy.baseLayer
            // .slice(0, 70)
            .map((bone) => {
              const { name, times, values } = bone;
              return (
                <GraphGroup
                  key={name}
                  name={name}
                  times={times}
                  values={values}
                  areRemovedKeyframes={areRemovedKeyframes}
                />
              );
            })}
        </g>
      </svg>
    </div>
  );
};

export default App;
