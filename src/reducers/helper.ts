import { KeyframeValues, CurveEditorData } from "types/curveEditor";
import dummy from "../dummy.json";

const curveEditorDataHelper = (): CurveEditorData[] => {
  return dummy.baseLayer.slice(0, 1).map((data, lineIndex) => {
    const x: KeyframeValues[] = [];
    const y: KeyframeValues[] = [];
    const z: KeyframeValues[] = [];
    data.values.forEach((value, index) => {
      const remainder = index % 3;
      const quotient = (index / 3) | 0;
      const time = Math.round(data.times[quotient] * 30);
      const xyz = remainder === 0 ? x : remainder === 1 ? y : z;
      xyz.push({
        keyframe: { x: time, y: value, keyframeIndex: quotient },
        handles: {
          left: { x: time - 0.3, y: value },
          right: { x: time + 0.3, y: value },
        },
      });
    });
    const setBezierHandleY = (xyz: KeyframeValues[]) => {
      for (let index = 0; index < xyz.length - 1; index += 1) {
        const currentKeyframe = xyz[index].keyframe;
        const currentRightHandle = xyz[index].handles.right;
        const nextKeyframe = xyz[index + 1].keyframe;
        const nextLeftHandle = xyz[index + 1].handles.left;
        const slope =
          (nextKeyframe.y - currentKeyframe.y) /
          (nextKeyframe.x - currentKeyframe.x); // 두 키프레임의 기울기(a)
        const interceptY = currentKeyframe.y - slope * currentKeyframe.x; // 두 키프레임의 y절편(b)
        const newCurrentRightHandleY =
          slope * currentRightHandle.x + interceptY; // y = ax + b
        const newNextLeftHandleY = slope * nextLeftHandle.x + interceptY; // y = ax + b
        xyz[index].handles.right.y = newCurrentRightHandleY;
        xyz[index + 1].handles.left.y = newNextLeftHandleY;
      }
    };
    setBezierHandleY(x);
    setBezierHandleY(y);
    setBezierHandleY(z);
    return {
      interpolation: data.interpolation,
      isIncluded: data.isIncluded,
      trackName: data.name,
      x,
      y,
      z,
    };
  });
};

export default curveEditorDataHelper;
