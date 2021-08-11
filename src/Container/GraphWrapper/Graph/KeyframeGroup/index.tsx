import React, { FunctionComponent } from "react";
import { KeyframeValue } from "types/curveEditor";
import Keyframe from "./Keyframe";

interface Props {
  axisIndex: number;
  boneIndex: number;
  boneName: string;
  values: KeyframeValue[];
}

const KeyframeGroup: FunctionComponent<Props> = (props) => {
  const { axisIndex, boneIndex, boneName, values } = props;
  const axisType = axisIndex === 0 ? "x" : axisIndex === 1 ? "y" : "z";

  return (
    <g>
      {values.map((keyframeValue, keyframeIndex) => {
        const { breakHandle, keyframe, lockHandle } = keyframeValue;
        return (
          <Keyframe
            key={`${keyframe.x}_${keyframe.y}`}
            axisType={axisType}
            boneIndex={boneIndex}
            boneName={boneName}
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
