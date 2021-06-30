import React, { useMemo, Fragment, FunctionComponent } from "react";
import CurveLine from "./CurveLine";
import KeyframeGroup from "./KeyframeGroup";

interface Props {
  name: string;
  times: number[];
  values: number[];
  lineIndex: number;
}

const GraphGroup: FunctionComponent<Props> = (props) => {
  const { name, times, values, lineIndex } = props;
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

  const xyzIndexGroup = useMemo(() => {
    return [lineIndex * 3 + 1, lineIndex * 3 + 2, lineIndex * 3 + 3];
  }, [lineIndex]);

  return (
    <Fragment>
      {[x, y, z].map((datum, index) => (
        <g key={`${name}_${index}`}>
          <CurveLine
            datum={datum}
            color={index === 0 ? "red" : index === 1 ? "green" : "blue"}
            trackName={name}
            xyzIndex={index}
            lineIndex={xyzIndexGroup[index]}
          />
          <KeyframeGroup
            datum={datum}
            trackName={name}
            xyzIndex={index}
            lineIndex={xyzIndexGroup[index]}
          />
        </g>
      ))}
    </Fragment>
  );
};

export default GraphGroup;
