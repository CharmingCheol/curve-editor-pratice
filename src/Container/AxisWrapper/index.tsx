import React, {
  Fragment,
  FunctionComponent,
  RefObject,
  useEffect,
  useRef,
} from "react";
import * as d3 from "d3";
import _ from "lodash";
import Scale from "Container/scale";
import classNames from "classnames/bind";
import styles from "./index.module.scss";

const cx = classNames.bind(styles);

type D3ScaleLinear = d3.ScaleLinear<number, number, never>;
type D3SVGGElement = d3.Selection<SVGGElement, unknown, null, undefined>;

interface D3ZoomDatum {
  name: string;
  times: number[];
  values: number[];
}

interface Props {
  curveEditorRef: RefObject<SVGSVGElement>;
}

const AxisWrapper: FunctionComponent<Props> = (props) => {
  const { curveEditorRef } = props;
  const xAxisRef = useRef<SVGGElement>(null);
  const yAxisRef = useRef<SVGGElement>(null);
  const xGridRef = useRef<SVGGElement>(null);
  const yGridRef = useRef<SVGGElement>(null);

  useEffect(() => {
    if (
      !xAxisRef.current ||
      !yAxisRef.current ||
      !xGridRef.current ||
      !yGridRef.current
    )
      return;
    const width = window.innerWidth;
    const height = window.innerHeight;
    Scale.setScale(width, height);

    const margin = Scale.getScaleMargin();
    const scaleX = Scale.getScaleX();
    const scaleY = Scale.getScaleY();

    const svg = d3.select(curveEditorRef.current);
    const xAxis = d3.select(xAxisRef.current);
    const yAxis = d3.select(yAxisRef.current);
    const xGrid = d3.select(xGridRef.current);
    const yGrid = d3.select(yGridRef.current);

    const arrangeXAxis = (g: D3SVGGElement, scaleX: D3ScaleLinear) => {
      g.call(d3.axisTop(scaleX));
    };

    const arrangeYAxis = (g: D3SVGGElement, scaleY: D3ScaleLinear) => {
      g.call(d3.axisRight(scaleY));
    };

    const arrangeXGrid = (g: D3SVGGElement, scaleX: D3ScaleLinear) => {
      g.selectAll("line")
        .data(scaleX.ticks())
        .join("line")
        .attr("x1", (d) => 40 + scaleX(d))
        .attr("x2", (d) => 40 + scaleX(d))
        .attr("y1", margin.top)
        .attr("y2", height - margin.bottom);
    };

    const arrangeYGrid = (g: D3SVGGElement, scaleY: D3ScaleLinear) => {
      g.selectAll("line")
        .data(scaleY.ticks())
        .join("line")
        .attr("y1", (d) => 16 + scaleY(d))
        .attr("y2", (d) => 16 + scaleY(d))
        .attr("x1", margin.left)
        .attr("x2", width - margin.right);
    };

    const updateAxis = (scaleX: D3ScaleLinear, scaleY: D3ScaleLinear) => {
      xAxis.call((g) => arrangeXAxis(g, scaleX));
      yAxis.call((g) => arrangeYAxis(g, scaleY));
      xGrid.call((g) => arrangeXGrid(g, scaleX));
      yGrid.call((g) => arrangeYGrid(g, scaleY));
    };

    const updateScreen = (event: d3.D3ZoomEvent<Element, D3ZoomDatum>) => {
      const { transform } = event;
      const rescaleX = transform.rescaleX(scaleX);
      const rescaleY = transform.rescaleY(scaleY);
      updateAxis(rescaleX, rescaleY);

      const scale = transform.k;
      const transformX = transform.x + margin.left;
      const transformY = transform.y + margin.top;
      const translate3d = `translate3d(${transformX}px, ${transformY}px, 0px)`;
      const strokeWidth = `stroke-width:${1 / scale + 1}`;

      const graphWrapper = document.getElementById("graph-wrapper");
      if (graphWrapper) {
        graphWrapper.style.cssText = `transform:${translate3d} scale(${scale}); ${strokeWidth};`;
      }
    };

    const zoomBehavior = d3.zoom().on(
      "zoom",
      _.throttle((event: d3.D3ZoomEvent<Element, D3ZoomDatum>) => {
        updateScreen(event);
      }, 100)
    );
    updateAxis(scaleX, scaleY);
    svg.call(zoomBehavior as any);
  }, [curveEditorRef]);

  return (
    <Fragment>
      <g ref={xAxisRef} className={cx("x-axis")} />
      <g ref={yAxisRef} className={cx("y-axis")} />
      <g>
        <g ref={xGridRef} />
        <g ref={yGridRef} />
      </g>
    </Fragment>
  );
};

export default AxisWrapper;