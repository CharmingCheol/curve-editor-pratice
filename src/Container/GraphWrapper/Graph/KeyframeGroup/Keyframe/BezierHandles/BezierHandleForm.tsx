import React, {
  Fragment,
  FunctionComponent,
  useEffect,
  useMemo,
  useRef,
} from "react";
import { useDispatch } from "react-redux";
import { useSelector } from "reducers";
import * as d3 from "d3";
import * as curveEditorAction from "actions/curveEditor";
import useDragCurveEditor from "Container/useDragCurveEditor";
import Observer from "Container/observer";
import Scale from "Container/scale";
import { Coordinates, KeyframeCoordinates } from "types/curveEditor";

interface Props {
  handleType: "left" | "right";
  handleXY: Coordinates;
  keyframeXY: KeyframeCoordinates;
}

const BezierHandleForm: FunctionComponent<Props> = (props) => {
  const { handleType, handleXY, keyframeXY } = props;
  const dispatch = useDispatch();
  const lineRef = useRef<SVGPathElement>(null);
  const circleRef = useRef<SVGCircleElement>(null);
  const breakHandle = useSelector((state) => state.curveEditor.breakHandle);
  const weightHandle = useSelector((state) => state.curveEditor.weightHandle);

  // 좌측 handle line 드래그 시, 아무런 반응 없도록 처리
  useEffect(() => {
    const dragBehavior = d3.drag().on("start", null);
    d3.select(lineRef.current).call(dragBehavior as any);
  }, [lineRef]);

  // 우측 handle circle 이벤트
  useDragCurveEditor({
    onDragging: ({ cursorGap }) => {
      Observer.notifyBezierHandles({
        cursorGap,
        dragType: "dragging",
        handleType,
        breakHandle,
        weightHandle,
      });
    },
    onDragEnd: ({ cursorGap }) => {
      const bezierHandles = Observer.notifyBezierHandles({
        cursorGap,
        dragType: "dragend",
        handleType,
        breakHandle,
        weightHandle,
      });
      if (bezierHandles) {
        dispatch(
          curveEditorAction.updateCurveEditorByBezierHandle({ bezierHandles })
        );
      }
    },
    ref: circleRef,
    isClampX: false, // 커서 위치에 따라 handle의 x좌표를 조절
    throttleTime: 100,
  });

  const handlePosition = useMemo(() => {
    const scaleX = Scale.getScaleX();
    const scaleY = Scale.getScaleY();
    const keyframeX = scaleX(keyframeXY.x);
    const keyframeY = scaleY(keyframeXY.y);
    const handleX = scaleX(handleXY.x);
    const handleY = scaleY(handleXY.y);
    return {
      keyframeX,
      keyframeY,
      handleX,
      handleY,
      line: `M${handleX},${handleY} L${keyframeX},${keyframeY}`,
    };
  }, [handleXY, keyframeXY]);

  return (
    <Fragment>
      <path ref={lineRef} d={handlePosition.line} fill="none" stroke="white" />
      <circle
        ref={circleRef}
        r={1}
        cx={handlePosition.handleX}
        cy={handlePosition.handleY}
      />
    </Fragment>
  );
};

export default BezierHandleForm;
