import React, { useMemo, FunctionComponent } from "react";
import GraphItem from "./GraphItem";

interface Props {
  name: string;
  times: number[];
  values: number[];
}

const GraphGroup: FunctionComponent<Props> = ({ name, times, values }) => {
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
    <g className="graph-group">
      {[x, y, z].map((value, index) => (
        <GraphItem
          key={`${name}_${index}`}
          datum={value}
          color={index === 0 ? "red" : index === 1 ? "green" : "blue"}
        />
      ))}
    </g>
  );
};

export default GraphGroup;
