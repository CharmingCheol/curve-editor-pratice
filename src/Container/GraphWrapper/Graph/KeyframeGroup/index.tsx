import React, { FunctionComponent } from "react";
import { KeyframeValue } from "types/curveEditor";
import Keyframe from "./Keyframe";

interface Props {
  axisIndex: number;
  axisValue: KeyframeValue[];
}

const KeyframeGroup: FunctionComponent<Props> = (props) => {
  const { axisIndex, axisValue } = props;
  const axisType = axisIndex % 3 === 0 ? "x" : axisIndex % 3 === 1 ? "y" : "z";

  return (
    <g>
      {axisValue.map((keyframeValue, keyframeIndex) => {
        const { breakHandle, keyframe, lockHandle } = keyframeValue;
        return (
          <Keyframe
            key={`${keyframe.x}_${keyframe.y}`}
            axisIndex={axisIndex}
            axisType={axisType}
            breakHandle={breakHandle}
            keyframeIndex={keyframeIndex}
            keyframeValue={keyframeValue}
            lockHandle={lockHandle}
          />
        );
      })}
    </g>
  );
};

export default KeyframeGroup;
