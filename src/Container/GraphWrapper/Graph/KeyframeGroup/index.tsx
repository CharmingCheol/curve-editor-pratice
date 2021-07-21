import React, { FunctionComponent } from "react";
import { KeyframeValues } from "types/curveEditor";
import Keyframe from "./Keyframe";

interface Props {
  lineIndex: number;
  trackName: string;
  values: KeyframeValues[];
  xyzIndex: number;
}

const KeyframeGroup: FunctionComponent<Props> = (props) => {
  const { lineIndex, trackName, values, xyzIndex } = props;
  const xyzType = xyzIndex === 0 ? "x" : xyzIndex === 1 ? "y" : "z";

  return (
    <g>
      {values.map((keyframeValue, keyframeIndex) => (
        <Keyframe
          key={`${keyframeValue.keyframe.x}_${keyframeValue.keyframe.y}`}
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
