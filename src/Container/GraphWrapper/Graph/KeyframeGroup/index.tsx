import React, { FunctionComponent } from "react";
import { KeyframeValue } from "types/curveEditor";
import Keyframe from "./Keyframe";

interface Props {
  boneIndex: number;
  boneName: string;
  values: KeyframeValue[];
  xyzIndex: number;
}

const KeyframeGroup: FunctionComponent<Props> = (props) => {
  const { boneIndex, boneName, values, xyzIndex } = props;
  const xyzType = xyzIndex === 0 ? "x" : xyzIndex === 1 ? "y" : "z";

  return (
    <g>
      {values.map((keyframeValue, keyframeIndex) => {
        const { breakHandle, keyframe, lockHandle } = keyframeValue;
        return (
          <Keyframe
            key={`${keyframe.x}_${keyframe.y}`}
            boneIndex={boneIndex}
            boneName={boneName}
            breakHandle={breakHandle}
            keyframeIndex={keyframeIndex}
            keyframeValue={keyframeValue}
            lockHandle={lockHandle}
            xyzType={xyzType}
          />
        );
      })}
    </g>
  );
};

export default KeyframeGroup;
