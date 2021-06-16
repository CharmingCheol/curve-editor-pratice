import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import _ from "lodash";
import { dummy } from "./dummy";
// import './curve.scss';

enum Euler {
  QUATERNION = "QUATERNION",
  SCALE = "SCALE",
  POSITION = "POSITION",
}

interface Datum {
  name: string;
  times: number[];
  values: number[];
}

interface EulerValue {
  valueX: number;
  valueY: number;
}

export interface TimelinePanelProps {
  data?: any;
}

const defaultProps: Partial<TimelinePanelProps> = {
  data: dummy,
};

const colors = ["#E85757", "#059B00", "#5A57E8", "#E5E857"];

const margin = { top: 30, right: 30, bottom: 30, left: 30 };

const TimelinePanel: React.FC<TimelinePanelProps> = ({ data }) => {
  const divRef = useRef<HTMLDivElement>(null);
  const [zoomTransform, setZoomTransform] = useState<d3.ZoomTransform>();

  useEffect(() => {
    const currentRef = divRef.current;

    if (currentRef) {
      const { clientWidth, clientHeight } = currentRef;

      const curveSVG = d3
        .select(currentRef)
        .call((g) => g.select("svg").remove())
        .append("svg")
        .attr("class", "wrapper-curve")
        // .attr('viewBox', `0, 0, ${offsetWidth}, ${offsetHeight}`);
        .attr("preserveAspectRatio", "xMinYMin meet")
        .style("width", "100%")
        .style("height", "100%");

      curveSVG
        .append("defs")
        .append("clipPath")
        .attr("id", "area")
        .append("svg:rect")
        .attr("x", margin.left)
        .attr("y", 0)
        .attr("width", clientWidth)
        .attr("height", clientHeight);
      // .attr('width', '100%')
      // .attr('height', '100%');

      const xMax = _.max(
        _.reduce(
          data,
          (total, current) => total.concat(current.times.length - 1),
          [] as number[]
        )
      );

      const xDomain = [0, xMax || 1];

      const x = d3
        .scaleLinear()
        .domain(xDomain)
        .range([margin.left, clientWidth]);

      const yMax = _.max(
        _.reduce(
          data,
          (total, current) => total.concat(_.max(current.values) as number),
          [] as number[]
        )
      );

      const yDomaix = [-1, yMax || 1];

      const y = d3
        .scaleLinear()
        .domain(yDomaix)
        .nice()
        .range([currentRef.clientHeight - margin.bottom, margin.top]);
      // .range([height - margin.bottom, margin.top]);

      if (zoomTransform) {
        const newXScale = zoomTransform.rescaleX(x);
        const newYScale = zoomTransform.rescaleX(y);
        x.domain(newXScale.domain());
        y.domain(newYScale.domain());
      }

      const d3Generator = (
        item: Datum,
        name: string,
        d3Element: d3.Selection<SVGSVGElement, unknown, null, undefined>,
        x: d3.ScaleLinear<number, number, never>,
        y: d3.ScaleLinear<number, number, never>
      ) => {
        const separated = _.split(name, ".");
        const boneName = separated[0];
        const euler = separated[1];

        const lowerCaseEuler = _.lowerCase(euler);

        const sliceModuler = (arr: number[], moduler: number) => {
          const result = Array.from(Array(moduler), () => new Array(0));
          _.map(arr, (value, i) => result[i % moduler].push(value));

          return result;
        };

        switch (lowerCaseEuler) {
          case _.lowerCase(Euler.QUATERNION): {
            const QUOTIENT = 4;

            const quaternionList = sliceModuler(item.values, QUOTIENT);

            const converted = _.map(quaternionList, (quaternion, i) => {
              return _.map(quaternion, (q, j) => {
                return {
                  valueX: j,
                  valueY: Number(q),
                };
              });
            });

            const lineGenerator = d3
              .line<EulerValue>()
              .x((value) => x(value.valueX))
              .y((value) => y(value.valueY));

            const pathCreator = (
              element: d3.Selection<SVGSVGElement, unknown, null, undefined>,
              eulerValue: EulerValue[],
              color: string
            ) => {
              element
                .append("path")
                .datum(eulerValue)
                .attr("class", "quaternion")
                .attr("fill", "none")
                .attr("stroke", color)
                .attr("stroke-width", 1.5)
                .attr("stroke-linejoin", "round")
                .attr("stroke-linecap", "round")
                .attr("d", (data) => lineGenerator(data))
                .attr("clip-path", "url(#area)");

              // 라벨
              // element
              //   .append('text')
              //   // .attr('transform', 'translate(' + (width - 3) + ',' + y(3) + ')')
              //   .attr('text-anchor', 'start')
              //   .style('fill', '#E85757')
              //   .text(currentName[0] + currentName[1] + 'X');
            };

            _.map(converted, (quaternion, i) =>
              pathCreator(d3Element, quaternion, colors[i])
            );
          }
        }
      };

      _.map(data, (item, i) => {
        if (data) {
          const currentData = data[i];
          d3Generator(item, currentData.name, curveSVG, x, y);
        }
      });

      const xAxis = (g: any) =>
        g
          .attr(
            "transform",
            `translate(0, ${currentRef.clientHeight - margin.bottom})`
          )
          .call(
            d3
              .axisBottom(x)
              .ticks(clientWidth / 80)
              .tickSizeOuter(0)
          )
          .attr("class", "grid")
          .call(createGridLineX());

      const createGridLineX = () => {
        return d3
          .axisBottom(x)
          .ticks(clientWidth / 50)
          .tickSize(-currentRef.clientHeight);
      };

      const createGridLineY = () => {
        return d3
          .axisLeft(y)
          .ticks(clientHeight / 50)
          .tickSize(-currentRef.clientWidth);
      };

      curveSVG.append<SVGGElement>("g").call(xAxis);

      const yAxis = (g: any) =>
        g
          .attr("transform", `translate(${margin.left}, 0)`)
          .call(d3.axisLeft(y))
          .attr("class", "grid")
          .call(createGridLineY());

      curveSVG
        .append<SVGGElement>("g")
        .call(yAxis)
        .call((g) => g.select(".domain").remove());

      const zoomBehavior: any = d3
        .zoom()
        .scaleExtent([1, 10])
        .translateExtent([
          [0, 0],
          [currentRef.clientWidth, currentRef.clientHeight],
        ])
        .filter((e: WheelEvent) => {
          // zoom을 alt + mousewheel로 변경
          if (_.isEqual(e.type, "wheel")) {
            return e.altKey;
          }

          return true;
        })
        .on("zoom", (e: d3.D3ZoomEvent<HTMLDivElement, Datum>) => {
          setZoomTransform(e.transform);
        });

      const dragBehavior: any = d3
        .drag()
        .on("start", (e) => {
          console.log("START");
        })
        .on("drag", (e) => {
          console.log("DRAG");
        })
        .on("end", (e) => {
          console.log("END");
        });

      d3.select(currentRef).call(dragBehavior);
      d3.select(currentRef).call(zoomBehavior);
    }
  }, [zoomTransform, data]);

  return (
    <div
      className="curve"
      ref={divRef}
      style={{ width: "100vw", height: "100vh" }}
    />
  );
};

TimelinePanel.defaultProps = defaultProps;

export default TimelinePanel;
