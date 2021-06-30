import React, { useMemo, FunctionComponent } from "react";
import { XYZ } from "types/curveEditor";
import Keyframe from "./Keyframe";

interface Props {
  datum: number[][];
  trackName: string;
  xyzIndex: number;
  lineIndex: number;
}

const KeyframeGroup: FunctionComponent<Props> = (props) => {
  const { datum, trackName, xyzIndex, lineIndex } = props;

  const xyz = useMemo<XYZ>(() => {
    if (xyzIndex === 0) {
      return "x";
    } else if (xyzIndex === 1) {
      return "y";
    } else {
      return "z";
    }
  }, [xyzIndex]);

  return (
    <g>
      {datum.map((data, index) => (
        <Keyframe
          key={`${trackName}_${index}`}
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
