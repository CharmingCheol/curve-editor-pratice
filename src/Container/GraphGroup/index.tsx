import React, { useMemo, Fragment, FunctionComponent } from "react";
import CurveLine from "./CurveLine";
import KeyframeGroup from "./KeyframeGroup";

interface Props {
  name: string;
  lineIndex: number;
  x: [number, number][];
  y: [number, number][];
  z: [number, number][];
}

const GraphGroup: FunctionComponent<Props> = (props) => {
  const { name, lineIndex, x, y, z } = props;

  const xyzIndexGroup = useMemo(() => {
    return [lineIndex * 3, lineIndex * 3 + 1, lineIndex * 3 + 2];
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
