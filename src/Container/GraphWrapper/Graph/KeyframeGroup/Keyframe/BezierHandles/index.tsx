import React, { useEffect, useState, Fragment, FunctionComponent } from "react";
import { KeyframeValue } from "types/curveEditor";
import Scale from "Container/scale";
import Observer from "Container/observer";
import BezierHandleForm from "./BezierHandleForm";

interface Props {
  boneIndex: number;
  data: KeyframeValue;
  updateBezierHandle: number;
}

const BezierHandles: FunctionComponent<Props> = (props) => {
  const { boneIndex, data, updateBezierHandle } = props;
  const [leftXY, setLeftXY] = useState({ ...data.handles.left });
  const [rightXY, setRightXY] = useState({ ...data.handles.right });

  // 좌우 bezier handle 등록
  useEffect(() => {
    if (updateBezierHandle) {
      const scaleX = Scale.getScaleX();
      const scaleY = Scale.getScaleY();
      const invertScaleX = scaleX.invert;
      const invertScaleY = scaleY.invert;
      Observer.registerBezierHandle({
        call: (params) => {
          const { breakHandle, cursorGap, handleType, weightHandle } = params;
          const { handles, keyframe } = data;
          const gapValueX = handleType === "left" ? cursorGap.x : -cursorGap.x;
          const gapValueY = handleType === "left" ? cursorGap.y : -cursorGap.y;
          const leftX = invertScaleX(scaleX(handles.left.x) + gapValueX);
          const leftY = invertScaleY(scaleY(handles.left.y) + gapValueY);
          const rightX = invertScaleX(scaleX(handles.right.x) - gapValueX);
          const rightY = invertScaleY(scaleY(handles.right.y) - gapValueY);

          const clampLeftX = keyframe.x < leftX ? keyframe.x : leftX;
          const clampRightX = rightX < keyframe.x ? keyframe.x : rightX;
          const leftXY = { x: clampLeftX, y: leftY };
          const rightXY = { x: clampRightX, y: rightY };
          const leftObject = {
            ...leftXY,
            keyframeIndex: keyframe.keyframeIndex,
            boneIndex,
            handleType: "left" as "left" | "right",
          };
          const rightObject = {
            ...rightXY,
            keyframeIndex: keyframe.keyframeIndex,
            boneIndex,
            handleType: "right" as "left" | "right",
          };

          if (breakHandle) {
            handleType === "left" ? setLeftXY(leftXY) : setRightXY(rightXY);
            return [handleType === "left" ? leftObject : rightObject];
          } else {
            setLeftXY(leftXY);
            setRightXY(rightXY);
            return [leftObject, rightObject];
          }
        },
      });
    }
  }, [boneIndex, data, updateBezierHandle]);

  return (
    <Fragment>
      <BezierHandleForm
        handleType="left"
        handleXY={leftXY}
        keyframeXY={data.keyframe}
      />
      <BezierHandleForm
        handleType="right"
        handleXY={rightXY}
        keyframeXY={data.keyframe}
      />
    </Fragment>
  );
};

export default BezierHandles;
