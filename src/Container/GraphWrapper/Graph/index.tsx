import React, { FunctionComponent } from "react";
import CurveLine from "./CurveLine";
import KeyframeGroup from "./KeyframeGroup";

interface Props {
  name: string;
  lineIndex: number;
  xyzIndex: number;
  values: [number, number][];
}

const GraphGroup: FunctionComponent<Props> = (props) => {
  const { name, lineIndex, xyzIndex, values } = props;
  const color = xyzIndex === 0 ? "red" : xyzIndex === 1 ? "green" : "blue";

  return (
    <g>
      <CurveLine
        datum={values}
        color={color}
        trackName={name}
        xyzIndex={xyzIndex}
        lineIndex={lineIndex}
      />
      <KeyframeGroup
        datum={values}
        trackName={name}
        xyzIndex={xyzIndex}
        lineIndex={lineIndex}
      />
    </g>
  );
};

export default GraphGroup;
