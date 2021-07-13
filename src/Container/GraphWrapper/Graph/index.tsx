import React, { FunctionComponent } from "react";
import { GraphValues } from "types/curveEditor";
import CurveLine from "./CurveLine";
import KeyframeGroup from "./KeyframeGroup";

interface Props {
  trackName: string;
  lineIndex: number;
  values: GraphValues[];
  xyzIndex: number;
}

const Graph: FunctionComponent<Props> = (props) => {
  const { trackName, lineIndex, xyzIndex, values } = props;
  const color = xyzIndex === 0 ? "red" : xyzIndex === 1 ? "green" : "blue";

  return (
    <g>
      <CurveLine
        values={values}
        color={color}
        trackName={trackName}
        xyzIndex={xyzIndex}
        lineIndex={lineIndex}
      />
      <KeyframeGroup
        values={values}
        trackName={trackName}
        xyzIndex={xyzIndex}
        lineIndex={lineIndex}
      />
    </g>
  );
};

export default Graph;
