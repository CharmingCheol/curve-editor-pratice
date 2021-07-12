import React, { FunctionComponent } from "react";
import Keyframe from "./Keyframe";

interface Props {
  datum: number[][];
  trackName: string;
  xyzIndex: number;
  lineIndex: number;
}

const KeyframeGroup: FunctionComponent<Props> = (props) => {
  const { datum, trackName, xyzIndex, lineIndex } = props;
  const xyz = xyzIndex === 0 ? "x" : xyzIndex === 1 ? "y" : "z";

  return (
    <g>
      {datum.map((data, index) => (
        <Keyframe
          key={`${trackName}_${data[0]}_${data[1]}`}
          data={data}
          keyframeIndex={index}
          lineIndex={lineIndex}
          trackName={trackName}
          xyz={xyz}
        />
      ))}
    </g>
  );
};

export default KeyframeGroup;
