import React, {
  useEffect,
  useMemo,
  useRef,
  Fragment,
  FunctionComponent,
} from "react";
import { useDispatch } from "react-redux";
import { useSelector } from "reducers";
import * as d3 from "d3";
import Scale from "Container/scale";
import Observer from "Container/observer";
import useDragCurveEditor from "Container/useDragCurveEditor";
import { Coordinates, KeyframeCoordinates } from "types/curveEditor";
import * as curveEditorAction from "actions/curveEditor";

interface Props {
  keyframeXY: KeyframeCoordinates;
  leftXY: Coordinates;
}

const Left: FunctionComponent<Props> = (props) => {
  const { keyframeXY, leftXY } = props;
  const dispatch = useDispatch();
  const leftLineRef = useRef<SVGPathElement>(null);
  const leftCircleRef = useRef<SVGCircleElement>(null);
  const breakHandle = useSelector((state) => state.curveEditor.breakHandle);

  // 좌측 handle line 드래그 시, 아무런 반응 없도록 처리
  useEffect(() => {
    const dragBehavior = d3.drag().on("start", null);
    d3.select(leftLineRef.current).call(dragBehavior as any);
  }, []);

  // 좌측 handle circle 이벤트
  useDragCurveEditor({
    onDragging: ({ cursorGap }) => {
      Observer.notifyBezierHandles({
        cursorGap,
        dragType: "dragging",
        handleType: "left",
        breakHandle,
      });
    },
    onDragEnd: ({ cursorGap }) => {
      const bezierHandles = Observer.notifyBezierHandles({
        cursorGap,
        dragType: "dragend",
        handleType: "left",
        breakHandle,
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

  const handlePosition = useMemo(() => {
    const scaleX = Scale.getScaleX();
    const scaleY = Scale.getScaleY();
    const keyframeX = scaleX(keyframeXY.x);
    const keyframeY = scaleY(keyframeXY.y);
    const leftX = scaleX(leftXY.x);
    const leftY = scaleY(leftXY.y);
    return {
      keyframeX,
      keyframeY,
      leftX,
      leftY,
      line: `M${leftX},${leftY} L${keyframeX},${keyframeY}`,
    };
  }, [keyframeXY, leftXY]);

  return (
    <Fragment>
      <path
        ref={leftLineRef}
        d={handlePosition.line}
        fill="none"
        stroke="white"
      />
      <circle
        ref={leftCircleRef}
        r={1}
        cx={handlePosition.leftX}
        cy={handlePosition.leftY}
      />
    </Fragment>
  );
};

export default Left;
