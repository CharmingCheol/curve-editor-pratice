import React, { FunctionComponent } from "react";
import { GraphValues } from "types/curveEditor";
import Keyframe from "./Keyframe";

interface Props {
  lineIndex: number;
  trackName: string;
  values: GraphValues[];
  xyzIndex: number;
}

const KeyframeGroup: FunctionComponent<Props> = (props) => {
  const { lineIndex, trackName, values, xyzIndex } = props;
  const xyzType = xyzIndex === 0 ? "x" : xyzIndex === 1 ? "y" : "z";

  return (
    <g>
      {values.map((keyframeValue, keyframeIndex) => (
        <Keyframe
          key={`${keyframeValue[0]}_${keyframeValue[1]}`}
          data={keyframeValue}
          keyframeIndex={keyframeIndex}
          lineIndex={lineIndex}
          trackName={trackName}
          xyzType={xyzType}
        />
      ))}
    </g>
  );
};

export default KeyframeGroup;
