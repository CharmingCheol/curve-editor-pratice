import React, {
  Fragment,
  FunctionComponent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useDispatch } from "react-redux";
import * as d3 from "d3";
import * as curveEditorAction from "actions/curveEditor";
import { KeyframeValue } from "types/curveEditor";
import useDragCurveEditor from "Container/useDragCurveEditor";
import Scale from "Container/scale";
import Observer from "Container/observer";

interface Props {
  boneIndex: number;
  data: KeyframeValue;
  updateBezierHandle: number;
}

const BezierHandles: FunctionComponent<Props> = (props) => {
  const { boneIndex, data, updateBezierHandle } = props;
  const dispatch = useDispatch();
  const leftLineRef = useRef<SVGPathElement>(null);
  const leftCircleRef = useRef<SVGCircleElement>(null);
  const rightLineRef = useRef<SVGPathElement>(null);
  const rightCircleRef = useRef<SVGCircleElement>(null);

  const [leftCircleXY, setLeftCircleXY] = useState(data.handles.left);
  const [rightCircleXY, setRightCircleXY] = useState(data.handles.right);

  // 좌측 handle circle 이벤트
  useDragCurveEditor({
    onDragging: ({ cursorGap }) => {
      Observer.notifyBezierHandles({
        cursorGap,
        dragType: "dragging",
        handleType: "left",
      });
    },
    onDragEnd: ({ cursorGap }) => {
      const bezierHandles = Observer.notifyBezierHandles({
        cursorGap,
        dragType: "dragend",
        handleType: "left",
      });
      if (bezierHandles) {
        dispatch(
          curveEditorAction.updateCurveEditorByBezierHandle({ bezierHandles })
        );
      }
    },
    ref: leftCircleRef,
    isClampX: false, // 커서 위치에 따라 handle의 x좌표를 조절
    throttleTime: 100,
  });

  // 우측 handle circle 이벤트
  useDragCurveEditor({
    onDragging: ({ cursorGap }) => {
      Observer.notifyBezierHandles({
        cursorGap,
        dragType: "dragging",
        handleType: "right",
      });
    },
    onDragEnd: ({ cursorGap }) => {
      const bezierHandles = Observer.notifyBezierHandles({
        cursorGap,
        dragType: "dragend",
        handleType: "right",
      });
      if (bezierHandles) {
        dispatch(
          curveEditorAction.updateCurveEditorByBezierHandle({ bezierHandles })
        );
      }
    },
    ref: rightCircleRef,
    isClampX: false, // 커서 위치에 따라 handle의 x좌표를 조절
    throttleTime: 100,
  });

  // 좌우 bezier handle 등록
  useEffect(() => {
    if (updateBezierHandle) {
      const scaleX = Scale.getScaleX();
      const scaleY = Scale.getScaleY();
      const invertScaleX = scaleX.invert;
      const invertScaleY = scaleY.invert;
      Observer.registerBezierHandle({
        left: ({ cursorGap: { x, y } }) => {
          const leftX = invertScaleX(scaleX(data.handles.left.x) + x);
          const leftY = invertScaleY(scaleY(data.handles.left.y) + y);
          const rightX = invertScaleX(scaleX(data.handles.right.x) - x);
          const rightY = invertScaleY(scaleY(data.handles.right.y) - y);
          setLeftCircleXY({
            ...{
              x: data.keyframe.x < leftX ? data.keyframe.x : leftX,
              y: leftY,
            },
          });
          setRightCircleXY({
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
        },
        right: ({ cursorGap: { x, y } }) => {
          const rightX = invertScaleX(scaleX(data.handles.right.x) + x);
          const rightY = invertScaleY(scaleY(data.handles.right.y) + y);
          const leftX = invertScaleX(scaleX(data.handles.left.x) - x);
          const leftY = invertScaleY(scaleY(data.handles.left.y) - y);
          setLeftCircleXY({
            ...{
              x: data.keyframe.x < leftX ? data.keyframe.x : leftX,
              y: leftY,
            },
          });
          setRightCircleXY({
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
        },
      });
    }
  }, [boneIndex, data, updateBezierHandle]);

  // 좌우측 handle line 드래그 시, 아무런 반응 없도록 처리
  useEffect(() => {
    const dragBehavior = d3.drag().on("start", null);
    d3.select(leftLineRef.current).call(dragBehavior as any);
    d3.select(rightLineRef.current).call(dragBehavior as any);
  }, []);

  const handlePosition = useMemo(() => {
    const scaleX = Scale.getScaleX();
    const scaleY = Scale.getScaleY();
    const circleX = scaleX(data.keyframe.x);
    const circleY = scaleY(data.keyframe.y);
    const leftX = scaleX(leftCircleXY.x);
    const leftY = scaleY(leftCircleXY.y);
    const rightX = scaleX(rightCircleXY.x);
    const rightY = scaleY(rightCircleXY.y);
    return {
      circleX,
      circleY,
      leftX,
      leftY,
      rightX,
      rightY,
      leftLine: `M${leftX},${leftY} L${circleX},${circleY}`,
      rightLine: `M${rightX},${rightY} L${circleX},${circleY}`,
    };
  }, [data, leftCircleXY, rightCircleXY]);

  return (
    <Fragment>
      <path
        ref={leftLineRef}
        d={handlePosition.leftLine}
        fill="none"
        stroke="white"
      />
      <circle
        ref={leftCircleRef}
        r={1}
        cx={handlePosition.leftX}
        cy={handlePosition.leftY}
      />
      <path
        ref={rightLineRef}
        d={handlePosition.rightLine}
        fill="none"
        stroke="white"
      />
      <circle
        ref={rightCircleRef}
        r={1}
        cx={handlePosition.rightX}
        cy={handlePosition.rightY}
      />
    </Fragment>
  );
};

export default BezierHandles;
