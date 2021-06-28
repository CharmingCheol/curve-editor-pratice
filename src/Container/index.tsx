import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import _ from "lodash";
import GraphGroup from "./GraphGroup";
import dummy from "../dummy.json";
import classNames from "classnames/bind";
import styles from "./index.module.scss";

const cx = classNames.bind(styles);
const ZOOM_THROTTLE_TIMER = 100;

type D3ScaleLinear = d3.ScaleLinear<number, number, never>;
type D3SvgGElement = d3.Selection<SVGGElement, unknown, null, undefined>;

interface D3ZoomDatum {
  name: string;
  times: number[];
  values: number[];
}

const App = () => {
  const curveEditorRef = useRef<SVGSVGElement>(null);
  const xAxisRef = useRef<SVGGElement>(null);
  const yAxisRef = useRef<SVGGElement>(null);
  const xGridRef = useRef<SVGGElement>(null);
  const yGridRef = useRef<SVGGElement>(null);

  useEffect(() => {
    if (
      !curveEditorRef.current ||
      !xAxisRef.current ||
      !yAxisRef.current ||
      !xGridRef.current ||
      !yGridRef.current
    )
      return;
    const width = window.innerWidth;
    const height = window.innerHeight;
    const margin = { top: 40, right: 40, bottom: 40, left: 40 };
    const x = d3.scaleLinear().domain([-10, 10]).range([margin.left, width]);
    const y = d3.scaleLinear().domain([-4.5, 4.5]).range([height, margin.top]);

    const svg = d3.select(curveEditorRef.current);
    const xAxis = d3.select(xAxisRef.current);
    const yAxis = d3.select(yAxisRef.current);
    const xGrid = d3.select(xGridRef.current);
    const yGrid = d3.select(yGridRef.current);

    const arrangeXAxis = (g: D3SvgGElement, scaleX: D3ScaleLinear) => {
      g.call(d3.axisTop(scaleX));
    };

    const arrangeYAxis = (g: D3SvgGElement, scaleY: D3ScaleLinear) => {
      g.call(d3.axisRight(scaleY));
    };

    const arrangeXGrid = (g: D3SvgGElement, scaleX: D3ScaleLinear) => {
      g.selectAll("line")
        .data(scaleX.ticks())
        .join("line")
        .attr("x1", (d) => 40 + scaleX(d))
        .attr("x2", (d) => 40 + scaleX(d))
        .attr("y1", margin.top)
        .attr("y2", height - margin.bottom);
    };

    const arrangeYGrid = (g: D3SvgGElement, scaleY: D3ScaleLinear) => {
      g.selectAll("line")
        .data(scaleY.ticks())
        .join("line")
        .attr("y1", (d) => 16 + scaleY(d))
        .attr("y2", (d) => 16 + scaleY(d))
        .attr("x1", margin.left)
        .attr("x2", width - margin.right);
    };

    xAxis.call((g) => arrangeXAxis(g, x));
    yAxis.call((g) => arrangeYAxis(g, y));
    xGrid.call((g) => arrangeXGrid(g, x));
    yGrid.call((g) => arrangeYGrid(g, y));

    const updateScreen = (event: d3.D3ZoomEvent<Element, D3ZoomDatum>) => {
      const { transform } = event;
      const rescaleX = transform.rescaleX(x);
      const rescaleY = transform.rescaleY(y);

      xAxis.call((g) => arrangeXAxis(g, rescaleX));
      yAxis.call((g) => arrangeYAxis(g, rescaleY));
      xGrid.call((g) => arrangeXGrid(g, rescaleX));
      yGrid.call((g) => arrangeYGrid(g, rescaleY));

      const scale = transform.k;
      const transformX = transform.x + margin.left;
      const transformY = transform.y + margin.top;
      const translate3d = `translate3d(${transformX}px, ${transformY}px, 0px)`;
      const strokeWidth = `stroke-width:${1 / scale + 1};`;
      const graphWrapper = document.getElementById("graph-group-wrapper");

      if (graphWrapper) {
        graphWrapper.style.cssText = `transform:${translate3d} scale(${scale}); ${strokeWidth}`;
      }
    };

    const zoomBehavior = d3.zoom().on(
      "zoom",
      _.throttle((event: d3.D3ZoomEvent<Element, D3ZoomDatum>) => {
        updateScreen(event);
      }, ZOOM_THROTTLE_TIMER)
    );
    svg.call(zoomBehavior as any);
  }, []);

  return (
    <div className={cx("wrapper")}>
      <svg ref={curveEditorRef}>
        <g ref={xAxisRef} className={cx("x-axis")} />
        <g ref={yAxisRef} className={cx("y-axis")} />
        <g>
          <g ref={xGridRef} />
          <g ref={yGridRef} />
        </g>
        <g id="graph-group-wrapper">
          {dummy.baseLayer.slice(0, 12).map((bone) => {
            const { name, times, values } = bone;
            return (
              <GraphGroup
                key={name}
                name={name}
                times={times}
                values={values}
              />
            );
          })}
        </g>
      </svg>
    </div>
  );
};

export default App;
