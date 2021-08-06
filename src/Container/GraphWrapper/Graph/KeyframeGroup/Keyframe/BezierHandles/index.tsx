import React, { useEffect, useState, Fragment, FunctionComponent } from "react";
import { useDispatch } from "react-redux";
import { HandleType, KeyframeValue } from "types/curveEditor";
import Scale from "Container/scale";
import Observer from "Container/observer";
import BezierHandleForm from "./BezierHandleForm";

interface Props {
  boneIndex: number;
  keyframeValue: KeyframeValue;
  updateBezierHandle: number;
  breakHandle: boolean;
  lockHandle: boolean;
}

interface SetClampX {
  locked: boolean;
  handleType: HandleType;
  keyframeX: number;
  originHandleX: number;
  valueX: number;
}

const BezierHandles: FunctionComponent<Props> = (props) => {
  const {
    boneIndex,
    keyframeValue,
    updateBezierHandle,
    breakHandle,
    lockHandle,
  } = props;
  const dispatch = useDispatch();
  const [leftXY, setLeftXY] = useState({ ...keyframeValue.handles.left });
  const [rightXY, setRightXY] = useState({ ...keyframeValue.handles.right });

  const setClampX = (params: SetClampX) => {
    const { locked, originHandleX, keyframeX, valueX, handleType } = params;
    if (locked) return originHandleX;
    if (handleType === "left") return keyframeX < valueX ? keyframeX : valueX;
    return valueX < keyframeX ? keyframeX : valueX; // handleType === "right"
  };

  // 좌우 bezier handle 등록
  useEffect(() => {
    Observer.registerBezierHandle({
      breakHandle: breakHandle,
      lockHandle: lockHandle,
      call: (params) => {
        const scaleX = Scale.getScaleX();
        const scaleY = Scale.getScaleY();
        const invertScaleX = scaleX.invert;
        const invertScaleY = scaleY.invert;

        const { cursorGap, handleType } = params;
        const { handles, keyframe } = keyframeValue;
        const gapValueX = handleType === "left" ? cursorGap.x : -cursorGap.x;
        const gapValueY = handleType === "left" ? cursorGap.y : -cursorGap.y;
        const leftX = invertScaleX(scaleX(handles.left.x) + gapValueX);
        const leftY = invertScaleY(scaleY(handles.left.y) + gapValueY);
        const rightX = invertScaleX(scaleX(handles.right.x) - gapValueX);
        const rightY = invertScaleY(scaleY(handles.right.y) - gapValueY);

        const clampLeftX = setClampX({
          locked: lockHandle,
          originHandleX: keyframeValue.handles.left.x,
          keyframeX: keyframe.x,
          valueX: leftX,
          handleType: "left",
        });
        const clampRightX = setClampX({
          locked: lockHandle,
          originHandleX: keyframeValue.handles.right.x,
          keyframeX: keyframe.x,
          valueX: rightX,
          handleType: "right",
        });
        const leftXY = { x: clampLeftX, y: leftY };
        const rightXY = { x: clampRightX, y: rightY };
        const leftObject = {
          ...leftXY,
          keyframeIndex: keyframe.keyframeIndex,
          boneIndex,
          handleType: "left" as HandleType,
        };
        const rightObject = {
          ...rightXY,
          keyframeIndex: keyframe.keyframeIndex,
          boneIndex,
          handleType: "right" as HandleType,
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
  }, [
    boneIndex,
    breakHandle,
    keyframeValue,
    updateBezierHandle,
    lockHandle,
    dispatch,
  ]);

  return (
    <Fragment>
      <BezierHandleForm
        handleType="left"
        handleXY={leftXY}
        keyframeXY={keyframeValue.keyframe}
      />
      <BezierHandleForm
        handleType="right"
        handleXY={rightXY}
        keyframeXY={keyframeValue.keyframe}
      />
    </Fragment>
  );
};

export default BezierHandles;
