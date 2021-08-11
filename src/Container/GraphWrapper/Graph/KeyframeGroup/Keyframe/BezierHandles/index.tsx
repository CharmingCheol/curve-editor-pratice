import React, { useEffect, useState, Fragment, FunctionComponent } from "react";
import { useSelector } from "reducers";
import {
  Coordinates,
  HandleType,
  KeyframeCoordinates,
} from "types/curveEditor";
import Scale from "Container/scale";
import Observer from "Container/observer";
import BezierHandleForm from "./BezierHandleForm";

interface Props {
  boneIndex: number;
  breakHandle: boolean;
  lockHandle: boolean;
  keyframeData: KeyframeCoordinates;
  handlesData: { left: Coordinates; right: Coordinates };
}

interface SetClampX {
  locked: boolean;
  handleType: HandleType;
  keyframeX: number;
  originHandleX: number;
  valueX: number;
}

const BezierHandles: FunctionComponent<Props> = (props) => {
  const { boneIndex, breakHandle, lockHandle, keyframeData, handlesData } =
    props;
  const [leftXY, setLeftXY] = useState({ ...handlesData.left });
  const [rightXY, setRightXY] = useState({ ...handlesData.right });
  const selectedKeyframes = useSelector(
    (state) => state.curveEditor.selectedKeyframes
  );

  const setClampX = (params: SetClampX) => {
    const { locked, originHandleX, keyframeX, valueX, handleType } = params;
    if (locked) return originHandleX;
    if (handleType === "left") return keyframeX < valueX ? keyframeX : valueX;
    return valueX < keyframeX ? keyframeX : valueX; // handleType === "right"
  };

  // 좌우 bezier handle 등록
  useEffect(() => {
    if (!selectedKeyframes) return;
    Observer.registerBezierHandle({
      breakHandle: breakHandle,
      lockHandle: lockHandle,
      call: (params) => {
        const scaleX = Scale.getScaleX();
        const scaleY = Scale.getScaleY();
        const invertScaleX = scaleX.invert;
        const invertScaleY = scaleY.invert;

        const { cursorGap, handleType } = params;
        const gapValueX = handleType === "left" ? cursorGap.x : -cursorGap.x;
        const gapValueY = handleType === "left" ? cursorGap.y : -cursorGap.y;
        const leftX = invertScaleX(scaleX(handlesData.left.x) + gapValueX);
        const leftY = invertScaleY(scaleY(handlesData.left.y) + gapValueY);
        const rightX = invertScaleX(scaleX(handlesData.right.x) - gapValueX);
        const rightY = invertScaleY(scaleY(handlesData.right.y) - gapValueY);

        const clampLeftX = setClampX({
          locked: lockHandle,
          originHandleX: handlesData.left.x,
          keyframeX: keyframeData.x,
          valueX: leftX,
          handleType: "left",
        });
        const clampRightX = setClampX({
          locked: lockHandle,
          originHandleX: handlesData.right.x,
          keyframeX: keyframeData.x,
          valueX: rightX,
          handleType: "right",
        });
        const leftXY = { x: clampLeftX, y: leftY };
        const rightXY = { x: clampRightX, y: rightY };
        const leftObject = {
          ...leftXY,
          keyframeIndex: keyframeData.keyframeIndex,
          boneIndex,
          handleType: "left" as HandleType,
        };
        const rightObject = {
          ...rightXY,
          keyframeIndex: keyframeData.keyframeIndex,
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
    handlesData,
    keyframeData,
    lockHandle,
    selectedKeyframes,
  ]);

  return (
    <Fragment>
      <BezierHandleForm
        handleType="left"
        handleXY={leftXY}
        keyframeXY={keyframeData}
      />
      <BezierHandleForm
        handleType="right"
        handleXY={rightXY}
        keyframeXY={keyframeData}
      />
    </Fragment>
  );
};

export default BezierHandles;
