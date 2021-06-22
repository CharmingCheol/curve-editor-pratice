import React, { Fragment, useMemo, useRef, FunctionComponent } from "react";
import GraphItem from "./GraphItem";
import CurveLine from "./CurveLine";
import Keyframes from "./Keyframes";

interface Props {
  name: string;
  times: number[];
  values: number[];
  test: boolean;
}

const GraphGroup: FunctionComponent<Props> = ({
  name,
  times,
  values,
  test,
}) => {
  const [x, y, z] = useMemo(() => {
    const x: number[][] = [];
    const y: number[][] = [];
    const z: number[][] = [];
    for (let index = 0; index < values.length; index += 1) {
      const remainder = index % 3;
      const value = values[index];
      const timeIndex = (index / 3) | 0; // 비트 연산자로 소수 제거
      const time = (times[timeIndex] * 30) | 0; // 비트 연산자로 소수 제거
      if (remainder === 0) {
        x.push([time, value]);
      } else if (remainder === 1) {
        y.push([time, value]);
      } else {
        z.push([time, value]);
      }
    }
    return [x, y, z];
  }, [times, values]);

  return (
    <Fragment>
      {[x, y, z].map((value, index) => (
        <g key={`${name}_${index}`}>
          <CurveLine
            datum={value}
            color={index === 0 ? "red" : index === 1 ? "green" : "blue"}
          />
          <Keyframes datum={value} test={test} />
          {/* {test && <Keyframes datum={value} />} */}
        </g>
      ))}
    </Fragment>
  );

  // return (
  //   <Fragment>
  //     {[x, y, z].map((value, index) => (
  //       <GraphItem
  //         key={`${name}_${index}`}
  //         datum={value}
  //         color={index === 0 ? "red" : index === 1 ? "green" : "blue"}
  //       />
  //     ))}
  //   </Fragment>
  // );

  // return (
  //   <g className="graph-group">
  //     {[x, y, z].map((value, index) => (
  //       <GraphItem
  //         key={`${name}_${index}`}
  //         datum={value}
  //         color={index === 0 ? "red" : index === 1 ? "green" : "blue"}
  //       />
  //     ))}
  //   </g>
  // );
};

export default GraphGroup;
