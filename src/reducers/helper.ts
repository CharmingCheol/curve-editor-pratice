import { KeyframeValue, CurveEditorData } from "types/curveEditor";
import dummy from "../dummy.json";

const curveEditorDataHelper = (): CurveEditorData[] => {
  return dummy.baseLayer.slice(0, 12).map((data) => {
    const x: KeyframeValue[] = [];
    const y: KeyframeValue[] = [];
    const z: KeyframeValue[] = [];
    data.values.forEach((value, index) => {
      const remainder = index % 3;
      const quotient = (index / 3) | 0;
      const time = Math.round(data.times[quotient] * 30);
      const xyz = remainder === 0 ? x : remainder === 1 ? y : z;
      xyz.push({
        keyframe: { x: time, y: value, keyframeIndex: quotient },
        handles: {
          left: { x: time - 1 / 3, y: value },
          right: { x: time + 1 / 3, y: value },
        },
      });
    });
    const setBezierHandleY = (xyz: KeyframeValue[]) => {
      for (let index = 1; index < xyz.length - 1; index += 1) {
        const { keyframe, handles } = xyz[index];
        const prevKeyframe = xyz[index - 1].keyframe;
        const nextKeyframe = xyz[index + 1].keyframe;
        const leftSlope =
          (prevKeyframe.y - keyframe.y) / (prevKeyframe.x - keyframe.x); // 이전 - 현재 키프레임의 기울기
        const rightSlope =
          (nextKeyframe.y - keyframe.y) / (nextKeyframe.x - keyframe.x); // 다음 - 현재 키프레임의 기울기
        const leftInterceptY = keyframe.y - leftSlope * keyframe.x; // 이전 - 현재 키프레임의 y절편
        const rightInterceptY = keyframe.y - rightSlope * keyframe.x; // 다음 - 현재 키프레임의 y절편
        const setNewHandleY = (x: number) => {
          const newSlope = (leftSlope + rightSlope) / 2;
          return newSlope * x + (leftInterceptY + rightInterceptY) / 2;
        };
        handles.left.y = setNewHandleY(handles.left.x);
        handles.right.y = setNewHandleY(handles.right.x);
      }
    };
    setBezierHandleY(x);
    setBezierHandleY(y);
    setBezierHandleY(z);
    return {
      interpolation: data.interpolation,
      isIncluded: data.isIncluded,
      boneName: data.name,
      x,
      y,
      z,
    };
  });
};

export default curveEditorDataHelper;
