import React, { useEffect, useState, Fragment, FunctionComponent } from "react";
import { KeyframeValue } from "types/curveEditor";
import Scale from "Container/scale";
import Observer from "Container/observer";
import Left from "./left";
import Right from "./right";

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
        left: ({ cursorGap: { x, y }, breakHandle }) => {
          const leftX = invertScaleX(scaleX(data.handles.left.x) + x);
          const leftY = invertScaleY(scaleY(data.handles.left.y) + y);
          const rightX = invertScaleX(scaleX(data.handles.right.x) - x);
          const rightY = invertScaleY(scaleY(data.handles.right.y) - y);
          setLeftXY({
            ...{
              x: data.keyframe.x < leftX ? data.keyframe.x : leftX,
              y: leftY,
            },
          });
          if (breakHandle) {
            return [
              {
                x: data.keyframe.x < leftX ? data.keyframe.x : leftX,
                y: leftY,
                keyframeIndex: data.keyframe.keyframeIndex,
                boneIndex,
                handleType: "left",
              },
            ];
          } else {
            setRightXY({
              ...{
                x: rightX < data.keyframe.x ? data.keyframe.x : rightX,
                y: rightY,
              },
            });
            return [
              {
                x: data.keyframe.x < leftX ? data.keyframe.x : leftX,
                y: leftY,
                keyframeIndex: data.keyframe.keyframeIndex,
                boneIndex,
                handleType: "left",
              },
              {
                x: rightX < data.keyframe.x ? data.keyframe.x : rightX,
                y: rightY,
                keyframeIndex: data.keyframe.keyframeIndex,
                boneIndex,
                handleType: "right",
              },
            ];
          }
        },
        right: ({ breakHandle, cursorGap: { x, y } }) => {
          const rightX = invertScaleX(scaleX(data.handles.right.x) + x);
          const rightY = invertScaleY(scaleY(data.handles.right.y) + y);
          const leftX = invertScaleX(scaleX(data.handles.left.x) - x);
          const leftY = invertScaleY(scaleY(data.handles.left.y) - y);
          setRightXY({
            ...{
              x: rightX < data.keyframe.x ? data.keyframe.x : rightX,
              y: rightY,
            },
          });
          if (breakHandle) {
            return [
              {
                x: rightX < data.keyframe.x ? data.keyframe.x : rightX,
                y: rightY,
                keyframeIndex: data.keyframe.keyframeIndex,
                boneIndex,
                handleType: "right",
              },
            ];
          } else {
            setLeftXY({
              ...{
                x: data.keyframe.x < leftX ? data.keyframe.x : leftX,
                y: leftY,
              },
            });
            return [
              {
                x: data.keyframe.x < leftX ? data.keyframe.x : leftX,
                y: leftY,
                keyframeIndex: data.keyframe.keyframeIndex,
                boneIndex,
                handleType: "left",
              },
              {
                x: rightX < data.keyframe.x ? data.keyframe.x : rightX,
                y: rightY,
                keyframeIndex: data.keyframe.keyframeIndex,
                boneIndex,
                handleType: "right",
              },
            ];
          }
        },
        // test: ({ cursorGap, handleType }) => {
        //   const { x, y } = cursorGap;
        //   const invertLeftX = invertScaleX(
        //     scaleX(data.handles.left.x) + handleType === "left" ? x : -x
        //   );
        //   const leftY = invertScaleY(
        //     scaleY(data.handles.left.y) + handleType === "left" ? y : -y
        //   );
        //   const invertRightX = invertScaleX(
        //     scaleX(data.handles.right.x) + handleType === "left" ? -x : x
        //   );
        //   const rightY = invertScaleY(
        //     scaleY(data.handles.right.y) + handleType === "left" ? -y : y
        //   );
        //   const leftX =
        //     data.keyframe.x < invertLeftX ? data.keyframe.x : invertLeftX;
        //   const rightX =
        //     invertRightX < data.keyframe.x ? data.keyframe.x : invertRightX;
        //   if (handleType === "left") {
        //     return [
        //       {
        //         x: leftX,
        //         y: leftY,
        //         keyframeIndex: data.keyframe.keyframeIndex,
        //         boneIndex,
        //         handleType: "left",
        //       },
        //       {
        //         x: rightX,
        //         y: rightY,
        //         keyframeIndex: data.keyframe.keyframeIndex,
        //         boneIndex,
        //         handleType: "right",
        //       },
        //     ];
        //   }
        // },
      });
    }
  }, [boneIndex, data, updateBezierHandle]);

  return (
    <Fragment>
      <Left keyframeXY={data.keyframe} leftXY={leftXY} />
      <Right keyframeXY={data.keyframe} rightXY={rightXY} />
    </Fragment>
  );
};

export default BezierHandles;
